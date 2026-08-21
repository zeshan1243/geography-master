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
css/  js/  assets/   hand-written, shipped as-is
       ↓
tools/build.js       generates the HTML and assembles everything into public/
       ↓
public/              the deployable site — not committed, rebuilt on every deploy
```

Nothing outside `public/` is ever served, which keeps `tools/`, `package.json` and the build-time-only `data/details/` off the public web.

### Adding a country

Add it to `data/countries.json` and run `npm run build`. That produces its country page, adds it to the country index, every relevant list page, the continent table and `sitemap.xml`, and puts it into the quiz pools.

Fields: `name`, `code` (ISO 3166-1 alpha-2), `capital`, `continent`, `currency`, `language`, `population`, `area` (km²), `tier` (1–4, drives difficulty). Flags are derived from the country code as Unicode regional indicators, so there are no image files to manage.

### Adding a game

Add an entry to `data/games.json` and a question builder in `js/quiz.js`. The page, the card on the homepage and games directory, the related-games links and the sitemap entry all follow from the data — and `npm run check` derives its game-type list from the same catalogue, so a new game is automatically exercised at every difficulty rather than silently untested.

Games whose wrong answers must satisfy a constraint need their own check. The border quiz is the example: a distractor that happens to be a real neighbour would give a question two correct answers, so the suite verifies every option against `data/borders.json` rather than trusting the builder.

## Source layout

| Path | What it is |
| --- | --- |
| `data/` | All content: 195 countries, 60 landmarks, 30 oceans and seas, 7 continents, 27 game entries |
| `data/details/` | Per-country borders, cities, highest point and facts — one file per continent, build-time only |
| `assets/world.svg` | World map, one path per country keyed by ISO code — see [assets/README.md](assets/README.md) |
| `js/app.js` | Single entry point loaded by every page |
| `js/game.js` | The reusable quiz engine — drives the multiple-choice games |
| `js/worldmap.js` | Loads and frames `assets/world.svg` for the map and shape quizzes |
| `js/quiz.js` | Turns datasets into rounds; seeded RNG for the daily challenge |
| `js/score.js` | Scoring rules, stars, verdicts |
| `js/storage.js` | localStorage profile: best scores, stats, day streaks |
| `js/theme.js`, `js/navigation.js`, `js/data.js` | Theme toggle, mobile drawer and search, dataset loading |
| `css/` | `main.css` (design system), `games.css`, `game.css`, `responsive.css` |
| `tools/lib/articles.js` | The long-form guides (how to learn) — prose, build-time only |
| `tools/lib/blog.js` | The blog posts (the subject itself) — prose, build-time only |
| `tools/` | Build, dev server and verification — never shipped to the browser |
| `site.config.json` | Site name, tagline and canonical URL used by the build |

## Deployment

Everything is static. Run `npm run build` and deploy `public/`.

On Vercel this is already configured in `vercel.json` (`buildCommand: npm run build`, `outputDirectory: public`) — no dashboard settings needed. Any other host works the same way: run the build, serve `public/` as the document root.

`public/` is gitignored on purpose. It is pure derived output, the host rebuilds it on every deploy, and committing it only creates drift between the data and the pages.

Links are root-relative, so the site must be served from a domain root rather than a subdirectory.

`vercel.json` sets `cleanUrls: true`, and the build emits extensionless internal links, canonicals and sitemap entries to match. The three must stay in agreement: if clean URLs are turned off, the generated links have to go back to `.html`, or every canonical will point at a URL that redirects.

Before going live, set `url` in `site.config.json` to the real domain and rebuild — it feeds the canonical tags, Open Graph URLs, `og:url` and `sitemap.xml`.

**It must be the exact host that serves the site, including `www` or its absence.** `zehum.com` 307-redirects to `www.zehum.com` on this deployment, so a config of `https://zehum.com` made every canonical tag and every sitemap entry point at a URL that redirects — a site-wide defect that is invisible locally, because the dev server has no redirect. Check it against production after any DNS or domain change:

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://your-domain/
curl -s https://your-host/countries/japan | grep -o 'rel="canonical" href="[^"]*"'
```

The canonical must return 200, not 3xx.

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

`npm run check` runs about 28,500 assertions:

- **Data** — 195 countries, unique names/codes/slugs, valid continents and tiers, landmarks referencing real countries, continent counts matching the country list.
- **Engine** — every game type at every difficulty, asserting four unique options, the answer present among them, no repeated questions in a round, and that the daily challenge is reproducible from its date seed but differs between days.
- **Long-form content** — guides and blog posts: each is at least 800 words, has real section structure, unique metadata, and no stray `<h1>` in its body.
- **Country detail** — all 195 have three or more facts, cities, a region and a highest point; no fact is reused on two pages; and every land border is mutual (a one-sided border is always a mistake in one of the two entries).
- **Map coverage** — every country has a path in `world.svg`, anything marked playable clears the size and area thresholds, and each difficulty has enough countries to fill a round.
- **Module imports** — a function called in `js/` but never imported. ES modules make this silent: the name resolves to a missing global and only throws when that path first runs. One such bug shipped before this check existed. The scanner blanks comments and string bodies first, keeping `${…}` interpolations, so it does not cry wolf.
- **Pages** — every generated page has exactly one `<h1>`, a title, a meta description and a canonical link; all ~13,000 internal links resolve to files that exist.

## Rounds and difficulty

Easy, Medium and Hard run **30 questions** (`DEFAULT_QUESTIONS` in `js/quiz.js`, overridable per page via `data-questions`).

**Expert is a survival mode**, flagged by `survival: true` on the difficulty. It has no fixed length: the round is built from as much of the hardest pool as exists (`SURVIVAL_MAX`) and the first wrong answer ends it. Consequences worth knowing before changing it:

- The progress bar and per-question dots are hidden — there is no known total to fill. Dots are also hidden above `DOTS_LIMIT` (12) in normal rounds, since 30 of them do not fit a phone.
- Results are scored on **run length**, not accuracy. Accuracy is meaningless in sudden death — a run always ends on the single wrong answer, so it is near-100% whether you lasted three questions or thirty. `survivalStars()` and `survivalVerdict()` handle this.
- The longest run per game is stored separately in `bestRuns`, because points reward speed as well as length.
- The daily challenge is never survival, even though it uses the mixed quiz: a seeded round everyone shares should not end on question one.

Two datasets are smaller than a full round and cap rather than repeat: the **landmark quiz** (60 landmarks — 21 on Easy, 15 on Expert) and the **oceans quiz** (30 bodies of water — 8 on Easy). Those rounds are as long as the pool allows. Adding entries to `data/landmarks.json` or `data/oceans.json` lengthens them automatically.

## Review your mistakes

`/practice.html` replays the questions you previously got wrong. It is the one feature that turns the site from a quiz into study, so a few decisions are load-bearing:

- **Every question carries a stable `subject`** — a country code, a landmark name, a sea. Question ids contain a round index and are not stable, so the subject is what a miss is remembered by. `roundContext()` in `js/quiz.js` supplies it, which is also why random rounds and review rounds share one code path: a rebuilt question is identical to a freshly generated one.
- **Reviews are rebuilt, not stored.** A flag missed on Expert can reappear with different wrong answers beside it. The point is to re-test the fact, not reproduce the round.
- **Retiring takes two correct answers** (`RETIRE_AT`). Getting something right immediately after being shown the answer proves very little. Missing it again resets progress to zero.
- **A correct answer on a never-missed item is ignored**, so ordinary rounds cost nothing.
- The list is capped at `MAX_MISSES` (400), dropping least-recently-seen entries, and lives in the same localStorage profile as scores and streaks.

## Indexability: variants are noindexed on purpose

Three games expand into filter variants — `name-the-countries` by starting letter, ending letter and name length (60 pages), plus per-continent versions of the landlocked and top-languages games (9 pages). They are fine pages to *play* and are linked from their hubs, but they are near-identical to each other: differing by one letter in the title, description and H1.

Submitting 69 pages like that for indexing is what thin-content review penalises, and it is what an AdSense review flagged. So they carry `<meta name="robots" content="noindex, follow">` and are left out of `sitemap.xml`, while the hubs and the "all" rounds stay indexable. `page({ noindex: true })` is how a page opts in.

`npm run check` asserts the two signals agree: no noindexed page may appear in the sitemap, and a list of content-bearing pages must stay indexable. Adding a new filter family without noindexing it will not fail the build — that is a judgement call, so if you add one, noindex it deliberately.

## Icons

`js/icons.js` is the single icon set, imported by `tools/lib/layout.js` at build time and by `js/game.js` at runtime — one definition rather than two copies that drift. Icons use `currentColor`, so they match whatever text they sit beside in either theme.

Emoji are not used for interface controls: they cannot take a colour, draw differently on every platform, and sit on the text baseline rather than centring against a label. Emoji that remain are **content**, not chrome — country flags in quiz questions, and the per-game identity icons in `data/games.json` that also appear on the game cards.

Two traps when touching an icon that has states:

- Never write `textContent` on a button that holds an inline SVG — it deletes the icon. The theme toggle, menu toggle and daily "Play Again" button all ship both states in the markup and swap them in CSS off an attribute (`data-theme`, `aria-expanded`, `data-done`), so scripts only update the label and the accessible name.
- A CSS-driven swap also paints the right icon on the first frame, before any script runs.

## Play screen layout

Above 960px the play screen becomes a two-column grid (`[data-layout="split"]`): visual on the left, prompt and answers on the right. Stacked, a 30-question round pushed the options below the fold and the score out of view while scrolling. Side by side, the screen needs the height of the taller column instead of the sum of both. It uses `grid-template-areas` on the existing children, so no wrapper markup was needed.

The map quiz opts out (`[data-layout="wide"]`) because it answers on the map itself and has no option buttons to put in a second column — `js/game.js` sets the attribute per question. That layout also moves the prompt **above** the map: the map is the tall element, so an instruction underneath is the first thing to scroll away.

`.world-map` is capped at `min(47vh, 440px)`. Unbounded, a full-width map is ~650px tall and pushes the prompt and feedback off screen. Clamping is safe because the viewBox is built from the element's *measured* aspect, so a shorter box just yields a wider, shorter window — never a letterbox or a distortion. Measured to fit at 1280×800, 1440×900, 1024×768 and 1366×768.

The scoreboard is `position: sticky` under the header so the score and streak stay visible while reading the answers.

**The answer feedback reserves its space rather than appearing.** `.feedback` is a fixed 88px strip that is always in the flow; answering fades its contents in and sets `data-kind`. It used to be `hidden` and revealed on answer, which grew the column — and because the split layout's visual was `align-self: stretch`, the visual opposite resized to match, so the whole screen lurched on every answer. Two rules keep it still:

- the strip has a fixed height and its explanation is clamped to two lines, so a long fact cannot change it;
- the visual is `align-self: start` with a `min-height`, never stretched to match the answers column.

Verified by measuring the visual's height and position, the answers' position and total document height immediately before and after answering: identical on the split, wide and mobile layouts. If you change either rule, re-run that comparison — the jump is easy to reintroduce and easy to miss.

## Mobile

Mobile-first, verified at 390px and 360px across every page type: no horizontal overflow, nothing escaping the viewport, and every non-inline tap target at least 44px tall.

Three things are worth knowing before changing the mobile CSS:

- **The map quiz is square on phones** (`aspect-ratio: 1/1`) rather than 3:2. `zoomWindow()` in `js/worldmap.js` reads the container's measured aspect and builds a matching viewBox, so a taller box means bigger countries to tap rather than letterboxing. Changing the aspect in CSS alone is safe; hard-coding the viewBox aspect is not.
- **Wide tables wrap rather than scroll.** `white-space: normal` plus hiding the `.col-optional` continent column lets the capitals and flags tables fit a 390px screen outright. The numeric tables still scroll, and `.table-wrap` carries CSS-only scroll shadows that appear only while there is more to reach.
- **`--scroll-shadow` is a theme token.** A hard-coded dark shadow is invisible against the dark theme, which is exactly the bug it exists to prevent.

## Not built yet

- Timed and lives modes, achievements, leaderboards
- PWA offline support and multiple languages
