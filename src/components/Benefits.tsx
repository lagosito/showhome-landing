import { cn } from "../utils/cn";
import { Container, Reveal, SectionHead } from "./primitives";
import { IMG, px, uploadShots } from "../data/media";

function Card({
  title,
  body,
  className,
  children,
  delay = 0,
}: {
  title: string;
  body: string;
  className?: string;
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(13,14,16,.03),0_30px_60px_-36px_rgba(13,14,16,.45)]">
        {children}
        <div className="mt-auto p-6 sm:p-7">
          <h3 className="text-[19px] font-semibold tracking-[-0.03em] text-ink sm:text-[21px]">
            {title}
          </h3>
          <p className="mt-2 max-w-[36ch] text-[14.5px] leading-relaxed text-ink-3">
            {body}
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export function Benefits() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHead
          eyebrow="Why ShowHome"
          title="Better listings, without the production."
          sub="Everything a property needs to be seen properly — created from photos you already have."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {/* Save hours */}
          <Card
            title="Save hours"
            body="No filming, editing, or complicated video software."
            className="md:col-span-3"
          >
            <div className="relative overflow-hidden border-b border-line bg-paper-2/60 p-7">
              <div className="flex items-end gap-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
                    Traditional
                  </p>
                  <p className="mt-1 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold tracking-[-0.04em] text-ink-3 line-through decoration-clay/60 decoration-2">
                    6–8 hrs
                  </p>
                </div>
                <svg viewBox="0 0 20 20" className="mb-3 h-4 w-4 text-line-2" aria-hidden="true">
                  <path d="M3 10h14m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-clay">
                    ShowHome
                  </p>
                  <p className="mt-1 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold tracking-[-0.04em] text-ink">
                    3 min
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[
                  { l: "Scheduling & travel", w: "78%", muted: true },
                  { l: "Filming on site", w: "62%", muted: true },
                  { l: "Editing & export", w: "88%", muted: true },
                  { l: "ShowHome render", w: "14%", muted: false },
                ].map((r) => (
                  <div key={r.l} className="flex items-center gap-3">
                    <span className="w-[128px] shrink-0 text-[11.5px] text-ink-3">
                      {r.l}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          r.muted ? "bg-line-2" : "bg-clay",
                        )}
                        style={{ width: r.w }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Look professional */}
          <Card
            title="Look professional"
            body="Turn simple property photos into polished video tours."
            className="md:col-span-3"
            delay={80}
          >
            <div className="relative overflow-hidden border-b border-line">
              <img
                src={px(IMG.beforeAfter, 900, 560)}
                alt="Polished cinematic frame of a living room"
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md ring-1 ring-white/20">
                  Colour graded
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md ring-1 ring-white/20">
                  Slow push-in
                </span>
              </div>
            </div>
          </Card>

          {/* List faster */}
          <Card
            title="List faster"
            body="Create a finished property video in minutes."
            className="md:col-span-2"
            delay={40}
          >
            <div className="border-b border-line bg-paper-2/60 p-7">
              <div className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-center justify-between text-[11.5px] font-medium text-ink">
                  <span>Rendering tour</span>
                  <span className="font-mono text-clay">00:47</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full w-[72%] rounded-full bg-ink" />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  {uploadShots.slice(0, 4).map((s) => (
                    <img
                      key={s.id}
                      src={px(s.id, 140, 100)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-full rounded object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Stand out */}
          <Card
            title="Stand out"
            body="Give potential renters and buyers a better way to experience the property."
            className="md:col-span-2"
            delay={110}
          >
            <div className="border-b border-line bg-paper-2/60 p-7">
              <div className="space-y-2.5">
                {[
                  { l: "Photo-only listing", v: 32, tone: "muted" },
                  { l: "Listing with video tour", v: 100, tone: "clay" },
                ].map((r) => (
                  <div key={r.l}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-[11.5px] text-ink-3">{r.l}</span>
                      <span className="font-mono text-[11px] text-ink">
                        {r.v === 100 ? "3.1×" : "1×"}
                      </span>
                    </div>
                    <span className="block h-8 overflow-hidden rounded-lg bg-white">
                      <span
                        className={cn(
                          "block h-full rounded-lg",
                          r.tone === "clay" ? "bg-clay" : "bg-line-2",
                        )}
                        style={{ width: `${r.v}%` }}
                      />
                    </span>
                  </div>
                ))}
                <p className="pt-1 text-[11px] text-ink-3">
                  Relative enquiry engagement, illustrative
                </p>
              </div>
            </div>
          </Card>

          {/* Scale */}
          <Card
            title="Scale effortlessly"
            body="Create videos for one property or hundreds."
            className="md:col-span-2"
            delay={170}
          >
            <div className="border-b border-line bg-paper-2/60 p-7">
              <div className="grid grid-cols-4 gap-1.5">
                {uploadShots.slice(0, 12).map((s, i) => (
                  <div
                    key={s.id}
                    className="relative overflow-hidden rounded-md"
                    style={{ opacity: 1 - i * 0.055 }}
                  >
                    <img
                      src={px(s.id, 140, 140)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11.5px] font-medium text-ink-3">
                Batch upload · shared brand template · one click
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
