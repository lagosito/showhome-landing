'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';
import {
  MODEL_CONFIG, FORMATS, DURATIONS, QUALITY_LABELS,
  resolutionFor, costEstimate, selectReferencePhotos,
  type PropertyType, type Format, type Lang, type ModelId, type Quality, type Duration,
} from '@/lib/v3/config';

const PROPERTY_LABELS: Record<PropertyType, string> = {
  rent: 'Miete',
  sale: 'Kauf',
  new: 'Neubau',
};

export default function OptionsPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<any[]>([]);
  const [propertyType, setPropertyType] = useState<PropertyType>('rent');
  const [format, setFormat] = useState<Format>('walkthrough');
  const [language, setLanguage] = useState<Lang>('de');
  const [model, setModel] = useState<ModelId>('seedance-2.5');
  const [duration, setDuration] = useState<Duration>(5);
  const [quality, setQuality] = useState<Quality>('standard');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('showhome-photos');
    if (!stored) {
      router.push('/create/upload');
      return;
    }
    setPhotos(JSON.parse(stored));
  }, [router]);

  const refs = useMemo(
    () => selectReferencePhotos(photos.map((p: any, i: number) => ({ ...p, order: p.order ?? i + 1 }))),
    [photos],
  );

  const resolution = resolutionFor(model, quality);
  const cost = costEstimate(model, quality, duration);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType, format, language, model, duration, quality,
          photos: refs.map((p: any, i: number) => ({ room: p.room, url: p.url, order: i + 1 })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Etwas ist schiefgelaufen');
        setSubmitting(false);
        return;
      }
      sessionStorage.removeItem('showhome-photos');
      sessionStorage.removeItem('showhome-options');
      sessionStorage.removeItem('showhome-listing');
      router.push(`/video/${data.job_id}`);
    } catch (e: any) {
      setError(e.message || 'Netzwerkfehler');
      setSubmitting(false);
    }
  };

  const group = <T extends string | number>(label: string, value: T, set: (v: T) => void, options: { id: T; text: string; sub?: string }[]) => (
    <fieldset>
      <legend className="text-[14px] font-semibold text-ink">{label}</legend>
      <div className={`mt-3 grid gap-3 ${options.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {options.map(o => (
          <button
            key={o.id}
            onClick={() => set(o.id)}
            className={`rounded-xl border px-4 py-3.5 text-left transition ${
              value === o.id
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-white text-ink hover:border-ink/25'
            }`}
          >
            <span className="block text-[14px] font-medium">{o.text}</span>
            {o.sub && <span className={`mt-1 block text-[12px] ${value === o.id ? 'opacity-70' : 'text-ink-3'}`}>{o.sub}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
                <span className="h-1 w-1 rounded-full bg-clay" /> Interner Test · v3
              </span>
              <h1 className="mt-5 text-balance text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                Video-Optionen
              </h1>
              <p className="mt-3 text-[14px] text-ink-3">
                {refs.length} Referenzfoto{refs.length !== 1 ? 's' : ''} · {refs.map((p: any) => p.room).join(' → ') || '–'}
              </p>
            </div>

            <div className="mt-10 space-y-8">
              {group('Art des Angebots', propertyType, setPropertyType, [
                { id: 'rent' as PropertyType, text: 'Miete' },
                { id: 'sale' as PropertyType, text: 'Kauf' },
                { id: 'new' as PropertyType, text: 'Neubau' },
              ])}

              {group('Format', format, setFormat, FORMATS.map(f => ({ id: f.id, text: f.label, sub: f.hint })))}

              {group('Sprache', language, setLanguage, [
                { id: 'de' as Lang, text: 'Deutsch' },
                { id: 'en' as Lang, text: 'English' },
              ])}

              {group('Modell', model, setModel, [
                { id: 'seedance-2.5' as ModelId, text: 'Seedance 2.5 (fal)', sub: '720p / 1080p' },
                { id: 'seedance-byteplus' as ModelId, text: 'Seedance 2.5 (BytePlus)', sub: '480p / 720p · −51%' },
                { id: 'minimax-h3' as ModelId, text: 'MiniMax H3', sub: '768P / 2K' },
              ])}

              {group('Dauer', duration, setDuration, DURATIONS.map(d => ({ id: d, text: `${d} s` })))}

              {group('Qualität', quality, setQuality, QUALITY_LABELS.map(q => ({
                id: q.id,
                text: q.label,
                sub: resolutionFor(model, q.id),
              })))}

              {/* Cost + resolution summary */}
              <div className="rounded-2xl border border-line bg-paper-2/50 p-5">
                <p className="text-[13px] font-semibold text-ink">Zusammenfassung</p>
                <div className="mt-3 space-y-2 text-[13px] text-ink-2">
                  <p>Modell: <strong>{MODEL_CONFIG[model].label}</strong> · Auflösung: <strong>{resolution}</strong> · Dauer: <strong>{duration} s</strong></p>
                  <p>Format: <strong>{FORMATS.find(f => f.id === format)?.label}</strong> · Sprache: <strong>{language.toUpperCase()}</strong> · Angebot: <strong>{PROPERTY_LABELS[propertyType]}</strong></p>
                  <p>Geschätzte Kosten: <strong>≈ {cost.toFixed(2)} USD</strong></p>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push('/create/rooms')}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-line-2 bg-white/70 px-6 py-3.5 text-[15px] font-medium text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-40"
                >Zurück</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || refs.length === 0}
                  className="flex-1 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] transition hover:-translate-y-0.5 hover:bg-[#1b1d20] disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {submitting ? 'Plan wird erstellt…' : `Video erstellen (≈ ${cost.toFixed(2)} USD)`}
                </button>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
