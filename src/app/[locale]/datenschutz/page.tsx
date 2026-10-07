import { redirect } from 'next/navigation';
import { LegalPage } from '@/components/legal/LegalPage';

/** Dienstleister-Verzeichnis: aus dem Code- und Env-Inventar der App erzeugt
 *  (Stand 10/2026). Dient als Grundlage für den finalen Generator-Text. */
const PROVIDERS: [string, string, string, string][] = [
  ['Vercel Inc. (Hosting, Serverless Functions, Blob)', 'Betrieb von Website und APIs', 'Zugriffsdaten, IP-Adresse, Seiteninhalte, API-Aufrufe', 'EE.U.S. (iad1, Washington D.C.)'],
  ['Supabase Auth', 'Registrierung, Anmeldung, Magic Link', 'E-Mail-Adresse, Passwort-Hash, Session-Daten, Session-Cookie', 'EU (eu-west-1, Irland)'],
  ['Supabase PostgreSQL', 'Datenbank für Konten, Videoaufträge und Parameter', 'Kontodaten, Auftragsdaten, hochgeladene Foto-URLs', 'EU (eu-west-1, Irland)'],
  ['Vercel Blob', 'Speicherung der hochgeladenen Immobilienfotos', 'Fotos, Dateinamen, Upload-Zeitpunkt', 'EE.U.S. (Vercel-Standardregion)'],
  ['BytePlus ModelArk (ByteDance)', 'KI-Videogenerierung (Seedance 2.5)', 'Bis zu 5 ausgewählte Fotos, Textprompt, Render-Einstellungen', 'Asien (ap-southeast, außerhalb der EU)'],
  ['fal.ai (optionaler zweiter Anbieter)', 'KI-Videogenerierung (aktuell im Test deaktiviert)', 'Bis zu 5 ausgewählte Fotos, Textprompt', 'EE.U.S.'],
  ['OpenAI', 'Bildanalyse: Raumerkennung, Person beschreiben', 'Einzelne Fotos, kurze Textprompt-Antworten', 'EE.U.S.'],
  ['orcarouter (API-Weiterleitung)', 'Weiterleitung der Sprachmodell-Anfragen', 'Gleiche Inhalte wie OpenAI-Anfragen', 'Weiterleitung (Reseller), Standort des Anbieters'],
  ['Supabase E-Mail-Versand', 'Bestätigungs- und Magic-Link-E-Mails', 'E-Mail-Adresse, Inhalt der Nachricht', 'EE.U.S. (noreply@mail.app.supabase.io)'],
  ['Google Fonts', 'Laden der Webschrift Inter Tight', 'IP-Adresse', 'EE.U.S.'],
  ['Pexels (CE Distribution)', 'Demo-Bilder auf der Startseite', 'IP-Adresse', 'EE.U.S. (CDN)'],
];

export default async function DatenschutzPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'de') redirect('/en/privacy');

  return (
    <LegalPage title="Datenschutzerklärung" updated="Stand: [Datum] · Fassung [ ]">
      <p className="text-ink-3">
        [Platzhalterfassung] Diese Struktur wurde aus dem realen Tech-Stack der App erzeugt.
        Die endgültigen Formulierungen werden mit einem Generator (eRecht24 /
        Datenschutz-Generator.de) ergänzt und vor dem Livegang geprüft.
      </p>

      <section>
        <h2>1. Verantwortlicher</h2>
        <p>
          make happen GmbH, Susannenstraße 21A, 20357 Hamburg
          <br />
          E-Mail: [ ]
        </p>
      </section>

      <section>
        <h2>2. Hosting</h2>
        <p>
          Die Website wird über Vercel gehostet. Serverless-Funktionen laufen in der Region
          iad1 (Washington D.C., USA). [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>3. Registrierung und Anmeldung</h2>
        <p>
          Registrierung und Anmeldung erfolgen über Supabase Auth (E-Mail-Adresse und
          Passwort bzw. Magic Link). Daten werden in Irland (EU) verarbeitet. Es wird ein
          notwendiges Session-Cookie gesetzt. [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>4. Konten- und Auftragsdaten</h2>
        <p>
          Kontodaten, Videoaufträge und zugehörige Metadaten werden in einer Datenbank bei
          Supabase (Irland, EU) gespeichert. [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>5. Foto- und Videodateien</h2>
        <p>
          Hochgeladene Immobilienfotos werden bei Vercel Blob gespeichert und über
          kurzlebige, signierte URLs abgerufen. [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>6. KI-gestützte Videogenerierung</h2>
        <p>
          Für die Videogenerierung werden bis zu fünf ausgewählte Fotos zusammen mit einem
          Textprompt an den Videoanbieter übertragen (aktuell BytePlus ModelArk, Server in
          Asien; optional fal.ai, USA). Echte Personen werden nicht als Bildvorlage
          übertragen, sondern ausschließlich als Textbeschreibung. Es werden keine
          Zahlungsdaten an diese Anbieter übermittelt. [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>7. Sprachmodelle zur Bildanalyse</h2>
        <p>
          Zur Erkennung der Räume und zur Beschreibung von Bildinhalten werden
          Sprachmodelle eingesetzt (OpenAI, Weiterleitung über orcarouter). Übertragen werden
          einzelne Fotos und kurze Texte. [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>8. E-Mail-Versand</h2>
        <p>
          Für Bestätigungs- und Anmeldelinks werden E-Mails über den Mailversand von
          Supabase (noreply@mail.app.supababase.io) versendet. [Platzhalter — finaler Text
          folgt.]
        </p>
      </section>

      <section>
        <h2>9. Schriften und Bilder</h2>
        <p>
          Die Webschrift Inter Tight wird von Google Fonts geladen; Demo-Bilder stammen von
          Pexels. Beides lädt Daten (IP-Adresse) von Servern in den USA. [Platzhalter —
          finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>10. Cookies</h2>
        <p>
          Gesetzt wird ausschließlich das notwendige Session-Cookie zur Anmeldung. Es gibt
          keine Analyse- oder Marketing-Cookies. [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>11. Zahlungsdienste</h2>
        <p>
          In der Beta werden keine Zahlungsdaten erhoben: Es sind keine Zahlungsanbieter
          eingebunden und keine Abonnements aktiv. [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>12. Eingesetzte Dienstleister</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-ink">
                <th className="py-2 pr-3 font-semibold">Dienst</th>
                <th className="py-2 pr-3 font-semibold">Zweck</th>
                <th className="py-2 pr-3 font-semibold">Daten</th>
                <th className="py-2 font-semibold">Standort</th>
              </tr>
            </thead>
            <tbody>
              {PROVIDERS.map(([name, purpose, data, place]) => (
                <tr key={name} className="border-b border-line align-top">
                  <td className="py-2 pr-3 text-ink">{name}</td>
                  <td className="py-2 pr-3">{purpose}</td>
                  <td className="py-2 pr-3">{data}</td>
                  <td className="py-2">{place}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>13. Rechtsgrundlagen</h2>
        <p>[Platzhalter — finaler Text folgt.]</p>
      </section>

      <section>
        <h2>14. Speicherdauer</h2>
        <p>[Platzhalter — finaler Text folgt.]</p>
      </section>

      <section>
        <h2>15. Deine Rechte</h2>
        <p>
          Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Datenübertragbarkeit
          und Beschwerde bei einer Aufsichtsbehörde. [Platzhalter — finaler Text folgt.]
        </p>
      </section>

      <section>
        <h2>16. Kontakt</h2>
        <p>E-Mail: [ ]</p>
      </section>
    </LegalPage>
  );
}
