/**
 * pages.js — every page template on the site.
 *
 * Each function returns a complete HTML document by wrapping its body in the
 * shared layout. Data-driven pages (countries, continents, games, lists) are
 * generated from the JSON in /data, so adding a country to the dataset adds a
 * page, a table row and a sitemap entry with no further work.
 */

import { page, adSlot, breadcrumbs, breadcrumbSchema, esc, icon, SITE } from './layout.js';
import { ARTICLES } from './articles.js';
import { fmt, approx, ordinal } from './util.js';

const GAME_SCREEN_HEIGHT_NOTE =
  'Thirty questions a round, or survive as long as you can on Expert.';

/**
 * Most games are one flat page (`/game/flag-quiz`). "Name the Countries"
 * expands into a directory (`/game/name-the-countries/` plus its letter
 * variants), so linking to it needs the trailing slash to land on its own
 * canonical URL rather than bouncing through a redirect.
 */
function gameHref(game) {
  return game.mode === 'recall' && game.variants === 'letters' ? `/game/${game.slug}/` : `/game/${game.slug}`;
}

/* ========================================================================== */
/*  Homepage                                                                  */
/* ========================================================================== */

export function home(countries, games) {
  const body = `
<section class="hero">
  <div class="wrap">
    <h1>Play. Learn. <span class="accent">Explore.</span> 🌍</h1>
    <p class="lead">${esc(SITE.tagline)} Free geography games — no account, no download, straight into a round.</p>
    <div class="btn-row">
      <a class="btn btn-primary btn-lg" href="/game/flag-quiz?difficulty=medium&amp;autostart=1" data-play-now>${icon('play')} Play Now</a>
      <a class="btn btn-secondary btn-lg" href="/games/">${icon('grid')} Explore Games</a>
      <a class="btn btn-ghost btn-lg" href="/games/" data-random-game>${icon('dice')} Random Game</a>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><strong>${countries.length}</strong><span>Countries</span></div>
      <div class="hero-stat"><strong>${countries.length}</strong><span>Flags</span></div>
      <div class="hero-stat"><strong>${games.length}</strong><span>Games</span></div>
      <div class="hero-stat"><strong>4</strong><span>Difficulties</span></div>
    </div>
  </div>
</section>

<section class="wrap" data-daily>
  <div class="daily">
    <div class="daily-body">
      <span class="daily-date" data-daily-date>Today</span>
      <h2>🔥 Today's Geography Challenge</h2>
      <p data-daily-state>Thirty questions, the same for everyone, changing at midnight.</p>
      <div class="streak" data-streak-calendar></div>
      <p class="muted" data-streak-count style="margin-top:10px;font-size:.9375rem"></p>
    </div>
    <a class="btn btn-primary btn-lg" href="/game/mixed-quiz?daily=1" data-daily-link data-done="false">
      ${icon('play', 'icon-play')}${icon('refresh', 'icon-refresh')}
      <span data-daily-label>Play Today</span>
    </a>
  </div>
</section>

<section class="section wrap">
  <div class="section-head">
    <div>
      <h2>Popular games</h2>
      <p class="muted">${GAME_SCREEN_HEIGHT_NOTE}</p>
    </div>
    <a href="/games/">All games →</a>
  </div>
  <div class="game-grid" data-game-cards="popular"></div>
</section>

<div class="wrap">${adSlot()}</div>

<section class="section wrap">
  <div class="section-head">
    <div>
      <h2>Your progress</h2>
      <p class="muted">Saved on this device only — no sign-up, nothing sent anywhere.</p>
    </div>
  </div>
  <div class="stat-grid" data-stats></div>
  <p class="muted" data-stats-empty hidden style="margin-top:12px">Finish a game and your score, accuracy and streak will show up here.</p>

  <a class="review-callout" href="/practice" data-review-callout hidden>
    <span class="review-callout-icon" aria-hidden="true">🎯</span>
    <span>
      <strong data-review-callout-count>Review your mistakes</strong>
      <small>Replay the questions you got wrong, until they stick.</small>
    </span>
    <span class="review-callout-go" aria-hidden="true">→</span>
  </a>
</section>

<section class="section wrap">
  <div class="section-head">
    <div>
      <h2>Explore the world</h2>
      <p class="muted">Country profiles and reference lists, each with a matching game at the end.</p>
    </div>
  </div>
  <div class="explore-grid">
    <a class="explore-link" href="/countries/"><span class="icon" aria-hidden="true">🗺️</span><span>All ${countries.length} countries<small>Capital, currency, population</small></span></a>
    <a class="explore-link" href="/continents/"><span class="icon" aria-hidden="true">🌍</span><span>Continents<small>Africa to Oceania</small></span></a>
    <a class="explore-link" href="/lists/countries-and-capitals"><span class="icon" aria-hidden="true">🏛️</span><span>Countries and capitals<small>The full reference list</small></span></a>
    <a class="explore-link" href="/lists/world-flags"><span class="icon" aria-hidden="true">🚩</span><span>World flags<small>Every flag by continent</small></span></a>
    <a class="explore-link" href="/lists/largest-countries"><span class="icon" aria-hidden="true">📐</span><span>Largest countries<span></span><small>Ranked by area</small></span></a>
    <a class="explore-link" href="/lists/smallest-countries"><span class="icon" aria-hidden="true">🔬</span><span>Smallest countries<small>From Vatican City up</small></span></a>
  </div>
</section>

<section class="section wrap">
  <div class="section-head">
    <div>
      <h2>Guides</h2>
      <p class="muted">Longer reads on how to learn this material, and the parts of world geography most people have backwards.</p>
    </div>
    <a href="/guides/">All guides →</a>
  </div>
  <div class="card-grid">
    ${ARTICLES.slice(0, 3)
      .map(
        (a) => `<a class="game-card" href="/guides/${a.slug}" data-accent="purple">
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.summary)}</p>
      <span class="play">Read</span>
    </a>`
      )
      .join('\n    ')}
  </div>
</section>

<section class="section wrap">
  <div class="article">
    <h2>How well do you know the world?</h2>
    <p>There are ${countries.length} sovereign countries on this site — 193 United Nations member states plus Vatican City and Palestine. Between them they cover six inhabited continents, ${countries.length} capital cities and every flag flown at the UN.</p>
    <p>Most people can name perhaps thirty or forty countries from memory. Getting from there to all ${countries.length} is a matter of repetition, and repetition is easier when it looks like a game. Each round here is thirty questions and shows you the right answer the moment you get one wrong — that immediate correction is what makes the facts stick.</p>
    <p>Start with the <a href="/game/flag-quiz">flag quiz</a> on easy, move to <a href="/game/capital-quiz">capitals</a> when flags feel comfortable, and use the <a href="/game/mixed-quiz">mixed quiz</a> to check what has actually stuck.</p>
  </div>
</section>`;

  return page({
    title: `${SITE.name} — Country, Capital & Flag Quizzes`,
    description:
      'Play free geography games and quizzes about countries, capitals, flags, continents, landmarks and oceans. No account needed.',
    path: '/',
    css: ['/css/games.css'],
    body,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.url,
        description: SITE.tagline
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.url
      }
    ]
  });
}

/* ========================================================================== */
/*  Games directory                                                           */
/* ========================================================================== */

export function gamesIndex(games) {
  const categories = [...new Set(games.map((g) => g.category))];

  const sections = categories
    .map((category) => {
      const inCategory = games.filter((g) => g.category === category);
      return `<section class="game-category">
    <h2>${esc(category)}</h2>
    <p>${inCategory.length} ${inCategory.length === 1 ? 'game' : 'games'}</p>
    <div class="game-grid">
      ${inCategory
        .map(
          (g) => `<a class="game-card" href="${gameHref(g)}" data-accent="${g.accent}">
        <span class="icon" aria-hidden="true">${g.icon}</span>
        <h3>${esc(g.name)}</h3>
        <p>${esc(g.tagline)}</p>
        <span class="play">Play</span>
      </a>`
        )
        .join('\n      ')}
    </div>
  </section>`;
    })
    .join('\n\n  ');

  const body = `${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Games' }])}
<section class="section wrap">
  <h1>Geography games</h1>

  <a class="review-callout" href="/practice" data-review-callout hidden style="margin:20px 0 0">
    <span class="review-callout-icon" aria-hidden="true">🎯</span>
    <span>
      <strong data-review-callout-count>Review your mistakes</strong>
      <small>Replay the questions you got wrong, until they stick.</small>
    </span>
    <span class="review-callout-go" aria-hidden="true">→</span>
  </a>

  <p class="lead">${games.length} ways to test your geography knowledge. Most games have four difficulty levels — Easy, Medium and Hard run thirty questions, Expert is sudden death — and one is a straight fifteen-minute race against the clock.</p>

  ${sections}

  ${adSlot()}

  <div class="article">
    <h2>Which game should you start with?</h2>
    <p>If you are new to geography quizzes, start with the <a href="/game/continent-quiz">continent quiz</a>. Six answers, no memorisation required, and it builds the mental map everything else hangs off.</p>
    <p>Once continents feel automatic, <a href="/game/flag-quiz">flags</a> are the most efficient next step: they are visual, so they stick faster than names, and they pull double duty when you later learn the countries themselves.</p>
    <p><a href="/game/capital-quiz">Capitals</a> are the hardest of the three because there is no visual hook, so leave them until continents and flags are solid. The <a href="/game/mixed-quiz">mixed quiz</a> is the honest test — it draws from every category at once and will find the gaps.</p>
  </div>
</section>`;

  return page({
    title: 'Geography Games — Country, Capital, Flag & Map Quizzes',
    description:
      'Browse every geography game: country quiz, capital quiz, flag quiz, continent quiz, landmark quiz, oceans quiz and a mixed geography quiz.',
    path: '/games/',
    css: ['/css/games.css'],
    body,
    schema: breadcrumbSchema([{ label: 'Home', href: '/' }, { label: 'Games', href: '/games/' }])
  });
}

/* ========================================================================== */
/*  Game page (the quiz screen itself)                                        */
/* ========================================================================== */


/**
 * The play and results screens. Identical for every game and for the practice
 * round, so they live in one place — only the setup screen differs.
 */
function playAndResultsScreens({ icon: gameIcon, name, showRelated = true }) {
  return `    <section class="game-screen" data-screen="play" hidden aria-live="polite">
      <div class="game-top">
        <span class="game-title"><span aria-hidden="true">${gameIcon}</span> ${esc(name)}</span>
        <span class="game-counter" data-counter>Question 1/30</span>
      </div>

      <div class="scoreboard">
        <div>
          <div class="value" data-score>0</div>
          <div class="label">Score</div>
        </div>
        <div>
          <div class="value streak-value" data-streak>0</div>
          <div class="label">Streak</div>
        </div>
      </div>

      <div class="progress-track" role="progressbar" aria-label="Round progress">
        <div class="progress-fill" data-progress></div>
      </div>

      <div class="question-visual" data-visual></div>
      <h2 class="question-text" data-prompt></h2>
      <div class="answers" data-answers role="group" aria-label="Answer choices"></div>
      <div class="feedback" data-feedback hidden></div>
      <div class="progress-dots" data-dots aria-hidden="true"></div>
    </section>

    <section class="game-screen results" data-screen="results" hidden>
      <h2 class="results-title"><span data-result-icon>${icon('flag')}</span> <span data-result-title>Game complete!</span></h2>
      <div class="results-score" data-result-score>0</div>
      <div class="results-score-label">Score</div>
      <div class="results-stars" data-result-stars aria-hidden="true"></div>
      <p class="results-summary" data-result-summary></p>
      <p class="results-summary muted" data-result-verdict></p>
      <p class="results-best" data-result-best></p>
      <p class="results-new-best" data-result-new-best hidden>${icon('trophy')} New personal best!</p>

      <div class="btn-row">
        <button class="btn btn-primary btn-lg" type="button" data-play-again>${icon('refresh')} Play Again</button>
        <a class="btn btn-secondary btn-lg" href="/games/" data-another-game>${icon('dice')} Try Another Game</a>
        <a class="btn btn-ghost" href="/practice" data-review-link hidden>${icon('target')} Review your mistakes</a>
        <a class="btn btn-ghost" href="/games/">Back to Games</a>
      </div>

      <div class="review">
        <h2>Your answers</h2>
        <ul data-result-review></ul>
      </div>

      ${adSlot()}
      ${
        showRelated
          ? `<div class="related">
        <h2>You might also like</h2>
        <div class="related-links" data-related></div>
      </div>`
          : ''
      }
    </section>
`;
}

export function gamePage(game, allGames) {
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Games', href: '/games/' },
    { label: game.name, href: `/game/${game.slug}` }
  ];

  const body = `${breadcrumbs(trail)}
<div class="wrap">
  <div class="game-shell" data-game data-game-id="${game.id}" data-questions="30">

    <div class="game-status" data-status hidden></div>

    <section class="game-screen setup" data-screen="setup">
      <div class="game-icon" aria-hidden="true">${game.icon}</div>
      <h1>${esc(game.name)}</h1>
      <p>${esc(game.description)}</p>

      <h2 class="sr-only">Choose a difficulty</h2>
      <div class="difficulty-list" data-difficulty-list role="group" aria-label="Difficulty"></div>

      <button class="btn btn-primary btn-lg btn-block" type="button" data-start>${icon('play')} Start Game</button>
      <p class="setup-best" data-best></p>
    </section>

${playAndResultsScreens({ icon: game.icon, name: game.name })}
    </section>

  </div>
</div>

<section class="section wrap">
  <div class="article">
    <h2>About the ${esc(game.name.toLowerCase())}</h2>
    ${(game.guide || []).map((para) => `<p>${esc(para)}</p>`).join('\n    ')}

    <h3>Difficulty and scoring</h3>
    <p>Easy, Medium and Hard run thirty questions. Easy covers the countries most people can already name; Hard reaches the ones that need real study. A correct answer is worth 100 points, with a bonus for answering inside five seconds and further bonuses at three, five and ten in a row. A wrong answer scores nothing and resets the streak, but never ends the round.</p>
    <p><strong>Expert is different.</strong> It has no fixed length and no second chances: questions keep coming from the hardest pool until you get one wrong, and that ends the run immediately. Your result is how many you survived. The <a href="/about">full scoring breakdown</a> is on the about page.</p>

    <h3>Other games</h3>
    <p>${allGames
      .filter((g) => g.id !== game.id)
      .slice(0, 4)
      .map((g) => `<a href="${gameHref(g)}">${esc(g.name)}</a>`)
      .join(' · ')}</p>
  </div>
</section>`;

  return page({
    title: `${game.metaTitle} | ${SITE.name}`,
    description: game.metaDescription,
    path: `/game/${game.slug}`,
    css: ['/css/games.css', '/css/game.css'],
    body,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: game.name,
        description: game.metaDescription,
        url: new URL(`/game/${game.slug}`, SITE.url).href,
        genre: 'Educational',
        gamePlatform: 'Web browser',
        numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
        isAccessibleForFree: true
      },
      breadcrumbSchema(trail)
    ]
  });
}

/** Seconds -> "5:00", for the setup screen's static "before JS runs" label. */
function formatSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * "Name the Countries" is a free-recall game — a text input and a clock,
 * not a question-and-four-answers round — so it gets its own body rather
 * than reusing the difficulty picker and multiple-choice markup above. The
 * results screen still reuses the same `.results-*` classes as every other
 * game so it looks like part of the same site.
 *
 * The same body also powers the per-letter variants ("Countries That Start
 * With S"): `variant` carries whatever differs — the letter, how many
 * countries that leaves, the time limit, and the page's own title/copy.
 * `variant.letter` is null for the "play all 195" version.
 */
export function recallGamePage(game, allGames, variant) {
  const {
    letter,
    letterPosition = 'start',
    nameLength,
    count,
    seconds,
    path,
    title,
    metaTitle,
    metaDescription,
    breadcrumbLabel,
    intro
  } = variant;
  const clockLabel = formatSeconds(seconds);
  const minutes = seconds / 60;
  const minutesLabel = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const setupIcon = letter ? esc(letter) : nameLength ? esc(String(nameLength)) : game.icon;
  const titleIcon = letter ? '🔤' : nameLength ? '🔢' : game.icon;
  const dataAttrs = [
    letter ? ` data-letter="${letter}" data-letter-position="${letterPosition}"` : '',
    nameLength ? ` data-name-length="${nameLength}"` : '',
    ` data-time-limit="${seconds}"`
  ].join('');

  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Games', href: '/games/' },
    { label: game.name, href: `/game/${game.slug}/` },
    { label: breadcrumbLabel }
  ];

  const body = `${breadcrumbs(trail)}
<div class="wrap">
  <div class="game-shell" data-recall-game${dataAttrs}>

    <section class="game-screen setup" data-screen="setup">
      <div class="game-icon" aria-hidden="true">${setupIcon}</div>
      <h1>${esc(title)}</h1>
      <p>${esc(intro)}</p>
      <p class="recall-rules">Just start typing — a country is added the moment it's recognised, no need to press Enter. Common short names and spelling variants are accepted, and each one lights up on the map as you name it.</p>

      <button class="btn btn-primary btn-lg btn-block" type="button" data-start>${icon('play')} Start — ${clockLabel} on the clock</button>
      <p class="setup-best" data-best></p>
    </section>

    <section class="game-screen" data-screen="play" hidden aria-live="polite">
      <div class="game-top">
        <span class="game-title"><span aria-hidden="true">${titleIcon}</span> ${esc(title)}</span>
        <span class="recall-timer" data-timer>${clockLabel}</span>
      </div>

      <div class="recall-count" data-count>0 / ${count} found</div>

      <div class="progress-track" role="progressbar" aria-label="Countries found">
        <div class="progress-fill" data-progress></div>
      </div>

      <div class="map-frame">
        <div class="question-visual is-map" data-map></div>
        <button class="map-hint-toggle" type="button" data-map-hint aria-pressed="false">📍 Show countries</button>
      </div>
      <p class="map-hint">Click the map to zoom in, drag to pan around</p>

      <form class="recall-form" data-form>
        <label class="sr-only" for="recall-input">Type a country name</label>
        <input id="recall-input" data-input type="text" placeholder="Start typing a country…"
               autocomplete="off" autocapitalize="words" spellcheck="false">
        <button class="btn btn-primary" type="submit">${icon('check')} Add</button>
      </form>

      <p class="recall-feedback" data-feedback hidden></p>

      <div class="recall-found" data-found aria-label="Countries found so far"></div>

      <button class="btn btn-ghost btn-block" type="button" data-stop>Stop and see results</button>
    </section>

    <section class="game-screen results" data-screen="results" hidden>
      <h2 class="results-title"><span data-result-icon>${icon('flag')}</span> <span data-result-title>Time's up!</span></h2>
      <div class="results-score" data-result-score>0</div>
      <div class="results-score-label">Countries named</div>
      <div class="results-stars" data-result-stars aria-hidden="true"></div>
      <p class="results-summary" data-result-summary></p>
      <p class="results-summary muted" data-result-verdict></p>
      <p class="results-best" data-result-best></p>
      <p class="results-new-best" data-result-new-best hidden>${icon('trophy')} New personal best!</p>

      <div class="btn-row">
        <button class="btn btn-primary btn-lg" type="button" data-play-again>${icon('refresh')} Play Again</button>
        <a class="btn btn-secondary btn-lg" href="/games/" data-another-game>${icon('dice')} Try Another Game</a>
        <a class="btn btn-ghost" href="/games/">Back to Games</a>
      </div>

      <div class="review">
        <h2>Countries you missed</h2>
        <ul data-result-missed></ul>
      </div>

      ${adSlot()}

      <div class="related">
        <h2>You might also like</h2>
        <div class="related-links" data-related></div>
      </div>
    </section>

  </div>
</div>

<section class="section wrap">
  <div class="article">
    <h2>About ${esc(title)}</h2>
    ${(game.guide || []).map((para) => `<p>${esc(para)}</p>`).join('\n    ')}

    <h3>Scoring</h3>
    <p>Your score is how many of the ${count} ${count === 1 ? 'country' : 'countries'} you name correctly before the ${minutesLabel} run${minutes === 1 ? 's' : ''} out. There is no penalty for an unrecognised entry beyond the time it costs you to type it, and duplicates are ignored rather than counted twice. Stopping early locks in whatever you have found so far.</p>

    <h3>More ways to play</h3>
    <p>
      <a href="/game/${game.slug}/">${icon('grid')} All letters</a>
      ${letter ? ` · <a href="/game/${game.slug}/all">Play all 195 countries</a>` : ''}
      · ${allGames
        .filter((g) => g.id !== game.id)
        .slice(0, 3)
        .map((g) => `<a href="${gameHref(g)}">${esc(g.name)}</a>`)
        .join(' · ')}
    </p>
  </div>
</section>`;

  return page({
    title: `${metaTitle} | ${SITE.name}`,
    description: metaDescription,
    path: `/${path}`,
    css: ['/css/games.css', '/css/game.css'],
    body,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: title,
        description: metaDescription,
        url: new URL(`/${path}`, SITE.url).href,
        genre: 'Educational',
        gamePlatform: 'Web browser',
        numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
        isAccessibleForFree: true
      },
      breadcrumbSchema(trail.map((t) => ({ ...t, href: t.href || `/${path}` })))
    ]
  });
}

/**
 * The hub page at /game/name-the-countries/ — the single card that shows in
 * the games directory expands here into "play all 195" plus one link per
 * starting letter, so the category listing itself stays a single entry.
 */
export function recallHubPage(game, allGames, { startLetters, endLetters, lengthGroups }) {
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Games', href: '/games/' },
    { label: game.name }
  ];

  const letterGrid = (letters, prefix) => `<div class="letter-grid">
    ${letters
      .map(
        (l) => `<a class="letter-card" href="/game/${game.slug}/${prefix}${l.slug}">
      <span class="letter-card-letter">${esc(l.letter)}</span>
      <span class="letter-card-count">${l.count} ${l.count === 1 ? 'country' : 'countries'}</span>
    </a>`
      )
      .join('\n    ')}
  </div>`;

  const lengthGrid = (groups) => `<div class="letter-grid">
    ${groups
      .map(
        (g) => `<a class="letter-card" href="/game/${game.slug}/${g.slug}">
      <span class="letter-card-letter">${g.length}</span>
      <span class="letter-card-count">${g.count} ${g.count === 1 ? 'country' : 'countries'}</span>
    </a>`
      )
      .join('\n    ')}
  </div>`;

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  /** "W and X" / "B, F, J, P, V, W, X and Z" — for the "these have none" line. */
  const missingLetters = (letters) => {
    const missing = ALPHABET.filter((letter) => !letters.some((l) => l.letter === letter));
    if (missing.length <= 1) return missing.join('');
    return `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
  };

  const body = `${breadcrumbs(trail)}
<section class="section wrap">
  <div class="game-icon" aria-hidden="true" style="text-align:center;font-size:3.5rem;margin-bottom:12px">${game.icon}</div>
  <h1 style="text-align:center">${esc(game.name)}</h1>
  <p class="lead" style="text-align:center;max-width:60ch;margin:0 auto 32px">${esc(game.description)}</p>

  <div class="game-grid">
    <a class="game-card" href="/game/${game.slug}/all" data-accent="${game.accent}">
      <span class="icon" aria-hidden="true">${game.icon}</span>
      <h3>All 195 Countries</h3>
      <p>The full free-recall race — fifteen minutes on the clock.</p>
      <span class="play">Play</span>
    </a>
  </div>

  <h2 style="margin-top:40px">Or pick a starting letter</h2>
  <p class="lead">Every country whose name starts with each letter, with its own shorter clock. ${startLetters.length} letters have at least one country — ${missingLetters(startLetters)} have none.</p>

  ${letterGrid(startLetters, '')}

  <h2 style="margin-top:40px">Or pick an ending letter</h2>
  <p class="lead">Every country whose name ends with each letter — the same game, the other end of the word. ${endLetters.length} letters have at least one country — ${missingLetters(endLetters)} have none.</p>

  ${letterGrid(endLetters, 'ends-')}

  <h2 style="margin-top:40px">Or pick a name length</h2>
  <p class="lead">Every country whose name is exactly that many letters long, spaces and hyphens not counted — four-letter countries like Chad and Peru, up to Saint Vincent and the Grenadines at twenty-eight.</p>

  ${lengthGrid(lengthGroups)}

  ${adSlot()}

  <div class="article">
    <h2>About ${esc(game.name)}</h2>
    ${(game.guide || []).map((para) => `<p>${esc(para)}</p>`).join('\n    ')}

    <h3>Other games</h3>
    <p>${allGames
      .filter((g) => g.id !== game.id)
      .slice(0, 4)
      .map((g) => `<a href="${gameHref(g)}">${esc(g.name)}</a>`)
      .join(' · ')}</p>
  </div>
</section>`;

  return page({
    title: `${game.metaTitle} | ${SITE.name}`,
    description: game.metaDescription,
    path: `/game/${game.slug}/`,
    css: ['/css/games.css', '/css/game.css'],
    body,
    schema: breadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: 'Games', href: '/games/' },
      { label: game.name, href: `/game/${game.slug}/` }
    ])
  });
}

/* ========================================================================== */
/*  Countries                                                                 */
/* ========================================================================== */

export function countriesIndex(countries, continents) {
  const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  const regions = continents.filter((c) => c.countries > 0).map((c) => c.name);

  const body = `${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Countries' }])}
<section class="section wrap">
  <h1>All ${countries.length} countries of the world</h1>
  <p class="lead">Every sovereign country with its capital, continent, currency, language, population and area. Tap any country for its full profile.</p>

  <div class="filter-bar">
    <label class="sr-only" for="country-filter">Filter countries</label>
    <input id="country-filter" type="search" placeholder="Search by country or capital…" data-country-filter autocomplete="off">
    <label class="sr-only" for="continent-filter">Filter by continent</label>
    <select id="continent-filter" data-continent-filter>
      <option value="all">All continents</option>
      ${regions.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join('\n      ')}
    </select>
    <span class="pill" data-country-count>${countries.length} countries</span>
  </div>

  <div class="country-list" data-country-index>
    ${sorted
      .map(
        (c) => `<a href="/countries/${c.slug}" data-name="${esc(c.name)}" data-capital="${esc(c.capital)}" data-continent="${esc(c.continent)}">
      <span class="flag" aria-hidden="true">${c.flag}</span>
      <span><strong>${esc(c.name)}</strong><small>${esc(c.capital)}</small></span>
    </a>`
      )
      .join('\n    ')}
  </div>

  ${adSlot()}

  <div class="article">
    <h2>How many countries are there?</h2>
    <p>The usual answer is 195: the 193 member states of the United Nations plus two permanent observer states, Vatican City and Palestine. That is the list used across this site.</p>
    <p>Other counts exist and are not wrong, just differently scoped. Some include Taiwan, Kosovo or the Cook Islands; sports federations run their own lists, which is why FIFA has more members than the UN. If a quiz answer here surprises you, the 195-country UN framing is the reason.</p>
    <h2>Ready to test yourself?</h2>
    <p>Reading a list is not the same as knowing it. Try the <a href="/game/country-quiz">country quiz</a> or the <a href="/game/capital-quiz">capital quiz</a> and see how much of this page you can recall.</p>
  </div>
</section>`;

  return page({
    title: `All ${countries.length} Countries of the World — List with Capitals`,
    description: `Browse all ${countries.length} countries of the world with their capital city, continent, currency, language, population and area.`,
    path: '/countries/',
    css: ['/css/games.css'],
    body,
    schema: breadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: 'Countries', href: '/countries/' }
    ])
  });
}

export function countryPage(country, countries, details = {}) {
  const detail = details[country.code] || { borders: [], cities: [], facts: [] };
  const byCode = new Map(countries.map((c) => [c.code, c]));
  const neighbours = detail.borders.map((code) => byCode.get(code)).filter(Boolean);

  const linkTo = (c) => `<a href="/countries/${c.slug}">${esc(c.name)}</a>`;
  const joinList = (items) =>
    items.length <= 1
      ? items.join('')
      : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

  const bordersProse = neighbours.length
    ? `${esc(country.name)} shares land borders with ${joinList(neighbours.map(linkTo))} — ${
        neighbours.length === 1 ? 'its only land neighbour' : `${neighbours.length} neighbours in all`
      }.`
    : `${esc(country.name)} has no land borders with any other country.`;

  const citiesProse = detail.cities?.length
    ? `Its largest urban centres are ${joinList(detail.cities.map((c) => esc(c)))}.`
    : '';

  const highestProse = detail.highest
    ? `The highest point in the country is ${esc(detail.highest.name)}, at ${fmt(detail.highest.m)} metres.`
    : '';

  // Nearest country by area and by population. Computed rather than written,
  // but the pairing is different for every country and gives a reader a real
  // sense of scale that a raw number does not.
  const nearestBy = (key) =>
    countries
      .filter((c) => c.code !== country.code)
      .reduce((best, c) =>
        Math.abs(c[key] - country[key]) < Math.abs(best[key] - country[key]) ? c : best
      );

  const areaTwin = nearestBy('area');
  const popTwin = nearestBy('population');
  const scaleProse =
    areaTwin.code === popTwin.code
      ? `For scale, ${linkTo(areaTwin)} is the closest country in the world to ${esc(country.name)} in both area and population.`
      : `For scale, it covers almost exactly the same area as ${linkTo(areaTwin)}, while its population is closest to that of ${linkTo(popTwin)}.`;
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Countries', href: '/countries/' },
    { label: country.name, href: `/countries/${country.slug}` }
  ];

  const neighboursInRegion = countries
    .filter((c) => c.continent === country.continent && c.code !== country.code)
    .sort((a, b) => b.population - a.population)
    .slice(0, 12);

  const density = Math.round(country.population / country.area);

  const body = `${breadcrumbs(trail)}
<section class="wrap">
  <header class="country-header">
    <span class="flag" aria-hidden="true">${country.flag}</span>
    <div>
      <h1>${esc(country.name)}</h1>
      <p class="lead">${esc(country.capital)} · ${esc(detail.region || country.continent)}</p>
    </div>
  </header>

  <div class="article">
    <p>${esc(country.name)} is a country in ${esc(country.continent)}. Its capital city is ${esc(country.capital)}, the official currency is the ${esc(country.currency)}, and the main language is ${esc(country.language)}.</p>
    <p>With a population of roughly ${approx(country.population)} people spread over ${fmt(country.area)} km², ${esc(country.name)} is the ${ordinal(country.populationRank)} most populous country in the world and the ${ordinal(country.areaRank)} largest by area. That works out at about ${fmt(density)} people per square kilometre.</p>
    <p>${bordersProse} ${citiesProse} ${highestProse}</p>
    <p>${scaleProse}</p>
  </div>

  <dl class="fact-grid">
    <div class="fact"><dt>Capital</dt><dd>${esc(country.capital)}</dd></div>
    <div class="fact"><dt>Region</dt><dd>${esc(detail.region || country.continent)}</dd></div>
    <div class="fact"><dt>Population</dt><dd>${fmt(country.population)}</dd></div>
    <div class="fact"><dt>Area</dt><dd>${fmt(country.area)} km²</dd></div>
    <div class="fact"><dt>Currency</dt><dd>${esc(country.currency)}</dd></div>
    <div class="fact"><dt>Main language</dt><dd>${esc(country.language)}</dd></div>
    <div class="fact"><dt>Highest point</dt><dd>${detail.highest ? `${esc(detail.highest.name)}<br><small class="muted">${fmt(detail.highest.m)} m</small>` : '—'}</dd></div>
    <div class="fact"><dt>Land borders</dt><dd>${neighbours.length}</dd></div>
  </dl>

  <div class="article">
    <h2>${esc(country.name)}: things worth knowing</h2>
    <ul>
      ${detail.facts.map((f) => `<li>${esc(f)}</li>`).join('\n      ')}
    </ul>
  </div>

  <div class="btn-row" style="margin: 24px 0 8px">
    <a class="btn btn-primary" href="/game/flag-quiz?difficulty=medium&amp;autostart=1">🚩 Test your flag knowledge</a>
    <a class="btn btn-secondary" href="/game/capital-quiz?difficulty=medium&amp;autostart=1">🏛️ Capital quiz</a>
  </div>

  ${adSlot()}

  <div class="article">
    <h2>${esc(country.name)} in context</h2>
    <p>${esc(country.continent)} has ${countries.filter((c) => c.continent === country.continent).length} sovereign countries in total. ${esc(country.name)} ranks ${ordinal(
      countries
        .filter((c) => c.continent === country.continent)
        .sort((a, b) => b.population - a.population)
        .findIndex((c) => c.code === country.code) + 1
    )} among them by population.</p>
    <p>See the <a href="/continents/${country.continent.toLowerCase().replace(/\s+/g, '-')}/">full list of ${esc(country.continent)} countries</a>, or browse <a href="/countries/">all ${countries.length} countries</a>.</p>
  </div>

  <section class="section">
    <h2>Other countries in ${esc(country.continent)}</h2>
    <div class="country-list" style="margin-top:16px">
      ${neighboursInRegion
        .map(
          (c) => `<a href="/countries/${c.slug}">
        <span class="flag" aria-hidden="true">${c.flag}</span>
        <span><strong>${esc(c.name)}</strong><small>${esc(c.capital)}</small></span>
      </a>`
        )
        .join('\n      ')}
    </div>
  </section>

  <div class="related">
    <h2>Related geography games</h2>
    <div class="related-links">
      <a href="/game/country-quiz"><span aria-hidden="true">🌎</span> Country Quiz</a>
      <a href="/game/capital-quiz"><span aria-hidden="true">🏛️</span> Capital Quiz</a>
      <a href="/game/flag-quiz"><span aria-hidden="true">🚩</span> Flag Quiz</a>
      <a href="/game/continent-quiz"><span aria-hidden="true">🌍</span> Continent Quiz</a>
    </div>
  </div>
</section>`;

  return page({
    title: `${country.name} — Capital, Flag, Population and Facts`,
    description: `${country.name}: capital ${country.capital}, ${fmt(country.population)} people, currency ${country.currency}. ${detail.facts[0] || ''}`.slice(0, 158),
    path: `/countries/${country.slug}`,
    rail: true,
    css: ['/css/games.css', '/css/game.css'],
    body,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Country',
        name: country.name,
        url: new URL(`/countries/${country.slug}`, SITE.url).href,
        containedInPlace: { '@type': 'Continent', name: country.continent }
      },
      breadcrumbSchema(trail)
    ]
  });
}

/* ========================================================================== */
/*  Continents                                                                */
/* ========================================================================== */

export function continentsIndex(continents, countries) {
  const body = `${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Continents' }])}
<section class="section wrap">
  <h1>The continents of the world</h1>
  <p class="lead">Seven continents, ${countries.length} countries. Each page lists every country in the region with its capital, plus the facts that come up most often in quizzes.</p>

  <div class="game-grid">
    ${continents
      .map(
        (c) => `<a class="game-card" href="/continents/${c.slug}/" data-accent="blue">
      <span class="icon" aria-hidden="true">${c.icon}</span>
      <h3>${esc(c.name)}</h3>
      <p>${c.countries ? `${c.countries} countries · ${fmt(c.area)} km²` : `No countries · ${fmt(c.area)} km²`}</p>
      <span class="play">Explore</span>
    </a>`
      )
      .join('\n    ')}
  </div>

  ${adSlot()}

  <div class="article">
    <h2>How many continents are there?</h2>
    <p>Seven, on the model used across this site and taught in most English-speaking countries: Africa, Asia, Europe, North America, South America, Oceania and Antarctica.</p>
    <p>It is not the only model. Some countries teach six continents by combining Europe and Asia into Eurasia; others combine the Americas. The physical world does not change — only where the line is drawn. Quiz answers here follow the seven-continent model.</p>
    <p>Only six continents have sovereign countries. Antarctica has research stations but no permanent population and no government of its own.</p>
    <h2>Test yourself</h2>
    <p>The <a href="/game/continent-quiz">continent quiz</a> gives you a country and four continents to choose from. It is the fastest game on the site and the best place to start.</p>
  </div>
</section>`;

  return page({
    title: 'Continents of the World — Countries, Facts and Quizzes',
    description:
      'Explore all seven continents with the countries in each, their size, population and key facts, then play the continent quiz.',
    path: '/continents/',
    css: ['/css/games.css'],
    body,
    schema: breadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: 'Continents', href: '/continents/' }
    ])
  });
}

export function continentPage(continent, countries) {
  const inContinent = countries
    .filter((c) => c.continent === continent.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Continents', href: '/continents/' },
    { label: continent.name, href: `/continents/${continent.slug}/` }
  ];

  const table = inContinent.length
    ? `<div class="table-wrap">
    <table>
      <thead><tr><th>Flag</th><th>Country</th><th>Capital</th><th>Population</th><th>Area (km²)</th></tr></thead>
      <tbody>
        ${inContinent
          .map(
            (c) => `<tr>
          <td aria-hidden="true">${c.flag}</td>
          <td><a href="/countries/${c.slug}">${esc(c.name)}</a></td>
          <td>${esc(c.capital)}</td>
          <td>${fmt(c.population)}</td>
          <td>${fmt(c.area)}</td>
        </tr>`
          )
          .join('\n        ')}
      </tbody>
    </table>
  </div>`
    : '<p class="muted">Antarctica has no sovereign countries — only research stations operated under the Antarctic Treaty.</p>';

  const body = `${breadcrumbs(trail)}
<section class="section wrap">
  <h1>${continent.icon} ${esc(continent.name)}</h1>
  <p class="lead">${esc(continent.summary)}</p>

  <dl class="fact-grid">
    <div class="fact"><dt>Countries</dt><dd>${continent.countries}</dd></div>
    <div class="fact"><dt>Area</dt><dd>${fmt(continent.area)} km²</dd></div>
    <div class="fact"><dt>Population</dt><dd>${continent.population ? approx(continent.population) : 'No permanent population'}</dd></div>
    <div class="fact"><dt>Highest point</dt><dd>${esc(continent.highest)}</dd></div>
    <div class="fact"><dt>Largest country</dt><dd>${esc(continent.largest)}</dd></div>
    <div class="fact"><dt>Smallest country</dt><dd>${esc(continent.smallest)}</dd></div>
  </dl>

  <h2>${esc(continent.name)} facts</h2>
  <div class="article">
    <ul>
      ${continent.facts.map((f) => `<li>${esc(f)}</li>`).join('\n      ')}
    </ul>
  </div>

  ${adSlot()}

  <h2>${inContinent.length ? `Countries in ${esc(continent.name)}` : 'Countries'}</h2>
  <p class="muted" style="margin-bottom:16px">${inContinent.length ? `All ${inContinent.length} sovereign countries, alphabetically.` : ''}</p>
  ${table}

  <div class="related">
    <h2>Play a related game</h2>
    <div class="related-links">
      <a href="/game/continent-quiz"><span aria-hidden="true">🌍</span> Continent Quiz</a>
      <a href="/game/capital-quiz"><span aria-hidden="true">🏛️</span> Capital Quiz</a>
      <a href="/game/flag-quiz"><span aria-hidden="true">🚩</span> Flag Quiz</a>
      <a href="/game/mixed-quiz"><span aria-hidden="true">🧭</span> Mixed Quiz</a>
    </div>
  </div>
</section>`;

  return page({
    title: `${continent.name} — ${continent.countries ? `${continent.countries} Countries, ` : ''}Capitals, Map Facts`,
    description: `${continent.name}: ${continent.summary.slice(0, 130)}`,
    path: `/continents/${continent.slug}/`,
    rail: true,
    css: ['/css/games.css', '/css/game.css'],
    body,
    schema: breadcrumbSchema(trail)
  });
}

/* ========================================================================== */
/*  Reference lists                                                           */
/* ========================================================================== */

function listPage({ slug, title, h1, description, intro, outro, columns, rows, optionalColumn }) {
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Lists', href: '/lists/countries-and-capitals' },
    { label: h1, href: `/lists/${slug}` }
  ];

  const body = `${breadcrumbs(trail)}
<section class="section wrap">
  <h1>${esc(h1)}</h1>
  <div class="article">${intro}</div>

  ${adSlot()}

  <div class="table-wrap">
    <table>
      <thead><tr>${columns
        .map((c) => `<th${c === optionalColumn ? ' class="col-optional"' : ''}>${esc(c)}</th>`)
        .join('')}</tr></thead>
      <tbody>
        ${rows.join('\n        ')}
      </tbody>
    </table>
  </div>

  <div class="article">${outro}</div>

  <div class="related">
    <h2>Turn this list into a game</h2>
    <div class="related-links">
      <a href="/game/capital-quiz"><span aria-hidden="true">🏛️</span> Capital Quiz</a>
      <a href="/game/flag-quiz"><span aria-hidden="true">🚩</span> Flag Quiz</a>
      <a href="/game/country-quiz"><span aria-hidden="true">🌎</span> Country Quiz</a>
    </div>
  </div>
</section>`;

  return page({
    title,
    description,
    path: `/lists/${slug}`,
    rail: true,
    css: ['/css/games.css', '/css/game.css'],
    body,
    schema: breadcrumbSchema(trail)
  });
}

export function listPages(countries) {
  const byName = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  const byArea = [...countries].sort((a, b) => b.area - a.area);

  return [
    {
      path: 'lists/countries-and-capitals.html',
      html: listPage({
        slug: 'countries-and-capitals',
        title: `Countries and Their Capitals — All ${countries.length} | ${SITE.name}`,
        h1: 'Countries and their capitals',
        description: `The complete list of all ${countries.length} countries and their capital cities, with continent and flag.`,
        intro: `<p>All ${countries.length} sovereign countries with their capital cities, sorted alphabetically. A handful are worth knowing about before you are quizzed on them: Bolivia's constitutional capital is Sucre rather than La Paz, South Africa's seat of government is Pretoria, and Sri Lanka's official capital is Sri Jayawardenepura Kotte, not Colombo.</p>`,
        outro: `<h2>Learning them</h2><p>Capitals are the hardest of the basic geography facts because there is no visual hook — nothing about "Bishkek" points to Kyrgyzstan. What works is repeated short sessions with immediate correction, which is exactly what the <a href="/game/capital-quiz">capital quiz</a> does.</p>`,
        columns: ['Flag', 'Country', 'Capital', 'Continent'],
        optionalColumn: 'Continent',
        rows: byName.map(
          (c) => `<tr><td aria-hidden="true">${c.flag}</td><td><a href="/countries/${c.slug}">${esc(c.name)}</a></td><td>${esc(c.capital)}</td><td class="col-optional">${esc(c.continent)}</td></tr>`
        )
      })
    },
    {
      path: 'lists/world-flags.html',
      html: listPage({
        slug: 'world-flags',
        title: `World Flags — All ${countries.length} Country Flags | ${SITE.name}`,
        h1: 'World flags',
        description: `Every one of the ${countries.length} country flags with the country, capital and continent it belongs to.`,
        intro: `<p>Every national flag on the site, with the country it belongs to. Flags are the fastest geography facts to learn because they are visual — most people can recognise a flag long before they can recall the capital.</p>`,
        outro: `<h2>The ones that catch people out</h2><p>Chad and Romania are near-identical. Monaco and Indonesia differ only in proportions. Ireland and Ivory Coast are mirror images of each other. Australia and New Zealand both carry the Union Jack and the Southern Cross, differing in the number and colour of the stars. Those pairs are exactly the distractors the <a href="/game/flag-quiz">flag quiz</a> serves up at the harder levels.</p>`,
        columns: ['Flag', 'Country', 'Capital', 'Continent'],
        optionalColumn: 'Continent',
        rows: byName.map(
          (c) => `<tr><td aria-hidden="true">${c.flag}</td><td><a href="/countries/${c.slug}">${esc(c.name)}</a></td><td>${esc(c.capital)}</td><td class="col-optional">${esc(c.continent)}</td></tr>`
        )
      })
    },
    {
      path: 'lists/largest-countries.html',
      html: listPage({
        slug: 'largest-countries',
        title: `Largest Countries in the World by Area | ${SITE.name}`,
        h1: 'Largest countries in the world',
        description:
          'The largest countries in the world ranked by land area, from Russia down, with population and capital for each.',
        intro: `<p>Countries ranked by total area. Russia is larger than the next two combined and covers about an eighth of the world's inhabited land — it alone spans eleven time zones.</p>`,
        outro: `<h2>Big is not the same as populous</h2><p>Canada is the second largest country on Earth and has fewer people than Poland. Bangladesh is smaller than Nepal and has more than five times its population. If you learn area rankings and population rankings as one list, you will get both wrong; the <a href="/game/country-quiz">country quiz</a> keeps them separate on purpose.</p>`,
        columns: ['#', 'Flag', 'Country', 'Area (km²)', 'Population', 'Continent'],
        rows: byArea.map(
          (c, i) => `<tr><td>${i + 1}</td><td aria-hidden="true">${c.flag}</td><td><a href="/countries/${c.slug}">${esc(c.name)}</a></td><td>${fmt(c.area)}</td><td>${fmt(c.population)}</td><td>${esc(c.continent)}</td></tr>`
        )
      })
    },
    {
      path: 'lists/smallest-countries.html',
      html: listPage({
        slug: 'smallest-countries',
        title: `Smallest Countries in the World by Area | ${SITE.name}`,
        h1: 'Smallest countries in the world',
        description:
          'The smallest countries in the world ranked by area, starting with Vatican City, with population and capital for each.',
        intro: `<p>The same ranking read from the other end. Vatican City covers less than half a square kilometre — you can walk across it in ten minutes — and Monaco, the second smallest, is about the size of a large city park.</p>`,
        outro: `<h2>Where the expert rounds come from</h2><p>Microstates and small island nations are where most people's geography knowledge runs out: Nauru, Tuvalu, Palau, San Marino, Liechtenstein. They are exactly what the <strong>Expert</strong> difficulty draws on across the games. Start with the <a href="/game/flag-quiz?difficulty=expert">expert flag quiz</a> if you want to find your limit quickly.</p>`,
        columns: ['#', 'Flag', 'Country', 'Area (km²)', 'Population', 'Continent'],
        rows: [...byArea]
          .reverse()
          .map(
            (c, i) => `<tr><td>${i + 1}</td><td aria-hidden="true">${c.flag}</td><td><a href="/countries/${c.slug}">${esc(c.name)}</a></td><td>${fmt(c.area)}</td><td>${fmt(c.population)}</td><td>${esc(c.continent)}</td></tr>`
          )
      })
    }
  ];
}

/* ========================================================================== */
/*  Static pages                                                              */
/* ========================================================================== */

function simplePage({ slug, title, description, h1, content }) {
  const trail = [{ label: 'Home', href: '/' }, { label: h1, href: `/${slug}` }];
  return page({
    title,
    description,
    path: `/${slug}`,
    css: ['/css/games.css'],
    body: `${breadcrumbs(trail)}
<section class="section wrap">
  <div class="article">
    <h1>${esc(h1)}</h1>
    ${content}
  </div>
</section>`,
    schema: breadcrumbSchema(trail)
  });
}

export function aboutPage(countries) {
  return simplePage({
    slug: 'about',
    title: `About — ${SITE.name}`,
    description: `What ${SITE.name} is, where the data comes from and how the games are scored.`,
    h1: `About ${SITE.name}`,
    content: `
    <p>${SITE.name} is a free set of geography quizzes covering all ${countries.length} countries — their flags, capitals, continents, currencies and languages — plus famous landmarks and the world's oceans and seas.</p>

    <h2>What it is for</h2>
    <p>Most people can name thirty or forty countries and stall. The gap is not intelligence, it is repetition with feedback. Every round here is thirty questions, and shows the correct answer immediately when you miss one. Do that a few times a week and the map fills in.</p>

    <h2>No account, no tracking of your answers</h2>
    <p>There is nothing to sign up for. Your scores, streaks and theme preference are stored in your own browser using local storage and never leave your device. Clear your browser data and they are gone — we could not recover them if we wanted to.</p>

    <h2>Where the data comes from</h2>
    <p>Country data is compiled from public sources. Population figures are recent estimates rounded for readability, and areas are given in square kilometres including inland water. The country list follows the United Nations model: 193 member states plus Vatican City and Palestine.</p>
    <p>Geography is not always tidy. Some capitals are disputed or split across cities, some countries have several official languages, and continent boundaries depend on which model you were taught. Where a judgement call was needed we picked the most widely used convention and applied it consistently, so the quizzes are at least internally coherent.</p>

    <h2>Found a mistake?</h2>
    <p>Corrections are welcome — see the <a href="/contact">contact page</a>. Data errors get fixed quickly because a quiz with wrong answers is worse than no quiz.</p>

    <h2>How scoring works</h2>
    <ul>
      <li>Correct answer — 100 points</li>
      <li>Answered within five seconds — 50 bonus points</li>
      <li>Three in a row — 50 points; five in a row — 100; ten in a row — 250</li>
      <li>Wrong answer — no points, and the streak resets</li>
    </ul>

    <h2>Round length and difficulty</h2>
    <p>Easy, Medium and Hard are thirty questions long. A wrong answer costs you the points and the streak but never ends the round — you always play all thirty.</p>
    <p><strong>Expert is a survival mode.</strong> There is no set number of questions: they keep coming from the hardest pool until you answer one wrong, and then the run is over. Your score is how far you got, and the only way to improve it is to start again. Ten in a row on Expert is a genuine achievement; thirty is exceptional.</p>
    <p>A few games have smaller pools than thirty — the landmark and oceans quizzes draw on 60 landmarks and 30 bodies of water — so those rounds are as long as the pool allows rather than being padded with repeats.</p>

    <p><a class="btn btn-primary" href="/games/" style="margin-top:16px">Browse the games</a></p>`
  });
}

export function contactPage() {
  return simplePage({
    slug: 'contact',
    title: `Contact — ${SITE.name}`,
    description: `Get in touch with ${SITE.name} about data corrections, feedback or advertising.`,
    h1: 'Contact',
    content: `
    <p>Questions, corrections and suggestions are all welcome.</p>

    <h2>Email</h2>
    <p><a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a></p>

    <h2>Reporting a data error</h2>
    <p>If a quiz answer looks wrong, please include the game, the question and what you believe the correct answer is. Country data changes — capitals move, currencies get replaced, populations are re-estimated — and specific reports get fixed fastest.</p>

    <h2>Feature requests</h2>
    <p>Interactive map quizzes, timed modes and achievements are the most requested additions and are on the list. If there is something else you want to see, say so.</p>

    <h2>Advertising</h2>
    <p>Advertising on the site is handled through Google AdSense. See the <a href="/privacy-policy">privacy policy</a> for how advertising cookies are used.</p>

    <h2>Response time</h2>
    <p>This is a small site run by a small team, so replies usually take a few days.</p>`
  });
}

export function privacyPage() {
  return simplePage({
    slug: 'privacy-policy',
    title: `Privacy Policy — ${SITE.name}`,
    description: `How ${SITE.name} handles local storage, cookies, advertising and analytics.`,
    h1: 'Privacy policy',
    content: `
    <p class="muted">Last updated: 11 August 2026</p>

    <p>This policy explains what ${SITE.name} ("we", "the site") stores, what third parties may store, and what choices you have. Plain language, no lawyer-speak where it can be avoided.</p>

    <h2>1. No account, no personal data collected by us</h2>
    <p>You do not create an account to use this site. We do not ask for your name, email address or any other personal detail, and we do not operate a user database. If you email us, we hold that email only to reply to you.</p>

    <h2>2. Local storage</h2>
    <p>The site uses your browser's <strong>local storage</strong> to remember:</p>
    <ul>
      <li>your light or dark theme preference;</li>
      <li>your best scores per game and difficulty;</li>
      <li>counts of games played, questions answered and correct answers;</li>
      <li>which days you have played, so a streak can be shown.</li>
    </ul>
    <p>This data stays on your device. It is not transmitted to us or to anyone else, and it is not linked to any identity. You can erase it at any time by clearing site data in your browser settings; the site will simply start again from zero.</p>

    <h2>3. Cookies</h2>
    <p>We set no cookies of our own. Third-party services described below may set cookies in your browser.</p>

    <h2>4. Advertising and Google AdSense</h2>
    <p>This site displays advertising to cover its running costs. Advertising is served by Google AdSense.</p>
    <ul>
      <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.</li>
      <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this and/or other sites on the internet.</li>
      <li>You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google Ads Settings</a>.</li>
      <li>You can opt out of third-party vendor cookies for personalised advertising at <a href="https://www.aboutads.info/choices/" rel="nofollow noopener" target="_blank">aboutads.info/choices</a>.</li>
    </ul>
    <p>Where required by law, we ask for your consent before non-essential cookies are set, and you can withdraw that consent at any time through your browser settings.</p>

    <h2>5. Analytics</h2>
    <p>We may use a privacy-respecting analytics service to count page views and understand which games are played. Any such analytics is configured to record aggregate usage only — no attempt is made to identify individual visitors or to combine analytics data with advertising data.</p>

    <h2>6. Third-party services</h2>
    <p>Beyond advertising and analytics, the site is deliberately plain: there are no social widgets, no embedded videos, no comment system, no external fonts and no content delivery networks loading third-party scripts. Pages are static HTML, CSS and JavaScript served from our own host.</p>

    <h2>7. Children</h2>
    <p>The site is suitable for all ages and is used in classrooms. We do not knowingly collect personal information from anyone, including children. If you believe a child has sent us personal information by email, contact us and we will delete it.</p>

    <h2>8. Your rights</h2>
    <p>Because we hold no personal data about you, there is generally nothing for us to export or delete on request. For data held by advertising partners, use the opt-out links in section 4, which are controlled by those partners rather than by us.</p>
    <p>Visitors in the European Economic Area, the United Kingdom, Switzerland and California have specific rights under the GDPR, UK GDPR and CCPA respectively. Requests can be made through the <a href="/contact">contact page</a>.</p>

    <h2>9. Data transfers and retention</h2>
    <p>We retain no visitor data, so there is nothing to transfer or to age out. Third parties named above operate their own retention schedules, documented in their own policies.</p>

    <h2>10. Changes to this policy</h2>
    <p>If this policy changes materially, the date at the top of the page will be updated. Continued use of the site after a change means you accept the revised policy.</p>

    <h2>11. Contact</h2>
    <p>Questions about privacy can be sent through the <a href="/contact">contact page</a>.</p>`
  });
}

export function termsPage() {
  return simplePage({
    slug: 'terms',
    title: `Terms of Use — ${SITE.name}`,
    description: `The terms under which ${SITE.name} is provided.`,
    h1: 'Terms of use',
    content: `
    <p class="muted">Last updated: 11 August 2026</p>

    <h2>1. Acceptance</h2>
    <p>By using ${SITE.name} you agree to these terms. If you do not agree with them, please do not use the site.</p>

    <h2>2. The service</h2>
    <p>The site provides free educational geography games and reference content. It is offered as-is, with no guarantee of availability, and may be changed or withdrawn at any time.</p>

    <h2>3. Accuracy of content</h2>
    <p>Geography data is compiled from public sources and checked, but errors are possible and the world changes. Content is provided for education and entertainment. Do not rely on it for legal, academic, commercial or navigational purposes without verifying it independently.</p>

    <h2>4. Acceptable use</h2>
    <p>You may use the site for personal learning and in classrooms. You may not:</p>
    <ul>
      <li>attempt to disrupt, overload or gain unauthorised access to the site;</li>
      <li>scrape the site at a rate that degrades it for other users;</li>
      <li>republish substantial portions of the content as your own work.</li>
    </ul>
    <p>Teachers are explicitly welcome to use the games in lessons and to link to any page.</p>

    <h2>5. Intellectual property</h2>
    <p>The site's design, text and code belong to ${SITE.name}. Factual geographic data — country names, capitals, populations — is not owned by anyone and you are free to use it. Flags are shown as Unicode characters rendered by your own device; their appearance depends on your operating system.</p>

    <h2>6. Advertising</h2>
    <p>The site is funded by advertising. Adverts are supplied by third parties and their content is not endorsed by us. Dealings with advertisers are between you and them.</p>

    <h2>7. External links</h2>
    <p>Links to other sites are provided for convenience. We are not responsible for their content or their privacy practices.</p>

    <h2>8. Limitation of liability</h2>
    <p>To the fullest extent permitted by law, ${SITE.name} is not liable for any loss or damage arising from your use of the site, including reliance on any content it contains. Nothing in these terms limits liability that cannot lawfully be limited.</p>

    <h2>9. Changes</h2>
    <p>These terms may be updated. The date above shows the most recent revision.</p>

    <h2>10. Contact</h2>
    <p>Questions about these terms can be sent through the <a href="/contact">contact page</a>.</p>`
  });
}

export function notFoundPage() {
  return page({
    title: `Page not found — ${SITE.name}`,
    description: 'That page does not exist. Pick a geography game instead.',
    path: '/404',
    css: ['/css/games.css'],
    body: `<section class="section wrap" style="text-align:center">
  <h1>🧭 Lost?</h1>
  <p class="lead" style="margin: 12px auto 28px">That page does not exist — but the world is still here.</p>
  <div class="btn-row" style="justify-content:center">
    <a class="btn btn-primary btn-lg" href="/games/">Browse games</a>
    <a class="btn btn-secondary btn-lg" href="/countries/">All countries</a>
    <a class="btn btn-ghost btn-lg" href="/">Home</a>
  </div>
  <div class="game-grid" data-game-cards="popular" data-limit="4" style="margin-top:48px;text-align:left"></div>
</section>`
  });
}


/* ========================================================================== */
/*  Guides (long-form articles)                                               */
/* ========================================================================== */

function readingTime(html) {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function guidesIndex() {
  const trail = [{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }];

  const body = `${breadcrumbs(trail)}
<section class="section wrap">
  <h1>Geography guides</h1>
  <p class="lead">Longer pieces on how to actually learn this material, and on the parts of world geography that are commonly misunderstood.</p>

  <div class="card-grid" style="margin-top:32px">
    ${ARTICLES.map(
      (a) => `<a class="game-card" href="/guides/${a.slug}" data-accent="blue">
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.summary)}</p>
      <span class="play">Read — ${readingTime(a.body)} min</span>
    </a>`
    ).join('\n    ')}
  </div>

  ${adSlot()}

  <div class="article">
    <h2>Why these exist</h2>
    <p>The games on this site test recall. These guides cover the things a quiz cannot: the order to learn regions in, why so many flags resemble each other, what a map projection is choosing to distort, and which widely held geographic beliefs are simply wrong.</p>
    <p>If you are starting from scratch, <a href="/guides/how-to-memorise-every-country">how to memorise all 195 countries</a> is the one to read first.</p>
  </div>
</section>`;

  return page({
    title: 'Geography Guides — Learning Methods and Common Misconceptions',
    description:
      'In-depth geography guides: how to memorise every country, why national flags look alike, map projections explained, landlocked countries and common misconceptions.',
    path: '/guides/',
    css: ['/css/games.css'],
    body,
    schema: breadcrumbSchema(trail)
  });
}

export function guidePage(article) {
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides/' },
    { label: article.title, href: `/guides/${article.slug}` }
  ];

  const others = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  const body = `${breadcrumbs(trail)}
<article class="section wrap">
  <header style="margin-bottom:24px">
    <h1>${esc(article.title)}</h1>
    <p class="lead" style="margin-top:12px">${esc(article.summary)}</p>
    <p class="muted" style="font-size:.875rem;margin-top:12px">${readingTime(article.body)} min read · Updated ${esc(article.updated)}</p>
  </header>

  <div class="article">
    ${article.body.trim()}
  </div>

  ${adSlot()}

  <div class="related">
    <h2>More guides</h2>
    <div class="related-links">
      ${others.map((a) => `<a href="/guides/${a.slug}">${esc(a.title)}</a>`).join('\n      ')}
    </div>
  </div>
</article>`;

  return page({
    title: `${article.metaTitle} | ${SITE.name}`,
    description: article.description,
    path: `/guides/${article.slug}`,
    rail: true,
    css: ['/css/games.css', '/css/game.css'],
    body,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        url: new URL(`/guides/${article.slug}`, SITE.url).href,
        author: { '@type': 'Organization', name: SITE.name },
        publisher: { '@type': 'Organization', name: SITE.name },
        inLanguage: SITE.locale
      },
      breadcrumbSchema(trail)
    ]
  });
}

export { ARTICLES };


/* ========================================================================== */
/*  Practice: replay the questions you got wrong                              */
/* ========================================================================== */

export function practicePage() {
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Games', href: '/games/' },
    { label: 'Review mistakes', href: '/practice' }
  ];

  const body = `${breadcrumbs(trail)}
<div class="wrap">
  <div class="game-shell" data-game data-game-id="practice" data-questions="30">

    <div class="game-status" data-status hidden></div>

    <section class="game-screen setup" data-screen="setup">
      <div class="game-icon" aria-hidden="true">🎯</div>
      <h1>Review your mistakes</h1>
      <p>Every question you answer wrong is remembered. This replays them — drawn from whichever games you missed them in — until you get each one right twice.</p>

      <p class="review-count" data-review-count>Nothing to review yet</p>

      <button class="btn btn-primary btn-lg btn-block" type="button" data-start>${icon('play')} Start review</button>

      <p class="setup-best" data-review-empty hidden>
        Play any game and the questions you miss will collect here.
        <a href="/games/">Browse the games →</a>
      </p>

      <p class="setup-best">
        <button class="link-button" type="button" data-clear-review>Clear review list</button>
      </p>
    </section>

    ${playAndResultsScreens({ icon: '🎯', name: 'Review', showRelated: true })}

  </div>
</div>

<section class="section wrap">
  <div class="article">
    <h2>Why review beats replaying</h2>
    <p>Playing another random round mostly re-tests what you already know. The questions you got wrong are the only ones carrying new information, and they are exactly the ones a random round is least likely to show you again soon.</p>
    <p>This page fixes that. Every wrong answer across all fifteen games is remembered by what it asked — the country, the landmark, the sea — and replayed here. Getting one right does not remove it immediately: you have to answer it correctly <strong>twice</strong>, because getting something right straight after being shown the answer proves very little.</p>
    <p>Missing an item again resets its progress. That is deliberate: a fact you get wrong after previously getting it right is the most valuable one in the list.</p>

    <h3>Where the questions come from</h3>
    <p>Reviews are rebuilt from the original game, not stored as snapshots, so a flag you missed on Expert can reappear with different wrong answers beside it. The point is to re-test the fact rather than to reproduce the round it came from.</p>

    <h3>It stays on your device</h3>
    <p>The review list lives in your browser's local storage alongside your scores and streak. Nothing is uploaded, and clearing your browser data clears the list. See the <a href="/privacy-policy">privacy policy</a> for what else is stored locally.</p>
  </div>
</section>`;

  return page({
    title: `Review Your Mistakes — Practice What You Got Wrong | ${SITE.name}`,
    description:
      'Replay the geography questions you answered wrong. Every miss across all games is remembered and repeated until you get it right twice.',
    path: '/practice',
    css: ['/css/games.css', '/css/game.css'],
    body,
    schema: breadcrumbSchema(trail)
  });
}
