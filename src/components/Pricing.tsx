"use client";

import { useTranslations } from "next-intl";
import { cn } from "../utils/cn";
import { ArrowIcon, Button, Container, Reveal, SectionHead } from "./primitives";

function Check({ dark }: { dark?: boolean }) {
  return (
    <span
      className={cn(
        "mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full",
        dark ? "bg-white/15" : "bg-clay-tint",
      )}
    >
      <svg viewBox="0 0 12 12" className={cn("h-2.5 w-2.5", dark ? "text-white" : "text-clay")} aria-hidden="true">
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
  );
}

export function Pricing() {
  const t = useTranslations("Pricing");

  const plans = [
    {
      name: "Starter",
      for: t("ownerFor"),
      price: "XX €",
      unit: t("perMonth"),
      note: t("ownerNote"),
      cta: t("ownerCta"),
      variant: "secondary" as const,
      features: [
        t("ownerF1"),
        t("ownerF2"),
        t("ownerF3"),
        t("ownerF4"),
        t("ownerF5"),
      ],
    },
    {
      name: "Professional",
      for: t("agentFor"),
      price: "XX €",
      unit: t("perMonth"),
      note: t("agentNote"),
      cta: t("agentCta"),
      variant: "light" as const,
      features: [
        t("agentF1"),
        t("agentF2"),
        t("agentF3"),
        t("agentF4"),
        t("agentF5"),
        t("agentF6"),
      ],
    },
    {
      name: "Enterprise",
      for: t("companyFor"),
      price: t("companyPrice"),
      unit: "",
      note: t("companyNote"),
      cta: t("companyCta"),
      variant: "secondary" as const,
      features: [
        t("companyF1"),
        t("companyF2"),
        t("companyF3"),
        t("companyF4"),
        t("companyF5"),
        t("companyF6"),
      ],
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-20 border-t border-line bg-paper-2/40 py-20 sm:py-28">
      <Container>
        <SectionHead
          eyebrow={t("eyebrow")}
          title={t("heading")}
          sub={t("subheading")}
          align="center"
        />

        <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
          {plans.map((p, i) => {
            const featured = i === 1;
            return (
              <Reveal key={p.name} delay={i * 100} className="h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-500 sm:p-8",
                    featured
                      ? "border-ink bg-ink text-paper shadow-[0_2px_4px_rgba(13,14,16,.1),0_40px_80px_-40px_rgba(13,14,16,.7)] lg:-mt-5 lg:pb-10 lg:pt-10"
                      : "border-line bg-white hover:-translate-y-1 hover:shadow-[0_24px_50px_-32px_rgba(13,14,16,.4)]",
                  )}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-clay px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white">
                      {t("recommended")}
                    </span>
                  )}

                  <h3
                    className={cn(
                      "text-[19px] font-semibold tracking-[-0.03em]",
                      featured ? "text-paper" : "text-ink",
                    )}
                  >
                    {p.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-[13.5px]",
                      featured ? "text-white/60" : "text-ink-3",
                    )}
                  >
                    {p.for}
                  </p>

                  <div className="mt-7 flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-[clamp(2.2rem,4vw,2.9rem)] font-semibold tracking-[-0.045em]",
                        featured ? "text-paper" : "text-ink",
                      )}
                    >
                      {p.price}
                    </span>
                    <span
                      className={cn(
                        "text-[15px] font-medium",
                        featured ? "text-white/55" : "text-ink-3",
                      )}
                    >
                      {p.unit}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-[12.5px]",
                      featured ? "text-white/50" : "text-ink-3",
                    )}
                  >
                    {p.note}
                  </p>

                  <div className={cn("my-7 h-px", featured ? "bg-white/12" : "bg-line")} />

                  <ul className="space-y-3.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check dark={featured} />
                        <span
                          className={cn(
                            "text-[14px] leading-snug",
                            featured ? "text-white/85" : "text-ink-2",
                          )}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 pt-1">
                    <Button
                      href="#cta"
                      size="lg"
                      variant={p.variant}
                      className="w-full"
                      icon={<ArrowIcon />}
                    >
                      {p.cta}
                    </Button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 text-center text-[13px] text-ink-3">
            {t("disclaimer")}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
