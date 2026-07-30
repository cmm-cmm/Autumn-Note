// ImageResizer.js - Interactive resize handles for selected images in the editor
import { BaseResizer } from './BaseResizer.js';

export class ImageResizer extends BaseResizer {
  get _overlayClass() { return 'an-image-resizer'; }
  get _selectedClass() { return 'an-image-selected'; }

  /** @param {EventTarget|null} el @returns {HTMLImageElement|null} */
  _findTarget(el) {
    return /** @type {HTMLImageElement|null} */ (
      el instanceof Element ? el.closest('img') : null
    );
  }

  /** @param {HTMLImageElement} img */
  _getStartSize(img) {
    return {
      w: img.offsetWidth  || img.naturalWidth  || 100,
      h: img.offsetHeight || img.naturalHeight || 100,
    };
  }

  _getMinSize() {
    const min = this.context.options?.minImageSize ?? 20;
    return { minW: min, minH: min };
  }

  /** @param {HTMLImageElement} img @param {number} w @param {number} h */
  _applySize(img, w, h) {
    img.style.width  = `${w}px`;
    img.style.height = `${h}px`;
  }

  // ---------------------------------------------------------------------------
  // Public API used by other modules
  // ---------------------------------------------------------------------------

  /** @returns {HTMLImageElement|null} */
  getActiveImage() {
    return /** @type {HTMLImageElement|null} */ (this._active);
  }
}
