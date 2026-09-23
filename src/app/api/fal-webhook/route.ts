import { NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/v3/db';
import { extractVideoUrl, getFalResult } from '@/lib/v3/fal';

function checkSecret(request: Request, url: URL): boolean {
  const secret = process.env.FAL_WEBHOOK_SECRET;
  if (!secret) return true; // not configured → accept (internal preview only)
  const provided =
    url.searchParams.get('secret') ||
    request.headers.get('x-fal-webhook-secret') ||
    request.headers.get('secret');
  return provided === secret;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (!checkSecret(request, url)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const jobId = url.searchParams.get('job_id');
  if (!jobId) return NextResponse.json({ error: 'job_id required' }, { status: 400 });

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const job = await getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  if (job.status === 'done') return NextResponse.json({ ok: true, already: true });

  // Error event?
  const eventType = payload?.event_type || payload?.type || '';
  const isError =
    eventType === 'onError' || payload?.status === 'ERROR' || payload?.error;

  if (isError) {
    const msg = String(payload?.error || payload?.detail || 'fal request failed').slice(0, 500);
    await updateJob(jobId, { status: 'error', error: msg });
    return NextResponse.json({ ok: true });
  }

  // Success: find video URL in payload; fall back to fetching the full result.
  let videoUrl = extractVideoUrl(payload);
  if (!videoUrl && job.fal_response_url) {
    try {
      const result = await getFalResult(job.fal_response_url);
      videoUrl = extractVideoUrl(result);
    } catch { /* status endpoint polling will retry */ }
  }

  if (videoUrl) {
    await updateJob(jobId, { status: 'done', video_url: videoUrl });
    return NextResponse.json({ ok: true });
  }

  // Payload shape unexpected — leave status rendering; /api/status polls fal directly.
  return NextResponse.json({ ok: true, deferred: true });
}
