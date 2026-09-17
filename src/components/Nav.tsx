'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/utils/cn';
import { Button, Container, Logo } from './primitives';

export function Nav() {
  const t = useTranslations('Nav');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { label: t('product'), href: '/#product' },
    { label: t('howItWorks'), href: '/#how' },
    { label: t('pricing'), href: '/#pricing' },
    { label: t('forAgents'), href: '/#agents' },
    { label: t('enterprise'), href: '/#enterprise' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLanding = pathname === '/';
  const light = isLanding && !scrolled;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        light
          ? 'border-b border-white/10 bg-transparent'
          : 'border-b border-line/80 bg-paper/85 backdrop-blur-xl',
      )}
    >
      <Container>
        <div className="flex h-[68px] items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label={t('homeLabel')}>
            <Logo tone={light ? 'light' : 'dark'} />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label={t('mainNav')}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative text-[14.5px] font-medium tracking-[-0.01em] transition-colors',
                  light
                    ? 'text-white/80 hover:text-white'
                    : 'text-ink-2 hover:text-ink',
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/auth/signin"
              className={cn(
                'rounded-full px-4 py-2 text-[14.5px] font-medium transition',
                light ? 'text-white/80 hover:text-white' : 'text-ink-2 hover:text-ink',
              )}
            >
              {t('login')}
            </Link>
            <Button href="/create/upload" variant={light ? 'secondary' : 'primary'} className={light ? '!bg-white/15 !text-white hover:!bg-white/25' : ''}>
              {t('createVideo')}
            </Button>
          </div>

          <button
            type="button"
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full border md:hidden',
              light
                ? 'border-white/20 bg-white/10'
                : 'border-line-2 bg-white/60',
            )}
            aria-label={open ? t('menuClose') : t('menuOpen')}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-[10px] w-[18px]">
              <span
                className={cn(
                  'absolute left-0 h-[1.6px] w-full transition-all duration-300',
                  light ? 'bg-white' : 'bg-ink',
                  open ? 'top-1/2 rotate-45' : 'top-0',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 h-[1.6px] w-full transition-all duration-300',
                  light ? 'bg-white' : 'bg-ink',
                  open ? 'top-1/2 -rotate-45' : 'top-full',
                )}
              />
            </span>
          </button>
        </div>
      </Container>

      <div
        className={cn(
          'overflow-hidden border-t bg-paper/95 backdrop-blur-xl transition-[max-height,opacity] duration-400 md:hidden',
          light ? 'border-white/10' : 'border-line',
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
              {t('login')}
            </Link>
            <Button href="/create/upload" className="mt-4 mb-4 w-full py-3">
              {t('createVideo')}
            </Button>
          </nav>
        </Container>
      </div>
    </header>
  );
}
