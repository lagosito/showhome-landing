'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<any>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then(r => r.json())
      .then(setJob)
      .catch(() => {});
  }, [jobId]);

  if (!job) {
    return (
      <>
        <Nav />
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-ink-3">Wird geladen…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (job.status === 'failed') {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-20">
          <Container>
            <div className="mx-auto max-w-lg text-center">
              <h1 className="text-[28px] font-semibold">Erstellung fehlgeschlagen</h1>
              <p className="mt-4 text-[15px] text-ink-3">
                {job.error || 'Etwas ist schiefgelaufen. Dein Guthaben wurde nicht verbraucht.'}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => router.push('/create/options')}
                  className="rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition hover:-translate-y-0.5"
                >
                  Erneut versuchen
                </button>
                <button
                  onClick={() => router.push('/create/upload')}
                  className="rounded-full border border-line-2 bg-white/70 px-6 py-3.5 text-[15px] font-medium text-ink"
                >
                  Neu starten
                </button>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/70 px-3 py-1 text-[11.5px] font-semibold text-clay">
                <span className="h-1.5 w-1.5 rounded-full bg-clay animate-sheen" /> Video fertig
              </span>
              <h1 className="mt-5 text-balance text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
                Deine Immobilientour ist fertig
              </h1>
            </div>

            {/* Video player */}
            {job.video_url && (
              <div className="mt-8 overflow-hidden rounded-2xl bg-ink">
                <video
                  src={job.video_url}
                  autoPlay
                  muted={!soundOn}
                  loop
                  playsInline
                  controls
                  className="w-full"
                />
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => setSoundOn(!soundOn)}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] text-white transition hover:bg-white/20"
                  >
                    {soundOn ? '🔊' : '🔇'} Ton {soundOn ? 'an' : 'aus'}
                  </button>
                  <a
                    href={job.video_url}
                    download
                    className="rounded-full bg-white px-4 py-1.5 text-[12px] font-medium text-ink transition hover:bg-white/90"
                  >
                    Herunterladen
                  </a>
                </div>
              </div>
            )}

            {/* Script */}
            {job.script && (
              <div className="mt-8 rounded-2xl border border-line bg-white p-5">
                <p className="text-[13px] font-semibold text-ink">Generiertes Skript</p>
                <p className="mt-1 text-[11px] text-ink-3">Nutze es als Inseratstext oder Social-Media-Beschreibung.</p>
                <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-2">{job.script}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(job.script); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="mt-3 text-[12px] font-medium text-clay hover:underline"
                >
                  {copied ? '✓ Kopiert' : 'Skript kopieren'}
                </button>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 rounded-2xl border border-line bg-white p-5">
              <p className="text-[13px] font-semibold text-ink">Video teilen</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-paper"
                >
                  {copied ? '✓ Kopiert' : 'Link kopieren'}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Schau dir diese Immobilientour an: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener"
                  className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-paper"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('Immobilien-Videotour')}&body=${encodeURIComponent(`Hier geht es zur Tour: ${shareUrl}`)}`}
                  className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-paper"
                >
                  E-Mail
                </a>
                {job.video_url && (
                  <a
                    href={job.video_url}
                    download
                    className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-paper"
                  >
                    MP4 herunterladen
                  </a>
                )}
              </div>
            </div>

            {/* Create another */}
            <div className="mt-8 text-center">
              <button
                onClick={() => { sessionStorage.removeItem('showhome-photos'); sessionStorage.removeItem('showhome-options'); router.push('/create/upload'); }}
                className="rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] transition hover:-translate-y-0.5 hover:bg-[#1b1d20]"
              >
                Weiteres Video erstellen
              </button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
