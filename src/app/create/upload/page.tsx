'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

const ROOMS = ['Kitchen', 'Living Room', 'Dining Room', 'Bedroom', 'Bathroom', 'Exterior', 'Other'] as const;
type Room = typeof ROOMS[number];

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  room: Room;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

function guessRoom(name: string): Room {
  const lower = name.toLowerCase();
  if (lower.includes('kitchen')) return 'Kitchen';
  if (lower.includes('living')) return 'Living Room';
  if (lower.includes('dining')) return 'Dining Room';
  if (lower.includes('bed') || lower.includes('room')) return 'Bedroom';
  if (lower.includes('bath') || lower.includes('wc')) return 'Bathroom';
  if (lower.includes('ext') || lower.includes('outdoor') || lower.includes('terrace') || lower.includes('garden')) return 'Exterior';
  return 'Other';
}

async function downscaleImage(file: File, maxDim = 2048): Promise<File> {
  if (file.size < 500_000) return file; // Already small
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
  const [dragIdx, setDragIdx] = useState<number | null>(null);

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
          room: guessRoom(file.name),
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

  const updateRoom = (id: string, room: Room) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, room } : p));
  };

  // Drag reorder
  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setPhotos(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    setDragIdx(idx);
  };
  const onDragEnd = () => setDragIdx(null);

  // Upload all pending photos
  const uploadAll = async () => {
    const pending = photos.filter(p => p.status === 'pending');
    for (const photo of pending) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'uploading' } : p));

      try {
        // Convert to base64 for server upload
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
    const photoData = photos.map((p, i) => ({ url: p.url!, room: p.room, order: i + 1 }));
    sessionStorage.setItem('showhome-photos', JSON.stringify(photoData));
    router.push('/create/options');
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
                <span className="h-1 w-1 rounded-full bg-clay" /> Step 1 of 3
              </span>
              <h1 className="mt-5 text-balance text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                Upload your property photos
              </h1>
              <p className="mt-4 text-[15px] text-ink-3">
                Between 3 and 12 photos. We&apos;ll detect the rooms and create a natural walkthrough.
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

            {/* Photo grid */}
            {photos.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-[13px] font-medium text-ink-3">
                  {photos.length} of {MAX_FILES} photos · {photos.filter(p => p.status === 'done').length} uploaded
                </p>
                <p className="mb-4 text-[12px] text-ink-3">
                  Drag to reorder — this is the order of your video
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={onDragEnd}
                      className={`group relative overflow-hidden rounded-xl border bg-white transition ${
                        dragIdx === idx ? 'border-clay shadow-lg' : 'border-line'
                      }`}
                    >
                      {/* Order badge */}
                      <span className="absolute left-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-semibold text-paper">
                        {idx + 1}
                      </span>
                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                        className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ×
                      </button>
                      {/* Image */}
                      <img src={photo.preview} alt="" className="aspect-[4/3] w-full object-cover" />
                      {/* Status bar */}
                      {photo.status === 'uploading' && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-line">
                          <div className="h-full bg-clay transition-all" style={{ width: '60%' }} />
                        </div>
                      )}
                      {photo.status === 'error' && (
                        <div className="absolute inset-x-0 bottom-0 bg-red-600 px-2 py-1 text-center text-[10px] text-white">
                          {photo.error || 'Upload failed'}
                        </div>
                      )}
                      {/* Room select */}
                      <div className="border-t border-line p-2">
                        <select
                          value={photo.room}
                          onChange={(e) => updateRoom(photo.id, e.target.value as Room)}
                          className="w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-[12px] text-ink outline-none"
                        >
                          {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation messages */}
            {photos.length > 0 && photos.length < MIN_FILES && (
              <p className="mt-4 text-center text-[13px] text-clay">
                Add at least {MIN_FILES - photos.length} more photo{MIN_FILES - photos.length !== 1 ? 's' : ''} to continue
              </p>
            )}

            {/* Actions */}
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
                {allUploaded ? 'Continue to options' : `Upload ${photos.filter(p => p.status === 'pending').length} photos first`}
              </button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
