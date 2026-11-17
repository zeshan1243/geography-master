# AdSense Readiness Audit — GeoAtlas (www.geoatlas.online)

**Audit date:** 17 November 2026
**Scope:** live site (all 306 sitemap URLs crawled), local build output (`public/`, 374 HTML pages), build sources (`tools/`, `data/`, `js/`, `css/`).
**Status of fixes:** implemented in the working tree and verified with `npm run build` + `npm run check` (44,351 / 44,351 checks pass). **Not yet committed or deployed** — the live site still serves the pre-audit version until it is.

> Approval is decided by Google. Nothing in this report guarantees approval; it removes the problems that could be verified and lists what still depends on manual action or on Google's judgement.

---

## 1. Executive summary

The single most likely cause of the rejection was technical, not editorial: since commit `979f0e8` (18 Oct 2026) the build has emitted **Adsterra** ad code on every page and **suppressed the AdSense script entirely**, so AdSense's review crawler found no AdSense code and a different ad network instead. The privacy policy also named only Adsterra and contained none of Google's required advertising disclosures.

Both are fixed. The rest of the site is technically sound (no broken links, correct canonicals, valid `ads.txt`, structured data, one H1 per page). The 195 country pages, previously the main content risk, now each carry a written, fact-checked paragraph.

| Severity | Found | Fixed in code | Manual / deferred |
|---|---|---|---|
| Critical | 1 | 1 | — |
| High | 2 | 1 | 1 (consent message) |
| Medium | 6 | 6 | — |
| Low | 5 | 4 | 1 (og:image) |

---

## 2. Issues discovered, with evidence and status

### Critical

**C1 — AdSense code missing site-wide; Adsterra active on every page** — ✅ Fixed
- **Evidence:** live HTML of `https://www.geoatlas.online/` loads `https://bauval.org/22/<key>` four times and no `pagead2.googlesyndication.com/.../adsbygoogle.js`. Cause: `tools/lib/layout.js` `adsenseHead()` returned `''` whenever `site.config.json` contained an `adsterra` block.
- **Pages affected:** all 306 indexable pages.
- **Why it matters:** AdSense's site review looks for the publisher's AdSense code to verify the site; a second ad network's banners were the only ads present.
- **Change:** removed the `adsterra` block from `site.config.json`, removed the Adsterra rendering code from `tools/lib/layout.js` and its styles from `css/main.css`. Every page now carries `<meta name="google-adsense-account" content="ca-pub-3366385543056829">` and the AdSense loader. Existing AdSense units (`data-ad-slot-id` 8268112020 / 7250058413, activated by `js/ads.js`) render again.

### High

**H1 — Privacy policy disclosed Adsterra only; legal pages contradicted each other** — ✅ Fixed
- **Evidence:** live `/privacy-policy` §4: "Advertising is currently served through a third-party ad network (Adsterra)". Live `/contact`: "Advertising on the site is handled through Google AdSense." §5 described an unnamed "privacy-respecting analytics service" while Google Analytics (`G-50LK0WQGKD`) loads on every page.
- **Change (`tools/lib/pages.js`, `privacyPage()`):** advertising section now names Google AdSense and includes the third-party-vendor cookie disclosures, links to Google Ads Settings, aboutads.info, youronlinechoices.eu and Google's partner-sites page; new Consent section; Analytics section names Google Analytics with the opt-out add-on link; sections renumbered; "Last updated" set to 17 November 2026. The wording says the site *uses* AdSense — it does not claim ads are currently being served.

**H2 — No consent management platform for EEA / UK / Switzerland** — ⚠️ Manual
- **Evidence:** no CMP or Consent Mode code in `tools/lib/layout.js` or `js/`; gtag.js and adsbygoogle.js load unconditionally.
- **Why it matters:** Google requires a Google-certified CMP to serve ads to EEA/UK/CH users. The updated privacy policy (§5) describes this consent message, so it must exist before the new build goes live.
- **Action:** AdSense → Privacy & messaging → European regulations → create and publish a message for geoatlas.online. The existing AdSense script serves it; no code change needed. Optionally also enable Consent Mode for Google Analytics in the same screen.

### Medium

**M1 — 143 meta descriptions cut off mid-word** — ✅ Fixed
- **Evidence:** e.g. `/compare/japan-vs-china` ended "…classical culture we"; 113 country pages, 23 compare pages, 7 continent pages. Cause: fixed-length `.slice()` at `tools/lib/pages.js` (country, compare and continent page builders).
- **Change:** new `metaClip()` in `tools/lib/util.js` ends at the last complete sentence or word boundary (with "…"). All indexable descriptions now 70–165 characters and end cleanly; verified across the whole build.

**M2 — Country pages are largely template text** — ✅ Fixed
- **Evidence:** 195 pages, median ~300 words in `<main>`. Structure: generated intro sentences from `data/countries.json` fields, a data table, and three hand-written facts per country (`data/details/*.json`), plus related links.
- **Why it matters:** at this scale, templated pages are the most plausible trigger for a "low value content" judgement.
- **Change:** a written "About {country}" paragraph (140–170 words) for all 195 countries, stored as `about` in `data/details/*.json` and rendered by `countryPage()`. Each covers physical geography, how the state formed, and what shapes it today, without repeating the page's table or existing facts. Every paragraph was reviewed for accuracy; contested topics (disputed territories, ongoing conflicts) are stated neutrally and nothing after 2024 or naming current leaders is included. A new check in `tools/check.js` requires a paragraph of at least 100 words for every country.
- **Result:** country pages now 435–505 words (median 466, up from ~300); share of text unique to each page up from ~77% to ~85%.
- **Related data fix:** Bulgaria adopted the euro on 1 January 2026, but `data/countries.json` still listed the Bulgarian lev (also used by the currency quiz). Corrected, along with the euro-member count in `data/continents.json` (20 → 21).

**M3 — Compare pages short** — ✅ Improved
- **Evidence:** 23 pages at 188–272 words, though 94% unique text.
- **Change:** a third paragraph per pair in `data/comparisons.json` covering how to tell the two countries apart (flags, capitals, common quiz traps, distinguishing facts), checked against each page's existing text to avoid repeating it. Now 249–~330 words.

**M4 — Ad on a page with almost no publisher content; near-empty tools index** — ✅ Fixed
- **Evidence:** `/achievements` (142 words, a personal-progress screen) carried an in-content ad unit. `/tools/` (in sitemap) had 35 words.
- **Change:** removed the ad slot from `achievementsPage()`; added two written sections to `toolsIndex()` (why true-scale comparison matters, related reference pages). `/tools/` now ~215 words.

**M5 — Continent pages thin; Antarctica title inaccurate** — ✅ Fixed
- **Evidence:** `/continents/antarctica/` titled "Antarctica — Capitals, Map Facts" (Antarctica has no capitals), 136 words; South America and Oceania ~200 words.
- **Change:** new `about` field (two written paragraphs each) in `data/continents.json`, rendered as an "About {continent}" section; Antarctica title now "Antarctica — Ice, Climate and the Antarctic Treaty". Continent pages now 294–~500 words.

**M6 — Thinnest game write-ups; one factual error** — ✅ Fixed
- **Evidence:** hand-written guide text of 84–106 words on Landmark Quiz, Landmarks by Country, Higher or Lower (Area), Find the Flag, Mixed Quiz (site median 120). Higher or Lower (Population) stated Bangladesh is "smaller than most US states" — at ~148,000 km² it is larger than about 29 of them.
- **Change (`data/games.json`):** one practical paragraph (strategy, benchmarks, learning tips) added to nine games: landmarks, countryToLandmark, higherLowerArea, higherLowerPopulation, nameToFlag, mixed, dailyGlobe, topLanguages, landlockedCountries. Bangladesh corrected to "about the size of the US state of Iowa".

### Low

**L1 — Guides and blog posts under the site's own 800-word threshold** — ✅ Fixed
- 11 articles (445–722 words) failed `tools/check.js`; one had too few sections; four meta descriptions exceeded 165 characters. New sourced sections added in `tools/lib/articles.js` and `tools/lib/blog.js` (e.g. currency pegs, physiological density, bilingualism in Canada/Belgium/Ireland, exclaves, ocean depth, Oceania vs Australia, other driving-side switches, ocean currents, capitals on borders, split capitals, census timing).

**L2 — Two titles over 65 characters** — ✅ Fixed
- `/game/rail-travel-per-capita` (metaTitle shortened in `data/games.json`) and `/countries/saint-vincent-and-the-grenadines` (country names over 20 characters now use "— Capital, Flag and Facts").

**L3 — Terms page meta description too short** — ✅ Fixed (`termsPage()`).

**L4 — Quiz validation flagged Click the Continent (120 failures)** — ✅ Fixed (check, not game)
- The game intentionally offers all seven continents (`js/quiz.js`, `continentFactQuestion`); `tools/check.js` now expects 7 options for that game instead of 4.

**L5 — No `og:image` on any page** — ⏸ Open
- Every page sets `twitter:card=summary_large_image` but no image. Does not affect AdSense; affects link previews when shared. Add a default 1200×630 share image in `tools/lib/layout.js`.

---

## 3. Pages affected (summary)

| Area | Pages | Change |
|---|---|---|
| All pages | 374 built / 306 indexable | AdSense meta + loader; Adsterra removed |
| `/privacy-policy`, `/terms` | 2 | Disclosures rewritten; meta description |
| `/countries/*` | 195 | Written "About" paragraph; clean meta descriptions; long-name titles; Bulgaria currency |
| `/compare/*` | 23 | New paragraph each; clean descriptions |
| `/continents/*` | 7 | "About" section; clean descriptions; Antarctica title |
| `/game/*` | 9 write-ups, 1 title | Expanded guidance; factual fix |
| `/guides/*`, `/blog/*` | 11 + 3 | Expanded; 4 descriptions shortened |
| `/achievements`, `/tools/` | 2 | Ad removed; content added |

---

## 4. Technical SEO findings (verified)

| Check | Result |
|---|---|
| HTTP status | All 306 sitemap URLs return 200 |
| Redirects | `geoatlas.online` → `https://www.geoatlas.online/` (308); no redirect chains |
| Canonicals | Present on every page; all match the final URL |
| Meta robots | No `noindex` on sitemap URLs. 69 variant pages (60 letter/length "Name the Countries" variants, 3 per-continent landlocked and 6 per-continent language quizzes) are `noindex, follow` and excluded from the sitemap |
| robots.txt | Allows all; deliberately disallows the 60 "Name the Countries" letter/length variants (rationale in `tools/build.js`). Low-impact side effect: Google cannot read the `noindex` on those blocked URLs, which is acceptable because they are excluded from the sitemap |
| Sitemap | 306 URLs, all live, none blocked |
| ads.txt | `google.com, pub-3366385543056829, DIRECT, f08c47fec0942fa0` — correct |
| Broken links | 25,861 internal links checked, 0 broken |
| Headings | Exactly one H1 per page |
| Duplicate titles/descriptions | None |
| Structured data | WebSite, Organization, BreadcrumbList, Country, Continent, Game, Article, BlogPosting, FAQPage present |
| Open Graph | og:title/description/url on all pages; og:image missing (L5) |
| Mobile | Viewport meta on every page; rails hidden on narrow screens |
| Ad density | One in-content unit per page plus two side rails on wide screens only; ads sit after the game UI, not inside it |
| Page weight | JS 190 KB total (ES modules, page-specific), CSS 76 KB |

**Not verifiable from outside the accounts:**
- **Indexing** — sitemap presence does not mean indexed. Check Search Console → Pages.
- **Core Web Vitals** — needs PageSpeed Insights or Search Console field data.
- **The exact rejection reason** — shown in AdSense → Sites.

---

## 5. Content quality findings

| Section | Pages | Unique text share* | Assessment |
|---|---|---|---|
| Guides | 15 | 96–99% | Strong, accurate, well-structured; now all ≥800 words |
| Blog | 9 | 96–99% | Strong |
| Lists | 5 | — | 1,000–1,400 words; good reference value |
| Compare | 23 | 93–94% | Unique but short — improved |
| Continents | 8 | 87–94% | Improved with written sections |
| Games | 39 indexable | 44–75% | Shared "difficulty and scoring" block is legitimate; each has its own guide text |
| Countries | 195 | ~85% (was ~77%) | Improved — written paragraph per country (M2); data table and related links remain templated by design |

*Share of 6-word sequences not shared with ≥30% of pages in the same section.

---

## 6. Changes requiring manual attention

1. **Publish the consent message** in AdSense → Privacy & messaging (H2) — before deploying.
2. **Commit and deploy** the working-tree changes; confirm the live homepage source contains `adsbygoogle.js?client=ca-pub-3366385543056829` and no `bauval.org`.
3. **Remove geoatlas.online from the Adsterra dashboard.**
4. **Search Console:** submit the sitemap and check Pages for "Crawled – currently not indexed" volume.
5. **Wait a few days** after deploying so Google recrawls, then **request review** in AdSense → Sites.

---

## 7. Remaining risks

- **Country pages** — improved substantially (M2), but still partly structured data; they are reference pages, and reviewers may weigh them below the guides.
- **Interactive pages** — game pages are primarily tools; their written guides help, but reviewers may still weigh them as lighter content.
- **Site age** — first commit 1 July 2026; a young domain with limited traffic is sometimes rejected or deferred regardless of quality.
- **Consent** — until the CMP message is published, the privacy policy's §5 describes something not yet in place.

## 8. Final AdSense readiness assessment

**Before this audit:** not reviewable — AdSense code absent, another network active, privacy policy non-compliant.
**After deployment + manual steps 1–5:** technically ready and policy-consistent, with good editorial content in the guides, blog and lists. With the per-country paragraphs in place, no specific content weakness identified in this audit remains unaddressed. Remaining uncertainty is mainly the domain's age and Google's own judgement of interactive pages.
