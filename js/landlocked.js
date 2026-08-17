/**
 * landlocked.js — click-based sudden death for the landlocked-country games.
 *
 * Every country in a continent is on screen at once. Clicking a landlocked
 * one marks it and the round continues; clicking anything else ends the
 * round immediately. There is no difficulty picker — the whole game is one
 * mode, matching the reference JetPunk quizzes this is modelled on.
 */

import { countries, games, gameUrl } from './data.js';
import { LANDLOCKED_CODES } from './quiz.js';
import { recordGame, bestScore } from './storage.js';
import { icon } from './icons.js';

const DIFFICULTY = 'default';
/** How long the grid shows which ones you missed before the results screen. */
const REVEAL_DELAY = 1100;

async function renderRelated(root, currentId) {
  const box = root.querySelector('[data-related]');
  if (!box) return;
  const list = await games();
  const others = list.filter((g) => g.id !== currentId && !g.hubOf).sort(() => Math.random() - 0.5).slice(0, 3);
  box.innerHTML = others
    .map(
      (g) => `<a href="${gameUrl(g)}">
        <span aria-hidden="true">${g.icon}</span> ${g.name}
      </a>`
    )
    .join('');
}

export async function initLandlockedGame() {
  const root = document.querySelector('[data-landlocked-game]');
  if (!root) return;

  const continent = root.dataset.continent;
  const gameType = root.dataset.gameId;

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
    const best = bestScore(gameType, DIFFICULTY);
    bestLine.textContent = best ? `Your best: ${best} found` : 'No score yet — see how far you get.';
  };
  paintBest();

  const all = await countries();
  const inContinent = all
    .filter((c) => c.continent === continent)
    .sort((a, b) => a.name.localeCompare(b.name));
  const landlockedCodes = new Set(inContinent.filter((c) => LANDLOCKED_CODES.has(c.code)).map((c) => c.code));
  const total = landlockedCodes.size;

  const grid = el('grid');
  const countEl = el('count');
  const progressFill = el('progress');

  let found = new Set();
  let running = false;

  function paintCount() {
    if (countEl) countEl.textContent = `${found.size} / ${total} found`;
    if (progressFill) progressFill.style.width = `${(found.size / total) * 100}%`;
  }

  function buildGrid() {
    if (!grid) return;
    grid.innerHTML = inContinent
      .map((c) => `<button class="landlocked-option" type="button" data-code="${c.code}">${c.name}</button>`)
      .join('');
  }

  function paintMissed() {
    const missedBox = el('result-missed');
    if (!missedBox) return;
    const missed = inContinent.filter((c) => landlockedCodes.has(c.code) && !found.has(c.code));
    missedBox.innerHTML = missed.length
      ? missed.map((c) => `<li><span aria-hidden="true">${c.flag}</span> ${c.name}</li>`).join('')
      : '<li>You found every landlocked country. Nothing missed.</li>';
  }

  function finish(cleared) {
    running = false;

    const { isBest, best, streakDays } = recordGame({
      type: gameType,
      difficulty: DIFFICULTY,
      score: found.size,
      correct: found.size,
      total,
      bestStreak: 0,
      daily: false
    });

    const set = (name, value) => {
      const node = el(name);
      if (node) node.textContent = value;
    };

    set('result-title', cleared ? 'Cleared!' : 'Run over');
    set('result-score', found.size);

    const starsEl = el('result-stars');
    if (starsEl) {
      const starCount = Math.round((found.size / total) * 5);
      starsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
        icon(i < starCount ? 'star' : 'starOutline')
      ).join('');
    }

    set('result-summary', `${found.size} / ${total} landlocked countries found`);
    set(
      'result-verdict',
      cleared
        ? 'Every landlocked country, no mistakes. That is the whole game.'
        : found.size === 0
          ? 'Everyone starts somewhere — the list of what you missed is the fastest way to improve.'
          : `You found ${found.size} correct ${found.size === 1 ? 'one' : 'ones'} before the mistake.`
    );
    set('result-best', `Personal best: ${best} of ${total} · ${streakDays} day streak`);

    const newBest = el('result-new-best');
    if (newBest) newBest.hidden = !isBest;

    paintMissed();
    show('results');
  }

  function handleGridClick(event) {
    if (!running) return;
    const btn = event.target.closest('.landlocked-option');
    if (!btn || btn.disabled) return;
    const code = btn.dataset.code;

    if (landlockedCodes.has(code)) {
      btn.disabled = true;
      btn.dataset.result = 'correct';
      found.add(code);
      paintCount();
      if (found.size === total) {
        running = false;
        setTimeout(() => finish(true), REVEAL_DELAY);
      }
      return;
    }

    running = false;
    btn.dataset.result = 'wrong';
    grid.querySelectorAll('.landlocked-option').forEach((b) => {
      b.disabled = true;
      if (landlockedCodes.has(b.dataset.code) && !found.has(b.dataset.code)) b.dataset.result = 'missed';
    });
    setTimeout(() => finish(false), REVEAL_DELAY);
  }
  grid?.addEventListener('click', handleGridClick);

  function start() {
    found = new Set();
    running = true;
    buildGrid();
    paintCount();
    show('play');
  }

  el('start')?.addEventListener('click', start);
  el('play-again')?.addEventListener('click', start);

  const another = root.querySelector('[data-another-game]');
  if (another) {
    const all = await games();
    const pick = all.filter((g) => g.id !== gameType && !g.hubOf)[Math.floor(Math.random() * (all.length - 1))];
    if (pick) another.href = gameUrl(pick);
  }

  renderRelated(root, gameType);

  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') start();
}
