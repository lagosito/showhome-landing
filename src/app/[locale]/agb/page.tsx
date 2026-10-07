import { redirect } from 'next/navigation';
import { LegalPage } from '@/components/legal/LegalPage';

const SECTIONS = [
  ['1. Geltungsbereich', 'Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über Homemotion zwischen [Verantwortlich] und dem Kunden. [Platzhalter — finaler Text folgt.]'],
  ['2. Leistungen', 'Beschreibung der Leistung (Erstellung von Immobilienvideos aus hochgeladenen Fotos). [Platzhalter — finaler Text folgt.]'],
  ['3. Vertragsschluss', 'Zustandekommen des Vertrags über die Registrierung und die Nutzung des Angebots. [Platzhalter — finaler Text folgt.]'],
  ['4. Preise & Zahlung', 'Tarife gemäß Preisübersicht; Zahlungsarten und Zeitpunkt der Abrechnung. [Platzhalter — finaler Text folgt.]'],
  ['5. Laufzeit & Kündigung', 'Laufzeit, Verlängerung und Kündigungsfristen. [Platzhalter — finaler Text folgt.]'],
  ['6. Widerrufsrecht für Verbraucher', 'Hinweis auf ein etwaiges Widerrufsrecht und dessen Voraussetzungen. [Platzhalter — finaler Text folgt.]'],
  ['7. Nutzungsrechte', 'Eingeräumte Nutzungsrechte an hochgeladenen Materialien und erstellten Videos. [Platzhalter — finaler Text folgt.]'],
  ['8. Haftung', 'Haftungsregelungen. [Platzhalter — finaler Text folgt.]'],
  ['9. Datenschutz', 'Hinweis auf die Datenschutzerklärung: /de/datenschutz. [Platzhalter — finaler Text folgt.]'],
  ['10. Schlussbestimmungen', 'Anwendbares Recht, Gerichtsstand, Salvatorische Klausel. [Platzhalter — finaler Text folgt.]'],
];

export default async function AgbPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'de') redirect('/en/terms');

  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen (AGB)">
      <p className="text-ink-3">
        [Platzhalterfassung — die endgültigen AGB-Texte werden ergänzt und vor dem Livegang
        juristisch geprüft.]
      </p>
      {SECTIONS.map(([heading, body]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>{body}</p>
        </section>
      ))}
    </LegalPage>
  );
}
