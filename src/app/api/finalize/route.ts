import { NextResponse } from 'next/server';
import { getJob, insertJob, updateJob } from '@/lib/v3/db';
import { submitBytePlusFinalFromDraft } from '@/lib/v3/byteplus';
import { costEstimate } from '@/lib/v3/config';
import { randomUUID } from 'crypto';

/**
 * Finalize a finished BytePlus draft job: submit a final-from-draft task
 * (platform reuses the draft's prompt/images/duration; 2.5 final = 1080p
 * only) as a NEW job so draft and final can be compared side by side.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const jobId = body?.job_id;
  if (!jobId) return NextResponse.json({ error: 'job_id required' }, { status: 400 });

  const job = await getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  if (job.status !== 'done') {
    return NextResponse.json({ error: 'Draft is not finished yet' }, { status: 409 });
  }
  if (!job.params?.draft || !job.fal_request_id) {
    return NextResponse.json({ error: 'Job is not a draft' }, { status: 400 });
  }

  const newId = randomUUID();
  const finalParams = { ...job.params, draft: false };
  const cost = costEstimate(finalParams.model, finalParams.quality, finalParams.duration, false);

  try {
    await insertJob({
      id: newId,
      params: finalParams,
      photos: job.photos,
      shot_plan: job.shot_plan,
      prompt: job.prompt,
      model: job.model,
      endpoint: job.endpoint,
      status: 'planning',
      cost_estimate_usd: cost,
    });
    const taskId = await submitBytePlusFinalFromDraft(job.fal_request_id);
    await updateJob(newId, { fal_request_id: taskId, status: 'rendering' });
    // mark the draft so the UI stops offering to finalize it again
    await updateJob(jobId, { params: { ...job.params, finalized_to: newId } } as any);
    return NextResponse.json({ job_id: newId });
  } catch (err: any) {
    await updateJob(newId, { status: 'error', error: String(err?.message || err).slice(0, 500) }).catch(() => {});
    return NextResponse.json({ error: String(err?.message || 'Finalize failed') }, { status: 502 });
  }
}
