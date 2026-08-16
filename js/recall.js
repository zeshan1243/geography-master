/**
 * recall.js — "Name the Countries": a free-recall race against the clock.
 *
 * Unlike the multiple-choice engine in game.js, nothing here is asked —
 * the player types whatever comes to mind and it is checked against every
 * country's slug plus a table of common aliases (USA, Burma, Czechia, ...).
 * A country is added the instant it is typed, with one exception: some
 * countries are a prefix of another (Niger/Nigeria, Guinea/Guinea-Bissau,
 * Dominica/Dominican Republic) — for those a short pause decides whether the
 * player meant the short name or was still typing the long one.
 *
 * The same engine also powers the per-letter variants ("Countries That Start
 * With S") — the page just sets `data-letter` and `data-time-limit` on the
 * game root; everything else (matching, the map, hint dots) works the same
 * against whatever subset of the list that letter leaves.
 */

import { countries, aliases, games, mapCoverage, slugify, gameUrl } from './data.js';
import { recordGame, bestScore } from './storage.js';
import { recallStars, recallVerdict, stars, verdict } from './score.js';
import { icon } from './icons.js';
import { interactiveMap, makeZoomable } from './worldmap.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const GAME_TYPE = 'nameCountries';
const DEFAULT_TIME_LIMIT = 15 * 60;
/** Radius of a "where is this country" hint dot, in the map's own SVG units. */
const HINT_DOT_RADIUS = 2.6;

/** How long a prefix that could still grow into a different country is given. */
const AMBIGUOUS_DELAY = 500;

function formatClock(totalSeconds) {
  const clamped = Math.max(totalSeconds, 0);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function renderRelated(root, currentId) {
  const box = root.querySelector('[data-related]');
  if (!box) return;
  const list = await games();
  const others = list.filter((g) => g.id !== currentId).sort(() => Math.random() - 0.5).slice(0, 3);
  box.innerHTML = others
    .map(
      (g) => `<a href="${gameUrl(g)}">
        <span aria-hidden="true">${g.icon}</span> ${g.name}
      </a>`
    )
    .join('');
}

export async function initRecallGame() {
  const root = document.querySelector('[data-recall-game]');
  if (!root) return;

  // A bare letter, e.g. "S", scopes the whole round to countries that start
  // (or, with data-letter-position="end", finish) with it — the hub links to
  // variants like /game/name-the-countries/s and .../ends-n. Alternatively,
  // data-name-length scopes it to countries whose name is exactly that many
  // letters (spaces and hyphens not counted) — .../length-5.
  const letter = (root.dataset.letter || '').toUpperCase() || null;
  const letterPosition = root.dataset.letterPosition === 'end' ? 'end' : 'start';
  const nameLength = Number(root.dataset.nameLength) || null;
  const TIME_LIMIT = Number(root.dataset.timeLimit) || DEFAULT_TIME_LIMIT;
  const DIFFICULTY = letter ? `${letterPosition}-${letter}` : nameLength ? `length-${nameLength}` : 'all';

  const el = (name) => root.querySelector(`[data-${name}]`);
  const screens = {
    setup: root.querySelector('[data-screen="setup"]'),
    play: root.querySelector('[data-screen="play"]'),
    results: root.querySelector('[data-screen="results"]')
  };
  const show = (name) => {
    Object.entries(screens).forEach(([key, node]) => {
      if (node) node.hidden = key !== name;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bestLine = el('best');
  const paintBest = () => {
    if (!bestLine) return;
    const best = bestScore(GAME_TYPE, DIFFICULTY);
    bestLine.textContent = best
      ? `Your best: ${best} countries named`
      : 'No score yet — see how many you know.';
  };
  paintBest();

  const [everyCountry, aliasMap] = await Promise.all([countries(), aliases()]);
  const edgeLetter = (name) => (letterPosition === 'end' ? name[name.length - 1] : name[0]).toUpperCase();
  const lettersOnlyLength = (name) => name.replace(/[^A-Za-z]/g, '').length;
  const list = letter
    ? everyCountry.filter((c) => edgeLetter(c.name) === letter)
    : nameLength
      ? everyCountry.filter((c) => lettersOnlyLength(c.name) === nameLength)
      : everyCountry;
  const bySlug = new Map(list.map((c) => [c.slug, c]));

  // Every recognisable typed key (a country's own slug, or an alias) mapped
  // to the country slug it resolves to. Built once so the ambiguity check
  // below does not re-walk the whole list on every keystroke.
  const keyTargets = new Map(list.map((c) => [c.slug, c.slug]));
  for (const [alias, target] of Object.entries(aliasMap)) {
    if (bySlug.has(target)) keyTargets.set(alias, target);
  }
  const allKeys = [...keyTargets.keys()];

  // A second lookup with the hyphens (word breaks) stripped out, so "saudi
  // arabia", "saudi-arabia" and "saudiarabia" all resolve the same way —
  // typing the space is a courtesy, not a requirement.
  const concatTargets = new Map();
  for (const [key, target] of keyTargets) {
    const concat = key.replace(/-/g, '');
    if (concat !== key && !concatTargets.has(concat)) concatTargets.set(concat, target);
  }

  /** A slugified key -> canonical country slug, space-optional. */
  function lookupTarget(key) {
    if (!key) return undefined;
    if (keyTargets.has(key)) return keyTargets.get(key);
    return concatTargets.get(key.replace(/-/g, ''));
  }

  /** Typed text -> canonical slug, or null when it matches nothing on the list. */
  function resolve(raw) {
    return lookupTarget(slugify(raw)) ?? null;
  }

  /**
   * True when `key` is a strict prefix of some other recognisable key that
   * resolves to a *different* country — i.e. still typing it could turn it
   * into a different answer (niger -> nigeria), so it should not be locked
   * in immediately. A key that only prefixes entries for its own country
   * (sao-tome -> sao-tome-and-principe) is not ambiguous: either way ends at
   * the same result.
   */
  function isAmbiguousPrefix(key, target) {
    return allKeys.some((k) => k !== key && k.length > key.length && k.startsWith(key) && keyTargets.get(k) !== target);
  }

  const input = el('input');
  const form = el('form');
  const feedback = el('feedback');
  const foundBox = el('found');
  const countEl = el('count');
  const timerEl = el('timer');
  const progressFill = el('progress');
  const mapBox = el('map');
  const hintToggle = el('map-hint');

  /* --- World map: every country dims in until it is typed ----------------- */
  let mapSvg = null;
  let mapZoom = null;
  let showHints = false;
  let hintLayer = null;
  let centroids = new Map();

  if (mapBox) {
    Promise.all([
      interactiveMap({ clickable: [], label: 'World map — countries you have named are highlighted' }),
      mapCoverage()
    ]).then(([{ svg, map }, coverage]) => {
      mapBox.innerHTML = '';
      mapBox.appendChild(svg);
      mapSvg = svg;
      mapZoom = makeZoomable(svg, map);
      centroids = new Map(
        coverage.countries.map((c) => [
          c.code,
          { x: c.mainBox.x + c.mainBox.width / 2, y: c.mainBox.y + c.mainBox.height / 2 }
        ])
      );
      if (showHints) buildHintDots();
    });
  }

  function markOnMap(code) {
    mapSvg?.querySelector(`#map-${code}`)?.classList.add('is-found');
  }

  function resetMap() {
    mapSvg?.querySelectorAll('.is-found').forEach((p) => p.classList.remove('is-found'));
    mapZoom?.reset();
  }

  /** One small dot per country still to find, at its geographic centre. */
  function buildHintDots() {
    if (!mapSvg) return;
    hintLayer?.remove();
    hintLayer = document.createElementNS(SVG_NS, 'g');
    hintLayer.setAttribute('class', 'hint-dots');
    for (const country of list) {
      if (!remaining?.has(country.slug)) continue;
      const centroid = centroids.get(country.code);
      if (!centroid) continue;
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('class', 'hint-dot');
      dot.setAttribute('data-code', country.code);
      dot.setAttribute('cx', centroid.x);
      dot.setAttribute('cy', centroid.y);
      dot.setAttribute('r', HINT_DOT_RADIUS);
      hintLayer.appendChild(dot);
    }
    mapSvg.appendChild(hintLayer);
  }

  function clearHintDots() {
    hintLayer?.remove();
    hintLayer = null;
  }

  function removeHintDot(code) {
    hintLayer?.querySelector(`[data-code="${code}"]`)?.remove();
  }

  function setHints(next) {
    showHints = next;
    if (hintToggle) {
      hintToggle.textContent = showHints ? '🙈 Hide countries' : '📍 Show countries';
      hintToggle.setAttribute('aria-pressed', String(showHints));
    }
    if (showHints) buildHintDots();
    else clearHintDots();
  }

  hintToggle?.addEventListener('click', () => setHints(!showHints));

  let remaining;
  let found;
  let timeLeft;
  let timer = null;
  let running = false;
  let ambiguousTimer = null;

  function clearAmbiguousTimer() {
    if (ambiguousTimer) {
      clearTimeout(ambiguousTimer);
      ambiguousTimer = null;
    }
  }

  function paintCount() {
    if (countEl) countEl.textContent = `${found.length} / ${list.length} found`;
    if (progressFill) progressFill.style.width = `${(found.length / list.length) * 100}%`;
  }

  function flash(kind, message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.kind = kind;
    feedback.hidden = false;
    clearTimeout(feedback._wggTimer);
    feedback._wggTimer = setTimeout(() => {
      feedback.hidden = true;
    }, 1400);
  }

  function addFound(slug) {
    const country = bySlug.get(slug);
    remaining.delete(slug);
    found.push(country);
    paintCount();
    markOnMap(country.code);
    if (showHints) removeHintDot(country.code);
    if (foundBox) {
      const chip = document.createElement('span');
      chip.className = 'recall-chip';
      chip.innerHTML = `<span aria-hidden="true">${country.flag}</span> ${country.name}`;
      foundBox.prepend(chip);
    }
    // Nothing left to find — no reason to keep the clock running.
    if (remaining.size === 0) setTimeout(finish, 700);
  }

  /** Resolves whatever is currently in the box, clears it, and reports the result. */
  function submit() {
    clearAmbiguousTimer();
    if (!input || !running) return;
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;

    const slug = resolve(raw);
    if (!slug) {
      flash('wrong', `"${raw}" did not match a country`);
      return;
    }
    if (!remaining.has(slug)) {
      flash('duplicate', `Already got ${bySlug.get(slug).name}`);
      return;
    }
    addFound(slug);
    flash('correct', bySlug.get(slug).name);
  }

  /**
   * Runs on every keystroke. An unambiguous exact match is added straight
   * away; one that could still grow into a different country's name gets a
   * short grace period in case the player keeps typing.
   */
  function handleTyping() {
    clearAmbiguousTimer();
    if (!running || !input) return;

    const raw = input.value.trim();
    const key = slugify(raw);
    const target = lookupTarget(key);
    if (!target) return;

    if (isAmbiguousPrefix(key, target)) {
      ambiguousTimer = setTimeout(submit, AMBIGUOUS_DELAY);
    } else {
      submit();
    }
  }

  input?.addEventListener('input', handleTyping);

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    submit();
  });

  function tick() {
    timeLeft -= 1;
    if (timerEl) {
      timerEl.textContent = formatClock(timeLeft);
      timerEl.classList.toggle('is-low', timeLeft <= 30);
    }
    if (timeLeft <= 0) finish();
  }

  function paintMissed() {
    const missedBox = el('result-missed');
    if (!missedBox) return;
    const missed = list
      .filter((c) => remaining.has(c.slug))
      .sort((a, b) => a.name.localeCompare(b.name));
    missedBox.innerHTML = missed.length
      ? missed
          .map((c) => `<li><span aria-hidden="true">${c.flag}</span> ${c.name}</li>`)
          .join('')
      : '<li>You named every country. Nothing missed.</li>';
  }

  function finish() {
    if (!running) return;
    running = false;
    clearAmbiguousTimer();
    clearInterval(timer);
    input?.blur();

    const { isBest, best, streakDays } = recordGame({
      type: GAME_TYPE,
      difficulty: DIFFICULTY,
      score: found.length,
      correct: found.length,
      total: list.length,
      bestStreak: 0,
      daily: false
    });

    const set = (name, value) => {
      const node = el(name);
      if (node) node.textContent = value;
    };

    set('result-title', remaining.size === 0 ? 'All found!' : "Time's up!");

    // The full 195-country round is calibrated on raw counts (150+ is
    // exceptional); a 3-country letter round would never earn a star on that
    // scale, so letter rounds fall back to the ordinary percentage-based
    // scoring the multiple-choice games already use.
    const starCount = letter ? stars(found.length, list.length) : recallStars(found.length);
    const verdictText = letter ? verdict(found.length, list.length) : recallVerdict(found.length);

    set('result-score', found.length);
    const starsEl = el('result-stars');
    if (starsEl) {
      starsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
        icon(i < starCount ? 'star' : 'starOutline')
      ).join('');
    }
    set('result-summary', `${found.length} / ${list.length} countries named`);
    set('result-verdict', verdictText);
    set('result-best', `Personal best: ${best} of ${list.length} · ${streakDays} day streak`);

    const newBest = el('result-new-best');
    if (newBest) newBest.hidden = !isBest;

    paintMissed();
    show('results');
  }

  function start() {
    remaining = new Set(list.map((c) => c.slug));
    found = [];
    timeLeft = TIME_LIMIT;
    running = true;

    if (foundBox) foundBox.innerHTML = '';
    resetMap();
    setHints(false);
    paintCount();
    if (timerEl) {
      timerEl.textContent = formatClock(TIME_LIMIT);
      timerEl.classList.remove('is-low');
    }
    if (feedback) feedback.hidden = true;
    if (input) input.value = '';

    show('play');
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    input?.focus();
  }

  el('start')?.addEventListener('click', start);
  el('play-again')?.addEventListener('click', start);
  el('stop')?.addEventListener('click', () => finish());

  const another = root.querySelector('[data-another-game]');
  if (another) {
    const all = await games();
    const pick = all.filter((g) => g.id !== GAME_TYPE)[Math.floor(Math.random() * (all.length - 1))];
    if (pick) another.href = gameUrl(pick);
  }

  renderRelated(root, GAME_TYPE);

  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') start();
}
