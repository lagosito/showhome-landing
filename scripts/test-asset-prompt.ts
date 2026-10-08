import { buildVideoPrompt } from '../src/lib/v3/buildPrompt';

const params: any = { model: 'seedance-byteplus', format: 'agent', language: 'de', duration: 7,
  quality: 'standard', draft: true, propertyType: 'rent' };
const plan: any = { shots: [
  { shot: 'Exterior', start: 0, end: 3, camera: 'dolly', action: 'glide', image: 1 },
  { shot: 'Living room', start: 3, end: 7, camera: 'pan', action: 'reveal', image: 2 },
], voiceover: '' };
const photos = [
  { room: 'Exterior', url: 'https://x/a.jpg' },
  { room: 'Living Room', url: 'https://x/b.jpg' },
];

const withAsset = buildVideoPrompt(params as any, plan, photos, 'some text description', 'asset://asset-20261008-test');
const without = buildVideoPrompt(params as any, plan, photos, 'some text description');

const pick = (s: string) => (s.match(/CHARACTER:[\s\S]{0,320}/) || ['(none)'])[0];
console.log('--- CON asset ---\n' + pick(withAsset));
console.log('\n--- SIN asset (comportamiento actual) ---\n' + pick(without));
console.log('\nasset mention:', withAsset.includes('@Image3'), '| @Image1/@Image2 intact:',
  withAsset.includes('@Image1 shows the exterior'), withAsset.includes('@Image2 shows the living room'));
