/**
 * MarkdownShortcuts.js — Convert Markdown-style syntax typed directly in the
 * editor into rich HTML elements (input rules / auto-format).
 *
 * Activated when `markdownShortcuts: true` (the default).
 *
 * Block rules — triggered by Space or Enter at the start of a line:
 *   #[#[#]]·     → H1 / H2 / H3
 *   >·           → blockquote
 *   -·  or *·   → unordered list item
 *   1.·          → ordered list item
 *   [ ]·         → checklist item
 *   ---          → horizontal rule  (on Enter)
 *   ```          → code block       (on Enter)
 *
 * Inline rules — triggered when the closing marker is typed:
 *   **text**     → <strong>
 *   *text*       → <em>
 *   ~~text~~     → <s>
 *   `code`       → <code>
 */

import { on } from '../core/dom.js';

export class MarkdownShortcuts {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    this._disposers = [];
  }

  initialize() {
    if (!this.options.markdownShortcuts) return this;
    const editable = this.context.layoutInfo.editable;
    const d1 = on(editable, 'keydown', /** @param {KeyboardEvent} e */ (e) => this._onKeydown(e));
    const d2 = on(editable, 'input', () => this._onInput());
    this._disposers.push(d1, d2);
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }

  // ---------------------------------------------------------------------------
  // Block rules (Space / Enter)
  // ---------------------------------------------------------------------------

  _onKeydown(e) {
    if (e.key === ' ') {
      if (this._applyBlockRule()) e.preventDefault();
    } else if (e.key === 'Enter') {
      if (this._applyEnterRule()) e.preventDefault();
    }
  }

  /**
   * Returns the plain text of the line the cursor is on, up to the cursor.
   * @returns {{ text: string, range: Range, lineNode: Node } | null}
   */
  _getLineContext() {
    const sel = globalThis.getSelection();
    if (!sel?.rangeCount) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return null;

    const editable = this.context.layoutInfo.editable;
    if (!editable.contains(range.startContainer)) return null;

    // Walk up to find the block-level ancestor inside the editable
    let node = range.startContainer;
    while (node && node !== editable && !this._isBlock(node)) {
      node = node.parentNode;
    }
    if (!node || node === editable) node = range.startContainer;

    // Collect all text content before the cursor within that block
    const tmpRange = document.createRange();
    tmpRange.setStart(node, 0);
    tmpRange.setEnd(range.startContainer, range.startOffset);
    const text = tmpRange.toString();

    return { text, range, lineNode: node };
  }

  _isBlock(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const display = globalThis.getComputedStyle(node).display;
    return display === 'block' || display === 'list-item' || display === 'table-cell';
  }

  /** Applies block rule on Space key. Returns true if a rule fired. */
  _applyBlockRule() {
    const ctx = this._getLineContext();
    if (!ctx) return false;
    const { text } = ctx;

    const blockPatterns = [
      { re: /^(#{1,3})$/, handler: (m) => this._convertToHeading(m[1].length) },
      { re: /^>$/, handler: () => this._convertToBlockquote() },
      { re: /^[-*]$/, handler: () => this._convertToList('ul') },
      { re: /^1\.$/, handler: () => this._convertToList('ol') },
      { re: /^\[ \]$/, handler: () => this._convertToChecklist() },
    ];

    for (const { re, handler } of blockPatterns) {
      const m = re.exec(text);
      if (m) {
        handler(m);
        return true;
      }
    }
    return false;
  }

  /** Applies block rule on Enter key (---, ```). Returns true if a rule fired. */
  _applyEnterRule() {
    const ctx = this._getLineContext();
    if (!ctx) return false;
    const { text } = ctx;

    if (/^-{3,}$/.test(text)) {
      this._convertToHr();
      return true;
    }
    if (/^`{3}/.test(text)) {
      this._convertToCodeBlock();
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Block converters
  // ---------------------------------------------------------------------------

  _selectLineAndDelete() {
    const sel = globalThis.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    // Select from the start of the block to the cursor and delete
    const startRange = document.createRange();
    startRange.setStart(range.startContainer.parentNode || range.startContainer, 0);
    startRange.setEnd(range.startContainer, range.startOffset);
    startRange.deleteContents();
  }

  _convertToHeading(level) {
    this._selectLineAndDelete();
    document.execCommand('formatBlock', false, `h${level}`);
    this.context.triggerEvent('change', this.context.getHTML());
  }

  _convertToBlockquote() {
    this._selectLineAndDelete();
    document.execCommand('formatBlock', false, 'blockquote');
    this.context.triggerEvent('change', this.context.getHTML());
  }

  _convertToList(type) {
    this._selectLineAndDelete();
    document.execCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
    this.context.triggerEvent('change', this.context.getHTML());
  }

  _convertToChecklist() {
    this._selectLineAndDelete();
    this.context.invoke('editor.checklist');
    this.context.triggerEvent('change', this.context.getHTML());
  }

  _convertToHr() {
    this._selectLineAndDelete();
    this.context.invoke('editor.insertHR');
    this.context.triggerEvent('change', this.context.getHTML());
  }

  _convertToCodeBlock() {
    this._selectLineAndDelete();
    document.execCommand('formatBlock', false, 'pre');
    this.context.triggerEvent('change', this.context.getHTML());
  }

  // ---------------------------------------------------------------------------
  // Inline rules (input event)
  // ---------------------------------------------------------------------------

  _onInput() {
    const sel = globalThis.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return;

    const editable = this.context.layoutInfo.editable;
    if (!editable.contains(range.startContainer)) return;

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent;
    const offset = range.startOffset;

    const inlineRules = [
      // **bold**
      { re: /\*\*(.+?)\*\*$/, tag: 'strong' },
      // *italic* (not part of **)
      { re: /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)$/, tag: 'em' },
      // ~~strike~~
      { re: /~~(.+?)~~$/, tag: 's' },
      // `code`
      { re: /`([^`]+)`$/, tag: 'code' },
    ];

    const upToCursor = text.slice(0, offset);
    for (const { re, tag } of inlineRules) {
      const m = re.exec(upToCursor);
      if (!m) continue;

      const matchStart = upToCursor.length - m[0].length;
      const matchEnd = offset;
      const innerText = m[1];

      // Replace matched text with formatted element
      const before = text.slice(0, matchStart);
      const after = text.slice(matchEnd);

      const el = document.createElement(tag);
      el.textContent = innerText;

      // Rebuild the text node and insert the element
      const beforeNode = document.createTextNode(before);
      const afterNode = document.createTextNode('​' + after);

      /** @type {ChildNode} */ (node).before(beforeNode, el, afterNode);
      /** @type {ChildNode} */ (node).remove();

      // Place cursor after the element (after the ZWS)
      const newRange = document.createRange();
      newRange.setStart(afterNode, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      this.context.triggerEvent('change', this.context.getHTML());
      break;
    }
  }
}
