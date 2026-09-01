import { Container, Reveal, SectionHead } from "./primitives";
import { px, tourShots, uploadShots } from "../data/media";

/* ---------- Step visuals ---------- */

function StepUpload() {
  return (
    <div className="flex h-full flex-col justify-between p-5 sm:p-6">
      <div className="grid grid-cols-3 gap-2">
        {uploadShots.slice(0, 6).map((s, i) => (
          <div key={s.id} className="relative overflow-hidden rounded-lg">
            <img
              src={px(s.id, 240, 180)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
            <span
              className={`absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full ring-1 ring-white/70 ${
                i < 5 ? "bg-ink" : "bg-white/45"
              }`}
            >
              {i < 5 && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" aria-hidden="true">
                  <path
                    d="M2.4 6.2 4.9 8.7 9.6 3.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-line-2 bg-paper/60 px-4 py-3 text-center">
        <p className="text-[12.5px] font-medium text-ink-2">
          Drop photos here <span className="text-ink-3">or browse</span>
        </p>
        <p className="mt-0.5 text-[11px] text-ink-3">JPG, PNG, HEIC · up to 200 photos</p>
      </div>
    </div>
  );
}

function StepBuild() {
  const chips = ["Hall", "Living", "Kitchen", "Bedroom", "Bath", "Terrace"];
  return (
    <div className="flex h-full flex-col justify-between p-5 sm:p-6">
      <div className="rounded-xl border border-line bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-ink">
            Building walkthrough
          </span>
          <span className="font-mono text-[10.5px] text-clay">82%</span>
        </div>
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-paper-2">
          <div className="h-full w-[82%] rounded-full bg-clay" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <span
              key={c}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
                i < 4
                  ? "bg-ink text-paper ring-ink"
                  : "bg-paper text-ink-3 ring-line-2"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* timeline */}
      <div className="mt-5 rounded-xl border border-line bg-white p-4">
        <div className="flex items-end gap-1.5">
          {tourShots.map((s, i) => (
            <div key={s.id} className="flex-1">
              <img
                src={px(s.id, 160, 100)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-9 w-full rounded-[5px] object-cover"
              />
              <span
                className={`mt-1.5 block h-[3px] rounded-full ${
                  i < 4 ? "bg-clay" : "bg-line-2"
                }`}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[10.5px] text-ink-3">
          <span>Sequence · natural walkthrough order</span>
          <span className="font-mono">0:24</span>
        </div>
      </div>
    </div>
  );
}

function StepShare() {
  const targets = [
    { n: "Portals", d: "16:9" },
    { n: "Instagram", d: "9:16" },
    { n: "Website", d: "16:9" },
    { n: "WhatsApp", d: "1:1" },
  ];
  return (
    <div className="flex h-full flex-col justify-between p-5 sm:p-6">
      <div className="relative overflow-hidden rounded-xl bg-ink">
        <img
          src={px(tourShots[1].id, 640, 360)}
          alt="Finished property tour ready to share"
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/92 text-ink">
            <svg viewBox="0 0 16 16" className="ml-0.5 h-3 w-3" aria-hidden="true">
              <path d="M5 3.4v9.2a.6.6 0 0 0 .92.5l7.2-4.6a.6.6 0 0 0 0-1L5.92 2.9a.6.6 0 0 0-.92.5Z" fill="currentColor" />
            </svg>
          </span>
          <span className="text-[11.5px] font-medium text-white/90">
            maison-verde-tour.mp4
          </span>
          <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85 ring-1 ring-white/20">
            4K
          </span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {targets.map((t) => (
          <div
            key={t.n}
            className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2.5"
          >
            <span className="text-[12px] font-medium text-ink">{t.n}</span>
            <span className="font-mono text-[10.5px] text-ink-3">{t.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const steps = [
  {
    k: "01",
    title: "Upload your photos",
    body: "Select the photos of your property.",
    visual: <StepUpload />,
  },
  {
    k: "02",
    title: "ShowHome creates the tour",
    body: "Our AI understands the rooms and creates a natural property walkthrough.",
    visual: <StepBuild />,
  },
  {
    k: "03",
    title: "Share your video",
    body: "Download your video and use it on property portals, social media, websites, or send it directly to prospects.",
    visual: <StepShare />,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20 sm:py-28">
      <Container>
        <SectionHead
          eyebrow="How it works"
          title="Three steps. No production crew."
          sub="From a folder of photos to a finished property tour — the whole process takes about as long as writing the listing description."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.k} delay={i * 110} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper-2/50 transition-all duration-500 hover:-translate-y-1 hover:border-line-2 hover:shadow-[0_2px_4px_rgba(13,14,16,.03),0_28px_60px_-34px_rgba(13,14,16,.4)]">
                <div className="min-h-[268px] flex-1 bg-paper-2/60">{s.visual}</div>
                <div className="border-t border-line bg-white p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] tracking-[0.1em] text-clay">
                      {s.k}
                    </span>
                    <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-3">
                    {s.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
