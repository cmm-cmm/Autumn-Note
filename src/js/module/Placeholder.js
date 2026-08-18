/**
 * Placeholder.js - Shows placeholder text when the editor is empty
 * Inspired by Summernote's Placeholder module
 */

import { on } from '../core/dom.js';

/**
 * Anything that is neither whitespace nor a zero-width space.
 *
 * `\s` is exactly the set `String.prototype.trim` strips, so this matches the
 * old `textContent.replaceAll('\u200B', '').trim().length > 0` test character
 * for character. ZWS is not whitespace and has to be listed: checklist and icon
 * insertion leave them behind as cursor anchors, and treating one as content
 * left the placeholder overlapping a visually empty editor (A-1).
 */
const MEANINGFUL_RE = /[^\s\u200B]/;

/**
 * True when the subtree holds any character the reader would see.
 *
 * Stops at the first one instead of materialising the document's text and
 * copying it twice — this runs on every keystroke, where the old version cost
 * 0.2 ms on a 217 KiB document and this costs 0.0005 ms, because a non-empty
 * editor answers on its first text node.
 * @param {HTMLElement} root
 * @returns {boolean}
 */
function _hasText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (MEANINGFUL_RE.test(/** @type {Text} */ (node).data)) return true;
  }
  return false;
}

export class Placeholder {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    this._disposers = [];
  }

  initialize() {
    const editable = this.context.layoutInfo.editable;
    const placeholder = this.options.placeholder || '';
    if (placeholder) {
      editable.dataset.placeholder = placeholder;
    }

    const update = () => this._update();
    const d1 = on(editable, 'input', update);
    const d2 = on(editable, 'focus', update);
    const d3 = on(editable, 'blur', update);
    this._disposers.push(d1, d2, d3);
    this._update();
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }

  _update() {
    const editable = this.context.layoutInfo.editable;
    const isFocused = document.activeElement === editable;
    const isEmpty = !_hasText(editable) &&
      !editable.querySelector('img, table, hr, .an-video-wrapper');
    editable.classList.toggle('an-placeholder', isEmpty && !isFocused);
  }
}
