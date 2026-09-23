import { NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/v3/db';
import { getFalStatus, getFalResult, extractVideoUrl } from '@/lib/v3/fal';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('job_id');
  if (!jobId) return NextResponse.json({ error: 'job_id required' }, { status: 400 });

  let job = await getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  // Fallback: if still rendering, check fal directly (webhook may be blocked
  // by Vercel Deployment Protection on preview URLs).
  if (job.status === 'rendering' && job.fal_status_url && job.fal_response_url) {
    try {
      const st = await getFalStatus(job.fal_status_url);
      if (st === 'COMPLETED') {
        const result = await getFalResult(job.fal_response_url);
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
    cost_estimate_usd: job.cost_estimate_usd,
    created_at: job.created_at,
  });
}
