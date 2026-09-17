'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = locale === 'de' ? 'en' : 'de';

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:border-ink-2 hover:text-ink"
      aria-label={`Switch to ${otherLocale === 'de' ? 'Deutsch' : 'English'}`}
    >
      <span className={locale === 'de' ? 'font-semibold text-ink' : 'text-ink-3'}>DE</span>
      <span className="text-ink-3">/</span>
      <span className={locale === 'en' ? 'font-semibold text-ink' : 'text-ink-3'}>EN</span>
    </button>
  );
}
