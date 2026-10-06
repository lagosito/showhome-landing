// Shared chat/vision helpers for the v3 API routes.
//
// Two OpenAI-compatible providers are available:
//   - ORCAROUTER_API_KEY (cheaper) — observed returning
//     404 model_not_found ("No available capacity for model gpt-4o-mini")
//     for minutes at a time, and in some envs it was a redacted placeholder.
//   - OPENAI_API_KEY (verified working: GET /v1/models → 200).
//
// chatText() walks the chain and returns the first real answer, so a capacity
// blip on one provider degrades to the other instead of to an empty result.

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

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export function providerChain(): ChatProvider[] {
  const chain: ChatProvider[] = [];
  if (usable(process.env.ORCAROUTER_API_KEY)) {
    chain.push({
      baseUrl: 'https://api.orcarouter.ai/v1',
      apiKey: process.env.ORCAROUTER_API_KEY!,
      model: MODEL,
    });
  }
  if (usable(process.env.OPENAI_API_KEY)) {
    chain.push({
      baseUrl: 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY!,
      model: MODEL,
    });
  }
  return chain;
}

/** First provider that answers wins. Returns null when every provider failed
 *  (caller decides whether to fall back or surface an error). */
export async function chatText(
  content: ContentPart[],
  opts: { maxTokens: number; timeoutMs?: number; json?: boolean },
): Promise<string | null> {
  for (const provider of providerChain()) {
    try {
      const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: 'user', content }],
          max_tokens: opts.maxTokens,
          temperature: 0,
          ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 30000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = (data.choices?.[0]?.message?.content || '').trim();
      if (text) return text;
    } catch {
      // network/timeout → try the next provider
    }
  }
  return null;
}
