/**
 * sanitise.js - Shared HTML and URL sanitisation utilities
 *
 * Single source of truth used by Editor, Clipboard, Codeview, and renderer.
 * DOM-parser based — no regex-based stripping of HTML (avoids bypass tricks).
 */

/** Tags that are unconditionally removed from editor content. */
const PROHIBITED_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'];

/** Attributes whose values must be sanitised as URLs. */
const URL_ATTRS = ['href', 'src', 'action', 'formaction'];

/** Trusted hosts for iframe embeds when allowIframes is enabled. */
const TRUSTED_IFRAME_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'm.youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
]);

/**
 * Sanitises an HTML string by removing dangerous elements and attributes.
 * Uses DOMParser so the sanitisation follows normal browser parsing rules —
 * no regex shortcuts that can be bypassed by encoding tricks.
 *
 * - Strips PROHIBITED_TAGS (script, style, iframe, object, embed, form, input, button)
 * - Removes all on* event-handler attributes
 * - Rejects javascript: and vbscript: URLs in URL attributes
 * - Rejects data: URIs everywhere except img[src] (base64 uploads)
 *
 * @param {string} html
 * @returns {string}
 */
export function sanitiseHTML(html, { allowIframes = false } = {}) {
  const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');

  // Remove outright dangerous elements (optionally preserve iframes for video embeds)
  const tags = allowIframes ? PROHIBITED_TAGS.filter((t) => t !== 'iframe') : PROHIBITED_TAGS;
  tags.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });

  // Strip dangerous attributes from remaining elements
  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      // Remove all event handlers (onclick, onload, onerror, …)
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }
      // Sanitise URL attributes
      if (URL_ATTRS.includes(attr.name)) {
        const val = attr.value.trim();
        // Block javascript: and vbscript: protocols
        if (/^(javascript|vbscript):/i.test(val)) {
          el.removeAttribute(attr.name);
          return;
        }
        // Allow data: URIs only on img[src] (base64 image uploads); block elsewhere
        if (/^data:/i.test(val) && !(attr.name === 'src' && el.tagName === 'IMG')) {
          el.removeAttribute(attr.name);
        }
      }

      // Strip iframe HTML-injection vectors and limit iframe src to trusted hosts.
      if (el.tagName === 'IFRAME') {
        if (attr.name === 'srcdoc') {
          el.removeAttribute(attr.name);
          return;
        }
        if (attr.name === 'src') {
          if (!isTrustedIframeSrc(attr.value)) {
            el.removeAttribute(attr.name);
          }
          return;
        }
      }
    });
  });

  return doc.body.innerHTML;
}

/**
 * Returns true if iframe src points to an approved video host.
 * Relative, protocol-relative and invalid URLs are rejected.
 * @param {string} src
 * @returns {boolean}
 */
function isTrustedIframeSrc(src) {
  const trimmed = (src || '').trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('//') || trimmed.startsWith('/')) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return false;
    return TRUSTED_IFRAME_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Sanitises a URL string, rejecting dangerous protocols.
 *
 * Blocked protocols: javascript:, vbscript:
 * Optionally blocked: data: (safe to allow for img/src base64 embeds)
 *
 * @param {string} url
 * @param {{ allowData?: boolean }} [opts]
 * @returns {string|null} The original URL if safe, null if rejected.
 */
export function sanitiseUrl(url, { allowData = false } = {}) {
  const trimmed = (url || '').trim();
  if (/^(javascript|vbscript):/i.test(trimmed)) return null;
  if (!allowData && /^data:/i.test(trimmed)) return null;
  return url;
}
