import { NextResponse } from 'next/server';
import {
  MODEL_CONFIG, validateParams, selectReferencePhotos,
  resolutionFor, costEstimate,
} from '@/lib/v3/config';
import { runShotPlanner } from '@/lib/v3/shotPlanner';
import { buildVideoPrompt } from '@/lib/v3/buildPrompt';
import { describePresenter } from '@/lib/v3/presenter';
import { submitFal } from '@/lib/v3/fal';
import { submitBytePlus, BytePlusError } from '@/lib/v3/byteplus';
import { insertJob, updateJob, db } from '@/lib/v3/db';
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
      user_id: user.id,
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
    // Seedance refuses person photos as a reference image, so the presenter
    // becomes a text description that drives the CHARACTER block instead.
    const presenterDesc =
      params.format === 'agent' && params.presenterUrl
        ? await describePresenter(params.presenterUrl)
        : null;

    // Registered presenter asset (asset://…) gives the presenter one stable
    // identity across videos. BytePlus accepts an asset reference where a raw
    // person photo is rejected (400 InputImageSensitiveContentDetected), so it
    // wins over the text description; accounts without one keep the old path.
    let presenterAsset: string | null = null;
    if (params.format === 'agent' && params.presenterUrl) {
      const { data: assetRow } = await db()
        .from('presenter_assets')
        .select('asset_id')
        .eq('user_id', user.id)
        .maybeSingle();
      const raw = typeof assetRow?.asset_id === 'string' ? assetRow.asset_id.trim() : '';
      if (raw) presenterAsset = raw.startsWith('asset://') ? raw : `asset://${raw}`;
    }

    const prompt = buildVideoPrompt(params, plan, refs, presenterDesc, presenterAsset);

    const provider = modelCfg.provider;

    if (provider === 'byteplus') {
      // BytePlus ModelArk (official Seedance 2.5) — Bearer auth, task polling.
      const taskId = await submitBytePlus({
        prompt,
        // presenter asset goes last so prompt indices (@Image1..N rooms,
        // @ImageN+1 presenter) match the content array order
        imageUrls: presenterAsset
          ? [...refs.map(p => p.url), presenterAsset]
          : refs.map(p => p.url),
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
    // ModelArk refuses reference images that contain a real person — the task
    // never starts, so nothing is billed. Tell the user in plain German WHICH
    // photo did it and offer a way out, instead of the raw provider payload.
    const raw = String(err?.message || '');
    const code = String(err?.code || '');
    const personRejected =
      code.includes('InputImageSensitiveContentDetected') ||
      /may contain a real person/i.test(raw) ||
      /may contain a real person/i.test(String(err?.detail || ''));

    if (/is not found/i.test(raw) && /asset/i.test(raw)) {
      await updateJob(jobId, { status: 'error', error: 'Präsentator-Asset nicht gefunden' }).catch(() => {});
      return NextResponse.json(
        {
          code: 'presenter_asset_not_found',
          error: 'presenter_asset_not_found',
          message:
            'Das Präsentator-Asset wurde nicht gefunden. Bitte prüfe die asset://-ID in den Kontoeinstellungen.',
        },
        { status: 422 },
      );
    }

    if (personRejected) {
      const contentIdx = /content\[(\d+)\]/.exec(`${raw} ${String(err?.detail || '')}`);
      const idx = contentIdx ? parseInt(contentIdx[1], 10) : -1;
      // content[0] is the prompt text, reference images start at content[1]
      const photoIndex = idx > 0 ? idx - 1 : -1;
      const photo = photoIndex >= 0 && photoIndex < refs.length ? refs[photoIndex] : undefined;
      await updateJob(jobId, {
        status: 'error',
        error: 'Referenzfoto enthält eine Person – Vorlage abgelehnt',
      }).catch(() => {});
      return NextResponse.json(
        {
          code: 'person_in_reference_image',
          error: 'person_in_reference_image',
          message:
            'Ein Referenzfoto zeigt eine Person. Der Videodienst nimmt Bilder mit echten Personen nicht als Vorlage an (Datenschutz) – die Generierung wurde nicht gestartet.',
          photoIndex,
          photoUrl: photo?.url ?? null,
          room: photo?.room ?? null,
        },
        { status: 422 },
      );
    }

    await updateJob(jobId, { status: 'error', error: raw.slice(0, 500) }).catch(() => {});
    return NextResponse.json({ error: raw || 'Render failed' }, { status: 502 });
  }
}
