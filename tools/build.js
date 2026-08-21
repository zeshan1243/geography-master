#!/usr/bin/env node
/**
 * build.js — generates the static site from /data and the templates in
 * tools/lib. Zero dependencies; run it with `npm run build` or `node tools/build.js`.
 *
 * Everything it writes is derived output: add a country to data/countries.json
 * and this produces its page, its table rows and its sitemap entry.
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  readdirSync,
  cpSync
} from 'node:fs';
import { join, dirname } from 'node:path';
import { SITE, ROOT } from './lib/layout.js';
import { decorate } from './lib/util.js';
import { mapCoverage } from './lib/mapgeo.js';
import * as pages from './lib/pages.js';

/**
 * Everything the site serves is assembled into OUT. Nothing outside it is
 * deployed, which keeps tools/, package.json and the build-time-only data
 * (data/details) off the public web.
 */
const OUT = join(ROOT, 'public');

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
  const full = join(OUT, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
  written.push(relativePath);
}

/** The output directory is rebuilt from scratch so deleted data cannot leave strays. */
function clean() {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
}

/**
 * Hand-written source that ships as-is. data/details is deliberately excluded:
 * those files feed the page generator and are never fetched by the browser.
 */
function copyStatic() {
  for (const dir of ['css', 'js']) {
    cpSync(join(ROOT, dir), join(OUT, dir), { recursive: true });
  }

  mkdirSync(join(OUT, 'data'), { recursive: true });
  for (const file of readdirSync(join(ROOT, 'data'))) {
    if (file.endsWith('.json')) cpSync(join(ROOT, 'data', file), join(OUT, 'data', file));
  }

  mkdirSync(join(OUT, 'assets'), { recursive: true });
  for (const file of readdirSync(join(ROOT, 'assets'))) {
    if (file.endsWith('.svg')) cpSync(join(ROOT, 'assets', file), join(OUT, 'assets', file));
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
  const topLanguageData = readData('top-languages');

  // Map geometry is measured once here so the browser never has to.
  const coverage = mapCoverage(countries);
  writeFileSync(
    join(ROOT, 'data', 'map-coverage.json'),
    `${JSON.stringify(coverage, null, 0)}\n`
  );
  // Land borders are needed at runtime by the border quiz. The full details
  // files stay build-time only; this is just the adjacency list, a few KB.
  writeFileSync(
    join(ROOT, 'data', 'borders.json'),
    `${JSON.stringify(
      Object.fromEntries(
        Object.entries(details)
          .filter(([, d]) => d.borders && d.borders.length)
          .map(([code, d]) => [code, d.borders])
      )
    )}\n`
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

  // One page per game. "Name the Countries" expands into a hub — play all
  // 195, or one shorter round per starting or ending letter — rather than a
  // single page, so its own entry in games.json stays the category's only
  // card.
  const LETTER_TIME_TIERS = [[3, 60], [6, 120], [10, 180], [15, 240], [20, 300], [Infinity, 360]];
  const timeLimitFor = (count) => LETTER_TIME_TIERS.find(([max]) => count <= max)[1];

  const edgeLetter = (name, position) => (position === 'end' ? name[name.length - 1] : name[0]).toUpperCase();

  const letterStats = (position) =>
    [...new Set(countries.map((c) => edgeLetter(c.name, position)))].sort().map((letter) => ({
      letter,
      slug: letter.toLowerCase(),
      count: countries.filter((c) => edgeLetter(c.name, position) === letter).length
    }));

  // Spaces and hyphens are not counted — "Sri Lanka" is 8 letters, "Timor-Leste" is 10.
  const lettersOnlyLength = (name) => name.replace(/[^A-Za-z]/g, '').length;

  const lengthStats = () =>
    [...new Set(countries.map((c) => lettersOnlyLength(c.name)))].sort((a, b) => a - b).map((length) => ({
      length,
      slug: `length-${length}`,
      count: countries.filter((c) => lettersOnlyLength(c.name) === length).length
    }));

  // Kept in sync by hand with js/quiz.js's LANDLOCKED_CODES — the click-based
  // landlocked games only need the per-continent count at build time, not
  // the full set, so it is not worth importing the browser module here.
  const LANDLOCKED_CODES = new Set([
    'AT', 'CH', 'HU', 'CZ', 'SK', 'BY', 'MD', 'RS', 'MK', 'LU', 'LI', 'AD', 'SM', 'VA', // Europe
    'ML', 'NE', 'TD', 'BF', 'CF', 'SS', 'ET', 'UG', 'RW', 'BI', 'ZM', 'ZW', 'MW', 'BW', 'LS', 'SZ', // Africa
    'KZ', 'UZ', 'TM', 'KG', 'TJ', 'AF', 'MN', 'NP', 'BT', 'LA', 'AM', 'AZ', // Asia
    'BO', 'PY' // South America (no quiz of its own, but still landlocked)
  ]);

  for (const game of games) {
    if (game.mode === 'hub') {
      const subGames = games.filter((g) => g.hubOf === game.id);
      write(`game/${game.slug}.html`, pages.hubPage(game, subGames));
      add(`/game/${game.slug}`, '0.85', 'weekly');
      continue;
    }

    if (game.mode === 'landlocked') {
      const total = countries.filter((c) => c.continent === game.continent && LANDLOCKED_CODES.has(c.code)).length;
      // Playable, linked from its hub, but kept out of the index: the three
      // continent variants are the same game with a different filter, and
      // submitting near-identical pages is what thin-content review flags.
      write(
        `game/${game.slug}.html`,
        pages.landlockedGamePage(game, games, { continent: game.continent, total, noindex: true })
      );
      continue;
    }

    if (game.mode === 'topLanguages') {
      const entry = topLanguageData.find((c) => c.continent === game.continent);
      const total = entry.languages.length;
      const seconds = timeLimitFor(total);
      write(
        `game/${game.slug}.html`,
        pages.topLanguagesGamePage(game, games, {
          continent: game.continent,
          total,
          seconds,
          convention: entry.convention,
          noindex: true
        })
      );
      continue;
    }

    if (game.mode === 'recall' && game.variants === 'letters') {
      const startLetters = letterStats('start');
      const endLetters = letterStats('end');
      const lengthGroups = lengthStats();

      write(
        `game/${game.slug}/index.html`,
        pages.recallHubPage(game, games, { startLetters, endLetters, lengthGroups })
      );
      add(`/game/${game.slug}/`, '0.9', 'weekly');

      write(
        `game/${game.slug}/all.html`,
        pages.recallGamePage(game, games, {
          letter: null,
          count: countries.length,
          seconds: 15 * 60,
          path: `game/${game.slug}/all`,
          title: game.name,
          metaTitle: game.metaTitle,
          metaDescription: game.metaDescription,
          breadcrumbLabel: 'All 195 Countries',
          intro: game.description
        })
      );
      add(`/game/${game.slug}/all`, '0.85', 'weekly');

      const POSITIONS = [
        { position: 'start', letters: startLetters, urlPrefix: '', label: 'Start With', verb: 'start' },
        { position: 'end', letters: endLetters, urlPrefix: 'ends-', label: 'End With', verb: 'end' }
      ];

      for (const { position, letters, urlPrefix, label, verb } of POSITIONS) {
        for (const { letter, slug, count } of letters) {
          const seconds = timeLimitFor(count);
          const minutes = seconds / 60;
          const urlSlug = `${urlPrefix}${slug}`;
          write(
            `game/${game.slug}/${urlSlug}.html`,
            pages.recallGamePage(game, games, {
              letter,
              letterPosition: position,
              count,
              seconds,
              path: `game/${game.slug}/${urlSlug}`,
              title: `Countries That ${label} ${letter}`,
              metaTitle: `Countries That ${label} ${letter} — Name Them All`,
              metaDescription: `Can you name all ${count} countries that ${verb} with the letter ${letter}? Free geography quiz — race the clock before time runs out.`,
              noindex: true,
              breadcrumbLabel: `${label} ${letter}`,
              intro: `Every one of the ${count} ${count === 1 ? 'country' : 'countries'} whose name ${verb}s with ${letter}. ${minutes} minute${minutes === 1 ? '' : 's'} on the clock — shorter than the full round, because there is a lot less ground to cover.`
            })
          );

        }
      }

      for (const { length, slug, count } of lengthGroups) {
        const seconds = timeLimitFor(count);
        const minutes = seconds / 60;
        write(
          `game/${game.slug}/${slug}.html`,
          pages.recallGamePage(game, games, {
            nameLength: length,
            count,
            seconds,
            path: `game/${game.slug}/${slug}`,
            title: `Countries With ${length} Letters`,
            metaTitle: `Countries With ${length} Letters — Name Them All`,
            metaDescription: `Can you name all ${count} countries whose name has exactly ${length} letters? Free geography quiz — race the clock before time runs out.`,
            noindex: true,
            breadcrumbLabel: `${length} Letters`,
            intro: `Every one of the ${count} ${count === 1 ? 'country' : 'countries'} whose name is exactly ${length} letters long, spaces and hyphens not counted. ${minutes} minute${minutes === 1 ? '' : 's'} on the clock.`
          })
        );

      }
      continue;
    }

    const html =
      game.mode === 'recall'
        ? pages.recallGamePage(game, games, {
            letter: null,
            count: countries.length,
            seconds: 15 * 60,
            path: `game/${game.slug}`,
            title: game.name,
            metaTitle: game.metaTitle,
            metaDescription: game.metaDescription,
            breadcrumbLabel: game.name,
            intro: game.description
          })
        : pages.gamePage(game, games);
    write(`game/${game.slug}.html`, html);
    add(`/game/${game.slug}`, '0.9', 'weekly');
  }

  // Countries
  write('countries/index.html', pages.countriesIndex(countries, continents));
  add('/countries/', '0.8', 'monthly');

  for (const country of countries) {
    write(`countries/${country.slug}.html`, pages.countryPage(country, countries, details));
    add(`/countries/${country.slug}`, '0.6');
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
    add(`/${list.path.replace(/\.html$/, '')}`, '0.7');
  }

  // Guides
  write('guides/index.html', pages.guidesIndex());
  add('/guides/', '0.9', 'monthly');

  for (const article of pages.ARTICLES) {
    write(`guides/${article.slug}.html`, pages.guidePage(article));
    add(`/guides/${article.slug}`, '0.8');
  }

  // Blog
  write('blog/index.html', pages.blogIndex());
  add('/blog/', '0.9', 'weekly');

  for (const post of pages.POSTS) {
    write(`blog/${post.slug}.html`, pages.blogPost(post));
    add(`/blog/${post.slug}`, '0.8');
  }

  write('practice.html', pages.practicePage());
  add('/practice', '0.8', 'weekly');

  // Static pages
  write('about.html', pages.aboutPage(countries));
  write('contact.html', pages.contactPage());
  write('privacy-policy.html', pages.privacyPage());
  write('terms.html', pages.termsPage());
  write('404.html', pages.notFoundPage());
  add('/about', '0.4', 'yearly');
  add('/contact', '0.4', 'yearly');
  add('/privacy-policy', '0.3', 'yearly');
  add('/terms', '0.3', 'yearly');

  // Site-level assets
  write('favicon.svg', favicon());
  write('site.webmanifest', manifest());
  write('robots.txt', robots());
  const ads = adsTxt();
  if (ads) write('ads.txt', ads);
  write('sitemap.xml', sitemap(urls));

  copyStatic();

  console.log(`Built ${written.length} files into public/:`);
  console.log(`  ${countries.length} country pages`);
  console.log(`  ${continents.length} continent pages`);
  console.log(`  ${games.length} game pages`);
  console.log(`  ${pages.ARTICLES.length} guides`);
  console.log(`  ${pages.POSTS.length} blog posts`);
  console.log(`  ${urls.length} URLs in sitemap.xml`);
  console.log(`  map coverage: ${playable.shape} shape / ${playable.locate} locate countries`);
}

build();
