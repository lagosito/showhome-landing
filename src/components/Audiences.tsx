import { Container, Reveal } from "./primitives";

const groups = [
  {
    k: "01",
    title: "Private Eigentümer",
    body: "Erstelle ein professionelles Inserat, ganz ohne Videografen.",
  },
  {
    k: "02",
    title: "Immobilienmakler",
    body: "Bessere Immobilientouren in wenigen Minuten.",
  },
  {
    k: "03",
    title: "Immobilienunternehmen",
    body: "Einheitliche Videoinhalte für das gesamte Portfolio.",
  },
];

const stats = [
  { v: "3 min", l: "Durchschnittliche Zeit bis zur fertigen Tour" },
  { v: "40+", l: "Filmische Kamerafahrten & Übergänge" },
  { v: "4K", l: "Exportqualität, hoch oder quer" },
  { v: "12", l: "Raumtypen automatisch erkannt" },
];

export function Audiences() {
  return (
    <section id="product" className="border-y border-line bg-white py-20 sm:py-28">
      <Container>
        <Reveal>
          <h2 className="max-w-3xl text-balance text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-ink">
            Für alle, die Immobilien besser präsentieren wollen.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:mt-14 md:grid-cols-3">
          {groups.map((g, idx) => (
            <Reveal key={g.k} delay={idx * 90} className="h-full">
              <div className="group relative h-full bg-white p-7 transition-colors duration-300 hover:bg-paper-2 sm:p-9">
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
