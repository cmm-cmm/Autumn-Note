/**
 * ImageDialog.js - Dialog for inserting images (by URL or file upload)
 * Inspired by Summernote's ImageDialog — rewritten without jQuery
 */

import { createElement, on, setIcon, svgIcon } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';
// Same glyphs as the image tooltip's float buttons, so both name a layout alike.
import { ICONS as IMAGE_ICONS } from './ImageTooltip.js';
import { PATHS } from '../core/icon-paths.js';

const ICON_SVG = svgIcon(PATHS.image, 20);

const UPLOAD_SVG = svgIcon(`<path d="M21 15v4l-2 2H5l-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`, 22);

const ALIGN_SVG = {
  '':     IMAGE_ICONS.floatNone,
  left:   IMAGE_ICONS.floatLeft,
  center: IMAGE_ICONS.alignCenter,
  right:  IMAGE_ICONS.floatRight,
};

const SUPPORTED = new Set([
  'image/jpeg', 'image/png', 'image/gif',
  'image/webp', 'image/svg+xml', 'image/avif',
]);

// Only sources an <img> can actually show get a preview; anything else is left
// to editor.insertImage, which runs its own URL checks.
const PREVIEWABLE = /^(https?:|blob:|data:image\/)/i;

// Every dialog needs its own ids and radio group: two editors on one page must
// not share a label target or uncheck each other's alignment.
let uid = 0;

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
    this._clearFile();
    this._setPreview(null);
    if (this._fileHint) this._fileHint.textContent = '';
    const none = /** @type {HTMLInputElement|null} */ (this._alignRow?.querySelector('input[value=""]'));
    if (none) none.checked = true;
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const L = this.context.locale.imageDialog;
    const id = `an-img-${++uid}`;
    const { overlay, box } = this._buildDialogShell(L.ariaLabel, ICON_SVG, L.title);
    box.classList.add('an-image-dialog');

    // URL field
    const urlInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'url',
      id: `${id}-url`,
      class: 'an-input',
      placeholder: L.urlPlaceholder,
      autocomplete: 'off',
    }));
    this._urlInput = urlInput;
    this._firstInput = urlInput;
    box.append(this._field(L.imageUrl, urlInput));

    if (this.options.allowImageUpload !== false) box.append(...this._buildUpload(L, id));

    // Preview: shared by the URL and the uploaded file, whichever is current.
    const preview = createElement('div', { class: 'an-image-preview', hidden: '' });
    const previewThumb = createElement('span', { class: 'an-image-preview-thumb' });
    const previewImg = /** @type {HTMLImageElement} */ (createElement('img', { class: 'an-image-preview-img', alt: '' }));
    previewThumb.append(previewImg);
    const previewMeta = createElement('div', { class: 'an-image-preview-meta' });
    const previewName = createElement('span', { class: 'an-image-preview-name' });
    const previewStatus = createElement('span', { class: 'an-image-preview-status', 'aria-live': 'polite' });
    const removeBtn = createElement('button', { type: 'button', class: 'an-btn an-image-preview-remove' });
    removeBtn.textContent = L.removeImage || 'Remove';
    previewMeta.append(previewName, previewStatus);
    preview.append(previewThumb, previewMeta, removeBtn);
    this._preview = preview;
    this._previewImg = previewImg;
    this._previewName = previewName;
    this._previewStatus = previewStatus;
    box.append(preview);

    // Alt text
    const altInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'text',
      id: `${id}-alt`,
      class: 'an-input',
      placeholder: L.altPlaceholder,
      autocomplete: 'off',
    }));
    this._altInput = altInput;
    box.append(this._field(L.altText, altInput));

    // Alignment: native radios (arrow keys, one tab stop) drawn as a segmented control
    const fieldset = createElement('fieldset', { class: 'an-segmented' });
    const legend = createElement('legend', { class: 'an-label' });
    legend.textContent = L.alignment;
    const alignRow = createElement('div', { class: 'an-segmented-options' });
    [
      { value: '',       label: L.alignNone   },
      { value: 'left',   label: L.alignLeft   },
      { value: 'center', label: L.alignCenter },
      { value: 'right',  label: L.alignRight  },
    ].forEach(({ value, label }) => {
      const radioId = `${id}-align-${value || 'none'}`;
      const radio = /** @type {HTMLInputElement} */ (createElement('input', {
        type: 'radio', name: `${id}-align`, id: radioId, value, class: 'an-visually-hidden',
      }));
      if (value === '') radio.checked = true;
      const seg = createElement('label', { for: radioId, class: 'an-segment' });
      const icon = createElement('span', { class: 'an-segment-icon' });
      setIcon(icon, ALIGN_SVG[value]);
      seg.append(icon, document.createTextNode(label));
      alignRow.append(radio, seg);
    });
    this._alignRow = alignRow;
    fieldset.append(legend, alignRow);
    box.append(fieldset);

    box.append(this._buildButtonRow(L.insertBtn, L.cancelBtn, () => this._onInsert()));

    const onEnter = (e) => { if (/** @type {KeyboardEvent} */ (e).key === 'Enter') { e.preventDefault(); this._onInsert(); } };
    let previewTimer = null;
    this._disposers.push(
      on(urlInput, 'keydown', onEnter),
      on(altInput, 'keydown', onEnter),
      // Typing a URL replaces a chosen file; the preview follows once typing pauses.
      on(urlInput, 'input', () => {
        if (this._fileSrc) { this._clearFile(); this._setPreview(null); }
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => this._previewUrl(), 400);
      }),
      on(urlInput, 'change', () => { clearTimeout(previewTimer); this._previewUrl(); }),
      on(removeBtn, 'click', () => this._onRemove()),
      () => clearTimeout(previewTimer),
    );

    return overlay;
  }

  /**
   * A label stacked over its control.
   * @param {string} text
   * @param {HTMLElement} control
   */
  _field(text, control) {
    const wrap = createElement('div', { class: 'an-field' });
    const label = createElement('label', { class: 'an-label', for: control.id });
    label.textContent = text;
    wrap.append(label, control);
    return wrap;
  }

  /**
   * "Or upload a file" divider, the drop zone (a label wrapping the file
   * input, so click, keyboard and drag all reach the same control) and the
   * line that reports format and size errors.
   * @param {Record<string, string>} L
   * @param {string} id
   * @returns {HTMLElement[]}
   */
  _buildUpload(L, id) {
    const divider = createElement('div', { class: 'an-image-or', 'aria-hidden': 'true' });
    divider.textContent = L.uploadLabel;

    const hintId = `${id}-file-hint`;
    const limitsId = `${id}-limits`;
    const drop = createElement('label', { class: 'an-image-drop' });
    const fileInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'file',
      class: 'an-visually-hidden',
      accept: [...SUPPORTED].join(','),
      'aria-describedby': `${limitsId} ${hintId}`,
    }));
    const icon = createElement('span', { class: 'an-image-drop-icon' });
    setIcon(icon, UPLOAD_SVG);
    const title = createElement('span', { class: 'an-image-drop-title' });
    title.textContent = L.dropTitle || L.uploadLabel;
    const sub = createElement('span', { class: 'an-image-drop-hint' });
    sub.textContent = L.dropHint || '';
    const limits = createElement('span', { class: 'an-image-drop-limits', id: limitsId });
    // Format names and units read the same in every supported language.
    limits.textContent = `JPG, PNG, GIF, WebP, SVG, AVIF \u00b7 \u2264 ${this.options.maxImageSize || 5} MB`;
    drop.append(fileInput, icon, title, sub, limits);

    const fileHint = createElement('p', { class: 'an-dialog-hint an-dialog-error', id: hintId, 'aria-live': 'polite' });
    this._fileInput = fileInput;
    this._fileHint = fileHint;
    this._drop = drop;
    this._divider = divider;

    const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
    this._disposers.push(
      on(fileInput, 'change', () => this._onFileChange()),
      on(drop, 'dragover', (e) => { stop(e); drop.classList.add('is-dragover'); }),
      on(drop, 'dragleave', () => drop.classList.remove('is-dragover')),
      on(drop, 'drop', (e) => {
        stop(e);
        drop.classList.remove('is-dragover');
        const file = /** @type {DragEvent} */ (e).dataTransfer?.files?.[0];
        if (file) this._handleFile(file);
      }),
    );
    return [divider, drop, fileHint];
  }

  // ---------------------------------------------------------------------------
  // Preview
  // ---------------------------------------------------------------------------

  _previewUrl() {
    if (this._fileSrc) return;
    const url = this._urlInput.value.trim();
    this._setPreview(PREVIEWABLE.test(url) ? url : null, url);
  }

  /**
   * Shows `src` in the preview with a loading, ready or error state, or hides
   * the preview when `src` is empty.
   * @param {string|null} src
   * @param {string} [name]
   */
  _setPreview(src, name = '') {
    const { _preview: box, _previewImg: img, _previewStatus: status } = this;
    if (!box) return;
    const L = this.context.locale.imageDialog;
    img.onload = null;
    img.onerror = null;
    // One source at a time: while something is previewed the upload area
    // steps aside; clearing the URL or pressing Remove brings it back.
    if (this._drop) this._drop.hidden = !!src;
    if (this._divider) this._divider.hidden = !!src;
    if (!src) {
      box.hidden = true;
      img.removeAttribute('src');
      status.textContent = '';
      return;
    }
    box.hidden = false;
    // Loading shows as a pulsing thumbnail (aria-busy for assistive tech).
    box.dataset.state = 'loading';
    box.setAttribute('aria-busy', 'true');
    this._previewName.textContent = name;
    status.textContent = '';
    const settle = (state) => { box.dataset.state = state; box.removeAttribute('aria-busy'); };
    img.onload = () => settle('ready');
    img.onerror = () => { settle('error'); status.textContent = L.previewError || ''; };
    img.src = src;
  }

  _clearFile() {
    this._fileSrc = null;
    if (this._fileInput) this._fileInput.value = '';
  }

  _onRemove() {
    const hadFile = !!this._fileSrc;
    this._clearFile();
    if (!hadFile) this._urlInput.value = '';
    this._setPreview(null);
    (hadFile ? this._fileInput : this._urlInput)?.focus();
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _onFileChange() {
    const file = this._fileInput?.files?.[0];
    if (file) this._handleFile(file);
  }

  /** @param {File} file */
  _handleFile(file) {
    if (this.context._alive === false) return;
    if (!file?.type?.startsWith('image/')) return;

    // C2: Only allow web-displayable formats. TIFF, BMP, RAW and similar
    // formats are not rendered by browsers — reject them with a clear message.
    if (!SUPPORTED.has(file.type)) {
      this._rejectFile(file, this.context.locale.errors.imageFormat(file.type));
      return;
    }

    // Validate file size (max 5 MB by default)
    const maxSize = (this.options.maxImageSize || 5) * 1024 * 1024;
    if (file.size > maxSize) {
      const message = this.context.locale.errors.imageSize(this.options.maxImageSize || 5);
      console.warn('[AutumnNote] ImageDialog:', message);
      this._rejectFile(file, message);
      return;
    }
    if (this._fileHint) this._fileHint.textContent = '';

    const accept = (src) => {
      if (this.context._alive === false) return;
      this._fileSrc = src;
      this._urlInput.value = '';
      this._setPreview(src, file.name);
    };

    // Resize/compress via Clipboard's shared canvas pipeline so a file chosen
    // through this dialog gets the same treatment as a pasted/dropped image
    // instead of embedding the original (potentially multi-MB) file untouched.
    this.context.invoke('clipboard.compressAndRegister', file).then(accept).catch((err) => {
      if (this.context._alive === false) return;
      // Compression failed (e.g. canvas unavailable) — fall back to embedding
      // the original file directly.
      console.warn('[AutumnNote] ImageDialog: image compression failed, using original file.', err);
      const reader = new FileReader();
      reader.onload = (e) => accept(/** @type {string} */ (e.target.result));
      reader.readAsDataURL(file);
    });
  }

  /**
   * @param {File} file
   * @param {string} message
   */
  _rejectFile(file, message) {
    if (this._fileHint) this._fileHint.textContent = message;
    this.context.triggerEvent('imageError', { file, message });
    if (this._fileInput) this._fileInput.value = '';
  }

  _onInsert() {
    const src = this._fileSrc || this._urlInput.value.trim();
    const alt = this._altInput.value.trim();
    const alignRadio = this._alignRow?.querySelector('input[type="radio"]:checked');
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
    this._close({ toEditor: true });
  }

  /** @param {{ toEditor?: boolean }} [opts] */
  _close(opts) {
    this._beforeInsert = null;
    super._close(opts);
  }
}
