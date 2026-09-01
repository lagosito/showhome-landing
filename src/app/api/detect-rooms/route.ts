import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ROOMS = ['Kitchen', 'Living Room', 'Dining Room', 'Bedroom', 'Bathroom', 'Hallway', 'Exterior', 'Other'] as const;
type Room = typeof ROOMS[number];

const ORCAROUTER_KEY = process.env.ORCAROUTER_API_KEY;

async function detectRoomForImage(imageUrl: string): Promise<Room> {
  if (!ORCAROUTER_KEY) return 'Other';

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
                text: `Classify this real estate photo into exactly ONE room type. Reply with ONLY the room name, nothing else.\n\nOptions: Kitchen, Living Room, Dining Room, Bedroom, Bathroom, Hallway, Exterior, Other\n\nIf you cannot determine the room, reply "Other".`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
    });

    if (!res.ok) return 'Other';

    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();
    const match = ROOMS.find(r => r.toLowerCase() === text.toLowerCase());
    return match || 'Other';
  } catch {
    return 'Other';
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
      const room = await detectRoomForImage(photo.url);
      return { id: photo.id, detectedRoom: room };
    })
  );

  const classified = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { id: photos[i].id, detectedRoom: 'Other' as Room };
  });

  return NextResponse.json({ results: classified });
}
