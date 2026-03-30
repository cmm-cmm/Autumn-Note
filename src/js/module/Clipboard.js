/**
 * Clipboard.js - Handles paste events to strip unwanted formatting
 * Inspired by Summernote's Clipboard module
 */

import { on } from '../core/dom.js';
import { execCommand } from '../editing/Style.js';

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
      const clean = this._sanitiseHTML(raw);
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
   * Removes dangerous elements and attributes from an HTML string.
   * NOTE: This is a basic sanitiser. For production use, consider a dedicated
   * library such as DOMPurify.
   * @param {string} html
   * @returns {string}
   */
  _sanitiseHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove dangerous elements
    const prohibited = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
    prohibited.forEach((tag) => {
      doc.querySelectorAll(tag).forEach((el) => el.parentNode.removeChild(el));
    });

    // Strip event handler attributes
    doc.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
      // Strip javascript: and data: (except img src) from URL attributes
      ['href', 'src', 'action', 'formaction'].forEach((attrName) => {
        const val = el.getAttribute(attrName);
        if (!val) return;
        if (/^\s*javascript:/i.test(val)) { el.removeAttribute(attrName); return; }
        if (/^\s*data:/i.test(val) && !(attrName === 'src' && el.tagName === 'IMG')) {
          el.removeAttribute(attrName);
        }
      });
    });

    return doc.body.innerHTML;
  }

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
