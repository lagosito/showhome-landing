import { Container, Reveal } from "./primitives";

const groups = [
  {
    k: "01",
    title: "Private Owners",
    body: "Create a professional listing without hiring a videographer.",
  },
  {
    k: "02",
    title: "Real-Estate Agents",
    body: "Create better property tours in minutes.",
  },
  {
    k: "03",
    title: "Real-Estate Teams",
    body: "Create consistent video content across your entire portfolio.",
  },
];

const stats = [
  { v: "3 min", l: "Average time to a finished tour" },
  { v: "40+", l: "Cinematic camera moves & transitions" },
  { v: "4K", l: "Export quality, portrait or landscape" },
  { v: "12", l: "Room types recognised automatically" },
];

export function Audiences() {
  return (
    <section id="product" className="border-y border-line bg-white py-20 sm:py-28">
      <Container>
        <Reveal>
          <h2 className="max-w-3xl text-balance text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-ink">
            Built for everyone who needs to showcase property better.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:mt-14 md:grid-cols-3">
          {groups.map((g, idx) => (
            <Reveal key={g.k} delay={idx * 90} className="h-full">
              <div className="group relative h-full bg-white p-7 transition-colors duration-300 hover:bg-paper sm:p-9">
                <span className="font-mono text-[11px] tracking-[0.1em] text-clay">
                  {g.k}
                </span>
                <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-ink sm:text-[24px]">
                  {g.title}
                </h3>
                <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-ink-3">
                  {g.body}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-8 block h-px w-10 bg-line-2 transition-all duration-500 group-hover:w-20 group-hover:bg-clay"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <dl className="mt-12 grid grid-cols-2 gap-y-8 border-t border-line pt-10 sm:mt-16 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="px-1">
                <dt className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.04em] text-ink">
                  {s.v}
                </dt>
                <dd className="mt-1.5 max-w-[22ch] text-[13px] leading-snug text-ink-3">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
