/**
 * data.js — loads and caches the geography datasets.
 *
 * Paths are resolved against this module's own URL, so every page works no
 * matter how deeply it is nested (/, /games/, /game/, /countries/).
 */

const ROOT = new URL('../', import.meta.url);

const cache = new Map();

function fetchJSON(name) {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(new URL(`data/${name}.json`, ROOT))
        .then((res) => {
          if (!res.ok) throw new Error(`Could not load ${name}.json (${res.status})`);
          return res.json();
        })
        .catch((err) => {
          cache.delete(name);
          throw err;
        })
    );
  }
  return cache.get(name);
}

/** Absolute path to a file at the site root, e.g. url('games/') */
export function url(path = '') {
  return new URL(path, ROOT).pathname;
}

/** ISO 3166-1 alpha-2 code -> regional indicator flag emoji. */
export function flagOf(code) {
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

/** "Bosnia and Herzegovina" -> "bosnia-and-herzegovina" */
export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019.,]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function countries() {
  const list = await fetchJSON('countries');
  return list.map((c) => ({ ...c, flag: flagOf(c.code), slug: slugify(c.name) }));
}

export async function landmarks() {
  return fetchJSON('landmarks');
}

export async function waters() {
  return fetchJSON('oceans');
}

export async function continents() {
  return fetchJSON('continents');
}

export async function games() {
  return fetchJSON('games');
}

/** Land-border adjacency: ISO code -> array of neighbouring codes. */
export async function borders() {
  return fetchJSON('borders');
}

/** Per-country map geometry and which map games can use each country. */
export async function mapCoverage() {
  return fetchJSON('map-coverage');
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n);
}
