/**
 * ImageDialog.js - Dialog for inserting images (by URL or file upload)
 * Inspired by Summernote's ImageDialog — rewritten without jQuery
 */

import { createElement, on, trapFocus } from '../core/dom.js';
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
      class: 'an-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Insert image',
    });
    const box = createElement('div', { class: 'an-dialog-box' });

    const title = createElement('h3', { class: 'an-dialog-title' });
    title.textContent = 'Insert Image';

    // URL tab
    const urlLabel = createElement('label', { class: 'an-label' });
    urlLabel.textContent = 'Image URL';
    const urlInput = createElement('input', {
      type: 'url',
      class: 'an-input',
      placeholder: 'https://example.com/image.png',
      autocomplete: 'off',
    });
    this._urlInput = urlInput;

    // Alt text
    const altLabel = createElement('label', { class: 'an-label' });
    altLabel.textContent = 'Alt Text';
    const altInput = createElement('input', {
      type: 'text',
      class: 'an-input',
      placeholder: 'Describe the image',
      autocomplete: 'off',
    });
    this._altInput = altInput;

    box.append(title, urlLabel, urlInput, altLabel, altInput);

    // Alignment
    const alignLabel = createElement('label', { class: 'an-label' });
    alignLabel.textContent = 'Alignment';
    const alignRow = createElement('div', { class: 'an-align-row' });
    const alignOptions = [
      { value: '',       label: 'None'   },
      { value: 'left',   label: 'Left'   },
      { value: 'center', label: 'Center' },
      { value: 'right',  label: 'Right'  },
    ];
    alignOptions.forEach(({ value, label }) => {
      const radioId = `an-align-${value || 'none'}`;
      const radio = createElement('input', { type: 'radio', name: 'an-img-align', id: radioId, value });
      if (value === '') radio.checked = true;
      const lbl = createElement('label', { for: radioId, class: 'an-align-label' });
      lbl.textContent = label;
      alignRow.append(radio, lbl);
    });
    this._alignRow = alignRow;
    box.append(alignLabel, alignRow);
    if (this.options.allowImageUpload !== false) {
      const fileLabel = createElement('label', { class: 'an-label' });
      fileLabel.textContent = 'Or upload a file';
      const fileInput = createElement('input', {
        type: 'file',
        class: 'an-input',
        accept: 'image/*',
      });
      this._fileInput = fileInput;
      const d = on(fileInput, 'change', () => this._onFileChange());
      this._disposers.push(d);
      box.append(fileLabel, fileInput);
    }

    // Buttons
    const btnRow = createElement('div', { class: 'an-dialog-actions' });
    const insertBtn = createElement('button', { type: 'button', class: 'an-btn an-btn-primary' });
    insertBtn.textContent = 'Insert';
    const cancelBtn = createElement('button', { type: 'button', class: 'an-btn' });
    cancelBtn.textContent = 'Cancel';
    btnRow.appendChild(insertBtn);
    btnRow.appendChild(cancelBtn);

    box.append(btnRow);
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
      const message = `Image file is too large. Maximum allowed size is ${this.options.maxImageSize || 5} MB.`;
      console.warn('[AutumnNote] ImageDialog:', message);
      this.context.triggerEvent('imageError', { file, message });
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
    const alignRadio = this._alignRow && this._alignRow.querySelector('input[name="an-img-align"]:checked');
    const align = alignRadio ? alignRadio.value : '';

    if (!src) {
      this._urlInput.focus();
      return;
    }

    if (this._savedRange) {
      this._savedRange.select();
    }

    this.context.invoke('editor.insertImage', src, alt, align);
    this._close();
  }

  _open() {
    if (this._dialog) {
      this._dialog.style.display = 'flex';
      this._removeTrap = trapFocus(this._dialog, () => this._close());
      setTimeout(() => this._urlInput && this._urlInput.focus(), 50);
    }
  }

  _close() {
    if (this._dialog) this._dialog.style.display = 'none';
    if (this._removeTrap) { this._removeTrap(); this._removeTrap = null; }
    this._savedRange = null;
  }
}
