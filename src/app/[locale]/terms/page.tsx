import { redirect } from 'next/navigation';
import { LegalPage } from '@/components/legal/LegalPage';

const SECTIONS = [
  ['1. Scope', 'These terms and conditions apply to all contracts for Homemotion between [responsible party] and the customer. [Placeholder — final text to follow.]'],
  ['2. Services', 'Description of the service (creating property videos from uploaded photos). [Placeholder — final text to follow.]'],
  ['3. Conclusion of contract', 'How the contract is concluded through registration and use of the service. [Placeholder — final text to follow.]'],
  ['4. Prices & payment', 'Prices according to the pricing overview; payment methods and billing schedule. [Placeholder — final text to follow.]'],
  ['5. Term & cancellation', 'Term, renewal and notice periods. [Placeholder — final text to follow.]'],
  ['6. Right of withdrawal for consumers', 'Information on any right of withdrawal and its conditions. [Placeholder — final text to follow.]'],
  ['7. Usage rights', 'Usage rights granted for uploaded material and generated videos. [Placeholder — final text to follow.]'],
  ['8. Liability', 'Liability provisions. [Placeholder — final text to follow.]'],
  ['9. Data protection', 'Reference to the privacy policy: /en/privacy. [Placeholder — final text to follow.]'],
  ['10. Final provisions', 'Applicable law, place of jurisdiction, severability clause. [Placeholder — final text to follow.]'],
];

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale === 'de') redirect('/de/agb');

  return (
    <LegalPage title="Terms and Conditions">
      <p className="text-ink-3">
        [Placeholder draft — the final terms will be added and legally reviewed before going
        live.]
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
