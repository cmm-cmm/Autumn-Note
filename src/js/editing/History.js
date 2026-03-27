/**
 * History.js - Undo / redo stack for editor content
 * Inspired by Summernote's History module, rewritten without jQuery
 */

const MAX_HISTORY = 100;

export class History {
  /**
   * @param {HTMLElement} editable - the contenteditable element
   */
  constructor(editable) {
    this.editable = editable;
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

  _savePoint() {
    // Trim future history if we're mid-stack
    if (this.stackOffset < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.stackOffset + 1);
    }
    this.stack.push({ html: this._serialize() });
    if (this.stack.length > MAX_HISTORY) {
      this.stack.shift();
    } else {
      this.stackOffset++;
    }
  }

  _restore(point) {
    if (!point) return;
    this.editable.innerHTML = point.html;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Records the current editor state as a history checkpoint.
   */
  recordUndo() {
    const current = this._serialize();
    const prev = this.stack[this.stackOffset];
    if (prev && prev.html === current) return; // No change
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
