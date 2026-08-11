/**
 * mapgeo.js — reads assets/world.svg and measures every country.
 *
 * The map's paths use only relative moveto (`m`) with implicit relative
 * linetos and `z` — pure polygons, no curves — so an exact bounding box can be
 * computed here at build time rather than measured in the browser.
 *
 * SVG semantics that matter:
 *   - an initial relative `m` is treated as absolute;
 *   - coordinate pairs following an `m` are relative linetos, not movetos;
 *   - `z` returns the current point to the start of that subpath, and a
 *     following `m` is relative to that point.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './layout.js';

const round = (n) => Math.round(n * 100) / 100;

/** Decodes a path into its subpaths as arrays of absolute points. */
function subpaths(d) {
  const tokens = d.match(/[mz]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
  const out = [];
  let current = [];

  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  let started = false;
  let expectMoveto = false;
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === 'm' || token === 'M') {
      expectMoveto = true;
      i += 1;
      continue;
    }
    if (token === 'z' || token === 'Z') {
      if (current.length) out.push(current);
      current = [];
      cx = startX;
      cy = startY;
      i += 1;
      continue;
    }

    const dx = Number(token);
    const dy = Number(tokens[i + 1]);
    i += 2;
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) continue;

    if (expectMoveto) {
      if (current.length) out.push(current);
      current = [];
      // The first moveto of a path is absolute; later ones are relative.
      cx = started ? cx + dx : dx;
      cy = started ? cy + dy : dy;
      startX = cx;
      startY = cy;
      started = true;
      expectMoveto = false;
    } else {
      cx += dx;
      cy += dy;
    }
    current.push([cx, cy]);
  }
  if (current.length) out.push(current);
  return out;
}

/**
 * Bounding box plus filled area.
 *
 * Area matters as much as the box: Tuvalu and the Maldives span a wide box but
 * are scattered specks with almost no fill, so they are unusable as shapes even
 * though their bounding box looks reasonable.
 *
 * @returns {{x:number,y:number,width:number,height:number,area:number,maxDim:number}|null}
 */
export function pathBBox(d) {
  const parts = subpaths(d);
  if (!parts.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let area = 0;

  let best = null; // largest subpath by area

  for (const points of parts) {
    let shoelace = 0;
    let pMinX = Infinity;
    let pMinY = Infinity;
    let pMaxX = -Infinity;
    let pMaxY = -Infinity;

    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      shoelace += x1 * y2 - x2 * y1;
      if (x1 < pMinX) pMinX = x1;
      if (y1 < pMinY) pMinY = y1;
      if (x1 > pMaxX) pMaxX = x1;
      if (y1 > pMaxY) pMaxY = y1;
    }

    const partArea = Math.abs(shoelace) / 2;
    area += partArea;

    if (pMinX < minX) minX = pMinX;
    if (pMinY < minY) minY = pMinY;
    if (pMaxX > maxX) maxX = pMaxX;
    if (pMaxY > maxY) maxY = pMaxY;

    if (!best || partArea > best.area) {
      best = {
        area: partArea,
        x: pMinX,
        y: pMinY,
        width: pMaxX - pMinX,
        height: pMaxY - pMinY
      };
    }
  }

  if (minX === Infinity) return null;
  const width = maxX - minX;
  const height = maxY - minY;
  return {
    x: round(minX),
    y: round(minY),
    width: round(width),
    height: round(height),
    area: round(area),
    maxDim: round(Math.max(width, height)),
    // The largest single landmass. Distant territories — Svalbard for Norway,
    // Alaska for the United States, the Galápagos for Ecuador — blow the full
    // bounding box up to continental size, which would zoom the map quiz out
    // to uselessness. Framing follows this box instead.
    mainBox: {
      x: round(best.x),
      y: round(best.y),
      width: round(best.width),
      height: round(best.height)
    }
  };
}

/** Every `<path id="XX" title="…" d="…">` in the world map, measured. */
export function readWorldMap(file = 'assets/world.svg') {
  const svg = readFileSync(join(ROOT, file), 'utf8');

  const width = Number(/\swidth="([\d.]+)"/.exec(svg)?.[1] || 0);
  const height = Number(/\sheight="([\d.]+)"/.exec(svg)?.[1] || 0);

  const entries = [];
  const re = /<path\b[^>]*?d="([^"]*)"[^>]*?>/gs;
  for (const match of svg.matchAll(re)) {
    const tag = match[0];
    const id = /\sid="([^"]*)"/.exec(tag)?.[1];
    const title = /\stitle="([^"]*)"/.exec(tag)?.[1] || '';
    if (!id) continue;
    const box = pathBBox(match[1]);
    if (!box) continue;
    entries.push({ id: id.toUpperCase(), title, ...box });
  }

  return { width, height, entries };
}

/**
 * Which countries each map game can actually use.
 *
 * `shape` — the silhouette has to be recognisable when scaled to fit a card.
 * `locate` — the country also has to be big enough to tap once the map zooms
 *            to its region, which is a stricter bar than merely being visible.
 */
export const PLAYABLE = {
  shape: { minDim: 4, minArea: 3 },
  locate: { minDim: 6, minArea: 3 }
};

export function mapCoverage(countries) {
  const { width, height, entries } = readWorldMap();
  const byCode = new Map(entries.map((e) => [e.id, e]));

  const countriesOut = countries.map((country) => {
    const box = byCode.get(country.code);
    const fits = (rule) => Boolean(box && box.maxDim >= rule.minDim && box.area >= rule.minArea);
    return {
      code: country.code,
      name: country.name,
      continent: country.continent,
      tier: country.tier,
      box: box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null,
      mainBox: box ? box.mainBox : null,
      area: box ? box.area : 0,
      shape: fits(PLAYABLE.shape),
      locate: fits(PLAYABLE.locate)
    };
  });

  return {
    viewBox: { width: round(width), height: round(height) },
    source: 'assets/world.svg',
    rules: PLAYABLE,
    countries: countriesOut
  };
}
