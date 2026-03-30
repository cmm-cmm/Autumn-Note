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
    // We do NOT also listen to keyup for afterCommand — oninput covers every case
    // and avoids calling afterCommand twice per keystroke.
    const onInput = () => this.afterCommand();
    // Refresh toolbar on selection change, scoped to this editor
    const onSelChange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editable.contains(sel.anchorNode)) {
        this.context.invoke('toolbar.refresh');
      }
    };

    this._disposers.push(
      on(editable, 'keydown', onKeydown),
      on(editable, 'input', onInput),
      on(document, 'selectionchange', onSelChange),
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

    // Show keyboard shortcuts dialog: Shift+?
    if (event.key === '?' && event.shiftKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.context.invoke('shortcutsDialog.show');
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
  insertImage(src, alt = '') {
    const safeSrc = sanitiseUrl(src, { allowData: true });
    if (!safeSrc) return;
    Style.execCommand('insertHTML', `<img src="${this._escapeAttr(safeSrc)}" alt="${this._escapeAttr(alt)}" class="an-image">`);
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
    insertTable(cols, rows);
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
