// Homemotion v3 — fal.ai queue client (REST, no SDK dependency).
// Verified against https://fal.ai/docs/documentation/model-apis/inference/queue (23.09.2026):
// - POST body must be the FLAT input (no {input: ...} wrapper)
// - webhook via query param ?fal_webhook=
// - follow the status_url / response_url returned by submit

const QUEUE_BASE = 'https://queue.fal.run';

function falKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY missing');
  return key;
}

export interface FalSubmitResponse {
  requestId: string;
  statusUrl: string;
  responseUrl: string;
}

export async function submitFal(
  endpoint: string,
  input: Record<string, unknown>,
  webhookUrl?: string,
): Promise<FalSubmitResponse> {
  const url = new URL(`${QUEUE_BASE}/${endpoint}`);
  if (webhookUrl) url.searchParams.set('fal_webhook', webhookUrl);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input), // FLAT — fal passes the body straight to the model
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`fal submit failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  if (!data.request_id) throw new Error('fal submit returned no request_id');
  return {
    requestId: data.request_id as string,
    statusUrl: (data.status_url as string) || `${QUEUE_BASE}/${endpoint}/requests/${data.request_id}/status`,
    responseUrl: (data.response_url as string) || `${QUEUE_BASE}/${endpoint}/requests/${data.request_id}`,
  };
}

export type FalStatus = 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'UNKNOWN';

export async function getFalStatus(statusUrl: string): Promise<FalStatus> {
  try {
    const res = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${falKey()}` },
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    if (!res.ok) return 'UNKNOWN';
    const data = await res.json();
    const s = String(data.status || '').toUpperCase();
    if (s === 'COMPLETED') {
      return data.error || data.error_type ? 'FAILED' : 'COMPLETED';
    }
    if (s === 'IN_QUEUE' || s === 'IN_PROGRESS') return s;
    return 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

export async function getFalResult(responseUrl: string): Promise<any> {
  const res = await fetch(responseUrl, {
    headers: { 'Authorization': `Key ${falKey()}` },
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`fal result failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json();
}

/** Tolerant video URL extraction — output shape differs slightly per model. */
export function extractVideoUrl(data: any): string | null {
  if (!data || typeof data !== 'object') return null;
  const direct =
    data?.video?.url ||
    data?.output?.video?.url ||
    data?.payload?.video?.url ||
    data?.videos?.[0]?.url ||
    data?.output?.videos?.[0]?.url;
  if (typeof direct === 'string' && direct.startsWith('http')) return direct;

  // bounded deep search for a hosted video URL
  const seen = new Set<any>();
  const stack: any[] = [data];
  let steps = 0;
  while (stack.length && steps++ < 500) {
    const node = stack.pop();
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    for (const v of Object.values(node)) {
      if (typeof v === 'string' && /^https?:\/\//.test(v) && (/\.mp4/.test(v) || /fal\.(media|ai)/.test(v))) {
        return v;
      }
      if (v && typeof v === 'object') stack.push(v);
    }
  }
  return null;
}
