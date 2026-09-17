'use client';

import { useTranslations } from 'next-intl';
import { ArrowIcon, Button, Container, Logo } from './primitives';

export function Footer() {
  const t = useTranslations('Footer');

  const nav = [
    { label: t('product'), href: '#product' },
    { label: t('howItWorks'), href: '#how' },
    { label: t('pricing'), href: '#pricing' },
    { label: t('forAgents'), href: '#agents' },
    { label: t('enterprise'), href: '#enterprise' },
  ];

  const legal = [t('privacy'), t('terms'), t('security'), t('imprint')];

  return (
    <footer className="border-t border-line bg-white">
      <Container>
        <div className="flex flex-col gap-10 py-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[14px] leading-relaxed text-ink-3">
              {t('description')}
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-7 gap-y-3 lg:justify-center"
            aria-label="Footer"
          >
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-[14.5px] font-medium text-ink-2 transition-colors hover:text-clay"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="shrink-0">
            <Button href="#cta" size="lg" icon={<ArrowIcon />}>
              {t('createVideo')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-ink-3">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <ul className="flex flex-wrap gap-6">
            {legal.map((l) => (
              <li key={l}>
                <a
                  href="#top"
                  className="text-[12.5px] text-ink-3 transition-colors hover:text-ink"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
