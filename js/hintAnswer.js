/**
 * hintAnswer.js — "Only Geography": a curated hint/answer fill-in table, same
 * reveal-on-type pattern as languageTable.js and biggestByContinent.js. The
 * difference is that a couple of rows accept more than one correct answer
 * (see data/hint-answer.json), so each row's `data-answer` is a pipe-joined
 * list of accepted slugs rather than a single one, with a parallel
 * pipe-joined `data-labels` list for showing back whichever one was typed.
 */

import { slugify, games, gameUrl } from './data.js';
import { recordGame, bestScore } from './storage.js';
import { siteName } from './share.js';

const GAME_TYPE = 'hintAnswer';
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

export function initHintAnswer() {
  const root = document.querySelector('[data-hint-table]');
  if (!root) return;

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
    bestLine.textContent = best ? `Your best: ${best} hints solved` : 'No score yet — see how many you know.';
  };
  paintBest();

  const rows = [...root.querySelectorAll('[data-hint-row]')];
  const total = rows.length;

  // A typed answer can match any row; each row accepts one or more slugs.
  const byAnswer = new Map();
  for (const row of rows) {
    const slugs = row.dataset.answer.split('|');
    const labels = row.dataset.labels.split('|');
    slugs.forEach((slug, i) => byAnswer.set(slug, { row, label: labels[i] || row.dataset.display }));
  }

  const input = el('hint-input');
  const form = el('hint-form');
  const feedback = el('hint-feedback');
  const countEl = el('hint-count');
  const progressFill = el('hint-progress');
  const banner = el('hint-banner');
  const giveUpBtn = el('hint-giveup');

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

  function reveal(row, label, { guessed = true } = {}) {
    const cell = row.querySelector('[data-hint-cell]');
    if (cell) {
      cell.innerHTML = `<span class="lang-answer" data-guessed="${guessed}">${label}</span>`;
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
        <p class="results-summary"><strong>${found} / ${total}</strong> hints solved${isBest ? ' — new personal best!' : ''}</p>
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
          text: `I solved ${found}/${total} hints on Only Geography — can you beat me?`,
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

    const match = byAnswer.get(slugify(raw));
    if (!match) {
      flash('wrong', `"${raw}" did not match any hint`);
      return;
    }
    if (match.row.dataset.found === 'true') {
      flash('duplicate', `Already got that one (${match.row.querySelector('[data-hint-cell] .lang-answer')?.textContent || 'solved'})`);
      return;
    }

    found += 1;
    reveal(match.row, match.label);
    paintCount();
    flash('correct', match.label);
    if (found === total) setTimeout(finish, 500);
  }

  input?.addEventListener('input', () => {
    const match = byAnswer.get(slugify(input.value.trim()));
    if (match && match.row.dataset.found !== 'true') submit();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    submit();
  });

  giveUpBtn?.addEventListener('click', () => {
    for (const row of rows) {
      if (row.dataset.found !== 'true') reveal(row, row.dataset.display, { guessed: false });
    }
    finish();
  });

  function start() {
    found = 0;
    running = true;

    for (const row of rows) {
      row.dataset.found = 'false';
      const cell = row.querySelector('[data-hint-cell]');
      if (cell) cell.innerHTML = '<span class="lang-blank" data-hint-blank aria-label="Not yet guessed">?</span>';
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
