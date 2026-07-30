/**
 * BaseResizer.js — Shared drag-to-resize overlay for selectable embeds.
 *
 * ImageResizer and VideoResizer were ~28% duplicate: identical overlay
 * construction, selection tracking, scroll/resize repositioning and drag maths,
 * differing only in what counts as a target and how the new size is applied.
 * Subclasses now supply just those differences via the hooks below.
 *
 * Mirrors the existing BaseDialog pattern used by the dialog modules.
 */

import { on } from '../core/dom.js';

/**
 * Eight handle positions. 'pos' is used as CSS class suffix and to determine
 * which axis/direction is being dragged.
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

export class BaseResizer {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    /** @type {HTMLElement|null} Currently selected element */
    this._active = null;
    /** @type {HTMLElement|null} */
    this._overlay = null;
    this._disposers = [];
    this._positionRaf = null;
    /** @type {{l:number,t:number,w:number,h:number}|null} Last written overlay box */
    this._lastOverlayPos = null;
  }

  // ---------------------------------------------------------------------------
  // Subclass hooks
  // ---------------------------------------------------------------------------

  /** CSS class for the overlay element. @returns {string} */
  get _overlayClass() { return 'an-resizer'; }

  /** CSS class applied to the selected element. @returns {string} */
  get _selectedClass() { return 'an-selected'; }

  /**
   * Resolves an event target to a resizable element.
   * @param {EventTarget|null} _el
   * @returns {HTMLElement|null}
   */
  _findTarget(_el) { return null; }

  /**
   * Natural starting dimensions of the target, used as the drag baseline.
   * @param {HTMLElement} _target
   * @returns {{ w: number, h: number }}
   */
  _getStartSize(_target) { return { w: 0, h: 0 }; }

  /** Smallest allowed dimensions. @returns {{ minW: number, minH: number }} */
  _getMinSize() { return { minW: 20, minH: 20 }; }

  /**
   * Writes the new size to the target (and any inner embed).
   * @param {HTMLElement} _target
   * @param {number} _w
   * @param {number} _h
   */
  _applySize(_target, _w, _h) {}

  /**
   * Additional listeners a subclass needs; the returned disposers are torn down
   * with the rest in destroy().
   * @returns {Array<() => void>}
   */
  _extraListeners() { return []; }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this._overlay = this._buildOverlay();
    const container = this.context.layoutInfo.editable.closest('.an-container') || document.body;
    container.appendChild(this._overlay);
    this._container = container;

    const editable = this.context.layoutInfo.editable;

    // Debounce window resize — _updateOverlayPosition already has rAF gating but
    // every call cancels + re-schedules it; a debounce reduces that churn.
    let resizeDebounce = null;
    const onWindowResize = () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => this._updateOverlayPosition(), 100);
    };

    this._disposers.push(
      on(editable, 'click', (e) => this._onEditorClick(e)),
      // Also select on right-click so the highlight shows before the context menu
      on(editable, 'contextmenu', (e) => {
        if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
        const target = this._findTarget(e.target);
        if (target) this._select(target);
      }),
      on(document, 'click', (e) => this._onDocClick(e)),
      on(globalThis, 'scroll', () => this._updateOverlayPosition(), { passive: true }),
      on(globalThis, 'resize', onWindowResize, { passive: true }),
      on(editable, 'scroll', () => this._updateOverlayPosition(), { passive: true }),
      ...this._extraListeners(),
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
    this._overlay?.remove();
    this._overlay = null;
  }

  // ---------------------------------------------------------------------------
  // Public API used by other modules
  // ---------------------------------------------------------------------------

  /** Re-sync overlay position (call after external size changes). */
  updateOverlay() {
    this._updateOverlayPosition();
  }

  /** Programmatically clear the current selection. */
  deselect() {
    this._deselect();
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  _buildOverlay() {
    const overlay = document.createElement('div');
    overlay.className = this._overlayClass;
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
    if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
    const target = this._findTarget(e.target);
    if (target) {
      // Prevent the browser from dropping the text selection / showing its own
      // native resize affordance.
      e.preventDefault();
      this._select(target);
    }
  }

  _onDocClick(e) {
    if (!this._active) return;
    if (this._active.contains(e.target)) return;
    if (this._overlay?.contains(e.target)) return;
    // Don't deselect while interacting with the context menu
    if (e.target.closest?.('.an-contextmenu')) return;
    this._deselect();
  }

  _select(target) {
    if (this._active && this._active !== target) {
      this._active.classList.remove(this._selectedClass);
    }
    this._active = target;
    this._lastOverlayPos = null; // invalidate position cache on new selection
    target.classList.add(this._selectedClass);
    this._updateOverlayPosition();
    this._overlay.style.display = 'block';
  }

  _deselect() {
    if (this._active) {
      this._active.classList.remove(this._selectedClass);
      this._active = null;
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
    if (!this._active || !this._overlay) return;
    const offsetParent = this._overlay.offsetParent || this._container;
    const containerRect = offsetParent.getBoundingClientRect();
    const rect = this._active.getBoundingClientRect();

    // Skip DOM writes when position hasn't changed (common during non-scroll rAF ticks)
    const p = this._lastOverlayPos;
    if (p?.l === rect.left && p.t === rect.top && p.w === rect.width && p.h === rect.height) return;
    this._lastOverlayPos = { l: rect.left, t: rect.top, w: rect.width, h: rect.height };

    const left = rect.left - containerRect.left + offsetParent.scrollLeft;
    const top = rect.top - containerRect.top + offsetParent.scrollTop;
    this._overlay.style.left   = `${left}px`;
    this._overlay.style.top    = `${top}px`;
    this._overlay.style.width  = `${rect.width}px`;
    this._overlay.style.height = `${rect.height}px`;
  }

  _startResize(e, pos) {
    const target = this._active;
    if (!target) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const { w: startW, h: startH } = this._getStartSize(target);
    const { minW, minH } = this._getMinSize();
    const aspectRatio = startW / (startH || 1);
    const isCorner = pos.length === 2; // 'nw','ne','se','sw'

    const editable = this.context.layoutInfo.editable;
    let raf = null; // rAF handle — ensures at most one write per paint frame

    const onMove = (me) => {
      if (raf !== null) return; // frame already pending, discard this event
      const clientX = me.clientX;
      const clientY = me.clientY;
      raf = requestAnimationFrame(() => {
        raf = null;
        const dx = clientX - startX;
        const dy = clientY - startY;
        const maxW = editable.clientWidth || Infinity;
        let newW = startW;
        let newH = startH;

        if (pos.includes('e')) newW = Math.max(minW, startW + dx);
        if (pos.includes('w')) newW = Math.max(minW, startW - dx);
        if (pos.includes('s')) newH = Math.max(minH, startH + dy);
        if (pos.includes('n')) newH = Math.max(minH, startH - dy);

        newW = Math.min(newW, maxW);

        if (isCorner) {
          if (Math.abs(dx) >= Math.abs(dy)) {
            newH = Math.max(minH, Math.round(newW / aspectRatio));
          } else {
            newW = Math.min(Math.max(minW, Math.round(newH * aspectRatio)), maxW);
            newH = Math.max(minH, Math.round(newW / aspectRatio));
          }
        }

        this._applySize(target, newW, newH);
        this._updateOverlayPosition();
      });
    };

    const onUp = () => {
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
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
