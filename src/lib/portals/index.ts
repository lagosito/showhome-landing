import { PortalParser } from './types';
import { evernestParser } from './evernest';
import { genericParser } from './generic';

// Order matters: `getParserForUrl` returns the FIRST match, so site-specific
// parsers must come before the generic fallback (which matches any http/https URL).
export const parsers: PortalParser[] = [evernestParser, genericParser];

export function getParserForUrl(url: string): PortalParser | null {
  return parsers.find(p => p.matchUrl(url)) ?? null;
}

export type { PortalListing } from './types';
