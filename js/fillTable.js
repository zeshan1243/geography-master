/**
 * fillTable.js — ranked fill-in-the-blank table quizzes (coldest/hottest
 * countries by temperature, biggest cities by population…), same
 * reveal-on-type mechanics as languageTable.js. `GAME_TYPE` comes from the
 * page's own `data-game-id`, the same pattern higherLower.js uses to keep
 * its stat variants' scores separate — see that file for why. A
 * given-for-free row (used by some variants, not others) is plain markup
 * with no `data-fill-row`, so it never enters `rows` and can't be typed,
 * duplicated, or counted toward the total.
 */

import { slugify, games, gameUrl } from './data.js';
import { recordGame, bestScore } from './storage.js';
import { siteName } from './share.js';

const DIFFICULTY = 'all';

async function renderRelated(root, gameType) {
  const box = root.querySelector('[data-related]');
  if (!box) return;
  const list = await games();
  const others = list.filter((g) => g.id !== gameType).sort(() => Math.random() - 0.5).slice(0, 3);
  box.innerHTML = others
    .map((g) => `<a href="${gameUrl(g)}"><span aria-hidden="true">${g.icon}</span> ${g.name}</a>`)
    .join('');
}

export function initFillTable() {
  const root = document.querySelector('[data-fill-table]');
  if (!root) return;

  const GAME_TYPE = root.dataset.gameId;
  const itemNoun = root.dataset.itemNoun || 'countries';

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
    bestLine.textContent = best ? `Your best: ${best} ${itemNoun} found` : 'No score yet — see how many you know.';
  };
  paintBest();

  const rows = [...root.querySelectorAll('[data-fill-row]')];
  const total = rows.length;
  const byAnswer = new Map(rows.map((row) => [row.dataset.answer, row]));

  const input = el('fill-input');
  const form = el('fill-form');
  const feedback = el('fill-feedback');
  const countEl = el('fill-count');
  const progressFill = el('fill-progress');
  const banner = el('fill-banner');
  const giveUpBtn = el('fill-giveup');

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
    clearTimeout(feedback._wggTimer);
    feedback._wggTimer = setTimeout(() => {
      feedback.textContent = '';
      feedback.removeAttribute('data-kind');
    }, 1400);
  }

  function reveal(row, { guessed = true } = {}) {
    const cell = row.querySelector('[data-fill-cell]');
    if (cell) {
      cell.innerHTML = `<span class="lang-answer" data-guessed="${guessed}">${row.dataset.display}</span>`;
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
        <p class="results-summary"><strong>${found} / ${total}</strong> ${itemNoun} found${isBest ? ' — new personal best!' : ''}</p>
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
          text: `I named ${found}/${total} ${itemNoun} — can you beat me?`,
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

    const key = slugify(raw);
    const row = byAnswer.get(key);
    if (!row) {
      flash('wrong', `"${raw}" did not match any row on this list`);
      return;
    }
    if (row.dataset.found === 'true') {
      flash('duplicate', `Already got ${row.dataset.display}`);
      return;
    }

    remaining.delete(key);
    found += 1;
    reveal(row);
    paintCount();
    flash('correct', row.dataset.display);
    if (remaining.size === 0) setTimeout(finish, 500);
  }

  input?.addEventListener('input', () => {
    const key = slugify(input.value.trim());
    const row = byAnswer.get(key);
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
      const cell = row.querySelector('[data-fill-cell]');
      if (cell) cell.innerHTML = '<span class="lang-blank" data-fill-blank aria-label="Not yet guessed">?</span>';
    }
    if (giveUpBtn) giveUpBtn.hidden = false;
    if (form) form.hidden = false;
    if (banner) {
      banner.hidden = true;
      banner.innerHTML = '';
    }
    if (feedback) { feedback.textContent = ''; feedback.removeAttribute('data-kind'); }
    if (input) input.value = '';
    paintCount();

    show('play');
    input?.focus();
  }

  el('start')?.addEventListener('click', start);

  renderRelated(root, GAME_TYPE);

  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') start();
}
