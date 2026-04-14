/**
 * Statusbar.js - Displays word count, character count and resize handle
 * Inspired by Summernote's Statusbar module — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';
import { debounce } from '../core/func.js';

// Cache the segmenter instance at module level to avoid per-call allocation
const _segmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'word' })
    : null;

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
  if (_segmenter) {
    let count = 0;
    for (const seg of _segmenter.segment(trimmed)) {
      if (seg.isWordLike) count++;
    }
    return count;
  }
  // Fallback: split on whitespace
  return trimmed.split(/\s+/).length;
}

/**
 * Toggles warning/exceeded CSS classes on a count element.
 * @param {HTMLElement} el
 * @param {number} current
 * @param {number} limit  0 = no limit
 */
function _applyLimitClass(el, current, limit) {
  if (!limit) {
    el.classList.remove('an-count-warn', 'an-count-exceeded');
    return;
  }
  if (current > limit) {
    el.classList.add('an-count-exceeded');
    el.classList.remove('an-count-warn');
  } else if (current >= limit * 0.9) {
    el.classList.add('an-count-warn');
    el.classList.remove('an-count-exceeded');
  } else {
    el.classList.remove('an-count-warn', 'an-count-exceeded');
  }
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
        title: this.context.locale.statusbar.resizeHandle,
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
      // Compute the true minimum: fixed elements (toolbar + statusbar) must fit
      // inside the container. Sum the offsetHeight of every child that is NOT
      // the editable area, then add a small floor so the editable stays visible.
      const MIN_EDITABLE = 40;
      const fixedH = Array.from(containerEl.children)
        .filter(child => !child.classList.contains('an-editable'))
        .reduce((sum, child) => sum + child.offsetHeight, 0);
      const trueMin = Math.max(this.options.minHeight || 100, fixedH + MIN_EDITABLE);
      containerEl.style.height = `${Math.max(trueMin, startH + delta)}px`;
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
      // Clear the editable's inline min-height so the flex layout can compress
      // it freely once the container has a fixed height. Without this, the
      // editable's min-height (set from options.height) overflows the container
      // when the user drags the handle to a size smaller than that value.
      this.context.layoutInfo.editable.style.minHeight = '';
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
      // Same as onMouseDown: clear editable min-height so flex can compress it
      this.context.layoutInfo.editable.style.minHeight = '';
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
    const maxWords = this.options.maxWords || 0;
    const maxChars = this.options.maxChars || 0;

    const LS = this.context.locale.statusbar;
    this._wordCountEl.textContent = maxWords
      ? LS.wordsLimit(words, maxWords)
      : LS.words(words);
    this._charCountEl.textContent = maxChars
      ? LS.charsLimit(chars, maxChars)
      : LS.chars(chars);

    // Apply warning / exceeded styles
    _applyLimitClass(this._wordCountEl, words, maxWords);
    _applyLimitClass(this._charCountEl, chars, maxChars);
  }

  /**
   * Returns the current word count of the editor content.
   * @returns {number}
   */
  getWordCount() {
    const editable = this.context.layoutInfo.editable;
    return _countWords(editable.innerText || '');
  }

  /**
   * Returns the current character count (excluding newlines) of the editor content.
   * @returns {number}
   */
  getCharCount() {
    const editable = this.context.layoutInfo.editable;
    return ((editable.innerText || '').replace(/\n/g, '')).length;
  }
}
