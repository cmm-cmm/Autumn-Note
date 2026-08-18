/**
 * Statusbar.js - Displays word count, character count and resize handle
 * Inspired by Summernote's Statusbar module — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';

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
 * Elements that start a new line of text. Used to join content the way the
 * reader sees it: `textContent` glues `<p>hello</p><p>world</p>` into
 * "helloworld", which any word counter then reports as one word.
 */
const BLOCK_TAGS = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BR', 'DD', 'DIV', 'DL', 'DT',
  'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4',
  'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION',
  'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
]);

/**
 * Appends `node`'s text into `lines` with a newline at every block boundary,
 * and into `flat` without one.
 *
 * `lines` is what `innerText` gives, minus `innerText`'s forced layout pass —
 * the counters run on every keystroke, so a reflow per character is not on.
 * `flat` is exactly what `textContent` gives, produced by the same walk so the
 * cold path does not traverse the subtree twice to get both.
 * @param {Node} node
 * @param {string[]} lines
 * @param {string[]} flat
 */
function _collectText(node, lines, flat) {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === 3) {
      const data = /** @type {Text} */ (child).data;
      lines.push(data);
      flat.push(data);
    } else if (child.nodeType === 1) {
      const block = BLOCK_TAGS.has(/** @type {Element} */ (child).tagName);
      if (block) lines.push('\n');
      _collectText(child, lines, flat);
      if (block) lines.push('\n');
    }
  }
}

/**
 * Both readings of a subtree's text: block-aware for counting words, flat for
 * matching `textContent`.
 * @param {Node} node
 * @returns {{ lines: string, flat: string }}
 */
function readText(node) {
  if (node.nodeType === 3) {
    const data = /** @type {Text} */ (node).data;
    return { lines: data, flat: data };
  }
  /** @type {string[]} */ const lines = [];
  /** @type {string[]} */ const flat = [];
  _collectText(node, lines, flat);
  return { lines: lines.join(''), flat: flat.join('') };
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
    /**
     * Per-child word/char counts, keyed on the child node itself so removed
     * nodes fall out with no bookkeeping.
     * @type {WeakMap<Node, {key: string, words: number, chars: number}>}
     */
    this._countCache = new WeakMap();
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
    this._wordCountEl = createElement('span', { class: 'an-word-count', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
    this._charCountEl = createElement('span', { class: 'an-char-count', 'aria-live': 'polite', 'aria-atomic': 'true' });
    const info = createElement('div', { class: 'an-status-info', 'aria-label': 'Editor statistics' });
    info.appendChild(this._wordCountEl);
    info.appendChild(this._charCountEl);
    this.el.appendChild(info);

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
    this.el?.remove();
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
        .reduce((sum, child) => sum + /** @type {HTMLElement} */ (child).offsetHeight, 0);
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

  // Editor.afterCommand() already invokes 'statusbar.update' on every native
  // 'input' event and after every toolbar/formatting command, so a separate
  // content listener here would just re-run this on the same keystroke.
  /**
   * Word and character counts for the current content.
   *
   * Counts are cached per top-level child and reused while that child's text is
   * unchanged, because `Intl.Segmenter` over the whole document was the single
   * most expensive thing the editor did per keystroke — 6.4 ms of a 6.7 ms
   * `afterCommand` on a 217 KiB document. A keystroke changes one child, so
   * only that child is re-segmented; the rest costs a string comparison.
   *
   * Children that do miss are segmented together in one pass rather than one
   * call each. `Intl.Segmenter.segment()` carries enough per-call setup that
   * 1200 small calls cost roughly three times a single large one, so the cold
   * path — `setHTML`, paste, undo of a big edit — would otherwise pay for the
   * warm path's speed.
   * @returns {{ words: number, chars: number }}
   */
  _counts() {
    const editable = this.context.layoutInfo.editable;
    let words = 0;
    let chars = 0;
    /** @type {{node: Node, key: string, text: string, start: number}[]} */
    const cold = [];
    /** @type {string[]} */
    const parts = [];
    let offset = 0;

    for (let node = editable.firstChild; node; node = node.nextSibling) {
      const hit = this._countCache.get(node);
      // The flat text is the change key. Read it from the node only when there
      // is an entry that could still be valid; a node with no entry is being
      // walked anyway, and that walk yields the same string for free.
      if (hit && hit.key === (node.textContent || '')) {
        words += hit.words;
        chars += hit.chars;
        continue;
      }
      const { lines, flat } = readText(node);
      cold.push({ node, key: flat, text: lines, start: offset });
      parts.push(lines);
      offset += lines.length + 1; // +1 for the newline the join inserts
    }

    if (cold.length) {
      const counts = this._countBatch(cold, parts.join('\n'));
      cold.forEach((child, i) => {
        const entry = {
          key: child.key,
          words: counts[i],
          // Newlines are separators, not characters the reader typed — and the
          // ones inside a <pre> were never counted either.
          chars: child.key.replaceAll('\n', '').length,
        };
        this._countCache.set(child.node, entry);
        words += entry.words;
        chars += entry.chars;
      });
    }

    return { words, chars };
  }

  /**
   * Word counts for each cold child, from a single pass over their joined text.
   *
   * The children are joined with a newline, which is a word boundary in every
   * script, so no word can be counted across two of them. Segments arrive in
   * increasing offset order, so attributing each one is a walk, not a search.
   * @param {{start: number, text: string}[]} cold
   * @param {string} joined
   * @returns {number[]}
   */
  _countBatch(cold, joined) {
    if (!_segmenter) return cold.map((c) => _countWords(c.text));
    const counts = new Array(cold.length).fill(0);
    let i = 0;
    for (const seg of _segmenter.segment(joined)) {
      if (!seg.isWordLike) continue;
      while (i < cold.length - 1 && seg.index >= cold[i + 1].start) i++;
      counts[i]++;
    }
    return counts;
  }

  update() {
    if (!this._wordCountEl || !this._charCountEl) return;
    const { words, chars } = this._counts();
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
    return this._counts().words;
  }

  /**
   * Returns the current character count (excluding newlines) of the editor content.
   * @returns {number}
   */
  getCharCount() {
    return this._counts().chars;
  }
}
