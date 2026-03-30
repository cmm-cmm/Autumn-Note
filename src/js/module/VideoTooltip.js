// VideoTooltip.js - Hover tooltip for video wrappers inside the editor
// Displays a horizontal action bar below (or above) the selected video,
// similar in appearance and interaction to LinkTooltip.
import { createElement, on } from '../core/dom.js';

const ICONS = {
  floatLeft:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>`,
  floatRight:  `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>`,
  floatNone:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>`,
  alignCenter: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="8" rx="1"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="6" y1="20" x2="18" y2="20"/></svg>`,
  originalSize:`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  deleteVideo: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
};

const SHOW_DELAY = 100;
const HIDE_DELAY = 180;

export class VideoTooltip {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this._el = null;
    this._activeWrapper = null;
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
        // The shield div sits on top of iframes — we detect hover via it or the wrapper
        const wrapper = e.target.closest('.an-video-wrapper');
        if (wrapper && editable.contains(wrapper)) {
          this._scheduleShow(wrapper);
        }
      }),
      on(editable, 'mouseout', (e) => {
        const to = e.relatedTarget;
        if (!to || (!editable.contains(to) && !this._el.contains(to))) {
          this._scheduleHide();
        }
      }),
      on(document, 'click', (e) => {
        if (
          this._activeWrapper &&
          !this._activeWrapper.contains(e.target) &&
          !this._el.contains(e.target)
        ) {
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
      class: 'an-link-tooltip an-video-tooltip',
      role: 'toolbar',
      'aria-label': 'Video actions',
    });
    el.style.display = 'none';

    // Label
    this._label = createElement('span', { class: 'an-link-tooltip-url' });
    this._label.textContent = 'Video';
    el.appendChild(this._label);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._floatLeftBtn  = this._makeBtn(ICONS.floatLeft,    'Float Left',     () => this._setFloat('left'));
    this._floatNoneBtn  = this._makeBtn(ICONS.floatNone,    'No Float',       () => this._setFloat(''));
    this._alignCenterBtn = this._makeBtn(ICONS.alignCenter, 'Align Center',   () => this._setCenter());
    this._floatRightBtn = this._makeBtn(ICONS.floatRight,   'Float Right',    () => this._setFloat('right'));

    el.appendChild(this._floatLeftBtn);
    el.appendChild(this._floatNoneBtn);
    el.appendChild(this._alignCenterBtn);
    el.appendChild(this._floatRightBtn);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._originalBtn = this._makeBtn(ICONS.originalSize, 'Original Size', () => this._resetSize());

    el.appendChild(this._originalBtn);

    el.appendChild(createElement('div', { class: 'an-link-tooltip-sep' }));

    this._deleteBtn = this._makeBtn(ICONS.deleteVideo, 'Delete Video', () => this._delete(), true);

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

  _scheduleShow(wrapper) {
    if (this._activeWrapper === wrapper && this._el.style.display !== 'none') return;
    clearTimeout(this._hideTimer);
    this._hideTimer = null;
    clearTimeout(this._showTimer);
    this._showTimer = setTimeout(() => {
      this._activeWrapper = wrapper;
      this._show(wrapper);
    }, SHOW_DELAY);
  }

  _scheduleHide() {
    clearTimeout(this._showTimer);
    this._showTimer = null;
    if (this._hideTimer) return;
    this._hideTimer = setTimeout(() => this._hide(), HIDE_DELAY);
  }

  _show(wrapper) {
    this._el.style.display = 'flex';
    this._positionNear(wrapper);
  }

  _hide() {
    this._el.style.display = 'none';
    this._activeWrapper = null;
    this._clearTimers();
  }

  _clearTimers() {
    clearTimeout(this._showTimer);
    clearTimeout(this._hideTimer);
    this._showTimer = null;
    this._hideTimer = null;
  }

  _positionNear(wrapper) {
    const rect   = wrapper.getBoundingClientRect();
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
    const wrapper = this._activeWrapper;
    if (!wrapper) return;
    wrapper.style.float        = value;
    wrapper.style.display      = value ? 'inline-block' : 'inline-block';
    wrapper.style.marginLeft   = value === 'right' ? '12px' : '';
    wrapper.style.marginRight  = value === 'left'  ? '12px' : '';
    this.context.invoke('editor.afterCommand');
    this.context.invoke('videoResizer.updateOverlay');
    this._positionNear(wrapper);
  }

  _setCenter() {
    const wrapper = this._activeWrapper;
    if (!wrapper) return;
    wrapper.style.float       = '';
    wrapper.style.display     = 'block';
    wrapper.style.marginLeft  = 'auto';
    wrapper.style.marginRight = 'auto';
    this.context.invoke('editor.afterCommand');
    this.context.invoke('videoResizer.updateOverlay');
    this._positionNear(wrapper);
  }

  _resetSize() {
    const wrapper = this._activeWrapper;
    if (!wrapper) return;
    const embed = wrapper.querySelector('iframe, video');
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
    this._positionNear(wrapper);
  }

  _delete() {
    const wrapper = this._activeWrapper;
    if (!wrapper) return;
    this._hide();
    this.context.invoke('videoResizer.deselect');
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    this.context.invoke('editor.afterCommand');
  }
}
