-- AHF Rwanda Student Q&A - database setup.
-- Run this whole file once in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.questions (
  id           uuid primary key default gen_random_uuid(),
  nickname     text not null,
  gender       text not null,
  avatar       text not null,
  question     text not null,
  status       text not null default 'Pending',
  answered_by  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint questions_nickname_chk check (char_length(btrim(nickname)) between 1 and 40),
  constraint questions_gender_chk   check (gender in ('Female', 'Male')),
  -- Avatar ids: f1-f6 for Female, m1-m6 for Male, and they must match the gender.
  constraint questions_avatar_chk   check (
    (gender = 'Female' and avatar ~ '^f[1-6]$') or
    (gender = 'Male'   and avatar ~ '^m[1-6]$')
  ),
  -- Generous sanity cap (5000 chars) only to stop abuse; far above any real question.
  constraint questions_question_chk check (char_length(btrim(question)) between 1 and 5000),
  constraint questions_status_chk   check (status in ('Pending', 'Answered')),
  constraint questions_answered_by_chk check (
    (status = 'Pending'  and answered_by is null) or
    (status = 'Answered' and answered_by in ('AHF', 'RBC', 'UNAIDS', 'Untracked'))
  )
);

create index if not exists questions_created_at_idx on public.questions (created_at desc);
create index if not exists questions_status_idx on public.questions (status);

-- Keep updated_at current.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

-- Row Level Security: ON, with NO policies for anon or authenticated roles.
-- That means the public (anon) key and any signed-in Supabase user can neither read nor write this table
-- directly. All access goes through the Next.js server (service-role key, which bypasses RLS), and the
-- server checks the admin allow-list before returning or changing anything.
alter table public.questions enable row level security;
alter table public.questions force row level security;

revoke all on public.questions from anon, authenticated;
grant all on public.questions to service_role;
