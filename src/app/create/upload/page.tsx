'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

async function downscaleImage(file: File, maxDim = 2048): Promise<File> {
  if (file.size < 500_000) return file;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function UploadPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 12;
  const MIN_FILES = 3;
  const MAX_SIZE = 10 * 1024 * 1024;

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter(f => {
      if (f.size > MAX_SIZE) {
        alert(`${f.name} is over 10 MB. Please use a smaller file.`);
        return false;
      }
      return true;
    });

    const newPhotos: PhotoFile[] = await Promise.all(
      valid.map(async (file) => {
        const downscaled = await downscaleImage(file);
        return {
          id: crypto.randomUUID(),
          file: downscaled,
          preview: URL.createObjectURL(downscaled),
          status: 'pending' as const,
          progress: 0,
        };
      })
    );

    setPhotos(prev => [...prev, ...newPhotos].slice(0, MAX_FILES));
  }, []);

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const uploadAll = async () => {
    const pending = photos.filter(p => p.status === 'pending');
    for (const photo of pending) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'uploading' } : p));

      try {
        const arrayBuffer = await photo.file.arrayBuffer();
        const base64Data = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const uploadRes = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: photo.file.name,
            base64Data,
            contentType: photo.file.type || 'image/jpeg',
          }),
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        const { publicUrl } = await uploadRes.json();

        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'done', url: publicUrl, progress: 100 } : p));
      } catch (err: any) {
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'error', error: err.message } : p));
      }
    }
  };

  const allUploaded = photos.length >= MIN_FILES && photos.every(p => p.status === 'done');
  const canSubmit = allUploaded;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const photoData = photos.map((p, i) => ({
      id: p.id,
      url: p.url!,
      filename: p.file.name,
      order: i + 1,
    }));
    sessionStorage.setItem('showhome-photos', JSON.stringify(photoData));
    router.push('/create/rooms');
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
                Upload your property photos
              </h1>
              <p className="mt-4 text-[15px] text-ink-3">
                Between 3 and 12 photos. Drop everything at once — we&apos;ll sort the rooms automatically.
                {' '}
                <button
                  onClick={() => router.push('/create/import')}
                  className="font-medium text-ink underline underline-offset-2 hover:text-clay"
                >
                  Or paste a listing link
                </button>
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
              className={`mt-10 cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
                dragOver ? 'border-clay bg-clay-tint/30' : 'border-line-2 bg-white hover:border-ink/20'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.heic"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-paper-2">
                <svg viewBox="0 0 20 20" className="h-5 w-5 text-ink-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 3v14m0 0-5-5m5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mt-4 text-[15px] font-medium text-ink">
                Drop photos here <span className="text-ink-3">or browse</span>
              </p>
              <p className="mt-1 text-[13px] text-ink-3">JPG, PNG, HEIC · Max 10 MB each · Up to {MAX_FILES} photos</p>
            </div>

            {/* Photo grid — thumbnails only, no room dropdown */}
            {photos.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-[13px] font-medium text-ink-3">
                  {photos.length} of {MAX_FILES} photos · {photos.filter(p => p.status === 'done').length} uploaded
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className={`group relative overflow-hidden rounded-xl border bg-white transition ${
                        photo.status === 'error' ? 'border-red-300' : 'border-line'
                      }`}
                    >
                      <span className="absolute left-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-paper">
                        {idx + 1}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                        className="absolute right-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full bg-black/50 text-white text-[10px] opacity-0 transition group-hover:opacity-100"
                      >
                        ×
                      </button>
                      <img src={photo.preview} alt="" className="aspect-square w-full object-cover" />
                      {photo.status === 'uploading' && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-line">
                          <div className="h-full bg-clay transition-all" style={{ width: '60%' }} />
                        </div>
                      )}
                      {photo.status === 'error' && (
                        <div className="absolute inset-x-0 bottom-0 bg-red-600 px-1 py-0.5 text-center text-[9px] text-white">
                          Failed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {photos.length > 0 && photos.length < MIN_FILES && (
              <p className="mt-4 text-center text-[13px] text-clay">
                Add at least {MIN_FILES - photos.length} more photo{MIN_FILES - photos.length !== 1 ? 's' : ''} to continue
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {photos.length > 0 && photos.some(p => p.status === 'pending') && (
                <button
                  onClick={uploadAll}
                  className="flex-1 rounded-full border border-line-2 bg-white/70 px-6 py-3.5 text-[15px] font-medium text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                >
                  Upload all
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] transition hover:-translate-y-0.5 hover:bg-[#1b1d20] disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {allUploaded ? 'Sort rooms' : `Upload ${photos.filter(p => p.status === 'pending').length} photos first`}
              </button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
