/**
 * Style.js - Formatting commands and style queries.
 *
 * Every command is a DOM transform from format.js (inline, block, list, link)
 * or insert.js (insertion). None of them calls `document.execCommand`: see
 * docs/EXEC_COMMAND_MIGRATION.md.
 */

import { closest, isElement, isPara, repairListNesting } from '../core/dom.js';
import { currentRange } from '../core/range.js';
import {
  insertHTMLNative, insertTextNative, insertLineBreakNative, insertHorizontalRuleNative,
} from './insert.js';
import * as F from './format.js';

export {
  isInlineActive, setInline, applyStyle, removeFormat, createLink, unlink,
  currentBlockTag, currentFontFamily, currentAlign, absorbPlaceholder,
} from './format.js';

// ---------------------------------------------------------------------------
// Command dispatch
// ---------------------------------------------------------------------------

/** `<font size>` 1–7 as pixel sizes, for the legacy `fontSize` command value. */
const LEGACY_FONT_SIZES = ['10px', '13px', '16px', '18px', '24px', '32px', '48px'];

/**
 * The commands `execCommand` accepts, under the names `document.execCommand`
 * gave them so existing plugin code keeps working.
 * @type {Record<string, (value: any) => boolean|void>}
 */
const COMMANDS = {
  bold: () => F.setInline('bold'),
  italic: () => F.setInline('italic'),
  underline: () => F.setInline('underline'),
  strikeThrough: () => F.setInline('strikethrough'),
  superscript: () => F.setInline('superscript'),
  subscript: () => F.setInline('subscript'),
  foreColor: (v) => F.applyStyle('color', String(v)),
  hiliteColor: (v) => F.applyStyle('background-color', String(v)),
  backColor: (v) => F.applyStyle('background-color', String(v)),
  fontName: (v) => F.applyStyle('font-family', String(v)),
  fontSize: (v) => F.applyStyle('font-size', /^[1-7]$/.test(String(v)) ? LEGACY_FONT_SIZES[Number(v) - 1] : String(v)),
  formatBlock: (v) => F.formatBlock(String(v)),
  justifyLeft: () => F.align('left'),
  justifyCenter: () => F.align('center'),
  justifyRight: () => F.align('right'),
  justifyFull: () => F.align('justify'),
  indent: () => indent(),
  outdent: () => outdent(),
  insertUnorderedList: () => insertUnorderedList(),
  insertOrderedList: () => insertOrderedList(),
  createLink: (v) => F.createLink(String(v)).length > 0,
  unlink: () => F.unlink(),
  removeFormat: () => F.removeFormat(),
  insertHTML: (v) => insertHTMLNative(String(v ?? '')),
  insertText: (v) => insertTextNative(String(v ?? '')),
  insertLineBreak: () => insertLineBreakNative(),
  insertHorizontalRule: () => insertHorizontalRuleNative(),
};

/**
 * Runs a formatting command on the current selection. The names are those of
 * `document.execCommand`, which this replaces; nothing here calls it.
 * @param {string} cmd
 * @param {any} [value]
 * @returns {boolean} false when the command is unknown or had nothing to act on
 */
export function execCommand(cmd, value = null) {
  const run = COMMANDS[cmd];
  if (!run) {
    console.warn(`[AutumnNote] execCommand: unsupported command "${cmd}".`);
    return false;
  }
  return run(value) !== false;
}

// ---------------------------------------------------------------------------
// Inline style helpers
// ---------------------------------------------------------------------------

/** Bolds / unbolds the selection. */
export const bold = () => F.setInline('bold');

/** Italicises / un-italicises the selection. */
export const italic = () => F.setInline('italic');

/** Underlines / un-underlines the selection. */
export const underline = () => F.setInline('underline');

/** Strikethrough / removes strikethrough. */
export const strikethrough = () => F.setInline('strikethrough');

/** Superscript toggle. */
export const superscript = () => F.setInline('superscript');

/** Subscript toggle. */
export const subscript = () => F.setInline('subscript');

/**
 * Sets the foreground colour of the selected text.
 * @param {string} color - CSS colour string
 */
export const foreColor = (color) => F.applyStyle('color', color);

/**
 * Sets the background (highlight) colour of the selected text.
 * @param {string} color - CSS colour string
 */
export const backColor = (color) => F.applyStyle('background-color', color);

/**
 * Sets the font family for the selection.
 * @param {string} name
 */
export const fontName = (name) => F.applyStyle('font-family', name);

/**
 * Sets the font size for the selection, or for what is typed next when the
 * selection is collapsed.
 * @param {string} size - e.g. '14px'
 * @param {HTMLElement|Document} [editable] - restricts the command to this editor
 */
export function fontSize(size, editable = document) {
  F.applyStyle('font-size', size, editable instanceof HTMLElement ? editable : undefined);
}

// ---------------------------------------------------------------------------
// Block style helpers
// ---------------------------------------------------------------------------

/**
 * Changes the selected blocks to the given tag (p, h1-h6, blockquote, pre).
 * @param {string} tagName
 */
export const formatBlock = (tagName) => F.formatBlock(tagName);

/** Left-aligns the current block. */
export const justifyLeft = () => F.align('left');

/** Center-aligns the current block. */
export const justifyCenter = () => F.align('center');

/** Right-aligns the current block. */
export const justifyRight = () => F.align('right');

/** Fully justifies the current block. */
export const justifyFull = () => F.align('justify');

/**
 * Indents the list or block.
 */
export function indent() {
  F.indent();
  // Content from older versions (or pasted) can hold a sublist as a sibling
  // of its item; repair it while we are here — see repairListNesting.
  repairListNesting(_selectionListRoot());
}

/**
 * The outermost list containing the selection, or null when there is none.
 * @returns {Element|null}
 */
function _selectionListRoot() {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return null;
  let node = sel.getRangeAt(0).commonAncestorContainer;
  if (node.nodeType === 3) node = node.parentElement;
  let outermost = null;
  for (let cur = /** @type {Element|null} */ (node); cur; cur = cur.parentElement) {
    if (cur.nodeName === 'UL' || cur.nodeName === 'OL') outermost = cur;
  }
  return outermost;
}

/**
 * Outdents the list or block.
 * G.5: When cursor is inside a checklist item, "outdent" means converting
 * that item back to a regular <p> element.
 */
export function outdent() {
  const sel = globalThis.getSelection();
  if (sel?.rangeCount) {
    let container = sel.getRangeAt(0).commonAncestorContainer;
    if (container.nodeType === 3) container = container.parentElement;
    const checkLi = /** @type {Element|null} */ (container)?.closest('.an-checklist li');
    // A nested checklist item moves up a level like any other item.
    if (checkLi && !checkLi.parentElement?.closest('li')) {
      _checklistItemToP(/** @type {HTMLElement} */ (checkLi));
      return;
    }
  }
  F.outdent();
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
 * Helper to get the closest ul/ol element containing the current selection.
 * @returns {Element|null}
 */
function getSelectedList() {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return null;
  let container = sel.getRangeAt(0).commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  return /** @type {Element|null} */ (container)?.closest('ul, ol') || null;
}

/**
 * Strips the checklist class and checkbox inputs from a list element.
 * @param {Element} listEl
 */
function stripChecklist(listEl) {
  listEl.classList.remove('an-checklist');
  listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.remove());
}

/**
 * Inserts an unordered (bulleted) list, or converts the current list to `<ul>`.
 *
 * Checklists are converted here, since only this module knows about the
 * `an-checklist` class and the checkbox `<input>` elements.
 *
 * Transition paths:
 * - **Checklist → UL**: strips `an-checklist` class and all checkbox inputs;
 *   converts `<ol>` container to `<ul>` via `changeTagName()` if needed.
 * - **OL → UL**: swaps the container tag via `changeTagName()`.
 * - **UL → paragraphs**: the selected items become paragraphs (`toggleList`).
 * - **No list → UL**: the selected blocks become list items (`toggleList`).
 */
export function insertUnorderedList() {
  const listEl = getSelectedList();
  if (listEl) {
    if (listEl.classList.contains('an-checklist')) {
      // Checklist → UL: strip checkboxes and class, swap tag if needed
      stripChecklist(listEl);
      if (listEl.tagName === 'OL') F.toggleList('ul');
    } else if (listEl.tagName === 'OL') {
      // OL → UL: swap container tag
      F.toggleList('ul');
    } else {
      // Already UL → back to paragraphs
      F.toggleList('ul');
    }
  } else {
    F.toggleList('ul');
  }
}

/**
 * Inserts an ordered (numbered) list, or converts the current list to `<ol>`.
 *
 * Checklists are converted here, since only this module knows about the
 * `an-checklist` class and the checkbox `<input>` elements.
 *
 * Transition paths:
 * - **Checklist → OL**: strips `an-checklist` class and all checkbox inputs;
 *   converts container to `<ol>` via `changeTagName()`.
 * - **UL → OL**: swaps the container tag via `changeTagName()`.
 * - **OL → paragraphs**: the selected items become paragraphs (`toggleList`).
 * - **No list → OL**: the selected blocks become list items (`toggleList`).
 */
export function insertOrderedList() {
  const listEl = getSelectedList();
  if (listEl) {
    if (listEl.classList.contains('an-checklist')) {
      // Checklist → OL: strip checkboxes and class, swap to <ol>
      stripChecklist(listEl);
      if (listEl.tagName === 'UL') F.toggleList('ol');
    } else if (listEl.tagName === 'UL') {
      // UL → OL: swap container tag
      F.toggleList('ol');
    } else {
      // Already OL → back to paragraphs
      F.toggleList('ol');
    }
  } else {
    F.toggleList('ol');
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
    bold: F.isInlineActive('bold', editable),
    italic: F.isInlineActive('italic', editable),
    underline: F.isInlineActive('underline', editable),
    strikethrough: F.isInlineActive('strikethrough', editable),
    superscript: F.isInlineActive('superscript', editable),
    subscript: F.isInlineActive('subscript', editable),
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

  const listEl = /** @type {Element|null} */ (container)?.closest('ul, ol');
  if (listEl) {
    if (listEl.classList.contains('an-checklist')) {
      // Transition from Checklist to Paragraphs (Toggle off checklist entirely)
      const parent = listEl.parentNode;
      if (parent) {
        const lis = Array.from(listEl.children);
        let /** @type {HTMLParagraphElement|null} */ firstP = null;
        lis.forEach(li => {
          const p = document.createElement('p');
          for (const child of li.childNodes) {
            if (child.nodeType === 1 && /** @type {Element} */ (child).tagName === 'INPUT') continue;
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
    // Selection is not in a list: build the checklist directly via DOM
    // manipulation.
    // The editable root itself is a <div> and must never be treated as a
    // "block" to convert/replace/remove — otherwise selections that include
    // raw text nodes sitting directly inside it (e.g. the first line typed
    // into an empty editor) would destroy the .an-editable element.
    const editableRoot = /** @type {Element|null} */ (container)?.closest('[contenteditable="true"]');
    const isCollapsed = range.collapsed;
    if (isCollapsed) {
      // Find the nearest block-level ancestor (p, div, li, h1-h6, blockquote,
      // etc.) and convert it into a single checklist item.
      const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI']);
      let block = /** @type {Element|null} */ (container);
      while (block?.parentNode && block !== editableRoot && !BLOCK_TAGS.has(block.tagName)) {
        block = /** @type {Element|null} */ (block.parentNode);
      }
      if (block === editableRoot) block = null;
      // Fallback: if no block element found (e.g. cursor directly in editable
      // root), insert a fresh item with a zero-width-space so the cursor ends
      // up inside it.
      const itemText = (block && BLOCK_TAGS.has(block.tagName))
        ? Array.from(block.childNodes)
            .map((n) => n.textContent)
            .join('')
            .replaceAll('\u00a0', ' ')
        : '';

      const newUl = document.createElement('ul');
      newUl.className = 'an-checklist';
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.contentEditable = 'false';
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(itemText || '\u200B'));
      newUl.appendChild(li);

      if (block && BLOCK_TAGS.has(block.tagName)) {
        block.parentNode.replaceChild(newUl, block);
      } else {
        // Cursor directly in editable root — insert via Range API.
        const nativeRange = sel.getRangeAt(0);
        nativeRange.deleteContents();
        nativeRange.insertNode(newUl);
      }

      // Move caret to the text node inside the new <li>.
      const textNode = li.lastChild;
      const nr = document.createRange();
      const offset = textNode.nodeType === Node.TEXT_NODE ? textNode.textContent.length : 0;
      nr.setStart(textNode, offset);
      nr.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nr);
      return;
    }

    // Non-collapsed selection — convert each intersected block element into
    // a checklist item using direct DOM manipulation.
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
      let blockEl = /** @type {Element|null} */ (node.nodeType === Node.TEXT_NODE ? node.parentElement : node);
      while (blockEl && blockEl !== editableRoot && !BLOCK_TAGS_MULTI.has(blockEl.tagName)) {
        blockEl = blockEl.parentElement;
      }
      if (blockEl === editableRoot) blockEl = null;
      if (blockEl && !seenBlocks.has(blockEl)) {
        seenBlocks.add(blockEl);
        blocks.push(blockEl);
      }
    }

    if (blocks.length === 0) return;

    // Build checklist and replace collected blocks.
    const newUl = document.createElement('ul');
    newUl.className = 'an-checklist';
    /** @type {Text|null} */ let lastTextNode = null;
    blocks.forEach((block) => {
      const li = document.createElement('li');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.contentEditable = 'false';
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
    blocks.forEach((block) => block.remove());

    // Move caret to end of the last checklist item.
    if (lastTextNode) {
      const nr = document.createRange();
      nr.setStart(lastTextNode, lastTextNode.textContent.length);
      nr.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nr);
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
