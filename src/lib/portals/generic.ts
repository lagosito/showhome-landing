import { PortalParser, PortalListing } from './types';
import { ROOM_MAP } from './rooms';

// Generic fallback parser: works for any real-estate listing URL.
// Strategy (in priority order):
//   1. JSON-LD (schema.org RealEstateListing / Residence / Apartment …)
//   2. OpenGraph / Twitter meta tags
//   3. <img> tags in the page body (header/footer/nav stripped, filtered)
// Structured sources are always preferred; the raw DOM scan only kicks in when
// the structured sources yield fewer than MIN_STRUCTURED photos, because DOM
// images are noisy (logos, agent portraits, related listings).

const MIN_STRUCTURED = 3;
const MAX_PHOTOS = 25;

const IMG_EXT = /\.(jpe?g|png|webp|avif|gif)(\?|#|$)/i;

// URLs that are never listing photos.
const SKIP_URL: RegExp[] = [
  /logo/i,
  /favicon/i,
  /sprite/i,
  /avatar|gravatar/i,
  /badge/i,
  /placeholder|blank|transparent/i,
  /spinner|loader|loading/i,
  /pixel|tracking|analytics|doubleclick/i,
  /\.svg(\?|#|$)/i,
  /^data:/i,
  /\/maps?\//i,
  /google\.com\/maps/i,
];

// Alt texts that are never listing photos.
const SKIP_ALT: RegExp[] = [
  /logo/i,
  /icon/i,
  /sprite/i,
  /avatar/i,
  /^menu$/i,
  /^close$/i,
  /cookie/i,
  /zurück|back/i,
];

const FLOOR_PLAN: RegExp = /grundriss|floor[\s_-]?plan|blueprint|raumaufteilung|spielplan/i;

const LISTING_TYPES = [
  'realestatelisting',
  'residence',
  'apartment',
  'singlefamilyresidence',
  'house',
  'room',
  'accommodation',
  'offer',
];

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&');
}

/** All <meta> tags as a property/name → content map. */
function metaMap(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  const tagRe = /<meta\b[^>]*>/gi;
  let t: RegExpExecArray | null;
  while ((t = tagRe.exec(html)) !== null) {
    const attrs: Record<string, string> = {};
    const attrRe = /([a-zA-Z:_-]+)\s*=\s*"([^"]*)"|([a-zA-Z:_-]+)\s*=\s*'([^']*)'/g;
    let a: RegExpExecArray | null;
    while ((a = attrRe.exec(t[0])) !== null) {
      const key = (a[1] ?? a[3])?.toLowerCase();
      const val = a[2] ?? a[4] ?? '';
      if (key) attrs[key] = decodeEntities(val);
    }
    const key = attrs.property || attrs.name;
    if (key && attrs.content && !(key in out)) out[key] = attrs.content;
  }
  return out;
}

function firstJsonLdObjects(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1].trim()));
    } catch {
      // Some sites ship multiple JSON objects or trailing commas — skip quietly.
    }
  }
  return out;
}

/** Flatten @graph / arrays into a flat node list. */
function flattenNodes(value: unknown, acc: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const v of value) flattenNodes(v, acc);
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    acc.push(obj);
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') flattenNodes(v, acc);
    }
  }
  return acc;
}

function typeNames(node: Record<string, unknown>): string[] {
  const t = node['@type'];
  if (Array.isArray(t)) return t.map(String);
  if (typeof t === 'string') return [t];
  return [];
}

function isListingNode(node: Record<string, unknown>): boolean {
  const types = typeNames(node).map(t => t.toLowerCase().replace(/^schema:/, ''));
  if (types.some(t => LISTING_TYPES.includes(t))) return true;
  // Fallback: node that carries listing-ish data.
  return (
    ('image' in node || 'photo' in node) &&
    ('name' in node || 'description' in node || 'address' in node)
  );
}

/** Pull image URLs out of any JSON value under the given keys. */
function collectImages(value: unknown, acc: string[] = []): string[] {
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) acc.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectImages(v, acc);
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of ['url', 'contentUrl', '@id']) {
      const v = obj[key];
      if (typeof v === 'string' && /^https?:\/\//i.test(v)) acc.push(v);
    }
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') collectImages(v, acc);
    }
  }
  return acc;
}

function imagesFromJsonLd(nodes: Record<string, unknown>[]): { url: string; alt: string }[] {
  const out: { url: string; alt: string }[] = [];
  const seen = new Set<string>();

  const add = (urls: string[], alt: string) => {
    for (const url of urls) {
      const key = url.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ url, alt });
    }
  };

  // Standalone gallery declarations (e.g. kleinanzeigen ships one ImageObject per
  // photo). Only trust them as a group — a lone ImageObject is usually a site logo.
  const imageObjects = nodes.filter(n =>
    typeNames(n).some(t => t.toLowerCase().endsWith('imageobject'))
  );
  if (imageObjects.length >= 3) {
    for (const node of imageObjects) {
      const alt = firstString(node, ['caption', 'description', 'name']);
      add(collectImages(node['contentUrl'] ?? node['url'] ?? node, []), alt);
    }
  }

  for (const node of nodes) {
    if (!isListingNode(node)) continue;
    for (const key of ['image', 'photo', 'thumbnailUrl']) {
      if (key in node) add(collectImages(node[key], []), '');
    }
  }
  return out;
}

function firstString(node: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = node[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function deepString(node: Record<string, unknown>, keys: string[]): string {
  const direct = firstString(node, keys);
  if (direct) return direct;
  for (const k of keys) {
    const v = node[k];
    if (v && typeof v === 'object') {
      const found = flattenNodes(v).map(o => firstString(o, ['value', 'name', 'text', 'formatted']));
      const hit = found.find(Boolean);
      if (hit) return hit;
    }
  }
  return '';
}

/** Normalise an <img>/<source> URL to an absolute http(s) URL. */
function absolutize(raw: string, baseUrl?: string): string {
  const clean = decodeEntities(raw.trim().split(/\s+/)[0]);
  if (!clean || /^data:/i.test(clean)) return '';
  try {
    return new URL(clean, baseUrl).toString();
  } catch {
    return /^https?:\/\//i.test(clean) ? clean : '';
  }
}

function firstFromSrcset(srcset: string, baseUrl?: string): string {
  const first = srcset.split(',')[0]?.trim().split(/\s+/)[0];
  return first ? absolutize(first, baseUrl) : '';
}

/**
 * Dedupe key. Size variants of the same photo must collapse, but some portals
 * identify each image by a long query token (`?token=…&type=l`) where stripping
 * the query would collapse the whole gallery into one entry.
 */
function photoKey(url: string): string {
  const qIdx = url.indexOf('?');
  const query = qIdx === -1 ? '' : url.slice(qIdx + 1);
  // Long query = the query IS the image identity (token CDNs) — keep it.
  if (query.length > 40) return url.toLowerCase();
  const path = url.split('?')[0];
  // filename size suffixes: _widthX768_heightXegal_, -800x600, _1200px
  const cleaned = path
    .replace(/(widthx\d+|heightx[\w-]+|[_-]\d{2,4}x\d{2,4}|[_-]\d{3,4}px)/gi, '')
    .toLowerCase();
  // Same filename in a different folder (e.g. `/immobilien/…` vs `/de/immobilien/…`)
  // is the same photo — key on the filename when it is distinctive enough.
  const base = cleaned.slice(cleaned.lastIndexOf('/') + 1);
  return base.length >= 12 ? base : cleaned;
}

function isPhotoUrl(url: string, alt: string): boolean {
  if (!url) return false;
  // A bare directory URL (e.g. a logo with `src=""` resolving to the page) is not an image.
  if (url.split('?')[0].endsWith('/')) return false;
  if (FLOOR_PLAN.test(url) || FLOOR_PLAN.test(alt)) return false;
  if (SKIP_URL.some(re => re.test(url))) return false;
  if (SKIP_ALT.some(re => re.test(alt))) return false;
  // Structured CDNs often omit extensions — allow those, but skip obvious non-images.
  if (IMG_EXT.test(url)) return true;
  return !/\.(css|js|woff2?|mp4|webm|pdf)(\?|#|$)/i.test(url);
}

/** Strip header/footer/nav/aside/script/style so only listing content is scanned. */
function bodyOnly(html: string): string {
  return html
    .replace(/<(header|footer|nav|aside|script|style|form)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

interface AnchorRange {
  start: number;
  end: number;
  hrefPath: string;
}

/** Anchors whose href points at a DIFFERENT page are cards/nav, not this gallery. */
function crossPageAnchors(html: string, baseUrl?: string): AnchorRange[] {
  const ranges: AnchorRange[] = [];
  const openRe = /<a\b([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(html)) !== null) {
    const href = m[1].match(/href\s*=\s*"([^"]*)"/i)?.[1] ?? m[1].match(/href\s*=\s*'([^']*)'/i)?.[1] ?? '';
    if (!href || href.startsWith('#')) continue;
    let hrefPath = href;
    try {
      hrefPath = new URL(href, baseUrl).pathname;
    } catch {
      /* keep raw */
    }
    const close = html.indexOf('</a>', m.index);
    ranges.push({ start: m.index, end: close === -1 ? html.length : close, hrefPath });
  }
  return ranges;
}

function domImages(html: string, baseUrl?: string): { url: string; alt: string }[] {
  const out: { url: string; alt: string }[] = [];
  const seen = new Set<string>();
  const anchors = crossPageAnchors(html, baseUrl);
  const ownPath = (() => {
    try {
      return baseUrl ? new URL(baseUrl).pathname : '';
    } catch {
      return '';
    }
  })();

  const isCrossPageLink = (pos: number): boolean => {
    for (let i = anchors.length - 1; i >= 0; i--) {
      const a = anchors[i];
      if (a.start > pos) continue;
      if (pos > a.end) return false; // anchor closed before this image
      // Only reject when the link targets a different page than the listing itself.
      return a.hrefPath !== ownPath;
    }
    return false;
  };

  const push = (rawUrl: string, alt: string, pos = -1) => {
    const url = absolutize(rawUrl, baseUrl);
    if (!url || !isPhotoUrl(url, alt)) return;
    if (pos >= 0 && isCrossPageLink(pos)) return; // related-listing / nav card
    const key = photoKey(url);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ url, alt: alt.trim() });
  };

  const imgRe = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) !== null) {
    const tag = m[0];
    const alt = (tag.match(/\balt\s*=\s*"([^"]*)"/i)?.[1] ?? tag.match(/\balt\s*=\s*'([^']*)'/i)?.[1] ?? '');
    // Skip obviously small icons when dimensions are declared.
    const w = Number(tag.match(/\bwidth\s*=\s*["']?(\d+)/i)?.[1] ?? 0);
    const h = Number(tag.match(/\bheight\s*=\s*["']?(\d+)/i)?.[1] ?? 0);
    if (w && h && Math.max(w, h) < 300) continue;
    const src =
      tag.match(/\bsrc\s*=\s*"([^"]*)"/i)?.[1] ??
      tag.match(/\bsrc\s*=\s*'([^']*)'/i)?.[1] ??
      tag.match(/\bdata-src\s*=\s*"([^"]*)"/i)?.[1] ??
      tag.match(/\bdata-lazy-src\s*=\s*"([^"]*)"/i)?.[1] ??
      tag.match(/\bsrcset\s*=\s*"([^"]*)"/i)?.[1] ??
      '';
    const pos = m.index;
    if (src) push(/\s/.test(src.trim()) ? firstFromSrcset(src, baseUrl) : src, alt, pos);
    const srcset = tag.match(/\bsrcset\s*=\s*"([^"]*)"/i)?.[1];
    if (srcset) push(firstFromSrcset(srcset, baseUrl), alt, pos);
  }

  const sourceRe = /<source\b[^>]*>/gi;
  while ((m = sourceRe.exec(html)) !== null) {
    const srcset = m[0].match(/\bsrcset\s*=\s*"([^"]*)"/i)?.[1];
    if (srcset) push(firstFromSrcset(srcset, baseUrl), '', m.index);
  }

  return out;
}

function mapRoomFromAlt(alt: string): string | null {
  const lower = alt.toLowerCase();
  for (const [de, en] of Object.entries(ROOM_MAP)) {
    if (lower.includes(de)) return en;
  }
  return null;
}

function titleCase(s: string): string {
  const t = s.trim().split(/\s+/).slice(0, 20).join(' ');
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

function formatAddress(node: Record<string, unknown>): string {
  const direct = firstString(node, ['address', 'streetAddress']);
  if (direct && !direct.startsWith('{')) return direct;
  const addr = node['address'];
  if (addr && typeof addr === 'object') {
    const a = addr as Record<string, unknown>;
    const street = typeof a['streetAddress'] === 'string' ? a['streetAddress'] : '';
    const zip = typeof a['postalCode'] === 'string' ? a['postalCode'] : '';
    const city = typeof a['addressLocality'] === 'string' ? a['addressLocality'] : '';
    return [street, [zip, city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  }
  return '';
}

export const genericParser: PortalParser = {
  name: 'Allgemein',

  matchUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  },

  parse(html: string, baseUrl?: string): PortalListing {
    const meta = metaMap(html);
    const rawNodes = firstJsonLdObjects(html);
    const nodes = flattenNodes(rawNodes);
    const listingNodes = nodes.filter(isListingNode);
    const primary = listingNodes[0] ?? {};

    // --- Title ---
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
    const title =
      firstString(primary, ['name', 'headline']) ||
      meta['og:title'] ||
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
      h1.replace(/<[^>]+>/g, '').trim();

    // --- Address / price / facts ---
    const address = formatAddress(primary) || meta['og:street-address'] || '';
    const offers = (primary['offers'] ?? {}) as Record<string, unknown>;
    const priceRaw = deepString(offers, ['price']) || deepString(primary, ['price']);
    const currency = firstString(offers, ['priceCurrency']);
    const price = priceRaw ? `${priceRaw}${currency ? ` ${currency}` : ''}` : '';
    const floorSize = (primary['floorSize'] ?? {}) as Record<string, unknown>;
    const area = deepString(floorSize, ['value']) ? `${deepString(floorSize, ['value'])} m²` : '';
    const rooms = deepString(primary, ['numberOfRooms']);
    const yearBuilt = deepString(primary, ['yearBuilt']) || undefined;
    const energyClass =
      deepString(primary, ['emissionsOrEnergyDeregated']) ||
      (primary['energyEfficiencyCategory'] as string) ||
      undefined;
    const listingText = firstString(primary, ['description']) || meta['description'] || meta['og:description'] || '';

    // --- Photos ---
    const seen = new Set<string>();
    const dedupe = (items: { url: string; alt: string }[]): { url: string; alt: string }[] => {
      const out: { url: string; alt: string }[] = [];
      for (const item of items) {
        const url = absolutize(item.url, baseUrl);
        if (!url || !isPhotoUrl(url, '')) continue;
        const key = photoKey(url);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ url, alt: item.alt });
      }
      return out;
    };

    const structured = dedupe(imagesFromJsonLd(nodes));
    if (structured.length < MIN_STRUCTURED) {
      const ogUrls = [meta['og:image'], meta['og:image:secure_url'], meta['twitter:image']].filter(Boolean);
      structured.push(...dedupe(ogUrls.map(url => ({ url, alt: '' }))));
    }
    if (structured.length < MIN_STRUCTURED) {
      // The DOM is noisy — only trust it when the structured data is thin.
      for (const p of domImages(bodyOnly(html), baseUrl)) {
        if (structured.length >= MAX_PHOTOS) break;
        const key = photoKey(p.url);
        if (seen.has(key)) continue;
        seen.add(key);
        structured.push(p);
      }
    }

    // Floor plan: separate pass so it is excluded from the photo set.
    let floorPlanUrl: string | null = null;
    const allDom = domImages(bodyOnly(html), baseUrl);
    const fp = allDom.find(p => FLOOR_PLAN.test(p.url) || FLOOR_PLAN.test(p.alt));
    floorPlanUrl = fp ? fp.url : null;

    const photos = structured.slice(0, MAX_PHOTOS).map(p => {
      // A long alt is the whole ad description (shared by every photo), not a
      // caption — never derive a room or a description from it.
      const caption = p.alt.length <= 80 ? p.alt : '';
      return {
        url: p.url,
        alt: p.alt,
        room: caption ? mapRoomFromAlt(caption) || undefined : undefined,
        description: caption ? titleCase(caption) : undefined,
      };
    });

    return {
      title: title.trim(),
      address,
      price,
      area,
      rooms,
      yearBuilt,
      energyClass,
      photos,
      floorPlanUrl,
      listingText,
      features: [],
      listingFacts: {},
    };
  },
};
