/**
 * Style.js - Inline / block style detection and application utilities
 * Rewritten from Summernote's approach using vanilla JS + execCommand fallback
 */

import { closest, isElement, isPara, ancestors } from '../core/dom.js';
import { currentRange } from '../core/range.js';

// ---------------------------------------------------------------------------
// execCommand wrappers (still the most compatible way in contenteditable)
// ---------------------------------------------------------------------------

/**
 * Applies a document execCommand.
 * @param {string} cmd
 * @param {string} [value]
 * @returns {boolean}
 */
export function execCommand(cmd, value = null) {
  return document.execCommand(cmd, false, value);
}

// ---------------------------------------------------------------------------
// Inline style helpers
// ---------------------------------------------------------------------------

/**
 * Bolds / unbolds the selection.
 */
export const bold = () => execCommand('bold');

/**
 * Italicises / un-italicises the selection.
 */
export const italic = () => execCommand('italic');

/**
 * Underlines / un-underlines the selection.
 */
export const underline = () => execCommand('underline');

/**
 * Strikethrough / removes strikethrough.
 */
export const strikethrough = () => execCommand('strikeThrough');

/**
 * Superscript toggle.
 */
export const superscript = () => execCommand('superscript');

/**
 * Subscript toggle.
 */
export const subscript = () => execCommand('subscript');

/**
 * Sets the foreground colour of the selected text.
 * @param {string} color - CSS colour string
 */
export const foreColor = (color) => execCommand('foreColor', color);

/**
 * Sets the background (highlight) colour of the selected text.
 * @param {string} color - CSS colour string
 */
export const backColor = (color) => execCommand('hiliteColor', color);

/**
 * Sets the font name for the selection.
 * @param {string} name
 */
export const fontName = (name) => execCommand('fontName', name);

/**
 * Sets the font size (in pt or with unit) for the selection.
 * Uses a span-based approach to set px sizes precisely.
 * @param {string} size - e.g. '14px'
 */
export function fontSize(size) {
  execCommand('fontSize', '7'); // placeholder
  // Replace font elements with spans
  document.querySelectorAll('font[size="7"]').forEach((el) => {
    const span = document.createElement('span');
    span.style.fontSize = size;
    el.parentNode.insertBefore(span, el);
    while (el.firstChild) span.appendChild(el.firstChild);
    el.parentNode.removeChild(el);
  });
}

// ---------------------------------------------------------------------------
// Block style helpers
// ---------------------------------------------------------------------------

/**
 * Wraps the selection in the given block tag (p, h1-h6, blockquote, pre).
 * @param {string} tagName
 */
export const formatBlock = (tagName) => execCommand('formatBlock', `<${tagName}>`);

/**
 * Left-aligns the current block.
 */
export const justifyLeft = () => execCommand('justifyLeft');

/**
 * Center-aligns the current block.
 */
export const justifyCenter = () => execCommand('justifyCenter');

/**
 * Right-aligns the current block.
 */
export const justifyRight = () => execCommand('justifyRight');

/**
 * Fully justifies the current block.
 */
export const justifyFull = () => execCommand('justifyFull');

/**
 * Indents the list or block.
 */
export const indent = () => execCommand('indent');

/**
 * Outdents the list or block.
 */
export const outdent = () => execCommand('outdent');

/**
 * Inserts an unordered list or converts selection.
 */
export const insertUnorderedList = () => execCommand('insertUnorderedList');

/**
 * Inserts an ordered list or converts selection.
 */
export const insertOrderedList = () => execCommand('insertOrderedList');

// ---------------------------------------------------------------------------
// Style query helpers
// ---------------------------------------------------------------------------

/**
 * Returns the computed styles relevant to the current cursor position.
 * @param {HTMLElement} editable
 * @returns {object} styleMap
 */
export function currentStyle(editable) {
  const range = currentRange(editable);
  if (!range) return {};

  const container = range.isCollapsed()
    ? range.sc
    : range.commonAncestor();

  const el = isElement(container) ? container : container.parentElement;
  if (!el) return {};

  const computed = window.getComputedStyle(el);

  return {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    strikethrough: document.queryCommandState('strikeThrough'),
    superscript: document.queryCommandState('superscript'),
    subscript: document.queryCommandState('subscript'),
    fontSize: computed.fontSize,
    fontFamily: computed.fontFamily,
    color: computed.color,
    backgroundColor: computed.backgroundColor,
    textAlign: computed.textAlign,
    lineHeight: computed.lineHeight,
    formatBlock: (closest(el, isPara, editable) || { nodeName: 'p' }).nodeName.toLowerCase(),
  };
}
