import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Container } from '@/components/primitives';

/**
 * Shared shell for the legal pages (Impressum / Datenschutz / AGB).
 * Reuses the site layout — header + footer, simple legible typography, no new
 * design tokens.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <Container>
          <article className="mx-auto max-w-2xl">
            <h1 className="text-[clamp(1.7rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.035em]">
              {title}
            </h1>
            {updated && <p className="mt-3 text-[13px] text-ink-3">{updated}</p>}
            <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-ink-2 [&_a]:text-clay [&_a]:underline [&_a:hover]:text-ink [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
              {children}
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
