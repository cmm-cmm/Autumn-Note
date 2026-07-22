/**
 * ImageDialog.js - Dialog for inserting images (by URL or file upload)
 * Inspired by Summernote's ImageDialog — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

export class ImageDialog extends BaseDialog {
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * @param {{ beforeInsert?: () => void }} [hooks]
   */
  show({ beforeInsert } = {}) {
    this._beforeInsert = typeof beforeInsert === 'function' ? beforeInsert : null;
    this._saveRange();
    this._urlInput.value = '';
    this._altInput.value = '';
    if (this._fileInput) this._fileInput.value = '';
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const L = this.context.locale.imageDialog;
    const { overlay, box } = this._buildDialogShell(L.ariaLabel, ICON_SVG, L.title);

    // URL field
    const urlLabel = createElement('label', { class: 'an-label' });
    urlLabel.textContent = L.imageUrl;
    const urlInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'url',
      class: 'an-input',
      placeholder: L.urlPlaceholder,
      autocomplete: 'off',
    }));
    this._urlInput = urlInput;
    this._firstInput = urlInput;

    // Alt text
    const altLabel = createElement('label', { class: 'an-label' });
    altLabel.textContent = L.altText;
    const altInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'text',
      class: 'an-input',
      placeholder: L.altPlaceholder,
      autocomplete: 'off',
    }));
    this._altInput = altInput;

    box.append(urlLabel, urlInput, altLabel, altInput);

    // Alignment
    const alignLabel = createElement('label', { class: 'an-label' });
    alignLabel.textContent = L.alignment;
    const alignRow = createElement('div', { class: 'an-align-row' });
    const alignOptions = [
      { value: '',       label: L.alignNone   },
      { value: 'left',   label: L.alignLeft   },
      { value: 'center', label: L.alignCenter },
      { value: 'right',  label: L.alignRight  },
    ];
    alignOptions.forEach(({ value, label }) => {
      const radioId = `an-align-${value || 'none'}`;
      const radio = /** @type {HTMLInputElement} */ (createElement('input', { type: 'radio', name: 'an-img-align', id: radioId, value }));
      if (value === '') radio.checked = true;
      const lbl = createElement('label', { for: radioId, class: 'an-align-label' });
      lbl.textContent = label;
      alignRow.append(radio, lbl);
    });
    this._alignRow = alignRow;
    box.append(alignLabel, alignRow);

    if (this.options.allowImageUpload !== false) {
      const fileLabel = createElement('label', { class: 'an-label' });
      fileLabel.textContent = L.uploadLabel;
      const fileInput = /** @type {HTMLInputElement} */ (createElement('input', {
        type: 'file',
        class: 'an-input',
        accept: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/avif',
      }));
      this._fileInput = fileInput;
      // Hint line shown below the file input for format errors
      const fileHint = createElement('p', { class: 'an-dialog-hint' });
      this._fileHint = fileHint;
      const d = on(fileInput, 'change', () => this._onFileChange());
      this._disposers.push(d);
      box.append(fileLabel, fileInput, fileHint);
    }

    const btnRow = this._buildButtonRow(L.insertBtn, L.cancelBtn, () => this._onInsert());
    box.append(btnRow);

    const d4 = on(urlInput, 'keydown', (e) => { if (/** @type {KeyboardEvent} */ (e).key === 'Enter') { e.preventDefault(); this._onInsert(); } });
    const d5 = on(altInput, 'keydown', (e) => { if (/** @type {KeyboardEvent} */ (e).key === 'Enter') { e.preventDefault(); this._onInsert(); } });
    this._disposers.push(d4, d5);

    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _onFileChange() {
    if (this.context._alive === false) return;
    const file = this._fileInput?.files?.[0];
    if (!file?.type?.startsWith('image/')) return;

    // C2: Only allow web-displayable formats. TIFF, BMP, RAW and similar
    // formats are not rendered by browsers — reject them with a clear message.
    const SUPPORTED = new Set([
      'image/jpeg', 'image/png', 'image/gif',
      'image/webp', 'image/svg+xml', 'image/avif',
    ]);
    if (!SUPPORTED.has(file.type)) {
      const message = this.context.locale.errors.imageFormat(file.type);
      if (this._fileHint) this._fileHint.textContent = message;
      this.context.triggerEvent('imageError', { file, message });
      this._fileInput.value = '';
      return;
    }
    if (this._fileHint) this._fileHint.textContent = '';

    // Validate file size (max 5 MB by default)
    const maxSize = (this.options.maxImageSize || 5) * 1024 * 1024;
    if (file.size > maxSize) {
      const message = this.context.locale.errors.imageSize(this.options.maxImageSize || 5);
      if (this._fileHint) this._fileHint.textContent = message;
      console.warn('[AutumnNote] ImageDialog:', message);
      this.context.triggerEvent('imageError', { file, message });
      this._fileInput.value = '';
      return;
    }

    // Resize/compress via Clipboard's shared canvas pipeline so a file chosen
    // through this dialog gets the same treatment as a pasted/dropped image
    // instead of embedding the original (potentially multi-MB) file untouched.
    this.context.invoke('clipboard.compressAndRegister', file).then((blobUrl) => {
      if (this.context._alive === false) return;
      this._urlInput.value = blobUrl;
    }).catch((err) => {
      if (this.context._alive === false) return;
      // Compression failed (e.g. canvas unavailable) — fall back to embedding
      // the original file directly.
      console.warn('[AutumnNote] ImageDialog: image compression failed, using original file.', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        this._urlInput.value = /** @type {string} */ (e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  _onInsert() {
    const src = this._urlInput.value.trim();
    const alt = this._altInput.value.trim();
    const alignRadio = this._alignRow?.querySelector('input[name="an-img-align"]:checked');
    const align = alignRadio ? /** @type {HTMLInputElement} */ (alignRadio).value : '';

    if (!src) {
      this._urlInput.focus();
      return;
    }

    if (this._savedRange) {
      this._savedRange.select();
    }

    // Let callers make a deferred DOM change only after the user commits the
    // dialog. SlashMenu uses this to keep "/image" intact when the dialog is
    // cancelled and remove it atomically immediately before image insertion.
    const beforeInsert = this._beforeInsert;
    this._beforeInsert = null;
    beforeInsert?.();

    this.context.invoke('editor.insertImage', src, alt, align);
    this._close();
  }

  _close() {
    this._beforeInsert = null;
    super._close();
  }
}
