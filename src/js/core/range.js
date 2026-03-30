/**
 * range.js - Selection and Range utilities
 * Inspired by Summernote's range.js — rewritten as vanilla JS
 */

import { isElement, closest } from './dom.js';

// ---------------------------------------------------------------------------
// WrappedRange — a convenience wrapper over the native Range API
// ---------------------------------------------------------------------------

export class WrappedRange {
  /**
   * @param {Node} sc - start container
   * @param {number} so - start offset
   * @param {Node} ec - end container
   * @param {number} eo - end offset
   */
  constructor(sc, so, ec, eo) {
    this.sc = sc;
    this.so = so;
    this.ec = ec;
    this.eo = eo;
  }

  /** @returns {boolean} */
  isCollapsed() {
    return this.sc === this.ec && this.so === this.eo;
  }

  /** @returns {Range} */
  toNativeRange() {
    const range = document.createRange();
    try {
      range.setStart(this.sc, this.so);
      range.setEnd(this.ec, this.eo);
    } catch (_e) {
      // Guard against detached nodes
    }
    return range;
  }

  /**
   * Select this wrapped range in the window.
   */
  select() {
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(this.toNativeRange());
  }

  /**
   * Returns the common ancestor element of this range.
   * @returns {Element|null}
   */
  commonAncestor() {
    const native = this.toNativeRange();
    const ancestor = native.commonAncestorContainer;
    return isElement(ancestor) ? ancestor : ancestor.parentElement;
  }

  /**
   * Returns the nearest paragraph/block ancestor within the editable area.
   * @param {HTMLElement} editable
   * @returns {Element|null}
   */
  blockNode(editable) {
    return closest(this.sc, (n) => isElement(n) && n !== editable, editable);
  }

  /**
   * Returns either the selected text string or empty string.
   * @returns {string}
   */
  toString() {
    return this.toNativeRange().toString();
  }

  /**
   * Returns the bounding DOMRect of the range (or null).
   * @returns {DOMRect|null}
   */
  getClientRects() {
    const rects = this.toNativeRange().getClientRects();
    return rects.length > 0 ? rects[rects.length - 1] : null;
  }

  /**
   * Inserts a node at the start of this range.
   * @param {Node} node
   */
  insertNode(node) {
    const native = this.toNativeRange();
    native.insertNode(node);
  }

}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a WrappedRange from a native Range object.
 * @param {Range} range
 * @returns {WrappedRange}
 */
export function fromNativeRange(range) {
  return new WrappedRange(
    range.startContainer,
    range.startOffset,
    range.endContainer,
    range.endOffset,
  );
}

/**
 * Returns a WrappedRange for the current window selection,
 * optionally restricted to a given editable element.
 * @param {HTMLElement} [editable]
 * @returns {WrappedRange|null}
 */
export function currentRange(editable) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const native = sel.getRangeAt(0);
  // Optionally check that the selection is inside the editable element
  if (editable && !editable.contains(native.commonAncestorContainer)) {
    return null;
  }
  return fromNativeRange(native);
}

/**
 * Creates a WrappedRange that covers the entire content of an element.
 * @param {HTMLElement} el
 * @returns {WrappedRange}
 */
export function rangeFromElement(el) {
  return new WrappedRange(el, 0, el, el.childNodes.length);
}

/**
 * Creates a collapsed range (cursor) at the given node / offset.
 * @param {Node} node
 * @param {number} offset
 * @returns {WrappedRange}
 */
export function collapsedRange(node, offset = 0) {
  return new WrappedRange(node, offset, node, offset);
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the current selection is inside the given element.
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export function isSelectionInside(el) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  return el.contains(sel.getRangeAt(0).commonAncestorContainer);
}

/**
 * Saves the current selection, executes fn, then restores the selection.
 * @param {Function} fn
 */
export function withSavedRange(fn) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    fn(null);
    return;
  }
  const saved = sel.getRangeAt(0).cloneRange();
  fn(fromNativeRange(saved));
  sel.removeAllRanges();
  sel.addRange(saved);
}

/**
 * Splits the text node at the given offset and returns the two halves.
 * @param {Text} textNode
 * @param {number} offset
 * @returns {[Text, Text]}
 */
export function splitText(textNode, offset) {
  const after = textNode.splitText(offset);
  return [textNode, after];
}
