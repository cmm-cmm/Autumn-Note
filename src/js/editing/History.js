/**
 * History.js - Undo / redo stack for editor content
 * Inspired by Summernote's History module, rewritten without jQuery
 */

export class History {
  /**
   * @param {HTMLElement} editable - the contenteditable element
   * @param {number} [limit=100] - maximum number of undo/redo states
   */
  constructor(editable, limit = 100) {
    this.editable = editable;
    this._limit = limit;
    /** @type {Array<{html: string, range: {sc: string, so: number, ec: string, eo: number}|null}>} */
    this.stack = [];
    this.stackOffset = -1;
    this._savePoint();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  _serialize() {
    return this.editable.innerHTML;
  }

  /**
   * Serializes the current selection as character offsets from the start of
   * the editable element, so it can be restored after innerHTML replacement.
   * @returns {{ start: number, end: number }|null}
   */
  _serializeSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!this.editable.contains(range.startContainer)) return null;
    return {
      start: this._charOffset(range.startContainer, range.startOffset),
      end: this._charOffset(range.endContainer, range.endOffset),
    };
  }

  /**
   * Returns the character offset of (node, offset) from the beginning of
   * the editable's text content.
   * @param {Node} node
   * @param {number} offset
   * @returns {number}
   */
  _charOffset(node, offset) {
    let count = 0;
    const walker = document.createTreeWalker(this.editable, NodeFilter.SHOW_TEXT, null);
    let cur;
    while ((cur = walker.nextNode())) {
      if (cur === node) return count + offset;
      count += cur.length;
    }
    return 0;
  }

  /**
   * Restores a previously serialized selection inside the editable.
   * @param {{ start: number, end: number }|null} saved
   */
  _restoreSelection(saved) {
    if (!saved) return;
    let startNode = null, startOff = 0;
    let endNode = null, endOff = 0;
    let count = 0;
    const walker = document.createTreeWalker(this.editable, NodeFilter.SHOW_TEXT, null);
    let cur;
    while ((cur = walker.nextNode())) {
      const len = cur.length;
      if (!startNode && count + len >= saved.start) {
        startNode = cur;
        startOff = saved.start - count;
      }
      if (!endNode && count + len >= saved.end) {
        endNode = cur;
        endOff = saved.end - count;
        break;
      }
      count += len;
    }
    if (!startNode) {
      // Offset exceeds content (e.g. undo to a shorter state): place at end
      const lastWalker = document.createTreeWalker(this.editable, NodeFilter.SHOW_TEXT, null);
      let lastNode = null;
      while ((lastNode = lastWalker.nextNode())) { startNode = lastNode; }
      startOff = startNode ? startNode.length : 0;
      endNode = startNode;
      endOff = startOff;
    }
    if (!endNode) { endNode = startNode; endOff = startOff; }
    try {
      const range = document.createRange();
      range.setStart(startNode, startOff);
      range.setEnd(endNode, endOff);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (_) { /* detached node — ignore */ }
  }

  _savePoint() {
    // Trim future history if we're mid-stack
    if (this.stackOffset < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.stackOffset + 1);
    }
    const raw = this._serialize();
    const { html, images } = this._tokenizeImages(raw);
    this.stack.push({ html, images, sel: this._serializeSelection() });
    if (this.stack.length > this._limit) {
      this.stack.shift();
    } else {
      this.stackOffset++;
    }
  }

  _restore(point) {
    if (!point) return;
    this.editable.innerHTML = this._detokenizeImages(point);
    this._restoreSelection(point.sel);
  }

  // ---------------------------------------------------------------------------
  // Base64 tokenisation — keeps snapshot strings small so that the
  // per-keystroke `recordUndo` string comparison stays fast even when the
  // editor contains large embedded images.
  // ---------------------------------------------------------------------------

  /**
   * Replaces every `data:…;base64,…` occurrence in `html` with a compact
   * token `__asn_img_0__`, `__asn_img_1__`, … and returns the tokenized
   * string together with a map from token → original data URL.
   * @param {string} html
   * @returns {{ html: string, images: Object<string,string> }}
   */
  _tokenizeImages(html) {
    const images = {};
    let index = 0;
    const tokenized = html.replace(/data:[^;]+;base64,[^"' >]*/g, (match) => {
      const token = `__asn_img_${index}__`;
      images[token] = match;
      index++;
      return token;
    });
    return { html: tokenized, images };
  }

  /**
   * Restores a snapshot by replacing tokens back with their data URLs.
   * @param {{ html: string, images: Object<string,string> }} point
   * @returns {string}
   */
  _detokenizeImages(point) {
    if (!point.images || Object.keys(point.images).length === 0) return point.html;
    return point.html.replace(/__asn_img_\d+__/g, (token) => point.images[token] || token);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Records the current editor state as a history checkpoint.
   */
  recordUndo() {
    const current = this._serialize();
    const { html: tokenized } = this._tokenizeImages(current);
    const prev = this.stack[this.stackOffset];
    if (prev && prev.html === tokenized) return; // No change
    this._savePoint();
  }

  /**
   * Undo to the previous state.
   */
  undo() {
    if (this.stackOffset <= 0) return;
    this.stackOffset--;
    this._restore(this.stack[this.stackOffset]);
  }

  /**
   * Redo to the next state.
   */
  redo() {
    if (this.stackOffset >= this.stack.length - 1) return;
    this.stackOffset++;
    this._restore(this.stack[this.stackOffset]);
  }

  /**
   * Resets the history stack (e.g. on editor destroy or full content replace).
   */
  reset() {
    this.stack = [];
    this.stackOffset = -1;
    this._savePoint();
  }

  /** @returns {boolean} */
  canUndo() {
    return this.stackOffset > 0;
  }

  /** @returns {boolean} */
  canRedo() {
    return this.stackOffset < this.stack.length - 1;
  }
}
