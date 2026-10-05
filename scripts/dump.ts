import { getParserForUrl } from '../src/lib/portals';

const url = process.argv[2];

(async () => {
  const parser = getParserForUrl(url);
  if (!parser) {
    console.log('no parser');
    return;
  }
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' }, signal: AbortSignal.timeout(20000) });
  const html = await res.text();
  const l = parser.parse(html, url);
  console.log(`parser=${parser.name} status=${res.status}`);
  console.log(`title=${JSON.stringify(l.title)}`);
  console.log(`photos=${l.photos.length}`);
  l.photos.forEach((p, i) => console.log(`${i + 1}. ${p.url}`));
})();
