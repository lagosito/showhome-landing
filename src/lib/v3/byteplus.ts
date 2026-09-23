// Homemotion v3 — BytePlus ModelArk client (official Seedance 2.5 API).
// Verified with a live task (24.09.2026):
// - POST /api/v3/contents/generations/tasks {model, content[], generate_audio,
//   ratio, duration, resolution, watermark} → {id}
// - GET  /api/v3/contents/generations/tasks/{id} → status queued|running|
//   succeeded|failed|expired; on success content.video_url (signed TOS URL,
//   24h expiry), usage.completion_tokens for billing.
// Auth: Bearer ARK_API_KEY (not HMAC-signed).

const ARK_BASE = 'https://ark.ap-southeast.bytepluses.com/api/v3';

function apiKey(): string {
  const k = process.env.BYTEPLUS_API_KEY;
  if (!k) throw new Error('BYTEPLUS_API_KEY not configured');
  return k;
}

export interface BytePlusTask {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'expired';
  content?: { video_url?: string };
  usage?: { completion_tokens?: number };
}

export async function submitBytePlus(input: {
  prompt: string;
  imageUrls: string[];
  resolution: string; // 480p | 720p (official API max for 2.5)
  duration: number; // 4..30
}): Promise<string> {
  const content: unknown[] = [{ type: 'text', text: input.prompt }];
  for (const url of input.imageUrls) {
    content.push({ type: 'image_url', image_url: { url }, role: 'reference_image' });
  }
  const res = await fetch(`${ARK_BASE}/contents/generations/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}` },
    body: JSON.stringify({
      model: 'dreamina-seedance-2-5-260628',
      content,
      generate_audio: true,
      ratio: '16:9',
      duration: input.duration,
      resolution: input.resolution,
      watermark: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`BytePlus submit ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error('BytePlus submit: no task id');
  return data.id;
}

export async function getBytePlusTask(taskId: string): Promise<BytePlusTask> {
  const res = await fetch(`${ARK_BASE}/contents/generations/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`BytePlus status ${res.status}`);
  return (await res.json()) as BytePlusTask;
}

/** Map BytePlus task status onto the job pipeline. */
export function mapBytePlusStatus(t: BytePlusTask): {
  done: boolean;
  failed: boolean;
  videoUrl?: string;
  tokens?: number;
} {
  if (t.status === 'succeeded') {
    return { done: true, failed: false, videoUrl: t.content?.video_url, tokens: t.usage?.completion_tokens };
  }
  if (t.status === 'failed' || t.status === 'expired') {
    return { done: false, failed: true };
  }
  return { done: false, failed: false };
}
