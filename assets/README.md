# Map assets

## Files

| File | Size | Countries | Use |
| --- | --- | --- | --- |
| `world.svg` | 1.2 MB (382 KB gzipped) | **195 / 195** | The map quiz. Every country in `data/countries.json` has a path. |
| `world-low.svg` | 119 KB (41 KB gzipped) | 167 / 195 | Optional lightweight fallback. Missing 28 microstates, so it cannot back the quiz on its own. |

Both use `id="XX"` — ISO 3166-1 alpha-2, uppercase in `world.svg` — which joins directly to the `code` field in `data/countries.json`. Both also carry a `mapsvg:geoViewBox` attribute mapping the drawing to real lat/long bounds, so screen coordinates can be converted to geographic ones if that is ever needed.

`world.svg` also contains 55 extra paths for dependencies and territories (Anguilla, Åland, Aruba, Greenland and so on). Render them, but leave them non-interactive — a world map with holes in it looks broken, and they are not quiz answers.

## What the map games use

Both map games derive everything from `world.svg`:

- **Map Quiz** (`/game/map-quiz.html`) renders the whole map, zooms to the target country's region and takes a click on a `<path>` as the answer.
- **Country Shape Quiz** (`/game/shape-quiz.html`) clones a single `<path>` and scales it to fill its own viewBox, giving a silhouette.

Geometry is measured once at build time by `tools/lib/mapgeo.js` into `data/map-coverage.json`, rather than with `getBBox()` in the browser. That keeps question selection instant and lets the checks run outside a browser.

Not every country can be used. Coverage is **163 of 195 for shapes** and **154 of 195 on the map** — microstates are excluded, because at world scale Monaco's outline is 0.17 units across and Vatican City's is 0.03. Both filters need a minimum dimension *and* a minimum filled area: Tuvalu and the Maldives have a respectably wide bounding box but are scattered specks with almost no fill, so a box test alone would wrongly admit them.

Framing follows each country's **largest landmass**, not its full bounding box. Norway's box includes Svalbard, the United States' includes Alaska, Ecuador's includes the Galápagos and Portugal's includes the Azores; framing on the full box zooms the map out to continental scale for all of them.

## Not used: `assets/maps/`

The plugin's 200 per-country files are **subdivision maps** — `japan.svg` is 47 prefectures with ISO 3166-2 ids, not a Japan outline. They cover only ~142 of 195 countries, weigh 24 MB, and add nothing the world map does not already do better at full coverage. They are `.gitignore`d and can be deleted.

They would only become useful for a different game — "which Japanese prefecture / US state / Indian state is highlighted?" — which does not exist yet.

## Origin and licence

Both files come from the **MapSVG Lite** WordPress plugin (mapsvg.com), which is distributed under **GPLv2 or later**. `world.svg` is byte-identical to the plugin's `maps/not-calibrated/world.svg`; `world-low.svg` is its `maps/geo-calibrated/world-low-resolution.svg`.

Keep the `<!-- Created for MapSVG plugin: http://mapsvg.com -->` comment at the top of each file. It is the attribution, and removing it is the one thing that clearly breaches the licence.

GPL obligations attach to these files, not to the rest of the site: serving them means distributing them, so they must stay under GPLv2+ and keep their notice. If a lawyer ever objects to shipping GPL assets alongside the site, the drop-in replacement is [Natural Earth](https://www.naturalearthdata.com/) `ne_110m_admin_0_countries`, which is public domain — but note it drops most microstates, so map coverage would fall from 195 to roughly 165.

The plugin archive itself (~170 MB of PHP, jQuery bundles and per-country maps) was deleted after extraction; it is re-downloadable and `.gitignore` prevents it being committed.

## Known issue: file size

`world.svg` is 382 KB gzipped, which is heavy against the Lighthouse 90+ target. Almost all of it is path coordinate data at three decimal places on a 1010 × 666 viewBox — far more precision than a screen can show. Whitespace minification gains nothing (measured: 0 KB).

The fix is coordinate precision reduction, which must be done with a real optimiser rather than a regex: the paths use *relative* commands, so naive rounding accumulates drift and warps outlines. `svgo` with `convertPathData` and `floatPrecision: 1` handles the error accumulation correctly and should cut this substantially.

Until then, load it only on the map quiz page and let it cache — do not put it on the homepage.
