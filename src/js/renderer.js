/**
 * renderer.js - Builds the editor DOM structure
 * Inspired by Summernote's renderer.js
 */

import { createElement } from './core/dom.js';
import { sanitiseHTML } from './core/sanitise.js';

/**
 * Renders the editor layout around the original element.
 *
 * Structure:
 *   <div class="an-container">
 *     <div class="an-toolbar">...</div>
 *     <div class="an-editable" contenteditable="true">...</div>
 *     <div class="an-statusbar">...</div>
 *   </div>
 *
 * @param {HTMLElement} targetEl - the original element to replace/wrap
 * @param {import('./settings.js').AsnOptions} options
 * @returns {{ container: HTMLElement, editable: HTMLElement }}
 */
export function renderLayout(targetEl, options) {
  const container = createElement('div', { class: 'an-container' });

  // Editable area
  const editable = createElement('div', {
    class: 'an-editable',
    contenteditable: options.readOnly ? 'false' : 'true',
    spellcheck: String(options.spellcheck !== false),
    'aria-multiline': 'true',
    'aria-label': 'Rich text editor',
    role: 'textbox',
  });

  // Restore auto-saved content when available; fall back to element content
  let initialContent = '';
  if (options.autoSave && options.autoSaveKey) {
    try { initialContent = localStorage.getItem(options.autoSaveKey) || ''; } catch (_) { void _; }
  }
  if (!initialContent) {
    initialContent = targetEl.tagName === 'TEXTAREA'
      ? ((/** @type {HTMLTextAreaElement} */ (targetEl)).value || '').trim()
      : (targetEl.innerHTML || '').trim();
  }
  editable.innerHTML = sanitiseHTML(initialContent, { allowIframes: true, iframeHosts: options.iframeHosts });

  // Apply default font family so the editable renders in the configured font
  const defaultFont = options.defaultFontFamily || options.fontFamilies?.[0];
  if (defaultFont) {
    editable.style.fontFamily = defaultFont;
  }

  // Apply default font size so the size dropdown shows the correct value on startup
  if (options.defaultFontSize) {
    editable.style.fontSize = options.defaultFontSize;
  }

  // Apply height options.
  // `height` sets the initial visible height (takes priority).
  // `minHeight` is the drag-resize floor — only applied when no explicit `height` is given.
  if (options.height) {
    editable.style.minHeight = `${options.height}px`;
  } else if (options.minHeight) {
    editable.style.minHeight = `${options.minHeight}px`;
  }
  if (options.maxHeight) {
    editable.style.maxHeight = `${options.maxHeight}px`;
  }

  container.appendChild(editable);

  // Read-only mode
  if (options.readOnly) {
    container.classList.add('an-disabled');
    editable.querySelectorAll('ul.an-checklist input[type="checkbox"]').forEach((cb) => {
      cb.setAttribute('disabled', '');
    });
  }

  // Text direction
  if (options.direction === 'rtl') {
    editable.setAttribute('dir', 'rtl');
    container.classList.add('an-dir-rtl');
  }

  // Theme, colours, z-index offset, sticky/overflow toolbar modes
  applyAppearance(container, null, options);

  // Hide the original element; keep it in DOM for form submission
  targetEl.style.display = 'none';
  targetEl.after(container);

  return { container, editable };
}

const THEME_CLASSES = ['an-theme-dark', 'an-theme-auto'];

/**
 * Turns a `themeVars` key into a custom property name: `primary` and
 * `--an-primary` both become `--an-primary`.
 * @param {string} key
 * @returns {string}
 */
function _themeVarName(key) {
  return key.startsWith('--') ? key : `--an-${key}`;
}

/**
 * Creates the element an editor mounts its floating UI into (dialogs,
 * tooltips, popovers, menus). One per editor, so the editor's theme and
 * colours reach its floating UI without touching `document.body`.
 *
 * `display: contents` (see .an-portal in the stylesheet) keeps it out of
 * layout; its children still position against the viewport.
 * @param {import('./settings.js').AsnOptions} options
 * @returns {HTMLElement}
 */
export function createPortal(options) {
  const portal = createElement('div', { class: 'an-portal', 'data-an-portal': '' });
  resolvePopupContainer(options.popupContainer).appendChild(portal);
  return portal;
}

/**
 * Resolves the `popupContainer` option to a node that can hold the portal.
 * Falls back to `document.body` for a missing selector or an invalid value.
 * @param {string|Element|ShadowRoot|null|undefined} value
 * @returns {Element|ShadowRoot}
 */
export function resolvePopupContainer(value) {
  if (typeof value === 'string' && value) {
    const found = document.querySelector(value);
    if (found) return found;
    console.warn(`[AutumnNote] popupContainer "${value}" matched nothing; using document.body.`);
  } else if (value && typeof (/** @type {any} */ (value)).appendChild === 'function') {
    return /** @type {Element|ShadowRoot} */ (value);
  }
  return document.body;
}

/**
 * Applies the look-and-feel options to the container and, when given, the
 * portal. Idempotent — it first clears what it set last time — so
 * updateOptions() can call it again after any of these options change.
 *
 * Covers: theme, themeVars, focusColor, zIndexOffset, toolbarOverflow,
 * stickyToolbar, stickyToolbarOffset.
 * @param {HTMLElement} container
 * @param {HTMLElement|null} portal
 * @param {import('./settings.js').AsnOptions} options
 */
export function applyAppearance(container, portal, options) {
  const targets = portal ? [container, portal] : [container];
  const themeClass = options.theme === 'dark' ? 'an-theme-dark'
    : options.theme === 'auto' ? 'an-theme-auto' : null;

  for (const el of targets) {
    el.classList.remove(...THEME_CLASSES);
    if (themeClass) el.classList.add(themeClass);

    // Clear every custom property this function owns, then set the current ones.
    for (const prop of Array.from(el.style)) {
      if (prop.startsWith('--an-')) el.style.removeProperty(prop);
    }
    const vars = options.themeVars;
    if (vars && typeof vars === 'object') {
      for (const [key, value] of Object.entries(vars)) {
        if (typeof value === 'string' || typeof value === 'number') {
          el.style.setProperty(_themeVarName(key), String(value));
        }
      }
    }
    if (options.focusColor) el.style.setProperty('--an-focus-color', options.focusColor);
    const zOffset = Number(options.zIndexOffset) || 0;
    if (zOffset) el.style.setProperty('--an-z-offset', String(Math.trunc(zOffset)));
  }

  container.classList.toggle('an-toolbar-overflow-scroll', options.toolbarOverflow === 'scroll');
  container.classList.toggle('an-sticky-toolbar', Boolean(options.stickyToolbar));
  if (options.stickyToolbar && options.stickyToolbarOffset) {
    container.style.setProperty('--an-sticky-top', `${options.stickyToolbarOffset}px`);
  }
}
