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
 * Falls back to manual DOM manipulation inside nested formats where
 * execCommand's state detection is unreliable (mirrors underline() logic).
 */
export function strikethrough() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  // Use startContainer for consistent detection across collapsed and range
  // selections — commonAncestorContainer can miss ancestor <s>/<strike> tags
  // when the selection spans across nested inline elements.
  let sc = sel.getRangeAt(0).startContainer;
  if (sc.nodeType === 3) sc = sc.parentElement;
  const sEl = sc && sc.closest && (sc.closest('s') || sc.closest('strike'));
  const nativeState = document.queryCommandState('strikeThrough');
  if (sEl && !nativeState) {
    // Browser doesn’t recognise the strikethrough state (e.g. inside <code>
    // or deeply nested inline formats). Manually unwrap the <s>/<strike>.
    const parent = sEl.parentNode;
    while (sEl.firstChild) parent.insertBefore(sEl.firstChild, sEl);
    parent.removeChild(sEl);
    return;
  }
  execCommand('strikeThrough');
}

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

  // B-I-3/4: For a collapsed (caret) selection the browser's execCommand
  // 'fontSize' leaves an internal "pending" state of size-7 (=48px) instead of
  // creating a <font> element, so the very next typed character comes out at
  // 48px. Fix: bypass execCommand entirely for collapsed selections and directly
  // insert a span with the requested size, placing the cursor inside it.
  // Only applies when there IS an active selection (sel.rangeCount > 0); when
  // there is no selection at all (e.g. jsdom unit tests) fall through to the
  // execCommand path so the font-replacement logic still runs.
  if (wasCollapsed && sel && sel.rangeCount > 0) {
    try {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      const zwsNode = document.createTextNode('\u200B');
      span.appendChild(zwsNode);
      range.insertNode(span);
      const nr = document.createRange();
      nr.setStart(zwsNode, zwsNode.textContent.length);
      nr.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nr);
    } catch (_) { /* ignore range errors on unusual DOM structures */ }
    return;
  }

  // Non-collapsed selection (or no selection — handles jsdom test setup where
  // <font size="7"> elements are injected directly without a live selection):
  // use execCommand placeholder approach then replace <font> with <span>.
  execCommand('fontSize', '7');
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

  // Re-select all replaced content so toolbar getValue() reads the new size
  // (B-I-1/2: without this re-selection the toolbar dropdown stays on the old
  // value until the next selectionchange event).
  if (!wasCollapsed && sel && newSpans.length > 0) {
    const first = newSpans[0];
    const last  = newSpans[newSpans.length - 1];
    try {
      const nr = document.createRange();
      const startNode = first.firstChild || first;
      const endNode   = last.lastChild  || last;
      nr.setStart(startNode, 0);
      nr.setEnd(endNode, endNode.nodeType === Node.TEXT_NODE ? endNode.textContent.length : endNode.childNodes.length);
      sel.removeAllRanges();
      sel.addRange(nr);
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
 * G.5: When cursor is inside a checklist item, "outdent" means converting
 * that item back to a regular <p> element rather than calling execCommand
 * (which would destroy the ul > li checklist structure).
 */
export function outdent() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    let container = sel.getRangeAt(0).commonAncestorContainer;
    if (container.nodeType === 3) container = container.parentElement;
    const checkLi = container && container.closest && container.closest('.an-checklist li');
    if (checkLi) {
      _checklistItemToP(checkLi);
      return;
    }
  }
  execCommand('outdent');
}

/**
 * G.5 helper: splits a checklist at checkLi, converts it to a <p>,
 * and keeps items before/after as separate checklists.
 * @param {HTMLElement} checkLi
 */
function _checklistItemToP(checkLi) {
  const checkUl = checkLi.closest('.an-checklist');
  if (!checkUl) return;

  const allLis  = Array.from(checkUl.children);
  const liIndex = allLis.indexOf(checkLi);
  const afterLis = allLis.slice(liIndex + 1);

  // Build <p> from the item's text (skip the checkbox INPUT)
  const p = document.createElement('p');
  const text = Array.from(checkLi.childNodes)
    .filter(n => !(n.nodeType === 1 && n.tagName === 'INPUT'))
    .map(n => n.textContent).join('').replace(/\u200B/g, '').trim();
  p.textContent = text || '\u00a0';

  // Move items after the current li into a new checklist
  if (afterLis.length > 0) {
    const newUl = document.createElement('ul');
    newUl.className = 'an-checklist';
    afterLis.forEach(li => newUl.appendChild(li));
    checkUl.parentNode.insertBefore(newUl, checkUl.nextSibling);
  }

  // Insert <p> after checkUl (before any newUl)
  checkUl.parentNode.insertBefore(p, checkUl.nextSibling);

  // Remove current li from checkUl; delete checkUl if now empty
  checkUl.removeChild(checkLi);
  if (checkUl.children.length === 0) checkUl.parentNode.removeChild(checkUl);

  // Place caret at start of the new <p>
  try {
    const nr = document.createRange();
    const firstChild = p.firstChild;
    nr.setStart(firstChild && firstChild.nodeType === 3 ? firstChild : p, 0);
    nr.collapse(true);
    const s = window.getSelection();
    if (s) { s.removeAllRanges(); s.addRange(nr); }
  } catch {}
}

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

  // Otherwise: insert new checklist from selected text (or current block when collapsed).
  const isCollapsed = range.collapsed;
  if (isCollapsed) {
    // Find the nearest block-level ancestor (p, div, li, h1-h6, blockquote, etc.)
    // and convert it into a single checklist item.
    const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI']);
    let block = container;
    while (block && block.parentNode && !BLOCK_TAGS.has(block.tagName)) {
      block = block.parentNode;
    }
    // Fallback: if no block element found (e.g. cursor directly in editable root), use the
    // insertion approach with a zero-width-space item so the cursor ends up inside.
    const itemText = (block && BLOCK_TAGS.has(block.tagName))
      ? Array.from(block.childNodes)
          .map((n) => n.textContent)
          .join('')
          .replace(/\u00a0/g, ' ')
      : '';

    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.contentEditable = 'false';
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(itemText || '\u200B'));
    ul.appendChild(li);

    if (block && BLOCK_TAGS.has(block.tagName)) {
      block.parentNode.replaceChild(ul, block);
    } else {
      document.execCommand('insertHTML', false, ul.outerHTML);
      return;
    }

    // Move caret to the text node inside the new <li>
    const textNode = li.lastChild;
    const nr = document.createRange();
    const offset = textNode.nodeType === Node.TEXT_NODE ? textNode.textContent.length : 0;
    nr.setStart(textNode, offset);
    nr.collapse(true);
    sel.removeAllRanges();
    sel.addRange(nr);
    return;
  }

  // G-4: Non-collapsed, non-checklist selection — convert each intersected
  // block element into a checklist item using direct DOM manipulation.
  // execCommand('insertHTML') is avoided here because in modern browsers it
  // deletes the selection but may silently fail to insert when the selection
  // spans multiple block elements, causing text to disappear.

  // Guard: if the raw selection is entirely whitespace, do nothing (mirrors
  // the old line-filter behaviour that prevented empty checklist creation).
  const rawSelText = sel.toString().replace(/[\u00a0\u200B]/g, ' ').trim();
  if (!rawSelText) return;

  const BLOCK_TAGS_MULTI = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'LI']);

  // Collect block-level ancestors of every node in the selection, in order.
  const blocks = [];
  const seenBlocks = new Set();
  const commonAncestor = range.commonAncestorContainer;
  const iter = document.createNodeIterator(
    commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentNode : commonAncestor,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null,
  );
  let node;
  while ((node = iter.nextNode())) {
    if (!range.intersectsNode(node)) continue;
    let block = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (block && !BLOCK_TAGS_MULTI.has(block.tagName)) {
      block = block.parentElement;
    }
    if (block && !seenBlocks.has(block)) {
      seenBlocks.add(block);
      blocks.push(block);
    }
  }

  if (blocks.length === 0) return;

  // Build checklist and replace collected blocks.
  const newUl = document.createElement('ul');
  newUl.className = 'an-checklist';
  let lastTextNode = null;
  blocks.forEach((block) => {
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.setAttribute('contenteditable', 'false');
    li.appendChild(cb);
    // Preserve plain text content; ZWS/NBSP are stripped for display.
    const blockText = Array.from(block.childNodes)
      .map((n) => n.textContent)
      .join('')
      .replace(/[\u00a0\u200B]/g, ' ')
      .trim();
    const tn = document.createTextNode(blockText || '\u200B');
    li.appendChild(tn);
    newUl.appendChild(li);
    lastTextNode = tn;
  });

  // Insert the new list before the first block, then remove all source blocks.
  const firstBlock = blocks[0];
  firstBlock.parentNode.insertBefore(newUl, firstBlock);
  blocks.forEach((block) => block.parentNode && block.parentNode.removeChild(block));

  // Move caret to end of the last checklist item.
  if (lastTextNode) {
    const nr = document.createRange();
    nr.setStart(lastTextNode, lastTextNode.textContent.length);
    nr.collapse(true);
    sel.removeAllRanges();
    sel.addRange(nr);
  }
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
