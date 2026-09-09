import { PortalParser } from './types';
import { evernestParser } from './evernest';

export const parsers: PortalParser[] = [evernestParser];

export function getParserForUrl(url: string): PortalParser | null {
  return parsers.find(p => p.matchUrl(url)) ?? null;
}

export type { PortalListing } from './types';
