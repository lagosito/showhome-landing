'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/utils/cn';
import { Button, Container, Logo } from './primitives';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useUser } from '@/hooks/useUser';

export function Nav() {
  const t = useTranslations('Nav');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, loading, signOut } = useUser();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const isLanding = pathname === '/';
  const light = isLanding && !scrolled;

  const displayName = user
    ? user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]
    : null;

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : '';

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
            <LanguageSwitcher />

            {!loading && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-[14.5px] font-medium transition',
                    light ? 'text-white/80 hover:text-white' : 'text-ink-2 hover:text-ink',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold',
                      light
                        ? 'bg-white/20 text-white'
                        : 'bg-ink/10 text-ink',
                    )}
                  >
                    {initials}
                  </span>
                  <span className="hidden max-w-[140px] truncate lg:inline">{displayName}</span>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      menuOpen && 'rotate-180',
                    )}
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div
                    className={cn(
                      'absolute right-0 top-full mt-2 w-56 rounded-xl border py-1.5 shadow-xl',
                      light
                        ? 'border-white/15 bg-paper/95 backdrop-blur-xl'
                        : 'border-line bg-paper shadow-lg',
                    )}
                  >
                    <div className="px-4 py-2">
                      <p className="text-[12px] font-medium text-ink-3 truncate">{user.email}</p>
                    </div>
                    <div className="mx-2 border-t border-line/60" />
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 text-[14px] transition-colors',
                        'text-ink-2 hover:text-ink hover:bg-ink/5',
                      )}
                    >
                      {t('myAccount')}
                    </Link>
                    <Link
                      href="/account#videos"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 text-[14px] transition-colors',
                        'text-ink-2 hover:text-ink hover:bg-ink/5',
                      )}
                    >
                      {t('myVideos')}
                    </Link>
                    <div className="mx-2 border-t border-line/60" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className={cn(
                        'block w-full px-4 py-2.5 text-left text-[14px] transition-colors',
                        'text-ink-2 hover:text-ink hover:bg-ink/5',
                      )}
                    >
                      {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : !loading ? (
              <Link
                href="/auth/signin"
                className={cn(
                  'rounded-full px-4 py-2 text-[14.5px] font-medium transition',
                  light ? 'text-white/80 hover:text-white' : 'text-ink-2 hover:text-ink',
                )}
              >
                {t('login')}
              </Link>
            ) : null}

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
            <div className="py-3">
              <LanguageSwitcher />
            </div>

            {!loading && user ? (
              <>
                <div className="flex items-center gap-3 border-b border-line/70 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 text-[13px] font-semibold text-ink">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-ink truncate">{displayName}</p>
                    <p className="text-[12px] text-ink-3 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="border-b border-line/70 py-3 text-[15px] font-medium text-ink-2"
                >
                  {t('myAccount')}
                </Link>
                <Link
                  href="/account#videos"
                  onClick={() => setOpen(false)}
                  className="border-b border-line/70 py-3 text-[15px] font-medium text-ink-2"
                >
                  {t('myVideos')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="border-b border-line/70 py-3 text-left text-[15px] font-medium text-ink-2"
                >
                  {t('signOut')}
                </button>
              </>
            ) : !loading ? (
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="border-b border-line/70 py-3 text-[15px] font-medium text-ink-2"
              >
                {t('login')}
              </Link>
            ) : null}

            <Button href="/create/upload" className="mt-4 mb-4 w-full py-3">
              {t('createVideo')}
            </Button>
          </nav>
        </Container>
      </div>
    </header>
  );
}
