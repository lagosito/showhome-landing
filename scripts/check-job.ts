import { getBytePlusTask, mapBytePlusStatus } from '../src/lib/v3/byteplus';

(async () => {
  const id = process.argv[2] || 'cgt-20261006172417-wfboy';
  const t = await getBytePlusTask(id);
  const m = mapBytePlusStatus(t);
  console.log(JSON.stringify({
    status: t.status,
    done: m.done,
    failed: m.failed,
    tokens: m.tokens ?? null,
    error: JSON.stringify((t as any).error ?? null).slice(0, 300),
    video: (m.videoUrl || '').slice(0, 120),
    keys: Object.keys(t).slice(0, 20),
  }, null, 2));
})();
