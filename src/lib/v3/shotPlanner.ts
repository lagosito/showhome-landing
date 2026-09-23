// Homemotion v3 — Shot Planner (OpenAI gpt-5-mini, JSON output).
import type { RenderParams } from './config';

export interface Shot {
  start: number;
  end: number;
  image: number; // 1-based index into reference images
  shot: string;
  camera: string;
  action: string;
  dialogue?: string;
}

export interface ShotPlan {
  shots: Shot[];
  voiceover: string;
}

const SYSTEM = `You are a shot planner for high-end real estate video commercials.
You receive: property type, reference images (indexed, with room names), format, language, total duration in seconds and target model.
Return a JSON object ONLY:
{
  "shots": [
    { "start": 0, "end": 2, "image": 1, "shot": "wide establishing", "camera": "slow backward tracking", "action": "...", "dialogue": "" }
  ],
  "voiceover": "..."
}

Rules:
- Shots of 1.5-3 s, alternating wide / medium / close-up.
- If a Facade or Exterior image exists, open with an establishing shot of it.
- "walkthrough": no people on camera. Close-ups of materials, light and textures visible in the reference photos. Voice-over max ~2 words per second.
- "lifestyle": 1-2 residents (a couple around 30) living the space in everyday actions, they never speak to the camera. Voice-over.
- "agent": short dialogue (2-3 sentences total, max ~2 words per second across the whole clip) with lip sync, no voice-over (voiceover field stays "").
- "new" (off-plan): architecture/project tone, never invent prices or completion dates.
- "image" must be a valid reference index.
- action/camera lines describe motion over time, never a frozen frame.
- Keep script text short: no em-dashes or en-dashes, no emojis, no price claims.
- voiceover and dialogue in ${'{language}'} only.`;

export async function runShotPlanner(
  params: RenderParams,
  photos: { room: string; url: string }[],
): Promise<ShotPlan> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  const imageList = photos
    .map((p, i) => `${i + 1}: ${p.room}`)
    .join('\n');

  const user = `Property type: ${params.propertyType}
Format: ${params.format}
Language: ${params.language === 'de' ? 'German' : 'English'}
Total duration: ${params.duration} seconds
Target model: ${params.model}

Reference images:
${imageList}

Plan the shots and return the JSON object.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM.replace('{language}', params.language === 'de' ? 'German' : 'English') },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Shot planner failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Shot planner returned empty content');

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Shot planner returned invalid JSON');
  }

  const shots: Shot[] = Array.isArray(parsed.shots) ? parsed.shots : [];
  if (!shots.length) throw new Error('Shot planner returned no shots');

  return {
    shots: shots.map((s: any) => ({
      start: Number(s.start) || 0,
      end: Number(s.end) || 0,
      image: Math.min(Math.max(Number(s.image) || 1, 1), photos.length),
      shot: String(s.shot || ''),
      camera: String(s.camera || ''),
      action: String(s.action || ''),
      dialogue: s.dialogue ? String(s.dialogue) : '',
    })),
    voiceover: typeof parsed.voiceover === 'string' ? parsed.voiceover : '',
  };
}
