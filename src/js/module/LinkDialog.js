/**
 * LinkDialog.js - Dialog for inserting / editing hyperlinks
 * Inspired by Summernote's LinkDialog — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';
import { withSavedRange } from '../core/range.js';

export class LinkDialog {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    /** @type {HTMLElement|null} */
    this._dialog = null;
    this._disposers = [];
    this._savedRange = null;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this._dialog = this._buildDialog();
    document.body.appendChild(this._dialog);
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._dialog && this._dialog.parentNode) {
      this._dialog.parentNode.removeChild(this._dialog);
    }
    this._dialog = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Opens the link dialog.
   * Pre-fills with the currently selected link if present.
   */
  show() {
    withSavedRange((range) => {
      this._savedRange = range;
    });
    this._prefill();
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const overlay = createElement('div', { class: 'asn-dialog-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Insert link' });
    const box = createElement('div', { class: 'asn-dialog-box' });

    const title = createElement('h3', { class: 'asn-dialog-title' });
    title.textContent = 'Insert Link';

    // URL field
    const urlLabel = createElement('label', { class: 'asn-label' });
    urlLabel.textContent = 'URL';
    const urlInput = createElement('input', {
      type: 'url',
      class: 'asn-input',
      placeholder: 'https://',
      id: 'asn-link-url',
      name: 'url',
      autocomplete: 'off',
    });
    this._urlInput = urlInput;

    // Text field
    const textLabel = createElement('label', { class: 'asn-label' });
    textLabel.textContent = 'Display Text';
    const textInput = createElement('input', {
      type: 'text',
      class: 'asn-input',
      placeholder: 'Link text',
      id: 'asn-link-text',
      name: 'linkText',
      autocomplete: 'off',
    });
    this._textInput = textInput;

    // Open in new tab
    const tabLabel = createElement('label', { class: 'asn-label asn-label-inline' });
    const tabCheckbox = createElement('input', {
      type: 'checkbox',
      id: 'asn-link-newtab',
      name: 'openInNewTab',
    });
    this._tabCheckbox = tabCheckbox;
    tabLabel.appendChild(tabCheckbox);
    tabLabel.appendChild(document.createTextNode(' Open in new tab'));

    // Buttons
    const btnRow = createElement('div', { class: 'asn-dialog-actions' });
    const insertBtn = createElement('button', { type: 'button', class: 'asn-btn asn-btn-primary' });
    insertBtn.textContent = 'Insert';
    const cancelBtn = createElement('button', { type: 'button', class: 'asn-btn' });
    cancelBtn.textContent = 'Cancel';
    btnRow.appendChild(insertBtn);
    btnRow.appendChild(cancelBtn);

    box.append(title, urlLabel, urlInput, textLabel, textInput, tabLabel, btnRow);
    overlay.appendChild(box);

    // Events
    const d1 = on(insertBtn, 'click', () => this._onInsert());
    const d2 = on(cancelBtn, 'click', () => this._close());
    const d3 = on(overlay, 'click', (e) => { if (e.target === overlay) this._close(); });
    this._disposers.push(d1, d2, d3);

    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _prefill() {
    // Try to find currently selected anchor
    const sel = window.getSelection();
    let anchor = null;
    if (sel && sel.rangeCount > 0) {
      let node = sel.getRangeAt(0).startContainer;
      while (node) {
        if (node.nodeName === 'A') { anchor = node; break; }
        node = node.parentNode;
      }
    }
    if (anchor) {
      this._urlInput.value = anchor.getAttribute('href') || '';
      this._textInput.value = anchor.textContent || '';
      this._tabCheckbox.checked = anchor.getAttribute('target') === '_blank';
    } else {
      this._urlInput.value = '';
      this._textInput.value = sel ? sel.toString() : '';
      this._tabCheckbox.checked = false;
    }
  }

  _onInsert() {
    const url = this._urlInput.value.trim();
    const text = this._textInput.value.trim();
    const newTab = this._tabCheckbox.checked;

    if (!url) {
      this._urlInput.focus();
      return;
    }

    // Restore selection then insert
    if (this._savedRange) {
      this._savedRange.select();
    }

    this.context.invoke('editor.insertLink', url, text, newTab);
    this._close();
  }

  _open() {
    if (this._dialog) {
      this._dialog.style.display = 'flex';
      setTimeout(() => this._urlInput && this._urlInput.focus(), 50);
    }
  }

  _close() {
    if (this._dialog) this._dialog.style.display = 'none';
    this._savedRange = null;
  }
}
