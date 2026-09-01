import { cn } from "../utils/cn";
import { ArrowIcon, Button, Container, Reveal } from "./primitives";
import { IMG, px } from "../data/media";

type Block = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  bullets: string[];
  img: number;
  alt: string;
};

const blocks: Block[] = [
  {
    id: "owners",
    eyebrow: "For Property Owners",
    title: "Make your property impossible to ignore.",
    body: "You don't need professional equipment or editing skills. Upload your photos and create a video that makes your apartment feel real before someone even visits.",
    cta: "Create a property video",
    bullets: [
      "No videographer, no rental fees",
      "Ready for every major portal",
      "One property, one simple price",
    ],
    img: IMG.owners,
    alt: "Warm, inviting living space of a private apartment",
  },
  {
    id: "agents",
    eyebrow: "For Real-Estate Agents",
    title: "Turn every listing into a better presentation.",
    body: "Create professional property tours without spending hours filming and editing. Spend your time selling properties, not producing videos.",
    cta: "For agents",
    bullets: [
      "Unlimited tours on one subscription",
      "Your logo, colours and contact card",
      "Portrait cuts for social, automatically",
    ],
    img: IMG.agents,
    alt: "Modern apartment interior photographed for a listing",
  },
  {
    id: "enterprise",
    eyebrow: "For Real-Estate Companies",
    title: "Video tours at scale.",
    body: "Give your entire team a simple way to create consistent, professional property videos across your portfolio.",
    cta: "Talk to sales",
    bullets: [
      "Team workspaces & shared templates",
      "Bulk rendering and API access",
      "SSO, roles and centralised billing",
    ],
    img: IMG.teams,
    alt: "Minimalist architectural facade of a residential building",
  },
];

export function Customers() {
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
                      {b.id === "owners"
                        ? "1 property"
                        : b.id === "agents"
                          ? "This month"
                          : "Portfolio"}
                    </p>
                    <p className="mt-1.5 text-[22px] font-semibold tracking-[-0.04em] text-ink">
                      {b.id === "owners"
                        ? "1 tour · 3 min"
                        : b.id === "agents"
                          ? "38 tours"
                          : "1,240 tours"}
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-3">
                      {b.id === "owners"
                        ? "From upload to download"
                        : b.id === "agents"
                          ? "Created without a camera"
                          : "Across 14 offices"}
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
