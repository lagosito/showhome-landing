import { describePresenter } from '../src/lib/v3/presenter';
import { buildVideoPrompt } from '../src/lib/v3/buildPrompt';

const PRESENTER_URL = process.argv[2] || 'https://homotion.de/demo/Image%201.jpg';

const fakePlan: any = {
  shots: [
    {
      shot: 'medium shot',
      start: 0,
      end: 7,
      image: 1,
      camera: 'gentle dolly-in',
      action: 'Presenter greets the camera in front of the property.',
      dialogue: 'Willkommen in Ihrem neuen Zuhause.',
    },
  ],
  voiceover: '',
};

(async () => {
  const params: any = {
    propertyType: 'rent',
    format: 'agent',
    language: 'de',
    model: 'seedance-byteplus',
    duration: 7,
    quality: 'standard',
    draft: true,
  };
  const photos = [{ room: 'Facade', url: 'https://homotion.de/demo/source-haus.jpg' }];

  const desc = await describePresenter(PRESENTER_URL);
  console.log('=== describePresenter() ===');
  console.log(JSON.stringify({ url: PRESENTER_URL, description: desc }, null, 2));

  console.log('\n=== prompt WITH presenter description ===');
  console.log(buildVideoPrompt(params, fakePlan, photos, desc));

  console.log('\n=== prompt WITHOUT presenter (current fallback card) ===');
  const noDesc = buildVideoPrompt(params, fakePlan, photos, null);
  console.log(noDesc.split('\n\n').filter(b => b.startsWith('CHARACTER')).join('\n'));
})();
