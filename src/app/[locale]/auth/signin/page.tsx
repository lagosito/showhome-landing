import { Suspense } from 'react';
import SignInForm from './SignInForm';

export default function SignInPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-5 py-20">
      <Suspense fallback={<p className="text-ink-3">Wird geladen…</p>}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
