import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { px, type Shot } from "../data/media";

const SHOT_MS = 4200;

export function TourPlayer({
  shots,
  className,
  title = "Maison Verde · 3-room apartment",
  compact = false,
}: {
  shots: Shot[];
  className?: string;
  title?: string;
  compact?: boolean;
}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [p, setP] = useState(0); // 0..1 progress within current shot
  const raf = useRef<number | null>(null);
  const start = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    start.current = performance.now() - p * SHOT_MS;
    const tick = (t: number) => {
      const elapsed = t - start.current;
      const ratio = elapsed / SHOT_MS;
      if (ratio >= 1) {
        setP(0);
        setI((v) => (v + 1) % shots.length);
        start.current = t;
      } else {
        setP(ratio);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, i, shots.length]);

  const total = shots.length * (SHOT_MS / 1000);
  const current = (i + p) * (SHOT_MS / 1000);
  const fmt = (s: number) =>
    `0:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <figure
      className={cn(
        "group/player relative isolate overflow-hidden rounded-[20px] bg-ink shadow-[0_2px_4px_rgba(13,14,16,.08),0_40px_80px_-40px_rgba(13,14,16,.45)] ring-1 ring-ink/10",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
        {shots.map((s, idx) => (
          <img
            key={s.id}
            src={px(s.id, 1280, 720)}
            alt={s.alt}
            loading={idx === 0 ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-out",
              idx === i ? "opacity-100" : "opacity-0",
            )}
            style={
              idx === i && playing
                ? { animation: "kenburns 9s ease-out forwards" }
                : undefined
            }
          />
        ))}

        {/* cinematic vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(8,9,10,.82)_0%,rgba(8,9,10,.18)_34%,rgba(8,9,10,0)_58%,rgba(8,9,10,.28)_100%)]" />

        {/* top row */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3.5 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium tracking-[-0.01em] text-white/95 backdrop-blur-md ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-clay animate-sheen" />
              {shots[i].room}
            </span>
            {!compact && (
              <span className="hidden rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md ring-1 ring-white/15 sm:inline">
                {String(i + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
              </span>
            )}
          </div>
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-md ring-1 ring-white/15">
            ShowHome
          </span>
        </div>

        {/* center play affordance */}
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? "Pause tour preview" : "Play tour preview"}
          className="absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-white"
        >
          <span
            className={cn(
              "grid h-14 w-14 place-items-center rounded-full bg-white/92 text-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,.6)] backdrop-blur transition-all duration-300 sm:h-16 sm:w-16",
              playing
                ? "scale-90 opacity-0 group-hover/player:scale-100 group-hover/player:opacity-100"
                : "scale-100 opacity-100",
            )}
          >
            {playing ? (
              <svg viewBox="0 0 16 16" className="h-5 w-5" aria-hidden="true">
                <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor" />
                <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="ml-0.5 h-5 w-5" aria-hidden="true">
                <path d="M5 3.4v9.2a.6.6 0 0 0 .92.5l7.2-4.6a.6.6 0 0 0 0-1L5.92 2.9a.6.6 0 0 0-.92.5Z" fill="currentColor" />
              </svg>
            )}
          </span>
        </button>

        {/* bottom control bar */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
          {!compact && (
            <p className="mb-3 max-w-[70%] truncate text-[13px] font-medium tracking-[-0.01em] text-white/90 sm:text-[15px]">
              {title}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? "Pause" : "Play"}
              className="shrink-0 text-white/90 transition hover:text-white"
            >
              {playing ? (
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor" />
                  <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <path d="M5 3.4v9.2a.6.6 0 0 0 .92.5l7.2-4.6a.6.6 0 0 0 0-1L5.92 2.9a.6.6 0 0 0-.92.5Z" fill="currentColor" />
                </svg>
              )}
            </button>

            {/* chapter segments */}
            <div className="flex flex-1 items-center gap-1">
              {shots.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Jump to ${s.room}`}
                  onClick={() => {
                    setI(idx);
                    setP(0);
                  }}
                  className="group/seg h-3 flex-1 cursor-pointer"
                >
                  <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/28 transition-all group-hover/seg:bg-white/45">
                    <span
                      className="block h-full rounded-full bg-white"
                      style={{
                        width:
                          idx < i ? "100%" : idx === i ? `${p * 100}%` : "0%",
                      }}
                    />
                  </span>
                </button>
              ))}
            </div>

            <span className="shrink-0 font-mono text-[11px] tabular-nums text-white/75">
              {fmt(current)} / {fmt(total)}
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
