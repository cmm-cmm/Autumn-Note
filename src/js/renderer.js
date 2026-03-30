/**
 * renderer.js - Builds the editor DOM structure
 * Inspired by Summernote's renderer.js
 */

import { createElement } from './core/dom.js';

/**
 * Applies a basic sanitisation pass identical to Editor._sanitise, used
 * when setting the initial innerHTML from the original element so that
 * pre-loaded content is never trusted without inspection.
 * @param {string} html
 * @returns {string}
 */
function sanitiseInitialHTML(html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  ['script', 'style', 'iframe', 'object', 'embed', 'form'].forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });
  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('on')) { el.removeAttribute(attr.name); return; }
      if (['href', 'src', 'action', 'formaction'].includes(attr.name)) {
        const val = attr.value.trim();
        if (/^javascript:/i.test(val)) { el.removeAttribute(attr.name); return; }
        if (/^data:/i.test(val) && !(attr.name === 'src' && el.tagName === 'IMG')) {
          el.removeAttribute(attr.name);
        }
      }
    });
  });
  return doc.body.innerHTML;
}

/**
 * Renders the editor layout around the original element.
 *
 * Structure:
 *   <div class="asn-container">
 *     <div class="asn-toolbar">...</div>
 *     <div class="asn-editable" contenteditable="true">...</div>
 *     <div class="asn-statusbar">...</div>
 *   </div>
 *
 * @param {HTMLElement} targetEl - the original element to replace/wrap
 * @param {import('./settings.js').AsnOptions} options
 * @returns {{ container: HTMLElement, editable: HTMLElement }}
 */
export function renderLayout(targetEl, options) {
  const container = createElement('div', { class: 'asn-container' });

  // Editable area
  const editable = createElement('div', {
    class: 'asn-editable',
    contenteditable: 'true',
    spellcheck: 'true',
    'aria-multiline': 'true',
    'aria-label': 'Rich text editor',
    role: 'textbox',
  });

  // Set initial content from original element (sanitised)
  if (targetEl.tagName === 'TEXTAREA') {
    editable.innerHTML = sanitiseInitialHTML((targetEl.value || '').trim());
  } else {
    editable.innerHTML = sanitiseInitialHTML((targetEl.innerHTML || '').trim());
  }

  // Apply default font family so the editable renders in the configured font
  const defaultFont = options.defaultFontFamily || (options.fontFamilies && options.fontFamilies[0]);
  if (defaultFont) {
    editable.style.fontFamily = defaultFont;
  }

  // Apply height options
  if (options.height) {
    editable.style.minHeight = `${options.height}px`;
  }
  if (options.minHeight) {
    editable.style.minHeight = `${options.minHeight}px`;
  }
  if (options.maxHeight) {
    editable.style.maxHeight = `${options.maxHeight}px`;
  }

  container.appendChild(editable);

  // Hide the original element; keep it in DOM for form submission
  targetEl.style.display = 'none';
  targetEl.insertAdjacentElement('afterend', container);

  return { container, editable };
}
