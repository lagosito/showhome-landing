'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

interface ImportResult {
  title: string;
  address: string;
  price: string;
  area: string;
  rooms: string;
  yearBuilt?: string;
  energyClass?: string;
  photos: { url: string; alt: string; room?: string; description?: string }[];
  floorPlanUrl: string | null;
  listingText: string;
  features: string[];
  listingFacts: Record<string, string>;
}

const ROOM_MAP: Record<string, string> = {
  wohnzimmer: 'Living Room',
  esszimmer: 'Dining Room',
  küche: 'Kitchen',
  schlafzimmer: 'Bedroom',
  badezimmer: 'Bathroom',
  bad: 'Bathroom',
  balkon: 'Exterior',
  terrasse: 'Exterior',
  garten: 'Exterior',
  diele: 'Hallway',
  flur: 'Hallway',
  treppenhaus: 'Hallway',
};

function mapRoomFromAlt(alt: string): string | null {
  const lower = alt.toLowerCase();
  for (const [de, en] of Object.entries(ROOM_MAP)) {
    if (lower.includes(de)) return en;
  }
  return null;
}

function translateAltToDescription(alt: string, cap = 20): string {
  const words = alt.trim().split(/\s+/);
  const trimmed = words.slice(0, cap).join(' ');
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export default function ImportPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/import-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setResult(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!result || !rightsConfirmed) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: result.photos.length });

    try {
      const uploadedPhotos = [];

      for (let i = 0; i < result.photos.length; i++) {
        const photo = result.photos[i];
        const room = mapRoomFromAlt(photo.alt) || 'Other';
        const description = translateAltToDescription(photo.alt);

        const res = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: photo.url }),
        });

        if (!res.ok) throw new Error('Upload failed');
        const { publicUrl } = await res.json();

        uploadedPhotos.push({
          id: crypto.randomUUID(),
          url: publicUrl,
          filename: `imported-${i + 1}.jpg`,
          room,
          description,
          detectedRoom: room,
          order: i + 1,
        });

        setUploadProgress({ done: i + 1, total: result.photos.length });
      }

      // Store photos for the rooms page (same format as upload flow)
      sessionStorage.setItem('showhome-photos', JSON.stringify(uploadedPhotos));

      // Store listing metadata
      sessionStorage.setItem('showhome-listing', JSON.stringify({
        source: 'link',
        sourceUrl: url.trim(),
        rightsConfirmedAt: new Date().toISOString(),
        floorPlanUrl: result.floorPlanUrl,
        listingText: result.listingText,
        listingFacts: result.listingFacts,
        features: result.features,
        title: result.title,
        address: result.address,
        price: result.price,
        area: result.area,
      }));

      router.push('/create/rooms');
    } catch {
      setError('Failed to upload photos. Please try again.');
      setUploading(false);
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
                <span className="h-1 w-1 rounded-full bg-clay" /> Step 1 of 4
              </span>
              <h1 className="mt-5 text-balance text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                Import from a listing
              </h1>
              <p className="mt-4 text-[15px] text-ink-3">
                Paste the URL of your property listing and we&apos;ll extract the photos automatically.
              </p>
            </div>

            {/* URL input */}
            <div className="mt-10">
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.evernest.com/de/listing/..."
                  className="flex-1 rounded-xl border border-line bg-white px-4 py-3.5 text-[14px] outline-none transition placeholder:text-ink-3 focus:border-ink focus:ring-1 focus:ring-ink"
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                />
                <button
                  onClick={handleFetch}
                  disabled={loading || !url.trim()}
                  className="rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] transition hover:-translate-y-0.5 hover:bg-[#1b1d20] disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {loading ? 'Fetching…' : 'Fetch'}
                </button>
              </div>
              <p className="mt-3 text-[13px] text-ink-3">
                Currently supported: <strong>Evernest</strong>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-[14px] text-red-700">{error}</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-clay" />
                <p className="text-[13px] text-ink-3">Fetching listing…</p>
              </div>
            )}

            {/* Preview */}
            {result && !loading && (
              <div className="mt-8">
                {/* Thumbnail strip */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {result.photos.slice(0, 6).map((photo, i) => (
                    <div key={i} className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-line">
                      <img src={photo.url} alt="" className="h-full w-full object-cover" />
                      <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-paper">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                  {result.photos.length > 6 && (
                    <div className="flex h-24 w-32 flex-shrink-0 items-center justify-center rounded-xl border border-line bg-paper-2">
                      <span className="text-[13px] text-ink-3">+{result.photos.length - 6} more</span>
                    </div>
                  )}
                </div>

                {/* Listing info */}
                <div className="mt-4 rounded-2xl border border-line bg-white p-5">
                  <h2 className="text-[16px] font-semibold text-ink">{result.title}</h2>
                  {result.address && (
                    <p className="mt-1 text-[14px] text-ink-2">{result.address}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-[14px]">
                    {result.price && <span className="font-medium text-ink">{result.price}</span>}
                    {result.area && <span className="text-ink-2">{result.area}</span>}
                    {result.rooms && <span className="text-ink-2">{result.rooms} rooms</span>}
                  </div>
                  {result.features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.features.slice(0, 8).map((f, i) => (
                        <span key={i} className="rounded-full bg-paper-2 px-3 py-1 text-[12px] text-ink-2">{f}</span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-[13px] text-ink-3">
                    {result.photos.length} photos found
                  </p>
                </div>

                {/* Rights checkbox */}
                {!uploading && (
                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-ink/20">
                    <input
                      type="checkbox"
                      checked={rightsConfirmed}
                      onChange={(e) => setRightsConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-line accent-ink"
                    />
                    <span className="text-[14px] text-ink">
                      This is my own listing and I have the rights to use these photos.
                    </span>
                  </label>
                )}

                {/* Uploading progress */}
                {uploading && (
                  <div className="mt-6">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full bg-clay transition-all"
                        style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-center text-[13px] text-ink-3">
                      Uploading {uploadProgress.done} of {uploadProgress.total} photos…
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => { setResult(null); setUrl(''); setError(null); }}
                    disabled={uploading}
                    className="flex-1 rounded-full border border-line-2 bg-white/70 px-6 py-3.5 text-[15px] font-medium text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!rightsConfirmed || uploading}
                    className="flex-1 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] transition hover:-translate-y-0.5 hover:bg-[#1b1d20] disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    {uploading ? 'Importing…' : 'Sort rooms'}
                  </button>
                </div>
              </div>
            )}

            {/* Or upload link */}
            {!result && !loading && (
              <div className="mt-8 text-center">
                <p className="text-[14px] text-ink-3">
                  Or{' '}
                  <button
                    onClick={() => router.push('/create/upload')}
                    className="font-medium text-ink underline underline-offset-2 hover:text-clay"
                  >
                    upload photos directly
                  </button>
                </p>
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
