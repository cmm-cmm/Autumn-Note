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
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return;
  let container = sel.getRangeAt(0).commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  // Check if we're inside a <u> (DOM truth), to guard against unreliable queryCommandState
  const uEl = /** @type {Element|null} */ (container)?.closest('u');
  const nativeState = document.queryCommandState('underline');
  if (uEl && !nativeState) {
    // Browser doesn't recognise the underline state (e.g. inside <code>).
    // Manually unwrap the <u> element.
    const parent = uEl.parentNode;
    while (uEl.firstChild) parent.insertBefore(uEl.firstChild, uEl);
    uEl.remove();
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
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return;
  // Use startContainer for consistent detection across collapsed and range
  // selections — commonAncestorContainer can miss ancestor <s>/<strike> tags
  // when the selection spans across nested inline elements.
  let sc = sel.getRangeAt(0).startContainer;
  if (sc.nodeType === 3) sc = sc.parentElement;
  const sEl = /** @type {Element|null} */ (sc)?.closest('s') || /** @type {Element|null} */ (sc)?.closest('strike');
  const nativeState = document.queryCommandState('strikeThrough');
  if (sEl && !nativeState) {
    // Browser doesn’t recognise the strikethrough state (e.g. inside <code>
    // or deeply nested inline formats). Manually unwrap the <s>/<strike>.
    const parent = sEl.parentNode;
    while (sEl.firstChild) parent.insertBefore(sEl.firstChild, sEl);
    sEl.remove();
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
 * @param {HTMLElement|Document} [editable] - scoping element to avoid touching nodes outside this editor
 */
export function fontSize(size, editable = document) {
  const sel = globalThis.getSelection();
  const wasCollapsed = !sel?.rangeCount || sel.getRangeAt(0).collapsed;

  // B-I-3/4: For a collapsed (caret) selection the browser's execCommand
  // 'fontSize' leaves an internal "pending" state of size-7 (=48px) instead of
  // creating a <font> element, so the very next typed character comes out at
  // 48px. Fix: bypass execCommand entirely for collapsed selections and directly
  // insert a span with the requested size, placing the cursor inside it.
  // Only applies when there IS an active selection (sel.rangeCount > 0); when
  // there is no selection at all (e.g. jsdom unit tests) fall through to the
  // execCommand path so the font-replacement logic still runs.
  if (wasCollapsed && sel?.rangeCount > 0) {
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
    } catch (_) { void _; /* ignore range errors on unusual DOM structures */ }
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
    el.remove();
    newSpans.push(span);
  });

  // Re-select all replaced content so toolbar getValue() reads the new size
  // (B-I-1/2: without this re-selection the toolbar dropdown stays on the old
  // value until the next selectionchange event).
  if (!wasCollapsed && sel && newSpans.length > 0) {
    const first = newSpans[0];
    const last  = newSpans.at(-1);
    try {
      const nr = document.createRange();
      const startNode = first.firstChild || first;
      const endNode   = last.lastChild  || last;
      nr.setStart(startNode, 0);
      nr.setEnd(endNode, endNode.nodeType === Node.TEXT_NODE ? endNode.textContent.length : endNode.childNodes.length);
      sel.removeAllRanges();
      sel.addRange(nr);
    } catch (_) { void _; /* ignore range errors on unusual DOM structures */ }
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
  const sel = globalThis.getSelection();
  if (sel?.rangeCount) {
    let container = sel.getRangeAt(0).commonAncestorContainer;
    if (container.nodeType === 3) container = container.parentElement;
    const checkLi = /** @type {Element|null} */ (container)?.closest('.an-checklist li');
    if (checkLi) {
      _checklistItemToP(/** @type {HTMLElement} */ (checkLi));
      return;
    }
  }
  execCommand('outdent');
}

/**
 * Convert a checklist <li> into a paragraph and move any following items into a new checklist.
 *
 * Preserves inline markup from the converted item, strips zero-width space anchors,
 * and replaces empty content with a non‑breaking space. If there are list items
 * after the converted item they are moved into a new <ul class="an-checklist">
 * inserted immediately after the original list. The original <li> is removed and
 * the original list is removed if it becomes empty. Attempts to place the caret
 * at the start of the newly created <p>.
 * @param {HTMLElement} checkLi - The checklist `<li>` element to convert to a `<p>`.
 */
function _checklistItemToP(checkLi) {
  const checkUl = checkLi.closest('.an-checklist');
  if (!checkUl) return;

  const allLis  = Array.from(checkUl.children);
  const liIndex = allLis.indexOf(checkLi);
  const afterLis = allLis.slice(liIndex + 1);

  // Build <p> preserving inline formatting (bold/italic/links) from the item's content
  const p = document.createElement('p');
  for (const child of checkLi.childNodes) {
    if (child.nodeType === 1 && /** @type {Element} */ (child).tagName === 'INPUT') continue;
    p.appendChild(child.cloneNode(true));
  }
  // Strip ZWS anchors left over from checklist markup
  p.innerHTML = p.innerHTML.replaceAll('\u200B', '');
  if (!p.hasChildNodes() || !p.textContent.trim()) {
    p.innerHTML = '';
    p.appendChild(document.createTextNode('\u00a0'));
  }

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
  checkLi.remove();
  if (checkUl.children.length === 0) checkUl.remove();

  // Place caret at start of the new <p>
  try {
    const nr = document.createRange();
    const firstChild = p.firstChild;
    nr.setStart(firstChild?.nodeType === 3 ? firstChild : p, 0);
    nr.collapse(true);
    const s = globalThis.getSelection();
    if (s) { s.removeAllRanges(); s.addRange(nr); }
  } catch {}
}

/**
 * Inserts an unordered (bulleted) list, or converts the current list to `<ul>`.
 *
 * When the cursor is already inside a list, direct DOM manipulation is used to
 * transition between list types — `execCommand` alone cannot handle checklist →
 * UL/OL conversions because it has no awareness of the `an-checklist` class or
 * the checkbox `<input>` elements.
 *
 * Transition paths:
 * - **Checklist → UL**: strips `an-checklist` class and all checkbox inputs;
 *   converts `<ol>` container to `<ul>` via `changeTagName()` if needed.
 * - **OL → UL**: swaps the container tag via `changeTagName()`.
 * - **UL → paragraphs**: falls back to `execCommand('insertUnorderedList')`
 *   which toggles the list off (browser-native behaviour).
 * - **No list → UL**: falls back to `execCommand('insertUnorderedList')`.
 */
export function insertUnorderedList() {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;

  const listEl = container?.closest('ul, ol');
  if (listEl) {
    if (listEl.classList.contains('an-checklist')) {
      // Checklist → UL: strip checkboxes and class, swap tag if needed
      listEl.classList.remove('an-checklist');
      listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.remove());
      if (listEl.tagName === 'OL') {
        changeTagName(listEl, 'ul');
      }
    } else if (listEl.tagName === 'OL') {
      // OL → UL: swap container tag
      changeTagName(listEl, 'ul');
    } else {
      // Already UL → toggle off via execCommand
      execCommand('insertUnorderedList');
    }
  } else {
    // Not in a list → create new UL via execCommand
    execCommand('insertUnorderedList');
  }
}

/**
 * Inserts an ordered (numbered) list, or converts the current list to `<ol>`.
 *
 * When the cursor is already inside a list, direct DOM manipulation is used to
 * transition between list types — `execCommand` alone cannot handle checklist →
 * UL/OL conversions because it has no awareness of the `an-checklist` class or
 * the checkbox `<input>` elements.
 *
 * Transition paths:
 * - **Checklist → OL**: strips `an-checklist` class and all checkbox inputs;
 *   converts container to `<ol>` via `changeTagName()`.
 * - **UL → OL**: swaps the container tag via `changeTagName()`.
 * - **OL → paragraphs**: falls back to `execCommand('insertOrderedList')`
 *   which toggles the list off (browser-native behaviour).
 * - **No list → OL**: falls back to `execCommand('insertOrderedList')`.
 */
export function insertOrderedList() {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;

  const listEl = container?.closest('ul, ol');
  if (listEl) {
    if (listEl.classList.contains('an-checklist')) {
      // Checklist → OL: strip checkboxes and class, swap to <ol>
      listEl.classList.remove('an-checklist');
      listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.remove());
      changeTagName(listEl, 'ol');
    } else if (listEl.tagName === 'UL') {
      // UL → OL: swap container tag
      changeTagName(listEl, 'ol');
    } else {
      // Already OL → toggle off via execCommand
      execCommand('insertOrderedList');
    }
  } else {
    // Not in a list → create new OL via execCommand
    execCommand('insertOrderedList');
  }
}

// ---------------------------------------------------------------------------
// Line-height helper
// ---------------------------------------------------------------------------

/**
 * Set the line-height on every block-level element that intersects the current selection.
 *
 * If the selection is collapsed, the nearest enclosing block element receives the style.
 * For a non-collapsed selection, all unique block ancestors of text nodes that intersect the range are updated;
 * if none are found, the nearest block ancestor of the range's common ancestor is updated.
 * @param {string} value - Line-height value to apply; typically a unitless multiplier (for example, "1.5").
 */
export function lineHeight(value) {
  const sel = globalThis.getSelection();
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
  const iter = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    { acceptNode: (node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP },
  );
  let textNode;
  while ((textNode = iter.nextNode())) {
    const block = nearestBlock(textNode);
    if (block) blocks.add(block);
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

  const el = /** @type {Element|null} */ (isElement(container) ? container : container.parentElement);
  if (!el) return {};

  const computed = globalThis.getComputedStyle(el);

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
 * @param {HTMLElement} [_editable]
 */
export function toggleInlineCode(_editable) {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  const codeEl = /** @type {Element|null} */ (container)?.closest('code');
  if (codeEl && !codeEl.closest('pre')) {
    // Unwrap — save range endpoints relative to surrounding text so we can
    // restore the selection after normalize() merges adjacent text nodes.
    const parent = codeEl.parentNode;
    // Note the sibling before the code element so we can re-anchor later.
    const prevSibling = codeEl.previousSibling;
    const movedChildren = Array.from(codeEl.childNodes);
    while (codeEl.firstChild) parent.insertBefore(codeEl.firstChild, codeEl);
    codeEl.remove();
    // Normalize only the immediate parent to merge adjacent text nodes without
    // invalidating distant selection anchors (full editable.normalize() can
    // cause selection offsets to shift, making subsequent format toggles miss).
    parent?.normalize();
    // Restore selection to the text that was inside the unwrapped <code>.
    if (movedChildren.length > 0) {
      try {
        // After normalize, find the merged text node that contains the content.
        const firstMoved = movedChildren[0];
        const lastMoved  = movedChildren.at(-1);
        const nr = document.createRange();
        // Use the (possibly merged) live node if still in the DOM.
        const anchorNode = firstMoved.parentNode === parent
          ? firstMoved
          : (prevSibling ? prevSibling.nextSibling : parent.firstChild);
        if (anchorNode) {
          nr.setStart(anchorNode, 0);
          const endAnchor = (lastMoved.parentNode === parent) ? lastMoved : anchorNode;
          nr.setEnd(endAnchor, endAnchor.nodeType === Node.TEXT_NODE ? endAnchor.textContent.length : endAnchor.childNodes.length);
          sel.removeAllRanges();
          sel.addRange(nr);
        }
      } catch (_) { void _; /* ignore */ }
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
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return false;
  let sc = sel.getRangeAt(0).startContainer;
  if (sc.nodeType === 3) sc = sc.parentElement;
  const code = /** @type {Element|null} */ (sc)?.closest('code');
  return !!(code && !code.closest('pre'));
}

// ---------------------------------------------------------------------------
// Checklist (task list)
// ---------------------------------------------------------------------------

/**
 * Changes the tag name of an element in the DOM while preserving attributes and children.
 * @param {Element} el
 * @param {string} newTagName
 * @returns {HTMLElement}
 */
function changeTagName(el, newTagName) {
  const newEl = document.createElement(newTagName);
  for (const attr of el.attributes) {
    newEl.setAttribute(attr.name, attr.value);
  }
  while (el.firstChild) {
    newEl.appendChild(el.firstChild);
  }
  el.parentNode.replaceChild(newEl, el);
  return newEl;
}

/**
 * Ensures all list items under the list element have a checkbox.
 * @param {Element} listEl
 */
function ensureCheckboxes(listEl) {
  listEl.querySelectorAll('li').forEach(li => {
    const existingCb = li.querySelector('input[type="checkbox"]');
    if (!existingCb) {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.contentEditable = 'false';
      li.insertBefore(cb, li.firstChild);
    }
  });
}

/**
 * Toggle a checklist at the current selection or caret.
 */
export function toggleChecklist() {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;

  const listEl = container?.closest('ul, ol');
  if (listEl) {
    if (listEl.classList.contains('an-checklist')) {
      // Transition from Checklist to Paragraphs (Toggle off checklist entirely)
      const parent = listEl.parentNode;
      if (parent) {
        const lis = Array.from(listEl.children);
        let firstP = null;
        lis.forEach(li => {
          const p = document.createElement('p');
          for (const child of li.childNodes) {
            if (child.nodeType === 1 && child.tagName === 'INPUT') continue;
            p.appendChild(child.cloneNode(true));
          }
          p.innerHTML = p.innerHTML.replaceAll('\u200b', '').replaceAll('\u200B', '');
          if (!p.hasChildNodes() || !p.textContent.trim()) {
            p.innerHTML = '';
            p.appendChild(document.createTextNode('\u00a0'));
          }
          listEl.before(p);
          if (!firstP) firstP = p;
        });
        listEl.remove();
        
        if (firstP) {
          const nr = document.createRange();
          nr.setStart(firstP.firstChild || firstP, 0);
          nr.collapse(true);
          sel.removeAllRanges();
          sel.addRange(nr);
        }
      }
    } else {
      // Transition from standard UL/OL to Checklist
      const targetUl = changeTagName(listEl, 'ul');
      targetUl.classList.add('an-checklist');
      ensureCheckboxes(targetUl);
      
      // Place caret inside the first LI
      const firstLi = targetUl.querySelector('li');
      if (firstLi) {
        const nr = document.createRange();
        nr.selectNodeContents(firstLi);
        nr.collapse(false);
        sel.removeAllRanges();
        sel.addRange(nr);
      }
    }
  } else {
    // Selection is not in a list: use native UL then upgrade to checklist
    execCommand('insertUnorderedList');
    
    const freshSel = globalThis.getSelection();
    if (!freshSel?.rangeCount) return;
    let freshContainer = freshSel.getRangeAt(0).commonAncestorContainer;
    if (freshContainer.nodeType === 3) freshContainer = freshContainer.parentElement;
    
    const freshList = freshContainer?.closest('ul, ol');
    if (freshList) {
      freshList.classList.add('an-checklist');
      if (freshList.tagName === 'OL') {
        changeTagName(freshList, 'ul');
      }
      
      ensureCheckboxes(freshList);
      
      const firstLi = freshList.querySelector('li');
      if (firstLi) {
        const nr = document.createRange();
        const textNode = firstLi.lastChild || firstLi;
        const offset = textNode.nodeType === Node.TEXT_NODE ? textNode.textContent.length : 0;
        nr.setStart(textNode, offset);
        nr.collapse(true);
        freshSel.removeAllRanges();
        freshSel.addRange(nr);
      }
    }
  }
}

/**
 * Returns true when the cursor is inside a checklist item.
 * @returns {boolean}
 */
export function isInChecklist() {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return false;
  let container = sel.getRangeAt(0).commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  return !!(/** @type {Element|null} */ (container)?.closest('.an-checklist li'));
}
