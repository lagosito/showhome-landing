import { getBytePlusTask, mapBytePlusStatus } from '../src/lib/v3/byteplus';
import * as fs from 'node:fs';

(async () => {
  const taskId = process.argv[2];
  const out = process.argv[3];
  const t = await getBytePlusTask(taskId);
  const m = mapBytePlusStatus(t);
  if (!m.videoUrl) {
    console.log('no video yet:', t.status, JSON.stringify((t as any).error ?? null).slice(0, 200));
    process.exit(2);
  }
  fs.writeFileSync('/tmp/e2e_video_url.txt', m.videoUrl);
  const res = await fetch(m.videoUrl);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  console.log('saved', out, buf.length, 'bytes | status', t.status, '| tokens', m.tokens);
})();
