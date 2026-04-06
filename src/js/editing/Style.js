/**
 * Style.js - Inline / block style detection and application utilities
 * Rewritten from Summernote's approach using vanilla JS + execCommand fallback
 */

import { closest, isElement, isPara } from '../core/dom.js';
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
 * Falls back to manual DOM manipulation when inside <code> where
 * execCommand's state detection is unreliable.
 */
export function underline() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  let container = sel.getRangeAt(0).commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  // Check if we're inside a <u> (DOM truth), to guard against unreliable queryCommandState
  const uEl = container && container.closest && container.closest('u');
  const nativeState = document.queryCommandState('underline');
  if (uEl && !nativeState) {
    // Browser doesn't recognise the underline state (e.g. inside <code>).
    // Manually unwrap the <u> element.
    const parent = uEl.parentNode;
    while (uEl.firstChild) parent.insertBefore(uEl.firstChild, uEl);
    parent.removeChild(uEl);
    return;
  }
  execCommand('underline');
}

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
 * @param {HTMLElement} [editable] - scoping element to avoid touching nodes outside this editor
 */
export function fontSize(size, editable = document) {
  const sel = window.getSelection();
  const wasCollapsed = !sel || !sel.rangeCount || sel.getRangeAt(0).collapsed;

  execCommand('fontSize', '7'); // placeholder
  // Replace font elements with spans, scoped to the active editable
  const scope = editable instanceof HTMLElement ? editable : document;
  const newSpans = [];
  scope.querySelectorAll('font[size="7"]').forEach((el) => {
    const span = document.createElement('span');
    span.style.fontSize = size;
    el.parentNode.insertBefore(span, el);
    while (el.firstChild) span.appendChild(el.firstChild);
    el.parentNode.removeChild(el);
    newSpans.push(span);
  });

  // Restore the selection inside the new span(s) so:
  // 1. The toolbar getValue() correctly reflects the new font size.
  // 2. For a collapsed (caret) selection, subsequent typing inherits the
  //    chosen size rather than the browser's stale execCommand state (which
  //    would produce size 7 = 48 px instead of the requested value).
  if (sel && newSpans.length > 0) {
    const first = newSpans[0];
    const last  = newSpans[newSpans.length - 1];
    try {
      if (wasCollapsed) {
        // Ensure the span has a text anchor so the cursor can live inside it.
        if (!first.firstChild) {
          first.appendChild(document.createTextNode('\u200B'));
        }
        const nr = document.createRange();
        const anchor = first.firstChild;
        nr.setStart(anchor, anchor.textContent.length);
        nr.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nr);
      } else {
        // Re-select all replaced content so toolbar refresh reads the new size.
        const nr = document.createRange();
        const startNode = first.firstChild || first;
        const endNode   = last.lastChild  || last;
        nr.setStart(startNode, 0);
        nr.setEnd(endNode, endNode.nodeType === Node.TEXT_NODE ? endNode.textContent.length : endNode.childNodes.length);
        sel.removeAllRanges();
        sel.addRange(nr);
      }
    } catch (_) { /* ignore range errors on unusual DOM structures */ }
  }
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
// Line-height helper
// ---------------------------------------------------------------------------

/**
 * Applies a line-height value to every block-level element that intersects
 * the current selection.
 * @param {string} value - unitless multiplier, e.g. '1.5'
 */
export function lineHeight(value) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'TD', 'TH']);

  const nearestBlock = (node) => {
    let el = node instanceof Element ? node : node.parentElement;
    while (el) {
      if (BLOCK_TAGS.has(el.tagName)) return el;
      el = el.parentElement;
    }
    return null;
  };

  if (range.collapsed) {
    const block = nearestBlock(range.startContainer);
    if (block) block.style.lineHeight = value;
    return;
  }

  // For a range selection, collect all unique block ancestors of text nodes
  const blocks = new Set();
  const iter = document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, null);
  let textNode;
  while ((textNode = iter.nextNode())) {
    if (range.intersectsNode(textNode)) {
      const block = nearestBlock(textNode);
      if (block) blocks.add(block);
    }
  }
  if (blocks.size === 0) {
    const block = nearestBlock(range.commonAncestorContainer);
    if (block) blocks.add(block);
  }
  blocks.forEach((block) => { block.style.lineHeight = value; });
}

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

// ---------------------------------------------------------------------------
// Inline code toggle
// ---------------------------------------------------------------------------

/**
 * Wraps the selection in an inline <code> element, or unwraps it if the
 * cursor is already inside a <code> that is not inside a <pre>.
 * @param {HTMLElement} [editable]
 */
export function toggleInlineCode(editable) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  const codeEl = container && container.closest ? container.closest('code') : null;
  if (codeEl && !codeEl.closest('pre')) {
    // Unwrap — save range endpoints relative to surrounding text so we can
    // restore the selection after normalize() merges adjacent text nodes.
    const parent = codeEl.parentNode;
    // Note the sibling before the code element so we can re-anchor later.
    const prevSibling = codeEl.previousSibling;
    const movedChildren = Array.from(codeEl.childNodes);
    while (codeEl.firstChild) parent.insertBefore(codeEl.firstChild, codeEl);
    parent.removeChild(codeEl);
    // Normalize only the immediate parent to merge adjacent text nodes without
    // invalidating distant selection anchors (full editable.normalize() can
    // cause selection offsets to shift, making subsequent format toggles miss).
    if (parent && parent.normalize) parent.normalize();
    // Restore selection to the text that was inside the unwrapped <code>.
    if (movedChildren.length > 0) {
      try {
        // After normalize, find the merged text node that contains the content.
        const firstMoved = movedChildren[0];
        const lastMoved  = movedChildren[movedChildren.length - 1];
        const nr = document.createRange();
        // Use the (possibly merged) live node if still in the DOM.
        const anchorNode = (firstMoved.parentNode === parent) ? firstMoved : (prevSibling ? prevSibling.nextSibling : parent.firstChild);
        if (anchorNode) {
          nr.setStart(anchorNode, 0);
          const endAnchor = (lastMoved.parentNode === parent) ? lastMoved : anchorNode;
          nr.setEnd(endAnchor, endAnchor.nodeType === Node.TEXT_NODE ? endAnchor.textContent.length : endAnchor.childNodes.length);
          sel.removeAllRanges();
          sel.addRange(nr);
        }
      } catch (_) { /* ignore */ }
    }
  } else {
    if (range.collapsed) return;
    try {
      const code = document.createElement('code');
      range.surroundContents(code);
      // Re-select wrapped content so subsequent format toggles work
      const newRange = document.createRange();
      newRange.selectNodeContents(code);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch {
      // surroundContents fails across element boundaries — extract and rewrap
      const frag = range.extractContents();
      const code = document.createElement('code');
      code.appendChild(frag);
      range.insertNode(code);
      // Re-select wrapped content
      const newRange = document.createRange();
      newRange.selectNodeContents(code);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }
}

/**
 * Returns true when the cursor / selection is inside an inline <code>
 * (not nested in a <pre>).
 * Uses startContainer for reliable cross-browser detection regardless of
 * whether the selection is collapsed or a range (commonAncestorContainer
 * can behave inconsistently for range selections on some browsers).
 * @returns {boolean}
 */
export function isInlineCode() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return false;
  let sc = sel.getRangeAt(0).startContainer;
  if (sc.nodeType === 3) sc = sc.parentElement;
  const code = sc && sc.closest ? sc.closest('code') : null;
  return !!(code && !code.closest('pre'));
}

// ---------------------------------------------------------------------------
// Checklist (task list)
// ---------------------------------------------------------------------------

/**
 * Toggles a task-list at the cursor.
 * If inside a checklist <li>, converts it (and any other selected items) back to <p> elements.
 * Otherwise inserts a new <ul class="an-checklist"> with one item per selected line.
 */
export function toggleChecklist() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;

  const ul = container.closest && container.closest('.an-checklist');
  if (ul) {
    // If selection covers multiple <li>, convert them all
    const selectedLis = Array.from(ul.querySelectorAll('li')).filter((li) =>
      sel.containsNode(li, true),
    );
    if (selectedLis.length > 0) {
      let firstP = null;
      selectedLis.forEach((li) => {
        const text = Array.from(li.childNodes)
          .filter((n) => !(n.nodeType === 1 && n.tagName === 'INPUT'))
          .map((n) => n.textContent)
          .join('')
          .replace(/\u00a0/g, ' ')
          .trim();
        const p = document.createElement('p');
        p.textContent = text || '\u00a0';
        ul.parentNode.insertBefore(p, ul);
        if (!firstP) firstP = p;
        ul.removeChild(li);
      });
      if (ul.children.length === 0) ul.remove();
      // Move caret to first converted paragraph
      if (firstP) {
        const nr = document.createRange();
        nr.setStart(firstP.firstChild || firstP, 0);
        nr.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nr);
      }
      return;
    }
  }

  // Otherwise: insert new checklist from selected text
  const text = sel.toString();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return;
  const items = lines
    .map(
      (l) =>
        `<li><input type="checkbox" contenteditable="false">${l || '\u200B'}</li>`,
    )
    .join('');
  document.execCommand(
    'insertHTML',
    false,
    `<ul class="an-checklist">${items}</ul>`,
  );
}

/**
 * Returns true when the cursor is inside a checklist item.
 * @returns {boolean}
 */
export function isInChecklist() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return false;
  let container = sel.getRangeAt(0).commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  return !!(container && container.closest && container.closest('.an-checklist li'));
}
