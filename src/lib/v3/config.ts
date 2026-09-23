// Homemotion v3 — model config, quality mapping and cost estimation.
// Prices verified from fal.ai model cards (23.09.2026), see brief.

export type ModelId = 'seedance-2.5' | 'minimax-h3';
export type Quality = 'standard' | 'high';
export type Format = 'walkthrough' | 'lifestyle' | 'agent';
export type Lang = 'de' | 'en';
export type PropertyType = 'rent' | 'sale' | 'new';
export type Duration = 5 | 10 | 15;

export const MODEL_CONFIG = {
  'seedance-2.5': {
    label: 'Seedance 2.5',
    endpoint: 'bytedance/seedance-2.5/reference-to-video',
    resolutions: { standard: '720p', high: '1080p' } as Record<Quality, string>,
    // USD per second
    costPerSec: { standard: 0.473, high: 1.164 } as Record<Quality, number>,
    imageNotation: 'at' as const, // @Image1 in prompt
    maxImages: 30,
    durationType: 'string' as const,
  },
  'minimax-h3': {
    label: 'MiniMax H3',
    endpoint: 'minimax/h3/reference-to-video',
    resolutions: { standard: '768P', high: '2K' } as Record<Quality, string>,
    costPerSec: { standard: 0.06, high: 0.13 } as Record<Quality, number>,
    imageNotation: 'plain' as const, // "Image 1" in prompt
    maxImages: 12, // first 5 free, +0.08 USD each after → we cap at 5 photos anyway
    durationType: 'int' as const,
  },
} as const satisfies Record<ModelId, any>;

export const FORMATS: { id: Format; label: string; hint: string }[] = [
  { id: 'walkthrough', label: 'Walkthrough', hint: 'Ohne Personen, Voice-over' },
  { id: 'lifestyle', label: 'Lifestyle', hint: 'Paar wohnt den Raum, Voice-over' },
  { id: 'agent', label: 'Makler', hint: 'Makler vor der Kamera, Dialog' },
];

export const DURATIONS: Duration[] = [5, 10, 15];

export const QUALITY_LABELS: { id: Quality; label: string }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'high', label: 'High' },
];

export const ROOMS = [
  'Facade', 'Exterior', 'Kitchen', 'Living Room', 'Dining Room',
  'Bedroom', 'Bathroom', 'Other',
] as const;

export function resolutionFor(model: ModelId, quality: Quality): string {
  return MODEL_CONFIG[model].resolutions[quality];
}

export function costEstimate(model: ModelId, quality: Quality, duration: Duration): number {
  const usd = MODEL_CONFIG[model].costPerSec[quality] * duration;
  return Math.round(usd * 100) / 100;
}

export interface RenderParams {
  propertyType: PropertyType;
  format: Format;
  language: Lang;
  model: ModelId;
  duration: Duration;
  quality: Quality;
}

export function validateParams(p: any): { ok: true; params: RenderParams } | { ok: false; error: string } {
  const t = (v: any, allowed: readonly any[], name: string) => {
    if (!allowed.includes(v)) return `${name} muss eines sein: ${allowed.join(', ')}`;
    return null;
  };
  const err =
    t(p?.propertyType, ['rent', 'sale', 'new'], 'propertyType') ||
    t(p?.format, ['walkthrough', 'lifestyle', 'agent'], 'format') ||
    t(p?.language, ['de', 'en'], 'language') ||
    t(p?.model, ['seedance-2.5', 'minimax-h3'], 'model') ||
    t(Number(p?.duration), [5, 10, 15], 'duration') ||
    t(p?.quality, ['standard', 'high'], 'quality');
  if (err) return { ok: false, error: err };
  return {
    ok: true,
    params: {
      propertyType: p.propertyType,
      format: p.format,
      language: p.language,
      model: p.model,
      duration: Number(p.duration) as Duration,
      quality: p.quality,
    },
  };
}

/**
 * Selection rule (brief): one photo per room (first uploaded of each),
 * max 5, order Facade → Exterior → rest in upload order.
 * 'Presenter' / 'Unsorted' photos are never reference material.
 */
export function selectReferencePhotos(photos: { room: string; url: string; order: number }[]) {
  const pool = photos
    .filter(p => p.room !== 'Presenter' && p.room !== 'Unsorted' && p.url)
    .sort((a, b) => a.order - b.order);

  const picked: typeof pool = [];
  const taken = new Set<string>();

  for (const pref of ['Facade', 'Exterior']) {
    const hit = pool.find(p => p.room === pref && !taken.has(p.room + p.url));
    if (hit) { picked.push(hit); taken.add(hit.room + hit.url); }
  }
  for (const p of pool) {
    if (picked.length >= 5) break;
    if (taken.has(p.room + p.url)) continue;
    taken.add(p.room + p.url);
    picked.push(p);
  }
  return picked;
}
