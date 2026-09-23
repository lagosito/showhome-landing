"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "../utils/cn";
import { Container, Reveal, SectionHead } from "./primitives";
import { demoImg, uploadShots } from "../data/media";

function Card({
  title,
  body,
  className,
  children,
  delay = 0,
}: {
  title?: string;
  body?: string;
  className?: string;
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(13,14,16,.03),0_30px_60px_-36px_rgba(13,14,16,.45)]">
        {children}
        {title && (
          <div className="mt-auto p-6 sm:p-7">
            <h3 className="text-[19px] font-semibold tracking-[-0.03em] text-ink sm:text-[21px]">
              {title}
            </h3>
            <p className="mt-2 max-w-[36ch] text-[14.5px] leading-relaxed text-ink-3">
              {body}
            </p>
          </div>
        )}
      </article>
    </Reveal>
  );
}

export function Benefits() {
  const t = useTranslations("Benefits");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  // Sync the play/pause icon with the real element state after mount
  // (autoplay can be delayed or blocked by the browser).
  useEffect(() => {
    const v = videoRef.current;
    if (v) setPlaying(!v.paused);
  }, []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHead
          eyebrow={t("eyebrow")}
          title={t("heading")}
          sub={t("subheading")}
        />

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {/* Save hours — headline on top, Professsionell auftreten at the bottom */}
          <Card
            title={t("card2Title")}
            body={t("card2Body")}
            className="md:col-span-3"
          >
            <div className="border-b border-line bg-white p-6 sm:p-7">
              <h3 className="text-[19px] font-semibold tracking-[-0.03em] text-ink sm:text-[21px]">
                {t("card1Title")}
              </h3>
              <p className="mt-2 max-w-[36ch] text-[14.5px] leading-relaxed text-ink-3">
                {t("card1Body")}
              </p>
            </div>
            <div className="overflow-hidden border-b border-line bg-paper-2/60 p-7">
              <div className="flex items-end gap-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
                    {t("labelClassic")}
                  </p>
                  <p className="mt-1 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold tracking-[-0.04em] text-ink-3 line-through decoration-clay/60 decoration-2">
                    {t("timeClassic")}
                  </p>
                </div>
                <svg viewBox="0 0 20 20" className="mb-3 h-4 w-4 text-line-2" aria-hidden="true">
                  <path d="M3 10h14m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-clay">
                    {t("labelHomemotion")}
                  </p>
                  <p className="mt-1 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold tracking-[-0.04em] text-ink">
                    {t("timeHomemotion")}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[
                  { l: t("bar1"), w: "78%", muted: true },
                  { l: t("bar2"), w: "62%", muted: true },
                  { l: t("bar3"), w: "88%", muted: true },
                  { l: t("bar4"), w: "14%", muted: false },
                ].map((r) => (
                  <div key={r.l} className="flex items-center gap-3">
                    <span className="w-[128px] shrink-0 text-[11.5px] text-ink-3">
                      {r.l}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          r.muted ? "bg-line-2" : "bg-clay",
                        )}
                        style={{ width: r.w }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Look professional — video fills the whole card */}
          <Card
            className="md:col-span-3"
            delay={80}
          >
            <div className="relative min-h-[320px] flex-1 overflow-hidden bg-ink">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                aria-label="Fertige Immobilientour mit Color Grading und langsamer Kamerafahrt"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={demoImg("professionell-tour.mp4")} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button
                type="button"
                onClick={toggleSound}
                aria-label={muted ? t("soundOn") : t("soundOff")}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {muted ? (
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 8v4h3l4 3V5L7 8H4Z" />
                    <path d="m14 8 4 4m0-4-4 4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 8v4h3l4 3V5L7 8H4Z" />
                    <path d="M14 7.5a3.5 3.5 0 0 1 0 5M16 5.5a6.5 6.5 0 0 1 0 9" />
                  </svg>
                )}
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                <div className="flex gap-2">
                  {["source-makler.jpg", "source-haus.jpg", "source-esszimmer.jpg"].map((f) => (
                    <img
                      key={f}
                      src={demoImg(f)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-auto rounded-lg border border-white/40 object-cover shadow-[0_8px_24px_-12px_rgba(0,0,0,.8)] sm:h-16"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? t("pauseLabel") : t("playLabel")}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/90 text-ink transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {playing ? (
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                      <rect x="4" y="3" width="2.6" height="10" rx="0.8" fill="currentColor" />
                      <rect x="9.4" y="3" width="2.6" height="10" rx="0.8" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" className="ml-0.5 h-3.5 w-3.5" aria-hidden="true">
                      <path d="M5 3.4v9.2a.6.6 0 0 0 .92.5l7.2-4.6a.6.6 0 0 0 0-1L5.92 2.9a.6.6 0 0 0-.92.5Z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </Card>

          {/* List faster */}
          <Card
            title={t("card3Title")}
            body={t("card3Body")}
            className="md:col-span-2"
            delay={40}
          >
            <div className="border-b border-line bg-paper-2/60 p-7">
              <div className="relative grid grid-cols-2 gap-2.5">
                <figure className="relative overflow-hidden rounded-2xl border border-line">
                  <img
                    src={demoImg("clean-before.jpg")}
                    alt="Wohnzimmer vor der Optimierung, mit Wäscheständer und Unordnung"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <figcaption className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                    {t("beforeBadge")}
                  </figcaption>
                </figure>
                <figure className="relative overflow-hidden rounded-2xl border border-line">
                  <img
                    src={demoImg("clean-after.jpg")}
                    alt="Dasselbe Wohnzimmer nach der Optimierung, leer und aufgeräumt"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <figcaption className="absolute left-2 top-2 rounded-full bg-clay px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                    {t("afterBadge")}
                  </figcaption>
                </figure>
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-white shadow-sm"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-ink" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10h14m0 0-5-5m5 5-5 5" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-[11.5px] font-medium text-ink-3">
                {t("cleanCaption")}
              </p>
            </div>
          </Card>

          {/* Stand out */}
          <Card
            title={t("card4Title")}
            body={t("card4Body")}
            className="md:col-span-2"
            delay={110}
          >
            <div className="border-b border-line bg-paper-2/60 p-7">
              <div className="space-y-2.5">
                {[
                  { l: t("barPhotos"), v: 32, tone: "muted" },
                  { l: t("barVideo"), v: 100, tone: "clay" },
                ].map((r) => (
                  <div key={r.l}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-[11.5px] text-ink-3">{r.l}</span>
                      <span className="font-mono text-[11px] text-ink">
                        {r.v === 100 ? "3,1×" : "1×"}
                      </span>
                    </div>
                    <span className="block h-8 overflow-hidden rounded-lg bg-white">
                      <span
                        className={cn(
                          "block h-full rounded-lg",
                          r.tone === "clay" ? "bg-clay" : "bg-line-2",
                        )}
                        style={{ width: `${r.v}%` }}
                      />
                    </span>
                  </div>
                ))}
                <p className="pt-1 text-[11px] text-ink-3">
                  {t("disclaimer")}
                </p>
              </div>
            </div>
          </Card>

          {/* Scale */}
          <Card
            title={t("card5Title")}
            body={t("card5Body")}
            className="md:col-span-2"
            delay={170}
          >
            <div className="border-b border-line bg-paper-2/60 p-7">
              <div className="grid grid-cols-4 gap-1.5">
                {uploadShots.slice(0, 12).map((s, i) => (
                  <div
                    key={s.file}
                    className="relative overflow-hidden rounded-md"
                    style={{ opacity: 1 - i * 0.055 }}
                  >
                    <img
                      src={demoImg(s.file)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11.5px] font-medium text-ink-3">
                {t("caption")}
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
