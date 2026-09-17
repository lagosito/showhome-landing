'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  email: string;
  plan: string;
  credits_total: number;
  credits_used: number;
  trial_ends_at: string | null;
}

interface Job {
  id: string;
  status: string;
  created_at: string;
  video_url: string | null;
  error: string | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusLabel(status: string, t: (key: string) => string): { text: string; color: string } {
  switch (status) {
    case 'completed':
      return { text: t('statusCompleted'), color: 'bg-emerald-500' };
    case 'processing':
    case 'rendering':
      return { text: t('statusProcessing'), color: 'bg-amber-400 animate-pulse' };
    case 'queued':
      return { text: t('statusQueued'), color: 'bg-sky-400' };
    case 'failed':
      return { text: t('statusFailed'), color: 'bg-red-500' };
    default:
      return { text: status, color: 'bg-ink-3' };
  }
}

export default function AccountClient({
  userProfile,
  jobs,
}: {
  userProfile: UserProfile;
  jobs: Job[];
}) {
  const t = useTranslations('Account');
  const router = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  const creditsRemaining = userProfile.credits_total - userProfile.credits_used;
  const planDisplay =
    userProfile.plan === 'free'
      ? t('planFree')
      : userProfile.plan === 'starter'
        ? t('planStarter')
        : userProfile.plan === 'pro'
          ? t('planPro')
          : userProfile.plan === 'enterprise'
            ? t('planEnterprise')
            : userProfile.plan;

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-paper pt-24 pb-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            {/* Page heading */}
            <div className="text-center">
              <h1 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
                {t('heading')}
              </h1>
              <p className="mt-3 text-[15px] text-ink-3">
                {t('subheading')}
              </p>
            </div>

            {/* User info card */}
            <div className="mt-10 rounded-2xl border border-line bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
                    {t('accountInfo')}
                  </p>
                  <h2 className="mt-4 text-[15px] font-medium text-ink">
                    {t('email')}
                  </h2>
                  <p className="mt-1 text-[15px] text-ink-2">{userProfile.email}</p>
                </div>
                <span className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-paper">
                  {planDisplay}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6">
                <div>
                  <p className="text-[13px] font-medium text-ink-3">{t('creditsRemaining')}</p>
                  <p className="mt-1 text-[22px] font-semibold text-ink">
                    {creditsRemaining}
                    <span className="text-[13px] font-normal text-ink-3">
                      {' '}/ {userProfile.credits_total}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-ink-3">{t('videosCreated')}</p>
                  <p className="mt-1 text-[22px] font-semibold text-ink">{jobs.length}</p>
                </div>
              </div>

              {userProfile.trial_ends_at && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-[13px] text-ink-3">
                    {t('trialEnds')} {formatDate(userProfile.trial_ends_at)}
                  </p>
                </div>
              )}
            </div>

            {/* Videos section */}
            <div className="mt-10" id="videos">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
                {t('videosSection')}
              </p>
              <h2 className="mt-3 text-[20px] font-semibold tracking-[-0.02em]">
                {t('videosHeading')}
              </h2>
            </div>

            {jobs.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-line-2 bg-white p-10 text-center">
                <p className="text-[15px] text-ink-3">{t('noVideos')}</p>
                <button
                  onClick={() => router.push('/create/upload')}
                  className="mt-4 rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-paper transition hover:-translate-y-0.5 hover:bg-[#1b1d20]"
                >
                  {t('createFirst')}
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {jobs.map((job) => {
                  const { text: statusText, color: statusColor } = statusLabel(job.status, t);
                  return (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-xl border border-line bg-white px-5 py-4 transition hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${statusColor}`} />
                          <span className="text-[14px] font-medium text-ink">{statusText}</span>
                        </div>
                        <p className="mt-1 text-[12px] text-ink-3">
                          {formatDate(job.created_at)}
                        </p>
                        {job.error && (
                          <p className="mt-1 text-[12px] text-red-600">{job.error}</p>
                        )}
                      </div>
                      <div className="ml-4 shrink-0">
                        {job.status === 'completed' && job.video_url ? (
                          <div className="flex gap-2">
                            <a
                              href={job.video_url}
                              target="_blank"
                              rel="noopener"
                              className="rounded-full border border-line-2 bg-white/70 px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-paper"
                            >
                              {t('watch')}
                            </a>
                            <a
                              href={job.video_url}
                              download
                              className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-paper transition hover:-translate-y-0.5 hover:bg-[#1b1d20]"
                            >
                              {t('download')}
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={() => router.push(`/create/result/${job.id}`)}
                            className="rounded-full border border-line-2 bg-white/70 px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-paper"
                            disabled={job.status === 'failed'}
                          >
                            {t('viewDetails')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sign out */}
            <div className="mt-12 border-t border-line pt-8 text-center">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-full border border-line-2 bg-white px-6 py-3 text-[15px] font-medium text-ink transition hover:-translate-y-0.5 hover:bg-paper-2 disabled:opacity-50"
              >
                {signingOut ? t('signingOut') : t('signOut')}
              </button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
