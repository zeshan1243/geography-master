/**
 * topLanguages.js — "Top Spoken Languages": type as many of a continent's
 * top languages (by native speakers) as you can before time runs out.
 *
 * Same free-recall shape as recall.js (timer, typed matching, live found
 * list) but scoped to a short curated list per continent rather than the
 * full country dataset, so it skips recall.js's country-specific machinery
 * (aliases file, the world map, prefix-collision handling — these lists are
 * short enough that no two entries share a prefix).
 */

import { topLanguages, slugify, games, gameUrl } from './data.js';
import { recordGame, bestScore } from './storage.js';
import { icon } from './icons.js';
import { wireShare, siteName } from './share.js';

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
  const others = list.filter((g) => g.id !== currentId && !g.hubOf).sort(() => Math.random() - 0.5).slice(0, 3);
  box.innerHTML = others
    .map(
      (g) => `<a href="${gameUrl(g)}">
        <span aria-hidden="true">${g.icon}</span> ${g.name}
      </a>`
    )
    .join('');
}

export async function initTopLanguagesGame() {
  const root = document.querySelector('[data-top-languages-game]');
  if (!root) return;

  const continent = root.dataset.continent;
  const gameType = root.dataset.gameId;
  const TIME_LIMIT = Number(root.dataset.timeLimit) || 180;
  const DIFFICULTY = 'default';

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
    bestLine.textContent = best ? `Your best: ${best} found` : 'No score yet — see how many you know.';
  };
  paintBest();

  const allContinents = await topLanguages();
  const data = allContinents.find((c) => c.continent === continent);
  const list = data ? data.languages : [];
  const total = list.length;

  // A second lookup with spaces stripped, so "haitiancreole" also resolves —
  // typing the space is a courtesy, not a requirement.
  const keyTargets = new Map();
  const concatTargets = new Map();
  for (const lang of list) {
    const names = [lang.name, ...(lang.aliases || [])];
    for (const name of names) {
      const key = slugify(name);
      keyTargets.set(key, lang.name);
      const concat = key.replace(/-/g, '');
      if (concat !== key && !concatTargets.has(concat)) concatTargets.set(concat, lang.name);
    }
  }

  function resolve(raw) {
    const key = slugify(raw);
    if (!key) return null;
    if (keyTargets.has(key)) return keyTargets.get(key);
    return concatTargets.get(key.replace(/-/g, '')) ?? null;
  }

  const input = el('input');
  const form = el('form');
  const feedback = el('feedback');
  const foundBox = el('found');
  const countEl = el('count');
  const timerEl = el('timer');
  const progressFill = el('progress');

  let remaining;
  let found;
  let timeLeft;
  let timer = null;
  let running = false;

  function paintCount() {
    if (countEl) countEl.textContent = `${found.length} / ${total} found`;
    if (progressFill) progressFill.style.width = `${(found.length / total) * 100}%`;
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

  function addFound(name) {
    remaining.delete(name);
    found.push(name);
    paintCount();
    if (foundBox) {
      const chip = document.createElement('span');
      chip.className = 'recall-chip';
      chip.textContent = name;
      foundBox.prepend(chip);
    }
    if (remaining.size === 0) setTimeout(() => finish(true), 700);
  }

  function submit() {
    if (!input || !running) return;
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;

    const name = resolve(raw);
    if (!name) {
      flash('wrong', `"${raw}" isn't on this list`);
      return;
    }
    if (!remaining.has(name)) {
      flash('duplicate', `Already got ${name}`);
      return;
    }
    addFound(name);
    flash('correct', name);
  }

  input?.addEventListener('input', () => {
    if (!running || !input) return;
    const name = resolve(input.value.trim());
    if (name && remaining.has(name)) submit();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    submit();
  });

  function tick() {
    timeLeft -= 1;
    if (timerEl) {
      timerEl.textContent = formatClock(timeLeft);
      timerEl.classList.toggle('is-low', timeLeft <= 20);
    }
    if (timeLeft <= 0) finish(false);
  }

  function paintReveal() {
    const box = el('result-reveal');
    if (!box) return;
    box.innerHTML = list
      .map((lang, i) => {
        const got = found.includes(lang.name);
        return `<li data-found="${got}">
          <span class="rank">#${i + 1}</span>
          <span class="mark">${got ? icon('check') : icon('cross')}</span>
          <span>
            <strong>${lang.name}</strong>
            <span class="meta">${lang.speakers} · ${lang.region}</span>
          </span>
        </li>`;
      })
      .join('');
  }

  function finish(cleared) {
    if (!running) return;
    running = false;
    clearInterval(timer);
    input?.blur();

    const { isBest, best, streakDays } = recordGame({
      type: gameType,
      difficulty: DIFFICULTY,
      score: found.length,
      correct: found.length,
      total,
      bestStreak: 0,
      daily: false
    });

    const set = (name, value) => {
      const node = el(name);
      if (node) node.textContent = value;
    };

    set('result-title', cleared ? 'Cleared!' : "Time's up!");
    set('result-score', found.length);

    const starsEl = el('result-stars');
    if (starsEl) {
      const starCount = Math.round((found.length / total) * 5);
      starsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
        icon(i < starCount ? 'star' : 'starOutline')
      ).join('');
    }

    set('result-summary', `${found.length} / ${total} found`);
    set(
      'result-verdict',
      cleared
        ? `All ${total}, no time to spare. That is the top of the leaderboard.`
        : found.length === 0
          ? 'Everyone starts somewhere — the full list below is the fastest way to learn it.'
          : `${found.length} of ${total} — the full ranking is below.`
    );
    set('result-best', `Personal best: ${best} of ${total} · ${streakDays} day streak`);

    const newBest = el('result-new-best');
    if (newBest) newBest.hidden = !isBest;

    paintReveal();
    show('results');
  }

  function start() {
    remaining = new Set(list.map((lang) => lang.name));
    found = [];
    timeLeft = TIME_LIMIT;
    running = true;

    if (foundBox) foundBox.innerHTML = '';
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
  el('stop')?.addEventListener('click', () => finish(false));

  wireShare(root, () => {
    const gameName = document.querySelector('h1')?.textContent?.trim() || siteName();
    return {
      title: siteName(),
      text: `I named ${found?.length ?? 0}/${total} on ${gameName} — can you beat me?`,
      url: window.location.href
    };
  });

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
