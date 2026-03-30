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
    editable.innerHTML = sanitiseHTML((targetEl.value || '').trim());
  } else {
    editable.innerHTML = sanitiseHTML((targetEl.innerHTML || '').trim());
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
