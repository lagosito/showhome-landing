import { ArrowIcon, Button, Container, Reveal } from "./primitives";
import { TourPlayer } from "./TourPlayer";
import { tourShots } from "../data/media";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Video as full-bleed hero background */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* TourPlayer fills the entire hero */}
        <div className="absolute inset-0">
          <TourPlayer
            shots={tourShots}
            className="h-full w-full rounded-none ring-0 shadow-none"
            minimal
          />
        </div>

        {/* Gradient overlays for text readability */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70"
        />

        {/* Content overlaid on video */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-3.5 text-[12.5px] font-medium text-white/90 backdrop-blur-md">
              <span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink">
                Neu
              </span>
              KI-Raumabfolge für Immobilientouren
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 max-w-3xl text-balance text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
              Aus Immobilienfotos werden professionelle Videotouren.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-white/80 sm:text-[19px]">
              Lade deine Fotos hoch. ShowHome erstellt daraus ein hochwertiges
              Immobilienvideo, das Lust macht, jeden Raum zu entdecken.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                href="#cta"
                size="lg"
                className="w-full sm:w-auto"
                icon={<ArrowIcon />}
              >
                Erstes Video erstellen
              </Button>
              <Button
                href="#how"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto !bg-white/15 !text-white hover:!bg-white/25"
                icon={
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                    <path
                      d="M5.5 3.6v8.8a.5.5 0 0 0 .77.42l6.9-4.4a.5.5 0 0 0 0-.84l-6.9-4.4a.5.5 0 0 0-.77.42Z"
                      fill="currentColor"
                    />
                  </svg>
                }
              >
                So funktioniert&apos;s
              </Button>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-6 text-[13.5px] font-medium tracking-[-0.01em] text-white/60">
              Kein Dreh <span className="mx-1.5">·</span> Keine
              Kamera <span className="mx-1.5">·</span> Kein
              Videoschnitt
            </p>
          </Reveal>
        </div>
      </div>

      {/* Three compact steps below the hero video */}
      <Container>
        <Reveal delay={100}>
          <div className="relative -mt-10 z-20 mx-auto max-w-[980px] overflow-hidden rounded-2xl border border-line bg-white/80 shadow-[0_2px_4px_rgba(13,14,16,.04),0_24px_50px_-28px_rgba(13,14,16,.35)] backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {[
                {
                  k: "01",
                  t: "Fotos rein",
                  d: "Jede Galerie. Jede Reihenfolge.",
                },
                {
                  k: "02",
                  t: "ShowHome analysiert",
                  d: "Räume, Abfolge, Tempo, Bewegung.",
                },
                {
                  k: "03",
                  t: "Video raus",
                  d: "Eine fertige Tour, bereit zur Veröffentlichung.",
                },
              ].map((s, i) => (
                <div
                  key={s.k}
                  className={`px-6 py-5 ${i < 2 ? "border-b sm:border-b-0 sm:border-r border-line" : ""}`}
                >
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[12px] font-semibold text-clay">
                      {s.k}
                    </span>
                    <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                      {s.t}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">
                    {s.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
