import { describePresenter } from '../src/lib/v3/presenter';
import { buildVideoPrompt } from '../src/lib/v3/buildPrompt';
import { submitBytePlus, getBytePlusTask, mapBytePlusStatus } from '../src/lib/v3/byteplus';
import * as fs from 'node:fs';

const PRESENTER_URL = process.argv[2] || 'https://homotion.de/demo/Image%201.jpg';
const FACADE_URL = process.argv[3] || 'https://homotion.de/demo/source-haus.jpg';
const OUT = process.argv[4] || `${process.env.HOME}/.hermes/cache/scratch/presenter-test.mp4`;

const plan: any = {
  shots: [
    {
      shot: 'medium shot',
      start: 0,
      end: 7,
      image: 1,
      camera: 'gentle dolly-in, then static',
      action:
        'The presenter stands in front of the property, looks at the camera and speaks directly to the viewer.',
      dialogue: 'Willkommen in Ihrem neuen Zuhause.',
    },
  ],
  voiceover: '',
};

const params: any = {
  propertyType: 'rent',
  format: 'agent',
  language: 'de',
  model: 'seedance-byteplus',
  duration: 7,
  quality: 'standard',
  draft: true,
  presenterUrl: PRESENTER_URL,
};

(async () => {
  const description = await describePresenter(PRESENTER_URL);
  console.log('presenter description:', JSON.stringify(description));

  const prompt = buildVideoPrompt(params, plan, [{ room: 'Facade', url: FACADE_URL }], description);
  console.log('\nCHARACTER block:\n' + prompt.split('\n\n').find(b => b.startsWith('CHARACTER')));

  const taskId = await submitBytePlus({
    prompt,
    imageUrls: [FACADE_URL],
    resolution: '480p',
    duration: 7,
    draft: true,
  });
  console.log('\nsubmitted task:', taskId);

  const started = Date.now();
  let final: any = null;
  while (Date.now() - started < 10 * 60 * 1000) {
    await new Promise(r => setTimeout(r, 10000));
    const task = await getBytePlusTask(taskId);
    const m = mapBytePlusStatus(task);
    process.stdout.write(`  ${task.status} `);
    if (m.done || m.failed) {
      final = task;
      console.log('');
      break;
    }
  }

  if (!final) {
    console.log('TIMEOUT');
    process.exit(1);
  }
  const m = mapBytePlusStatus(final);
  console.log('status:', final.status, '| tokens:', m.tokens ?? 'n/a');
  console.log('video_url:', (m.videoUrl || '(none)').slice(0, 160));
  if (!m.videoUrl) process.exit(2);

  const res = await fetch(m.videoUrl);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(OUT, buf);
  console.log('saved', OUT, buf.length, 'bytes');
  console.log('prompt_saved', OUT + '.prompt.txt');
  fs.writeFileSync(OUT + '.prompt.txt', prompt);
})();
