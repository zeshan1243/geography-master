/**
 * share.js — one reusable "share your result" control, wired onto any
 * results screen with a `[data-share]` button and a `[data-share-panel]`.
 *
 * Every game engine (game.js, recall.js, landlocked.js, topLanguages.js)
 * calls this the same way rather than each building its own share logic.
 * On a device with the native Web Share sheet (`navigator.share`, mostly
 * mobile), that is used directly. Everywhere else, a small panel of direct
 * links opens instead — WhatsApp, X, Facebook, Reddit and copy-link, the
 * same set the site's own roadmap calls for.
 */

/** The site's own name, read from the header rather than hardcoded here. */
export function siteName() {
  return document.querySelector('.brand-full')?.textContent?.trim() || 'World Geography Games';
}

function buildLinks({ text, url }) {
  const shareText = `${text} ${url}`;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
  };
}

/**
 * @param {HTMLElement} root the game's own root element (scopes the query so
 *   two share controls on one page — unlikely, but cheap to guard — never
 *   cross-wire)
 * @param {() => {title: string, text: string, url: string}} getPayload
 *   called fresh on every click, since the score is only known once a round
 *   finishes
 */
export function wireShare(root, getPayload) {
  const btn = root.querySelector('[data-share]');
  const panel = root.querySelector('[data-share-panel]');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const payload = getPayload();
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return; // the user closed the sheet
        // Any other failure (unsupported payload, permission issue) falls
        // through to the manual panel below instead of failing silently.
      }
    }
    if (panel) panel.hidden = !panel.hidden;
  });

  panel?.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-share-action]');
    if (!target) return;
    const action = target.dataset.shareAction;
    const payload = getPayload();

    if (action === 'copy') {
      try {
        await navigator.clipboard.writeText(payload.url);
        const original = target.textContent;
        target.textContent = 'Copied!';
        setTimeout(() => {
          target.textContent = original;
        }, 1500);
      } catch {
        /* Clipboard access blocked — nothing more useful to do here. */
      }
      return;
    }

    const link = buildLinks(payload)[action];
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  });
}
