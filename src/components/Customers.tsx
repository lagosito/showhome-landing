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
    eyebrow: "Für Eigentümer",
    title: "Mach deine Immobilie unübersehbar.",
    body: "Du brauchst weder Profi-Equipment noch Schnittkenntnisse. Lade deine Fotos hoch und erstelle ein Video, das deine Wohnung erlebbar macht, noch bevor jemand zur Besichtigung kommt.",
    cta: "Immobilienvideo erstellen",
    bullets: [
      "Kein Videograf, keine Mietkosten",
      "Bereit für alle großen Portale",
      "Eine Immobilie, ein einfacher Preis",
    ],
    img: IMG.owners,
    alt: "Warmer, einladender Wohnbereich einer Privatwohnung",
  },
  {
    id: "agents",
    eyebrow: "Für Immobilienmakler",
    title: "Mach aus jedem Inserat eine bessere Präsentation.",
    body: "Erstelle professionelle Immobilientouren, ohne stundenlang zu drehen und zu schneiden. Nutze deine Zeit zum Verkaufen, nicht zum Videoproduzieren.",
    cta: "Für Makler",
    bullets: [
      "Unbegrenzte Touren in einem Abo",
      "Dein Logo, deine Farben und deine Kontaktkarte",
      "Hochformat-Schnitte für Social Media, automatisch",
    ],
    img: IMG.agents,
    alt: "Modernes Wohnungsinterieur, fotografiert für ein Inserat",
  },
  {
    id: "enterprise",
    eyebrow: "Für Immobilienunternehmen",
    title: "Videotouren im großen Maßstab.",
    body: "Gib deinem ganzen Team eine einfache Möglichkeit, einheitliche, professionelle Immobilienvideos für das gesamte Portfolio zu erstellen.",
    cta: "Vertrieb kontaktieren",
    bullets: [
      "Team-Workspaces & gemeinsame Vorlagen",
      "Sammel-Rendering und API-Zugang",
      "SSO, Rollen und zentrale Abrechnung",
    ],
    img: IMG.teams,
    alt: "Minimalistische Fassade eines Wohngebäudes",
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
                        ? "1 Immobilie"
                        : b.id === "agents"
                          ? "Diesen Monat"
                          : "Portfolio"}
                    </p>
                    <p className="mt-1.5 text-[22px] font-semibold tracking-[-0.04em] text-ink">
                      {b.id === "owners"
                        ? "1 Tour · 3 Min."
                        : b.id === "agents"
                          ? "38 Touren"
                          : "1.240 Touren"}
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-3">
                      {b.id === "owners"
                        ? "Vom Upload bis zum Download"
                        : b.id === "agents"
                          ? "Ohne Kamera erstellt"
                          : "In 14 Büros"}
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
