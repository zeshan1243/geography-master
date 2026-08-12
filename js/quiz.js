/**
 * quiz.js — turns the datasets into rounds of questions.
 *
 * Pure-ish: everything here takes a random source and returns plain objects,
 * so the daily challenge can pass a seeded generator and get the same round
 * for every player.
 */

import {
  countries,
  landmarks,
  waters,
  continents as continentData,
  mapCoverage,
  borders as borderData
} from './data.js';

export const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   blurb: 'Countries you probably know', tiers: [1] },
  { id: 'medium', label: 'Medium', blurb: 'Test your knowledge',         tiers: [1, 2] },
  { id: 'hard',   label: 'Hard',   blurb: 'Less common countries',       tiers: [2, 3] },
  {
    id: 'expert',
    label: 'Expert',
    blurb: 'Sudden death — one wrong answer ends the run',
    tiers: [3, 4],
    survival: true
  }
];

export const DEFAULT_QUESTIONS = 30;

/**
 * Survival rounds have no fixed length, so they are built from as much of the
 * pool as exists and end on the first wrong answer. Clearing the whole pool is
 * a legitimate — and very rare — way to finish.
 */
export const SURVIVAL_MAX = 250;

export function difficulty(id) {
  return DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1];
}

/* --- Randomness --------------------------------------------------------- */

/** Deterministic PRNG (mulberry32) seeded from any string. */
export function makeRng(seed) {
  let h = 2166136261 >>> 0;
  const text = String(seed);
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomRng = () => Math.random;

export function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function sample(list, count, rng) {
  return shuffle(list, rng).slice(0, count);
}

/**
 * Three wrong answers, preferring items that are plausible (same continent /
 * same pool) before falling back to the full dataset.
 */
function distractors(correct, pools, project, rng, count = 3) {
  const seen = new Set([project(correct)]);
  const picked = [];

  for (const pool of pools) {
    if (picked.length >= count) break;
    const candidates = shuffle(pool, rng);
    for (const item of candidates) {
      if (picked.length >= count) break;
      const value = project(item);
      if (seen.has(value)) continue;
      seen.add(value);
      picked.push(value);
    }
  }
  return picked;
}

function poolFor(list, tiers) {
  const inTier = list.filter((item) => tiers.includes(item.tier));
  // Small datasets (landmarks, seas) can run thin at the hard end.
  return inTier.length >= 6 ? inTier : list;
}

/* --- Question builders --------------------------------------------------- */

function flagQuestion(country, pool, all, rng, index) {
  const sameContinent = pool.filter((c) => c.continent === country.continent);
  const options = shuffle(
    [country.name, ...distractors(country, [sameContinent, pool, all], (c) => c.name, rng)],
    rng
  );
  return {
    id: `flags-${country.code}-${index}`,
    kind: 'flags',
    prompt: "Which country's flag is this?",
    visual: { kind: 'flag', value: country.flag },
    options,
    answer: country.name,
    explanation: `${country.flag} ${country.name} — capital ${country.capital}, in ${country.continent}.`
  };
}

function capitalQuestion(country, pool, all, rng, index) {
  const sameContinent = pool.filter((c) => c.continent === country.continent);
  const options = shuffle(
    [country.capital, ...distractors(country, [sameContinent, pool, all], (c) => c.capital, rng)],
    rng
  );
  return {
    id: `capitals-${country.code}-${index}`,
    kind: 'capitals',
    prompt: `What is the capital of ${country.name}?`,
    visual: { kind: 'subject', value: country.name, icon: country.flag, sub: country.continent },
    options,
    answer: country.capital,
    explanation: `${country.capital} is the capital of ${country.name}.`
  };
}

function countryQuestion(country, pool, all, rng, index) {
  const sameContinent = pool.filter((c) => c.continent === country.continent);
  const options = shuffle(
    [country.name, ...distractors(country, [sameContinent, pool, all], (c) => c.name, rng)],
    rng
  );
  return {
    id: `countries-${country.code}-${index}`,
    kind: 'countries',
    prompt: 'Which country matches these clues?',
    visual: {
      kind: 'clues',
      lines: [
        ['Capital', country.capital],
        ['Continent', country.continent],
        ['Currency', country.currency]
      ]
    },
    options,
    answer: country.name,
    explanation: `${country.flag} ${country.name} — capital ${country.capital}, currency ${country.currency}.`
  };
}

function continentQuestion(country, _pool, _all, rng, index, continentNames) {
  const others = continentNames.filter((c) => c !== country.continent);
  const options = shuffle([country.continent, ...sample(others, 3, rng)], rng);
  return {
    id: `continents-${country.code}-${index}`,
    kind: 'continents',
    prompt: `Which continent is ${country.name} in?`,
    visual: { kind: 'subject', value: country.name, icon: country.flag, sub: country.capital },
    options,
    answer: country.continent,
    explanation: `${country.name} is in ${country.continent}.`
  };
}

function landmarkQuestion(landmark, pool, allCountries, rng, index) {
  const sameContinent = allCountries.filter(
    (c) => c.continent === landmark.continent && c.name !== landmark.country
  );
  const options = shuffle(
    [
      landmark.country,
      ...distractors(
        { name: landmark.country },
        [sameContinent, allCountries],
        (c) => c.name,
        rng
      )
    ],
    rng
  );
  return {
    id: `landmarks-${index}-${landmark.name}`,
    kind: 'landmarks',
    prompt: `In which country is ${landmark.name}?`,
    visual: { kind: 'subject', value: landmark.name, icon: landmark.icon, sub: landmark.city },
    options,
    answer: landmark.country,
    explanation: landmark.fact
  };
}

function waterQuestion(water, pool, all, rng, index) {
  const sameType = pool.filter((w) => w.type === water.type);
  const options = shuffle(
    [water.name, ...distractors(water, [sameType, pool, all], (w) => w.name, rng)],
    rng
  );
  return {
    id: `waters-${index}-${water.name}`,
    kind: 'waters',
    prompt: 'Which body of water is described?',
    visual: { kind: 'subject', value: water.fact, icon: water.icon, sub: water.type },
    options,
    answer: water.name,
    explanation: `${water.name} — ${water.fact}`
  };
}

function shapeQuestion(country, pool, all, rng, index) {
  const sameContinent = pool.filter((c) => c.continent === country.continent);
  const options = shuffle(
    [country.name, ...distractors(country, [sameContinent, pool, all], (c) => c.name, rng)],
    rng
  );
  return {
    id: `shapes-${country.code}-${index}`,
    kind: 'shapes',
    prompt: 'Which country has this shape?',
    visual: { kind: 'shape', code: country.code, name: country.name },
    options,
    answer: country.name,
    explanation: `${country.flag} ${country.name} — capital ${country.capital}, in ${country.continent}.`
  };
}

function locateQuestion(country, pool, all, rng, index) {
  return {
    id: `locate-${country.code}-${index}`,
    kind: 'locate',
    interaction: 'map',
    prompt: `Find ${country.name} on the map`,
    visual: { kind: 'map', code: country.code, box: country.mainBox, name: country.name },
    // The map itself is the answer surface, so there are no option buttons.
    options: [],
    answer: country.name,
    answerCode: country.code,
    explanation: `${country.flag} ${country.name} — capital ${country.capital}, in ${country.continent}.`
  };
}

/**
 * Countries a map game can actually use, merged with the full country record.
 * The playable set is smaller than 195: microstates have no usable outline.
 */
async function mapPool(mode, tiers) {
  const [all, coverage] = await Promise.all([countries(), mapCoverage()]);
  const byCode = new Map(all.map((c) => [c.code, c]));

  const usable = coverage.countries
    .filter((entry) => entry[mode] && byCode.has(entry.code))
    .map((entry) => ({
      ...byCode.get(entry.code),
      box: entry.box,
      // Framing follows the main landmass, not outlying island territories.
      mainBox: entry.mainBox || entry.box
    }));

  const inTier = usable.filter((c) => tiers.includes(c.tier));
  return { pool: inTier.length >= 6 ? inTier : usable, all: usable };
}

/* --- Reverse and attribute questions ------------------------------------- */

/** "Bangkok is the capital of which country?" — the capital quiz backwards. */
function capitalToCountryQuestion(country, pool, all, rng, index) {
  const sameContinent = pool.filter((c) => c.continent === country.continent);
  const options = shuffle(
    [country.name, ...distractors(country, [sameContinent, pool, all], (c) => c.name, rng)],
    rng
  );
  return {
    id: `capitalToCountry-${country.code}-${index}`,
    kind: 'capitalToCountry',
    prompt: `${country.capital} is the capital of which country?`,
    // Deliberately no continent hint: that would give half the answer away.
    visual: { kind: 'subject', value: country.capital },
    options,
    answer: country.name,
    explanation: `${country.flag} ${country.capital} is the capital of ${country.name}, in ${country.continent}.`
  };
}

/** "Which flag belongs to Japan?" — recall rather than recognition. */
function nameToFlagQuestion(country, pool, all, rng, index) {
  const sameContinent = pool.filter((c) => c.continent === country.continent);
  const options = shuffle(
    [country.flag, ...distractors(country, [sameContinent, pool, all], (c) => c.flag, rng)],
    rng
  );
  return {
    id: `nameToFlag-${country.code}-${index}`,
    kind: 'nameToFlag',
    prompt: `Which flag belongs to ${country.name}?`,
    visual: { kind: 'subject', value: country.name, sub: country.continent },
    options,
    optionStyle: 'flag',
    answer: country.flag,
    explanation: `${country.flag} is the flag of ${country.name} — capital ${country.capital}.`
  };
}

function currencyQuestion(country, pool, all, rng, index) {
  const sameContinent = pool.filter((c) => c.continent === country.continent);
  const options = shuffle(
    [country.currency, ...distractors(country, [sameContinent, pool, all], (c) => c.currency, rng)],
    rng
  );
  return {
    id: `currencies-${country.code}-${index}`,
    kind: 'currencies',
    prompt: `Which currency does ${country.name} use?`,
    visual: { kind: 'subject', value: country.name, icon: country.flag, sub: country.continent },
    options,
    answer: country.currency,
    explanation: `${country.name} uses the ${country.currency}.`
  };
}

function languageQuestion(country, pool, all, rng, index) {
  const sameContinent = pool.filter((c) => c.continent === country.continent);
  const options = shuffle(
    [country.language, ...distractors(country, [sameContinent, pool, all], (c) => c.language, rng)],
    rng
  );
  return {
    id: `languages-${country.code}-${index}`,
    kind: 'languages',
    prompt: `What is the main language of ${country.name}?`,
    visual: { kind: 'subject', value: country.name, icon: country.flag, sub: country.continent },
    options,
    answer: country.language,
    explanation: `${country.language} is the main language of ${country.name}.`
  };
}

/**
 * "Which country shares a border with Germany?"
 *
 * Every wrong option must be a non-neighbour, or the question has more than
 * one right answer — so neighbours are excluded from the distractor pool
 * rather than merely deprioritised.
 */
function borderQuestion(entry, pool, all, rng, index) {
  const { country, neighbours } = entry;
  const neighbourCodes = new Set(neighbours.map((n) => n.code));
  const correct = neighbours[Math.floor(rng() * neighbours.length)];

  const notNeighbours = (list) =>
    list.filter((c) => c.code !== country.code && !neighbourCodes.has(c.code));

  const sameContinent = notNeighbours(pool.map((p) => p.country)).filter(
    (c) => c.continent === country.continent
  );

  const options = shuffle(
    [
      correct.name,
      ...distractors(correct, [sameContinent, notNeighbours(all)], (c) => c.name, rng)
    ],
    rng
  );

  const names = neighbours.map((n) => n.name);
  return {
    id: `borders-${country.code}-${index}`,
    kind: 'borders',
    prompt: `Which country shares a land border with ${country.name}?`,
    visual: { kind: 'subject', value: country.name, icon: country.flag, sub: country.continent },
    options,
    answer: correct.name,
    explanation:
      names.length > 6
        ? `${country.name} has ${names.length} land neighbours, including ${names.slice(0, 5).join(', ')}.`
        : `${country.name} borders ${names.join(', ')}.`
  };
}

/** "Which of these landmarks is in Egypt?" — the landmark quiz backwards. */
function countryToLandmarkQuestion(landmark, pool, allCountries, rng, index) {
  const elsewhere = pool.filter((l) => l.country !== landmark.country);
  const home = allCountries.find((c) => c.name === landmark.country);
  const options = shuffle(
    [landmark.name, ...distractors(landmark, [elsewhere], (l) => l.name, rng)],
    rng
  );
  return {
    id: `countryToLandmark-${index}-${landmark.name}`,
    kind: 'countryToLandmark',
    prompt: `Which of these landmarks is in ${landmark.country}?`,
    visual: {
      kind: 'subject',
      value: landmark.country,
      icon: home ? home.flag : landmark.icon,
      sub: landmark.continent
    },
    options,
    answer: landmark.name,
    explanation: `${landmark.name} is in ${landmark.city}, ${landmark.country}. ${landmark.fact}`
  };
}

/* --- Round assembly ------------------------------------------------------ */

const COUNTRY_BUILDERS = {
  flags: flagQuestion,
  capitals: capitalQuestion,
  countries: countryQuestion,
  continents: continentQuestion,
  capitalToCountry: capitalToCountryQuestion,
  nameToFlag: nameToFlagQuestion,
  currencies: currencyQuestion,
  languages: languageQuestion
};

/**
 * Build a round of questions.
 * @param {{type: string, difficulty: string, count?: number, rng?: () => number}} options
 */
export async function buildRound({ type, difficulty: difficultyId, count = DEFAULT_QUESTIONS, rng = Math.random }) {
  const tiers = difficulty(difficultyId).tiers;

  if (type === 'mixed') {
    const kinds = [
      'flags',
      'capitals',
      'countries',
      'continents',
      'landmarks',
      'waters',
      'currencies',
      'languages'
    ];
    // Built one after another rather than in parallel: the rng must be consumed
    // in a fixed order or the seeded daily challenge stops being reproducible.
    const rounds = [];
    for (const kind of kinds) {
      rounds.push(await buildRound({ type: kind, difficulty: difficultyId, count, rng }));
    }
    // Take questions round-robin so every category shows up, then trim.
    const merged = [];
    for (let i = 0; i < count; i += 1) {
      const source = rounds[i % rounds.length];
      const question = source[Math.floor(i / rounds.length)];
      if (question) merged.push(question);
    }
    const pool = merged.length >= count ? merged : rounds.flat();
    return shuffle(pool, rng).slice(0, count);
  }

  if (type === 'shapes' || type === 'locate') {
    const { pool, all } = await mapPool(type === 'shapes' ? 'shape' : 'locate', tiers);
    const build = type === 'shapes' ? shapeQuestion : locateQuestion;
    return sample(pool, count, rng).map((item, i) => build(item, pool, all, rng, i));
  }

  if (type === 'borders') {
    const [all, adjacency] = await Promise.all([countries(), borderData()]);
    const byCode = new Map(all.map((c) => [c.code, c]));

    const withNeighbours = all
      .filter((c) => (adjacency[c.code] || []).length)
      .map((country) => ({
        country,
        neighbours: adjacency[country.code].map((code) => byCode.get(code)).filter(Boolean)
      }))
      .filter((entry) => entry.neighbours.length);

    const inTier = withNeighbours.filter((e) => tiers.includes(e.country.tier));
    const pool = inTier.length >= 6 ? inTier : withNeighbours;
    return sample(pool, count, rng).map((entry, i) =>
      borderQuestion(entry, pool, all, rng, i)
    );
  }

  if (type === 'countryToLandmark') {
    const [all, allCountries] = await Promise.all([landmarks(), countries()]);
    const pool = poolFor(all, tiers);
    return sample(pool, count, rng).map((item, i) =>
      countryToLandmarkQuestion(item, pool, allCountries, rng, i)
    );
  }

  if (type === 'landmarks') {
    const [all, allCountries] = await Promise.all([landmarks(), countries()]);
    const pool = poolFor(all, tiers);
    return sample(pool, count, rng).map((item, i) =>
      landmarkQuestion(item, pool, allCountries, rng, i)
    );
  }

  if (type === 'waters') {
    const all = await waters();
    const pool = poolFor(all, tiers);
    return sample(pool, count, rng).map((item, i) => waterQuestion(item, pool, all, rng, i));
  }

  const all = await countries();
  const pool = poolFor(all, tiers);
  const build = COUNTRY_BUILDERS[type] || countryQuestion;

  if (type === 'continents') {
    const names = (await continentData())
      .filter((c) => c.countries > 0)
      .map((c) => c.name);
    return sample(pool, count, rng).map((item, i) =>
      continentQuestion(item, pool, all, rng, i, names)
    );
  }

  return sample(pool, count, rng).map((item, i) => build(item, pool, all, rng, i));
}

/** The seed shared by every player on a given day. */
export function dailySeed(dateKey) {
  return `daily-${dateKey}`;
}
