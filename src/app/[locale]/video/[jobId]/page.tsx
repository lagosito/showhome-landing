'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';
import { resolutionFor, costEstimate, MODEL_CONFIG, type Quality, type Duration } from '@/lib/v3/config';

const STEP_LABEL: Record<string, string> = {
  planning: 'KI-Skript wird geschrieben…',
  rendering: 'Video wird gerendert…',
  done: 'Fertig',
  error: 'Fehlgeschlagen',
};

export default function VideoPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [data, setData] = useState<any>(null);
  const [fetchError, setFetchError] = useState('');

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/status?job_id=${jobId}`, { cache: 'no-store' });
      if (res.status === 404) { setFetchError('Auftrag nicht gefunden'); return; }
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
    } catch { /* transient */ }
  }, [jobId]);

  useEffect(() => {
    poll();
    const t = setInterval(poll, 10_000);
    return () => clearInterval(t);
  }, [poll]);

  const p = data?.params;
  const isDraft = Boolean(p?.draft) && !data?.finalized_to;
  const resolution = p ? (p.draft ? '480p (Entwurf)' : resolutionFor(p.model, p.quality as Quality)) : '';
  const cost = p ? costEstimate(p.model, p.quality as Quality, p.duration as Duration, Boolean(p.draft)) : null;

  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState('');
  const finalize = async () => {
    setFinalizing(true);
    setFinalizeError('');
    try {
      const res = await fetch('/api/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFinalizeError(json.error || 'Finalisierung fehlgeschlagen');
        setFinalizing(false);
        return;
      }
      window.location.href = `/video/${json.job_id}`;
    } catch (e: any) {
      setFinalizeError(e.message || 'Netzwerkfehler');
      setFinalizing(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
                <span className="h-1 w-1 rounded-full bg-clay" /> Interner Test · v3
              </span>
              <h1 className="mt-5 text-balance text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
                {fetchError
                  ? fetchError
                  : !data
                    ? 'Auftrag wird geladen…'
                    : data.status === 'error'
                      ? 'Erstellung fehlgeschlagen'
                      : data.status === 'done'
                        ? 'Dein Video ist fertig'
                        : STEP_LABEL[data.status] || 'Wird verarbeitet…'}
              </h1>
            </div>

            {data?.error && data.status === 'error' && (
              <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-5 text-[13px] text-red-700">
                {data.error}
              </div>
            )}

            {/* Progress indicator */}
            {data && (data.status === 'planning' || data.status === 'rendering') && (
              <div className="mx-auto mt-10 flex max-w-xl items-center gap-4">
                <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-line border-t-clay" />
                <div className="text-left">
                  <p className="text-[14px] font-medium text-ink">{STEP_LABEL[data.status]}</p>
                  <p className="text-[13px] text-ink-3">Aktualisiert sich alle 10 Sekunden · du kannst die Seite verlassen.</p>
                </div>
              </div>
            )}

            {/* Player */}
            {data?.status === 'done' && data.video_url && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-black">
                <video
                  key={data.video_url}
                  src={data.video_url}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="aspect-video w-full"
                />
              </div>
            )}

            {/* Draft → Final CTA */}
            {data?.status === 'done' && isDraft && (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-line bg-paper-2/50 p-5 text-center">
                <p className="text-[14px] font-medium text-ink">Entwurf (480p) — wenn er passt:</p>
                <p className="mt-1 text-[13px] text-ink-3">
                  Final in 1080p rendern · ≈ {costEstimate(data.params.model, data.params.quality, data.params.duration, false).toFixed(2)} USD
                </p>
                <button
                  onClick={finalize}
                  disabled={finalizing}
                  className="mt-4 w-full rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] transition hover:-translate-y-0.5 hover:bg-[#1b1d20] disabled:opacity-40"
                >
                  {finalizing ? 'Wird eingereicht…' : 'Final erstellen (1080p)'}
                </button>
                {finalizeError && <p className="mt-3 text-[13px] text-red-700">{finalizeError}</p>}
              </div>
            )}
            {data?.status === 'done' && data?.finalized_to && (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-line bg-white p-4 text-center text-[13px] text-ink-2">
                Entwurf finalisiert →{' '}
                <a className="font-medium text-ink underline" href={`/video/${data.finalized_to}`}>
                  Final-Video ansehen
                </a>
              </div>
            )}

            {/* Params used — for model comparison */}
            {data?.params && (
              <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-line bg-paper-2/50 p-5 text-[13px]">
                <p className="font-semibold text-ink">Parameter</p>
                <div className="mt-3 grid grid-cols-2 gap-y-2 text-ink-2">
                  <span>Modell</span><span className="text-right font-medium text-ink">{MODEL_CONFIG[data.model as keyof typeof MODEL_CONFIG]?.label || data.model}</span>
                  <span>Auflösung</span><span className="text-right font-medium text-ink">{resolution}</span>
                  <span>Dauer</span><span className="text-right font-medium text-ink">{data.params.duration} s</span>
                  <span>Format</span><span className="text-right font-medium text-ink">{data.params.format}</span>
                  <span>Sprache</span><span className="text-right font-medium text-ink">{String(data.params.language).toUpperCase()}</span>
                  <span>Angebot</span><span className="text-right font-medium text-ink">{data.params.propertyType}</span>
                  <span>Kosten (Schätzung)</span><span className="text-right font-medium text-ink">{cost != null ? `≈ ${cost.toFixed(2)} USD` : '–'}</span>
                </div>
              </div>
            )}

            {/* Shot plan / script — for comparison */}
            {data?.script?.shots?.length > 0 && (
              <details className="mx-auto mt-4 max-w-xl rounded-2xl border border-line bg-white p-5 text-[13px]">
                <summary className="cursor-pointer font-semibold text-ink">Skript & Shot-Plan anzeigen</summary>
                <div className="mt-3 space-y-3 text-ink-2">
                  {data.script.voiceover && (
                    <p><span className="font-medium text-ink">Voice-over:</span> {data.script.voiceover}</p>
                  )}
                  {data.script.shots.map((s: any, i: number) => (
                    <p key={i}>
                      <span className="font-medium text-ink">Shot {i + 1}</span> ({s.start}–{s.end}s · Bild {s.image} · {s.shot}): {s.camera} — {s.action}
                      {s.dialogue ? ` · Dialog: „${s.dialogue}"` : ''}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
