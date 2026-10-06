import { NextResponse } from 'next/server';
import {
  MODEL_CONFIG, validateParams, selectReferencePhotos,
  resolutionFor, costEstimate,
} from '@/lib/v3/config';
import { runShotPlanner } from '@/lib/v3/shotPlanner';
import { buildVideoPrompt } from '@/lib/v3/buildPrompt';
import { submitFal } from '@/lib/v3/fal';
import { submitBytePlus } from '@/lib/v3/byteplus';
import { insertJob, updateJob } from '@/lib/v3/db';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export const maxDuration = 60;

// Every render is billed to this account — require a session and cap the rate.
const renderLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_RENDERS_PER_HOUR = 10;

function underRenderLimit(userId: string): boolean {
  const now = Date.now();
  const entry = renderLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    renderLimits.set(userId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= MAX_RENDERS_PER_HOUR) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }
  if (!underRenderLimit(user.id)) {
    return NextResponse.json(
      { error: `Maximal ${MAX_RENDERS_PER_HOUR} Renders pro Stunde. Bitte warte kurz.` },
      { status: 429 },
    );
  }

  const v = validateParams(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const params = v.params;

  const photos: { room: string; url: string; order?: number }[] = Array.isArray(body.photos) ? body.photos : [];
  if (!photos.length || photos.some((p: any) => !p?.url || !p?.room)) {
    return NextResponse.json({ error: 'photos (room + url) required' }, { status: 400 });
  }

  const refs = selectReferencePhotos(photos.map((p, i) => ({ ...p, order: p.order ?? i + 1 })));
  if (!refs.length) return NextResponse.json({ error: 'No reference photos available' }, { status: 400 });

  const modelCfg = MODEL_CONFIG[params.model];
  if (refs.length > modelCfg.maxImages) {
    return NextResponse.json({ error: `Max ${modelCfg.maxImages} reference photos for ${modelCfg.label}` }, { status: 400 });
  }

  const jobId = randomUUID();
  const cost = costEstimate(params.model, params.quality, params.duration, Boolean(params.draft));
  const endpoint = modelCfg.endpoint;

  try {
    await insertJob({
      id: jobId,
      params,
      photos: refs,
      model: params.model,
      endpoint,
      status: 'planning',
      cost_estimate_usd: cost,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `DB: ${err.message}` }, { status: 500 });
  }

  try {
    const plan = await runShotPlanner(params, refs);
    const prompt = buildVideoPrompt(params, plan, refs);

    const provider = modelCfg.provider;

    if (provider === 'byteplus') {
      // BytePlus ModelArk (official Seedance 2.5) — Bearer auth, task polling.
      const taskId = await submitBytePlus({
        prompt,
        imageUrls: refs.map(p => p.url),
        resolution: resolutionFor(params.model, params.quality),
        duration: params.duration,
        draft: Boolean(params.draft),
      });
      await updateJob(jobId, {
        shot_plan: plan as any,
        prompt,
        fal_request_id: taskId,
        status: 'rendering',
      } as any);
      return NextResponse.json({ job_id: jobId });
    }

    const input: Record<string, unknown> = {
      prompt,
      aspect_ratio: '16:9',
    };
    if (params.model === 'seedance-2.5') {
      input.image_urls = refs.map(p => p.url);
      input.resolution = resolutionFor('seedance-2.5', params.quality);
      input.duration = String(params.duration);
      input.generate_audio = true;
    } else {
      input.reference_image_urls = refs.map(p => p.url);
      input.resolution = resolutionFor(params.model, params.quality);
      input.duration = params.duration;
      input.prompt_expansion_mode = 'disabled';
    }

    // Webhook URL (preview deployments are protected by Vercel Auth —
    // status endpoint also polls fal as fallback, see /api/status).
    const origin = new URL(request.url).origin;
    const secret = process.env.FAL_WEBHOOK_SECRET;
    const webhookUrl = secret
      ? `${origin}/api/fal-webhook?job_id=${jobId}&secret=${encodeURIComponent(secret)}`
      : undefined;

    const submitted = await submitFal(endpoint, input, webhookUrl);

    await updateJob(jobId, {
      shot_plan: plan as any,
      prompt,
      fal_request_id: submitted.requestId,
      fal_status_url: submitted.statusUrl,
      fal_response_url: submitted.responseUrl,
      status: 'rendering',
    } as any);

    return NextResponse.json({ job_id: jobId });
  } catch (err: any) {
    await updateJob(jobId, { status: 'error', error: String(err?.message || err).slice(0, 500) }).catch(() => {});
    return NextResponse.json({ error: String(err?.message || 'Render failed') }, { status: 502 });
  }
}
