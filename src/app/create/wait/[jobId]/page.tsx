'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

const STATUS_STEPS = [
  { key: 'queued', label: 'In der Warteschlange', desc: 'Wartet auf Bearbeitung…' },
  { key: 'writing_script', label: 'Skript wird geschrieben', desc: 'Unsere KI schreibt den Sprechertext…' },
  { key: 'rendering', label: 'Rendering', desc: 'Deine Videotour wird erstellt…' },
  { key: 'ready', label: 'Fertig', desc: 'Dein Video ist fertig!' },
  { key: 'failed', label: 'Fehlgeschlagen', desc: 'Etwas ist schiefgelaufen.' },
];

export default function WaitPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [notify, setNotify] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
        if (data.status === 'ready') {
          router.push(`/create/result/${jobId}`);
        }
      }
    } catch {}
  }, [jobId, router]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const currentStep = STATUS_STEPS.findIndex(s => s.key === job?.status) ?? 0;
  const isTerminal = job?.status === 'ready' || job?.status === 'failed';

  if (!job) {
    return (
      <>
        <Nav />
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-ink-3">Auftrag wird geladen…</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <Container>
          <div className="mx-auto max-w-lg text-center">
            <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
              <span className="h-1 w-1 rounded-full bg-clay" /> Schritt 4 von 4
            </span>
            <h1 className="mt-5 text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
              {job.status === 'failed' ? 'Etwas ist schiefgelaufen' : 'Dein Video wird erstellt'}
            </h1>

            {/* Status steps */}
            <div className="mt-10 space-y-0">
              {STATUS_STEPS.slice(0, 4).map((step, i) => {
                const isDone = i < currentStep;
                const isCurrent = i === currentStep && !isTerminal;
                const isFailed = job.status === 'failed' && i === currentStep;
                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`grid h-8 w-8 place-items-center rounded-full text-[12px] font-semibold transition ${
                        isDone ? 'bg-clay text-paper' : isCurrent ? 'bg-ink text-paper animate-pulse' : isFailed ? 'bg-red-600 text-white' : 'bg-line text-ink-3'
                      }`}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      {i < 3 && <div className={`h-8 w-px ${isDone ? 'bg-clay' : 'bg-line'}`} />}
                    </div>
                    <div className="pt-1 text-left">
                      <p className={`text-[14px] font-medium ${isCurrent ? 'text-ink' : isDone ? 'text-clay' : 'text-ink-3'}`}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="mt-0.5 text-[13px] text-ink-3">{step.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {job.status === 'failed' && (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-left">
                <p className="text-[14px] font-medium text-red-800">Erstellung fehlgeschlagen</p>
                <p className="mt-2 text-[13px] text-red-700">
                  {job.error || 'Ein unerwarteter Fehler ist aufgetreten. Dein Guthaben wurde nicht verbraucht.'}
                </p>
                <button
                  onClick={() => router.push('/create/options')}
                  className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-paper transition hover:-translate-y-0.5"
                >
                  Erneut versuchen
                </button>
              </div>
            )}

            {/* Email notification */}
            {!isTerminal && (
              <div className="mt-10 rounded-2xl border border-line bg-white p-5 text-left">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-line text-clay accent-clay"
                  />
                  <div>
                    <p className="text-[14px] font-medium text-ink">Benachrichtige mich, wenn es fertig ist</p>
                    <p className="mt-0.5 text-[12px] text-ink-3">Wir schicken dir eine E-Mail, damit du nicht hier warten musst.</p>
                  </div>
                </label>
                {notify && !emailSaved && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="deine@email.de"
                      className="flex-1 rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-ink"
                    />
                    <button
                      onClick={() => setEmailSaved(true)}
                      className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-paper"
                    >
                      Speichern
                    </button>
                  </div>
                )}
                {emailSaved && (
                  <p className="mt-2 text-[12px] text-clay">✓ Wir benachrichtigen {email}</p>
                )}
              </div>
            )}

            <p className="mt-8 text-[13px] text-ink-3">
              Du kannst diese Seite verlassen und später zurückkommen. Dein Video wartet hier auf dich.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
