import { redirect } from 'next/navigation';
import { LegalPage } from '@/components/legal/LegalPage';

/** Service-provider register, taken from the app's real code and env inventory
 *  (10/2026). Feeds the final generator text. */
const PROVIDERS: [string, string, string, string][] = [
  ['Vercel Inc. (hosting, serverless functions, blob storage)', 'Operating the website and its APIs', 'Access data, IP address, page content, API calls', 'USA (iad1, Washington D.C.)'],
  ['Supabase Auth', 'Registration, sign-in, magic links', 'E-mail address, password hash, session data, session cookie', 'EU (eu-west-1, Ireland)'],
  ['Supabase PostgreSQL', 'Database for accounts, video jobs and settings', 'Account data, job data, uploaded photo URLs', 'EU (eu-west-1, Ireland)'],
  ['Vercel Blob', 'Storage of uploaded property photos', 'Photos, file names, upload timestamp', 'USA (Vercel default region)'],
  ['BytePlus ModelArk (ByteDance)', 'AI video generation (Seedance 2.5)', 'Up to 5 selected photos, text prompt, render settings', 'Asia (ap-southeast, outside the EU)'],
  ['fal.ai (optional second provider)', 'AI video generation (currently disabled in the test build)', 'Up to 5 selected photos, text prompt', 'USA'],
  ['OpenAI', 'Image analysis: room detection, describing people', 'Individual photos, short text prompt responses', 'USA'],
  ['orcarouter (API relay)', 'Relaying the language-model requests', 'Same content as the OpenAI requests', 'Relay (reseller), provider location'],
  ['Supabase e-mail delivery', 'Confirmation and magic-link e-mails', 'E-mail address, message content', 'USA (noreply@mail.app.supabase.io)'],
  ['Google Fonts', 'Loading the Inter Tight typeface', 'IP address', 'USA'],
  ['Pexels (CE Distribution)', 'Demo images on the homepage', 'IP address', 'USA (CDN)'],
];

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale === 'de') redirect('/de/datenschutz');

  return (
    <LegalPage title="Privacy Policy" updated="Last updated: [date] · Version [ ]">
      <p className="text-ink-3">
        [Placeholder draft] This structure was generated from the app's real tech stack. The
        final wording will be produced with a generator (eRecht24 /
        Datenschutz-Generator.de) and reviewed before going live.
      </p>

      <section>
        <h2>1. Controller</h2>
        <p>
          make happen GmbH, Susannenstraße 21A, 20357 Hamburg, Germany
          <br />
          E-mail: [ ]
        </p>
      </section>

      <section>
        <h2>2. Hosting</h2>
        <p>
          The website is hosted on Vercel. Serverless functions run in region iad1
          (Washington D.C., USA). [Placeholder — final text to follow.]
        </p>
      </section>

      <section>
        <h2>3. Registration and sign-in</h2>
        <p>
          Registration and sign-in use Supabase Auth (e-mail address and password or magic
          link). Data is processed in Ireland (EU). A necessary session cookie is set.
          [Placeholder — final text to follow.]
        </p>
      </section>

      <section>
        <h2>4. Account and job data</h2>
        <p>
          Account data, video jobs and related metadata are stored in a Supabase database
          (Ireland, EU). [Placeholder — final text to follow.]
        </p>
      </section>

      <section>
        <h2>5. Photos and videos</h2>
        <p>
          Uploaded property photos are stored in Vercel Blob and served through short-lived
          signed URLs. [Placeholder — final text to follow.]
        </p>
      </section>

      <section>
        <h2>6. AI video generation</h2>
        <p>
          Up to five selected photos together with a text prompt are transmitted to the
          video provider (currently BytePlus ModelArk, servers in Asia; optionally fal.ai,
          USA). Real people are never sent as an image reference — only as a text
          description. No payment data is sent to these providers. [Placeholder — final text
          to follow.]
        </p>
      </section>

      <section>
        <h2>7. Language models for image analysis</h2>
        <p>
          Language models are used to detect rooms and describe image content (OpenAI,
          relayed via orcarouter). Individual photos and short texts are transmitted.
          [Placeholder — final text to follow.]
        </p>
      </section>

      <section>
        <h2>8. E-mail delivery</h2>
        <p>
          Confirmation and sign-in e-mails are sent through Supabase's mail service
          (noreply@mail.app.supabase.io). [Placeholder — final text to follow.]
        </p>
      </section>

      <section>
        <h2>9. Fonts and images</h2>
        <p>
          The Inter Tight typeface is loaded from Google Fonts; demo images come from
          Pexels. Both load data (IP address) from servers in the USA. [Placeholder — final
          text to follow.]
        </p>
      </section>

      <section>
        <h2>10. Cookies</h2>
        <p>
          Only the necessary session cookie for sign-in is set. There are no analytics or
          marketing cookies. [Placeholder — final text to follow.]
        </p>
      </section>

      <section>
        <h2>11. Payment services</h2>
        <p>
          No payment data is collected during the beta: no payment providers are integrated
          and no subscriptions are active. [Placeholder — final text to follow.]
        </p>
      </section>

      <section>
        <h2>12. Service providers in use</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-ink">
                <th className="py-2 pr-3 font-semibold">Service</th>
                <th className="py-2 pr-3 font-semibold">Purpose</th>
                <th className="py-2 pr-3 font-semibold">Data</th>
                <th className="py-2 font-semibold">Location</th>
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
        <h2>13. Legal bases</h2>
        <p>[Placeholder — final text to follow.]</p>
      </section>

      <section>
        <h2>14. Retention periods</h2>
        <p>[Placeholder — final text to follow.]</p>
      </section>

      <section>
        <h2>15. Your rights</h2>
        <p>
          Access, rectification, erasure, restriction, objection, data portability and the
          right to lodge a complaint with a supervisory authority. [Placeholder — final text
          to follow.]
        </p>
      </section>

      <section>
        <h2>16. Contact</h2>
        <p>E-mail: [ ]</p>
      </section>
    </LegalPage>
  );
}
