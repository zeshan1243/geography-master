/**
 * higherLower.js — "Higher or Lower": a chain game, not a round of fixed
 * questions. One country is shown with its real value, a challenger is
 * shown hidden, and the player guesses higher or lower. Correct keeps the
 * streak going with a new challenger; one miss ends it. Powers both the
 * population and area variants off `root.dataset.stat`.
 */

import { countries, games, gameUrl, formatNumber } from './data.js';
import { recordGame, bestRun } from './storage.js';
import { survivalStars } from './score.js';
import { icon } from './icons.js';
import { wireShare, siteName } from './share.js';

/**
 * This game has no difficulty levels, so it needs its own wording rather
 * than score.js's survivalVerdict(), which is written for the Expert-mode
 * multiple-choice games and references "Hard difficulty" directly.
 */
function hlVerdict(streak) {
  if (streak === 0) return 'No streak this time — the very next country trips most players up.';
  if (streak < 5) return 'A short streak. Most runs end in the first few guesses.';
  if (streak < 10) return 'Respectable — double digits is the next target.';
  if (streak < 20) return "Strong streak — you're reading the patterns well.";
  if (streak < 30) return 'Excellent. Very few runs get this far.';
  return 'Exceptional streak. That is elite-level geography.';
}

async function renderRelated(root, currentId) {
  const box = root.querySelector('[data-related]');
  if (!box) return;
  const list = await games();
  const others = list.filter((g) => g.id !== currentId).sort(() => Math.random() - 0.5).slice(0, 3);
  box.innerHTML = others
    .map((g) => `<a href="${gameUrl(g)}"><span aria-hidden="true">${g.icon}</span> ${g.name}</a>`)
    .join('');
}

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function initHigherLower() {
  const root = document.querySelector('[data-higher-lower]');
  if (!root) return;

  const stat = root.dataset.stat === 'area' ? 'area' : 'population';
  const GAME_TYPE = stat === 'area' ? 'higherLowerArea' : 'higherLowerPopulation';
  const unit = stat === 'area' ? ' km²' : '';

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
    const best = bestRun(GAME_TYPE);
    bestLine.textContent = best ? `Your best streak: ${best}` : 'No streak yet — see how far you get.';
  };
  paintBest();

  const currentFlag = el('hl-current-flag');
  const currentName = el('hl-current-name');
  const currentValue = el('hl-current-value');
  const challengerFlag = el('hl-challenger-flag');
  const challengerName = el('hl-challenger-name');
  const challengerValue = el('hl-challenger-value');
  const buttons = el('hl-buttons');
  const streakEl = el('hl-streak');
  const feedback = el('hl-feedback');

  let pool = [];
  let cursor = 0;
  let current = null;
  let streak = 0;
  let locked = false;

  function nextCountry() {
    if (cursor >= pool.length) {
      // Reshuffle rather than repeat the country just shown.
      const rest = pool.filter((c) => c.code !== current.code);
      pool = shuffle(rest);
      cursor = 0;
    }
    const picked = pool[cursor];
    cursor += 1;
    return picked;
  }

  function paintCard(flagEl, nameEl, valueEl, country, { reveal }) {
    flagEl.textContent = country.flag;
    nameEl.textContent = country.name;
    if (reveal) {
      valueEl.textContent = `${formatNumber(country[stat])}${unit}`;
      valueEl.hidden = false;
    } else {
      valueEl.textContent = '';
      valueEl.hidden = true;
    }
  }

  let challenger = null;

  function setupRound() {
    paintCard(currentFlag, currentName, currentValue, current, { reveal: true });
    challenger = nextCountry();
    paintCard(challengerFlag, challengerName, challengerValue, challenger, { reveal: false });
    locked = false;
    if (buttons) buttons.querySelectorAll('button').forEach((b) => { b.disabled = false; });
  }

  function flash(kind, message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.kind = kind;
    clearTimeout(feedback._wggTimer);
    feedback._wggTimer = setTimeout(() => {
      feedback.textContent = '';
      feedback.removeAttribute('data-kind');
    }, 1400);
  }

  function finish() {
    const { isBest, best } = recordGame({
      type: GAME_TYPE,
      difficulty: 'all',
      score: streak,
      correct: streak,
      total: streak,
      bestStreak: 0,
      daily: false,
      survivalRun: streak
    });

    const starCount = survivalStars(streak);
    const starsEl = el('result-stars');
    if (starsEl) {
      starsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
        icon(i < starCount ? 'star' : 'starOutline')
      ).join('');
    }

    const set = (name, value) => {
      const node = el(name);
      if (node) node.textContent = value;
    };
    set('result-score', streak);
    set('result-verdict', hlVerdict(streak));
    set('result-best', `Best streak: ${best}`);
    const newBest = el('result-new-best');
    if (newBest) newBest.hidden = !isBest;

    show('results');
    paintBest();
  }

  function guess(direction) {
    if (locked || !challenger) return;
    locked = true;
    if (buttons) buttons.querySelectorAll('button').forEach((b) => { b.disabled = true; });

    challengerValue.textContent = `${formatNumber(challenger[stat])}${unit}`;
    challengerValue.hidden = false;

    const a = current[stat];
    const b = challenger[stat];
    const correct = a === b || (direction === 'higher' ? b >= a : b <= a);

    if (correct) {
      streak += 1;
      if (streakEl) streakEl.textContent = `Streak: ${streak}`;
      flash('correct', `${challenger.name}: ${formatNumber(b)}${unit}`);
      setTimeout(() => {
        current = challenger;
        setupRound();
      }, 1100);
    } else {
      flash('wrong', `${challenger.name}: ${formatNumber(b)}${unit}`);
      setTimeout(finish, 1100);
    }
  }

  buttons?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-hl-guess]');
    if (!btn) return;
    guess(btn.dataset.hlGuess);
  });

  function start() {
    pool = shuffle(all);
    cursor = 0;
    current = pool[cursor];
    cursor += 1;
    streak = 0;
    if (streakEl) streakEl.textContent = 'Streak: 0';
    if (feedback) {
      feedback.textContent = '';
      feedback.removeAttribute('data-kind');
    }
    setupRound();
    show('play');
  }

  let all = [];
  el('start')?.addEventListener('click', start);
  el('play-again')?.addEventListener('click', start);

  wireShare(root, () => ({
    title: siteName(),
    text: `I built a streak of ${streak} on ${document.querySelector('h1')?.textContent?.trim() || siteName()} — can you beat me?`,
    url: window.location.href
  }));

  const another = root.querySelector('[data-another-game]');
  if (another) {
    const list = await games();
    const pick = list.filter((g) => g.id !== GAME_TYPE)[Math.floor(Math.random() * (list.length - 1))];
    if (pick) another.href = gameUrl(pick);
  }

  renderRelated(root, GAME_TYPE);

  all = await countries();
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') start();
}
