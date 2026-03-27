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
    const isEmpty = !editable.textContent.trim() && !editable.querySelector('img, table, hr');
    editable.classList.toggle('asn-placeholder', isEmpty);
  }
}
