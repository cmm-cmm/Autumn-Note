/**
 * Fullscreen.js - Toggles the editor in/out of fullscreen mode
 * Inspired by Summernote's Fullscreen module
 */

import { on } from '../core/dom.js';
import { key, isKey } from '../core/key.js';

export class Fullscreen {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    this._active = false;
    this._disposers = [];
    /** @type {string} cached editable height before fullscreen */
    this._prevHeight = '';
  }

  initialize() {
    // Press Escape to exit fullscreen
    const d = on(document, 'keydown', (event) => {
      if (this._active && isKey(event, key.ESCAPE)) {
        this.deactivate();
      }
    });
    this._disposers.push(d);
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._active) this.deactivate();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  toggle() {
    if (this._active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  isActive() {
    return this._active;
  }

  activate() {
    if (this._active) return;
    const container = this.context.layoutInfo.container;
    const editable = this.context.layoutInfo.editable;
    this._prevHeight = editable.style.height;

    container.classList.add('asn-fullscreen');
    editable.style.height = '';
    document.body.style.overflow = 'hidden';
    this._active = true;
    this.context.invoke('toolbar.refresh');
  }

  deactivate() {
    if (!this._active) return;
    const container = this.context.layoutInfo.container;
    const editable = this.context.layoutInfo.editable;

    container.classList.remove('asn-fullscreen');
    editable.style.height = this._prevHeight;
    document.body.style.overflow = '';
    this._active = false;
    this.context.invoke('toolbar.refresh');
  }
}
