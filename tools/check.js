#!/usr/bin/env node
/**
 * check.js — verification suite.
 *
 * Three layers:
 *   1. Data integrity (the JSON is internally consistent).
 *   2. The real quiz engine, run under a fetch stub that reads /data from disk,
 *      across every game type and difficulty.
 *   3. The generated HTML — every internal link resolves to a file that exists.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, SITE } from './lib/layout.js';
import { slugify } from './lib/util.js';

let failures = 0;
let checks = 0;

function ok(condition, message) {
  checks += 1;
  if (!condition) {
    failures += 1;
    console.error(`  ✗ ${message}`);
  }
  return condition;
}

function section(name) {
  console.log(`\n${name}`);
}

const read = (name) => JSON.parse(readFileSync(join(ROOT, 'data', `${name}.json`), 'utf8'));

/* --- 1. Data ------------------------------------------------------------- */

const countries = read('countries');
const landmarks = read('landmarks');
const waters = read('oceans');
const continents = read('continents');
const games = read('games');
const coverage = read('map-coverage');
const details = (() => {
  const dir = join(ROOT, 'data', 'details');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .reduce((all, f) => Object.assign(all, JSON.parse(readFileSync(join(dir, f), 'utf8'))), {});
})();

function checkData() {
  section('Data integrity');

  ok(countries.length === 195, `expected 195 countries, found ${countries.length}`);

  const names = new Set();
  const codes = new Set();
  const slugs = new Set();
  const continentNames = new Set(continents.map((c) => c.name));

  for (const c of countries) {
    ok(!names.has(c.name), `duplicate country name: ${c.name}`);
    ok(!codes.has(c.code), `duplicate country code: ${c.code}`);
    names.add(c.name);
    codes.add(c.code);

    const slug = slugify(c.name);
    ok(!slugs.has(slug), `duplicate slug: ${slug}`);
    slugs.add(slug);

    ok(/^[A-Z]{2}$/.test(c.code), `${c.name}: code must be two uppercase letters`);
    ok(Boolean(c.capital), `${c.name}: missing capital`);
    ok(continentNames.has(c.continent), `${c.name}: unknown continent "${c.continent}"`);
    ok([1, 2, 3, 4].includes(c.tier), `${c.name}: tier must be 1-4`);
    ok(c.population > 0, `${c.name}: population must be positive`);
    ok(c.area > 0, `${c.name}: area must be positive`);
    ok(Boolean(c.currency && c.language), `${c.name}: missing currency or language`);
  }

  // Declared continent counts must match the country list.
  for (const continent of continents) {
    const actual = countries.filter((c) => c.continent === continent.name).length;
    ok(
      actual === continent.countries,
      `${continent.name}: declares ${continent.countries} countries, data has ${actual}`
    );
    ok(Boolean(continent.slug && continent.summary), `${continent.name}: missing slug or summary`);
    ok(Array.isArray(continent.facts) && continent.facts.length >= 3, `${continent.name}: needs at least 3 facts`);
  }

  // Every landmark must point at a country that exists.
  for (const l of landmarks) {
    ok(names.has(l.country), `landmark "${l.name}" references unknown country "${l.country}"`);
    ok(continentNames.has(l.continent), `landmark "${l.name}": unknown continent`);
    ok(Boolean(l.fact), `landmark "${l.name}": missing fact`);
  }

  for (const w of waters) {
    ok(Boolean(w.name && w.fact && w.icon), `water "${w.name}": missing field`);
    ok(['Ocean', 'Sea'].includes(w.type), `water "${w.name}": type must be Ocean or Sea`);
  }

  const categories = new Set(games.map((g) => g.category));
  for (const category of categories) {
    const inCategory = games.filter((g) => g.category === category).length;
    ok(inCategory >= 2, `category "${category}" has only ${inCategory} game`);
  }

  const gameSlugs = new Set();
  for (const g of games) {
    ok(!gameSlugs.has(g.slug), `duplicate game slug: ${g.slug}`);
    gameSlugs.add(g.slug);
    ok(Boolean(g.metaTitle && g.metaDescription), `game "${g.name}": missing SEO metadata`);
    ok(g.metaDescription.length <= 165, `game "${g.name}": meta description too long (${g.metaDescription.length})`);
  }
}

function checkDetails() {
  section('Country detail');

  const codes = new Set(countries.map((c) => c.code));
  ok(Object.keys(details).length === 195, `expected 195 detail entries, found ${Object.keys(details).length}`);

  let borderCount = 0;
  for (const [code, d] of Object.entries(details)) {
    ok(codes.has(code), `detail entry for unknown country code ${code}`);
    ok(Array.isArray(d.facts) && d.facts.length >= 3, `${code}: needs at least 3 facts`);
    ok(d.facts.every((f) => f.split(' ').length >= 10), `${code}: a fact is too short to be worth showing`);
    ok(Array.isArray(d.cities) && d.cities.length > 0, `${code}: no cities listed`);
    ok(Boolean(d.region), `${code}: no region`);
    ok(d.highest && d.highest.name && d.highest.m > 0, `${code}: highest point missing`);

    // Borders must be mutual. This is the strongest check available on the
    // data: a one-sided border is always a mistake in one of the two entries.
    for (const other of d.borders) {
      borderCount += 1;
      ok(codes.has(other), `${code}: border with unknown code ${other}`);
      ok(
        details[other] && details[other].borders.includes(code),
        `${code} borders ${other}, but ${other} does not border ${code}`
      );
    }
  }

  // Facts are the point of these pages; duplicated ones mean templated filler.
  const seen = new Map();
  for (const [code, d] of Object.entries(details)) {
    for (const fact of d.facts) {
      if (seen.has(fact)) ok(false, `${code} repeats a fact already used by ${seen.get(fact)}`);
      seen.set(fact, code);
    }
  }
  console.log(`  ${seen.size} distinct facts, ${borderCount / 2} mutual land borders`);
}

function checkMapCoverage() {
  section('Map coverage');

  const codes = new Set(countries.map((c) => c.code));
  ok(coverage.countries.length === 195, `map coverage should list 195 countries, has ${coverage.countries.length}`);
  ok(coverage.viewBox.width > 0 && coverage.viewBox.height > 0, 'map viewBox is missing');

  let shape = 0;
  let locate = 0;
  for (const entry of coverage.countries) {
    ok(codes.has(entry.code), `map coverage lists unknown country code ${entry.code}`);
    ok(entry.box !== null, `${entry.name}: no path found in world.svg`);
    if (entry.shape) shape += 1;
    if (entry.locate) locate += 1;

    // A country playable on the map must be big enough to see and to tap.
    if (entry.locate) {
      const maxDim = Math.max(entry.box.width, entry.box.height);
      ok(maxDim >= coverage.rules.locate.minDim, `${entry.name}: marked locate-playable but only ${maxDim} units`);
      ok(entry.area >= coverage.rules.locate.minArea, `${entry.name}: marked locate-playable but area ${entry.area}`);
    }
  }

  // Every difficulty must have enough countries to fill a 10-question round.
  const tiers = { easy: [1], medium: [1, 2], hard: [2, 3], expert: [3, 4] };
  for (const mode of ['shape', 'locate']) {
    for (const [name, allowed] of Object.entries(tiers)) {
      const n = coverage.countries.filter((c) => c[mode] && allowed.includes(c.tier)).length;
      ok(n >= 10, `${mode}/${name}: only ${n} playable countries, need at least 10`);
    }
  }
  console.log(`  ${shape} countries usable as shapes, ${locate} on the map (of 195)`);
}

/* --- 2. The quiz engine -------------------------------------------------- */

/** Lets the browser modules run in Node by serving /data from disk. */
function installFetchStub() {
  globalThis.fetch = async (input) => {
    const href = typeof input === 'string' ? input : input.href;
    const file = join(ROOT, 'data', href.split('/data/')[1]);
    if (!existsSync(file)) return { ok: false, status: 404, json: async () => null };
    return { ok: true, status: 200, json: async () => JSON.parse(readFileSync(file, 'utf8')) };
  };
}

async function checkEngine() {
  section('Quiz engine');
  installFetchStub();

  const quiz = await import('../js/quiz.js');
  const score = await import('../js/score.js');

  // Driven from the catalogue so a new game cannot be added without being
  // exercised at every difficulty.
  const types = games.map((g) => g.id);
  const difficulties = quiz.DIFFICULTIES.map((d) => d.id);

  for (const type of types) {
    for (const id of difficulties) {
      const round = await quiz.buildRound({ type, difficulty: id, count: quiz.DEFAULT_QUESTIONS });

      ok(round.length > 0, `${type}/${id}: produced no questions`);
      ok(
        round.length <= quiz.DEFAULT_QUESTIONS,
        `${type}/${id}: produced more than ${quiz.DEFAULT_QUESTIONS} questions`
      );

      // Small datasets (60 landmarks, 30 bodies of water) legitimately cap
      // below the full round rather than being padded with repeats.
      ok(round.length >= 6, `${type}/${id}: only ${round.length} questions available`);

      const subjects = new Set();
      for (const q of round) {
        // The map quiz answers on the map itself, so it has no option buttons.
        const expectedOptions = q.interaction === 'map' ? 0 : 4;
        ok(
          q.options.length === expectedOptions,
          `${type}/${id}: expected ${expectedOptions} options, got ${q.options.length}`
        );
        ok(
          new Set(q.options).size === q.options.length,
          `${type}/${id}: duplicate options in "${q.prompt}"`
        );
        if (expectedOptions) {
          ok(q.options.includes(q.answer), `${type}/${id}: answer missing from options`);
        } else {
          ok(Boolean(q.answerCode && q.visual.box), `${type}/${id}: map question needs answerCode and box`);
        }
        ok(Boolean(q.prompt && q.explanation), `${type}/${id}: missing prompt or explanation`);
        ok(Boolean(q.visual), `${type}/${id}: missing visual`);
        ok(!subjects.has(q.id), `${type}/${id}: repeated question in one round`);
        subjects.add(q.id);
      }
    }
  }

  // Expert is a survival mode: no fixed length, ends on the first mistake.
  const expert = quiz.difficulty('expert');
  ok(expert.survival === true, 'expert difficulty should be marked survival');
  ok(
    quiz.DIFFICULTIES.filter((d) => d.survival).length === 1,
    'exactly one difficulty should be survival'
  );

  for (const type of types) {
    const run = await quiz.buildRound({ type, difficulty: 'expert', count: quiz.SURVIVAL_MAX });
    const normal = await quiz.buildRound({ type, difficulty: 'expert', count: quiz.DEFAULT_QUESTIONS });
    ok(
      run.length >= normal.length,
      `${type}: survival round (${run.length}) should offer at least a normal round (${normal.length})`
    );
    ok(
      new Set(run.map((q) => q.id)).size === run.length,
      `${type}: survival round repeats a question`
    );
  }

  // The border quiz is the one game where a bad distractor makes a question
  // have two right answers, so every option is checked against the real
  // adjacency list rather than trusted.
  {
    const adjacency = read('borders');
    const byName = Object.fromEntries(countries.map((c) => [c.name, c.code]));
    let ambiguous = 0;
    let inspected = 0;

    for (const id of difficulties) {
      for (let run = 0; run < 4; run += 1) {
        const round = await quiz.buildRound({ type: 'borders', difficulty: id, count: 30 });
        for (const question of round) {
          const subject = question.prompt
            .replace('Which country shares a land border with ', '')
            .replace('?', '');
          const neighbours = new Set(adjacency[byName[subject]] || []);
          const hits = question.options.filter((o) => neighbours.has(byName[o]));
          inspected += 1;
          if (hits.length !== 1 || hits[0] !== question.answer) ambiguous += 1;
        }
      }
    }
    ok(ambiguous === 0, `${ambiguous} of ${inspected} border questions have more than one correct answer`);
    console.log(`  ${inspected} border questions verified against the adjacency list`);
  }

  // Practice rounds must rebuild exactly the remembered questions, from any
  // game, and never invent extras.
  {
    const wanted = [
      { kind: 'flags', subject: 'JP' },
      { kind: 'capitals', subject: 'TH' },
      { kind: 'waters', subject: 'Red Sea' },
      { kind: 'borders', subject: 'DE' },
      { kind: 'landmarks', subject: 'Petra' },
      { kind: 'nameToFlag', subject: 'BR' },
      { kind: 'countryToLandmark', subject: 'Uluru' },
      { kind: 'shapes', subject: 'IT' },
      { kind: 'locate', subject: 'PE' },
      { kind: 'currencies', subject: 'VN' },
      { kind: 'ghostGame', subject: 'XX' } // a retired game must be skipped, not throw
    ];
    const round = await quiz.buildPracticeRound({ items: wanted, count: 30 });
    ok(round.length === 10, `practice round should rebuild 10 questions, got ${round.length}`);

    const got = new Set(round.map((q) => `${q.kind}|${q.subject}`));
    for (const { kind, subject } of wanted.slice(0, 10)) {
      ok(got.has(`${kind}|${subject}`), `practice round is missing ${kind}/${subject}`);
    }
    for (const q of round) {
      ok(Boolean(q.subject), `practice question ${q.id} has no subject`);
      ok(
        q.interaction === 'map' ? q.options.length === 0 : q.options.includes(q.answer),
        `practice question ${q.id} is malformed`
      );
    }
    ok(quiz.missKey('flags', 'JP') === 'flags|JP', 'missKey should be kind|subject');
  }

  // Every question must carry a stable subject, or a miss cannot be remembered.
  for (const type of types) {
    const round = await quiz.buildRound({ type, difficulty: 'medium', count: 10 });
    const missing = round.filter((q) => !q.subject).length;
    ok(missing === 0, `${type}: ${missing} questions have no subject to remember a miss by`);
  }

  // The daily challenge must be identical for everyone on a given day.
  const seed = quiz.dailySeed('2026-08-11');
  const a = await quiz.buildRound({ type: 'mixed', difficulty: 'medium', count: 10, rng: quiz.makeRng(seed) });
  const b = await quiz.buildRound({ type: 'mixed', difficulty: 'medium', count: 10, rng: quiz.makeRng(seed) });
  ok(
    JSON.stringify(a.map((q) => q.id)) === JSON.stringify(b.map((q) => q.id)),
    'daily challenge is not reproducible from its seed'
  );

  const different = await quiz.buildRound({
    type: 'mixed',
    difficulty: 'medium',
    count: 10,
    rng: quiz.makeRng(quiz.dailySeed('2026-08-12'))
  });
  ok(
    JSON.stringify(a.map((q) => q.id)) !== JSON.stringify(different.map((q) => q.id)),
    'daily challenge is the same on different days'
  );

  section('Scoring');
  ok(score.scoreAnswer({ correct: false, elapsedMs: 100, streak: 0 }).points === 0, 'wrong answer should score 0');
  ok(score.scoreAnswer({ correct: true, elapsedMs: 9000, streak: 1 }).points === 100, 'slow correct answer should score 100');
  ok(score.scoreAnswer({ correct: true, elapsedMs: 1000, streak: 1 }).points === 150, 'fast correct answer should score 150');
  ok(score.scoreAnswer({ correct: true, elapsedMs: 9000, streak: 3 }).points === 150, '3-streak should add 50');
  ok(score.scoreAnswer({ correct: true, elapsedMs: 1000, streak: 10 }).points === 400, '10-streak fast should score 400');
  ok(score.stars(8, 10) === 4, '8/10 should be 4 stars');
  ok(score.stars(10, 10) === 5, '10/10 should be 5 stars');
  ok(score.starString(4) === '★★★★☆', 'star string should pad to five');
  ok(score.survivalStars(0) === 0, 'a zero-question run should score no stars');
  ok(score.survivalStars(9) === 2, 'a 9-question run should be 2 stars');
  ok(score.survivalStars(10) === 3, 'a 10-question run should be 3 stars');
  ok(score.survivalStars(45) === 5, 'a 45-question run should cap at 5 stars');
}

/* --- 3. AdSense ---------------------------------------------------------- */

function checkAds() {
  const client = SITE.adsense?.client;
  if (!client) return;
  section('AdSense');

  ok(/^ca-pub-\d{16}$/.test(client), `publisher id looks wrong: ${client}`);

  for (const [name, slot] of Object.entries(SITE.adsense.slots || {})) {
    ok(/^\d{10}$/.test(slot), `slot "${name}" should be 10 digits, got "${slot}"`);
  }

  // ads.txt must exist and name the same publisher, or AdSense flags the site.
  const adsTxtPath = join(OUT, 'ads.txt');
  ok(existsSync(adsTxtPath), 'ads.txt is missing');
  if (existsSync(adsTxtPath)) {
    const body = readFileSync(adsTxtPath, 'utf8');
    ok(
      body.includes(client.replace(/^ca-/, '')) && body.includes('f08c47fec0942fa0'),
      'ads.txt does not authorise this publisher id'
    );
  }

  const files = htmlFiles();
  let withUnit = 0;
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const name = relative(ROOT, file);

    ok(
      html.includes(`adsbygoogle.js?client=${client}`),
      `${name}: missing the AdSense loader script`
    );

    if (html.includes('data-ad-slot-id=')) withUnit += 1;

    // Inline push() would fire before the results screen is laid out; ads.js
    // owns activation instead. Guard against the snippet creeping back in.
    ok(
      !/adsbygoogle\s*=\s*window\.adsbygoogle/.test(html),
      `${name}: inline adsbygoogle push found — activation belongs in js/ads.js`
    );

    for (const match of html.matchAll(/data-ad-slot-id="([^"]*)"/g)) {
      ok(/^\d{10}$/.test(match[1]), `${name}: malformed ad slot "${match[1]}"`);
    }

    // <ins> must not be in the served HTML: a hidden one would swallow the
    // push meant for a visible unit (see js/ads.js).
    ok(
      !html.includes('class="adsbygoogle"'),
      `${name}: static <ins class="adsbygoogle"> found — units are injected by js/ads.js`
    );
  }
  const allHtml = files.map((f) => readFileSync(f, 'utf8')).join('');
  for (const [name, slot] of Object.entries(SITE.adsense.slots || {})) {
    ok(allHtml.includes(`data-ad-slot-id="${slot}"`), `slot "${name}" (${slot}) is never placed on any page`);
  }
  console.log(`  ${withUnit} of ${files.length} pages carry an ad unit`);
}

/* --- 3. Generated HTML --------------------------------------------------- */

const OUT = join(ROOT, 'public');

function htmlFiles(dir = OUT, found = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.git', 'tools', 'data', 'css', 'js', 'assets'].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, found);
    else if (entry.endsWith('.html')) found.push(full);
  }
  return found;
}

async function checkGuides() {
  section('Guides');
  const { ARTICLES } = await import('./lib/articles.js');

  const slugs = new Set();
  for (const a of ARTICLES) {
    ok(!slugs.has(a.slug), `duplicate guide slug: ${a.slug}`);
    slugs.add(a.slug);

    const words = a.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    // A short guide is filler. If one cannot clear this bar it should be cut.
    ok(words >= 800, `guide "${a.slug}" is only ${words} words`);
    ok(Boolean(a.metaTitle && a.description && a.summary), `guide "${a.slug}": missing metadata`);
    ok(a.description.length <= 165, `guide "${a.slug}": meta description too long`);
    ok((a.body.match(/<h2>/g) || []).length >= 4, `guide "${a.slug}": needs more structure`);
    ok(!/<h1[ >]/.test(a.body), `guide "${a.slug}": body must not contain its own <h1>`);
    ok(existsSync(join(OUT, 'guides', `${a.slug}.html`)), `guide "${a.slug}" was not generated`);
  }

  const total = ARTICLES.reduce(
    (n, a) => n + a.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
    0
  );
  console.log(`  ${ARTICLES.length} guides, ${total} words total`);
}

/**
 * Two layout traps that are invisible in Node but break every page on a phone,
 * so they get static guards rather than trust.
 */
function checkLayoutTraps() {
  section('Layout traps');

  const files = htmlFiles();
  const sample = readFileSync(files[0], 'utf8');

  // 1. The mobile drawer must not live inside <header>. .site-header uses
  //    backdrop-filter, which makes it a containing block for position:fixed
  //    descendants — nesting the drawer collapses it to the header's height.
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const headerEnd = html.indexOf('</header>');
    const drawer = html.indexOf('id="nav-drawer"');
    ok(
      drawer === -1 || (headerEnd !== -1 && drawer > headerEnd),
      `${relative(ROOT, file)}: nav drawer is inside <header> — backdrop-filter will collapse it`
    );
  }

  // 2. Elements are shown and hidden with the `hidden` attribute all over the
  //    engine, and a class that sets `display` overrides it. One global rule
  //    covers every component; if it goes, everything toggled by `hidden`
  //    silently stays on screen.
  const mainCss = readFileSync(join(ROOT, 'css', 'main.css'), 'utf8');
  ok(
    /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/.test(mainCss),
    'css/main.css must keep the global `[hidden] { display: none !important }` rule'
  );

  // 3. Any class used alongside `wrap` must not set the padding shorthand with
  //    a zero inline value: same specificity as .wrap, so source order decides
  //    and the side padding silently disappears.
  const partners = new Set();
  for (const match of sample.matchAll(/class="([^"]*\bwrap\b[^"]*)"/g)) {
    for (const cls of match[1].split(/\s+/)) if (cls && cls !== 'wrap') partners.add(cls);
  }

  const css = ['css/main.css', 'css/responsive.css']
    .map((f) => readFileSync(join(ROOT, f), 'utf8'))
    .join('\n');

  for (const cls of partners) {
    const rule = new RegExp(`\\.${cls}\\s*\\{([^}]*)\\}`, 'g');
    for (const match of css.matchAll(rule)) {
      const shorthand = /(^|;)\s*padding:\s*([^;]+)/.exec(match[1]);
      if (!shorthand) continue;
      const parts = shorthand[2].trim().split(/\s+/);
      const inline = parts.length === 1 ? parts[0] : parts[1];
      ok(
        !/^0\D*$/.test(inline),
        `.${cls} sets "padding: ${shorthand[2].trim()}" and is used with .wrap — ` +
          'this zeroes the inline padding. Use padding-block instead.'
      );
    }
  }

  console.log(`  drawer placement checked on ${files.length} pages; ` +
    `${partners.size} classes paired with .wrap`);
}

/**
 * Catches a function that is called in a browser module but never imported.
 * ES modules make this a silent failure: the name resolves to a missing global
 * and only throws when that code path first runs, which a page can easily never
 * do during a build. One such bug (buildPracticeRound) shipped before this
 * check existed.
 */
/**
 * Blanks out comments and string bodies so the scan only sees real code.
 * Template literals keep their `${...}` contents, since those hold real calls.
 */
function codeOnly(src) {
  let out = '';
  let i = 0;
  const depth = [];

  while (i < src.length) {
    const two = src.slice(i, i + 2);

    if (two === '//') {
      while (i < src.length && src[i] !== '\n') { out += ' '; i += 1; }
      continue;
    }
    if (two === '/*') {
      while (i < src.length && src.slice(i, i + 2) !== '*/') { out += src[i] === '\n' ? '\n' : ' '; i += 1; }
      out += '  ';
      i += 2;
      continue;
    }
    if (src[i] === "'" || src[i] === '"') {
      const quote = src[i];
      out += ' ';
      i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') { out += ' '; i += 1; }
        out += ' ';
        i += 1;
      }
      out += ' ';
      i += 1;
      continue;
    }
    if (src[i] === '`') {
      out += ' ';
      i += 1;
      while (i < src.length && src[i] !== '`') {
        if (src[i] === '\\') { out += ' '; i += 2; continue; }
        if (src.slice(i, i + 2) === '${') {
          // Keep interpolated expressions: they contain real calls.
          out += '  ';
          i += 2;
          let braces = 1;
          while (i < src.length && braces > 0) {
            if (src[i] === '{') braces += 1;
            if (src[i] === '}') braces -= 1;
            out += braces === 0 ? ' ' : src[i];
            i += 1;
          }
          continue;
        }
        out += src[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      out += ' ';
      i += 1;
      continue;
    }
    out += src[i];
    i += 1;
  }
  return out;
}

function checkModuleImports() {
  section('Module imports');

  const dir = join(ROOT, 'js');
  const files = readdirSync(dir).filter((f) => f.endsWith('.js'));

  // What each module exports.
  const exportsOf = new Map();
  const sources = new Map();
  for (const file of files) {
    const src = codeOnly(readFileSync(join(dir, file), 'utf8'));
    sources.set(file, src);
    const names = new Set();
    for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
    for (const m of src.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
    for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
      for (const part of m[1].split(',')) {
        const name = part.split(/\s+as\s+/).pop().trim();
        if (name) names.add(name);
      }
    }
    exportsOf.set(file, names);
  }

  let calls = 0;
  for (const [file, src] of sources) {
    // Names this file brings in or defines itself.
    const available = new Set();
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from/g)) {
      for (const part of m[1].split(',')) {
        const name = part.split(/\s+as\s+/).pop().trim();
        if (name) available.add(name);
      }
    }
    for (const m of src.matchAll(/(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g)) {
      available.add(m[1]);
    }

    // Anything exported by a sibling module and called here must be available.
    const foreign = new Set();
    for (const [other, names] of exportsOf) {
      if (other === file) continue;
      for (const n of names) foreign.add(n);
    }

    for (const m of src.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) {
      const name = m[1];
      if (!foreign.has(name) || available.has(name)) continue;
      calls += 1;
      ok(false, `js/${file} calls ${name}() but never imports it`);
    }
  }

  console.log(`  ${files.length} browser modules checked for missing imports`);
  return calls;
}

function checkLinks() {
  section('Generated pages and links');

  const files = htmlFiles();
  ok(files.length > 200, `expected 200+ generated pages, found ${files.length}`);

  const missing = new Map();
  let linkCount = 0;

  for (const file of files) {
    const html = readFileSync(file, 'utf8');

    ok(/<title>[^<]{10,}<\/title>/.test(html), `${relative(ROOT, file)}: missing or short <title>`);
    ok(/name="description" content="[^"]{50,}"/.test(html), `${relative(ROOT, file)}: missing or short meta description`);
    ok((html.match(/<h1[ >]/g) || []).length === 1, `${relative(ROOT, file)}: should have exactly one <h1>`);
    ok(/rel="canonical"/.test(html), `${relative(ROOT, file)}: missing canonical link`);

    for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const target = match[1];
      linkCount += 1;
      const candidates = [join(OUT, target), join(OUT, target, 'index.html')];
      if (!candidates.some((c) => existsSync(c))) {
        if (!missing.has(target)) missing.set(target, relative(ROOT, file));
      }
    }
  }

  for (const [target, from] of missing) {
    ok(false, `broken link ${target} (first seen in ${from})`);
  }
  console.log(`  checked ${linkCount} internal links across ${files.length} pages`);
}

/* --- Run ----------------------------------------------------------------- */

checkData();
checkDetails();
checkMapCoverage();
await checkEngine();
checkAds();
checkModuleImports();
checkLayoutTraps();
await checkGuides();
checkLinks();

console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures) {
  console.error(`${failures} failed`);
  process.exit(1);
}
console.log('All good.');
