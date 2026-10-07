import { redirect } from 'next/navigation';
import { LegalPage } from '@/components/legal/LegalPage';

export default async function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'de') redirect('/en/imprint');

  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        make happen GmbH
        <br />
        Susannenstraße 21A
        <br />
        20357 Hamburg
      </p>
      <p>
        Vertreten durch die Geschäftsführer:
        <br />
        Gabriel Lagos, Lea Nuñez Lagos
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail: [ ]
        <br />
        Telefon: [ ]
      </p>

      <h2>Registereintrag</h2>
      <p>
        Registergericht: Amtsgericht Hamburg
        <br />
        Registernummer: HRB [ ]
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>USt-IdNr. gemäß § 27a UStG: [ ]</p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>Gabriel Lagos, Anschrift wie oben</p>

      <h2>EU-Streitschlichtung</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <p className="text-ink-3">
        [Platzhalter — E-Mail, Telefon, HRB-Nummer und USt-IdNr. werden noch ergänzt.]
      </p>
    </LegalPage>
  );
}
