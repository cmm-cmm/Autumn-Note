// VideoResizer.js - Interactive resize handles for selected videos in the editor
// Targets .an-video-wrapper divs (containing <iframe> or <video>)
import { on } from '../core/dom.js';

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

export class VideoResizer {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    /** @type {HTMLElement|null} — the .an-video-wrapper div */
    this._activeWrapper = null;
    this._overlay = null;
    this._disposers = [];
    this._positionRaf = null;
  }

  initialize() {
    this._overlay = this._buildOverlay();
    const container = this.context.layoutInfo.editable.closest('.an-container') || document.body;
    container.appendChild(this._overlay);
    this._container = container;

    const editable = this.context.layoutInfo.editable;

    let _resizeDebounce = null;
    const onWindowResize = () => {
      clearTimeout(_resizeDebounce);
      _resizeDebounce = setTimeout(() => this._updateOverlayPosition(), 100);
    };

    this._disposers.push(
      on(editable, 'click', (e) => this._onEditorClick(e)),
      on(editable, 'contextmenu', (e) => {
        if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
        const wrapper = this._findWrapper(e.target);
        if (wrapper) this._select(wrapper);
      }),
      on(document, 'click', (e) => this._onDocClick(e)),
      on(window, 'scroll', () => this._updateOverlayPosition(), { passive: true }),
      on(window, 'resize', onWindowResize),
      on(editable, 'scroll', () => this._updateOverlayPosition(), { passive: true }),
      // D1: Prevent native browser drag of video wrappers. Without this, a user
      // can hold-and-drag to produce a "copy" that lands outside .an-editable,
      // where the .an-video-shield CSS loses its containing context so the
      // copied video becomes directly playable.
      on(editable, 'dragstart', (e) => {
        if (e.target instanceof Element && e.target.closest('.an-video-wrapper')) {
          e.preventDefault();
        }
      }),
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
    if (this._positionRaf) {
      cancelAnimationFrame(this._positionRaf);
      this._positionRaf = null;
    }
    this._deselect();
    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay);
    }
    this._overlay = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** @returns {HTMLElement|null} */
  getActiveWrapper() {
    return this._activeWrapper;
  }

  updateOverlay() {
    this._updateOverlayPosition();
  }

  deselect() {
    this._deselect();
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  /**
   * Walk up the DOM from `el` to find the nearest .an-video-wrapper,
   * or an iframe/video whose parent is .an-video-wrapper.
   * @param {EventTarget} el
   * @returns {HTMLElement|null}
   */
  _findWrapper(el) {
    if (!el || !(el instanceof Element)) return null;
    // Direct hit on wrapper
    if (el.classList && el.classList.contains('an-video-wrapper')) return el;
    // Child element (iframe, video, or nested)
    const w = el.closest('.an-video-wrapper');
    if (w) return w;
    return null;
  }

  _buildOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'an-video-resizer';
    overlay.style.display = 'none';

    HANDLE_DEFS.forEach(({ pos }) => {
      const h = document.createElement('div');
      h.className = `an-resize-handle an-resize-${pos}`;
      h.dataset.handle = pos;
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
    if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
    const wrapper = this._findWrapper(e.target);
    if (wrapper) {
      e.preventDefault();
      this._select(wrapper);
    }
  }

  _onDocClick(e) {
    if (!this._activeWrapper) return;
    if (this._activeWrapper.contains(e.target)) return;
    if (this._overlay && this._overlay.contains(e.target)) return;
    if (e.target.closest('.an-contextmenu')) return;
    this._deselect();
  }

  _select(wrapper) {
    if (this._activeWrapper && this._activeWrapper !== wrapper) {
      this._activeWrapper.classList.remove('an-video-selected');
    }
    this._activeWrapper = wrapper;
    wrapper.classList.add('an-video-selected');
    this._updateOverlayPosition();
    this._overlay.style.display = 'block';
  }

  _deselect() {
    if (this._activeWrapper) {
      this._activeWrapper.classList.remove('an-video-selected');
      this._activeWrapper = null;
    }
    if (this._overlay) this._overlay.style.display = 'none';
  }

  _updateOverlayPosition() {
    if (this._positionRaf) cancelAnimationFrame(this._positionRaf);
    this._positionRaf = requestAnimationFrame(() => {
      this._positionRaf = null;
      this._updateOverlayPositionNow();
    });
  }

  _updateOverlayPositionNow() {
    if (!this._activeWrapper || !this._overlay) return;
    const offsetParent = this._overlay.offsetParent || this._container;
    const containerRect = offsetParent.getBoundingClientRect();
    const rect = this._activeWrapper.getBoundingClientRect();
    const left = rect.left - containerRect.left + offsetParent.scrollLeft;
    const top = rect.top - containerRect.top + offsetParent.scrollTop;
    this._overlay.style.left   = `${left}px`;
    this._overlay.style.top    = `${top}px`;
    this._overlay.style.width  = `${rect.width}px`;
    this._overlay.style.height = `${rect.height}px`;
  }

  _startResize(e, pos) {
    const wrapper = this._activeWrapper;
    if (!wrapper) return;

    const embed = wrapper.querySelector('iframe, video');
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = wrapper.offsetWidth  || 560;
    const startH = wrapper.offsetHeight || 315;
    const aspectRatio = startW / (startH || 1);
    const isCorner = pos.length === 2;

    const editable = this.context.layoutInfo.editable;
    let _raf = null; // rAF handle — at most one write per paint frame

    const onMove = (me) => {
      if (_raf !== null) return;
      const clientX = me.clientX;
      const clientY = me.clientY;
      _raf = requestAnimationFrame(() => {
        _raf = null;
        const dx = clientX - startX;
        const dy = clientY - startY;
        const maxW = editable.clientWidth || Infinity;
        let newW = startW;
        let newH = startH;

        if (pos.includes('e')) newW = Math.max(80, startW + dx);
        if (pos.includes('w')) newW = Math.max(80, startW - dx);
        if (pos.includes('s')) newH = Math.max(45, startH + dy);
        if (pos.includes('n')) newH = Math.max(45, startH - dy);

        newW = Math.min(newW, maxW);

        if (isCorner) {
          if (Math.abs(dx) >= Math.abs(dy)) {
            newH = Math.max(45, Math.round(newW / aspectRatio));
          } else {
            newW = Math.min(Math.max(80, Math.round(newH * aspectRatio)), maxW);
            newH = Math.max(45, Math.round(newW / aspectRatio));
          }
        }

        // Resize wrapper and inner embed via CSS only — attribute writes are redundant
        wrapper.style.width  = `${newW}px`;
        wrapper.style.height = `${newH}px`;
        if (embed) {
          embed.style.width  = `${newW}px`;
          embed.style.height = `${newH}px`;
        }
        this._updateOverlayPosition();
      });
    };

    const onUp = () => {
      if (_raf !== null) { cancelAnimationFrame(_raf); _raf = null; }
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
