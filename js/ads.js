/**
 * ads.js — creates and activates AdSense units at the right moment.
 *
 * The build emits empty `.ad-container[data-ad-slot-id]` boxes rather than
 * `<ins>` tags, and this module fills them in. Three problems that solves:
 *
 * 1. `adsbygoogle.push({})` fills the next *unfilled* <ins> in document order —
 *    you cannot target a specific element. So a unit that is hidden at the
 *    current breakpoint (the side rail on a phone) would silently swallow the
 *    push meant for the visible in-content unit. Hidden containers never get an
 *    <ins> at all, so they cannot take someone else's ad.
 *
 * 2. An <ins> inside a display:none container measures zero width, fails to
 *    fill, and usually never recovers once shown. The game pages' unit lives on
 *    the results screen, which starts hidden.
 *
 * 3. Units below the fold are only requested as they approach the viewport.
 */

const CLIENT_META = 'adsbygoogle.js?client=';
const PUSHED = 'adPushed';

/** The publisher id, read back from the loader script the build inserted. */
function client() {
  const script = document.querySelector(`script[src*="${CLIENT_META}"]`);
  return script ? new URL(script.src).searchParams.get('client') : null;
}

function isRenderable(node) {
  // offsetParent is null inside display:none subtrees; a zero-width box
  // cannot produce a valid ad request.
  return node.offsetWidth > 0 && node.offsetParent !== null;
}

function createUnit(container, publisher) {
  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'block';
  ins.dataset.adClient = publisher;
  ins.dataset.adSlot = container.dataset.adSlotId;
  ins.dataset.adFormat = 'auto';
  ins.dataset.fullWidthResponsive = 'true';
  container.appendChild(ins);
  return ins;
}

export function initAds() {
  const publisher = client();
  if (!publisher) return;

  const containers = Array.from(document.querySelectorAll('[data-ad-slot-id]'));
  if (!containers.length) return;

  const activate = (container) => {
    if (container.dataset[PUSHED]) return;
    if (!isRenderable(container)) return; // wrong breakpoint, or not shown yet
    container.dataset[PUSHED] = 'true';
    createUnit(container, publisher);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* Blocked, offline, or no fill — the reserved space just stays empty. */
    }
  };

  if (!('IntersectionObserver' in window)) {
    containers.forEach(activate);
    return;
  }

  // The margin gives each unit a head start so it is filled before it scrolls
  // into view. It also covers the hidden results screen: the observer cannot
  // fire until that section is shown and laid out, which is exactly when the
  // ad becomes valid.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        activate(entry.target);
        if (entry.target.dataset[PUSHED]) observer.unobserve(entry.target);
      }
    },
    { rootMargin: '300px 0px' }
  );

  containers.forEach((container) => observer.observe(container));
}
