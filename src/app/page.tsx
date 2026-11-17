'use client';

import { useRef, useState } from 'react';
import { Avatar, AVATARS } from '@/lib/avatars';
import { Brand } from '@/components/Brand';
import type { Gender } from '@/lib/types';

type Errors = Partial<Record<'nickname' | 'gender' | 'avatar' | 'question', string>>;

export default function StudentPage() {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [avatar, setAvatar] = useState('');
  const [question, setQuestion] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: real users never fill this
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const lock = useRef(false); // blocks double-taps before state updates

  function chooseGender(g: Gender) {
    if (g !== gender) {
      setGender(g);
      setAvatar(''); // changing gender clears the avatar
    }
    setErrors((e) => ({ ...e, gender: undefined, avatar: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!nickname.trim()) e.nickname = 'Please enter a nickname.';
    if (!gender) e.gender = 'Please select your gender.';
    if (!avatar) e.avatar = gender ? 'Please choose an avatar.' : 'Select your gender first, then choose an avatar.';
    if (!question.trim()) e.question = 'Please type your question.';
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (lock.current) return;
    setServerError('');
    setSuccess(false);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    lock.current = true;
    setSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, gender, avatar, question, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setNickname('');
        setGender('');
        setAvatar('');
        setQuestion('');
        setErrors({});
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (json.errors) {
        setErrors(json.errors);
      } else {
        setServerError('Sorry, we could not submit your question right now. Please try again in a moment.');
      }
    } catch {
      setServerError('We could not reach the server. Please check your internet connection and try again.');
    } finally {
      setSubmitting(false);
      lock.current = false;
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-12 pt-5">
      <header className="mb-5">
        <Brand />
      </header>

      <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-ahf-red">Welcome!</h1>
        <p className="leading-relaxed text-ahf-charcoal">
          AIDS Healthcare Foundation (AHF) Rwanda works to provide people with access to HIV prevention, testing,
          treatment and care. Ask us your questions and let&apos;s have an open conversation.
        </p>
        <p className="mt-3 rounded-lg bg-ahf-cream px-3 py-2 text-sm font-medium text-ahf-charcoal">
          You do not need to provide your real name or contact details.
        </p>
      </section>

      {success && (
        <div role="status" className="mb-5 rounded-2xl border border-green-300 bg-green-50 p-4 font-medium text-green-900">
          Thank you! Your question has been submitted successfully.
        </div>
      )}
      {serverError && (
        <div role="alert" className="mb-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900">
          {serverError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-2xl bg-white p-5 shadow-sm">
        {/* Honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>

        <div>
          <label htmlFor="nickname" className="mb-1.5 block font-semibold">
            Nickname
          </label>
          <input
            id="nickname"
            className="field"
            value={nickname}
            maxLength={40}
            autoComplete="off"
            placeholder="Any name you like"
            onChange={(e) => {
              setNickname(e.target.value);
              setErrors((x) => ({ ...x, nickname: undefined }));
            }}
            aria-invalid={!!errors.nickname}
          />
          {errors.nickname && <p className="err">{errors.nickname}</p>}
        </div>

        <fieldset>
          <legend className="mb-1.5 font-semibold">Gender</legend>
          <div role="radiogroup" className="grid grid-cols-2 gap-3">
            {(['Female', 'Male'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={gender === g}
                onClick={() => chooseGender(g)}
                className={`rounded-xl border-2 px-4 py-3.5 text-base font-semibold transition ${
                  gender === g
                    ? 'border-ahf-red bg-ahf-red text-white'
                    : 'border-stone-300 bg-white text-ahf-charcoal hover:border-ahf-red'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && <p className="err">{errors.gender}</p>}
        </fieldset>

        {gender && (
          <fieldset>
            <legend className="mb-1.5 font-semibold">Choose your avatar</legend>
            <div role="radiogroup" className="grid grid-cols-3 gap-3">
              {AVATARS[gender].map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={avatar === id}
                  aria-label={`Avatar ${id}`}
                  onClick={() => {
                    setAvatar(id);
                    setErrors((x) => ({ ...x, avatar: undefined }));
                  }}
                  className={`flex items-center justify-center rounded-2xl border-2 p-2 transition ${
                    avatar === id ? 'border-ahf-red bg-ahf-red/10 ring-2 ring-ahf-red/30' : 'border-transparent bg-stone-50'
                  }`}
                >
                  <Avatar id={id} size={76} />
                </button>
              ))}
            </div>
            {errors.avatar && <p className="err">{errors.avatar}</p>}
          </fieldset>
        )}
        {!gender && errors.avatar && <p className="err -mt-3">{errors.avatar}</p>}

        <div>
          <label htmlFor="question" className="mb-1.5 block font-semibold">
            Your question
          </label>
          <textarea
            id="question"
            className="field min-h-[140px] resize-y"
            placeholder="ASK AHF RWANDA"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setErrors((x) => ({ ...x, question: undefined }));
            }}
            aria-invalid={!!errors.question}
          />
          {errors.question && <p className="err">{errors.question}</p>}
        </div>

        <button type="submit" className="btn-primary w-full text-base" disabled={submitting}>
          {submitting ? 'SUBMITTING…' : 'SUBMIT QUESTION'}
        </button>

        <p className="text-center text-xs leading-relaxed text-ahf-grey">
          Privacy: we collect your gender only for event reporting. We do not ask for your real name, phone number,
          email or location, and your question is not shown publicly. It is seen only by AHF Rwanda staff.
        </p>
      </form>
    </main>
  );
}
