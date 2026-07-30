// VideoResizer.js - Interactive resize handles for selected videos in the editor
// Targets .an-video-wrapper divs (containing <iframe> or <video>)
import { on } from '../core/dom.js';
import { BaseResizer } from './BaseResizer.js';

export class VideoResizer extends BaseResizer {
  get _overlayClass() { return 'an-video-resizer'; }
  get _selectedClass() { return 'an-video-selected'; }

  /**
   * Walk up the DOM from `el` to find the nearest .an-video-wrapper,
   * or an iframe/video whose parent is .an-video-wrapper.
   * @param {EventTarget|null} el
   * @returns {HTMLElement|null}
   */
  _findTarget(el) {
    if (!el || !(el instanceof Element)) return null;
    if (el.classList?.contains('an-video-wrapper')) return /** @type {HTMLElement} */ (el);
    return /** @type {HTMLElement|null} */ (el.closest('.an-video-wrapper'));
  }

  /** @param {HTMLElement} wrapper */
  _getStartSize(wrapper) {
    return { w: wrapper.offsetWidth || 560, h: wrapper.offsetHeight || 315 };
  }

  _getMinSize() {
    return { minW: 80, minH: 45 };
  }

  /** @param {HTMLElement} wrapper @param {number} w @param {number} h */
  _applySize(wrapper, w, h) {
    // Resize wrapper and inner embed via CSS only — attribute writes are redundant
    wrapper.style.width  = `${w}px`;
    wrapper.style.height = `${h}px`;
    const embed = /** @type {HTMLElement|null} */ (wrapper.querySelector('iframe, video'));
    if (embed) {
      embed.style.width  = `${w}px`;
      embed.style.height = `${h}px`;
    }
  }

  _extraListeners() {
    const editable = this.context.layoutInfo.editable;
    return [
      // D1: Prevent native browser drag of video wrappers. Without this, a user
      // can hold-and-drag to produce a "copy" that lands outside .an-editable,
      // where the .an-video-shield CSS loses its containing context so the
      // copied video becomes directly playable.
      on(editable, 'dragstart', (e) => {
        if (e.target instanceof Element && e.target.closest('.an-video-wrapper')) {
          e.preventDefault();
        }
      }),
    ];
  }

  // ---------------------------------------------------------------------------
  // Public API used by other modules
  // ---------------------------------------------------------------------------

  /** @returns {HTMLElement|null} */
  getActiveWrapper() {
    return this._active;
  }
}
