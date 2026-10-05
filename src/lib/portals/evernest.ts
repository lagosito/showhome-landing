import { PortalParser, PortalListing } from './types';
import { ROOM_MAP } from './rooms';

function mapRoomFromAlt(alt: string): string | null {
  const lower = alt.toLowerCase();
  // Check compound words first (e.g. "Wohnzimmer" inside a longer sentence)
  for (const [de, en] of Object.entries(ROOM_MAP)) {
    if (lower.includes(de)) return en;
  }
  return null;
}

function translateAltToDescription(alt: string, cap = 20): string {
  // Remove leading room name if present, trim to cap words
  const words = alt.trim().split(/\s+/);
  const trimmed = words.slice(0, cap).join(' ');
  // Ensure first letter is uppercase
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function extractTextBetweenHeadings(html: string, startHeading: string, endHeading?: string): string {
  const startIdx = html.indexOf(startHeading);
  if (startIdx === -1) return '';
  const from = startIdx + startHeading.length;
  const to = endHeading
    ? html.indexOf(endHeading, from)
    : html.indexOf('</section>', from);
  return to === -1 ? html.substring(from, from + 5000) : html.substring(from, to);
}

export const evernestParser: PortalParser = {
  name: 'Evernest',

  matchUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.hostname.includes('evernest.com') && u.pathname.includes('/de/listing/');
    } catch {
      return false;
    }
  },

  parse(html: string): PortalListing {
    // Next.js SSR injects `<!-- -->` comments inside tags, which breaks the
    // value-extraction regexes below. Strip them once up front.
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // --- Title (h1 may contain nested elements, e.g. <h1><div>…</div></h1>) ---
    const h1Inner = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
    const h1Text = h1Inner.replace(/<[^>]+>/g, '').trim();
    const ogTitle = html.match(/property="og:title"[^>]*content="([^"]*)"/i)?.[1]
      ?? html.match(/content="([^"]*)"[^>]*property="og:title"/i)?.[1]
      ?? '';
    const title = h1Text || ogTitle.trim();

    // --- Address (h3 after "Lage" heading) ---
    const lageIdx = html.indexOf('>Lage<');
    let address = '';
    if (lageIdx > -1) {
      const afterLage = html.substring(lageIdx, lageIdx + 500);
      const addrMatch = afterLage.match(/<h3[^>]*>([^<]+)<\/h3>/);
      address = addrMatch?.[1]?.trim() ?? '';
    }

    // --- Facts section ---
    const factsText = extractTextBetweenHeadings(html, '>Fakten<', '>Energieinformationen<');
    const listingFacts: Record<string, string> = {};
    // The facts list is a <dl> of <dt>/<dd>. Values can contain nested markup
    // (e.g. "128 m<sup>2</sup>"), so pair the elements first and strip tags after.
    const dtRe = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
    let fact: RegExpExecArray | null;
    while ((fact = dtRe.exec(factsText)) !== null) {
      const key = fact[1].replace(/<[^>]+>/g, '').trim();
      const val = fact[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (key && val) listingFacts[key] = val;
    }
    // Fallback: parse from full text
    const factsSection = html.substring(
      html.indexOf('>Fakten<') || 0,
      html.indexOf('>Energieinformationen<') || html.length
    );
    const factPattern = />(Preis|Wohnfläche|Zimmer|Baujahr|Energieklasse|Kaufpreis|Miete[^<]*)<[\s\S]*?>([^<]+)</g;
    let fm: RegExpExecArray | null;
    while ((fm = factPattern.exec(factsSection)) !== null) {
      const key = fm[1].trim();
      const val = fm[2].trim();
      if (val && !listingFacts[key]) listingFacts[key] = val;
    }

    const price = listingFacts['Preis'] || listingFacts['Kaufpreis'] || listingFacts['Miete'] || '';
    const areaRaw = listingFacts['Wohnfläche ca.'] || listingFacts['Wohnfläche'] || '';
    const area = areaRaw.replace(/\s*2$/, '²').replace(/m\s*2$/, 'm²');
    const rooms = listingFacts['Zimmer'] || '';
    const yearBuilt = listingFacts['Baujahr'] || undefined;
    const energyClass = listingFacts['Energieklasse'] || undefined;

    // --- Photos from gallery (Contentful CDN, exclude floor plan) ---
    const photoRegex = /<img[^>]*alt="([^"]*)"[^>]*src="(https:\/\/images\.ctfassets\.net\/[^"]*\?[^"]*)"[^>]*>/gi;
    const photoRegexAlt = /<img[^>]*src="(https:\/\/images\.ctfassets\.net\/[^"]*\?[^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi;
    const seen = new Set<string>();
    const photos: { url: string; alt: string; room?: string; description?: string }[] = [];

    for (const re of [photoRegex, photoRegexAlt]) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null) {
        const alt = (m[1] || m[2] || '').trim();
        const rawSrc = (m[2] || m[1] || '').trim();
        // Skip floor plans
        if (alt.toLowerCase().includes('grundriss') || alt.toLowerCase().includes('floor plan')) continue;
        // Normalize URL to w=1920
        const baseUrl = rawSrc.split('?')[0];
        const url = `${baseUrl}?w=1920`;
        if (seen.has(url)) continue;
        seen.add(url);
        // Agent/broker photos → classify as Presenter
        if (alt.toLowerCase().includes('frau mit') || alt.toLowerCase().includes('mann mit')) {
          photos.push({ url, alt, room: 'Presenter', description: translateAltToDescription(alt) });
          continue;
        }
        photos.push({ url, alt });
      }
    }

    // --- Floor plan ---
    const floorPlanRegex = /<img[^>]*alt="([^"]*[Gg]rundriss[^"]*)"[^>]*src="(https:\/\/images\.ctfassets\.net\/[^"]*)"[^>]*>/i;
    const floorPlanRegexAlt = /<img[^>]*src="(https:\/\/images\.ctfassets\.net\/[^"]*)"[^>]*alt="([^"]*[Gg]rundriss[^"]*)"[^>]*>/i;
    let floorPlanUrl: string | null = null;
    const fpm = floorPlanRegex.exec(html) || floorPlanRegexAlt.exec(html);
    if (fpm) {
      floorPlanUrl = (fpm[2] || fpm[1] || '').split('?')[0] + '?w=1920';
    }

    // --- Features / bullets ---
    const featuresSection = html.substring(
      html.indexOf('>Grundrisse<') || 0,
      html.indexOf('Exposé', html.indexOf('>Grundrisse<') || 0) || html.length
    );
    const featureRegex = /<li[^>]*>([^<]{3,80})<\/li>/gi;
    const features: string[] = [];
    const featureSet = new Set<string>();
    let fm2: RegExpExecArray | null;
    while ((fm2 = featureRegex.exec(featuresSection)) !== null) {
      const t = fm2[1].trim();
      if (t && !featureSet.has(t)) {
        featureSet.add(t);
        features.push(t);
      }
    }

    // --- Description text ---
    const descRegex = /<p[^>]*>([^<]{50,})<\/p>/gi;
    const descParts: string[] = [];
    let dm: RegExpExecArray | null;
    while ((dm = descRegex.exec(html)) !== null) {
      const t = dm[1].replace(/<[^>]+>/g, '').trim();
      if (t.length > 50 && !t.includes('Cookie') && !t.includes('cookie')) {
        descParts.push(t);
      }
    }
    const listingText = descParts.join('\n\n').substring(0, 2000);

    // --- Enrich photos with room + description from alt text ---
    const enrichedPhotos = photos.map(p => ({
      ...p,
      room: mapRoomFromAlt(p.alt),
      description: translateAltToDescription(p.alt),
    }));

    return {
      title,
      address,
      price,
      area,
      rooms,
      yearBuilt,
      energyClass,
      photos: enrichedPhotos,
      floorPlanUrl,
      listingText,
      features,
      listingFacts,
    };
  },
};
