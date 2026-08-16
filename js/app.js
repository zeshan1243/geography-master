/**
 * app.js — the single entry point every page loads.
 *
 * Sets up the theme and navigation, then fills in whichever optional hooks the
 * current page happens to contain. Heavier modules (the game engine) are
 * imported on demand so content pages stay light.
 */

import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initAds } from './ads.js';
import { games, url, gameUrl, formatNumber } from './data.js';
import {
  load,
  weekActivity,
  countStreak,
  dailyDoneToday,
  accuracy,
  favoriteGame,
  missedCount
} from './storage.js';

/* --- Game cards ---------------------------------------------------------- */

function gameCard(game) {
  return `<a class="game-card" href="${gameUrl(game)}" data-accent="${game.accent}">
      <span class="icon" aria-hidden="true">${game.icon}</span>
      <h3>${game.name}</h3>
      <p>${game.tagline}</p>
      <span class="play">Play</span>
    </a>`;
}

async function renderGameCards() {
  const targets = document.querySelectorAll('[data-game-cards]');
  if (!targets.length) return;
  const list = await games();
  targets.forEach((box) => {
    const which = box.dataset.gameCards;
    const limit = Number(box.dataset.limit || 0);
    let selection = which === 'popular' ? list.filter((g) => g.popular) : list;
    if (limit) selection = selection.slice(0, limit);
    box.innerHTML = selection.map(gameCard).join('');
  });
}

/* --- Play now / random game --------------------------------------------- */

/**
 * "Name the Countries" has no single page to autostart — its own slug is a
 * hub linking out to "all 195" plus one page per letter. Quick-play always
 * means jumping straight into a round, so it goes to the full 195 variant.
 */
function quickPlayUrl(game) {
  const path = game.mode === 'recall' && game.variants === 'letters' ? `game/${game.slug}/all` : `game/${game.slug}`;
  const difficulty = game.mode === 'recall' ? '' : 'difficulty=medium&';
  return `${url(path)}?${difficulty}autostart=1`;
}

async function wireQuickPlay() {
  const playNow = document.querySelector('[data-play-now]');
  const random = document.querySelector('[data-random-game]');
  if (!playNow && !random) return;

  const list = await games();

  if (playNow) {
    // The visitor's most-played game if there is one, otherwise the flag quiz.
    const favourite = favoriteGame();
    const target = list.find((g) => g.id === favourite) || list.find((g) => g.id === 'flags') || list[0];
    playNow.href = quickPlayUrl(target);
  }

  if (random) {
    random.addEventListener('click', (event) => {
      event.preventDefault();
      const pick = list[Math.floor(Math.random() * list.length)];
      window.location.href = quickPlayUrl(pick);
    });
  }
}

/* --- Daily challenge ----------------------------------------------------- */

async function renderDaily() {
  const box = document.querySelector('[data-daily]');
  if (!box) return;

  const list = await games();
  const mixed = list.find((g) => g.id === 'mixed') || list[0];
  const link = box.querySelector('[data-daily-link]');
  const dateLabel = box.querySelector('[data-daily-date]');
  const state = box.querySelector('[data-daily-state]');

  if (link) link.href = `${url(`game/${mixed.slug}`)}?daily=1`;

  if (dateLabel) {
    dateLabel.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  const done = dailyDoneToday();
  if (state) {
    state.textContent = done
      ? `Completed today — you scored ${formatNumber(done)} points. Play it again for practice.`
      : 'Thirty questions, the same for everyone, changing at midnight.';
  }

  if (done && link) {
    // Only the label changes; the play/refresh icons swap in CSS off
    // data-done. Writing textContent here would delete the inline SVGs.
    link.dataset.done = 'true';
    const label = link.querySelector('[data-daily-label]');
    if (label) label.textContent = 'Play Again';
  }
}

/* --- Streak calendar ----------------------------------------------------- */

function renderStreak() {
  const box = document.querySelector('[data-streak-calendar]');
  if (!box) return;
  const week = weekActivity();
  box.innerHTML = week
    .map(
      (day) => `<div class="streak-day" data-done="${day.done}">
        ${day.label}
        <span class="dot" aria-hidden="true">${day.done ? '✓' : '○'}</span>
        <span class="sr-only">${day.done ? 'played' : 'not played'} on ${day.key}</span>
      </div>`
    )
    .join('');

  const label = document.querySelector('[data-streak-count]');
  if (label) {
    const streak = countStreak();
    label.textContent = streak
      ? `🔥 ${streak} day geography streak`
      : 'Play today to start a streak';
  }
}

/* --- Personal stats ------------------------------------------------------ */

function renderStats() {
  const box = document.querySelector('[data-stats]');
  if (!box) return;
  const profile = load();
  const best = Math.max(0, ...Object.values(profile.bestScores), 0);

  const stats = [
    ['Games played', formatNumber(profile.gamesPlayed)],
    ['Best score', formatNumber(best)],
    ['Correct answers', formatNumber(profile.correctAnswers)],
    ['Accuracy', `${accuracy(profile)}%`]
  ];

  box.innerHTML = stats
    .map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`)
    .join('');

  const empty = document.querySelector('[data-stats-empty]');
  if (empty) empty.hidden = profile.gamesPlayed > 0;
}

/* --- Review prompt ------------------------------------------------------- */

function renderReviewCallout() {
  const box = document.querySelector('[data-review-callout]');
  if (!box) return;
  const due = missedCount();
  box.hidden = due === 0;
  const label = box.querySelector('[data-review-callout-count]');
  if (label) {
    label.textContent = `Review ${due} question${due === 1 ? '' : 's'} you got wrong`;
  }
}

/* --- Country index filtering -------------------------------------------- */

function wireCountryFilter() {
  const list = document.querySelector('[data-country-index]');
  if (!list) return;

  const search = document.querySelector('[data-country-filter]');
  const continent = document.querySelector('[data-continent-filter]');
  const count = document.querySelector('[data-country-count]');
  const items = Array.from(list.children);

  const apply = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const region = continent?.value || 'all';
    let shown = 0;
    items.forEach((item) => {
      const matchesText =
        !query ||
        item.dataset.name.toLowerCase().includes(query) ||
        item.dataset.capital.toLowerCase().includes(query);
      const matchesRegion = region === 'all' || item.dataset.continent === region;
      const visible = matchesText && matchesRegion;
      item.hidden = !visible;
      if (visible) shown += 1;
    });
    if (count) count.textContent = `${shown} ${shown === 1 ? 'country' : 'countries'}`;
  };

  search?.addEventListener('input', apply);
  continent?.addEventListener('change', apply);
  apply();
}

/* --- Boot ---------------------------------------------------------------- */

function boot() {
  initTheme();
  initNavigation();

  renderStreak();
  renderStats();
  renderReviewCallout();
  wireCountryFilter();

  renderGameCards();
  wireQuickPlay();
  renderDaily();

  if (document.querySelector('[data-game]')) {
    import('./game.js').then((mod) => mod.initGamePage());
  }

  if (document.querySelector('[data-recall-game]')) {
    import('./recall.js').then((mod) => mod.initRecallGame());
  }

  initAds();

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
