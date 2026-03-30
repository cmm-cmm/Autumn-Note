/**
 * Statusbar.js - Displays word count, character count and resize handle
 * Inspired by Summernote's Statusbar module — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';
import { debounce } from '../core/func.js';

export class Statusbar {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    /** @type {HTMLElement|null} */
    this.el = null;
    this._disposers = [];
    /** @type {HTMLElement|null} */
    this._wordCountEl = null;
    /** @type {HTMLElement|null} */
    this._charCountEl = null;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this.el = createElement('div', { class: 'asn-statusbar' });

    // Resize handle
    if (this.options.resizeable !== false) {
      const handle = createElement('div', {
        class: 'asn-resize-handle',
        title: 'Resize editor',
        'aria-hidden': 'true',
      });
      this._bindResize(handle);
      this.el.appendChild(handle);
    }

    // Counters
    this._wordCountEl = createElement('span', { class: 'asn-word-count' });
    this._charCountEl = createElement('span', { class: 'asn-char-count' });
    const info = createElement('div', { class: 'asn-status-info' });
    info.appendChild(this._wordCountEl);
    info.appendChild(this._charCountEl);
    this.el.appendChild(info);

    this._bindContentEvents();
    this.update();
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._dragDisposers) {
      this._dragDisposers.forEach((d) => d());
      this._dragDisposers = null;
    }
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
  }

  // ---------------------------------------------------------------------------
  // Resize logic
  // ---------------------------------------------------------------------------

  _bindResize(handle) {
    let startY = 0;
    let startH = 0;
    // Resize the container (flex column parent) so that the editable — which
    // has flex:1 / flex-basis:0 — automatically fills the remaining space.
    // Setting height directly on a flex:1 item has no effect because the flex
    // algorithm ignores the height property when flex-basis is non-auto.
    const containerEl = this.context.layoutInfo.container;

    const onMouseMove = (event) => {
      const delta = event.clientY - startY;
      const newHeight = Math.max(120, startH + delta);
      containerEl.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this._dragDisposers = null;
    };

    const onMouseDown = (event) => {
      startY = event.clientY;
      startH = containerEl.offsetHeight;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      // Track drag-phase listeners so destroy() can remove them mid-drag
      this._dragDisposers = [
        () => document.removeEventListener('mousemove', onMouseMove),
        () => document.removeEventListener('mouseup', onMouseUp),
      ];
      event.preventDefault();
    };

    const d1 = on(handle, 'mousedown', onMouseDown);
    this._disposers.push(d1);
  }

  // ---------------------------------------------------------------------------
  // Counter update
  // ---------------------------------------------------------------------------

  _bindContentEvents() {
    const editable = this.context.layoutInfo.editable;
    const updateDebounced = debounce(() => this.update(), 200);
    const d = on(editable, 'input', updateDebounced);
    this._disposers.push(d);
  }

  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const editable = this.context.layoutInfo.editable;
    const text = editable.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    this._wordCountEl.textContent = `Words: ${words}`;
    this._charCountEl.textContent = `Chars: ${chars}`;
  }
}
