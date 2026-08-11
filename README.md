# 🌍 World Geography Games

A fast, responsive geography games site built with vanilla HTML, CSS and JavaScript. No frameworks, no runtime dependencies.

## Running it

The site loads its datasets with `fetch`, so opening `index.html` from the filesystem will not work — it needs to be served over HTTP.

```bash
npm start          # build, then serve on http://localhost:4321
```

Or separately:

```bash
npm run build      # regenerate all HTML from /data
npm run serve      # static server on :4321
npm run check      # data, engine and link verification
```

Node 18+ is required for the build scripts. Nothing is installed — there are no dependencies.

## How it fits together

```
data/*.json          the source of truth (countries, landmarks, oceans, continents, games)
       ↓
tools/build.js       generates every HTML page from the data
       ↓
*.html               committed static output — this is what you deploy
```

`js/` and `css/` are hand-written and shipped as-is; only the HTML is generated.

### Adding a country

Add it to `data/countries.json` and run `npm run build`. That produces its country page, adds it to the country index, every relevant list page, the continent table and `sitemap.xml`, and puts it into the quiz pools.

Fields: `name`, `code` (ISO 3166-1 alpha-2), `capital`, `continent`, `currency`, `language`, `population`, `area` (km²), `tier` (1–4, drives difficulty). Flags are derived from the country code as Unicode regional indicators, so there are no image files to manage.

### Adding a game

Add an entry to `data/games.json` and a question builder in `js/quiz.js`. The page, the card on the homepage and games directory, the related-games links and the sitemap entry all follow from the data.

## Source layout

| Path | What it is |
| --- | --- |
| `data/` | All content: 195 countries, 60 landmarks, 30 oceans and seas, 7 continents, 9 games |
| `data/details/` | Per-country borders, cities, highest point and facts — one file per continent, build-time only |
| `assets/world.svg` | World map, one path per country keyed by ISO code — see [assets/README.md](assets/README.md) |
| `js/app.js` | Single entry point loaded by every page |
| `js/game.js` | The reusable quiz engine — one engine drives all nine games |
| `js/worldmap.js` | Loads and frames `assets/world.svg` for the map and shape quizzes |
| `js/quiz.js` | Turns datasets into rounds; seeded RNG for the daily challenge |
| `js/score.js` | Scoring rules, stars, verdicts |
| `js/storage.js` | localStorage profile: best scores, stats, day streaks |
| `js/theme.js`, `js/navigation.js`, `js/data.js` | Theme toggle, mobile drawer and search, dataset loading |
| `css/` | `main.css` (design system), `games.css`, `game.css`, `responsive.css` |
| `tools/lib/articles.js` | The long-form guides — prose, build-time only |
| `tools/` | Build, dev server and verification — never shipped to the browser |
| `site.config.json` | Site name, tagline and canonical URL used by the build |

## Deployment

Everything is static. Deploy the repository root to any static host — the generated HTML, `css/`, `js/` and `data/` are all that is needed. `tools/`, `package.json` and `README.md` can be excluded.

Links are root-relative, so the site must be served from a domain root rather than a subdirectory.

Before going live, set `url` in `site.config.json` to the real domain and rebuild — it feeds the canonical tags, Open Graph URLs and `sitemap.xml`.

## Adverts

AdSense is configured in `site.config.json`:

```json
"adsense": { "client": "ca-pub-…", "slots": { "default": "…", "rail": "…" } }
```

Clear `client` and every unit reverts to a grey placeholder that reserves the same space — local development needs no ad blocker.

Placements sit at natural breaks: after the game cards on the homepage, after the results screen in games, mid-article on content pages. Never inside the question-and-answer flow. `/ads.txt` is generated from the client id at build time.

**Units are injected by `js/ads.js`, not written into the HTML.** That is deliberate, and the inline `push({})` snippet AdSense gives you must not be pasted back in:

- `adsbygoogle.push({})` fills the next *unfilled* `<ins>` in document order — you cannot target one element. A unit hidden at the current breakpoint (the side rail on a phone) would silently swallow the push meant for the visible in-content unit. Hidden containers never get an `<ins>`, so they cannot steal an ad.
- An `<ins>` inside a `display:none` container measures zero width and usually never fills even after being shown. The game pages' unit lives on the results screen, which starts hidden.
- Units are requested as they approach the viewport, via `IntersectionObserver`.

`npm run check` fails the build if a static `<ins class="adsbygoogle">` appears in generated HTML, if a slot id is not 10 digits, if `ads.txt` does not authorise the configured publisher, or if a configured slot is never placed on any page.

The `rail` unit only renders at ≥1240px, in a 300px sticky column on country, continent and list pages. A responsive unit takes its shape from its container width, not from what it was named in AdSense — a tall ad needs a narrow column, which is the only reason the rail exists.

## Verification

`npm run check` runs about 9,700 assertions:

- **Data** — 195 countries, unique names/codes/slugs, valid continents and tiers, landmarks referencing real countries, continent counts matching the country list.
- **Engine** — every game type at every difficulty, asserting four unique options, the answer present among them, no repeated questions in a round, and that the daily challenge is reproducible from its date seed but differs between days.
- **Guides** — each is at least 800 words, has real section structure, unique metadata, and no stray `<h1>` in its body.
- **Country detail** — all 195 have three or more facts, cities, a region and a highest point; no fact is reused on two pages; and every land border is mutual (a one-sided border is always a mistake in one of the two entries).
- **Map coverage** — every country has a path in `world.svg`, anything marked playable clears the size and area thresholds, and each difficulty has enough countries to fill a round.
- **Pages** — every generated page has exactly one `<h1>`, a title, a meta description and a canonical link; all ~13,000 internal links resolve to files that exist.

## Not built yet

- Timed and lives modes, achievements, leaderboards
- PWA offline support and multiple languages
