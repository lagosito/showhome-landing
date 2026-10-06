import { NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/v3/db';
import { getFalStatus, getFalResult, extractVideoUrl } from '@/lib/v3/fal';
import { getBytePlusTask, mapBytePlusStatus } from '@/lib/v3/byteplus';
import { MODEL_CONFIG } from '@/lib/v3/config';

export const dynamic = 'force-dynamic';

/** BytePlus/ByteDance TOS signs video URLs for 24 h (X-Tos-Date + X-Tos-Expires).
 *  Returns seconds left before the stored link stops working, or null when the
 *  URL isn't signed that way. */
function signedUrlRemainingSeconds(raw: string): number | null {
  try {
    const q = new URL(raw).searchParams;
    const stamp = q.get('X-Tos-Date'); // 20261006T092621Z
    const expires = Number(q.get('X-Tos-Expires'));
    if (!stamp || !Number.isFinite(expires) || stamp.length < 16) return null;
    const iso = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T` +
      `${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}Z`;
    const expiresAt = Math.floor(new Date(iso).getTime() / 1000) + expires;
    return expiresAt - Math.floor(Date.now() / 1000);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('job_id');
  if (!jobId) return NextResponse.json({ error: 'job_id required' }, { status: 400 });

  let job = await getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const provider = (job.model && MODEL_CONFIG[job.model as keyof typeof MODEL_CONFIG]?.provider) || 'fal';

  // BytePlus: no webhook in use — poll the ModelArk task directly.
  const bpTaskId = job.fal_request_id;
  if (job.status === 'rendering' && provider === 'byteplus' && bpTaskId) {
    try {
      const task = await getBytePlusTask(bpTaskId);
      const st = mapBytePlusStatus(task);
      if (st.done && st.videoUrl) {
        await updateJob(jobId, { status: 'done', video_url: st.videoUrl });
        job = (await getJob(jobId))!;
      } else if (st.failed) {
        await updateJob(jobId, { status: 'error', error: 'Video generation failed on BytePlus ModelArk' });
        job = (await getJob(jobId))!;
      }
    } catch { /* transient — next poll retries */ }
  }

  // Done + about to expire: ask BytePlus for a fresh signed link, otherwise a
  // tester who comes back tomorrow gets a dead player.
  if (job.status === 'done' && provider === 'byteplus' && bpTaskId && job.video_url) {
    const remaining = signedUrlRemainingSeconds(job.video_url);
    if (remaining !== null && remaining < 3600) {
      try {
        const task = await getBytePlusTask(bpTaskId);
        const st = mapBytePlusStatus(task);
        if (st.done && st.videoUrl) {
          await updateJob(jobId, { video_url: st.videoUrl });
          job = (await getJob(jobId))!;
        }
      } catch { /* keep the old link until it actually expires */ }
    }
  }

  // Fallback: if still rendering, check fal directly (webhook may be blocked
  // by Vercel Deployment Protection on preview URLs).
  const falStatusUrl = job.fal_status_url;
  const falResponseUrl = job.fal_response_url;
  if (job.status === 'rendering' && provider === 'fal' && falStatusUrl && falResponseUrl) {
    try {
      const st = await getFalStatus(falStatusUrl);
      if (st === 'COMPLETED') {
        const result = await getFalResult(falResponseUrl);
        const videoUrl = extractVideoUrl(result);
        if (videoUrl) {
          await updateJob(jobId, { status: 'done', video_url: videoUrl });
          job = (await getJob(jobId))!;
        }
      } else if (st === 'FAILED') {
        await updateJob(jobId, { status: 'error', error: 'Video generation failed on the model provider' });
        job = (await getJob(jobId))!;
      }
    } catch { /* transient — next poll retries */ }
  }

  return NextResponse.json({
    status: job.status,
    video_url: job.video_url,
    script: job.shot_plan,
    params: job.params,
    model: job.model,
    error: job.error,
    finalized_to: job.params?.finalized_to || null,
    cost_estimate_usd: job.cost_estimate_usd,
    created_at: job.created_at,
  });
}
