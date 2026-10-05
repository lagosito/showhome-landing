import { validateParams, costEstimate, resolutionFor } from '../src/lib/v3/config';

const base = {
  propertyType: 'rent',
  format: 'walkthrough',
  language: 'de',
  model: 'seedance-byteplus',
  duration: 7,
  quality: 'standard',
  draft: true,
};

const cases: { name: string; patch: Record<string, unknown> }[] = [
  { name: 'OK  Entwurf 480p · 7 s', patch: {} },
  { name: 'OK  720p final · 7 s', patch: { draft: false } },
  { name: 'LOCK 1080p (quality=high)', patch: { quality: 'high', draft: false } },
  { name: 'LOCK duration 5 s', patch: { duration: 5 } },
  { name: 'LOCK duration 15 s', patch: { duration: 15 } },
  { name: 'LOCK duration 30 s', patch: { duration: 30 } },
  { name: 'LOCK model Seedance fal', patch: { model: 'seedance-2.5' } },
  { name: 'LOCK model MiniMax H3', patch: { model: 'minimax-h3' } },
  { name: 'LOCK model H3 Max', patch: { model: 'minimax-h3-max' } },
];

const out = cases.map(c => {
  const res = validateParams({ ...base, ...c.patch });
  if (!res.ok) return { case: c.name, result: 'REJECTED', error: res.error };
  const p = res.params;
  return {
    case: c.name,
    result: 'ACCEPTED',
    model: p.model,
    duration: p.duration,
    quality: p.quality,
    draft: Boolean(p.draft),
    resolution: p.draft ? '480p' : resolutionFor(p.model, p.quality),
    cost_usd: costEstimate(p.model, p.quality, p.duration, Boolean(p.draft)),
  };
});

console.log(JSON.stringify(out, null, 2));
