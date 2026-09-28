/**
 * navigation.js — mobile drawer, active link highlighting and site search.
 */

import { searchIndex, slugify } from './data.js';

const MAX_RESULTS = 8;
const MAX_PER_GROUP = 4;

const GROUP_LABELS = {
  country: 'Countries',
  game: 'Games',
  guide: 'Guides',
  blog: 'Blog',
  compare: 'Compare'
};
/** Search groups render in this fixed order regardless of match count. */
const GROUP_ORDER = ['country', 'game', 'guide', 'blog', 'compare'];

function initDrawer() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const drawer = document.getElementById('nav-drawer');
  if (!toggle || !drawer) return;

  const setOpen = (open) => {
    drawer.dataset.open = String(open);
    // The menu/close icons swap in CSS off aria-expanded; setting textContent
    // here would delete the inline SVGs.
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.dataset.navOpen = String(open);
  };

  toggle.addEventListener('click', () => setOpen(drawer.dataset.open !== 'true'));
  drawer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.dataset.open === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && drawer.dataset.open === 'true') setOpen(false);
  });
}

function markCurrentLink() {
  const here = window.location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach((link) => {
    const target = new URL(link.getAttribute('href'), window.location.href).pathname
      .replace(/index\.html$/, '');
    if (target === here) link.setAttribute('aria-current', 'page');
  });
}

function renderResults(box, matches) {
  if (!matches.length) {
    box.innerHTML = '<p class="empty">No results for that search.</p>';
    return;
  }

  const groups = new Map();
  for (const m of matches) {
    if (!groups.has(m.type)) groups.set(m.type, []);
    groups.get(m.type).push(m);
  }

  box.innerHTML = GROUP_ORDER.filter((type) => groups.has(type))
    .map(
      (type) => `<div class="search-group">
        <h3>${GROUP_LABELS[type] || type}</h3>
        ${groups
          .get(type)
          .map(
            (m) => `<a href="${m.url}">
          <span class="flag" aria-hidden="true">${m.icon}</span>
          <span>
            <strong>${m.title}</strong>
            <span class="meta">${m.subtitle}</span>
          </span>
        </a>`
          )
          .join('')}
      </div>`
    )
    .join('');
}

function initSearch() {
  const inputs = document.querySelectorAll('[data-country-search]');
  if (!inputs.length) return;

  let index = null;
  const ensureIndex = async () => {
    if (!index) index = await searchIndex();
    return index;
  };

  inputs.forEach((input) => {
    const box = document.getElementById(input.dataset.countrySearch);
    if (!box) return;

    const run = async () => {
      const query = input.value.trim().toLowerCase();
      if (query.length < 2) {
        box.innerHTML = '';
        return;
      }
      const list = await ensureIndex();
      const sorted = list
        .filter((m) => m.title.toLowerCase().includes(query) || m.subtitle.toLowerCase().includes(query))
        .sort((a, b) => {
          const aStarts = a.title.toLowerCase().startsWith(query) ? 0 : 1;
          const bStarts = b.title.toLowerCase().startsWith(query) ? 0 : 1;
          return aStarts - bStarts || a.title.localeCompare(b.title);
        });

      // Capped per group first, so 195 country matches cannot crowd out
      // games, guides and everything else, then capped overall so the
      // dropdown stays a glance-able list rather than a full page.
      const perType = new Map();
      const matches = [];
      for (const m of sorted) {
        const count = perType.get(m.type) || 0;
        if (count >= MAX_PER_GROUP) continue;
        perType.set(m.type, count + 1);
        matches.push(m);
        if (matches.length >= MAX_RESULTS) break;
      }

      renderResults(box, matches);
    };

    input.addEventListener('input', run);
    input.addEventListener('focus', ensureIndex);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        box.innerHTML = '';
      }
      if (e.key === 'Enter') {
        const first = box.querySelector('a');
        if (first) window.location.href = first.href;
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.parentElement.contains(e.target)) box.innerHTML = '';
    });
  });
}

export function initNavigation() {
  initDrawer();
  markCurrentLink();
  initSearch();
}

export { slugify };
