/**
 * sanitise.js - Shared HTML and URL sanitisation utilities
 *
 * Single source of truth used by Editor, Clipboard, Codeview, and renderer.
 * DOM-parser based — no regex-based stripping of HTML (avoids bypass tricks).
 */

/**
 * Tags that are unconditionally removed from editor content.
 *
 * Beyond the obvious script hosts this covers two SVG/MathML-specific classes:
 *
 * - SMIL animation (`animate`, `set`, `animateTransform`, `animateMotion`)
 *   can rewrite an attribute *after* sanitisation finishes, so
 *   `<svg><a><animate attributeName="href" values="javascript:…">` survives an
 *   attribute-level filter untouched and still navigates on click. The editor
 *   only ever emits static `<svg>` icons, so animation is pure attack surface.
 *
 * - `mglyph` / `malignmark` / `annotation-xml` are HTML integration points
 *   inside the MathML namespace. They make the parser switch namespaces
 *   mid-tree, which is what lets a crafted fragment re-parse into different
 *   markup than it serialised from (mXSS). The rest of MathML is left alone so
 *   pasted formulae survive.
 */
const PROHIBITED_TAGS = [
  'script', 'style', 'iframe', 'object', 'embed', 'form', 'base', 'template',
  'link', 'meta', 'noscript', 'portal', 'frame', 'frameset', 'applet',
  'animate', 'set', 'animatetransform', 'animatemotion',
  'mglyph', 'malignmark', 'annotation-xml',
];

/** Tags whose element wrapper is stripped but content (child nodes) is preserved. */
const UNWRAP_TAGS = new Set(['button']);

/** Attributes whose values must be sanitised as URLs. */
const URL_ATTRS = ['href', 'src', 'action', 'formaction', 'xlink:href', 'poster', 'background', 'srcset'];

/**
 * URL attributes that address media rather than navigation, so they are
 * validated against SAFE_MEDIA_PROTOCOLS regardless of which element carries
 * them (unlike `src`, whose meaning depends on the owning tag).
 */
const MEDIA_URL_ATTRS = new Set(['poster', 'background', 'srcset']);

/**
 * Attributes removed outright: the editor never emits them and their only
 * effect is an outbound request the author did not ask for. `ping` fires a
 * POST beacon to arbitrary hosts when a link is clicked.
 */
const BEACON_ATTRS = new Set(['ping']);

/** Inline style properties the editor's own toolbar/table features persist on saved content. */
const ALLOWED_STYLE_PROPS = new Set([
  'color', 'background-color', 'font-size', 'line-height',
  'text-align', 'vertical-align',
  'width', 'min-width', 'height', 'min-height',
  'border-width', 'border-style', 'border-color', 'padding',
]);

/**
 * Value patterns that are never safe regardless of property.
 * `image-set()` and `src()` are covered alongside `url()` — all three fetch an
 * external resource, so allowing them would let pasted content phone home.
 */
const DANGEROUS_STYLE_VALUE_RE = /url\s*\(|image-set\s*\(|src\s*\(|expression\s*\(|@import|javascript:|vbscript:|behavior\s*:|-moz-binding/i;

/** Trusted hosts for iframe embeds when allowIframes is enabled. */
const TRUSTED_IFRAME_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'm.youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
]);

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_MEDIA_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);
const SAFE_RASTER_DATA_RE = /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp);base64,[a-z0-9+/=\s]+$/i;
const URL_BASE = 'https://autumnnote.invalid/';

/**
 * Produce a sanitized HTML string with dangerous elements and attributes removed.
 *
 * Removes disallowed tags and wrappers, strips event-handler attributes, rejects
 * `javascript:`/`vbscript:` URLs and most `data:` URIs, restricts iframe `src`
 * to trusted hosts when enabled, and permits only checklist checkboxes as inputs.
 *
 * @param {string} html - HTML fragment to sanitize.
 * @param {Object} [options]
 * @param {boolean} [options.allowIframes=false] - If true, `iframe` elements are not removed but their `src` is restricted to trusted hosts and `srcdoc` is removed.
 * @returns {string} The sanitized HTML fragment.
 */
export function sanitiseHTML(html, { allowIframes = false } = {}) {
  const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');

  // Single querySelectorAll pass — collect all elements once to avoid
  // repeated full-tree traversals for each category of check.
  const allElements = Array.from(doc.querySelectorAll('*'));

  // Build the prohibited tag set for fast O(1) lookup
  const prohibited = new Set(
    allowIframes ? PROHIBITED_TAGS.filter((t) => t !== 'iframe') : PROHIBITED_TAGS,
  );

  for (const el of allElements) {
    const tag = el.tagName.toLowerCase();

    // Unwrap elements whose wrapper is unsafe but whose content should be kept
    if (UNWRAP_TAGS.has(tag)) {
      el.replaceWith(...el.childNodes);
      continue;
    }

    // Remove outright dangerous elements
    if (prohibited.has(tag)) {
      el.remove();
      continue;
    }

    // Invalid embeds are removed rather than retained as empty iframes.
    if (tag === 'iframe') {
      const src = el.getAttribute('src');
      if (!src || !isTrustedIframeSrc(src)) {
        el.remove();
        continue;
      }
    }

    // Strip dangerous attributes
    for (const attr of Array.from(el.attributes)) {
      // Remove all event handlers (onclick, onload, onerror, …)
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
        continue;
      }
      // Filter the style attribute down to an allowlisted set of safe
      // properties (see ALLOWED_STYLE_PROPS) — not a blanket strip, since
      // the editor's own toolbar/table features persist inline styles
      // (text color/highlight, font size, line height, table alignment/
      // sizing/borders) that must survive sanitisation.
      if (attr.name === 'style') {
        const cleaned = sanitiseStyleValue(attr.value);
        if (cleaned) el.setAttribute('style', cleaned);
        else el.removeAttribute('style');
        continue;
      }
      // Drop tracking-beacon attributes outright
      if (BEACON_ATTRS.has(attr.name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      // Sanitise URL attributes
      if (URL_ATTRS.includes(attr.name)) {
        const val = attr.value.trim();
        const isMediaSource = MEDIA_URL_ATTRS.has(attr.name) ||
          (attr.name === 'src' && ['IMG', 'VIDEO', 'AUDIO', 'SOURCE'].includes(el.tagName));
        const allowData = el.tagName === 'IMG';
        const safe = attr.name === 'srcset'
          ? isSafeSrcset(val, { allowData })
          : isSafeUrl(val, { media: isMediaSource, allowData });
        if (!safe) {
          el.removeAttribute(attr.name);
          continue;
        }
      }
      // Strip iframe HTML-injection vectors; limit src to trusted hosts
      if (el.tagName === 'IFRAME') {
        if (attr.name === 'srcdoc') {
          el.removeAttribute(attr.name);
          continue;
        }
        if (attr.name === 'src' && !isTrustedIframeSrc(attr.value)) {
          el.removeAttribute(attr.name);
        }
      }
    }

    if (tag === 'a' && el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer');
    }

    // Allow only input[type="checkbox"] inside ul.an-checklist li
    if (tag === 'input') {
      const inChecklist = el.closest('ul.an-checklist') !== null &&
                          el.closest('li') !== null;
      if (!inChecklist || el.getAttribute('type') !== 'checkbox') {
        el.remove();
      } else {
        for (const attr of Array.from(el.attributes)) {
          if (!['type', 'checked', 'contenteditable'].includes(attr.name)) {
            el.removeAttribute(attr.name);
          }
        }
      }
    }
  }

  return doc.body.innerHTML;
}

/**
 * Filters a style attribute value down to an allowlisted set of CSS
 * properties (ALLOWED_STYLE_PROPS), dropping any declaration whose value
 * contains a dangerous construct — url(), expression(), an "import" rule,
 * javascript:/vbscript:, IE behavior/-moz-binding — regardless of property.
 * @param {string} value
 * @returns {string} The filtered declaration list, or '' if nothing survives.
 */
function sanitiseStyleValue(value) {
  const kept = [];
  for (const decl of (value || '').split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) continue;
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    if (DANGEROUS_STYLE_VALUE_RE.test(val)) continue;
    kept.push(`${prop}: ${val}`);
  }
  return kept.join('; ');
}

/**
 * Validates every candidate URL in a `srcset` attribute.
 *
 * Per the HTML srcset grammar a candidate URL is a run of non-whitespace
 * characters — commas may appear *inside* it, which is why `data:` URLs work
 * there — optionally followed by a width (`300w`) or density (`2x`) descriptor.
 * Splitting on whitespace and skipping descriptor tokens therefore yields the
 * URL set. Anything unparseable makes the whole attribute fail, since a
 * partially-trusted candidate list is not something we can express.
 *
 * @param {string} value
 * @param {{ allowData?: boolean }} [options]
 * @returns {boolean}
 */
function isSafeSrcset(value, { allowData = false } = {}) {
  const tokens = (value || '').trim().split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (/^[\d.]+[xw],?$/i.test(token)) continue; // width/density descriptor
    const url = token.replace(/,+$/, ''); // trailing comma = candidate separator
    if (!url) continue;
    if (!isSafeUrl(url, { media: true, allowData })) return false;
  }
  return true;
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
 * @param {{ allowData?: boolean, media?: boolean }} [opts]
 * @returns {string|null} The original URL if safe, null if rejected.
 */
export function sanitiseUrl(url, { allowData = false, media = allowData } = {}) {
  const trimmed = (url || '').trim();
  if (!trimmed && url == null) return null;
  return isSafeUrl(trimmed, { media, allowData }) ? url : null;
}

/**
 * Validate a URL using the browser URL parser so ASCII whitespace/control
 * characters cannot disguise a dangerous protocol (for example java\nscript:).
 * @param {string} value
 * @param {{media?: boolean, allowData?: boolean}} [options]
 * @returns {boolean}
 */
function isSafeUrl(value, { media = false, allowData = false } = {}) {
  const trimmed = (value || '').trim();
  if (!trimmed) return true;
  if (allowData && SAFE_RASTER_DATA_RE.test(trimmed)) return true;

  try {
    const parsed = new URL(trimmed, URL_BASE);
    const protocols = media ? SAFE_MEDIA_PROTOCOLS : SAFE_LINK_PROTOCOLS;
    return protocols.has(parsed.protocol);
  } catch {
    return false;
  }
}
