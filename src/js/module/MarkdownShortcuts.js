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
 *   1.·  or 3)·  → ordered list item (a number other than 1 sets `start`)
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
import * as Style from '../editing/Style.js';

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
    const d1 = on(editable, 'keydown', (e) => this._onKeydown(/** @type {KeyboardEvent} */ (e)));
    const d2 = on(editable, 'input', (e) => this._onInput(/** @type {InputEvent} */ (e)));
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
    if (this._inCodeContext()) return;
    if (e.key === ' ') {
      if (this._applyBlockRule()) e.preventDefault();
    } else if (e.key === 'Enter') {
      if (this._applyEnterRule()) e.preventDefault();
    }
  }

  /**
   * True when the caret sits inside a code block or code span.
   *
   * Markdown syntax is literal text there: auto-formatting it rewrote the
   * user's own code — typing `**bold**` inside a <pre> produced a real
   * <strong> element in the middle of the snippet, and a backtick pair inside
   * an existing <code> nested a second <code> in it.
   * @returns {boolean}
   */
  _inCodeContext() {
    const sel = globalThis.getSelection();
    if (!sel?.rangeCount) return false;
    const node = sel.getRangeAt(0).startContainer;
    const el = /** @type {Element|null} */ (
      node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement
    );
    return !!el?.closest('pre, code');
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

  /**
   * Applies a block rule when Space is typed. Returns true if a rule fired.
   *
   * Called from keydown before the space is inserted, and from the input event
   * after it was (`spaceTyped`): virtual keyboards, IMEs, autocorrect and
   * dictation insert text without a usable keydown (`key` is "Unidentified"),
   * so the keydown path alone never fired for them.
   * @param {boolean} [spaceTyped] - the line already ends in the typed space
   */
  _applyBlockRule(spaceTyped = false) {
    const ctx = this._getLineContext();
    if (!ctx) return false;
    let { text } = ctx;
    if (spaceTyped) {
      // Chrome inserts a trailing space as U+00A0 in contenteditable.
      if (!/[ \u00a0]$/.test(text)) return false;
      text = text.slice(0, -1);
    }

    const blockPatterns = [
      { re: /^(#{1,6})$/, handler: (m) => this._convertToHeading(m[1].length) },
      { re: /^>$/, handler: () => this._convertToBlockquote() },
      { re: /^[-*+]$/, handler: () => this._convertToList('ul') },
      { re: /^(\d{1,9})[.)]$/, handler: (m) => this._convertToList('ol', Number(m[1])) },
      // `[x]` starts the item already ticked, matching the `- [x]` the
      // converter reads and writes.
      { re: /^\[([ xX])\]$/, handler: (m) => this._convertToChecklist(m[1].toLowerCase() === 'x') },
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

    // All three thematic-break spellings, matching what the converter parses.
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(text)) {
      this._convertToHr();
      return true;
    }
    if (/^(?:`{3}|~{3})/.test(text)) {
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
    Style.formatBlock(`h${level}`);
    this.context.triggerEvent('change', this.context.getHTML());
  }

  _convertToBlockquote() {
    this._selectLineAndDelete();
    Style.formatBlock('blockquote');
    this.context.triggerEvent('change', this.context.getHTML());
  }

  /**
   * @param {'ul'|'ol'} type
   * @param {number} [start] - first number of a new ordered list (`3.` → 3)
   */
  _convertToList(type, start = 1) {
    const list = this._listAtCaret();
    this._selectLineAndDelete();
    // Already in this kind of list (typing "2. " on the item Enter just made):
    // the marker is redundant. Converting again would toggle the list off.
    if (list?.tagName.toLowerCase() !== type || list.classList.contains('an-checklist')) {
      if (type === 'ul') Style.insertUnorderedList();
      else Style.insertOrderedList();
      const ol = type === 'ol' ? this._listAtCaret() : null;
      // Only a list this shortcut just made; one merged into a neighbour keeps its numbering.
      if (ol && start !== 1 && ol.children.length === 1) ol.setAttribute('start', String(start));
    }
    this.context.triggerEvent('change', this.context.getHTML());
  }

  /** @returns {HTMLElement|null} the list holding the caret, if any */
  _listAtCaret() {
    const sel = globalThis.getSelection();
    const node = sel?.rangeCount ? sel.getRangeAt(0).startContainer : null;
    const el = /** @type {Element|null} */ (
      node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement ?? null
    );
    const list = /** @type {HTMLElement|null} */ (el?.closest('ul, ol') ?? null);
    return list && this.context.layoutInfo.editable.contains(list) ? list : null;
  }

  /** @param {boolean} [checked] - start the new item ticked (from `[x]`) */
  _convertToChecklist(checked = false) {
    this._selectLineAndDelete();
    this.context.invoke('editor.toggleChecklist');
    if (checked) {
      const sel = globalThis.getSelection();
      const node = sel?.rangeCount ? sel.getRangeAt(0).startContainer : null;
      const el = /** @type {Element|null} */ (
        node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement ?? null
      );
      const box = /** @type {HTMLInputElement|null} */ (
        el?.closest('li')?.querySelector('input[type="checkbox"]') ?? null
      );
      if (box) box.checked = true;
    }
    this.context.triggerEvent('change', this.context.getHTML());
  }

  _convertToHr() {
    this._selectLineAndDelete();
    this.context.invoke('editor.insertHr');
    this.context.triggerEvent('change', this.context.getHTML());
  }

  _convertToCodeBlock() {
    this._selectLineAndDelete();
    Style.formatBlock('pre');
    this.context.triggerEvent('change', this.context.getHTML());
  }

  /**
   * True when this input event inserted text ending in a space, outside an
   * active IME composition (the composition commits its own text first).
   * @param {InputEvent} [e]
   * @returns {boolean}
   */
  _typedSpace(e) {
    if (!e || e.isComposing || typeof e.inputType !== 'string') return false;
    return e.inputType.startsWith('insert') && /[ \u00a0]$/.test(e.data ?? '');
  }

  // ---------------------------------------------------------------------------
  // Inline rules (input event)
  // ---------------------------------------------------------------------------

  /** @param {InputEvent} [e] */
  _onInput(e) {
    if (this._inCodeContext()) return;
    if (this._typedSpace(e) && this._applyBlockRule(true)) return;
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
