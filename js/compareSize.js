/**
 * compareSize.js — the country size comparison tool (/tools/country-size-comparison).
 *
 * Silhouettes are sized from each country's real `area` figure, not from its
 * pixel footprint on assets/world.svg. The map is an equirectangular-style
 * projection, which inflates land near the poles — scaling by projected pixel
 * area would just reproduce that distortion. Real area drives the size; the
 * SVG only supplies a recognisable outline and its aspect ratio.
 */

import { countries as loadCountries, mapCoverage, formatNumber, url } from './data.js';
import { loadMap, shapeOf, makeZoomable } from './worldmap.js';

const SUGGESTED = [
  ['Qatar', 'Bahrain'],
  ['India', 'Pakistan'],
  ['United States', 'China'],
  ['Australia', 'India'],
  ['United Kingdom', 'Germany'],
  ['Canada', 'Russia']
];

const DEFAULT_PAIR = ['United States', 'China'];

/** Container "budget", in px², the larger of the two countries is scaled to fill. */
const STAGE_BUDGET = 232 * 200;
const STAGE_MAX = { width: 240, height: 220 };
const STAGE_MIN = 16;

const display = (c) => `${c.flag} ${c.name}`;

/** Strips a leading flag emoji (or any other leading non-letter run) before matching by name. */
function normalize(raw) {
  return raw.replace(/^[^\p{L}]+/u, '').trim().toLowerCase();
}

function formatRatio(ratio) {
  if (ratio < 1.08) return 'only slightly';
  const decimals = ratio < 10 ? 1 : 0;
  return `about ${ratio.toFixed(decimals)}×`;
}

export async function initCompareSize() {
  const root = document.querySelector('[data-compare-size]');
  if (!root) return;

  const form = root.querySelector('[data-compare-form]');
  const inputA = root.querySelector('[data-compare-input="a"]');
  const inputB = root.querySelector('[data-compare-input="b"]');
  const datalist = root.querySelector('[data-compare-datalist]');
  const swapBtn = root.querySelector('[data-compare-swap]');
  const chipsBox = root.querySelector('[data-compare-chips]');
  const resultsBox = root.querySelector('[data-compare-results]');
  const errorBox = root.querySelector('[data-compare-error]');
  if (!form || !inputA || !inputB || !resultsBox) return;

  const [list, coverage] = await Promise.all([loadCountries(), mapCoverage()]);
  const byName = new Map(list.map((c) => [c.name, c]));
  const bySlug = new Map(list.map((c) => [c.slug, c]));
  const byNormalizedName = new Map(list.map((c) => [c.name.toLowerCase(), c]));
  const displayMap = new Map(list.map((c) => [display(c), c]));
  // mainBox (the largest single landmass), not the full box: a handful of
  // countries — the US, France, Norway — have a distant exclave (Alaska,
  // French Guiana, Svalbard) that blows the full bounding box up far past
  // the country's actual silhouette, which would make an accurately-scaled
  // outline look mostly empty. The shape quiz has the same problem and
  // solves it the same way (see mapgeo.js).
  const boxByCode = new Map(
    coverage.countries.filter((c) => c.mainBox || c.box).map((c) => [c.code, c.mainBox || c.box])
  );

  if (datalist) {
    datalist.innerHTML = [...list]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => `<option value="${display(c)}">`)
      .join('');
  }

  if (chipsBox) {
    chipsBox.innerHTML = SUGGESTED.map(([a, b]) => {
      const ca = byName.get(a);
      const cb = byName.get(b);
      if (!ca || !cb) return '';
      return `<button type="button" class="pill chip" data-compare-chip="${a}|${b}">${ca.flag} ${a} vs ${cb.flag} ${b}</button>`;
    }).join('');
  }

  const state = { a: null, b: null };

  function resolveCountry(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const exact = displayMap.get(trimmed);
    if (exact) return exact;
    const norm = normalize(trimmed);
    if (!norm) return null;
    const direct = byNormalizedName.get(norm);
    if (direct) return direct;
    const candidates = list.filter((c) => c.name.toLowerCase().startsWith(norm));
    return candidates.length === 1 ? candidates[0] : null;
  }

  function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    if (!errorBox) return;
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function updateUrl(a, b) {
    const params = new URLSearchParams({ a: a.slug, b: b.slug });
    history.replaceState(null, '', `?${params}`);
  }

  function sizeStage(container, svg, box, pxArea) {
    container.innerHTML = '';
    if (!svg) {
      container.textContent = '–';
      return;
    }
    const aspect = box && box.width && box.height ? box.width / box.height : 1;
    let width = Math.sqrt(Math.max(pxArea, 1) * aspect);
    let height = width / aspect;
    const shrink = Math.min(1, STAGE_MAX.width / width, STAGE_MAX.height / height);
    width = Math.max(width * shrink, STAGE_MIN);
    height = Math.max(height * shrink, STAGE_MIN);

    if (box && box.width && box.height) {
      const pad = Math.max(box.width, box.height) * 0.06;
      svg.setAttribute('viewBox', `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`);
    }
    svg.style.width = `${Math.round(width)}px`;
    svg.style.height = `${Math.round(height)}px`;
    container.appendChild(svg);
  }

  async function renderSilhouettes(a, b) {
    const stageA = resultsBox.querySelector('[data-silhouette="a"]');
    const stageB = resultsBox.querySelector('[data-silhouette="b"]');
    if (!stageA || !stageB) return;

    const [svgA, svgB] = await Promise.all([shapeOf(a.code, a.name), shapeOf(b.code, b.name)]);
    // The selection may have changed while the map was loading.
    if (state.a !== a || state.b !== b) return;

    const bigger = a.area >= b.area ? a : b;
    const scale = STAGE_BUDGET / bigger.area;
    sizeStage(stageA, svgA, boxByCode.get(a.code), a.area * scale);
    sizeStage(stageB, svgB, boxByCode.get(b.code), b.area * scale);
  }

  async function renderLocator(a, b) {
    const mapBox = resultsBox.querySelector('[data-compare-map]');
    if (!mapBox) return;
    const map = await loadMap();
    if (state.a !== a || state.b !== b) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${map.width} ${map.height}`);
    svg.setAttribute('class', 'compare-locator-map');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `World map with ${a.name} and ${b.name} highlighted`);

    for (const source of map.doc.querySelectorAll('path[id]')) {
      const code = source.getAttribute('id').toUpperCase();
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', source.getAttribute('d'));
      path.setAttribute('class', code === a.code ? 'locator-a' : code === b.code ? 'locator-b' : 'locator-other');
      svg.appendChild(path);
    }

    mapBox.innerHTML = '';
    mapBox.appendChild(svg);
    makeZoomable(svg, map);
  }

  function render() {
    const { a, b } = state;
    if (!a || !b) return;

    const larger = a.area >= b.area ? a : b;
    const smaller = larger === a ? b : a;
    const ratio = larger.area / smaller.area;
    const diff = larger.area - smaller.area;
    const pctDiff = (diff / smaller.area) * 100;

    resultsBox.hidden = false;
    resultsBox.innerHTML = `
      <div class="compare-result-head">
        <div class="compare-result-country" data-side="a">
          <span class="flag" aria-hidden="true">${a.flag}</span>
          <h2>${a.name}</h2>
          <a href="${url(`countries/${a.slug}`)}">View country profile →</a>
        </div>
        <div class="compare-vs" aria-hidden="true">vs</div>
        <div class="compare-result-country" data-side="b">
          <span class="flag" aria-hidden="true">${b.flag}</span>
          <h2>${b.name}</h2>
          <a href="${url(`countries/${b.slug}`)}">View country profile →</a>
        </div>
      </div>

      <p class="compare-verdict"><strong>${larger.name}</strong> is <strong>${formatRatio(ratio)}</strong> larger than <strong>${smaller.name}</strong> — a difference of ${formatNumber(Math.round(diff))} km² (${pctDiff.toFixed(0)}% more land area).</p>

      <dl class="fact-grid">
        <div class="fact"><dt>${a.flag} Area</dt><dd>${formatNumber(a.area)} km²</dd></div>
        <div class="fact"><dt>${b.flag} Area</dt><dd>${formatNumber(b.area)} km²</dd></div>
        <div class="fact"><dt>${a.flag} Population</dt><dd>${formatNumber(a.population)}</dd></div>
        <div class="fact"><dt>${b.flag} Population</dt><dd>${formatNumber(b.population)}</dd></div>
        <div class="fact"><dt>${a.flag} Continent</dt><dd>${a.continent}</dd></div>
        <div class="fact"><dt>${b.flag} Continent</dt><dd>${b.continent}</dd></div>
      </dl>

      <div class="silhouette-stage">
        <div class="silhouette-col">
          <div class="silhouette-box" data-silhouette="a"></div>
          <span class="silhouette-label">${a.flag} ${a.name}</span>
        </div>
        <div class="silhouette-col">
          <div class="silhouette-box" data-silhouette="b"></div>
          <span class="silhouette-label">${b.flag} ${b.name}</span>
        </div>
      </div>
      <p class="silhouette-note">Shapes are scaled to true land area, not to how large each country looks on a flat map.</p>

      <div class="compare-map-wrap" data-compare-map></div>
    `;

    renderSilhouettes(a, b);
    renderLocator(a, b);
  }

  function setPair(nameA, nameB) {
    const a = byName.get(nameA);
    const b = byName.get(nameB);
    if (!a || !b) return;
    clearError();
    state.a = a;
    state.b = b;
    inputA.value = display(a);
    inputB.value = display(b);
    render();
    updateUrl(a, b);
  }

  function handleCommit() {
    const a = resolveCountry(inputA.value);
    const b = resolveCountry(inputB.value);
    if (!a || !b) {
      const bad = !a ? inputA.value.trim() : inputB.value.trim();
      showError(bad ? `Couldn't find "${bad}" — pick a country from the list.` : 'Enter two countries to compare.');
      return;
    }
    if (a.code === b.code) {
      showError('Choose two different countries.');
      return;
    }
    clearError();
    state.a = a;
    state.b = b;
    render();
    updateUrl(a, b);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleCommit();
  });

  swapBtn?.addEventListener('click', () => {
    if (state.a && state.b) setPair(state.b.name, state.a.name);
  });

  chipsBox?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-compare-chip]');
    if (!btn) return;
    const [a, b] = btn.dataset.compareChip.split('|');
    setPair(a, b);
  });

  const params = new URLSearchParams(location.search);
  const initA = bySlug.get(params.get('a') || '') || byName.get(DEFAULT_PAIR[0]);
  const initB = bySlug.get(params.get('b') || '') || byName.get(DEFAULT_PAIR[1]);
  if (initA && initB) setPair(initA.name, initB.name);
}
