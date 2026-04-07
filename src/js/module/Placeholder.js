/**
 * Placeholder.js - Shows placeholder text when the editor is empty
 * Inspired by Summernote's Placeholder module
 */

import { on } from '../core/dom.js';

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
    // Strip ZWS (\u200B) cursor anchors used by checklist/icon insertion in
    // addition to regular whitespace before deciding if the editor is empty.
    // Without this, a freshly-created checklist item or icon leaves a ZWS in
    // the DOM that causes the placeholder to overlap real content (A-1).
    const hasText = editable.textContent.replace(/\u200B/g, '').trim().length > 0;
    const isEmpty = !hasText &&
      !editable.querySelector('img, table, hr, .an-video-wrapper');
    editable.classList.toggle('an-placeholder', isEmpty && !isFocused);
  }
}
