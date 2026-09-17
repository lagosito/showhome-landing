import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getParserForUrl } from '@/lib/portals';

const USER_AGENT = 'Homemotion-Import/1.0 (https://homeshow-landing.vercel.app)';
const MAX_PHOTOS = 12;
const MIN_PHOTOS = 3;

// Simple in-memory rate limit: 10 fetches per user per hour
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

async function checkRobotsTxt(origin: string): Promise<boolean> {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return true; // No robots.txt = allowed
    const text = await res.text();
    // Check for Homemotion user-agent or wildcard
    const lines = text.split('\n');
    let appliesToUs = false;
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith('user-agent:')) {
        appliesToUs = trimmed.includes('showhome') || trimmed.includes('*');
      } else if (appliesToUs && trimmed.startsWith('disallow:')) {
        const path = trimmed.replace('disallow:', '').trim();
        if (path === '/' || path === '') return false;
      }
    }
    return true;
  } catch {
    return true; // Can't reach robots.txt = proceed
  }
}

export async function POST(request: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Rate limit
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warte kurz und versuche es erneut.' },
      { status: 429 }
    );
  }

  const { url } = await request.json();
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Bitte gib eine URL ein' }, { status: 400 });
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'Bitte gib eine gültige URL ein' },
      { status: 400 }
    );
  }

  // Check supported portal
  const parser = getParserForUrl(url);
  if (!parser) {
    return NextResponse.json(
      {
        error: 'unsupported_portal',
        message: 'Dieses Portal wird noch nicht unterstützt. Aktuell unterstützen wir: Evernest. Du kannst deine Fotos auch direkt hochladen.',
      },
      { status: 400 }
    );
  }

  // Check robots.txt
  const allowed = await checkRobotsTxt(`${parsedUrl.origin}`);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Diese Website erlaubt keinen automatisierten Zugriff.' },
      { status: 403 }
    );
  }

  // Fetch the listing page
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'page_unreachable', message: 'Wir konnten diese Seite nicht erreichen. Bitte prüfe die URL und versuche es erneut.' },
        { status: 404 }
      );
    }
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: 'page_unreachable', message: 'Wir konnten diese Seite nicht erreichen. Bitte prüfe die URL und versuche es erneut.' },
      { status: 502 }
    );
  }

  // Parse
  let listing;
  try {
    listing = parser.parse(html);
  } catch {
    return NextResponse.json(
      { error: 'parse_error', message: 'Wir konnten dieses Inserat nicht auslesen. Bitte versuche es erneut oder lade die Fotos direkt hoch.' },
      { status: 422 }
    );
  }

  // Validate photos
  if (listing.photos.length === 0) {
    return NextResponse.json(
      { error: 'no_photos', message: 'In diesem Inserat wurden keine Fotos gefunden.' },
      { status: 422 }
    );
  }
  if (listing.photos.length < MIN_PHOTOS) {
    return NextResponse.json(
      {
        error: 'fewer_than_3_photos',
        message: `Wir haben nur ${listing.photos.length} ${listing.photos.length !== 1 ? 'Fotos' : 'Foto'} gefunden. Du brauchst mindestens ${MIN_PHOTOS}. Bitte lade weitere Fotos hoch oder versuche ein anderes Inserat.`,
      },
      { status: 422 }
    );
  }

  // Cap at MAX_PHOTOS
  const cappedPhotos = listing.photos.slice(0, MAX_PHOTOS);

  return NextResponse.json({
    title: listing.title,
    address: listing.address,
    price: listing.price,
    area: listing.area,
    rooms: listing.rooms,
    yearBuilt: listing.yearBuilt,
    energyClass: listing.energyClass,
    photos: cappedPhotos,
    floorPlanUrl: listing.floorPlanUrl,
    listingText: listing.listingText,
    features: listing.features,
    listingFacts: listing.listingFacts,
  });
}
