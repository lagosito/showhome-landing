'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

const WALKTHROUGH_ORDER = ['Exterior', 'Hallway', 'Living Room', 'Dining Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Other'] as const;
const ALL_ROOMS = [...WALKTHROUGH_ORDER, 'Presenter', 'Unsorted'] as const;
type Room = typeof ALL_ROOMS[number];

interface Photo {
  id: string;
  url: string;
  filename: string;
  detectedRoom: Room;
  room: Room;
  description: string;
  order: number;
}

interface RoomSection {
  room: Room;
  photos: Photo[];
}

const ROOM_LABELS: Record<Room, string> = {
  'Exterior': 'Exterior',
  'Hallway': 'Hallway',
  'Living Room': 'Living Room',
  'Dining Room': 'Dining Room',
  'Kitchen': 'Kitchen',
  'Bedroom': 'Bedroom',
  'Bathroom': 'Bathroom',
  'Other': 'Other',
  'Presenter': 'Presenter',
  'Unsorted': 'Unsorted — file these photos',
};

export default function RoomsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<RoomSection[]>([]);
  const [detecting, setDetecting] = useState(true);
  const [dragItem, setDragItem] = useState<{ sectionIdx: number; photoIdx: number } | null>(null);
  const [dragSection, setDragSection] = useState<number | null>(null);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [presenterConsent, setPresenterConsent] = useState(false);

  const presenterPhotos = sections
    .filter(s => s.room === 'Presenter')
    .flatMap(s => s.photos);
  const hasPresenter = presenterPhotos.length > 0;

  useEffect(() => {
    const stored = sessionStorage.getItem('showhome-photos');
    if (!stored) {
      router.push('/create/upload');
      return;
    }

    const photos: Photo[] = JSON.parse(stored).map((p: any, i: number) => ({
      ...p,
      detectedRoom: (p.room && p.room !== 'Unsorted' ? p.room : 'Unsorted') as Room,
      room: (p.room && p.room !== 'Unsorted' ? p.room : 'Unsorted') as Room,
      description: p.description || '',
      order: i + 1,
    }));

    // Check if rooms are pre-filled (import flow) or need detection (upload flow)
    const hasPreFilledRooms = photos.some(p => p.room !== 'Unsorted');
    if (hasPreFilledRooms) {
      const grouped = groupPhotos(photos);
      setSections(grouped);
      setDetecting(false);
    } else {
      setSections([{ room: 'Unsorted', photos }]);
      detectRooms(photos);
    }
  }, [router]);

  const detectRooms = async (photos: Photo[]) => {
    setDetecting(true);
    try {
      const res = await fetch('/api/detect-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: photos.map(p => ({ id: p.id, url: p.url, filename: p.filename })),
        }),
      });

      if (res.ok) {
        const { results } = await res.json();
        const resultMap = new Map<string, { detectedRoom?: string; description?: string }>(
          results.map((r: any) => [r.id, r])
        );

        const updated = photos.map(p => {
          const detected = resultMap.get(p.id);
          return {
            ...p,
            detectedRoom: (detected?.detectedRoom || 'Other') as Room,
            room: (detected?.detectedRoom || 'Other') as Room,
            description: detected?.description || p.description || '',
          };
        });

        const grouped = groupPhotos(updated);
        setSections(grouped);
      }
    } catch {
      // On failure, keep everything in Unsorted
    }
    setDetecting(false);
  };

  const groupPhotos = (photos: Photo[]): RoomSection[] => {
    const map = new Map<string, Photo[]>();
    for (const room of WALKTHROUGH_ORDER) {
      map.set(room, []);
    }
    map.set('Presenter', []);
    map.set('Unsorted', []);

    for (const photo of photos) {
      const target = map.has(photo.room) ? photo.room : 'Other';
      map.get(target)!.push(photo);
    }

    const result: RoomSection[] = [];
    for (const room of WALKTHROUGH_ORDER) {
      const photos = map.get(room)!;
      if (photos.length > 0) {
        result.push({ room, photos });
      }
    }

    const presenter = map.get('Presenter')!;
    if (presenter.length > 0) {
      result.push({ room: 'Presenter', photos: presenter });
    }

    const unsorted = map.get('Unsorted')!;
    if (unsorted.length > 0) {
      result.unshift({ room: 'Unsorted', photos: unsorted });
    }

    return result;
  };

  // Move photo between sections
  const movePhoto = useCallback((fromSection: number, fromPhoto: number, toSection: number, toPhoto: number) => {
    setSections(prev => {
      const next = prev.map(s => ({ ...s, photos: [...s.photos] }));
      const [moved] = next[fromSection].photos.splice(fromPhoto, 1);
      next[toSection].photos.splice(toPhoto, 0, moved);
      return next.filter(s => s.photos.length > 0 || s.room === 'Unsorted');
    });
  }, []);

  // Move entire section
  const moveSection = useCallback((fromIdx: number, toIdx: number) => {
    setSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  // Change room for a photo
  const changePhotoRoom = (sectionIdx: number, photoIdx: number, newRoom: Room) => {
    setSections(prev => {
      const next = prev.map(s => ({ ...s, photos: [...s.photos] }));
      const photo = next[sectionIdx].photos[photoIdx];
      photo.room = newRoom;

      next[sectionIdx].photos.splice(photoIdx, 1);

      let targetIdx = next.findIndex(s => s.room === newRoom);
      if (targetIdx === -1) {
        next.push({ room: newRoom, photos: [] });
        targetIdx = next.length - 1;
      }
      next[targetIdx].photos.push(photo);

      return next.filter(s => s.photos.length > 0 || s.room === 'Unsorted');
    });
  };

  // Rename a section
  const renameSection = (sectionIdx: number, newRoom: Room) => {
    setSections(prev => {
      const next = prev.map(s => ({ ...s, photos: [...s.photos] }));
      const section = next[sectionIdx];
      for (const photo of section.photos) {
        photo.room = newRoom;
      }
      section.room = newRoom;
      return next;
    });
  };

  // Delete a photo
  const deletePhoto = (sectionIdx: number, photoIdx: number) => {
    setSections(prev => {
      const next = prev.map(s => ({ ...s, photos: [...s.photos] }));
      next[sectionIdx].photos.splice(photoIdx, 1);
      return next.filter(s => s.photos.length > 0);
    });
  };

  const hasUnsorted = sections.some(s => s.room === 'Unsorted' && s.photos.length > 0);
  const totalPhotos = sections.reduce((sum, s) => sum + s.photos.length, 0);
  const roomPhotos = totalPhotos - presenterPhotos.length;
  const canSubmit = !hasUnsorted && roomPhotos >= 3 && (!hasPresenter || presenterConsent);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const photos: Photo[] = [];
    let order = 1;
    for (const section of sections) {
      for (const photo of section.photos) {
        photos.push({ ...photo, order: order++ });
      }
    }

    sessionStorage.setItem('showhome-photos', JSON.stringify(photos));

    // Store presenter consent if applicable
    if (hasPresenter && presenterConsent) {
      const existing = sessionStorage.getItem('showhome-listing');
      const listing = existing ? JSON.parse(existing) : {};
      listing.presenterConsentAt = new Date().toISOString();
      sessionStorage.setItem('showhome-listing', JSON.stringify(listing));
    }

    router.push('/create/options');
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
                <span className="h-1 w-1 rounded-full bg-clay" /> Step 2 of 4
              </span>
              <h1 className="mt-5 text-balance text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                {detecting ? 'Detecting rooms…' : 'Check the room sorting'}
              </h1>
              <p className="mt-4 text-[15px] text-ink-3">
                {detecting
                  ? 'Our AI is identifying each room. This takes a few seconds.'
                  : 'We grouped your photos into rooms in walkthrough order. Drag to fix anything that looks wrong.'}
              </p>
            </div>

            {detecting && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-clay" />
                <p className="text-[13px] text-ink-3">Analysing {totalPhotos} photos…</p>
              </div>
            )}

            {!detecting && (
              <>
                {/* Unsorted warning */}
                {hasUnsorted && (
                  <div className="mt-8 rounded-2xl border border-clay/30 bg-clay-tint/30 p-4 text-center">
                    <p className="text-[14px] font-medium text-clay">
                      {sections.find(s => s.room === 'Unsorted')?.photos.length} photos need a room
                    </p>
                    <p className="mt-1 text-[13px] text-ink-3">
                      Move them to the correct section below before continuing.
                    </p>
                  </div>
                )}

                {/* Presenter section — separate, at the top */}
                {sections.filter(s => s.room === 'Presenter').map((section) => (
                  <div key="presenter" className="mt-8 overflow-hidden rounded-2xl border border-ink/15 bg-white">
                    <div className="flex items-center justify-between px-4 py-3 bg-paper-2/50">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold text-ink">👤 Presenter</span>
                      </div>
                      <span className="text-[12px] text-ink-3">{section.photos.length} photo{section.photos.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[13px] text-ink-2 mb-3">
                        This person will appear on camera presenting the property. Only the first photo is used.
                        {!hasPresenter && ' No presenter — video will have voiceover narration.'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {section.photos.map((photo, pIdx) => (
                          <div
                            key={photo.id}
                            draggable
                            onDragStart={() => {
                              const sIdx = sections.indexOf(section);
                              setDragItem({ sectionIdx: sIdx, photoIdx: pIdx });
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              const sIdx = sections.indexOf(section);
                              if (dragItem && (dragItem.sectionIdx !== sIdx || dragItem.photoIdx !== pIdx)) {
                                movePhoto(dragItem.sectionIdx, dragItem.photoIdx, sIdx, pIdx);
                                setDragItem({ sectionIdx: sIdx, photoIdx: pIdx });
                              }
                            }}
                            onDragEnd={() => setDragItem(null)}
                            className="group relative w-20 cursor-grab sm:w-24"
                          >
                            <img
                              src={photo.url}
                              alt=""
                              className="aspect-square w-full rounded-lg object-cover ring-2 ring-ink/20"
                            />
                            {pIdx === 0 && (
                              <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2 py-0.5 text-[9px] font-semibold text-paper whitespace-nowrap">
                                First used
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const sIdx = sections.indexOf(section);
                                deletePhoto(sIdx, pIdx);
                              }}
                              className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                            >×</button>
                            <select
                              value={photo.room}
                              onChange={(e) => {
                                const sIdx = sections.indexOf(section);
                                changePhotoRoom(sIdx, pIdx, e.target.value as Room);
                              }}
                              className="mt-1 w-full rounded border border-line bg-paper px-1 py-0.5 text-[10px] text-ink-2"
                            >
                              {ALL_ROOMS.filter(r => r !== 'Unsorted').map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                      {/* Presenter consent checkbox */}
                      {hasPresenter && (
                        <label className="mt-4 flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={presenterConsent}
                            onChange={(e) => setPresenterConsent(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-line accent-ink"
                          />
                          <span className="text-[13px] text-ink-2">
                            This person is me or has authorized me to use their image in this video.
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                ))}

                {!hasPresenter && !detecting && (
                  <div className="mt-8 rounded-2xl border border-line bg-white p-4">
                    <p className="text-[13px] text-ink-2">
                      No presenter photo. Video will have voiceover narration without anyone on camera.
                      To add a presenter, move a photo of the person presenting to the <strong>Presenter</strong> room.
                    </p>
                  </div>
                )}

                {/* Room sections */}
                <div className="mt-8 space-y-4">
                  {sections.filter(s => s.room !== 'Presenter').map((section, sIdx) => {
                    // Adjust index to account for Presenter section position
                    const realIdx = sections.indexOf(section);
                    return (
                      <div
                        key={section.room}
                        draggable
                        onDragStart={() => setDragSection(realIdx)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragSection !== null && dragSection !== realIdx) {
                            moveSection(dragSection, realIdx);
                            setDragSection(realIdx);
                          }
                        }}
                        onDragEnd={() => setDragSection(null)}
                        className={`overflow-hidden rounded-2xl border bg-white transition ${
                          section.room === 'Unsorted'
                            ? 'border-clay/40'
                            : dragSection === realIdx
                            ? 'border-ink shadow-lg'
                            : 'border-line'
                        }`}
                      >
                        {/* Section header */}
                        <div
                          className={`flex items-center justify-between px-4 py-3 ${
                            section.room === 'Unsorted' ? 'bg-clay-tint/40' : 'bg-paper-2/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="cursor-grab text-ink-3">⠿</span>
                            {editingRoom === section.room ? (
                              <select
                                value={section.room}
                                onChange={(e) => {
                                  renameSection(realIdx, e.target.value as Room);
                                  setEditingRoom(null);
                                }}
                                onBlur={() => setEditingRoom(null)}
                                className="rounded-lg border border-line bg-white px-2 py-1 text-[13px] font-semibold text-ink"
                                autoFocus
                              >
                                {ALL_ROOMS.filter(r => r !== 'Unsorted').map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingRoom(section.room)}
                                className="text-[13px] font-semibold text-ink hover:text-clay"
                              >
                                {section.room === 'Unsorted' ? '📁 Unsorted' : ROOM_LABELS[section.room]}
                              </button>
                            )}
                          </div>
                          <span className="text-[12px] text-ink-3">{section.photos.length} photo{section.photos.length !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Photos grid */}
                        <div className="flex flex-wrap gap-2 p-3">
                          {section.photos.map((photo, pIdx) => (
                            <div
                              key={photo.id}
                              draggable
                              onDragStart={() => setDragItem({ sectionIdx: realIdx, photoIdx: pIdx })}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (dragItem && (dragItem.sectionIdx !== realIdx || dragItem.photoIdx !== pIdx)) {
                                  movePhoto(dragItem.sectionIdx, dragItem.photoIdx, realIdx, pIdx);
                                  setDragItem({ sectionIdx: realIdx, photoIdx: pIdx });
                                }
                              }}
                              onDragEnd={() => setDragItem(null)}
                              className="group relative w-20 cursor-grab sm:w-24"
                            >
                              <img
                                src={photo.url}
                                alt=""
                                className="aspect-square w-full rounded-lg object-cover"
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); deletePhoto(realIdx, pIdx); }}
                                className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                              >×</button>
                              <select
                                value={photo.room}
                                onChange={(e) => changePhotoRoom(realIdx, pIdx, e.target.value as Room)}
                                className="mt-1 w-full rounded border border-line bg-paper px-1 py-0.5 text-[10px] text-ink-2"
                              >
                                {ALL_ROOMS.filter(r => r !== 'Unsorted').map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Walkthrough order hint */}
                <p className="mt-6 text-center text-[12px] text-ink-3">
                  Sections appear in walkthrough order: Exterior → Hallway → Living → Dining → Kitchen → Bedroom → Bathroom
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => router.push('/create/upload')}
                    className="flex-1 rounded-full border border-line-2 bg-white/70 px-6 py-3.5 text-[15px] font-medium text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                  >Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="flex-1 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper shadow-[0_1px_2px_rgba(13,14,16,.2),0_12px_28px_-12px_rgba(13,14,16,.55)] transition hover:-translate-y-0.5 hover:bg-[#1b1d20] disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    {hasUnsorted ? 'File all photos first' : hasPresenter && !presenterConsent ? 'Consent required for presenter' : 'Continue to options'}
                  </button>
                </div>
              </>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
