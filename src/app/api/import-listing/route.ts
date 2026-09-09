import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getParserForUrl } from '@/lib/portals';

const USER_AGENT = 'ShowHome-Import/1.0 (https://homeshow-landing.vercel.app)';
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
    // Check for ShowHome user-agent or wildcard
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
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  const { url } = await request.json();
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'Please enter a valid URL' },
      { status: 400 }
    );
  }

  // Check supported portal
  const parser = getParserForUrl(url);
  if (!parser) {
    return NextResponse.json(
      {
        error: 'unsupported_portal',
        message: 'This portal is not supported yet. We currently support: Evernest. You can also upload photos directly.',
      },
      { status: 400 }
    );
  }

  // Check robots.txt
  const allowed = await checkRobotsTxt(`${parsedUrl.origin}`);
  if (!allowed) {
    return NextResponse.json(
      { error: 'This site does not allow automated access.' },
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
        { error: 'page_unreachable', message: "We couldn't reach this page. Please check the URL and try again." },
        { status: 404 }
      );
    }
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: 'page_unreachable', message: "We couldn't reach this page. Please check the URL and try again." },
      { status: 502 }
    );
  }

  // Parse
  let listing;
  try {
    listing = parser.parse(html);
  } catch {
    return NextResponse.json(
      { error: 'parse_error', message: 'We had trouble reading this listing. Please try again or upload photos directly.' },
      { status: 422 }
    );
  }

  // Validate photos
  if (listing.photos.length === 0) {
    return NextResponse.json(
      { error: 'no_photos', message: 'No photos were found on this listing.' },
      { status: 422 }
    );
  }
  if (listing.photos.length < MIN_PHOTOS) {
    return NextResponse.json(
      {
        error: 'fewer_than_3_photos',
        message: `We found only ${listing.photos.length} photo${listing.photos.length !== 1 ? 's' : ''}. You need at least ${MIN_PHOTOS}. Please upload additional photos or try a different listing.`,
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
