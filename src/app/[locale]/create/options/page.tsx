'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';
import {
  FORMATS, ACTIVE_DURATIONS, ACTIVE_FINAL_QUALITIES, DEFAULT_MODEL,
  resolutionFor, costEstimate, selectReferencePhotos,
  type PropertyType, type Format, type Lang, type ModelId, type Quality, type Duration,
} from '@/lib/v3/config';

/** Quality tier the user picks. This test build only opens the cheap draft —
 *  720p and 1080p stay visible (so testers see they exist) but locked. */
type Tier = 'draft' | Quality;
type DurationChoice = Duration | 'custom';

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
  const [model] = useState<ModelId>(DEFAULT_MODEL);
  const [duration, setDuration] = useState<Duration>(7);
  const [quality, setQuality] = useState<Quality>('standard');
  // Testers default to the cheap draft — never a 1080p render by accident.
  const [draft, setDraft] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // ModelArk rejected a reference photo because a real person is in it.
  const [personIssue, setPersonIssue] = useState<null | {
    photoIndex: number;
    photoUrl: string;
    room: string | null;
    message: string;
  }>(null);

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

  const isDraft = draft;
  const resolution = isDraft ? '480p' : resolutionFor(model, quality);
  const tier: Tier = isDraft ? 'draft' : quality;
  const cost = costEstimate(model, quality, duration, isDraft);

  // The presenter photo is not a reference image (Seedance refuses person
  // photos); it is sent separately and turned into a text description.
  const presenterUrl = photos.find((p: any) => p.room === 'Presenter')?.url ?? null;

  const persistPhotos = (next: any[]) => {
    setPhotos(next);
    sessionStorage.setItem('showhome-photos', JSON.stringify(next));
  };

  /** photosOverride lets a fix (drop / re-role the rejected photo) re-submit in
   *  the same tick, before React has re-rendered from setPhotos. */
  const handleSubmit = async (photosOverride?: any[]) => {
    setSubmitting(true);
    setError('');
    setPersonIssue(null);
    const list = photosOverride ?? photos;
    const refsNow = selectReferencePhotos(list.map((p: any, i: number) => ({ ...p, order: p.order ?? i + 1 })));
    const presenterNow = list.find((p: any) => p.room === 'Presenter')?.url ?? null;
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyType, format, language, model, duration, quality, draft: isDraft,
          presenterUrl: presenterNow,
          photos: refsNow.map((p: any, i: number) => ({ room: p.room, url: p.url, order: i + 1 })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'person_in_reference_image') {
          setPersonIssue({
            photoIndex: typeof data.photoIndex === 'number' ? data.photoIndex : -1,
            photoUrl: data.photoUrl || '',
            room: data.room || null,
            message:
              data.message ||
              'Ein Referenzfoto zeigt eine Person und kann nicht als Vorlage dienen.',
          });
        } else {
          setError(data.error || 'Etwas ist schiefgelaufen');
        }
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

  // Two ways out of a rejected person photo: drop it, or keep the person as a
  // generated look-alike on camera (Makler format only, no presenter yet).
  const removeProblemPhoto = () => {
    if (!personIssue?.photoUrl) return;
    persistPhotos(photos.filter((p: any) => p.url !== personIssue.photoUrl));
    handleSubmit(photos.filter((p: any) => p.url !== personIssue.photoUrl));
  };

  const useSimilarPerson = () => {
    if (!personIssue?.photoUrl) return;
    const next = photos.map((p: any) =>
      p.url === personIssue.photoUrl ? { ...p, room: 'Presenter' } : p,
    );
    persistPhotos(next);
    handleSubmit(next);
  };

  const group = <T extends string | number>(
    label: string,
    value: T,
    set: (v: T) => void,
    options: { id: T; text: string; sub?: string; disabled?: boolean }[],
  ) => (
    <fieldset>
      <legend className="text-[14px] font-semibold text-ink">{label}</legend>
      <div className={`mt-3 grid gap-3 ${options.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {options.map(o => (
          <button
            key={String(o.id)}
            type="button"
            onClick={() => !o.disabled && set(o.id)}
            disabled={o.disabled}
            className={`rounded-xl border px-4 py-3.5 text-left transition ${
              o.disabled
                ? 'cursor-not-allowed border-line bg-paper-2 text-ink-3'
                : value === o.id
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-white text-ink hover:border-ink/25'
            }`}
          >
            <span className="block text-[14px] font-medium">{o.text}</span>
            {o.sub && (
              <span className={`mt-1 block text-[12px] ${o.disabled ? 'text-ink-3' : value === o.id ? 'opacity-70' : 'text-ink-3'}`}>
                {o.sub}
              </span>
            )}
          </button>
        ))}
      </div>
    </fieldset>
  );

  const setTier = (v: Tier) => {
    if (v === 'draft') setDraft(true);
    else {
      setDraft(false);
      setQuality(v);
    }
  };

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

              {group<DurationChoice>(
                'Dauer',
                duration,
                v => {
                  if (v !== 'custom') setDuration(v);
                },
                [
                  { id: 7, text: '7 s', sub: 'Aktiv für den Test', disabled: !ACTIVE_DURATIONS.includes(7) },
                  { id: 15, text: '15 s', sub: 'gesperrt', disabled: !ACTIVE_DURATIONS.includes(15) },
                  { id: 30, text: '30 s', sub: 'gesperrt', disabled: !ACTIVE_DURATIONS.includes(30) },
                  { id: 'custom', text: 'Custom', sub: 'gesperrt', disabled: true },
                ],
              )}

              {group<Tier>('Qualität', tier, setTier, [
                {
                  id: 'draft',
                  text: 'Entwurf',
                  sub: `480p · ≈ ${costEstimate(model, quality, duration, true).toFixed(2)} USD`,
                },
                {
                  id: 'standard',
                  text: '720p',
                  sub: `≈ ${costEstimate(model, 'standard', duration, false).toFixed(2)} USD${
                    ACTIVE_FINAL_QUALITIES.includes('standard') ? '' : ' · gesperrt'
                  }`,
                  disabled: !ACTIVE_FINAL_QUALITIES.includes('standard'),
                },
                {
                  id: 'high',
                  text: '1080p',
                  sub: `≈ ${costEstimate(model, 'high', duration, false).toFixed(2)} USD · gesperrt`,
                  disabled: true,
                },
              ])}

              {/* Cost + resolution summary */}
              <div className="rounded-2xl border border-line bg-paper-2/50 p-5">
                <p className="text-[13px] font-semibold text-ink">Zusammenfassung</p>
                <div className="mt-3 space-y-2 text-[13px] text-ink-2">
                  <p>Modell: <strong>Seedance 2.5</strong> · Qualität: <strong>{isDraft ? 'Entwurf (480p)' : `${resolution} (final)`}</strong> · Dauer: <strong>{duration} s</strong></p>
                  <p>Format: <strong>{FORMATS.find(f => f.id === format)?.label}</strong> · Sprache: <strong>{language.toUpperCase()}</strong> · Angebot: <strong>{PROPERTY_LABELS[propertyType]}</strong></p>
                  <p>Geschätzte Kosten: <strong>≈ {cost.toFixed(2)} USD</strong></p>
                </div>
              </div>

              {personIssue && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                  <p className="text-[14px] font-semibold text-ink">
                    {personIssue.room ? `Referenzfoto „${personIssue.room}“` : 'Ein Referenzfoto'}{' '}
                    zeigt eine Person
                    {personIssue.photoIndex >= 0 ? ` (Position ${personIssue.photoIndex + 1})` : ''}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                    Aus Datenschutzgründen dürfen echte Personen nicht als Vorlage für die
                    Generierung dienen. Deshalb wurde nichts gestartet – dir entstehen keine
                    Kosten. Du kannst das Foto jetzt entfernen
                    {format === 'agent' && !presenterUrl
                      ? ' oder die Person als ähnliche, künstliche Person ins Video holen (sie tritt dann vor der Kamera auf).'
                      : '.'}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={removeProblemPhoto}
                      disabled={submitting}
                      className="rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-paper transition hover:-translate-y-0.5 disabled:opacity-40"
                    >
                      Foto entfernen
                    </button>
                    {format === 'agent' && !presenterUrl && (
                      <button
                        type="button"
                        onClick={useSimilarPerson}
                        disabled={submitting}
                        className="rounded-full border border-ink/25 bg-white px-5 py-3 text-[14px] font-medium text-ink transition hover:-translate-y-0.5 disabled:opacity-40"
                      >
                        Ähnliche Person ins Video
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPersonIssue(null)}
                      disabled={submitting}
                      className="rounded-full border border-line-2 bg-white/70 px-5 py-3 text-[14px] font-medium text-ink transition hover:-translate-y-0.5 disabled:opacity-40"
                    >
                      Verwerfen
                    </button>
                  </div>
                </div>
              )}

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
                  onClick={() => handleSubmit()}
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
