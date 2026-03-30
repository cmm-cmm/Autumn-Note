/**
 * Codeview.js - HTML source code view / WYSIWYG toggle
 * Inspired by Summernote's Codeview module
 */

import { createElement } from '../core/dom.js';
import { sanitiseHTML } from '../core/sanitise.js';

export class Codeview {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    this._active = false;
    /** @type {HTMLTextAreaElement|null} */
    this._textarea = null;
    this._disposers = [];
  }

  initialize() {
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._textarea && this._textarea.parentNode) {
      this._textarea.parentNode.removeChild(this._textarea);
    }
    this._textarea = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  toggle() {
    if (this._active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  isActive() {
    return this._active;
  }

  activate() {
    if (this._active) return;
    const { editable } = this.context.layoutInfo;
    const html = editable.innerHTML;

    this._textarea = createElement('textarea', {
      class: 'an-codeview',
      spellcheck: 'false',
      autocomplete: 'off',
      autocorrect: 'off',
      autocapitalize: 'off',
    });
    this._textarea.value = this._prettyPrint(html);

    editable.style.display = 'none';
    editable.parentNode.insertBefore(this._textarea, editable.nextSibling);

    this._active = true;
    this.context.invoke('toolbar.refresh');
  }

  deactivate() {
    if (!this._active || !this._textarea) return;
    const { editable } = this.context.layoutInfo;
    // Sanitise the HTML typed in the textarea before applying (allow iframes for video embeds)
    editable.innerHTML = sanitiseHTML(this._textarea.value, { allowIframes: true });
    this._textarea.parentNode.removeChild(this._textarea);
    this._textarea = null;
    editable.style.display = '';
    this._active = false;
    this.context.invoke('toolbar.refresh');
    this.context.invoke('editor.afterCommand');
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Very simple HTML pretty-printer (indent nested tags).
   * @param {string} html
   * @returns {string}
   */
  _prettyPrint(html) {
    let indent = 0;
    return html
      .replace(/>\s*</g, '>\n<')
      .split('\n')
      .map((line) => {
        const stripped = line.trim();
        if (!stripped) return '';
        if (/^<\//.test(stripped)) indent = Math.max(0, indent - 1);
        const out = '  '.repeat(indent) + stripped;
        if (/^<[^/][^>]*[^/]>/.test(stripped) && !/^<(br|hr|img|input|link|meta)/.test(stripped)) {
          indent++;
        }
        return out;
      })
      .filter(Boolean)
      .join('\n');
  }

}

