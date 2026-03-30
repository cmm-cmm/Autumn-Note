/**
 * Clipboard.js - Handles paste events to strip unwanted formatting,
 *                and paste/drop of image files.
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
    this._disposers.push(
      on(editable, 'paste',    (e) => this._onPaste(e)),
      on(editable, 'dragover', (e) => this._onDragover(e)),
      on(editable, 'drop',     (e) => this._onDrop(e)),
    );
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

    // 1. Image file in clipboard (screenshot, copy-image-from-browser, etc.)
    if (clipboardData.items) {
      const imageItems = Array.from(clipboardData.items).filter(
        (item) => item.kind === 'file' && item.type.startsWith('image/'),
      );
      if (imageItems.length > 0) {
        event.preventDefault();
        const files = imageItems.map((item) => item.getAsFile()).filter(Boolean);
        this._insertImageFiles(files);
        return;
      }
    }

    // 2. Force plain-text only — strip all formatting
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

    // 3. Sanitise HTML on paste when pasteCleanHTML is true (default)
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
  // Drag & drop handlers
  // ---------------------------------------------------------------------------

  _onDragover(event) {
    if (!event.dataTransfer) return;
    const types = Array.from(event.dataTransfer.types || []);
    if (types.includes('Files')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  _onDrop(event) {
    const dt = event.dataTransfer;
    if (!dt || !dt.files || dt.files.length === 0) return;

    const imageFiles = Array.from(dt.files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    event.preventDefault();
    event.stopPropagation();

    // Place the caret at the drop coordinates before inserting
    this._placeCaretAtPoint(event.clientX, event.clientY);
    this._insertImageFiles(imageFiles);
  }

  // ---------------------------------------------------------------------------
  // Image file processing — shared by paste and drop
  // ---------------------------------------------------------------------------

  /**
   * Inserts one or more image Files into the editor.
   * Delegates to `options.onImageUpload` when provided; otherwise compresses
   * and embeds as base64.
   * @param {File[]} files
   */
  _insertImageFiles(files) {
    if (!files || files.length === 0) return;

    if (typeof this.options.onImageUpload === 'function') {
      this.options.onImageUpload(files);
      return;
    }

    const maxBytes = (this.options.maxImageSize || 5) * 1024 * 1024;
    files.forEach((file) => {
      if (!file || !file.type.startsWith('image/')) return;
      if (file.size > maxBytes) {
        alert(`Image "${file.name}" is too large. Maximum allowed size is ${this.options.maxImageSize || 5} MB.`);
        return;
      }

      const alt = file.name.replace(/\.[^.]+$/, '');
      this._compressImage(file).then((dataUrl) => {
        this.context.invoke('editor.insertImage', dataUrl, alt);
      });
    });
  }

  /**
   * Compresses an image File using a Canvas.
   * - Resizes so the longest edge is at most MAX_DIM pixels.
   * - Encodes as WebP (if supported) or JPEG at quality 0.85.
   * Falls back to plain FileReader if canvas is unavailable.
   * @param {File} file
   * @returns {Promise<string>} data URL
   */
  _compressImage(file) {
    const MAX_DIM = 1920;
    const QUALITY = 0.85;

    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width >= height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP for better compression; fall back to JPEG
        const webp = canvas.toDataURL('image/webp', QUALITY);
        resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', QUALITY));
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback: embed original without compression
        const reader = new FileReader();
        reader.onload = (e) => resolve(/** @type {string} */ (e.target.result));
        reader.readAsDataURL(file);
      };

      img.src = objectUrl;
    });
  }

  /**
   * Positions the caret at the given viewport coordinates.
   * Supports both Chrome (caretRangeFromPoint) and Firefox (caretPositionFromPoint).
   * @param {number} x
   * @param {number} y
   */
  _placeCaretAtPoint(x, y) {
    let range;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
      }
    }
    if (!range) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
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
