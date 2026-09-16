import { ArrowIcon, Button, Container, Reveal } from "./primitives";
import { TourPlayer } from "./TourPlayer";
import { tourShots } from "../data/media";

export function Hero() {
  const steps = [
    {
      k: "01",
      t: "Fotos rein",
      d: "Oder Link zum Inserat. Jede Reihenfolge.",
    },
    {
      k: "02",
      t: "Homemotion analysiert",
      d: "Avatar wählen oder nur Voiceover.",
    },
    {
      k: "03",
      t: "Video raus",
      d: "Fertige Tour, bereit zur Veröffentlichung.",
    },
  ];

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
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-3.5 text-[12.5px] font-medium text-white/90 backdrop-blur-md">
              <span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink">
                Neu
              </span>
              KI-Raumabfolge für Immobilientouren
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 max-w-3xl text-balance text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
              Aus Immobilienfotos werden professionelle Videotouren.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-white/80 sm:text-[19px]">
              Lade deine Fotos hoch — ohne Dreh, ohne Kamera, ohne Schnitt.
              Homemotion erstellt daraus ein hochwertiges Immobilienvideo.
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

          {/* Three steps — inline over the video */}
          <Reveal delay={380}>
            <div className="mt-8 grid w-full max-w-[860px] grid-cols-1 gap-2 text-left sm:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.k}
                  className="flex items-start gap-4 rounded-xl bg-black/40 px-5 py-4 text-left backdrop-blur-sm sm:px-6 sm:py-5"
                >
                  <span className="shrink-0 font-sans text-[40px] font-bold leading-none tracking-tight text-white/25 sm:text-[48px]">
                    {s.k}
                  </span>
                  <div className="min-w-0 pt-1.5">
                    <p className="text-[12px] font-semibold leading-snug text-white sm:text-[13px]">
                      {s.t}
                    </p>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-white/55 sm:text-[11.5px]">
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
