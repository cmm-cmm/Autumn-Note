/**
 * Editor.js - Core editing command module
 * Wraps all execCommand calls, undo/redo, and fires events via the context.
 * Inspired by Summernote's Editor module.
 */

import { History } from '../editing/History.js';
import * as Style from '../editing/Style.js';
import { insertTable } from '../editing/Table.js';
import { isModifier } from '../core/key.js';
import { handleKeydown } from '../editing/Typing.js';
import { on } from '../core/dom.js';
import { sanitiseHTML, sanitiseUrl } from '../core/sanitise.js';
import { markdownToHTML, htmlToMarkdown } from '../core/markdown.js';

export class Editor {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    /** @type {History|null} */
    this._history = null;
    this._disposers = [];
    /** @type {number|null} Timer handle for debounced undo snapshot */
    this._snapshotTimer = null;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    const editable = this.context.layoutInfo.editable;
    this._history = new History(editable, this.options.historyLimit || 100);
    this._bindEvents(editable);
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    this._history = null;
    clearTimeout(this._snapshotTimer);
    this._snapshotTimer = null;
  }

  // ---------------------------------------------------------------------------
  // Event binding
  // ---------------------------------------------------------------------------

  _bindEvents(editable) {
    // Keyboard shortcuts
    const onKeydown = (event) => this._onKeydown(event);
    // Catch ALL content mutations: typing, IME, spellcheck, voice, drag-drop text.
    const onInput = () => this.afterCommand();
    // Hard-enforce maxChars / maxWords before content is mutated
    const onBeforeInput = (event) => this._enforceLimit(event);
    // Refresh toolbar on selection change, scoped to this editor
    const onSelChange = () => {
      if (!this.context._alive) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editable.contains(sel.anchorNode)) {
        this.context.invoke('toolbar.refresh');
        if (typeof this.options.onSelectionChange === 'function') {
          this.options.onSelectionChange(this.context);
        }
      }
    };

    // Checklist checkboxes are contenteditable=false so native clicks work;
    // hook afterCommand so the checked state is preserved in undo history.
    const onCheckboxClick = (e) => {
      if (e.target.type === 'checkbox' && e.target.closest('.an-checklist')) {
        this.afterCommand();
      }
    };

    this._disposers.push(
      on(editable, 'keydown', onKeydown),
      on(editable, 'beforeinput', onBeforeInput),
      on(editable, 'input', onInput),
      on(document, 'selectionchange', onSelChange),
      on(editable, 'click', onCheckboxClick),
    );
  }

  _onKeydown(event) {
    const editable = this.context.layoutInfo.editable;

    // Let Typing module handle special keys (Tab, Enter etc.)
    if (handleKeydown(event, editable, this.options)) return;

    // Built-in shortcuts
    if (isModifier(event, 'z') && !event.shiftKey) {
      event.preventDefault();
      this.undo();
      return;
    }
    if ((isModifier(event, 'z') && event.shiftKey) || isModifier(event, 'y')) {
      event.preventDefault();
      this.redo();
      return;
    }
    if (isModifier(event, 'b')) { event.preventDefault(); this.bold(); return; }
    if (isModifier(event, 'i')) { event.preventDefault(); this.italic(); return; }
    if (isModifier(event, 'u')) { event.preventDefault(); this.underline(); return; }
    if (isModifier(event, 'k')) { event.preventDefault(); this.context.invoke('linkDialog.show'); return; }

    // Ctrl+Shift+V — paste as plain text (signals Clipboard module)
    if (isModifier(event, 'v') && event.shiftKey) {
      this.context.invoke('clipboard.setForcePlain', true);
      return; // let the native paste event fire
    }

    // Show keyboard shortcuts dialog: Ctrl+Shift+/
    if (event.key === '/' && event.shiftKey && event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.context.invoke('shortcutsDialog.show');
      return;
    }
    // Find: Ctrl+F
    if (isModifier(event, 'f')) {
      event.preventDefault();
      this.context.invoke('findReplace.show', 'find');
      return;
    }
    // Ctrl+H — Find & Replace
    if (isModifier(event, 'h')) {
      event.preventDefault();
      this.context.invoke('findReplace.show', 'replace');
    }
    // Ctrl+` — Inline Code
    if (isModifier(event, '`')) {
      event.preventDefault();
      this.inlineCode();
    }
  }

  // ---------------------------------------------------------------------------
  // Limit enforcement
  // ---------------------------------------------------------------------------

  /**
   * Called from beforeinput to block typing when char/word limits are reached.
   * Deletions and non-typing input types are always allowed.
   * @param {InputEvent} event
   */
  _enforceLimit(event) {
    const maxChars = this.options.maxChars || 0;
    const maxWords = this.options.maxWords || 0;
    if (!maxChars && !maxWords) return;

    const type = event.inputType || '';
    // Allow deletions, undo, redo and non-insert operations
    if (type.startsWith('delete') || type === 'historyUndo' || type === 'historyRedo') return;
    // Allow paste/drop — handled after the fact by Clipboard
    if (type === 'insertFromPaste' || type === 'insertFromDrop') return;
    // Only enforce for keyboard/IME/composition insertions
    if (!type.startsWith('insert')) return;

    const text = this.context.layoutInfo.editable.innerText || '';
    const chars = text.replace(/\n/g, '').length;

    if (maxChars && chars >= maxChars) {
      event.preventDefault();
      if (typeof this.options.onCharLimitReached === 'function') {
        this.options.onCharLimitReached(this.context);
      }
      return;
    }

    // Word limit: block space / newline insertion when already at the limit
    if (maxWords && (event.data === ' ' || type === 'insertParagraph' || type === 'insertLineBreak')) {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      if (words >= maxWords) {
        event.preventDefault();
        if (typeof this.options.onWordLimitReached === 'function') {
          this.options.onWordLimitReached(this.context);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Post-command hook — records undo, fires change event
  // ---------------------------------------------------------------------------

  afterCommand() {
    // Immediate: keep toolbar and statusbar in sync on every mutation.
    this.context.invoke('toolbar.refresh');
    this.context.invoke('statusbar.update');
    // Debounced: recording an undo snapshot and firing the change event require
    // a full innerHTML serialization. Batching rapid keystrokes prevents the
    // browser from re-serializing large content (e.g. embedded images) on every
    // single key press.
    this._scheduleSnapshot();
  }

  /**
   * Schedules a debounced undo snapshot + change event.
   * Resets the timer on each call so rapid typing produces one snapshot.
   */
  _scheduleSnapshot() {
    clearTimeout(this._snapshotTimer);
    this._snapshotTimer = setTimeout(() => {
      this._snapshotTimer = null;
      if (this._history) this._history.recordUndo();
      this.context.triggerEvent('change', this.getHTML());
    }, 400);
  }

  // ---------------------------------------------------------------------------
  // Focus management
  // ---------------------------------------------------------------------------

  focus() {
    const editable = this.context.layoutInfo.editable;
    editable.focus();
  }

  // ---------------------------------------------------------------------------
  // Content API
  // ---------------------------------------------------------------------------

  /**
   * Returns the editor HTML content.
   * @returns {string}
   */
  getHTML() {
    // Strip zero-width spaces inserted after icons to allow caret placement.
    const raw = this.context.layoutInfo.editable.innerHTML.replace(/\u200B/g, '');
    // Replace any blob: URLs (lightweight DOM references to pasted/dropped images)
    // with their original data URLs so the returned HTML is fully self-contained.
    return this.context.invoke('clipboard.resolveImages', raw) ?? raw;
  }

  /**
   * Sets the editor HTML content.
   * @param {string} html - HTML string (will be sanitised)
   */
  setHTML(html) {
    this.context.layoutInfo.editable.innerHTML = sanitiseHTML(html);
    if (this._history) this._history.reset();
    this.afterCommand();
  }

  /**
   * Returns the editor plain text content.
   * @returns {string}
   */
  getText() {
    return this.context.layoutInfo.editable.innerText || '';
  }

  /**
   * Sets the editor content as plain text.
   * @param {string} text
   */
  setText(text) {
    this.context.layoutInfo.editable.textContent = text;
    if (this._history) this._history.reset();
    this.afterCommand();
  }

  /**
   * Clears the editor content.
   */
  clear() {
    this.setHTML('');
  }

  /**
   * Resets the undo/redo history stack.
   */
  clearHistory() {
    if (this._history) this._history.reset();
  }

  /**
   * Returns true when the editor has no meaningful content.
   * @returns {boolean}
   */
  isEmpty() {
    const text = (this.context.layoutInfo.editable.innerText || '')
      .trim()
      .replace(/\u00a0/g, '');
    const hasMedia = !!this.context.layoutInfo.editable.querySelector('img, video, iframe, table');
    return !text && !hasMedia;
  }

  /**
   * Inserts HTML at the current cursor position.
   * @param {string} html
   */
  insertHTML(html) {
    if (!html) return;
    Style.execCommand('insertHTML', sanitiseHTML(html));
    this.afterCommand();
  }

  /**
   * Inserts plain text at the current cursor position.
   * @param {string} text
   */
  insertText(text) {
    if (!text) return;
    Style.execCommand('insertText', text);
    this.afterCommand();
  }

  /**
   * Sets editor content from a Markdown string.
   * @param {string} md
   */
  setMarkdown(md) {
    this.setHTML(markdownToHTML(md || ''));
  }

  /**
   * Returns the editor content as Markdown.
   * @returns {string}
   */
  getMarkdown() {
    return htmlToMarkdown(this.getHTML());
  }

  // ---------------------------------------------------------------------------
  // Undo / redo
  // ---------------------------------------------------------------------------

  undo() {
    if (this._history) {
      clearTimeout(this._snapshotTimer);
      this._snapshotTimer = null;
      this._history.undo();
      this.context.invoke('toolbar.refresh');
      this.context.invoke('statusbar.update');
      this.context.triggerEvent('change', this.getHTML());
    }
  }

  redo() {
    if (this._history) {
      clearTimeout(this._snapshotTimer);
      this._snapshotTimer = null;
      this._history.redo();
      this.context.invoke('toolbar.refresh');
      this.context.invoke('statusbar.update');
      this.context.triggerEvent('change', this.getHTML());
    }
  }

  canUndo() {
    return this._history ? this._history.canUndo() : false;
  }

  canRedo() {
    return this._history ? this._history.canRedo() : false;
  }

  // ---------------------------------------------------------------------------
  // Style commands (delegated to Style module)
  // ---------------------------------------------------------------------------

  bold()          { Style.bold();            this.afterCommand(); }
  italic()        { Style.italic();          this.afterCommand(); }
  underline()     { Style.underline();        this.afterCommand(); }
  strikethrough() { Style.strikethrough();    this.afterCommand(); }
  superscript()   { Style.superscript();      this.afterCommand(); }
  subscript()     { Style.subscript();        this.afterCommand(); }
  justifyLeft()   { Style.justifyLeft();      this.afterCommand(); }
  justifyCenter() { Style.justifyCenter();    this.afterCommand(); }
  justifyRight()  { Style.justifyRight();     this.afterCommand(); }
  justifyFull()   { Style.justifyFull();      this.afterCommand(); }
  indent()        { Style.indent();           this.afterCommand(); }
  outdent()       { Style.outdent();          this.afterCommand(); }
  insertUL()      { Style.insertUnorderedList(); this.afterCommand(); }
  insertOL()      { Style.insertOrderedList();   this.afterCommand(); }
  inlineCode()    { Style.toggleInlineCode(this.context.layoutInfo.editable); this.afterCommand(); }
  toggleChecklist() { Style.toggleChecklist(); this.afterCommand(); }
  print()           { this.context.print(); }

  /**
   * @param {string} tagName - e.g. 'h1', 'p', 'blockquote'
   */
  formatBlock(tagName) { Style.formatBlock(tagName); this.afterCommand(); }

  /**
   * @param {string} color
   */
  foreColor(color) { Style.foreColor(color); this.afterCommand(); }

  /**
   * @param {string} color
   */
  backColor(color) { Style.backColor(color); this.afterCommand(); }

  /**
   * @param {string} name
   */
  fontName(name) { Style.fontName(name); this.afterCommand(); }

  /**
   * @param {string} size - e.g. '14px'
   */
  fontSize(size) { Style.fontSize(size, this.context.layoutInfo.editable); this.afterCommand(); }

  // ---------------------------------------------------------------------------
  // Insert helpers
  // ---------------------------------------------------------------------------

  /**
   * Inserts a horizontal rule at the cursor.
   */
  insertHr() {
    Style.execCommand('insertHorizontalRule');
    this.afterCommand();
  }

  /**
   * Creates a link at the current selection.
   * @param {string} url
   * @param {string} text
   * @param {boolean} [openInNewTab=false]
   */
  insertLink(url, text, openInNewTab = false) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const safeUrl = sanitiseUrl(url);
    if (!safeUrl) return;

    const hasText = sel.toString().trim().length > 0;
    if (!hasText) {
      const displayText = this._escapeAttr(text || safeUrl);
      Style.execCommand('insertHTML', `<a href="${this._escapeAttr(safeUrl)}"${openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${displayText}</a>`);
    } else {
      Style.execCommand('createLink', safeUrl);
      if (openInNewTab) {
        const link = this._getClosestAnchor();
        if (link) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
    this.afterCommand();
  }

  /**
   * Removes the link from the selected anchor.
   */
  unlink() {
    Style.execCommand('unlink');
    this.afterCommand();
  }

  /**
   * Inserts an image.
   * @param {string} src - URL or data-URI
   * @param {string} [alt]
   */
  insertImage(src, alt = '', align = '') {
    const safeSrc = sanitiseUrl(src, { allowData: true });
    if (!safeSrc) return;
    const styleMap = {
      left:   'float:left;margin:0 1em 1em 0',
      center: 'display:block;margin:0 auto',
      right:  'float:right;margin:0 0 1em 1em',
    };
    const style = styleMap[align] || '';
    const styleAttr = style ? ` style="${style}"` : '';
    Style.execCommand('insertHTML', `<img src="${this._escapeAttr(safeSrc)}" alt="${this._escapeAttr(alt)}" class="an-image"${styleAttr}>`);
    this.afterCommand();
  }

  /**
   * Inserts a video embed (iframe or <video> element).
   * The html string is already validated/built by VideoDialog.
   * @param {string} html
   */
  insertVideo(html) {
    if (!html) return;
    Style.execCommand('insertHTML', html);
    this.afterCommand();
  }

  /**
   * Inserts a table.
   * @param {number} cols
   * @param {number} rows
   */
  insertTable(cols, rows) {
    insertTable(cols, rows, { headerRow: this.context.options.tableHeaderRow });
    this.afterCommand();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  _getClosestAnchor() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.getRangeAt(0).startContainer;
    while (node) {
      if (node.nodeName === 'A') return node;
      node = node.parentNode;
    }
    return null;
  }

  /**
   * Escapes a string for safe use inside an HTML attribute value.
   * @param {string} str
   * @returns {string}
   */
  _escapeAttr(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // --- delegated to shared sanitise.js ---
}
