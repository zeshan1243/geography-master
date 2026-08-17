/**
 * storage.js — lightweight local persistence.
 *
 * Everything lives under a single localStorage key so the whole profile can be
 * read, written or cleared in one go. No account, no network, no cookies.
 */

const KEY = 'wgg.profile';
const THEME_KEY = 'theme';

const DEFAULTS = {
  bestScores: {},      // "flags:medium" -> score
  bestRuns: {},        // "flags" -> longest survival run
  gamesPlayed: 0,
  correctAnswers: 0,
  totalQuestions: 0,
  totalScore: 0,
  bestStreak: 0,
  gameCounts: {},      // "flags" -> times played
  playedDays: [],      // ISO dates, newest last, capped at 60
  dailyDone: {},       // ISO date -> score
  misses: {}           // "kind|subject" -> { kind, subject, missed, strength, seen }
};

/**
 * How many times a remembered miss must be answered correctly before it stops
 * being offered for review. One is too few — getting it right immediately
 * after being shown the answer proves very little.
 */
const RETIRE_AT = 2;

/** Bounds localStorage. Oldest-seen entries are dropped first. */
const MAX_MISSES = 400;

/** localStorage throws in some private-browsing modes; degrade to memory. */
let memoryFallback = null;

function storage() {
  if (memoryFallback) return memoryFallback;
  try {
    const probe = '__wgg__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    memoryFallback = new Map();
    return {
      getItem: (k) => (memoryFallback.has(k) ? memoryFallback.get(k) : null),
      setItem: (k, v) => memoryFallback.set(k, String(v)),
      removeItem: (k) => memoryFallback.delete(k)
    };
  }
}

export function load() {
  try {
    const raw = storage().getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function save(profile) {
  try {
    storage().setItem(KEY, JSON.stringify(profile));
  } catch {
    /* Quota or disabled storage — progress simply is not persisted. */
  }
  return profile;
}

export function update(mutator) {
  const profile = load();
  mutator(profile);
  return save(profile);
}

export function reset() {
  try { storage().removeItem(KEY); } catch { /* ignore */ }
}

/* --- Theme -------------------------------------------------------------- */

export function getTheme() {
  try { return storage().getItem(THEME_KEY); } catch { return null; }
}

export function setTheme(value) {
  try {
    if (value) storage().setItem(THEME_KEY, value);
    else storage().removeItem(THEME_KEY);
  } catch { /* ignore */ }
}

/* --- Dates -------------------------------------------------------------- */

/** Local calendar date as YYYY-MM-DD (not UTC, so "today" matches the user). */
export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDay(key, days) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return todayKey(date);
}

/* --- Game results ------------------------------------------------------- */

/**
 * Record a finished game.
 * @returns {{isBest: boolean, best: number, streakDays: number}}
 */
export function recordGame({ type, difficulty, score, correct, total, bestStreak, daily, survivalRun }) {
  const scoreKey = `${type}:${difficulty}`;
  let isBest = false;
  let best = 0;
  let streakDays = 0;

  update((p) => {
    best = p.bestScores[scoreKey] || 0;
    if (score > best) {
      isBest = true;
      best = score;
      p.bestScores[scoreKey] = score;
    }

    p.gamesPlayed += 1;
    p.correctAnswers += correct;
    p.totalQuestions += total;
    p.totalScore += score;
    p.bestStreak = Math.max(p.bestStreak || 0, bestStreak || 0);
    p.gameCounts[type] = (p.gameCounts[type] || 0) + 1;

    const today = todayKey();
    if (!p.playedDays.includes(today)) p.playedDays.push(today);
    if (p.playedDays.length > 60) p.playedDays = p.playedDays.slice(-60);

    if (daily) p.dailyDone[today] = Math.max(p.dailyDone[today] || 0, score);

    // Survival is measured in questions survived, which points beat only
    // loosely — a fast run scores higher than a longer slow one.
    if (typeof survivalRun === 'number') {
      p.bestRuns = p.bestRuns || {};
      p.bestRuns[type] = Math.max(p.bestRuns[type] || 0, survivalRun);
    }

    streakDays = countStreak(p.playedDays);
  });

  return { isBest, best, streakDays };
}

/* --- Missed questions --------------------------------------------------- */

const missKeyOf = (kind, subject) => `${kind}|${subject}`;

/**
 * Remember that a question was answered wrong.
 *
 * Being missed again resets progress: a fact you get wrong after previously
 * getting it right is exactly the one worth re-testing.
 */
export function recordMiss(kind, subject) {
  if (!kind || !subject) return;
  update((p) => {
    p.misses = p.misses || {};
    const key = missKeyOf(kind, subject);
    const entry = p.misses[key] || { kind, subject, missed: 0, strength: 0 };
    entry.missed += 1;
    entry.strength = 0;
    entry.seen = Date.now();
    p.misses[key] = entry;

    const keys = Object.keys(p.misses);
    if (keys.length > MAX_MISSES) {
      keys
        .sort((a, b) => (p.misses[a].seen || 0) - (p.misses[b].seen || 0))
        .slice(0, keys.length - MAX_MISSES)
        .forEach((k) => delete p.misses[k]);
    }
  });
}

/**
 * Credit a correct answer against a remembered miss. Retires the entry once it
 * has been answered correctly RETIRE_AT times. Questions that were never
 * missed are ignored, so ordinary rounds cost nothing.
 */
export function recordHit(kind, subject) {
  if (!kind || !subject) return;
  const key = missKeyOf(kind, subject);
  update((p) => {
    if (!p.misses || !p.misses[key]) return;
    const entry = p.misses[key];
    entry.strength = (entry.strength || 0) + 1;
    entry.seen = Date.now();
    if (entry.strength >= RETIRE_AT) delete p.misses[key];
  });
}

/** Everything currently due for review, most-missed first. */
export function missedItems(profile = load()) {
  return Object.values(profile.misses || {}).sort(
    (a, b) => b.missed - a.missed || (a.seen || 0) - (b.seen || 0)
  );
}

export function missedCount(profile = load()) {
  return Object.keys(profile.misses || {}).length;
}

/**
 * A miss clears after two correct answers (see recordHit), not one — a lucky
 * guess right after seeing the answer proves little. `almostDone` is how many
 * are one correct answer away, so the UI can say so instead of just repeating
 * the same count after every review pass.
 */
export function reviewProgress(profile = load()) {
  const items = missedItems(profile);
  return { due: items.length, almostDone: items.filter((item) => (item.strength || 0) >= 1).length };
}

export function clearMisses() {
  update((p) => {
    p.misses = {};
  });
}

/** Consecutive days played, counting back from today (or yesterday). */
export function countStreak(playedDays = load().playedDays) {
  const days = new Set(playedDays);
  let cursor = todayKey();
  if (!days.has(cursor)) {
    cursor = shiftDay(cursor, -1);
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

/** The last seven calendar days, oldest first, for the streak calendar. */
export function weekActivity(profile = load()) {
  const days = new Set(profile.playedDays);
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const out = [];
  for (let i = 6; i >= 0; i -= 1) {
    const key = shiftDay(todayKey(), -i);
    const [y, m, d] = key.split('-').map(Number);
    out.push({
      key,
      label: labels[new Date(y, m - 1, d).getDay()],
      done: days.has(key),
      isToday: i === 0
    });
  }
  return out;
}

export function bestScore(type, difficulty, profile = load()) {
  return profile.bestScores[`${type}:${difficulty}`] || 0;
}

export function bestRun(type, profile = load()) {
  return (profile.bestRuns || {})[type] || 0;
}

export function favoriteGame(profile = load()) {
  const entries = Object.entries(profile.gameCounts);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function dailyDoneToday(profile = load()) {
  return profile.dailyDone[todayKey()] ?? null;
}

export function accuracy(profile = load()) {
  if (!profile.totalQuestions) return 0;
  return Math.round((profile.correctAnswers / profile.totalQuestions) * 100);
}
