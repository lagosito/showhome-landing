import { chatText, providerChain } from '../src/lib/llm';

(async () => {
  console.log('chain:', providerChain().map(p => p.baseUrl).join(' -> '));
  const t0 = Date.now();
  const answer = await chatText([{ type: 'text', text: 'Reply with the single word OK' }], { maxTokens: 10, timeoutMs: 25000 });
  console.log(`text  (${Date.now() - t0}ms):`, JSON.stringify(answer));

  const t1 = Date.now();
  const vision = await chatText(
    [
      { type: 'text', text: 'Which room is this? Reply with ONLY one of: Facade, Kitchen, Living room, Other.' },
      { type: 'image_url', image_url: { url: 'https://homotion.de/demo/source-haus.jpg' } },
    ],
    { maxTokens: 20, timeoutMs: 30000 },
  );
  console.log(`vision(${Date.now() - t1}ms):`, JSON.stringify(vision));
})();
