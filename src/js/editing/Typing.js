/**
 * Typing.js - Keyboard typing event handling (Enter, Tab, Backspace behaviour)
 * Inspired by Summernote's Typing module
 */

import { key, isKey } from '../core/key.js';
import { closestPara, isLi } from '../core/dom.js';
import { execCommand } from './Style.js';
import { currentRange } from '../core/range.js';

/**
 * Handles special keydown behaviour inside the editor.
 * @param {KeyboardEvent} event
 * @param {HTMLElement} editable
 * @param {object} options - editor options
 * @returns {boolean} true if the event was consumed
 */
export function handleKeydown(event, editable, options = {}) {
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

    // Video wrapper — Enter should create a new paragraph after the wrapper,
    // not split the wrapper's container and produce an empty video clone.
    const sc = range.sc;
    const el = sc.nodeType === 3 ? sc.parentElement : sc;
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
      const nativeRange = sel.getRangeAt(0);

      // Extract content from cursor to end of li into a fragment
      const afterRange = document.createRange();
      afterRange.setStart(nativeRange.endContainer, nativeRange.endOffset);
      afterRange.setEnd(checkLi, checkLi.childNodes.length);
      const afterFrag = afterRange.extractContents();

      // Check if text remaining before cursor (excl checkbox) is empty
      const textBefore = Array.from(checkLi.childNodes)
        .filter((n) => !(n.nodeType === 1 && n.tagName === 'INPUT'))
        .map((n) => n.textContent).join('').replace(/\u00a0/g, ' ').trim();

      if (!textBefore) {
        // Empty item — exit checklist, insert <p> after list
        const p = document.createElement('p');
        const afterText = afterFrag.textContent.replace(/\u00a0/g, ' ').trim();
        p.textContent = afterText || '\u00a0';
        ul.parentNode.insertBefore(p, ul.nextSibling);
        checkLi.remove();
        if (ul.children.length === 0) ul.remove();
        const nr = document.createRange();
        nr.setStart(p, 0);
        nr.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nr);
      } else {
        // Create new checklist item; move after-cursor content into it
        const newLi = document.createElement('li');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.setAttribute('contenteditable', 'false');
        newLi.appendChild(cb);
        let cursorNode;
        if (afterFrag.textContent.length > 0) {
          newLi.appendChild(afterFrag);
          cursorNode = newLi.childNodes[1]; // first node after checkbox
        } else {
          cursorNode = document.createTextNode('\u00a0');
          newLi.appendChild(cursorNode);
        }
        checkLi.insertAdjacentElement('afterend', newLi);
        const nr = document.createRange();
        nr.setStart(cursorNode, 0);
        nr.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nr);
      }
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
