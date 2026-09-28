/**
 * layout.js — the shared page shell (head, header, footer).
 *
 * Zero dependencies: plain Node, plain template literals. Every generated page
 * goes through `page()` so the navigation, theme bootstrap, footer and SEO tags
 * only exist in one place.
 */

import { readFileSync } from 'node:fs';
// The icon set is shared with the browser so the two can never drift.
export { icon } from '../../js/icons.js';
import { icon } from '../../js/icons.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const SITE = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'));

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games/' },
  { label: 'Countries', href: '/countries/' },
  { label: 'Capitals', href: '/lists/countries-and-capitals' },
  { label: 'Flags', href: '/lists/world-flags' },
  { label: 'Continents', href: '/continents/' },
  { label: 'Guides', href: '/guides/' },
  { label: 'Blog', href: '/blog/' }
];

const FOOTER = [
  {
    title: 'Play',
    links: [
      ['All games', '/games/'],
      ['Country quiz', '/game/country-quiz'],
      ['Capital quiz', '/game/capital-quiz'],
      ['Flag quiz', '/game/flag-quiz'],
      ['Mixed quiz', '/game/mixed-quiz'],
      ['Achievements', '/achievements']
    ]
  },
  {
    title: 'Explore',
    links: [
      ['All countries', '/countries/'],
      ['Continents', '/continents/'],
      ['Countries and capitals', '/lists/countries-and-capitals'],
      ['World flags', '/lists/world-flags'],
      ['Largest countries', '/lists/largest-countries'],
      ['Compare countries', '/compare/'],
      ['Guides', '/guides/'],
      ['Blog', '/blog/']
    ]
  },
  {
    title: 'Site',
    links: [
      ['About', '/about'],
      ['Contact', '/contact'],
      ['Privacy policy', '/privacy-policy'],
      ['Terms', '/terms']
    ]
  }
];

/** Escapes text destined for HTML text nodes or attribute values. */
export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * An ad placement.
 *
 * With no AdSense client configured this stays a grey placeholder, so local
 * development reserves exactly the same space the live ad will occupy. The
 * `push()` call deliberately does NOT go here — see js/ads.js. Some slots (the
 * one on the game results screen) start inside a hidden section, and pushing an
 * ad into a display:none container makes it measure zero width and never fill.
 */
export function adSlot(name = 'default') {
  const slot = SITE.adsense?.slots?.[name] || SITE.adsense?.slots?.default;
  const client = SITE.adsense?.client;
  const live = client && slot ? ` data-ad data-ad-slot-id="${slot}"` : '';

  return `<div class="ad-container"${live} role="complementary" aria-label="Advertisement">
    <span class="ad-label">Advertisement</span>
  </div>`;
}

/**
 * The sticky side rail, shown only on wide screens.
 *
 * A responsive unit takes its shape from the width of its container, not from
 * whatever it was named in AdSense, so a tall ad needs a narrow column. Below
 * the breakpoint this element is display:none and no <ins> is ever created for
 * it — see js/ads.js for why that matters.
 */
export function adRail() {
  const slot = SITE.adsense?.slots?.rail;
  const client = SITE.adsense?.client;
  if (!client || !slot) return '';

  return `<aside class="ad-rail" aria-label="Advertisement">
    <div class="ad-rail-sticky">
      <span class="ad-label">Advertisement</span>
      <div class="ad-container ad-container-rail" data-ad data-ad-slot-id="${slot}"></div>
    </div>
  </aside>`;
}

/** The loader script, once per page. */
function adsenseHead() {
  const client = SITE.adsense?.client;
  if (!client) return '';
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`;
}

/** Google Analytics (gtag.js), once per page. */
function analyticsHead() {
  const id = SITE.analytics?.measurementId;
  if (!id) return '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${id}');
</script>`;
}

function navLinks(cls) {
  return NAV.map((item) => `<a href="${item.href}">${item.label}</a>`).join(cls === 'drawer' ? '\n        ' : '\n          ');
}

function header() {
  return `<header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="/">
        <span class="globe" aria-hidden="true">🌍</span>
        <span class="brand-full">${SITE.name}</span>
        <span class="brand-short">${SITE.shortName}</span>
      </a>
      <nav class="nav-links" aria-label="Main">
          ${navLinks()}
      </nav>
      <div class="nav-actions">
        <div class="search">
          <label class="sr-only" for="site-search">Search countries, games and guides</label>
          <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="10.5" cy="10.5" r="6.75"/>
            <path d="M15.5 15.5 20.5 20.5"/>
          </svg>
          <input id="site-search" type="search" placeholder="Search countries, games, guides…"
                 autocomplete="off" data-country-search="site-search-results">
          <div class="search-results" id="site-search-results" role="listbox" aria-label="Search results"></div>
        </div>
        <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Switch colour theme">
          <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20.5 14.8A8.7 8.7 0 0 1 9.2 3.5a8.7 8.7 0 1 0 11.3 11.3Z"/>
          </svg>
          <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="4.2"/>
            <path d="M12 2.2v2.3M12 19.5v2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.2 12h2.3M19.5 12h2.3M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/>
          </svg>
        </button>
        <button class="icon-btn nav-toggle" type="button" data-nav-toggle
                aria-expanded="false" aria-controls="nav-drawer" aria-label="Open menu">
          <svg class="icon-menu" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16"/>
          </svg>
          <svg class="icon-close" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Outside <header> on purpose: .site-header uses backdrop-filter, which
       makes it a containing block for position:fixed descendants. Nested here,
       the drawer would size against the 64px header instead of the viewport. -->
  <div class="nav-drawer" id="nav-drawer" data-open="false">
    <nav aria-label="Mobile">
      ${navLinks('drawer')}
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </div>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="brand"><span class="globe" aria-hidden="true">🌍</span> ${SITE.name}</span>
          <p>Learn the world. Play. Improve. Free geography games with no account and no downloads.</p>
        </div>
        ${FOOTER.map(
          (col) => `<div>
          <h3>${col.title}</h3>
          <ul>
            ${col.links.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join('\n            ')}
          </ul>
        </div>`
        ).join('\n        ')}
      </div>
      <div class="footer-bottom">
        <span>© <span data-year>2026</span> ${SITE.name}. All rights reserved.</span>
        <span>Country data is compiled from public sources and rounded for readability.</span>
      </div>
    </div>
  </footer>`;
}

/**
 * @param {object} options
 * @param {string} options.title      <title> text
 * @param {string} options.description meta description
 * @param {string} options.path       canonical path, e.g. "/games/"
 * @param {string} options.body       page markup (inside <main>)
 * @param {string[]} [options.css]    extra stylesheets beyond main/responsive
 * @param {object|object[]} [options.schema] JSON-LD payload(s)
 * @param {string} [options.bodyClass]
 */
export function page({
  title,
  description,
  path,
  body,
  css = [],
  schema = null,
  headExtra = '',
  rail = false,
  noindex = false
}) {
  const canonical = new URL(path, SITE.url).href;
  const styles = ['/css/main.css', ...css, '/css/responsive.css'];
  const jsonLd = schema
    ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="${SITE.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">${
  noindex
    ? // Filter variants of one game: real pages for players, but near-identical
      // to each other, so they are deliberately kept out of the index rather
      // than submitted as separate thin content.
      '\n<meta name="robots" content="noindex, follow">'
    : ''
}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
${styles.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n')}
<script>
/* Applied before first paint so the page never flashes the wrong theme. */
(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
</script>
${analyticsHead()}
${adsenseHead()}
${headExtra}
${jsonLd}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header()}
<main id="main">
${
  rail && adRail()
    ? `<div class="wrap has-rail">
<div class="has-rail-main">
${body}
</div>
${adRail()}
</div>`
    : body
}
</main>
${footer()}
<script type="module" src="/js/app.js"></script>
</body>
</html>
`;
}

export function breadcrumbs(trail) {
  const parts = trail
    .map((item, i) =>
      i === trail.length - 1
        ? `<span aria-current="page">${esc(item.label)}</span>`
        : `<a href="${item.href}">${esc(item.label)}</a><span aria-hidden="true">›</span>`
    )
    .join(' ');
  return `<nav class="wrap breadcrumbs" aria-label="Breadcrumb">${parts}</nav>`;
}

export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: new URL(item.href || '#', SITE.url).href
    }))
  };
}

export { ROOT };
