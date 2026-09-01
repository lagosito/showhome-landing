import { Suspense } from 'react';
import SignInForm from './SignInForm';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export default function SignInPage() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[60vh] items-center justify-center px-5 py-20">
        <Suspense fallback={<p className="text-ink-3">Loading…</p>}>
          <SignInForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
