/**
 * VideoDialog.js - Dialog for inserting videos (YouTube, Vimeo, or direct file)
 * Supports:
 *   • YouTube watch URLs  → <iframe> embed
 *   • YouTube short URLs  → <iframe> embed
 *   • Vimeo URLs          → <iframe> embed
 *   • Direct video URLs   → <video> element (.mp4 / .webm / .ogg)
 */

import { createElement, on } from '../core/dom.js';
import { withSavedRange } from '../core/range.js';

export class VideoDialog {
  /** @param {import('../Context.js').Context} context */
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
    this._widthInput.value = '560';
    this._hintEl.textContent = '';
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
      'aria-label': 'Insert video',
    });
    const box = createElement('div', { class: 'an-dialog-box' });

    const title = createElement('h3', { class: 'an-dialog-title' });
    title.textContent = 'Insert Video';

    // URL input
    const urlLabel = createElement('label', { class: 'an-label' });
    urlLabel.textContent = 'Video URL';
    const urlInput = createElement('input', {
      type: 'url',
      class: 'an-input',
      placeholder: 'YouTube, Vimeo, or direct .mp4 URL',
      autocomplete: 'off',
    });
    this._urlInput = urlInput;

    // Hint (detected source)
    const hintEl = createElement('p', { class: 'an-dialog-hint' });
    this._hintEl = hintEl;

    // Width
    const widthLabel = createElement('label', { class: 'an-label' });
    widthLabel.textContent = 'Width (px)';
    const widthInput = createElement('input', {
      type: 'number',
      class: 'an-input',
      placeholder: '560',
      min: '80',
      max: '1920',
      value: '560',
    });
    this._widthInput = widthInput;

    // Buttons
    const btnRow = createElement('div', { class: 'an-dialog-actions' });
    const insertBtn = createElement('button', { type: 'button', class: 'an-btn an-btn-primary' });
    insertBtn.textContent = 'Insert';
    const cancelBtn = createElement('button', { type: 'button', class: 'an-btn' });
    cancelBtn.textContent = 'Cancel';
    btnRow.appendChild(insertBtn);
    btnRow.appendChild(cancelBtn);

    box.append(title, urlLabel, urlInput, hintEl, widthLabel, widthInput, btnRow);
    overlay.appendChild(box);

    // Live URL hint
    const d0 = on(urlInput, 'input', () => {
      const info = this._parseVideoUrl(urlInput.value.trim());
      hintEl.textContent = info ? `Detected: ${info.type}` : (urlInput.value ? 'Unknown format — will try direct video embed' : '');
    });

    const d1 = on(insertBtn, 'click', () => this._onInsert());
    const d2 = on(cancelBtn, 'click', () => this._close());
    const d3 = on(overlay, 'click', (e) => { if (e.target === overlay) this._close(); });
    const d4 = on(urlInput, 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this._onInsert(); } });
    const onKeydown = (e) => { if (e.key === 'Escape') this._close(); };
    document.addEventListener('keydown', onKeydown);
    const d5 = () => document.removeEventListener('keydown', onKeydown);
    this._disposers.push(d0, d1, d2, d3, d4, d5);

    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _onInsert() {
    const rawUrl = this._urlInput.value.trim();
    const width  = Math.max(80, parseInt(this._widthInput.value, 10) || 560);

    if (!rawUrl) {
      this._urlInput.focus();
      return;
    }

    const html = this._buildEmbedHtml(rawUrl, width);
    if (!html) {
      this._hintEl.textContent = 'Invalid URL — please enter a valid video link.';
      this._urlInput.focus();
      return;
    }

    if (this._savedRange) this._savedRange.select();
    this.context.invoke('editor.insertVideo', html);
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

  // ---------------------------------------------------------------------------
  // URL parsing & HTML building
  // ---------------------------------------------------------------------------

  /**
   * Parses a video URL and returns { type, embedUrl } or null.
   * @param {string} url
   * @returns {{ type: string, embedUrl: string }|null}
   */
  _parseVideoUrl(url) {
    if (!url) return null;

    // Validate — block javascript: and other dangerous protocols
    try {
      const parsed = new URL(url);
      if (/^javascript:/i.test(parsed.protocol)) return null;
    } catch { return null; }

    // YouTube watch: https://www.youtube.com/watch?v=ID
    const ytWatch = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytWatch) return { type: 'YouTube', embedUrl: `https://www.youtube.com/embed/${ytWatch[1]}` };

    // YouTube short: https://youtu.be/ID
    const ytShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (ytShort) return { type: 'YouTube', embedUrl: `https://www.youtube.com/embed/${ytShort[1]}` };

    // YouTube Shorts: https://www.youtube.com/shorts/ID
    const ytShorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (ytShorts) return { type: 'YouTube Shorts', embedUrl: `https://www.youtube.com/embed/${ytShorts[1]}` };

    // Vimeo: https://vimeo.com/ID
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return { type: 'Vimeo', embedUrl: `https://player.vimeo.com/video/${vimeo[1]}` };

    // Direct video file
    if (/\.(mp4|webm|ogg|ogv|mov)(#.*|\?.*)?$/i.test(url)) {
      return { type: 'Direct video', embedUrl: url };
    }

    return null;
  }

  /**
   * Builds the HTML string to insert.
   * @param {string} url
   * @param {number} width
   * @returns {string|null}
   */
  _buildEmbedHtml(url, width) {
    const info = this._parseVideoUrl(url);
    const height = Math.round(width * 9 / 16); // 16:9

    if (info && (info.type === 'YouTube' || info.type === 'YouTube Shorts' || info.type === 'Vimeo')) {
      return (
        `<div class="an-video-wrapper" style="position:relative;display:inline-block;max-width:100%">` +
        `<iframe src="${info.embedUrl}" width="${width}" height="${height}" ` +
        `frameborder="0" allowfullscreen ` +
        `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ` +
        `style="display:block;max-width:100%"></iframe>` +
        `<div class="an-video-shield"></div>` +
        `</div>`
      );
    }

    if (info && info.type === 'Direct video') {
      const src = info.embedUrl.replace(/"/g, '%22');
      return (
        `<div class="an-video-wrapper" style="position:relative;display:inline-block;max-width:100%">` +
        `<video src="${src}" width="${width}" height="${height}" controls ` +
        `style="display:block;max-width:100%"></video>` +
        `<div class="an-video-shield"></div>` +
        `</div>`
      );
    }

    // Unknown URL — let the user try as a direct video
    const safeSrc = (() => {
      try {
        const p = new URL(url);
        if (/^javascript:/i.test(p.protocol)) return null;
        return url;
      } catch { return null; }
    })();
    if (!safeSrc) return null;

    const escapedSrc = safeSrc.replace(/"/g, '%22');
    return (
      `<div class="an-video-wrapper" style="position:relative;display:inline-block;max-width:100%">` +
      `<video src="${escapedSrc}" width="${width}" height="${height}" controls ` +
      `style="display:block;max-width:100%"></video>` +
      `<div class="an-video-shield"></div>` +
      `</div>`
    );
  }
}
