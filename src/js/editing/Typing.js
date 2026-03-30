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
      event.preventDefault();
      execCommand('insertText', '    ');
      return true;
    }

    // Default: insert &nbsp; * tabSize
    if (options.tabSize) {
      event.preventDefault();
      execCommand('insertText', ' '.repeat(options.tabSize));
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // Enter key — keep consistent paragraph insertion
  // -------------------------------------------------------------------------
  if (isKey(event, key.ENTER) && !event.shiftKey) {
    const range = currentRange(editable);
    if (!range) return false;
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
