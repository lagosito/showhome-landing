'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

const STATUS_STEPS = [
  { key: 'queued', label: 'Queued', desc: 'Waiting in line…' },
  { key: 'writing_script', label: 'Writing script', desc: 'Our AI is writing the narration…' },
  { key: 'rendering', label: 'Rendering', desc: 'Creating your video tour…' },
  { key: 'ready', label: 'Ready', desc: 'Your video is done!' },
  { key: 'failed', label: 'Failed', desc: 'Something went wrong.' },
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
          <p className="text-ink-3">Loading job…</p>
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
              <span className="h-1 w-1 rounded-full bg-clay" /> Step 3 of 3
            </span>
            <h1 className="mt-5 text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
              {job.status === 'failed' ? 'Something went wrong' : 'Your video is being created'}
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
                <p className="text-[14px] font-medium text-red-800">Generation failed</p>
                <p className="mt-2 text-[13px] text-red-700">
                  {job.error || 'An unexpected error occurred. Your credit has not been consumed.'}
                </p>
                <button
                  onClick={() => router.push('/create/options')}
                  className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-paper transition hover:-translate-y-0.5"
                >
                  Try again
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
                    <p className="text-[14px] font-medium text-ink">Notify me when it&apos;s ready</p>
                    <p className="mt-0.5 text-[12px] text-ink-3">We&apos;ll email you so you don&apos;t have to wait here.</p>
                  </div>
                </label>
                {notify && !emailSaved && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-ink"
                    />
                    <button
                      onClick={() => setEmailSaved(true)}
                      className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-paper"
                    >
                      Save
                    </button>
                  </div>
                )}
                {emailSaved && (
                  <p className="mt-2 text-[12px] text-clay">✓ We&apos;ll notify {email}</p>
                )}
              </div>
            )}

            <p className="mt-8 text-[13px] text-ink-3">
              You can leave this page and come back later. Your video will be here.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
