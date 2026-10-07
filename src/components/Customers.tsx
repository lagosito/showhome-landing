"use client";

import { useTranslations } from "next-intl";
import { cn } from "../utils/cn";
import { ArrowIcon, Button, Container, Reveal } from "./primitives";
import { demoImg } from "../data/media";

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
      img: "customers-owner.jpg",
      alt: "Wohnzimmer mit Ausblick ins Grüne und warmem Tageslicht",
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
      img: "customers-agent.jpg",
      alt: "Immobilienmakler mit verschränkten Armen vor neutralem Hintergrund",
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
      img: "customers-company.jpg",
      alt: "Mehrgeschossiges Wohngebäude mit Holzfassade und Balkonen",
      statLabel: t("companyStatLabel"),
      statValue: t("companyStatValue"),
      statDesc: t("companyStatDesc"),
    },
  ];

  return (
    <section className="border-y border-line bg-white py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {blocks.map((b, i) => (
            <Reveal key={b.id} delay={i * 90} className="h-full">
              <article
                id={b.id}
                className={cn(
                  "group flex h-full scroll-mt-24 flex-col overflow-hidden rounded-3xl border border-line bg-white transition-colors duration-300",
                )}
              >
                <div className="overflow-hidden border-b border-line bg-paper-2">
                  <img
                    src={demoImg(b.img)}
                    alt={b.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line-2 bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2">
                    {b.eyebrow}
                  </span>

                  <h3 className="mt-4 text-balance text-[21px] font-semibold leading-[1.12] tracking-[-0.035em] text-ink sm:text-[23px]">
                    {b.title}
                  </h3>

                  <p className="mt-3 text-pretty text-[14.5px] leading-relaxed text-ink-3">
                    {b.body}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {b.bullets.map((x) => (
                      <li key={x} className="flex items-start gap-2.5">
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
                        <span className="text-[14px] leading-snug text-ink-2">{x}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-4">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-clay">
                      {b.statLabel}
                    </p>
                    <p className="mt-1 text-[19px] font-semibold tracking-[-0.04em] text-ink">
                      {b.statValue}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-3">{b.statDesc}</p>
                  </div>

                  <div className="mt-6 pt-1">
                    <Button
                      href="#cta"
                      className="w-full"
                      variant={i === 1 ? "primary" : "secondary"}
                      icon={<ArrowIcon />}
                    >
                      {b.cta}
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
