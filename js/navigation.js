/**
 * navigation.js — mobile drawer, active link highlighting and country search.
 */

import { countries, url, slugify } from './data.js';

const MAX_RESULTS = 6;

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
    box.innerHTML = '<p class="empty">No country matches that search.</p>';
    return;
  }
  box.innerHTML = matches
    .map(
      (c) => `<a href="${url(`countries/${c.slug}`)}">
        <span class="flag" aria-hidden="true">${c.flag}</span>
        <span>
          <strong>${c.name}</strong>
          <span class="meta">${c.capital} · ${c.continent}</span>
        </span>
      </a>`
    )
    .join('');
}

function initSearch() {
  const inputs = document.querySelectorAll('[data-country-search]');
  if (!inputs.length) return;

  let index = null;
  const ensureIndex = async () => {
    if (!index) index = await countries();
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
      const matches = list
        .filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.capital.toLowerCase().includes(query) ||
            c.continent.toLowerCase().includes(query)
        )
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(query) ? 0 : 1;
          const bStarts = b.name.toLowerCase().startsWith(query) ? 0 : 1;
          return aStarts - bStarts || a.name.localeCompare(b.name);
        })
        .slice(0, MAX_RESULTS);
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
