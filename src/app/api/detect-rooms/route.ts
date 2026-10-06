import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ROOMS = ['Facade', 'Kitchen', 'Living Room', 'Dining Room', 'Bedroom', 'Bathroom', 'Hallway', 'Exterior', 'Other'] as const;
type Room = typeof ROOMS[number];

import { chatText } from '@/lib/llm';

interface RoomClassification {
  room: Room;
  description: string;
}

const DESCRIPTION_PROMPT = `You are a real estate photo analyst. Return a JSON object with two fields:
- "room": one of Facade, Kitchen, Living Room, Dining Room, Bedroom, Bathroom, Hallway, Exterior, Other
- "Facade" is the front of the building / main exterior shot; use "Exterior" only for gardens, balconies or other outdoor areas
- "description": one sentence (max 20 words) describing what is physically visible — materials, finishes, light, views. No sales adjectives ("spacious", "charming", "inviting", "modern"). No counts, measurements, prices, or guesses about other rooms. If you cannot describe the photo confidently, use an empty string "".

Reply with ONLY valid JSON, nothing else.`;

async function detectRoomForImage(imageUrl: string): Promise<RoomClassification> {
  const fallback: RoomClassification = { room: 'Other', description: '' };

  // Tries orcarouter first, falls back to OpenAI (see lib/llm.ts) — a capacity
  // outage on one provider used to leave every photo in "Other".
  const text = await chatText(
    [
      { type: 'text', text: DESCRIPTION_PROMPT },
      { type: 'image_url', image_url: { url: imageUrl } },
    ],
    { maxTokens: 200, timeoutMs: 30000, json: true },
  );
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text);
    const room = ROOMS.find(r => r.toLowerCase() === (parsed.room || '').toLowerCase()) || 'Other';
    const description = typeof parsed.description === 'string' ? parsed.description.slice(0, 200) : '';
    return { room, description };
  } catch {
    return fallback;
  }
}

// v3 (internal): no login required — protected by Vercel Deployment Protection.
export async function POST(request: Request) {
  // Lives behind the /create login gate — every vision call is billed.
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  const { photos } = await request.json();
  if (!photos?.length) {
    return NextResponse.json({ error: 'photos required' }, { status: 400 });
  }

  // Classify all photos in parallel (max 12 concurrent)
  const results = await Promise.allSettled(
    photos.map(async (photo: { id: string; url: string; filename: string }) => {
      const { room, description } = await detectRoomForImage(photo.url);
      return { id: photo.id, detectedRoom: room, description };
    })
  );

  const classified = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { id: photos[i].id, detectedRoom: 'Other' as Room, description: '' };
  });

  return NextResponse.json({ results: classified });
}
