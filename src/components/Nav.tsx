'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { Button, Container, Logo } from './primitives';

const links = [
  { label: 'Product', href: '/#product' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'For Agents', href: '/#agents' },
  { label: 'Enterprise', href: '/#enterprise' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLanding = pathname === '/';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b border-line/80 bg-paper/85 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <Container>
        <div className="flex h-[68px] items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label="ShowHome home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative text-[14.5px] font-medium tracking-[-0.01em] text-ink-2 transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/auth/signin"
              className="rounded-full px-4 py-2 text-[14.5px] font-medium text-ink-2 transition hover:text-ink"
            >
              Sign in
            </Link>
            <Button href="/create/upload">Create a video</Button>
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-white/60 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-[10px] w-[18px]">
              <span
                className={cn(
                  'absolute left-0 h-[1.6px] w-full bg-ink transition-all duration-300',
                  open ? 'top-1/2 rotate-45' : 'top-0',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 h-[1.6px] w-full bg-ink transition-all duration-300',
                  open ? 'top-1/2 -rotate-45' : 'top-full',
                )}
              />
            </span>
          </button>
        </div>
      </Container>

      <div
        className={cn(
          'overflow-hidden border-t border-line bg-paper/95 backdrop-blur-xl transition-[max-height,opacity] duration-400 md:hidden',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <Container>
          <nav className="flex flex-col py-3" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/70 py-3 text-[15px] font-medium text-ink-2"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/auth/signin"
              onClick={() => setOpen(false)}
              className="border-b border-line/70 py-3 text-[15px] font-medium text-ink-2"
            >
              Sign in
            </Link>
            <Button href="/create/upload" className="mt-4 mb-4 w-full py-3">
              Create a video
            </Button>
          </nav>
        </Container>
      </div>
    </header>
  );
}
