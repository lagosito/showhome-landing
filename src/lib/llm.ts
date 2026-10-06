// Shared chat/vision provider selection for the v3 API routes.
//
// The project has two OpenAI-compatible keys. ORCAROUTER_API_KEY currently
// holds a redacted placeholder (`«…»`) in every environment, so it is only
// used when it looks like a real key — otherwise we fall back to the OpenAI
// key, which is verified working (GET /v1/models → 200).

export interface ChatProvider {
  baseUrl: string;
  apiKey: string;
  model: string;
}

const MODEL = 'gpt-4o-mini';

/** Rejects empty values and masked placeholders like `«re…»`. */
function usable(key: string | undefined): key is string {
  return Boolean(key) && (key as string).length > 20 && /^[\x21-\x7e]+$/.test(key as string);
}

export function chatProvider(): ChatProvider | null {
  if (usable(process.env.ORCAROUTER_API_KEY)) {
    return { baseUrl: 'https://api.orcarouter.ai/v1', apiKey: process.env.ORCAROUTER_API_KEY!, model: MODEL };
  }
  if (usable(process.env.OPENAI_API_KEY)) {
    return { baseUrl: 'https://api.openai.com/v1', apiKey: process.env.OPENAI_API_KEY!, model: MODEL };
  }
  return null;
}
