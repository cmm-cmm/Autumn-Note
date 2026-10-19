// VideoTooltip.js - Hover tooltip for video wrappers inside the editor
// Displays a horizontal action bar below (or above) the selected video,
// similar in appearance and interaction to LinkTooltip.
import { createElement, on, portalOf, svgIcon } from '../core/dom.js';
import { BaseMediaTooltip } from './BaseMediaTooltip.js';
// Layout and delete glyphs match the image tooltip's, so share them.
import { ICONS as IMAGE_ICONS } from './ImageTooltip.js';

const ICONS = {
  floatLeft:   IMAGE_ICONS.floatLeft,
  floatRight:  IMAGE_ICONS.floatRight,
  floatNone:   IMAGE_ICONS.floatNone,
  alignCenter: IMAGE_ICONS.alignCenter,
  originalSize:IMAGE_ICONS.originalSize,
  deleteVideo: IMAGE_ICONS.deleteImg,
  preview:     svgIcon(`<polygon points="5 3 19 12 5 21 5 3"/>`),
};

export class VideoTooltip extends BaseMediaTooltip {
  initialize() {
    this._el = this._buildTooltip();
    portalOf(this.context).appendChild(this._el);

    const editable = this.context.layoutInfo.editable;

    this._disposers.push(
      on(editable, 'mouseover', (e) => {
        if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
        // The shield div sits on top of iframes — we detect hover via it or the wrapper
        const target = /** @type {Element} */ (e.target);
        const wrapper = target?.closest('.an-video-wrapper');
        if (wrapper && editable.contains(wrapper)) {
          this._scheduleShow(wrapper);
        }
      }, { passive: true }),
      on(editable, 'mouseout', (e) => {
        const to = /** @type {MouseEvent} */ (e).relatedTarget;
        if (!to || (!editable.contains(/** @type {Node} */ (to)) && !this._el.contains(/** @type {Node} */ (to)))) {
          this._scheduleHide();
        }
      }, { passive: true }),
      on(document, 'click', (e) => {
        const target = /** @type {Node} */ (e.target);
        if (
          this._active &&
          !this._active.contains(target) &&
          !this._el.contains(target)
        ) {
          this._hide();
        }
      }),
      // Hide when the page scrolls or resizes — the tooltip position becomes stale
      on(globalThis, 'scroll', () => this._hide(), { passive: true }),
      on(globalThis, 'resize', () => this._hide(), { passive: true }),
    );

    return this;
  }

  destroy() {
    if (this._previewMode) this._exitPreview();
    this._clearTimers();
    this._disposers.forEach((d) => d());
    this._disposers = [];
    this._el?.remove();
    this._el = null;
  }

  // ---------------------------------------------------------------------------
  // Base hooks — keep the bar pinned while a preview is playing
  // ---------------------------------------------------------------------------

  /** @returns {boolean} */
  _canHide() { return !this._previewMode; }

  _beforeHide() {
    if (this._previewMode) this._exitPreview();
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  _buildTooltip() {
    const L = this.context.locale.tooltips.video;
    const el = createElement('div', {
      class: 'an-link-tooltip an-video-tooltip',
      role: 'toolbar',
      'aria-label': L.ariaLabel,
    });
    el.style.display = 'none';

    // Label
    this._label = createElement('span', { class: 'an-link-tooltip-url' });
    this._label.textContent = L.label;
    el.appendChild(this._label);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._floatLeftBtn  = this._makeBtn(ICONS.floatLeft,    L.floatLeft,    () => this._setFloat('left'));
    this._floatNoneBtn  = this._makeBtn(ICONS.floatNone,    L.noFloat,      () => this._setFloat(''));
    this._alignCenterBtn = this._makeBtn(ICONS.alignCenter, L.alignCenter,  () => this._setCenter());
    this._floatRightBtn = this._makeBtn(ICONS.floatRight,   L.floatRight,   () => this._setFloat('right'));

    el.appendChild(this._floatLeftBtn);
    el.appendChild(this._floatNoneBtn);
    el.appendChild(this._alignCenterBtn);
    el.appendChild(this._floatRightBtn);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._originalBtn = this._makeBtn(ICONS.originalSize, L.originalSize, () => this._resetSize());

    el.appendChild(this._originalBtn);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._previewBtn = this._makeBtn(ICONS.preview, L.previewVideo, () => this._togglePreview());
    el.appendChild(this._previewBtn);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._deleteBtn = this._makeBtn(ICONS.deleteVideo, L.deleteVideo, () => this._delete(), true);

    el.appendChild(this._deleteBtn);

    // Keep tooltip alive while hovering it
    this._disposers.push(
      on(el, 'mouseenter', () => this._clearTimers()),
      on(el, 'mouseleave', () => this._scheduleHide()),
    );

    return el;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _setFloat(value) {
    const wrapper = this._active;
    if (!wrapper) return;
    wrapper.style.float        = value;
    wrapper.style.display      = value ? 'inline-block' : '';
    wrapper.style.marginLeft   = value === 'right' ? '12px' : '';
    wrapper.style.marginRight  = value === 'left'  ? '12px' : '';
    this.context.invoke('editor.afterCommand');
    this.context.invoke('videoResizer.updateOverlay');
    requestAnimationFrame(() => { if (this._active) this._positionNear(this._active); });
  }

  _setCenter() {
    const wrapper = this._active;
    if (!wrapper) return;
    wrapper.style.float       = '';
    wrapper.style.display     = 'block';
    wrapper.style.marginLeft  = 'auto';
    wrapper.style.marginRight = 'auto';
    this.context.invoke('editor.afterCommand');
    this.context.invoke('videoResizer.updateOverlay');
    requestAnimationFrame(() => { if (this._active) this._positionNear(this._active); });
  }

  _resetSize() {
    const wrapper = this._active;
    if (!wrapper) return;
    const embed = /** @type {HTMLElement|null} */ (wrapper.querySelector('iframe, video'));
    wrapper.style.width  = '';
    wrapper.style.height = '';
    if (embed) {
      embed.removeAttribute('width');
      embed.removeAttribute('height');
      embed.style.width  = '';
      embed.style.height = '';
    }
    this.context.invoke('editor.afterCommand');
    this.context.invoke('videoResizer.updateOverlay');
    requestAnimationFrame(() => { if (this._active) this._positionNear(this._active); });
  }

  _delete() {
    const wrapper = this._active;
    if (!wrapper) return;
    this._hide();
    this.context.invoke('videoResizer.deselect');
    wrapper.remove();
    this.context.invoke('editor.afterCommand');
  }

  // ---------------------------------------------------------------------------
  // Preview mode — temporarily disables the shield so the video is interactive
  // ---------------------------------------------------------------------------

  _togglePreview() {
    if (this._previewMode) {
      this._exitPreview();
    } else {
      this._enterPreview();
    }
  }

  _enterPreview() {
    const wrapper = this._active;
    if (!wrapper) return;
    this._previewMode = true;

    // Hide the shield so the iframe / video receives pointer events directly
    const shield = /** @type {HTMLElement|null} */ (wrapper.querySelector('.an-video-shield'));
    if (shield) shield.style.display = 'none';

    // Hide the resize overlay — it would block interaction with the embed
    this.context.invoke('videoResizer.deselect');

    // Visual feedback: button turns primary-coloured
    this._previewBtn.classList.add('an-link-tooltip-btn--copied');
    this._previewBtn.title = this.context.locale.tooltips.video.exitPreview;

    // Exit preview on mousedown outside the wrapper.
    // Using 'mousedown' (not 'click') so clicks inside an iframe
    // — which never bubble to the outer document — don't accidentally
    // leave preview mode stuck. For <video> elements, mousedown on the
    // video is inside the wrapper so contains() returns true → no exit.
    this._previewClickOff = (e) => {
      if (!wrapper.contains(e.target) && !this._el.contains(e.target)) {
        this._exitPreview();
      }
    };
    document.addEventListener('mousedown', this._previewClickOff, true);
  }

  _exitPreview() {
    this._previewMode = false;

    const wrapper = this._active;
    if (wrapper) {
      // Restore the shield
      const shield = /** @type {HTMLElement|null} */ (wrapper.querySelector('.an-video-shield'));
      if (shield) shield.style.display = '';
    }

    // Reset button appearance
    this._previewBtn.classList.remove('an-link-tooltip-btn--copied');
    this._previewBtn.title = this.context.locale.tooltips.video.previewVideo;

    if (this._previewClickOff) {
      document.removeEventListener('mousedown', this._previewClickOff, true);
      this._previewClickOff = null;
    }
  }
}
