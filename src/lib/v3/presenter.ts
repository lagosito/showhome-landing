// Homemotion v3 — presenter fallback.
//
// BytePlus / Seedance 2.5 REFUSES reference images that contain a real person:
//   400 InputImageSensitiveContentDetected.PrivacyInformation
//   "The request failed because the input image 'content[1]' may contain real person."
// (verified live, 06.10.2026 — the task never started, so nothing was billed.)
//
// So the presenter photo never travels as an image. We turn it into a text
// description once per render and put that in the prompt's CHARACTER block.

import { chatProvider } from '@/lib/llm';

const DESCRIBE_PROMPT = `Describe the person in this photo for a text-to-video prompt.
Reply with ONLY the description, in English, maximum 70 words, covering:
gender, apparent age, ethnicity/skin tone, hair colour/style/length, eye colour,
facial hair if any, build, exact clothing (garment type plus colour and pattern),
accessories, and pose/angle towards the camera.
No background, no lighting or photographer notes, no name, and no adjectives such
as beautiful, handsome, elegant or professional.`;

/** Photo → text description of the presenter. Returns null when unavailable
 *  (no key, blocked image, timeout) — the caller then falls back to the
 *  built-in character card. */
export async function describePresenter(imageUrl: string): Promise<string | null> {
  const provider = chatProvider();
  if (!provider || !/^https?:\/\//i.test(imageUrl)) return null;

  try {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: DESCRIBE_PROMPT },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 160,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();
    if (!text) return null;
    // Guard against the model wrapping the answer in quotes or a preamble.
    return text.replace(/^["'\s]+|["'\s]+$/g, '').slice(0, 700) || null;
  } catch {
    return null;
  }
}
