/**
 * worldmap.js — the shared world map for the shape and locate quizzes.
 *
 * assets/world.svg holds one <path id="XX" title="…"> per country, keyed by
 * ISO 3166-1 alpha-2, covering all 195 countries in the dataset. It is fetched
 * once, parsed once, and cloned from thereafter — it is ~380 KB gzipped, so it
 * is only ever loaded on the two map game pages.
 *
 * Geometry (bounding boxes, playability) is precomputed at build time into
 * data/map-coverage.json rather than measured here with getBBox(), which keeps
 * question selection instant and testable outside a browser.
 */

import { url } from './data.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

let mapPromise = null;

/** Fetches and parses world.svg once per page. */
export function loadMap() {
  if (!mapPromise) {
    mapPromise = fetch(url('assets/world.svg'))
      .then((res) => {
        if (!res.ok) throw new Error(`world.svg failed to load (${res.status})`);
        return res.text();
      })
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        if (doc.querySelector('parsererror')) throw new Error('world.svg is not valid SVG');
        const root = doc.documentElement;
        return {
          doc,
          width: Number(root.getAttribute('width')) || 1010,
          height: Number(root.getAttribute('height')) || 666
        };
      })
      .catch((error) => {
        mapPromise = null;
        throw error;
      });
  }
  return mapPromise;
}

function createSvg(viewBox, className) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('class', className);
  svg.setAttribute('role', 'img');
  return svg;
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * A window around `box` that leaves the country large enough to tap while
 * keeping enough surrounding land to make the question a real one.
 */
export function zoomWindow(box, map, { context = 2.8, minWidth = 80, aspect } = {}) {
  // The window must match the aspect of the box it will be drawn into,
  // otherwise preserveAspectRatio letterboxes it and the map renders smaller
  // than the space available — which matters most on phones.
  const ratio = aspect || map.width / map.height;
  const maxDim = Math.max(box.width, box.height);

  // The window scales with the country so there is always roughly the same
  // amount of surrounding context, and `minWidth` stops small countries from
  // zooming in so far that only one country is on screen. A fixed target
  // fraction would be wrong in the other direction: it would push large
  // countries like Norway or the United States out to a hemisphere-wide view.
  let width = clamp(maxDim * context, minWidth, map.width);
  let height = width / ratio;

  // Tall, narrow countries (Chile, Norway) need the height driven instead.
  if (height < box.height * 1.3) {
    height = Math.min(box.height * 1.3, map.height);
    width = clamp(height * ratio, minWidth, map.width);
    height = width / ratio;
  }

  // A tall container can ask for more height than the map has.
  if (height > map.height) {
    height = map.height;
    width = height * ratio;
  }

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const x = clamp(cx - width / 2, 0, Math.max(0, map.width - width));
  const y = clamp(cy - height / 2, 0, Math.max(0, map.height - height));

  return `${x} ${y} ${width} ${height}`;
}

/**
 * A single country's silhouette, scaled to fill its own viewBox.
 * Used by the shape quiz.
 */
export async function shapeOf(code, label) {
  const map = await loadMap();
  const source = map.doc.getElementById(code);
  if (!source) return null;

  const path = source.cloneNode(true);
  path.removeAttribute('id');

  // Measuring needs the node in a rendered document, so the viewBox is set
  // after insertion by fitShape() below.
  const svg = createSvg('0 0 100 100', 'shape-svg');
  svg.setAttribute('aria-label', label || 'Country outline');
  svg.appendChild(path);
  svg.dataset.fit = 'pending';
  return svg;
}

/** Sets a shape SVG's viewBox to its own bounds. Call once it is in the DOM. */
export function fitShape(svg, padRatio = 0.06) {
  const path = svg.querySelector('path');
  if (!path) return;
  const box = path.getBBox();
  const pad = Math.max(box.width, box.height) * padRatio;
  svg.setAttribute(
    'viewBox',
    `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`
  );
  svg.dataset.fit = 'done';
}

/**
 * The full interactive map. Every country is drawn; only those in
 * `clickable` respond to input.
 *
 * Hit areas are widened with a transparent stroke rather than by changing the
 * shapes, so a small country stays tappable without looking any different.
 */
export async function interactiveMap({ clickable, names, label }) {
  const map = await loadMap();
  const svg = createSvg(`0 0 ${map.width} ${map.height}`, 'world-map');
  svg.setAttribute('aria-label', label || 'World map');

  const clickableSet = new Set(clickable);

  for (const source of map.doc.querySelectorAll('path[id]')) {
    const code = source.getAttribute('id').toUpperCase();
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', source.getAttribute('d'));
    path.setAttribute('id', `map-${code}`);
    path.dataset.code = code;

    if (clickableSet.has(code)) {
      path.classList.add('is-target');
      const name = names?.get(code);
      if (name) path.dataset.name = name;
    } else {
      // Territories and dependencies: drawn for context, never answers.
      path.classList.add('is-inert');
    }
    svg.appendChild(path);
  }

  return { svg, map };
}
