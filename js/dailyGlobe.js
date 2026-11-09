/**
 * dailyGlobe.js — "Daily Globe": one mystery country a day, the same for
 * every player, picked by the same date-seeded RNG the daily mixed quiz
 * already uses (dailySeed()/makeRng() from quiz.js). Six guesses; a wrong
 * one unlocks the next hint. The target country is never present in the
 * page's own markup — it only ever exists in memory here, computed fresh
 * on each load from the date, so it can't be read from view-source.
 *
 * "Already played today" is tracked by recording the day's own date as the
 * score's `difficulty`, via storage.js's generic bestScores map — so every
 * day gets its own independent key with no extra storage plumbing needed.
 */

import { countries, aliases, games, gameUrl, formatNumber, slugify } from './data.js';
import { dailySeed, makeRng } from './quiz.js';
import { recordGame, bestScore, hasScore, todayKey, countStreak } from './storage.js';
import { icon } from './icons.js';

const GAME_TYPE = 'dailyGlobe';
const MAX_GUESSES = 6;
/** Least revealing first, most revealing (the flag) last. */
const HINT_COUNT = 6;

async function renderRelated(root) {
  const box = root.querySelector('[data-related]');
  if (!box) return;
  const list = await games();
  const others = list.filter((g) => g.id !== GAME_TYPE).sort(() => Math.random() - 0.5).slice(0, 3);
  box.innerHTML = others
    .map((g) => `<a href="${gameUrl(g)}"><span aria-hidden="true">${g.icon}</span> ${g.name}</a>`)
    .join('');
}

/** 1,234,567 -> "approximately 1.2 million", small enough numbers shown exactly. */
function approxPopulation(n) {
  if (n >= 1_000_000) return `approximately ${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')} million`;
  if (n >= 10_000) return `approximately ${formatNumber(Math.round(n / 1000) * 1000)}`;
  return formatNumber(n);
}

export async function initDailyGlobe() {
  const root = document.querySelector('[data-daily-globe]');
  if (!root) return;

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

  const today = todayKey();
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const dateEl = el('dg-date');
  if (dateEl) dateEl.textContent = `Today's puzzle — ${dateLabel}. Six guesses, a new hint after each miss.`;

  const [list, aliasMap] = await Promise.all([countries(), aliases()]);
  const rng = makeRng(dailySeed(today));
  const target = list[Math.floor(rng() * list.length)];

  const byKey = new Map();
  for (const c of list) byKey.set(c.slug, c);
  for (const [alias, slug] of Object.entries(aliasMap)) {
    if (byKey.has(slug) && !byKey.has(alias)) byKey.set(alias, byKey.get(slug));
  }

  function resolve(raw) {
    const key = slugify(raw.trim());
    return key ? byKey.get(key) || null : null;
  }

  const hints = [
    { label: 'Continent', value: target.continent },
    { label: 'Population', value: approxPopulation(target.population) },
    { label: 'Area', value: `${formatNumber(target.area)} km²` },
    { label: 'Capital', value: target.capital },
    { label: 'First letter', value: target.name[0] },
    { label: 'Flag', value: target.flag }
  ];

  const bestLine = el('best');
  function paintBest() {
    if (!bestLine) return;
    const streak = countStreak();
    bestLine.textContent = streak
      ? `${streak} day streak — play today to keep it going`
      : 'Play today to start a streak.';
  }
  paintBest();

  const guessCountEl = el('dg-guess-count');
  const hintNodes = [...root.querySelectorAll('[data-dg-hint]')];
  const input = el('dg-input');
  const form = el('dg-form');
  const feedback = el('dg-feedback');
  const history = el('dg-history');

  function revealHint(index) {
    const node = hintNodes[index];
    if (!node) return;
    node.hidden = false;
    const value = node.querySelector('[data-dg-hint-value]');
    if (value) value.textContent = hints[index].value;
  }

  function flash(kind, message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.kind = kind;
    clearTimeout(feedback._wggTimer);
    feedback._wggTimer = setTimeout(() => {
      feedback.textContent = '';
      feedback.removeAttribute('data-kind');
    }, 1800);
  }

  function addHistory(name, correct) {
    if (!history) return;
    const li = document.createElement('li');
    li.className = 'dg-history-item';
    li.dataset.result = correct ? 'correct' : 'wrong';
    li.innerHTML = `<span aria-hidden="true">${correct ? '✓' : '✗'}</span> ${name}`;
    history.prepend(li);
  }

  function shareText(guessesUsed, won) {
    const squares = [];
    for (let i = 0; i < (won ? guessesUsed - 1 : MAX_GUESSES); i += 1) squares.push('🟥');
    if (won) squares.push('🟩');
    const score = won ? `${guessesUsed}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    return `GeoAtlas Daily Globe — ${dateLabel}\n${squares.join('')} ${score}\n${window.location.origin}/game/daily-globe`;
  }

  function finish(guessesUsed, won) {
    const score = won ? MAX_GUESSES + 1 - guessesUsed : 0;
    recordGame({
      type: GAME_TYPE,
      difficulty: today,
      score,
      correct: won ? 1 : 0,
      total: 1,
      bestStreak: 0,
      daily: false
    });

    renderResult(guessesUsed, won);
  }

  function renderResult(guessesUsed, won) {
    hints.forEach((_, i) => revealHint(i));

    const set = (name, value) => {
      const node = el(name);
      if (node) node.textContent = value;
    };

    set('result-title', won ? 'Solved!' : "Today's country was...");
    set('result-score', target.flag);
    set('result-score-label', target.name);
    set('result-summary', won ? `Solved in ${guessesUsed} / ${MAX_GUESSES} guesses` : 'Not solved today — see you tomorrow');
    set(
      'result-verdict',
      won
        ? guessesUsed <= 2
          ? 'Exceptional — almost nothing to go on yet.'
          : guessesUsed <= 4
            ? 'Nicely done.'
            : 'Got there in the end.'
        : `The answer was ${target.name}, capital ${target.capital}.`
    );
    set('result-best', `${countStreak()} day streak`);

    const copyBtn = el('dg-copy');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const text = shareText(guessesUsed, won);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(
            () => flash('correct', 'Copied to clipboard'),
            () => flash('wrong', 'Could not copy — select the text manually')
          );
        }
      };
    }

    show('results');
    paintBest();
  }

  let guessesUsed = 0;
  let finished = false;

  function submit() {
    if (finished || !input) return;
    const raw = input.value.trim();
    if (!raw) return;

    const guessed = resolve(raw);
    if (!guessed) {
      flash('wrong', `"${raw}" isn't a country on this list`);
      return;
    }

    input.value = '';
    guessesUsed += 1;
    if (guessCountEl) guessCountEl.textContent = `Guess ${Math.min(guessesUsed + 1, MAX_GUESSES)} of ${MAX_GUESSES}`;

    if (guessed.code === target.code) {
      addHistory(guessed.name, true);
      finished = true;
      finish(guessesUsed, true);
      return;
    }

    addHistory(guessed.name, false);
    flash('wrong', `Not ${guessed.name}`);

    if (guessesUsed >= MAX_GUESSES) {
      finished = true;
      finish(guessesUsed, false);
      return;
    }

    // Hint 0 is shown from the start; each miss after that unlocks the next.
    revealHint(guessesUsed);
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    submit();
  });

  function start() {
    guessesUsed = 0;
    finished = false;
    if (history) history.innerHTML = '';
    if (guessCountEl) guessCountEl.textContent = `Guess 1 of ${MAX_GUESSES}`;
    hintNodes.forEach((node) => {
      node.hidden = true;
      const value = node.querySelector('[data-dg-hint-value]');
      if (value) value.textContent = '';
    });
    revealHint(0);
    if (feedback) {
      feedback.textContent = '';
      feedback.removeAttribute('data-kind');
    }
    if (input) input.value = '';

    show('play');
    input?.focus();
  }

  if (hasScore(GAME_TYPE, today)) {
    const score = bestScore(GAME_TYPE, today);
    const won = score > 0;
    renderResult(won ? MAX_GUESSES + 1 - score : MAX_GUESSES, won);
  } else {
    el('start')?.addEventListener('click', start);
  }

  renderRelated(root);
}
