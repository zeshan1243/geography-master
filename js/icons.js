/**
 * icons.js — the single icon set, used by both the page generator and the
 * browser.
 *
 * SVG rather than emoji throughout the interface: emoji cannot take a colour,
 * draw as a different picture on every platform, and sit on the text baseline
 * instead of centring against a label. These use currentColor, so an icon
 * always matches the text it sits beside.
 *
 * This module is plain ESM with no DOM access, so tools/lib/layout.js imports
 * it at build time and js/game.js imports it at runtime — one definition, not
 * two copies that drift.
 *
 * Anything marked `class="solid"` is filled; everything else is stroked.
 */

export const ICONS = {
  play: '<path class="solid" d="M8 5.2v13.6L19 12z"/>',

  dice:
    '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="3.6"/>' +
    '<circle class="solid" cx="8.6" cy="8.6" r="1.45"/>' +
    '<circle class="solid" cx="12" cy="12" r="1.45"/>' +
    '<circle class="solid" cx="15.4" cy="15.4" r="1.45"/>',

  grid:
    '<rect x="3.4" y="3.4" width="7.2" height="7.2" rx="1.8"/>' +
    '<rect x="13.4" y="3.4" width="7.2" height="7.2" rx="1.8"/>' +
    '<rect x="3.4" y="13.4" width="7.2" height="7.2" rx="1.8"/>' +
    '<rect x="13.4" y="13.4" width="7.2" height="7.2" rx="1.8"/>',

  refresh: '<path d="M20.4 12a8.4 8.4 0 1 1-2.46-5.94"/><path d="M20.4 3.8v5.2h-5.2"/>',

  check: '<path d="M4.8 12.6l4.6 4.6L19.2 7.4"/>',
  cross: '<path d="M6.6 6.6l10.8 10.8M17.4 6.6L6.6 17.4"/>',

  checkCircle: '<circle cx="12" cy="12" r="8.6"/><path d="M8.3 12.3l2.6 2.6 4.8-5.2"/>',
  crossCircle: '<circle cx="12" cy="12" r="8.6"/><path d="M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4"/>',

  flag: '<path d="M5.6 21V3.6"/><path d="M5.6 4.6h12.2l-2.5 3.7 2.5 3.7H5.6z"/>',

  trophy:
    '<path d="M7.2 4h9.6v4.6a4.8 4.8 0 0 1-9.6 0z"/>' +
    '<path d="M7.2 5.6H4.6A2.6 2.6 0 0 0 7.2 10"/>' +
    '<path d="M16.8 5.6h2.6A2.6 2.6 0 0 1 16.8 10"/>' +
    '<path d="M12 13.4v3.2M8.8 20h6.4"/>',

  star:
    '<path class="solid" d="M12 3.4l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 16.93l-5.3 2.78 1.01-5.9L3.42 9.63l5.93-.86z"/>',

  starOutline:
    '<path d="M12 3.4l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 16.93l-5.3 2.78 1.01-5.9L3.42 9.63l5.93-.86z"/>',

  target:
    '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.4"/>' +
    '<circle class="solid" cx="12" cy="12" r="1.5"/>',

  dot: '<circle class="solid" cx="12" cy="12" r="6.4"/>'
};

/**
 * @param {keyof ICONS} name
 * @param {string} [cls] extra class names
 * @returns {string} SVG markup
 */
export function icon(name, cls = '') {
  const body = ICONS[name];
  if (!body) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="icon${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}
