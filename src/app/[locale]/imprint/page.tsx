import { redirect } from 'next/navigation';
import { LegalPage } from '@/components/legal/LegalPage';

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale === 'de') redirect('/de/impressum');

  return (
    <LegalPage title="Imprint">
      <h2>Information pursuant to Section 5 of the German Digital Services Act (DDG)</h2>
      <p>
        make happen GmbH
        <br />
        Susannenstraße 21A
        <br />
        20357 Hamburg, Germany
      </p>
      <p>
        Represented by the managing directors:
        <br />
        Gabriel Lagos, Lea Nuñez Lagos
      </p>

      <h2>Contact</h2>
      <p>
        E-mail: [ ]
        <br />
        Phone: [ ]
      </p>

      <h2>Commercial register</h2>
      <p>
        Register court: Local Court of Hamburg (Amtsgericht Hamburg)
        <br />
        Registration number: HRB [ ]
      </p>

      <h2>VAT ID</h2>
      <p>VAT identification number pursuant to Section 27a of the German VAT Act: [ ]</p>

      <h2>Responsible for content pursuant to Section 18 (2) MStV</h2>
      <p>Gabriel Lagos, address as above</p>

      <h2>EU dispute resolution</h2>
      <p>
        We are not willing or obliged to participate in dispute resolution proceedings before
        a consumer arbitration board.
      </p>

      <p className="text-ink-3">[Placeholder — e-mail, phone, HRB number and VAT ID to be added.]</p>
    </LegalPage>
  );
}
