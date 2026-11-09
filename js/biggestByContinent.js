/**
 * biggestByContinent.js — "Five Biggest Countries by Continent": fill in all
 * 30 blanks (five per continent, six continents) by typing. Same
 * reveal-on-type pattern as languageTable.js, just tracking six parallel
 * groups instead of one flat list; the answer data (area rankings) is real
 * static markup from tools/lib/pages.js, computed from the site's own
 * country data at build time.
 */

import { slugify, aliases, games, gameUrl } from './data.js';
import { recordGame, bestScore } from './storage.js';
import { siteName } from './share.js';

const GAME_TYPE = 'biggestByContinent';
const DIFFICULTY = 'all';

async function renderRelated(root) {
  const box = root.querySelector('[data-related]');
  if (!box) return;
  const list = await games();
  const others = list.filter((g) => g.id !== GAME_TYPE).sort(() => Math.random() - 0.5).slice(0, 3);
  box.innerHTML = others
    .map((g) => `<a href="${gameUrl(g)}"><span aria-hidden="true">${g.icon}</span> ${g.name}</a>`)
    .join('');
}

export async function initBiggestByContinent() {
  const root = document.querySelector('[data-rank-table]');
  if (!root) return;

  const aliasMap = await aliases();

  const el = (name) => root.querySelector(`[data-${name}]`);
  const screens = {
    setup: root.querySelector('[data-screen="setup"]'),
    play: root.querySelector('[data-screen="play"]')
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
    bestLine.textContent = best ? `Your best: ${best} countries found` : 'No score yet — see how many you know.';
  };
  paintBest();

  const rows = [...root.querySelectorAll('[data-rank-row]')];
  const total = rows.length;
  const byAnswer = new Map(rows.map((row) => [row.dataset.answer, row]));

  /** A typed key resolves either to its own slug or, failing that, a known alias for it. */
  function resolve(raw) {
    const key = slugify(raw);
    if (byAnswer.has(key)) return key;
    const aliased = aliasMap[key];
    return aliased && byAnswer.has(aliased) ? aliased : null;
  }

  const input = el('rank-input');
  const form = el('rank-form');
  const feedback = el('rank-feedback');
  const countEl = el('rank-count');
  const progressFill = el('rank-progress');
  const banner = el('rank-banner');
  const giveUpBtn = el('rank-giveup');

  let remaining;
  let found;
  let running = false;

  function paintCount() {
    if (countEl) countEl.textContent = `${found} / ${total} found`;
    if (progressFill) progressFill.style.width = `${(found / total) * 100}%`;
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

  function reveal(row, { guessed = true } = {}) {
    const cell = row.querySelector('[data-rank-cell]');
    if (cell) {
      cell.innerHTML = `<span class="lang-answer" data-guessed="${guessed}">${row.dataset.country}<span class="lang-answer-area">${row.dataset.area}</span></span>`;
    }
    row.dataset.found = 'true';
  }

  function finish() {
    if (!running) return;
    running = false;
    input?.blur();
    if (giveUpBtn) giveUpBtn.hidden = true;
    if (form) form.hidden = true;

    const { isBest, best } = recordGame({
      type: GAME_TYPE,
      difficulty: DIFFICULTY,
      score: found,
      correct: found,
      total,
      bestStreak: 0,
      daily: false
    });

    if (banner) {
      banner.hidden = false;
      banner.innerHTML = `
        <p class="results-summary"><strong>${found} / ${total}</strong> countries found${isBest ? ' — new personal best!' : ''}</p>
        <p class="results-best">Personal best: ${best} / ${total}</p>
        <div class="btn-row">
          <button class="btn btn-primary" type="button" data-play-again>Play Again</button>
          <a class="btn btn-secondary" href="/games/">Try Another Game</a>
          <a class="btn btn-ghost" href="/games/">Back to Games</a>
          <button class="btn btn-ghost" type="button" data-share-result>Share your result</button>
        </div>
      `;
      banner.querySelector('[data-play-again]')?.addEventListener('click', start);
      banner.querySelector('[data-share-result]')?.addEventListener('click', () => {
        const shareData = {
          title: siteName(),
          text: `I named ${found}/${total} on Five Biggest Countries by Continent — can you beat me?`,
          url: window.location.href
        };
        if (navigator.share) navigator.share(shareData).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(shareData.url).catch(() => {});
      });
    }
  }

  function submit() {
    if (!input || !running) return;
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;

    const key = resolve(raw);
    const row = key ? byAnswer.get(key) : null;
    if (!row) {
      flash('wrong', `"${raw}" did not match one of the 30 countries on this list`);
      return;
    }
    if (row.dataset.found === 'true') {
      flash('duplicate', `Already got ${row.dataset.country}`);
      return;
    }

    remaining.delete(key);
    found += 1;
    reveal(row);
    paintCount();
    flash('correct', row.dataset.country);
    if (remaining.size === 0) setTimeout(finish, 500);
  }

  input?.addEventListener('input', () => {
    const key = resolve(input.value.trim());
    const row = key ? byAnswer.get(key) : null;
    if (row && row.dataset.found !== 'true') submit();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    submit();
  });

  giveUpBtn?.addEventListener('click', () => {
    for (const row of rows) {
      if (row.dataset.found !== 'true') reveal(row, { guessed: false });
    }
    remaining = new Set();
    finish();
  });

  function start() {
    remaining = new Set(byAnswer.keys());
    found = 0;
    running = true;

    for (const row of rows) {
      row.dataset.found = 'false';
      const cell = row.querySelector('[data-rank-cell]');
      if (cell) cell.innerHTML = '<span class="lang-blank" data-rank-blank aria-label="Not yet guessed">?</span>';
    }
    if (giveUpBtn) giveUpBtn.hidden = false;
    if (form) form.hidden = false;
    if (banner) {
      banner.hidden = true;
      banner.innerHTML = '';
    }
    if (feedback) feedback.hidden = true;
    if (input) input.value = '';
    paintCount();

    show('play');
    input?.focus();
  }

  el('start')?.addEventListener('click', start);

  renderRelated(root);

  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') start();
}
