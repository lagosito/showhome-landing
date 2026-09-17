"use client";

import { useTranslations } from "next-intl";
import { cn } from "../utils/cn";
import { ArrowIcon, Button, Container, Reveal } from "./primitives";
import { IMG, px } from "../data/media";

export function Customers() {
  const t = useTranslations("Customers");

  const blocks = [
    {
      id: "owners",
      eyebrow: t("ownerEyebrow"),
      title: t("ownerHeading"),
      body: t("ownerBody"),
      cta: t("ownerCta"),
      bullets: [t("ownerBullet1"), t("ownerBullet2"), t("ownerBullet3")],
      img: IMG.owners,
      alt: "Warmer, einladender Wohnbereich einer Privatwohnung",
      statLabel: t("ownerStatLabel"),
      statValue: t("ownerStatValue"),
      statDesc: t("ownerStatDesc"),
    },
    {
      id: "agents",
      eyebrow: t("agentEyebrow"),
      title: t("agentHeading"),
      body: t("agentBody"),
      cta: t("agentCta"),
      bullets: [t("agentBullet1"), t("agentBullet2"), t("agentBullet3")],
      img: IMG.agents,
      alt: "Modernes Wohnungsinterieur, fotografiert für ein Inserat",
      statLabel: t("agentStatLabel"),
      statValue: t("agentStatValue"),
      statDesc: t("agentStatDesc"),
    },
    {
      id: "enterprise",
      eyebrow: t("companyEyebrow"),
      title: t("companyHeading"),
      body: t("companyBody"),
      cta: t("companyCta"),
      bullets: [t("companyBullet1"), t("companyBullet2"), t("companyBullet3")],
      img: IMG.teams,
      alt: "Minimalistische Fassade eines Wohngebäudes",
      statLabel: t("companyStatLabel"),
      statValue: t("companyStatValue"),
      statDesc: t("companyStatDesc"),
    },
  ];

  return (
    <section className="border-y border-line bg-white">
      <Container>
        {blocks.map((b, i) => {
          const flip = i % 2 === 1;
          return (
            <div
              key={b.id}
              id={b.id}
              className={cn(
                "grid scroll-mt-24 items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24",
                i > 0 && "border-t border-line",
              )}
            >
              <Reveal className={cn(flip && "lg:order-2")}>
                <div className="relative">
                  <div className="overflow-hidden rounded-3xl border border-line bg-paper-2">
                    <img
                      src={px(b.img, 1000, 750)}
                      alt={b.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-5 hidden w-[210px] rounded-2xl border border-line bg-white/95 p-4 shadow-[0_20px_44px_-26px_rgba(13,14,16,.45)] backdrop-blur sm:block",
                      flip ? "-right-5" : "-left-5",
                    )}
                  >
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-clay">
                      {b.statLabel}
                    </p>
                    <p className="mt-1.5 text-[22px] font-semibold tracking-[-0.04em] text-ink">
                      {b.statValue}
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-3">
                      {b.statDesc}
                    </p>
                  </div>
                </div>
              </Reveal>

              <div className={cn(flip && "lg:order-1")}>
                <Reveal delay={80}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-paper px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-2">
                    {b.eyebrow}
                  </span>
                </Reveal>
                <Reveal delay={130}>
                  <h3 className="mt-5 text-balance text-[clamp(1.85rem,3.6vw,2.7rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
                    {b.title}
                  </h3>
                </Reveal>
                <Reveal delay={180}>
                  <p className="mt-5 max-w-[46ch] text-pretty text-[16px] leading-relaxed text-ink-3">
                    {b.body}
                  </p>
                </Reveal>
                <Reveal delay={230}>
                  <ul className="mt-7 space-y-3">
                    {b.bullets.map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <span className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-clay-tint">
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-clay" aria-hidden="true">
                            <path
                              d="M2.4 6.2 4.9 8.7 9.6 3.8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="text-[14.5px] text-ink-2">{x}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={280}>
                  <div className="mt-9">
                    <Button
                      href="#cta"
                      size="lg"
                      variant={i === 1 ? "primary" : "secondary"}
                      icon={<ArrowIcon />}
                    >
                      {b.cta}
                    </Button>
                  </div>
                </Reveal>
              </div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
