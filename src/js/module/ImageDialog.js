/**
 * ImageDialog.js - Dialog for inserting images (by URL or file upload)
 * Inspired by Summernote's ImageDialog — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';
import { withSavedRange } from '../core/range.js';

export class ImageDialog {
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

  show() {
    withSavedRange((range) => {
      this._savedRange = range;
    });
    this._urlInput.value = '';
    this._altInput.value = '';
    if (this._fileInput) this._fileInput.value = '';
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const overlay = createElement('div', {
      class: 'asn-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Insert image',
    });
    const box = createElement('div', { class: 'asn-dialog-box' });

    const title = createElement('h3', { class: 'asn-dialog-title' });
    title.textContent = 'Insert Image';

    // URL tab
    const urlLabel = createElement('label', { class: 'asn-label' });
    urlLabel.textContent = 'Image URL';
    const urlInput = createElement('input', {
      type: 'url',
      class: 'asn-input',
      placeholder: 'https://example.com/image.png',
      autocomplete: 'off',
    });
    this._urlInput = urlInput;

    // Alt text
    const altLabel = createElement('label', { class: 'asn-label' });
    altLabel.textContent = 'Alt Text';
    const altInput = createElement('input', {
      type: 'text',
      class: 'asn-input',
      placeholder: 'Describe the image',
      autocomplete: 'off',
    });
    this._altInput = altInput;

    // File upload (optional — embeds as base64)
    if (this.options.allowImageUpload !== false) {
      const fileLabel = createElement('label', { class: 'asn-label' });
      fileLabel.textContent = 'Or upload a file';
      const fileInput = createElement('input', {
        type: 'file',
        class: 'asn-input',
        accept: 'image/*',
      });
      this._fileInput = fileInput;
      const d = on(fileInput, 'change', () => this._onFileChange());
      this._disposers.push(d);
      box.append(fileLabel, fileInput);
    }

    // Buttons
    const btnRow = createElement('div', { class: 'asn-dialog-actions' });
    const insertBtn = createElement('button', { type: 'button', class: 'asn-btn asn-btn-primary' });
    insertBtn.textContent = 'Insert';
    const cancelBtn = createElement('button', { type: 'button', class: 'asn-btn' });
    cancelBtn.textContent = 'Cancel';
    btnRow.appendChild(insertBtn);
    btnRow.appendChild(cancelBtn);

    box.append(title, urlLabel, urlInput, altLabel, altInput, btnRow);
    overlay.appendChild(box);

    const d1 = on(insertBtn, 'click', () => this._onInsert());
    const d2 = on(cancelBtn, 'click', () => this._close());
    const d3 = on(overlay, 'click', (e) => { if (e.target === overlay) this._close(); });
    this._disposers.push(d1, d2, d3);

    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _onFileChange() {
    const file = this._fileInput && this._fileInput.files && this._fileInput.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    // Validate file size (max 5 MB by default)
    const maxSize = (this.options.maxImageSize || 5) * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Image file is too large. Maximum allowed size is ${this.options.maxImageSize || 5} MB.`);
      this._fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this._urlInput.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  _onInsert() {
    const src = this._urlInput.value.trim();
    const alt = this._altInput.value.trim();

    if (!src) {
      this._urlInput.focus();
      return;
    }

    if (this._savedRange) {
      this._savedRange.select();
    }

    this.context.invoke('editor.insertImage', src, alt);
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
