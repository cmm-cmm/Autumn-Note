/**
 * SlashMenu.js — Notion-style "/" command palette for quick block insertion.
 *
 * Typing "/" as the very first character of an otherwise-empty block opens a
 * filterable list of quick-insert commands (headings, lists, table, image, …).
 * Arrow keys navigate, Enter/Tab selects, Escape or deleting back past the
 * "/" closes it. Disabled via `slashMenu: false`.
 *
 * Positioning follows the same synchronous-caret-rect technique as Mention.js:
 * getBoundingClientRect() on a zero-width Range over the trigger character is
 * reliable while the triggering DOM event is still live, but often returns an
 * empty rect once deferred into a callback — so the rect is captured eagerly
 * in `_onInput`, not lazily when the menu is rendered.
 */

import { on } from '../core/dom.js';

export class SlashMenu {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    this._disposers = [];

    /** @type {HTMLElement|null} */
    this._menu = null;
    /** @type {Array<{id: string, label: string, keywords: string, run: () => void}>} */
    this._filtered = [];
    this._activeIndex = -1;
    this._open = false;
    this._query = '';
    /** @type {Text|null} */
    this._textNode = null;
    this._triggerOffset = 0;
    /** @type {DOMRect|null} */
    this._caretRect = null;
  }

  initialize() {
    if (this.options.slashMenu === false) return this;
    const editable = this.context.layoutInfo.editable;
    const d1 = on(editable, 'input', () => this._onInput());
    const d2 = on(editable, 'keydown', (e) => this._onKeydown(e));
    const d3 = on(document, 'click', (e) => this._onDocClick(e));
    this._disposers.push(d1, d2, d3);
    return this;
  }

  destroy() {
    this._menu?.remove();
    this._menu = null;
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }

  // ---------------------------------------------------------------------------
  // Command list
  // ---------------------------------------------------------------------------

  _commands() {
    const L = this.context.locale.slashMenu;
    const ctx = this.context;
    const builtIns = [
      { id: 'h1', label: L.heading1, keywords: 'h1 heading title', run: () => ctx.invoke('editor.formatBlock', 'h1') },
      { id: 'h2', label: L.heading2, keywords: 'h2 heading subtitle', run: () => ctx.invoke('editor.formatBlock', 'h2') },
      { id: 'h3', label: L.heading3, keywords: 'h3 heading', run: () => ctx.invoke('editor.formatBlock', 'h3') },
      { id: 'ul', label: L.bulletList, keywords: 'ul bullet list unordered', run: () => ctx.invoke('editor.insertUL') },
      { id: 'ol', label: L.numberedList, keywords: 'ol numbered list ordered', run: () => ctx.invoke('editor.insertOL') },
      { id: 'checklist', label: L.checklist, keywords: 'checklist todo checkbox task', run: () => ctx.invoke('editor.toggleChecklist') },
      { id: 'quote', label: L.blockquote, keywords: 'quote blockquote', run: () => ctx.invoke('editor.formatBlock', 'blockquote') },
      { id: 'code', label: L.codeBlock, keywords: 'code pre block', run: () => ctx.invoke('editor.formatBlock', 'pre') },
      { id: 'hr', label: L.horizontalRule, keywords: 'hr divider rule line', run: () => ctx.invoke('editor.insertHr') },
      { id: 'table', label: L.table, keywords: 'table grid', run: () => ctx.invoke('editor.insertTable', 3, 3) },
      { id: 'image', label: L.image, keywords: 'image picture photo upload', run: () => ctx.invoke('imageDialog.show') },
    ];
    const custom = (this.options.slashCommands || []).map((command) => ({
      id: command.id,
      label: command.label || command.id,
      keywords: command.keywords || '',
      run: () => command.run(ctx),
    }));
    return [...builtIns, ...custom];
  }

  refresh() {
    if (this._open) this._filterAndRender();
  }

  // ---------------------------------------------------------------------------
  // Menu DOM
  // ---------------------------------------------------------------------------

  _buildMenu() {
    const el = document.createElement('div');
    el.className = 'an-slash-menu';
    el.setAttribute('role', 'listbox');
    el.style.display = 'none';

    el.addEventListener('mousedown', (e) => e.preventDefault());
    el.addEventListener('click', (e) => {
      const item = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target)?.closest('.an-slash-menu-item'));
      if (item) this._select(+item.dataset.index);
    });
    el.addEventListener('mousemove', (e) => {
      const item = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target)?.closest('.an-slash-menu-item'));
      if (item) this._highlight(+item.dataset.index);
    });

    document.body.appendChild(el);
    this._menu = el;
    return el;
  }

  _renderItems() {
    if (!this._menu) this._buildMenu();
    const menu = this._menu;
    const L = this.context.locale.slashMenu;

    if (this._filtered.length === 0) {
      menu.innerHTML = '';
      const empty = document.createElement('div');
      empty.className = 'an-slash-menu-empty';
      empty.textContent = L.noResults;
      menu.appendChild(empty);
      this._activeIndex = -1;
      return;
    }

    const frag = document.createDocumentFragment();
    this._filtered.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'an-slash-menu-item';
      row.setAttribute('role', 'option');
      row.id = `an-slash-option-${item.id}`;
      row.dataset.index = String(i);
      row.textContent = item.label;
      frag.appendChild(row);
    });
    menu.innerHTML = '';
    menu.appendChild(frag);
    this._highlight(0);
  }

  _highlight(index) {
    if (!this._menu) return;
    this._menu.querySelectorAll('.an-slash-menu-item').forEach((el, i) => {
      const active = i === index;
      el.classList.toggle('an-slash-menu-active', active);
      el.setAttribute('aria-selected', String(active));
      if (active) this._menu.setAttribute('aria-activedescendant', el.id);
    });
    this._activeIndex = index;
  }

  _position() {
    const menu = this._menu;
    const rect = this._caretRect;
    if (!menu || !rect || rect.height === 0) return;

    menu.style.visibility = 'hidden';
    menu.style.display = 'block';
    const mh = menu.offsetHeight;
    const mw = menu.offsetWidth;

    let top = rect.bottom + 4;
    let left = rect.left;
    if (rect.bottom + mh + 8 > globalThis.innerHeight) {
      top = rect.top - mh - 4;
    }
    left = Math.max(8, Math.min(left, globalThis.innerWidth - mw - 8));

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = '';
  }

  _open_() {
    this._open = true;
    this._filterAndRender();
    this._position();
  }

  _close() {
    if (this._menu) this._menu.style.display = 'none';
    this._open = false;
    this._filtered = [];
    this._activeIndex = -1;
    this._menu?.removeAttribute('aria-activedescendant');
    this._textNode = null;
    this._caretRect = null;
    this._query = '';
  }

  // ---------------------------------------------------------------------------
  // Trigger detection
  // ---------------------------------------------------------------------------

  _isBlock(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const display = globalThis.getComputedStyle(node).display;
    return display === 'block' || display === 'list-item' || display === 'table-cell';
  }

  /**
   * Detects a "/" trigger at the caret, requiring it to be the only content
   * typed so far in its block (i.e. the block's text is exactly "/" + query,
   * nothing before or after). This deliberately avoids firing mid-sentence
   * (e.g. "10/20", "and/or").
   * @returns {{ query: string, textNode: Text, triggerOffset: number } | null}
   */
  _getTriggerContext() {
    const sel = globalThis.getSelection();
    if (!sel?.rangeCount) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return null;

    const editable = this.context.layoutInfo.editable;
    if (!editable.contains(range.startContainer)) return null;
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return null;

    let block = range.startContainer.parentNode;
    while (block && block !== editable && !this._isBlock(block)) block = block.parentNode;
    if (!block || block === editable) return null;

    const fullText = block.textContent || '';
    const beforeRange = document.createRange();
    beforeRange.setStart(block, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const before = beforeRange.toString();

    const m = /^\/(\S*)$/.exec(before);
    if (!m) return null;
    if (fullText.length > before.length) return null; // content after the caret

    return {
      query: m[1],
      textNode: /** @type {Text} */ (range.startContainer),
      triggerOffset: range.startOffset - m[0].length,
    };
  }

  /**
   * Captures the caret rect synchronously — see file header for why this
   * can't be deferred to a later tick.
   */
  _captureCaretRect(textNode, triggerOffset) {
    try {
      const r = document.createRange();
      const end = Math.min(triggerOffset + 1, textNode.textContent.length);
      r.setStart(textNode, triggerOffset);
      r.setEnd(textNode, end);
      const candidate = r.getBoundingClientRect();
      if (candidate.height > 0) return candidate;
    } catch (_) { void _; }

    const sel = globalThis.getSelection();
    if (!sel?.rangeCount) return null;
    const rects = sel.getRangeAt(0).getClientRects();
    return rects.length > 0 ? rects[rects.length - 1] : null;
  }

  _filterAndRender() {
    const q = this._query.toLowerCase();
    this._filtered = q
      ? this._commands().filter((c) => c.keywords.includes(q) || c.label.toLowerCase().includes(q))
      : this._commands();
    this._renderItems();
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  _onInput() {
    const ctx = this._getTriggerContext();
    if (!ctx) {
      if (this._open) this._close();
      return;
    }

    this._textNode = ctx.textNode;
    this._triggerOffset = ctx.triggerOffset;
    this._query = ctx.query;
    this._caretRect = this._captureCaretRect(ctx.textNode, ctx.triggerOffset);

    if (!this._open) this._open_();
    else { this._filterAndRender(); this._position(); }
  }

  _onKeydown(e) {
    if (!this._open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this._filtered.length === 0) return;
      this._highlight((this._activeIndex + 1) % this._filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this._filtered.length === 0) return;
      this._highlight((this._activeIndex - 1 + this._filtered.length) % this._filtered.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (this._activeIndex >= 0) {
        e.preventDefault();
        this._select(this._activeIndex);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
    }
  }

  _onDocClick(e) {
    if (!this._open) return;
    if (this._menu?.contains(e.target)) return;
    this._close();
  }

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  _deleteTriggerText() {
    const node = this._textNode;
    if (!node?.isConnected) return;
    const before = node.textContent.slice(0, this._triggerOffset);
    const after = node.textContent.slice(this._triggerOffset + 1 + this._query.length);
    node.textContent = before + after;

    const sel = globalThis.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStart(node, this._triggerOffset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  _makeTriggerRemover() {
    const node = this._textNode;
    const triggerOffset = this._triggerOffset;
    const query = this._query;
    return () => {
      if (!node?.isConnected) return;
      const before = node.textContent.slice(0, triggerOffset);
      const after = node.textContent.slice(triggerOffset + 1 + query.length);
      node.textContent = before + after;

      const sel = globalThis.getSelection();
      if (!sel) return;
      const range = document.createRange();
      range.setStart(node, triggerOffset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    };
  }

  _select(index) {
    const item = this._filtered[index];
    if (!item) return;

    if (item.id === 'image') {
      const beforeInsert = this._makeTriggerRemover();
      this._close();
      this.context.invoke('imageDialog.show', { beforeInsert });
      return;
    }

    this._deleteTriggerText();
    this._close();
    // Editor.* methods invoked by commands already call afterCommand()
    // internally (toolbar/statusbar refresh + debounced undo snapshot + the
    // 'change' event), so no manual triggerEvent here — see Editor.js.
    item.run();
  }
}
