/**
 * theme.js — light/dark toggle.
 *
 * The initial theme is applied by a tiny inline script in <head> (see the page
 * template) so there is no flash of the wrong colours. This module only owns
 * the toggle button afterwards.
 */

import { getTheme, setTheme } from './storage.js';

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function currentTheme() {
  return getTheme() || (systemPrefersDark() ? 'dark' : 'light');
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    // Which glyph shows is handled in CSS off :root[data-theme]; only the
    // accessible name needs updating here. Writing textContent would wipe
    // the inline SVGs.
    const next = theme === 'dark' ? 'light' : 'dark';
    btn.setAttribute('aria-label', `Switch to ${next} mode`);
    btn.setAttribute('title', `Switch to ${next} mode`);
  });
}

export function initTheme() {
  applyTheme(currentTheme());

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
      applyTheme(next);
    });
  });

  // Follow the OS while the visitor has not made an explicit choice.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (!getTheme()) applyTheme(event.matches ? 'dark' : 'light');
    });
  }
}
