'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

/** Version of the Terms / Privacy texts the user accepts at sign-up. Bump when
 *  the legal texts change — it is stored with the consent record. */
const TERMS_VERSION = '2026-10-06';

/** Auth errors arrive in English from GoTrue ("email rate limit exceeded",
 *  "Invalid login credentials", …). Testers should never see those raw. */
function authError(message?: string): string {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-Mail oder Passwort stimmt nicht.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Zu viele Versuche in kurzer Zeit. Bitte versuche es in einer Stunde erneut.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Es gibt bereits ein Konto mit dieser E-Mail. Melde dich einfach an.';
  if (m.includes('password') && m.includes('at least'))
    return 'Das Passwort braucht mindestens 6 Zeichen.';
  if (m.includes('valid email')) return 'Bitte gib eine gültige E-Mail-Adresse ein.';
  if (!message) return 'Anmeldung fehlgeschlagen. Bitte prüfe deine Angaben.';
  return 'Anmeldung fehlgeschlagen. Bitte prüfe deine Angaben und versuche es erneut.';
}

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const isEn = locale === 'en';
  const termsHref = isEn ? '/en/terms' : '/de/agb';
  const privacyHref = isEn ? '/en/privacy' : '/de/datenschutz';
  const termsError = isEn
    ? 'Please accept the Terms and read the Privacy Policy.'
    : 'Bitte akzeptiere die AGB und lies die Datenschutzerklärung.';
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/create/upload';
  const sb = createClient();

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setError(authError(error.message));
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
      setError(authError(error.message));
      setLoading(false);
    } else {
      setMagicSent(true);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!termsAccepted) {
      setError(termsError);
      return;
    }
    setLoading(true);
    setError('');
    const acceptedAt = new Date().toISOString();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        data: {
          terms_version: TERMS_VERSION,
          privacy_version: TERMS_VERSION,
          terms_accepted_at: acceptedAt,
          terms_locale: locale,
        },
      },
    });
    if (error) {
      setError(authError(error.message));
      setLoading(false);
    } else if (data.session && data.user) {
      // Consent record next to the account (timestamp + text version). The
      // metadata written above stays as a fallback if this insert is refused.
      await sb
        .from('user_consents')
        .upsert(
          {
            user_id: data.user.id,
            terms_version: TERMS_VERSION,
            privacy_version: TERMS_VERSION,
            terms_accepted_at: acceptedAt,
            locale,
            source: window.location.pathname,
          },
          { onConflict: 'user_id', ignoreDuplicates: true },
        );
      // mailer_autoconfirm is on: the account exists right now, so go straight
      // into the flow instead of telling people to check a mailbox that will
      // never receive anything.
      router.push(redirect);
    } else {
      // Confirmation email required (only happens if autoconfirm is off).
      setMagicSent(true);
    }
  }

  if (magicSent) {
    return (
      <div className="max-w-md text-center">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Prüfe dein Postfach</h1>
        <p className="mt-4 text-[15px] text-ink-3">
          Wir haben einen Link an <strong>{email}</strong> gesendet. Klicke darauf, um dich anzumelden.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-center text-[28px] font-semibold tracking-[-0.03em]">Bei Homemotion anmelden</h1>
      <p className="mt-3 text-center text-[15px] text-ink-3">
        Oder{' '}
        <button onClick={() => setMode(mode === 'password' ? 'magic' : 'password')} className="font-medium text-clay hover:underline">
          {mode === 'password' ? 'Magic Link verwenden' : 'Passwort verwenden'}
        </button>
      </p>

      <form onSubmit={mode === 'password' ? handlePasswordSignIn : handleMagicLink} className="mt-8 space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-ink-2">E-Mail</label>
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
            <label className="block text-[13px] font-medium text-ink-2">Passwort</label>
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
          {loading ? 'Wird geladen…' : mode === 'password' ? 'Anmelden' : 'Magic Link senden'}
        </button>
      </form>

      <div className="mt-6 flex items-start gap-3">
        <input
          id="terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-ink"
        />
        <label htmlFor="terms" className="cursor-pointer text-[13px] leading-relaxed text-ink-3">
          {isEn ? (
            <>
              I accept the{' '}
              <a href={termsHref} className="text-clay underline hover:text-ink">
                Terms
              </a>{' '}
              and have read the{' '}
              <a href={privacyHref} className="text-clay underline hover:text-ink">
                Privacy Policy
              </a>
              .
            </>
          ) : (
            <>
              Ich akzeptiere die{' '}
              <a href={termsHref} className="text-clay underline hover:text-ink">
                AGB
              </a>{' '}
              und habe die{' '}
              <a href={privacyHref} className="text-clay underline hover:text-ink">
                Datenschutzerklärung
              </a>{' '}
              gelesen.
            </>
          )}
        </label>
      </div>

      <p className="mt-5 text-center text-[13px] text-ink-3">
        Noch kein Konto?{' '}
        <button onClick={handleSignUp} className="font-medium text-clay hover:underline">
          Jetzt erstellen
        </button>
      </p>
    </div>
  );
}
