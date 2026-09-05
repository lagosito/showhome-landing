import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ROOMS = ['Kitchen', 'Living Room', 'Dining Room', 'Bedroom', 'Bathroom', 'Hallway', 'Exterior', 'Other'] as const;
type Room = typeof ROOMS[number];

const ORCAROUTER_KEY = process.env.ORCAROUTER_API_KEY;

interface RoomClassification {
  room: Room;
  description: string;
}

const DESCRIPTION_PROMPT = `You are a real estate photo analyst. Return a JSON object with two fields:
- "room": one of Kitchen, Living Room, Dining Room, Bedroom, Bathroom, Hallway, Exterior, Other
- "description": one sentence (max 20 words) describing what is physically visible — materials, finishes, light, views. No sales adjectives ("spacious", "charming", "inviting", "modern"). No counts, measurements, prices, or guesses about other rooms. If you cannot describe the photo confidently, use an empty string "".

Reply with ONLY valid JSON, nothing else.`;

async function detectRoomForImage(imageUrl: string): Promise<RoomClassification> {
  const fallback: RoomClassification = { room: 'Other', description: '' };
  if (!ORCAROUTER_KEY) return fallback;

  try {
    const res = await fetch('https://api.orcarouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ORCAROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: DESCRIPTION_PROMPT,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 120,
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return fallback;

    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();
    const parsed = JSON.parse(text);
    const room = ROOMS.find(r => r.toLowerCase() === (parsed.room || '').toLowerCase()) || 'Other';
    const description = typeof parsed.description === 'string' ? parsed.description.slice(0, 200) : '';
    return { room, description };
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

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
