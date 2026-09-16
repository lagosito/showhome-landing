import { ArrowIcon, Button, Container, Reveal } from "./primitives";

export function Hero() {
  const steps = [
    {
      k: "01",
      t: "Hochladen",
      d: "Fotos oder Inseratslink",
    },
    {
      k: "02",
      t: "Erstellen",
      d: "KI analysiert deine Immobilie",
    },
    {
      k: "03",
      t: "Video fertig",
      d: "Fertiges Video herunterladen",
    },
  ];

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Video as full-bleed hero background */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

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
              Lade deine Fotos hoch, wähle Avatar, Voice-over oder keinen Sprecher
              – und Homemotion erstellt dein fertiges Immobilienvideo.
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
            <div className="mt-10 grid w-full max-w-[860px] grid-cols-3 gap-2 text-left">
              {steps.map((s) => (
                <div
                  key={s.k}
                  className="flex items-center gap-2 rounded-xl bg-black/40 px-3 py-3 text-left backdrop-blur-sm sm:gap-4 sm:px-6 sm:py-5"
                >
                  <span className="shrink-0 font-sans text-[16px] font-bold leading-none tracking-tight text-white/25 sm:text-[48px]">
                    {s.k}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold leading-snug text-white sm:text-[13px]">
                      {s.t}
                    </p>
                    <p className="mt-0.5 hidden text-[10.5px] leading-snug text-white/55 sm:block sm:text-[11.5px]">
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
