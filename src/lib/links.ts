// Shared destination helpers for CTAs and legal links.
// Routes are locale-prefixed (next-intl) and differ per language for the legal
// pages: /de/impressum · /de/datenschutz · /de/agb — /en/imprint · /en/privacy · /en/terms.

export function uploadHref(locale: string): string {
  return `/${locale}/create/upload`;
}

/** Enterprise CTA — the mailbox address is filled in by hand (beta site has no sales inbox yet). */
export function enterpriseMailto(locale: string): string {
  return locale === 'en'
    ? 'mailto:[EMAIL]?subject=Homemotion%20Enterprise%20Inquiry'
    : 'mailto:[EMAIL]?subject=Homemotion%20Enterprise%20Anfrage';
}

export function legalHrefs(locale: string): {
  privacy: string;
  terms: string;
  imprint: string;
} {
  return locale === 'en'
    ? { privacy: '/en/privacy', terms: '/en/terms', imprint: '/en/imprint' }
    : { privacy: '/de/datenschutz', terms: '/de/agb', imprint: '/de/impressum' };
}
