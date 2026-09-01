import { Container, Reveal } from "./primitives";
import { TourPlayer } from "./TourPlayer";
import { px, tourShots, uploadShots } from "../data/media";

function PhotoFolder() {
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
          Photos / Apartment_Verde
        </span>
        <span className="ml-auto font-mono text-[10.5px] text-white/35">
          24 items
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 p-4 sm:p-5">
        {files.map((f, i) => (
          <div key={f.id} className="group">
            <div className="relative overflow-hidden rounded-md bg-black/40">
              <img
                src={px(f.id, 260, 195)}
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
  const shots = [...tourShots.slice(2), ...tourShots.slice(0, 2)];
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
              Before / After
            </span>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="mt-5 text-balance text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              Your photos already have the story.
              <span className="text-white/45"> ShowHome tells it.</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[1fr_auto_1.25fr] lg:gap-6">
          <Reveal>
            <p className="mb-4 text-[14px] font-medium text-white/55">
              From a folder of photos…
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
              …to a professional property tour.
            </p>
            <TourPlayer
              shots={shots}
              title="Apartment Verde · 86 m² · Guided tour"
              className="ring-white/10"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Natural room order",
                "Cinematic movement",
                "Smooth transitions",
                "Ready to publish",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[12px] text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
