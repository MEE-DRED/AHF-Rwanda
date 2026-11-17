'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browser';
import { Brand } from '@/components/Brand';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    params.get('error') === 'unauthorized' ? 'This account is not authorised for the admin dashboard.' : ''
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await browserClient().auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setError('Incorrect email or password.');
      setBusy(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="email" className="mb-1.5 block font-semibold">Email</label>
        <input id="email" type="email" className="field" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block font-semibold">Password</label>
        <input id="password" type="password" className="field" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p role="alert" className="err">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-10">
      <div className="mb-6"><Brand suffix="Admin dashboard" /></div>
      <Suspense fallback={null}><LoginForm /></Suspense>
    </main>
  );
}
