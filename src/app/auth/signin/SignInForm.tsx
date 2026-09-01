'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/create/upload';
  const sb = createClient();

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirect);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicSent(true);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicSent(true);
    }
  }

  if (magicSent) {
    return (
      <div className="max-w-md text-center">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Check your email</h1>
        <p className="mt-4 text-[15px] text-ink-3">
          We sent a link to <strong>{email}</strong>. Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-center text-[28px] font-semibold tracking-[-0.03em]">Sign in to ShowHome</h1>
      <p className="mt-3 text-center text-[15px] text-ink-3">
        Or{' '}
        <button onClick={() => setMode(mode === 'password' ? 'magic' : 'password')} className="font-medium text-clay hover:underline">
          {mode === 'password' ? 'use a magic link' : 'use password'}
        </button>
      </p>

      <form onSubmit={mode === 'password' ? handlePasswordSignIn : handleMagicLink} className="mt-8 space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-ink-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
          />
        </div>
        {mode === 'password' && (
          <div>
            <label className="block text-[13px] font-medium text-ink-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
            />
          </div>
        )}
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition hover:-translate-y-0.5 hover:bg-[#1b1d20] disabled:opacity-50"
        >
          {loading ? 'Loading…' : mode === 'password' ? 'Sign in' : 'Send magic link'}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-3">
        Don&apos;t have an account?{' '}
        <button onClick={handleSignUp} className="font-medium text-clay hover:underline">
          Create one
        </button>
      </p>
    </div>
  );
}
