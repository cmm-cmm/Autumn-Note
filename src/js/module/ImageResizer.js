// ImageResizer.js - Interactive resize handles for selected images in the editor
import { on } from '../core/dom.js';

/**
 * Eight handle positions. 'pos' is used as CSS class suffix and
 * to determine which axis/direction is being dragged.
 *
 * Pos length 2 → corner handle → maintain aspect ratio.
 * Pos length 1 → edge handle  → single-axis resize.
 */
const HANDLE_DEFS = [
  { pos: 'nw', cursor: 'nw-resize' },
  { pos: 'n',  cursor: 'n-resize'  },
  { pos: 'ne', cursor: 'ne-resize' },
  { pos: 'e',  cursor: 'e-resize'  },
  { pos: 'se', cursor: 'se-resize' },
  { pos: 's',  cursor: 's-resize'  },
  { pos: 'sw', cursor: 'sw-resize' },
  { pos: 'w',  cursor: 'w-resize'  },
];

export class ImageResizer {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    /** @type {HTMLImageElement|null} */
    this._activeImg = null;
    this._overlay = null;
    this._disposers = [];
  }

  initialize() {
    this._overlay = this._buildOverlay();
    document.body.appendChild(this._overlay);

    const editable = this.context.layoutInfo.editable;

    this._disposers.push(
      on(editable, 'click', (e) => this._onEditorClick(e)),
      // Also select on right-click so the highlight shows before the context menu
      on(editable, 'contextmenu', (e) => {
        const img = e.target.closest('img');
        if (img) this._select(img);
      }),
      on(document, 'click', (e) => this._onDocClick(e)),
      on(window, 'scroll', () => this._updateOverlayPosition(), { passive: true }),
      on(window, 'resize', () => this._updateOverlayPosition()),
      on(editable, 'scroll', () => this._updateOverlayPosition(), { passive: true }),
    );

    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._dragDisposers) {
      this._dragDisposers.forEach((d) => d());
      this._dragDisposers = null;
    }
    this._deselect();
    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay);
    }
    this._overlay = null;
  }

  // ---------------------------------------------------------------------------
  // Public API used by other modules
  // ---------------------------------------------------------------------------

  /** @returns {HTMLImageElement|null} */
  getActiveImage() {
    return this._activeImg;
  }

  /** Re-sync overlay position (call after external size changes). */
  updateOverlay() {
    this._updateOverlayPosition();
  }

  /** Programmatically clear the current image selection. */
  deselect() {
    this._deselect();
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  _buildOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'an-image-resizer';
    overlay.style.display = 'none';

    HANDLE_DEFS.forEach(({ pos }) => {
      const h = document.createElement('div');
      h.className = `an-resize-handle an-resize-${pos}`;
      h.dataset.handle = pos;
      // Attach handle listeners here so they're torn down in destroy() via _disposers
      this._disposers.push(
        on(h, 'mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._startResize(e, pos);
        }),
      );
      overlay.appendChild(h);
    });

    return overlay;
  }

  _onEditorClick(e) {
    const img = e.target.closest('img');
    if (img) {
      // Prevent browser from deselecting the current text selection / opening native resize
      e.preventDefault();
      this._select(img);
    }
  }

  _onDocClick(e) {
    if (!this._activeImg) return;
    if (e.target === this._activeImg) return;
    if (this._overlay && this._overlay.contains(e.target)) return;
    // Don't deselect while interacting with the context menu
    if (e.target.closest('.an-contextmenu')) return;
    this._deselect();
  }

  _select(img) {
    if (this._activeImg && this._activeImg !== img) {
      this._activeImg.classList.remove('an-image-selected');
    }
    this._activeImg = img;
    img.classList.add('an-image-selected');
    this._updateOverlayPosition();
    this._overlay.style.display = 'block';
  }

  _deselect() {
    if (this._activeImg) {
      this._activeImg.classList.remove('an-image-selected');
      this._activeImg = null;
    }
    if (this._overlay) this._overlay.style.display = 'none';
  }

  _updateOverlayPosition() {
    if (!this._activeImg || !this._overlay) return;
    const rect = this._activeImg.getBoundingClientRect();
    this._overlay.style.left   = `${rect.left}px`;
    this._overlay.style.top    = `${rect.top}px`;
    this._overlay.style.width  = `${rect.width}px`;
    this._overlay.style.height = `${rect.height}px`;
  }

  _startResize(e, pos) {
    const img = this._activeImg;
    if (!img) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = img.offsetWidth  || img.naturalWidth  || 100;
    const startH = img.offsetHeight || img.naturalHeight || 100;
    const aspectRatio = startW / (startH || 1);
    const isCorner = pos.length === 2; // 'nw','ne','se','sw'

    const editable = this.context.layoutInfo.editable;
    const onMove = (me) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      const maxW = editable.clientWidth || Infinity;
      let newW = startW;
      let newH = startH;

      if (pos.includes('e')) newW = Math.max(20, startW + dx);
      if (pos.includes('w')) newW = Math.max(20, startW - dx);
      if (pos.includes('s')) newH = Math.max(20, startH + dy);
      if (pos.includes('n')) newH = Math.max(20, startH - dy);

      // Clamp to container width
      newW = Math.min(newW, maxW);

      if (isCorner) {
        // Lock aspect ratio: use larger absolute delta to drive both dimensions
        if (Math.abs(dx) >= Math.abs(dy)) {
          newH = Math.max(20, Math.round(newW / aspectRatio));
        } else {
          newW = Math.min(Math.max(20, Math.round(newH * aspectRatio)), maxW);
          newH = Math.max(20, Math.round(newW / aspectRatio));
        }
      }

      img.style.width  = `${newW}px`;
      img.style.height = `${newH}px`;
      this._updateOverlayPosition();
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this._dragDisposers = null;
      this.context.invoke('editor.afterCommand');
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    // Track these so destroy() can clean them up if called during an active drag
    this._dragDisposers = [
      () => document.removeEventListener('mousemove', onMove),
      () => document.removeEventListener('mouseup', onUp),
    ];
  }
}
