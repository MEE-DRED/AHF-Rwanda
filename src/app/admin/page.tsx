'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/lib/avatars';
import { Brand } from '@/components/Brand';
import { browserClient } from '@/lib/supabase/browser';
import { RESPONDENTS, type Question, type Respondent } from '@/lib/types';

const fmt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kigali' });

type Tab = 'Pending' | 'Answered' | 'All';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="text-3xl font-bold text-ahf-red">{value}</div>
      <div className="text-sm text-ahf-grey">{label}</div>
    </div>
  );
}

function Card({ q, onSaved }: { q: Question; onSaved: (q: Question) => void }) {
  const [open, setOpen] = useState(false);
  const [who, setWho] = useState<string>(q.answered_by ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function save(status: 'Pending' | 'Answered') {
    setBusy(true);
    setErr('');
    try {
      const res = await fetch(`/api/admin/questions/${q.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, answered_by: status === 'Answered' ? who || 'Untracked' : null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save.');
      onSaved(json.question);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  const answered = q.status === 'Answered';
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar id={q.avatar} size={48} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{q.nickname}</span>
            <span className="text-sm text-ahf-grey">{q.gender}</span>
            <span className="text-sm text-ahf-grey">· {fmt.format(new Date(q.created_at))}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${answered ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {answered ? 'ANSWERED' : 'PENDING'}
            </span>
            {answered && <span className="text-xs text-ahf-grey">Answered by: <b className="text-ahf-charcoal">{q.answered_by}</b></span>}
          </div>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed">{q.question}</p>

      <div className="mt-3">
        {!open ? (
          <button className="btn-secondary" onClick={() => { setWho(q.answered_by === 'Untracked' ? '' : q.answered_by ?? ''); setOpen(true); }}>
            {answered ? 'Edit' : 'Mark as answered'}
          </button>
        ) : (
          <div className="space-y-3 rounded-xl bg-ahf-cream p-3">
            <label className="block text-sm font-semibold" htmlFor={`who-${q.id}`}>Answered by</label>
            <select id={`who-${q.id}`} className="field" value={who} onChange={(e) => setWho(e.target.value)}>
              <option value="">Not recorded (saved as Untracked)</option>
              {RESPONDENTS.filter((r) => r !== 'Untracked').map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {err && <p className="err">{err}</p>}
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary !px-4 !py-2 text-sm" disabled={busy} onClick={() => save('Answered')}>
                {busy ? 'Saving…' : 'Save as answered'}
              </button>
              {answered && (
                <button className="btn-secondary" disabled={busy} onClick={() => save('Pending')}>Move back to Pending</button>
              )}
              <button className="btn-secondary" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('Pending');
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [respondent, setRespondent] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/questions', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setQuestions(json.questions);
      setError('');
    } catch {
      setError('Could not load questions. Check your connection and press Refresh.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // pick up new student submissions automatically
    return () => clearInterval(t);
  }, [load]);

  const pending = questions.filter((q) => q.status === 'Pending').length;
  const answered = questions.length - pending;

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    return questions.filter(
      (q) =>
        (tab === 'All' || q.status === tab) &&
        (!gender || q.gender === gender) &&
        (!respondent || q.answered_by === respondent) &&
        (!s || q.nickname.toLowerCase().includes(s) || q.question.toLowerCase().includes(s))
    );
  }, [questions, tab, search, gender, respondent]);

  async function signOut() {
    await browserClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-5">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Brand suffix="Admin dashboard" />
        <div className="flex gap-2">
          <a className="btn-primary !px-4 !py-2 text-sm" href="/api/admin/export">Export to Excel</a>
          <button className="btn-secondary" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Total questions" value={questions.length} />
        <Stat label="Pending" value={pending} />
        <Stat label="Answered" value={answered} />
      </section>

      <section className="mb-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex gap-2" role="tablist">
          {(['Pending', 'Answered', 'All'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === t ? 'bg-ahf-red text-white' : 'bg-stone-100 text-ahf-charcoal'}`}
            >
              {t === 'Pending' ? `Pending (${pending})` : t === 'Answered' ? `Answered (${answered})` : `All (${questions.length})`}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="field" type="search" placeholder="Search nickname or question" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="field" value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Filter by gender">
            <option value="">All genders</option>
            <option>Female</option>
            <option>Male</option>
          </select>
          <select className="field" value={respondent} onChange={(e) => setRespondent(e.target.value)} aria-label="Filter by respondent">
            <option value="">All respondents</option>
            {RESPONDENTS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between text-sm text-ahf-grey">
          <span>Showing {visible.length} of {questions.length}</span>
          <button className="font-semibold text-ahf-red" onClick={load}>Refresh</button>
        </div>
      </section>

      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-900">{error}</p>}

      <section className="space-y-3">
        {loading ? (
          <p className="py-10 text-center text-ahf-grey">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-ahf-grey">No questions match.</p>
        ) : (
          visible.map((q) => (
            <Card key={q.id} q={q} onSaved={(u) => setQuestions((all) => all.map((x) => (x.id === u.id ? u : x)))} />
          ))
        )}
      </section>
    </main>
  );
}
