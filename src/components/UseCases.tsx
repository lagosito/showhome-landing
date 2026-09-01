import { useEffect, useState } from "react";
import { Container, Reveal, SectionHead } from "./primitives";
import { px, tourShots } from "../data/media";

const channels = [
  { n: "Property portals", d: "16:9 · MP4" },
  { n: "Website listings", d: "Embed link" },
  { n: "Instagram", d: "9:16 · Reels" },
  { n: "TikTok", d: "9:16 · 30s" },
  { n: "WhatsApp", d: "Compressed" },
  { n: "Email", d: "GIF preview" },
  { n: "Digital ads", d: "1:1 · 15s" },
];

function PortraitMock() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % tourShots.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto w-[248px] sm:w-[288px]">
      <div className="relative overflow-hidden rounded-[34px] border-[7px] border-ink bg-ink shadow-[0_40px_80px_-40px_rgba(13,14,16,.6)]">
        <div className="relative aspect-[9/19] w-full overflow-hidden bg-black">
          {tourShots.map((s, idx) => (
            <img
              key={s.id}
              src={px(s.id, 540, 1140)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                idx === i ? "opacity-100" : "opacity-0"
              }`}
              style={idx === i ? { animation: "kenburns 7s ease-out forwards" } : undefined}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.72),transparent_45%)]" />

          <div className="absolute inset-x-0 top-0 flex gap-1 p-3">
            {tourShots.map((s, idx) => (
              <span key={s.id} className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/30">
                <span
                  className={`block h-full rounded-full bg-white transition-[width] duration-500 ${
                    idx < i ? "w-full" : idx === i ? "w-1/2" : "w-0"
                  }`}
                />
              </span>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-[13px] font-semibold tracking-[-0.02em] text-white">
              {tourShots[i].room}
            </p>
            <p className="mt-0.5 text-[11px] text-white/70">
              Apartment Verde · €1,450 / month
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-[10.5px] font-semibold text-ink">
                Book a viewing
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1.5 text-[10.5px] font-medium text-white ring-1 ring-white/20 backdrop-blur">
                Save
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-8 -bottom-4 -z-10 h-16 rounded-full bg-ink/20 blur-2xl"
      />
    </div>
  );
}

export function UseCases() {
  return (
    <section className="overflow-hidden py-20 sm:py-28">
      <Container>
        <SectionHead
          eyebrow="Use cases"
          title="One property video. Everywhere you list."
          sub="ShowHome exports every format you need — so the same tour works on the portal, in the inbox, and in the feed."
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.1fr_auto] lg:gap-16">
          <div className="grid gap-3 sm:grid-cols-2">
            {channels.map((c, i) => (
              <Reveal key={c.n} delay={i * 55}>
                <div className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-[0_18px_36px_-24px_rgba(13,14,16,.4)]">
                  <span className="text-[15px] font-medium tracking-[-0.02em] text-ink">
                    {c.n}
                  </span>
                  <span className="font-mono text-[11px] text-ink-3 transition-colors group-hover:text-clay">
                    {c.d}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={140}>
            <PortraitMock />
          </Reveal>
        </div>
      </Container>

      {/* marquee */}
      <div className="relative mt-16 border-y border-line bg-white py-5">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap sm:gap-14">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10 sm:gap-14" aria-hidden={dup === 1}>
              {[
                "Property portals",
                "Instagram Reels",
                "TikTok",
                "WhatsApp",
                "Email campaigns",
                "Website embeds",
                "Digital ads",
                "Agency showreels",
              ].map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-10 text-[15px] font-medium tracking-[-0.02em] text-ink-3 sm:gap-14"
                >
                  {t}
                  <span className="h-1 w-1 rounded-full bg-clay/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent"
        />
      </div>
    </section>
  );
}
