#!/usr/bin/env node
/**
 * build.js — generates the static site from /data and the templates in
 * tools/lib. Zero dependencies; run it with `npm run build` or `node tools/build.js`.
 *
 * Everything it writes is derived output: add a country to data/countries.json
 * and this produces its page, its table rows and its sitemap entry.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { SITE, ROOT } from './lib/layout.js';
import { decorate } from './lib/util.js';
import { mapCoverage } from './lib/mapgeo.js';
import * as pages from './lib/pages.js';

const readData = (name) => JSON.parse(readFileSync(join(ROOT, 'data', `${name}.json`), 'utf8'));

/** Per-country detail lives in one file per continent; merge them into one map. */
function readDetails() {
  const dir = join(ROOT, 'data', 'details');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .reduce((all, f) => Object.assign(all, JSON.parse(readFileSync(join(dir, f), 'utf8'))), {});
}

const written = [];

function write(relativePath, contents) {
  const full = join(ROOT, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
  written.push(relativePath);
}

/** Generated directories are cleared first so removed data cannot leave strays. */
function clean() {
  for (const dir of ['game', 'countries', 'continents', 'lists', 'guides']) {
    const full = join(ROOT, dir);
    if (existsSync(full)) rmSync(full, { recursive: true, force: true });
  }
}

/* --- Assets that are easier to generate than to hand-maintain ------------ */

function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="90">🌍</text>
</svg>
`;
}

function manifest() {
  return `${JSON.stringify(
    {
      name: SITE.name,
      short_name: SITE.shortName,
      description: SITE.tagline,
      start_url: '/',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#2563eb',
      icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
    },
    null,
    2
  )}\n`;
}

/**
 * ads.txt authorises Google to sell this site's inventory. It must be served
 * from the domain root or AdSense reports "Earnings at risk" and some buyers
 * will not bid.
 */
function adsTxt() {
  const client = SITE.adsense?.client;
  if (!client) return null;
  const publisher = client.replace(/^ca-/, '');
  return `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', SITE.url).href}
`;
}

function sitemap(urls) {
  const today = new Date().toISOString().split('T')[0];
  const entries = urls
    .map(
      ({ loc, priority, changefreq }) => `  <url>
    <loc>${new URL(loc, SITE.url).href}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

/* --- Build --------------------------------------------------------------- */

function build() {
  clean();

  const countries = decorate(readData('countries'));
  const continents = readData('continents');
  const games = readData('games');
  const details = readDetails();

  // Map geometry is measured once here so the browser never has to.
  const coverage = mapCoverage(countries);
  writeFileSync(
    join(ROOT, 'data', 'map-coverage.json'),
    `${JSON.stringify(coverage, null, 0)}\n`
  );
  const playable = {
    shape: coverage.countries.filter((c) => c.shape).length,
    locate: coverage.countries.filter((c) => c.locate).length
  };

  const urls = [];
  const add = (loc, priority, changefreq = 'monthly') => urls.push({ loc, priority, changefreq });

  // Homepage and directories
  write('index.html', pages.home(countries, games));
  add('/', '1.0', 'weekly');

  write('games/index.html', pages.gamesIndex(games));
  add('/games/', '0.9', 'weekly');

  // One page per game
  for (const game of games) {
    write(`game/${game.slug}.html`, pages.gamePage(game, games));
    add(`/game/${game.slug}.html`, '0.9', 'weekly');
  }

  // Countries
  write('countries/index.html', pages.countriesIndex(countries, continents));
  add('/countries/', '0.8', 'monthly');

  for (const country of countries) {
    write(`countries/${country.slug}.html`, pages.countryPage(country, countries, details));
    add(`/countries/${country.slug}.html`, '0.6');
  }

  // Continents
  write('continents/index.html', pages.continentsIndex(continents, countries));
  add('/continents/', '0.8', 'monthly');

  for (const continent of continents) {
    write(`continents/${continent.slug}/index.html`, pages.continentPage(continent, countries));
    add(`/continents/${continent.slug}/`, '0.7');
  }

  // Reference lists
  for (const list of pages.listPages(countries)) {
    write(list.path, list.html);
    add(`/${list.path}`, '0.7');
  }

  // Guides
  write('guides/index.html', pages.guidesIndex());
  add('/guides/', '0.9', 'monthly');

  for (const article of pages.ARTICLES) {
    write(`guides/${article.slug}.html`, pages.guidePage(article));
    add(`/guides/${article.slug}.html`, '0.8');
  }

  // Static pages
  write('about.html', pages.aboutPage(countries));
  write('contact.html', pages.contactPage());
  write('privacy-policy.html', pages.privacyPage());
  write('terms.html', pages.termsPage());
  write('404.html', pages.notFoundPage());
  add('/about.html', '0.4', 'yearly');
  add('/contact.html', '0.4', 'yearly');
  add('/privacy-policy.html', '0.3', 'yearly');
  add('/terms.html', '0.3', 'yearly');

  // Site-level assets
  write('favicon.svg', favicon());
  write('site.webmanifest', manifest());
  write('robots.txt', robots());
  const ads = adsTxt();
  if (ads) write('ads.txt', ads);
  write('sitemap.xml', sitemap(urls));

  console.log(`Built ${written.length} files:`);
  console.log(`  ${countries.length} country pages`);
  console.log(`  ${continents.length} continent pages`);
  console.log(`  ${games.length} game pages`);
  console.log(`  ${pages.ARTICLES.length} guides`);
  console.log(`  ${urls.length} URLs in sitemap.xml`);
  console.log(`  map coverage: ${playable.shape} shape / ${playable.locate} locate countries`);
}

build();
