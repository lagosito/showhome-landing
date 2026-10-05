import { getParserForUrl } from '../src/lib/portals';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

const urls = process.argv.slice(2);

(async () => {
  for (const url of urls) {
    const parser = getParserForUrl(url);
    if (!parser) {
      console.log(`\n=== ${url}\n  NO PARSER`);
      continue;
    }
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000), redirect: 'follow' });
      const html = await res.text();
      const t0 = Date.now();
      const l = parser.parse(html, url);
      const ms = Date.now() - t0;
      console.log(`\n=== ${url}`);
      console.log(`  status=${res.status} parser=${parser.name} parse=${ms}ms html=${(html.length / 1024).toFixed(0)}KB`);
      console.log(`  title=${JSON.stringify(l.title.slice(0, 90))}`);
      console.log(`  address=${JSON.stringify(l.address)} price=${JSON.stringify(l.price)} area=${JSON.stringify(l.area)} rooms=${JSON.stringify(l.rooms)}`);
      console.log(`  floorPlan=${l.floorPlanUrl ? 'yes' : 'no'} text=${l.listingText.length}ch features=${l.features.length}`);
      console.log(`  photos=${l.photos.length}`);
      l.photos.slice(0, 6).forEach((p, i) => console.log(`    ${i + 1}. ${p.url.slice(0, 130)}  alt=${JSON.stringify(p.alt.slice(0, 50))}`));
      if (l.photos.length > 6) console.log(`    … +${l.photos.length - 6} more`);
    } catch (e) {
      console.log(`\n=== ${url}\n  FETCH/PARSE ERROR: ${(e as Error).message}`);
    }
  }
})();
