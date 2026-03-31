/**
 * Clipboard.js - Handles paste events to strip unwanted formatting,
 *                and paste/drop of image files.
 * Inspired by Summernote's Clipboard module
 */

import { on } from '../core/dom.js';
import { execCommand } from '../editing/Style.js';
import { sanitiseHTML } from '../core/sanitise.js';
import { isMarkdown, markdownToHTML } from '../core/markdown.js';

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
    /** @type {Map<string, string>} Maps blob: URL (in DOM) → data: URL (serialisable) */
    this._blobRegistry = new Map();
    /** @type {boolean} Set to true by Ctrl+Shift+V shortcut to force one-shot plain paste */
    this._forcePlain = false;
    const editable = this.context.layoutInfo.editable;
    this._disposers.push(
      on(editable, 'paste',    (e) => this._onPaste(e)),
      on(editable, 'dragover', (e) => this._onDragover(e)),
      on(editable, 'drop',     (e) => this._onDrop(e)),
    );

    // Watch for removed images so their blob: URLs are revoked immediately,
    // preventing memory leaks during long editing sessions.
    this._mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          this._revokeRemovedBlobs(node);
        }
      }
    });
    this._mutationObserver.observe(editable, { childList: true, subtree: true });

    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
      this._mutationObserver = null;
    }
    // Release any remaining object URLs
    if (this._blobRegistry) {
      this._blobRegistry.forEach((_, blobUrl) => URL.revokeObjectURL(blobUrl));
      this._blobRegistry.clear();
    }
  }

  /**
   * Revokes blob URLs for any <img> elements removed from the DOM.
   * @param {Node} node
   */
  _revokeRemovedBlobs(node) {
    if (!this._blobRegistry || !this._blobRegistry.size) return;
    const imgs = [];
    if (node.nodeName === 'IMG') {
      imgs.push(node);
    } else if (node.querySelectorAll) {
      imgs.push(...node.querySelectorAll('img'));
    }
    imgs.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('blob:') && this._blobRegistry.has(src)) {
        URL.revokeObjectURL(src);
        this._blobRegistry.delete(src);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Paste handler
  // ---------------------------------------------------------------------------

  /**
   * Strips Microsoft Word / Office HTML artefacts from a pasted HTML string.
   * Removes conditional comments, Office namespace elements, MsoXxx classes,
   * mso-* inline style rules, and empty paragraphs left behind by Word.
   * @param {string} html
   * @returns {string}
   */
  _cleanWordHtml(html) {
    return html
      // Conditional comments <!--[if ...]>...<![endif]-->
      .replace(/<!--\[if[\s\S]*?\[endif\]-->/gi, '')
      // XML data blobs <xml>...</xml>
      .replace(/<xml[\s\S]*?<\/xml>/gi, '')
      // XML processing instructions <?xml ... ?>
      .replace(/<\?xml[\s\S]*?\?>/gi, '')
      // Office namespace elements: <o:p>, <w:sDt>, <m:oMath>, <v:shape> …
      .replace(/<\/?(o|w|m|v|st1):[a-z][^>]*>/gi, '')
      // MsoNormal, MsoBodyText, etc. class attributes
      .replace(/\s+class="Mso[^"]*"/gi, '')
      // mso-* properties inside inline style attributes
      .replace(/\s+style="([^"]*)"/gi, (_m, style) => {
        const cleaned = style.split(';')
          .map((s) => s.trim())
          .filter((s) => s && !/^mso-/i.test(s) && !/^(tab-stops|margin-[a-z]+-alt)/i.test(s))
          .join('; ');
        return cleaned ? ` style="${cleaned}"` : '';
      })
      // Empty paragraphs Word sprinkles everywhere
      .replace(/<p[^>]*>\s*(&nbsp;)?\s*<\/p>/gi, '');
  }

  /**
   * Detects and strips noise from social media sites (Facebook, X/Twitter, LinkedIn, etc.).
   * These React-based pages produce HTML with utility class names like `x1n2onr6` / `r-bcqeeo`,
   * `data-testid`, `data-lexical-*`, etc. We keep the semantic structure but remove all the noise.
   * @param {string} html
   * @returns {string}
   */
  _cleanSocialHtml(html) {
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    // Unwrap purely presentational wrapper spans/divs with no semantic meaning
    const UNWRAP_TAGS = new Set(['span', 'div']);
    let changed = true;
    // Iteratively unwrap until stable (handles deeply nested span soup)
    while (changed) {
      changed = false;
      doc.querySelectorAll('span, div').forEach((el) => {
        if (!UNWRAP_TAGS.has(el.tagName.toLowerCase())) return;
        // Keep if it has a meaningful role (link, heading, list item are handled by parent)
        if (el.querySelector('a, strong, em, b, i, ul, ol, li, table, img, blockquote, pre, code, h1, h2, h3, h4, h5, h6')) return;
        // Unwrap — replace el with its children
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        changed = true;
      });
    }
    // Strip class and all data-* attributes from every remaining element
    doc.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('class');
      el.removeAttribute('id');
      Array.from(el.attributes)
        .filter((a) => a.name.startsWith('data-') || a.name.startsWith('aria-'))
        .forEach((a) => el.removeAttribute(a.name));
    });
    return doc.body.innerHTML;
  }

  /**
   * Strips presentational attributes (class, style, data-*, id) from all elements,
   * keeping only semantic structure and URL attributes.
   * Used when `pasteStripAttributes` option is true.
   * @param {string} html
   * @returns {string}
   */
  _stripAttributes(html) {
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const KEEP_ATTRS = new Set(['href', 'src', 'alt', 'target', 'rel', 'colspan', 'rowspan', 'type']);
    doc.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes)
        .filter((a) => !KEEP_ATTRS.has(a.name))
        .forEach((a) => el.removeAttribute(a.name));
    });
    return doc.body.innerHTML;
  }

  /**
   * Forces the next paste operation to strip all HTML formatting.
   * Called by Editor when Ctrl+Shift+V is pressed.
   * @param {boolean} val
   */
  setForcePlain(val) {
    this._forcePlain = !!val;
  }

  _onPaste(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    // Consume and reset the one-shot plain-paste flag
    const forcePlain = this._forcePlain;
    this._forcePlain = false;

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

    // Fire onPaste hook so consumers can observe / intercept
    if (typeof this.options.onPaste === 'function') {
      this.options.onPaste({
        text: clipboardData.getData('text/plain') || '',
        html: clipboardData.types.includes('text/html') ? clipboardData.getData('text/html') : null,
      });
    }

    // 2. Force plain-text only — strip all formatting
    if (forcePlain || this.options.pasteAsPlainText) {
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

    // 3. Markdown paste — only when no HTML is on the clipboard (pure text source)
    if (this.options.markdownPaste !== false && !clipboardData.types.includes('text/html')) {
      const text = clipboardData.getData('text/plain');
      if (text && isMarkdown(text)) {
        event.preventDefault();
        const html = sanitiseHTML(markdownToHTML(text));
        execCommand('insertHTML', html);
        this.context.invoke('editor.afterCommand');
        return;
      }
    }

    // 4. Sanitise HTML on paste when pasteCleanHTML is true (default)
    if (this.options.pasteCleanHTML !== false && clipboardData.types.includes('text/html')) {
      event.preventDefault();
      const raw = clipboardData.getData('text/html');
      // Detect source type and apply appropriate pre-cleaner
      const isWordContent = /<[a-z]+:[a-z]/i.test(raw) || /class="Mso/i.test(raw) || /\bmso-/i.test(raw);
      const isSocialContent = /\bdata-testid\b/.test(raw) || /class="[^"]*\b(?:x[a-z0-9]{6,}|r-[a-z0-9]{3,})\b/.test(raw);
      let html = raw;
      if (isWordContent) html = this._cleanWordHtml(html);
      else if (isSocialContent) html = this._cleanSocialHtml(html);
      html = sanitiseHTML(html);
      if (this.options.pasteStripAttributes) html = this._stripAttributes(html);
      execCommand('insertHTML', html);
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
        const message = `Image "${file.name}" exceeds the ${this.options.maxImageSize || 5} MB size limit.`;
        this.context.triggerEvent('imageError', { file, message });
        console.warn(`[AutumnNote] ${message}`);
        return;
      }

      const alt = file.name.replace(/\.[^.]+$/, '');
      this._compressImage(file).then((dataUrl) => {
        // Keep the large data URL in a JS Map; insert a lightweight blob: URL
        // into the DOM so editable.innerHTML never contains the big base64 string.
        const blob = this._dataUrlToBlob(dataUrl);
        const blobUrl = URL.createObjectURL(blob);
        this._blobRegistry.set(blobUrl, dataUrl);
        this.context.invoke('editor.insertImage', blobUrl, alt);
      });
    });
  }

  /**
   * Replaces any blob: URLs created by this module with their original data URLs.
   * Called by Editor.getHTML() so the returned HTML is fully self-contained.
   * @param {string} html
   * @returns {string}
   */
  resolveImages(html) {
    if (!this._blobRegistry || !this._blobRegistry.size) return html;
    return html.replace(/blob:[^"'> \t\n\r]*/g, (url) => this._blobRegistry.get(url) || url);
  }

  /**
   * Converts a data URL to a Blob (no FileReader — synchronous).
   * @param {string} dataUrl
   * @returns {Blob}
   */
  _dataUrlToBlob(dataUrl) {
    const [header, b64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(b64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
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
