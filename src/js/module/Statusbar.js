/**
 * Statusbar.js - Displays word count, character count and resize handle
 * Inspired by Summernote's Statusbar module — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';
import { debounce } from '../core/func.js';

/**
 * Count words in a string, CJK-aware.
 * Uses Intl.Segmenter (Chromium 87+, Firefox 125+, Safari 17+) when available,
 * falling back to a simple whitespace split for older environments.
 * @param {string} text
 * @returns {number}
 */
function _countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
    let count = 0;
    for (const seg of segmenter.segment(trimmed)) {
      if (seg.isWordLike) count++;
    }
    return count;
  }
  // Fallback: split on whitespace
  return trimmed.split(/\s+/).length;
}

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
    this.el = createElement('div', { class: 'an-statusbar' });

    // Resize handle
    if (this.options.resizable !== false) {
      const handle = createElement('div', {
        class: 'an-resize-handle',
        title: 'Resize editor',
        'aria-hidden': 'true',
      });
      this._bindResize(handle);
      this.el.appendChild(handle);
    }

    // Counters
    this._wordCountEl = createElement('span', { class: 'an-word-count' });
    this._charCountEl = createElement('span', { class: 'an-char-count' });
    const info = createElement('div', { class: 'an-status-info' });
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

    const applyDelta = (clientY) => {
      const delta = clientY - startY;
      const minH = this.options.minHeight || 100;
      containerEl.style.height = `${Math.max(minH, startH + delta)}px`;
    };

    // Mouse drag
    const onMouseMove = (event) => applyDelta(event.clientY);

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

    // Touch drag
    const onTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch) { event.preventDefault(); applyDelta(touch.clientY); }
    };

    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      this._dragDisposers = null;
    };

    const onTouchStart = (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      startY = touch.clientY;
      startH = containerEl.offsetHeight;
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
      this._dragDisposers = [
        () => document.removeEventListener('touchmove', onTouchMove),
        () => document.removeEventListener('touchend', onTouchEnd),
      ];
    };

    const d1 = on(handle, 'mousedown', onMouseDown);
    const d2 = on(handle, 'touchstart', onTouchStart);
    this._disposers.push(d1, d2);
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
    const words = _countWords(text);
    const chars = text.replace(/\n/g, '').length;
    this._wordCountEl.textContent = `Words: ${words}`;
    this._charCountEl.textContent = `Chars: ${chars}`;
  }
}
