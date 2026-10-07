"use client";

import { useTranslations } from "next-intl";
import { ArrowIcon, Button, Container, Reveal } from "./primitives";
import { IMG, px } from "../data/media";

export function FinalCTA() {
  const t = useTranslations("FinalCTA");

  return (
    <section id="cta" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
      <Container className="px-0 sm:px-0">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[28px] bg-ink px-6 py-16 text-center text-paper sm:rounded-[36px] sm:px-12 sm:py-24">
            <img
              src={px(IMG.exteriorNight, 1600, 900)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.28]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_50%_0%,rgba(13,14,16,.55),rgba(13,14,16,.92))]"
            />

            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-clay animate-sheen" />
              {t("badge")}
            </span>

            <h2 className="mx-auto mt-7 max-w-[19ch] text-balance text-[clamp(2.1rem,5.4vw,4rem)] font-semibold leading-[1.0] tracking-[-0.045em]">
              {t("heading")}
            </h2>

            <p className="mx-auto mt-6 max-w-lg text-pretty text-[16.5px] leading-relaxed text-white/65 sm:text-[18px]">
              {t("subtitle")}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="#top" size="lg" variant="light" className="w-full sm:w-auto" icon={<ArrowIcon />}>
                {t("cta")}
              </Button>
              <Button
                href="#enterprise"
                size="lg"
                className="w-full border border-white/18 bg-white/[0.06] text-paper backdrop-blur hover:bg-white/[0.12] sm:w-auto"
                variant="ghost"
              >
                {t("secondary")}
              </Button>
            </div>

            <p className="mt-7 text-[13px] text-white/45">
              {t("disclaimer")}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
