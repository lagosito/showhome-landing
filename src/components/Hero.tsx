import { ArrowIcon, Button, Container, Reveal } from "./primitives";
import { TourPlayer } from "./TourPlayer";
import { px, tourShots, uploadShots } from "../data/media";

function UploadCard() {
  return (
    <div className="w-[228px] rounded-2xl border border-line bg-white/90 p-3.5 shadow-[0_2px_4px_rgba(13,14,16,.04),0_24px_50px_-28px_rgba(13,14,16,.35)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11.5px] font-semibold tracking-[-0.01em] text-ink">
          Your photos
        </span>
        <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-3">
          24 files
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {uploadShots.slice(0, 9).map((s) => (
          <img
            key={s.id}
            src={px(s.id, 160, 160)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="aspect-square w-full rounded-md object-cover"
          />
        ))}
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-paper-2">
        <div className="h-full w-full rounded-full bg-ink" />
      </div>
      <p className="mt-2 text-[10.5px] font-medium text-ink-3">
        Upload complete
      </p>
    </div>
  );
}

function AnalysisCard() {
  const rooms = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Terrace"];
  return (
    <div className="w-[218px] rounded-2xl border border-line bg-white/90 p-4 shadow-[0_2px_4px_rgba(13,14,16,.04),0_24px_50px_-28px_rgba(13,14,16,.35)] backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-clay-tint">
          <span className="h-1.5 w-1.5 rounded-full bg-clay animate-sheen" />
        </span>
        <span className="text-[11.5px] font-semibold tracking-[-0.01em] text-ink">
          Rooms detected
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {rooms.map((r) => (
          <li key={r} className="flex items-center justify-between">
            <span className="text-[12px] text-ink-2">{r}</span>
            <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 text-clay" aria-hidden="true">
              <path
                d="M2.6 7.4 5.6 10.4 11.4 4.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-line pt-2.5 text-[10.5px] font-medium text-ink-3">
        Sequence built · 0:24 tour
      </p>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-[104px] sm:pt-[124px]">
      {/* soft ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(120%_70%_at_50%_-10%,#ffffff_0%,#faf8f5_45%,#f2efe9_100%)]"
      />
      <div
        aria-hidden="true"
        className="grain pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] opacity-60"
      />

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/70 py-1.5 pl-1.5 pr-3.5 text-[12.5px] font-medium text-ink-2 backdrop-blur">
              <span className="rounded-full bg-ink px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-paper">
                New
              </span>
              AI room sequencing for property tours
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-balance text-[clamp(2.5rem,6.6vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
              Turn property photos into professional video tours.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-ink-3 sm:text-[19px]">
              Upload your photos. ShowHome creates a polished property video
              that makes every room feel worth exploring.
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
                Create your first video
              </Button>
              <Button
                href="#how"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
                icon={
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                    <path
                      d="M5.5 3.6v8.8a.5.5 0 0 0 .77.42l6.9-4.4a.5.5 0 0 0 0-.84l-6.9-4.4a.5.5 0 0 0-.77.42Z"
                      fill="currentColor"
                    />
                  </svg>
                }
              >
                See how it works
              </Button>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-6 text-[13.5px] font-medium tracking-[-0.01em] text-ink-3">
              No filming <span className="mx-1.5 text-line-2">·</span> No camera
              equipment <span className="mx-1.5 text-line-2">·</span> No video
              editing
            </p>
          </Reveal>
        </div>
      </Container>

      {/* Hero visual */}
      <Container className="mt-14 sm:mt-16">
        <Reveal delay={120}>
          <div className="relative mx-auto max-w-[980px]">
            <div
              aria-hidden="true"
              className="absolute -inset-x-6 -bottom-8 top-10 -z-10 rounded-[32px] bg-white/60 blur-2xl"
            />
            <TourPlayer shots={tourShots} />

            <div className="pointer-events-none absolute -left-[130px] top-14 hidden animate-float xl:block">
              <UploadCard />
            </div>
            <div
              className="pointer-events-none absolute -bottom-7 -right-[118px] hidden animate-float xl:block"
              style={{ animationDelay: "1.4s" }}
            >
              <AnalysisCard />
            </div>
          </div>
        </Reveal>

        {/* Pipeline strip */}
        <Reveal delay={200}>
          <div className="mx-auto mt-8 grid max-w-[980px] grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {[
              {
                k: "01",
                t: "Photos in",
                d: "Any camera roll. Any order.",
              },
              {
                k: "02",
                t: "ShowHome analyses",
                d: "Rooms, order, pacing, movement.",
              },
              {
                k: "03",
                t: "Video out",
                d: "A finished tour, ready to publish.",
              },
            ].map((s) => (
              <div key={s.k} className="bg-white/70 px-5 py-4 backdrop-blur">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-clay">{s.k}</span>
                  <span className="text-[14.5px] font-semibold tracking-[-0.02em] text-ink">
                    {s.t}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-ink-3">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
