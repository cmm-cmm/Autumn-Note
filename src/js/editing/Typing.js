/**
 * Typing.js - Keyboard typing event handling (Enter, Tab, Backspace behaviour)
 * Inspired by Summernote's Typing module
 */

import { key, isKey } from '../core/key.js';
import { closestPara, isLi } from '../core/dom.js';
import { execCommand } from './Style.js';
import { currentRange } from '../core/range.js';

// ---------------------------------------------------------------------------
// Module-level predicates — defined once, not re-created on every keypress.
// Previously these were arrow functions inside handleKeydown() which fires
// at ~120+ events/sec during normal typing.
// ---------------------------------------------------------------------------
const _FA_PATTERN = /\bfa-/;
const isFAIcon = (n) => !!(n && n.nodeName === 'I' && _FA_PATTERN.test(n.className || ''));
const isZwsAnchor = (n) => !!(n && n.nodeType === Node.TEXT_NODE && (n.textContent === '\u200B' || n.textContent === ''));

/**
 * Handles special keydown behaviour inside the editor.
 * @param {KeyboardEvent} event
 * @param {HTMLElement} editable
 * @param {object} options - editor options
 * @returns {boolean} true if the event was consumed
 */
export function handleKeydown(event, editable, options = {}) {
  const moveCaret = (setFn) => {
    const sel = window.getSelection();
    if (!sel) return false;
    const nr = document.createRange();
    setFn(nr);
    nr.collapse(true);
    sel.removeAllRanges();
    sel.addRange(nr);
    return true;
  };

  // -------------------------------------------------------------------------
  // Backspace key — one-press deletion of a preceding FA icon (<i> element)
  // -------------------------------------------------------------------------
  if (isKey(event, key.BACKSPACE)) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (r.collapsed && r.startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = r.startContainer;
        // Case A: cursor at offset 0, preceding sibling is an FA icon
        if (r.startOffset === 0 && isFAIcon(textNode.previousSibling)) {
          event.preventDefault();
          textNode.previousSibling.remove();
          return true;
        }

        // Case B: cursor at offset 1 of a ZWS-only text node whose preceding
        // sibling is an FA icon. The ZWS is the invisible caret anchor inserted
        // by IconDialog; treat the whole Backspace as "delete icon + its anchor".
        if (r.startOffset === 1 && textNode.textContent === '\u200B' &&
            isFAIcon(textNode.previousSibling)) {
          event.preventDefault();
          textNode.previousSibling.remove();
          textNode.remove();
          return true;
        }
      }
    }
    return false;
  }

  // -------------------------------------------------------------------------
  // ArrowLeft / ArrowRight — one-press navigation across FA icon nodes
  // -------------------------------------------------------------------------
  if (isKey(event, key.LEFT) || isKey(event, key.RIGHT)) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;

    const r = sel.getRangeAt(0);
    if (!r.collapsed) return false;

    const sc = r.startContainer;
    const movingLeft = isKey(event, key.LEFT);

    if (sc.nodeType === Node.TEXT_NODE) {
      const textNode = sc;

      if (movingLeft &&
          r.startOffset === 1 &&
          textNode.textContent === '\u200B' &&
          isFAIcon(textNode.previousSibling)) {
        event.preventDefault();
        return moveCaret((nr) => nr.setStartBefore(textNode.previousSibling));
      }

      if (movingLeft && r.startOffset === 0 && isFAIcon(textNode.previousSibling)) {
        event.preventDefault();
        return moveCaret((nr) => nr.setStartBefore(textNode.previousSibling));
      }

      if (movingLeft &&
          r.startOffset === 0 &&
          isZwsAnchor(textNode.previousSibling) &&
          isFAIcon(textNode.previousSibling.previousSibling)) {
        event.preventDefault();
        return moveCaret((nr) => nr.setStartBefore(textNode.previousSibling.previousSibling));
      }

      if (!movingLeft &&
          r.startOffset === textNode.textContent.length &&
          isFAIcon(textNode.nextSibling)) {
        const icon = textNode.nextSibling;
        const after = icon.nextSibling;
        event.preventDefault();
        if (after && after.nodeType === Node.TEXT_NODE) {
          const offset = ((after.textContent || '').startsWith('\u200B')) ? 1 : 0;
          return moveCaret((nr) => nr.setStart(after, Math.min(offset, after.textContent.length)));
        }
        return moveCaret((nr) => nr.setStartAfter(icon));
      }

      if (!movingLeft &&
          r.startOffset === textNode.textContent.length &&
          isZwsAnchor(textNode.nextSibling) &&
          isFAIcon(textNode.nextSibling.nextSibling)) {
        const icon = textNode.nextSibling.nextSibling;
        const after = icon.nextSibling;
        event.preventDefault();
        if (after && after.nodeType === Node.TEXT_NODE) {
          const offset = ((after.textContent || '').startsWith('\u200B')) ? 1 : 0;
          return moveCaret((nr) => nr.setStart(after, Math.min(offset, after.textContent.length)));
        }
        return moveCaret((nr) => nr.setStartAfter(icon));
      }
    }

    if (sc.nodeType === Node.ELEMENT_NODE) {
      const el = sc;
      if (movingLeft && r.startOffset > 0) {
        const prev = el.childNodes[r.startOffset - 1];
        if (isFAIcon(prev)) {
          event.preventDefault();
          return moveCaret((nr) => nr.setStartBefore(prev));
        }
        if (isZwsAnchor(prev) && isFAIcon(prev.previousSibling)) {
          event.preventDefault();
          return moveCaret((nr) => nr.setStartBefore(prev.previousSibling));
        }
      }
      if (!movingLeft && r.startOffset < el.childNodes.length) {
        const next = el.childNodes[r.startOffset];
        if (isFAIcon(next)) {
          const after = next.nextSibling;
          event.preventDefault();
          if (after && after.nodeType === Node.TEXT_NODE) {
            const offset = ((after.textContent || '').startsWith('\u200B')) ? 1 : 0;
            return moveCaret((nr) => nr.setStart(after, Math.min(offset, after.textContent.length)));
          }
          return moveCaret((nr) => nr.setStartAfter(next));
        }
        if (isZwsAnchor(next) && isFAIcon(next.nextSibling)) {
          const icon = next.nextSibling;
          const after = icon.nextSibling;
          event.preventDefault();
          if (after && after.nodeType === Node.TEXT_NODE) {
            const offset = ((after.textContent || '').startsWith('\u200B')) ? 1 : 0;
            return moveCaret((nr) => nr.setStart(after, Math.min(offset, after.textContent.length)));
          }
          return moveCaret((nr) => nr.setStartAfter(icon));
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Tab key — indent / outdent list items, or insert soft tab in code blocks
  // -------------------------------------------------------------------------
  if (isKey(event, key.TAB)) {
    const range = currentRange(editable);
    if (!range) return false;

    const para = closestPara(range.sc, editable);
    if (para && isLi(para)) {
      event.preventDefault();
      if (event.shiftKey) {
        execCommand('outdent');
      } else {
        execCommand('indent');
      }
      return true;
    }

    // In a pre/code block, insert spaces
    if (para && para.nodeName.toUpperCase() === 'PRE') {
      if (event.shiftKey) return false;
      event.preventDefault();
      execCommand('insertText', '    ');
      return true;
    }

    // Default: insert &nbsp; * tabSize
    if (options.tabSize) {
      if (event.shiftKey) return false;
      event.preventDefault();
      execCommand('insertText', ' '.repeat(options.tabSize));
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // Shift+Enter — insert <br> instead of opening a new block element
  // -------------------------------------------------------------------------
  if (isKey(event, key.ENTER) && event.shiftKey) {
    event.preventDefault();
    execCommand('insertLineBreak');
    return true;
  }

  // -------------------------------------------------------------------------
  // Enter key — keep consistent paragraph insertion
  // -------------------------------------------------------------------------
  if (isKey(event, key.ENTER) && !event.shiftKey) {
    const range = currentRange(editable);
    if (!range) return false;

    // Hoist sc/el once so all guards below can reuse them.
    const sc = range.sc;
    const el = sc.nodeType === 3 ? sc.parentElement : sc;

    // Guard: if the cursor is inside a <i> FA icon element (zero text children,
    // rendered entirely by CSS ::before), pressing Enter would split the block
    // and leave an orphan <i> in the new paragraph — visually an "auto-created
    // icon". Push the cursor to just after the <i> first, then fall through so
    // the browser fires its default Enter at a safe text boundary.
    if (el && el.nodeName === 'I' && /\bfa-/.test(el.className || '')) {
      const nr = document.createRange();
      nr.setStartAfter(el);
      nr.collapse(true);
      const selI = window.getSelection();
      if (selI) { selI.removeAllRanges(); selI.addRange(nr); }
      return false; // cursor is now outside <i> — let browser default handle Enter
    }

    // Video wrapper — Enter should create a new paragraph after the wrapper,
    // not split the wrapper's container and produce an empty video clone.
    const videoWrapper = el && el.closest && el.closest('.an-video-wrapper');
    if (videoWrapper) {
      event.preventDefault();
      const p = document.createElement('p');
      p.innerHTML = '\u00a0';
      videoWrapper.parentNode.insertBefore(p, videoWrapper.nextSibling);
      const nr = document.createRange();
      nr.setStart(p, 0);
      nr.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(nr);
      return true;
    }

    // Checklist — Enter creates new item; empty item exits the list
    const checkLi = el && el.closest && el.closest('.an-checklist li');
    if (checkLi) {
      event.preventDefault();
      const ul = checkLi.closest('.an-checklist');
      const sel = window.getSelection();
      let nativeRange = sel.getRangeAt(0);

      // Helper: get trimmed text content of a li, excluding the checkbox INPUT.
      // Strip both \u00a0 (placeholder nbsp) and \u200B (ZWS cursor anchors).
      const liText = (li) =>
        Array.from(li.childNodes)
          .filter((n) => !(n.nodeType === 1 && n.tagName === 'INPUT'))
          .map((n) => n.textContent).join('').replace(/[\u00a0\u200B]/g, ' ').trim();

      // 1. Check if the ENTIRE item is empty BEFORE any DOM mutation.
      //    (Do NOT check only the "before-cursor" part — that check incorrectly
      //    exits the list when cursor is at the start of a non-empty item.)
      if (!liText(checkLi)) {
        // Empty item — exit checklist, insert <p> after list
        const p = document.createElement('p');
        p.innerHTML = '\u00a0';
        ul.parentNode.insertBefore(p, ul.nextSibling);
        checkLi.remove();
        if (ul.children.length === 0) ul.remove();
        const nr = document.createRange();
        nr.setStart(p.firstChild, 0);
        nr.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nr);
        return true;
      }

      // 2. If selection is not collapsed, delete the selected content first —
      //    mirrors browser-default Enter behaviour (delete selection, then split).
      if (!nativeRange.collapsed) {
        nativeRange.deleteContents();
        // nativeRange is now collapsed at the deletion point; re-read it
        nativeRange = sel.getRangeAt(0);
      }

      // 3. Extract everything from cursor to end of li into afterFrag.
      //    Use startContainer/startOffset (cursor position after potential delete),
      //    NOT endContainer/endOffset which is wrong for non-collapsed ranges.
      const afterRange = document.createRange();
      afterRange.setStart(nativeRange.startContainer, nativeRange.startOffset);
      afterRange.setEnd(checkLi, checkLi.childNodes.length);
      const afterFrag = afterRange.extractContents();

      // 4. Build the new checklist item with the extracted "after" content.
      const newLi = document.createElement('li');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.setAttribute('contenteditable', 'false');
      newLi.appendChild(cb);

      // Append extracted "after" content (if any) then insert the new item.
      if (afterFrag.textContent.replace(/[\u00a0\u200B]/g, '').length > 0) {
        newLi.appendChild(afterFrag);
      }

      // Always ensure a text node exists so the cursor has a text-level
      // anchor. Use \u200B (zero-width space) instead of an empty string:
      // Chrome does not reliably honour a Selection in an empty text node and
      // may normalise it to element-level, placing the caret before the
      // absolutely-positioned checkbox.  \u200B is stripped by getHTML().
      let cursorNode = newLi.childNodes[1]; // first child after checkbox
      if (!cursorNode || cursorNode.nodeType !== Node.TEXT_NODE) {
        cursorNode = document.createTextNode('\u200B');
        newLi.appendChild(cursorNode);
      }
      checkLi.insertAdjacentElement('afterend', newLi);

      const nr = document.createRange();
      nr.setStart(cursorNode, 0);
      nr.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nr);
      return true;
    }

    const para = closestPara(range.sc, editable);

    // Pressing Enter at the end of a blockquote should exit it
    if (para && para.nodeName.toUpperCase() === 'BLOCKQUOTE') {
      const native = range.toNativeRange();
      native.setEnd(para, para.childNodes.length);
      if (native.toString() === '' && range.isCollapsed()) {
        event.preventDefault();
        execCommand('formatBlock', '<p>');
        return true;
      }
    }
  }

  return false;
}
