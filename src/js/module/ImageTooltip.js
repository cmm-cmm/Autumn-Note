// ImageTooltip.js - Hover tooltip for images inside the editor
// Displays a horizontal action bar below (or above) the selected image,
// similar in appearance and interaction to LinkTooltip.
import { createElement, on } from '../core/dom.js';

const ICONS = {
  floatLeft:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>`,
  floatRight:  `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>`,
  floatNone:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>`,
  alignCenter: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>`,
  originalSize:`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  deleteImg:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  caption:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="11" rx="2"/><line x1="6" y1="18" x2="18" y2="18"/><line x1="9" y1="21" x2="15" y2="21"/></svg>`,
  rotateLeft:  `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>`,
  rotateRight: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg>`,
};

const SHOW_DELAY = 100;
const HIDE_DELAY = 180;

export class ImageTooltip {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this._el = null;
    this._activeImg = null;
    this._showTimer = null;
    this._hideTimer = null;
    this._disposers = [];
  }

  initialize() {
    this._el = this._buildTooltip();
    document.body.appendChild(this._el);

    const editable = this.context.layoutInfo.editable;

    this._disposers.push(
      on(editable, 'mouseover', (e) => {
        const img = e.target.closest('img');
        // Skip when the image is inside a link — LinkTooltip takes priority there
        if (img && editable.contains(img) && !img.closest('a[href]')) {
          this._scheduleShow(img);
        }
      }),
      on(editable, 'mouseout', (e) => {
        const to = e.relatedTarget;
        if (!to || (!editable.contains(to) && !this._el.contains(to))) {
          this._scheduleHide();
        }
      }),
      // Hide when image is deselected by clicking elsewhere
      on(document, 'click', (e) => {
        if (this._activeImg && !this._activeImg.contains(e.target) && !this._el.contains(e.target)) {
          this._hide();
        }
      }),
    );

    return this;
  }

  destroy() {
    this._clearTimers();
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    this._el = null;
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  _buildTooltip() {
    const el = createElement('div', {
      class: 'an-link-tooltip an-image-tooltip',
      role: 'toolbar',
      'aria-label': 'Image actions',
    });
    el.style.display = 'none';

    // Label showing "Image"
    this._label = createElement('span', { class: 'an-link-tooltip-url' });
    this._label.textContent = 'Image';
    el.appendChild(this._label);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._floatLeftBtn    = this._makeBtn(ICONS.floatLeft,    'Float Left',     () => this._setFloat('left'));
    this._floatNoneBtn    = this._makeBtn(ICONS.floatNone,    'No Float',       () => this._setFloat(''));
    this._alignCenterBtn  = this._makeBtn(ICONS.alignCenter,  'Align Center',   () => this._setCenter());
    this._floatRightBtn   = this._makeBtn(ICONS.floatRight,   'Float Right',    () => this._setFloat('right'));

    el.appendChild(this._floatLeftBtn);
    el.appendChild(this._floatNoneBtn);
    el.appendChild(this._alignCenterBtn);
    el.appendChild(this._floatRightBtn);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._originalBtn = this._makeBtn(ICONS.originalSize, 'Original Size', () => this._resetSize());

    el.appendChild(this._originalBtn);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    el.appendChild(this._makeBtn(ICONS.rotateLeft,  'Rotate Left',  () => this._rotate(-90)));
    el.appendChild(this._makeBtn(ICONS.rotateRight, 'Rotate Right', () => this._rotate(90)));

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._captionBtn = this._makeBtn(ICONS.caption, 'Add / Edit Caption', () => this._toggleCaption());
    el.appendChild(this._captionBtn);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._deleteBtn = this._makeBtn(ICONS.deleteImg, 'Delete Image', () => this._delete(), true);

    el.appendChild(this._deleteBtn);

    // Keep tooltip alive while hovering it
    this._disposers.push(
      on(el, 'mouseenter', () => this._clearTimers()),
      on(el, 'mouseleave', () => this._scheduleHide()),
    );

    return el;
  }

  /**
   * @param {string} icon
   * @param {string} title
   * @param {Function} handler
   * @param {boolean} [isDanger]
   */
  _makeBtn(icon, title, handler, isDanger = false) {
    const btn = createElement('button', {
      type: 'button',
      class: isDanger ? 'an-link-tooltip-btn an-link-tooltip-btn--danger' : 'an-link-tooltip-btn',
      title,
    });
    btn.innerHTML = icon;
    this._disposers.push(on(btn, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handler();
    }));
    return btn;
  }

  // ---------------------------------------------------------------------------
  // Show / Hide
  // ---------------------------------------------------------------------------

  _scheduleShow(img) {
    if (this._activeImg === img && this._el.style.display !== 'none') return;
    clearTimeout(this._hideTimer);
    this._hideTimer = null;
    clearTimeout(this._showTimer);
    this._showTimer = setTimeout(() => {
      this._activeImg = img;
      this._show(img);
    }, SHOW_DELAY);
  }

  _scheduleHide() {
    clearTimeout(this._showTimer);
    this._showTimer = null;
    if (this._hideTimer) return;
    this._hideTimer = setTimeout(() => this._hide(), HIDE_DELAY);
  }

  _show(img) {
    this._el.style.display = 'flex';
    this._positionNear(img);
  }

  _hide() {
    this._el.style.display = 'none';
    this._activeImg = null;
    this._clearTimers();
  }

  _clearTimers() {
    clearTimeout(this._showTimer);
    clearTimeout(this._hideTimer);
    this._showTimer = null;
    this._hideTimer = null;
  }

  _positionNear(img) {
    const rect   = img.getBoundingClientRect();
    const tipW   = this._el.offsetWidth  || 220;
    const tipH   = this._el.offsetHeight || 32;
    const margin = 6;

    let top  = rect.bottom + margin;
    let left = rect.left + (rect.width - tipW) / 2;

    if (top + tipH > window.innerHeight - margin) top = rect.top - tipH - margin;
    if (left + tipW > window.innerWidth  - margin) left = window.innerWidth - tipW - margin;
    if (left < margin) left = margin;

    this._el.style.top  = `${top}px`;
    this._el.style.left = `${left}px`;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _setFloat(value) {
    const img = this._activeImg;
    if (!img) return;
    const target = img.closest('figure.an-figure') || img;
    target.style.float = value;
    target.style.display = '';
    target.style.marginLeft  = value === 'right' ? '12px' : '';
    target.style.marginRight = value === 'left'  ? '12px' : '';
    this.context.invoke('editor.afterCommand');
    this.context.invoke('imageResizer.updateOverlay');
    this._positionNear(img);
  }

  _setCenter() {
    const img = this._activeImg;
    if (!img) return;
    const target = img.closest('figure.an-figure') || img;
    target.style.float        = '';
    target.style.display      = 'block';
    target.style.marginLeft   = 'auto';
    target.style.marginRight  = 'auto';
    this.context.invoke('editor.afterCommand');
    this.context.invoke('imageResizer.updateOverlay');
    this._positionNear(img);
  }

  _resetSize() {
    const img = this._activeImg;
    if (!img) return;
    img.style.width  = '';
    img.style.height = '';
    this.context.invoke('editor.afterCommand');
    this.context.invoke('imageResizer.updateOverlay');
    this._positionNear(img);
  }

  /**
   * Rotate the active image by `delta` degrees (±90).
   * Reads the existing rotate() value from the transform style so
   * repeated clicks accumulate correctly.
   * @param {number} delta
   */
  _rotate(delta) {
    const img = this._activeImg;
    if (!img) return;
    // Parse current rotation angle from inline transform
    const current = img.style.transform || '';
    const match   = current.match(/rotate\((-?[\d.]+)deg\)/);
    const prev    = match ? parseFloat(match[1]) : 0;
    const next    = (prev + delta + 360) % 360; // normalise to [0, 360)
    // Preserve any other transform functions (e.g. scale), replace only rotate()
    const cleaned = current.replace(/rotate\(-?[\d.]+deg\)/, '').trim();
    img.style.transform = cleaned
      ? `${cleaned} rotate(${next}deg)`
      : next === 0 ? '' : `rotate(${next}deg)`;
    this.context.invoke('editor.afterCommand');
    this.context.invoke('imageResizer.updateOverlay');
    this._positionNear(img);
  }

  _delete() {
    const img = this._activeImg;
    if (!img) return;
    this._hide();
    this.context.invoke('imageResizer.deselect');
    const figure = img.closest('figure.an-figure');
    if (figure && figure.parentNode) {
      figure.parentNode.removeChild(figure);
    } else if (img.parentNode) {
      img.parentNode.removeChild(img);
    }
    this.context.invoke('editor.afterCommand');
  }

  _toggleCaption() {
    const img = this._activeImg;
    if (!img) return;

    // If already inside a figure, move focus to the figcaption
    const existing = img.closest('figure.an-figure');
    if (existing) {
      const cap = existing.querySelector('figcaption.an-figcaption');
      if (cap) {
        this._hide();
        const range = document.createRange();
        range.selectNodeContents(cap);
        const sel = window.getSelection();
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
      }
      return;
    }

    // Wrap image in <figure><figcaption>
    const figure = document.createElement('figure');
    figure.className = 'an-figure';

    // Transfer existing alignment from <img> to <figure> (C4 fix)
    if (img.style.float) {
      figure.style.float       = img.style.float;
      figure.style.marginLeft  = img.style.marginLeft;
      figure.style.marginRight = img.style.marginRight;
      img.style.float       = '';
      img.style.marginLeft  = '';
      img.style.marginRight = '';
    } else if (img.style.display === 'block' && img.style.marginLeft === 'auto') {
      figure.style.display      = 'block';
      figure.style.marginLeft   = 'auto';
      figure.style.marginRight  = 'auto';
      img.style.display     = '';
      img.style.marginLeft  = '';
      img.style.marginRight = '';
    }
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'an-figcaption';
    figcaption.textContent = 'Caption';

    img.parentNode.insertBefore(figure, img);
    figure.appendChild(img);
    figure.appendChild(figcaption);

    // Select caption text immediately
    const range = document.createRange();
    range.selectNodeContents(figcaption);
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }

    this.context.invoke('editor.afterCommand');
    // Re-sync the resize overlay: wrapping img in <figure> changes its layout position.
    this.context.invoke('imageResizer.updateOverlay');
    this._hide();
  }
}
