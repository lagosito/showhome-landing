const N8N_WEBHOOK_URL = 'https://lagosito.app.n8n.cloud/webhook/showhome/generate';

export interface N8nJobPayload {
  jobId: string;
  userId: string;
  propertyType: 'rent' | 'sale';
  style: 'voiceover' | 'presenter';
  aspectRatio: '9:16' | '16:9';
  avatarId: string | null;
  avatarUrl: string | null;
  highlights: string;
  photos: { url: string; room: string; order: number; description?: string }[];
}

export async function submitJobToN8n(payload: N8nJobPayload): Promise<{ accepted: boolean; jobId: string }> {
  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`n8n webhook returned ${res.status}`);
  }

  return res.json();
}
