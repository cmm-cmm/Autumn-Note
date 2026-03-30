/**
 * Clipboard.js - Handles paste events to strip unwanted formatting
 * Inspired by Summernote's Clipboard module
 */

import { on } from '../core/dom.js';
import { execCommand } from '../editing/Style.js';
import { sanitiseHTML } from '../core/sanitise.js';

export class Clipboard {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    this._disposers = [];
  }

  initialize() {
    const editable = this.context.layoutInfo.editable;
    const d = on(editable, 'paste', (event) => this._onPaste(event));
    this._disposers.push(d);
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }

  // ---------------------------------------------------------------------------
  // Paste handler
  // ---------------------------------------------------------------------------

  _onPaste(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    // Force plain-text only — strip all formatting
    if (this.options.pasteAsPlainText) {
      event.preventDefault();
      const text = clipboardData.getData('text/plain');
      const html = text
        .split(/\r?\n/)
        .map((line) => `<p>${this._escapeHTML(line) || '<br>'}</p>`)
        .join('');
      execCommand('insertHTML', html);
      this.context.invoke('editor.afterCommand');
      return;
    }

    // Default path: sanitise HTML on paste when pasteCleanHTML is true (default)
    if (this.options.pasteCleanHTML !== false && clipboardData.types.includes('text/html')) {
      event.preventDefault();
      const raw = clipboardData.getData('text/html');
      const clean = sanitiseHTML(raw);
      execCommand('insertHTML', clean);
      this.context.invoke('editor.afterCommand');
      return;
    }

    // Otherwise let the browser handle paste natively
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Escapes HTML special characters.
   * @param {string} str
   * @returns {string}
   */
  _escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
