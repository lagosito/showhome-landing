"use client";

import { useTranslations } from "next-intl";
import { Container, Reveal } from "./primitives";
import { demoImg, uploadShots } from "../data/media";

function PhotoFolder() {
  const t = useTranslations("BeforeAfter");
  const files = uploadShots.slice(0, 9);
  return (
    <div className="overflow-hidden rounded-[20px] border border-white/12 bg-[#141518] shadow-[0_40px_80px_-50px_rgba(0,0,0,.9)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
        </span>
        <span className="ml-2 truncate text-[12px] font-medium text-white/55">
          Fotos / Wohnung_Verde
        </span>
        <span className="ml-auto font-mono text-[10.5px] text-white/35">
          {t("folderCount")}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 p-4 sm:p-5">
        {files.map((f, i) => (
          <div key={f.file} className="group">
            <div className="relative overflow-hidden rounded-md bg-black/40">
              <img
                src={demoImg(f.file)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover opacity-70 grayscale-[35%] transition duration-500 group-hover:opacity-90 group-hover:grayscale-0"
              />
            </div>
            <p className="mt-1.5 truncate font-mono text-[9.5px] text-white/35">
              IMG_{4021 + i * 7}.JPG
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BeforeAfter() {
  const t = useTranslations("BeforeAfter");

  return (
    <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_70%_0%,rgba(176,84,46,.16),transparent_60%)]"
      />
      <Container className="relative">
        <div className="max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-clay">
              <span className="h-1 w-1 rounded-full bg-clay" aria-hidden="true" />
              {t("eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="mt-5 text-balance text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              {t("heading1")}
              <span className="text-white/45"> {t("heading2")}</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[1fr_auto_1.25fr] lg:gap-6">
          <Reveal>
            <p className="mb-4 text-[14px] font-medium text-white/55">
              {t("folderLabel")}
            </p>
            <PhotoFolder />
          </Reveal>

          <Reveal delay={120} className="flex justify-center lg:px-2">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] backdrop-blur">
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 rotate-90 text-white lg:rotate-0"
                aria-hidden="true"
              >
                <path
                  d="M3 10h14m0 0-5.5-5.5M17 10l-5.5 5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Reveal>

          <Reveal delay={200}>
            <p className="mb-4 text-[14px] font-medium text-white">
              {t("resultLabel")}
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141518] shadow-[0_20px_60px_-30px_rgba(0,0,0,.8)]">
              <div className="relative">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full"
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink">
                      <svg viewBox="0 0 16 16" className="ml-0.5 h-3 w-3" aria-hidden="true">
                        <path d="M5 3.4v9.2a.6.6 0 0 0 .92.5l7.2-4.6a.6.6 0 0 0 0-1L5.92 2.9a.6.6 0 0 0-.92.5Z" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="text-[11.5px] font-medium text-white/90">
                      {t("videoLabel")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                t("tag1"),
                t("tag2"),
                t("tag3"),
                t("tag4"),
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[12px] text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
