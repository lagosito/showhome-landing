'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

export default function OptionsPage() {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState<'rent' | 'sale'>('rent');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [highlights, setHighlights] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('showhome-photos');
    if (!stored) {
      router.push('/create/upload');
      return;
    }
    setPhotos(JSON.parse(stored));
  }, [router]);

  // Derive style from photos — Presenter photo present = presenter video
  const derivedStyle: 'voiceover' | 'presenter' =
    photos.some((p: any) => p.room === 'Presenter') ? 'presenter' : 'voiceover';

  const handleSubmit = async () => {
    sessionStorage.setItem('showhome-options', JSON.stringify({
      propertyType, aspectRatio, highlights,
    }));

    const listingRaw = sessionStorage.getItem('showhome-listing');
    const listing = listingRaw ? JSON.parse(listingRaw) : null;

    const res = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyType,
        style: derivedStyle,
        aspectRatio,
        avatarId: null,
        avatarUrl: null,
        highlights,
        photos,
        // Import metadata
        source: listing?.source || 'upload',
        sourceUrl: listing?.sourceUrl || null,
        rightsConfirmedAt: listing?.rightsConfirmedAt || null,
        floorPlanUrl: listing?.floorPlanUrl || null,
        listingText: listing?.listingText || null,
        listingFacts: listing?.listingFacts || null,
        presenterConsentAt: listing?.presenterConsentAt || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Something went wrong');
      return;
    }
    router.push(`/create/wait/${data.jobId}`);
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
                <span className="h-1 w-1 rounded-full bg-clay" /> Step 3 of 4
              </span>
              <h1 className="mt-5 text-balance text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                Choose your video options
              </h1>
            </div>

            <div className="mt-10 space-y-8">
              {/* Property type */}
              <fieldset>
                <legend className="text-[14px] font-semibold text-ink">Property type</legend>
                <div className="mt-3 flex gap-3">
                  {(['rent', 'sale'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setPropertyType(t)}
                      className={`flex-1 rounded-xl border px-4 py-3.5 text-[14px] font-medium transition ${
                        propertyType === t
                          ? 'border-ink bg-ink text-paper'
                          : 'border-line bg-white text-ink hover:border-ink/25'
                      }`}
                    >
                      {t === 'rent' ? 'For rent' : 'For sale'}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Format */}
              <fieldset>
                <legend className="text-[14px] font-semibold text-ink">Format</legend>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 rounded-xl border px-4 py-3.5 text-left transition ${
                      aspectRatio === '9:16'
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line bg-white text-ink hover:border-ink/25'
                    }`}
                  >
                    <span className="text-[14px] font-medium">9:16 Vertical</span>
                    <span className="mt-1 block text-[12px] opacity-70">Instagram, TikTok, WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 rounded-xl border px-4 py-3.5 text-left transition ${
                      aspectRatio === '16:9'
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line bg-white text-ink hover:border-ink/25'
                    }`}
                  >
                    <span className="text-[14px] font-medium">16:9 Landscape</span>
                    <span className="mt-1 block text-[12px] opacity-70">Portals, email, website</span>
                  </button>
                </div>
              </fieldset>

              {/* Highlights */}
              <div>
                <label className="text-[14px] font-semibold text-ink">
                  Anything to highlight? <span className="font-normal text-ink-3">(optional)</span>
                </label>
                <textarea
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value.slice(0, 200))}
                  placeholder="e.g. recently renovated, south facing terrace, brand new kitchen"
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none transition placeholder:text-ink-3 focus:border-ink focus:ring-1 focus:ring-ink"
                />
                <p className="mt-1 text-right text-[12px] text-ink-3">{highlights.length}/200</p>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-line bg-paper-2/50 p-5">
                <p className="text-[13px] font-semibold text-ink">Summary</p>
                <div className="mt-3 space-y-2 text-[13px] text-ink-2">
                  <p>Property: <strong>{propertyType === 'rent' ? 'For rent' : 'For sale'}</strong></p>
                  <p>Style: <strong>{derivedStyle === 'presenter' ? 'Presenter on camera' : 'AI Voiceover'}</strong></p>
                  <p>Format: <strong>{aspectRatio === '9:16' ? '9:16 Vertical' : '16:9 Landscape'}</strong></p>
                  <p>Photos: <strong>{photos.length}</strong></p>
                  {highlights && <p>Highlights: <strong>{highlights}</strong></p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push('/create/rooms')}
                  className="flex-1 rounded-full border border-line-2 bg-white/70 px-6 py-3.5 text-[15px] font-medium text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                >Back</button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] transition hover:-translate-y-0.5 hover:bg-[#1b1d20]"
                >
                  Create video
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
