/**
 * VideoDialog.js - Dialog for inserting videos (YouTube, Vimeo, or direct file)
 * Supports:
 *   • YouTube watch URLs  → <iframe> embed
 *   • YouTube short URLs  → <iframe> embed
 *   • Vimeo URLs          → <iframe> embed
 *   • Direct video URLs   → <video> element (.mp4 / .webm / .ogg)
 */

import { createElement, on } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`;

export class VideoDialog extends BaseDialog {
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  show() {
    this._saveRange();
    this._urlInput.value = '';
    this._widthInput.value = '560';
    this._hintEl.textContent = '';
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const L = this.context.locale.videoDialog;
    const { overlay, box } = this._buildDialogShell(L.ariaLabel, ICON_SVG, L.title);

    // URL input
    const urlLabel = createElement('label', { class: 'an-label' });
    urlLabel.textContent = L.videoUrl;
    const urlInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'url',
      class: 'an-input',
      placeholder: L.urlPlaceholder,
      autocomplete: 'off',
    }));
    this._urlInput = urlInput;
    this._firstInput = urlInput;

    // Hint (detected source)
    const hintEl = createElement('p', { class: 'an-dialog-hint' });
    this._hintEl = hintEl;

    // Width
    const widthLabel = createElement('label', { class: 'an-label' });
    widthLabel.textContent = L.widthLabel;
    const widthInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'number',
      class: 'an-input',
      placeholder: '560',
      min: '80',
      max: '1920',
      value: '560',
    }));
    this._widthInput = widthInput;

    const btnRow = this._buildButtonRow(L.insertBtn, L.cancelBtn, () => this._onInsert());
    box.append(urlLabel, urlInput, hintEl, widthLabel, widthInput, btnRow);

    // Live URL hint
    const d0 = on(urlInput, 'input', () => {
      const info = this._parseVideoUrl(urlInput.value.trim());
      hintEl.textContent = info ? this.context.locale.videoDialog.detected(info.type) : (urlInput.value ? this.context.locale.videoDialog.unknownFormat : '');
    });
    const d4 = on(urlInput, 'keydown', (e) => { if (/** @type {KeyboardEvent} */ (e).key === 'Enter') { e.preventDefault(); this._onInsert(); } });
    this._disposers.push(d0, d4);

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
      this._hintEl.textContent = this.context.locale.videoDialog.invalidUrl;
      this._urlInput.focus();
      return;
    }

    if (this._savedRange) this._savedRange.select();
    this.context.invoke('editor.insertVideo', html);
    this._close();
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
      if (/^javascript:/i.test(parsed.protocol) || /^vbscript:/i.test(parsed.protocol)) return null;
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
      const iframeTitle = `${info.type} video player`;
      return (
        `<div class="an-video-wrapper" style="position:relative;display:block;width:${width}px;max-width:100%">` +
        `<iframe src="${info.embedUrl}" width="${width}" height="${height}" ` +
        `title="${iframeTitle}" ` +
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
        `<div class="an-video-wrapper" style="position:relative;display:block;width:${width}px;max-width:100%">` +
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
        if (/^javascript:/i.test(p.protocol) || /^vbscript:/i.test(p.protocol)) return null;
        return url;
      } catch { return null; }
    })();
    if (!safeSrc) return null;

    const escapedSrc = safeSrc.replace(/"/g, '%22');
    return (
      `<div class="an-video-wrapper" style="position:relative;display:block;width:${width}px;max-width:100%">` +
      `<video src="${escapedSrc}" width="${width}" height="${height}" controls ` +
      `style="display:block;max-width:100%"></video>` +
      `<div class="an-video-shield"></div>` +
      `</div>`
    );
  }
}
