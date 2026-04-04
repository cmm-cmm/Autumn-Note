// ImageCropOverlay.js - Inline crop overlay for images inside the editor
//
// Architecture:
//  - A dark scrim fills the entire viewport (fixed, z=10100) with a transparent
//    cutout showing the current crop region (clip-path technique).
//  - A "crop box" div overlaps the cutout; four corner + four edge handles let
//    the user drag to resize it.
//  - On Confirm: draws the crop region onto an off-screen canvas and replaces
//    img.src with a data-URL.  Cross-origin images are caught and a warning is
//    shown instead of crashing.
//  - All pointer listeners are document-level and are torn down after each
//    interaction to avoid leaks.

import { on } from '../core/dom.js';

// Minimum crop box dimension in CSS pixels
const MIN_SIZE = 20;

// Accent colour for handles (synced with $an-primary)
const ACCENT = '#3b82f6';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp `value` between `lo` and `hi`. */
const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

/**
 * Attempt to draw `img` onto a canvas even if it was loaded without CORS.
 * Returns a canvas element on success, or null if the image is cross-origin
 * tainted and cannot be read.
 *
 * Strategy:
 *  1. Try directly — works for same-origin and data/blob URLs.
 *  2. Re-load with crossOrigin="anonymous" and retry (needs server ACAO header).
 *
 * @param {HTMLImageElement} img
 * @param {DOMRect} naturalRect - crop region in *natural* image pixels
 * @param {number} renderW - desired output width
 * @param {number} renderH - desired output height
 * @returns {Promise<HTMLCanvasElement|null>}
 */
function drawCropToCanvas(img, naturalRect, renderW, renderH) {
  return new Promise((resolve) => {
    const tryDraw = (source) => {
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(renderW);
      canvas.height = Math.round(renderH);
      const ctx = canvas.getContext('2d');
      try {
        ctx.drawImage(
          source,
          naturalRect.x, naturalRect.y, naturalRect.width, naturalRect.height,
          0, 0, canvas.width, canvas.height,
        );
        // Access a pixel — this throws if canvas is tainted
        ctx.getImageData(0, 0, 1, 1);
        resolve(canvas);
      } catch (_) {
        resolve(null);
      }
    };

    // Fast path — data: / blob: / same-origin
    if (
      img.src.startsWith('data:') ||
      img.src.startsWith('blob:') ||
      img.src.startsWith(location.origin)
    ) {
      tryDraw(img);
      return;
    }

    // Cross-origin: try a fresh image with crossOrigin="anonymous"
    const tmp = new Image();
    tmp.crossOrigin = 'anonymous';
    tmp.onload  = () => tryDraw(tmp);
    tmp.onerror = () => resolve(null);
    // Append cache-buster to avoid serving a cached non-CORS response
    tmp.src = img.src + (img.src.includes('?') ? '&' : '?') + '_an=' + Date.now();
  });
}

// ---------------------------------------------------------------------------
// ImageCropOverlay
// ---------------------------------------------------------------------------

export class ImageCropOverlay {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    /** @type {HTMLImageElement|null} */
    this._img = null;
    /** Crop box position in viewport px: { x, y, w, h } */
    this._box = null;
    /** Natural-size bounding rect of the image in viewport px */
    this._imgRect = null;

    this._scrim    = null;
    this._cropBox  = null;
    this._handles  = {};
    this._toolbar  = null;
    this._infoEl   = null;

    this._dragDisposers = null;
    this._disposers = [];
  }

  initialize() {
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    this._close(false);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Open the crop overlay for the given image.
   * @param {HTMLImageElement} img
   */
  open(img) {
    if (this._scrim) this._close(false); // guard: only one at a time

    this._img = img;
    const rect = img.getBoundingClientRect();
    this._imgRect = rect;

    // Default crop box = full image, inset 12 px on each side (feels visual)
    const inset = Math.min(12, rect.width * 0.1, rect.height * 0.1);
    this._box = {
      x: rect.left + inset,
      y: rect.top  + inset,
      w: rect.width  - inset * 2,
      h: rect.height - inset * 2,
    };

    this._buildDOM();
    this._updateDOM();
    this._bindEsc();
  }

  // ---------------------------------------------------------------------------
  // DOM construction
  // ---------------------------------------------------------------------------

  _buildDOM() {
    /* ---- scrim ---- */
    const scrim = document.createElement('div');
    scrim.className = 'an-crop-scrim';
    // Prevent scroll during crop
    scrim.style.cssText = `
      position:fixed; inset:0; z-index:10100;
      cursor:crosshair;
      background: rgba(0,0,0,0.55);
    `;
    // Click on scrim (outside crop box) → cancel
    this._disposers.push(
      on(scrim, 'mousedown', (e) => {
        if (e.target === scrim) this._close(false);
      }),
    );

    /* ---- crop box ---- */
    const cropBox = document.createElement('div');
    cropBox.className = 'an-crop-box';
    cropBox.style.cssText = `
      position:fixed; z-index:10101;
      box-sizing:border-box;
      border:2px solid ${ACCENT};
      cursor:move;
      outline: none;
    `;

    /* ---- rule-of-thirds grid lines ---- */
    const grid = document.createElement('div');
    grid.className = 'an-crop-grid';
    grid.style.cssText = `
      position:absolute; inset:0; pointer-events:none;
      opacity:0.35;
    `;
    // 2 vertical + 2 horizontal lines
    ['33.33%','66.66%'].forEach((pos) => {
      const vl = document.createElement('div');
      vl.style.cssText = `position:absolute;top:0;bottom:0;left:${pos};width:1px;background:#fff;`;
      const hl = document.createElement('div');
      hl.style.cssText = `position:absolute;left:0;right:0;top:${pos};height:1px;background:#fff;`;
      grid.appendChild(vl);
      grid.appendChild(hl);
    });
    cropBox.appendChild(grid);

    /* ---- resize handles ---- */
    const HANDLE_DEFS = [
      { id: 'nw', cur: 'nw-resize', top: '-5px',  left: '-5px'  },
      { id: 'n',  cur: 'n-resize',  top: '-5px',  left: 'calc(50% - 5px)' },
      { id: 'ne', cur: 'ne-resize', top: '-5px',  right: '-5px' },
      { id: 'e',  cur: 'e-resize',  top: 'calc(50% - 5px)', right: '-5px' },
      { id: 'se', cur: 'se-resize', bottom: '-5px', right: '-5px' },
      { id: 's',  cur: 's-resize',  bottom: '-5px', left: 'calc(50% - 5px)' },
      { id: 'sw', cur: 'sw-resize', bottom: '-5px', left: '-5px' },
      { id: 'w',  cur: 'w-resize',  top: 'calc(50% - 5px)', left: '-5px' },
    ];

    HANDLE_DEFS.forEach(({ id, cur, ...pos }) => {
      const h = document.createElement('div');
      h.className = `an-crop-handle an-crop-handle-${id}`;
      h.style.cssText = [
        'position:absolute',
        'width:10px', 'height:10px',
        `background:${ACCENT}`,
        'border:2px solid #fff',
        'border-radius:2px',
        'box-sizing:border-box',
        `cursor:${cur}`,
        ...Object.entries(pos).map(([k, v]) => `${k}:${v}`),
      ].join(';');
      this._disposers.push(
        on(h, 'mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._startHandleDrag(e, id);
        }),
      );
      this._handles[id] = h;
      cropBox.appendChild(h);
    });

    /* ---- crop move drag ---- */
    this._disposers.push(
      on(cropBox, 'mousedown', (e) => {
        // Only directly on the box surface (not on a handle)
        if (e.target !== cropBox && e.target !== grid && !(e.target.tagName === 'DIV' && !e.target.className.includes('handle'))) {
          // Let handle mousedown handle it
          return;
        }
        if (e.target.className && e.target.className.includes('an-crop-handle')) return;
        e.preventDefault();
        e.stopPropagation();
        this._startBoxMove(e);
      }),
    );

    /* ---- info label ---- */
    const infoEl = document.createElement('div');
    infoEl.className = 'an-crop-info';
    infoEl.style.cssText = `
      position:absolute; bottom:-28px; left:0;
      font:bold 11px/20px system-ui,sans-serif;
      color:#fff; white-space:nowrap;
      pointer-events:none;
      text-shadow: 0 1px 3px rgba(0,0,0,.6);
    `;
    cropBox.appendChild(infoEl);
    this._infoEl = infoEl;

    /* ---- floating toolbar ---- */
    const toolbar = document.createElement('div');
    toolbar.className = 'an-crop-toolbar';
    toolbar.style.cssText = `
      position:fixed; z-index:10102;
      background:#1e1e2e; border-radius:6px;
      padding:5px 8px; display:flex; gap:6px;
      align-items:center;
      box-shadow:0 4px 16px rgba(0,0,0,.4);
      font:13px system-ui,sans-serif;
    `;

    const confirmBtn = this._makeToolbarBtn('✓ Crop', '#22c55e', () => this._confirm());
    const cancelBtn  = this._makeToolbarBtn('✕ Cancel', '#94a3b8', () => this._close(false));

    // Aspect ratio lock checkbox
    const arLabel = document.createElement('label');
    arLabel.style.cssText = 'color:#94a3b8;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;';
    const arCheck = document.createElement('input');
    arCheck.type = 'checkbox';
    arCheck.style.accentColor = ACCENT;
    arLabel.appendChild(arCheck);
    arLabel.appendChild(document.createTextNode('Lock ratio'));
    this._arCheck = arCheck;

    toolbar.appendChild(confirmBtn);
    toolbar.appendChild(cancelBtn);
    toolbar.appendChild(arLabel);
    this._toolbar = toolbar;

    // Prevent toolbar clicks from closing the overlay
    this._disposers.push(
      on(toolbar, 'mousedown', (e) => e.stopPropagation()),
    );

    document.body.appendChild(scrim);
    document.body.appendChild(cropBox);
    document.body.appendChild(toolbar);

    this._scrim   = scrim;
    this._cropBox = cropBox;
  }

  _makeToolbarBtn(text, color, handler) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.style.cssText = `
      background:none; border:1px solid ${color}; border-radius:4px;
      color:${color}; padding:3px 10px; cursor:pointer; font-size:12px;
      font-family:inherit;
      transition:background 0.12s;
    `;
    btn.addEventListener('mouseover',  () => { btn.style.background = color + '22'; });
    btn.addEventListener('mouseout', () => { btn.style.background = 'none'; });
    this._disposers.push(on(btn, 'click', (e) => { e.stopPropagation(); handler(); }));
    return btn;
  }

  // ---------------------------------------------------------------------------
  // DOM sync
  // ---------------------------------------------------------------------------

  _updateDOM() {
    const { x, y, w, h } = this._box;

    this._cropBox.style.left   = `${x}px`;
    this._cropBox.style.top    = `${y}px`;
    this._cropBox.style.width  = `${w}px`;
    this._cropBox.style.height = `${h}px`;

    // Scrim cutout via clip-path polygon (punches a transparent hole)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Outer rect → inner rectangle (counterclockwise) = hole
    this._scrim.style.clipPath = [
      `polygon(`,
      `0 0, ${vw}px 0, ${vw}px ${vh}px, 0 ${vh}px, 0 0,`,
      `${x}px ${y}px, ${x}px ${y + h}px, ${x + w}px ${y + h}px, ${x + w}px ${y}px, ${x}px ${y}px`,
      `)`,
    ].join('');

    // Info label: natural pixels
    if (this._img) {
      const nw = this._img.naturalWidth  || 0;
      const nh = this._img.naturalHeight || 0;
      const dispW = this._imgRect.width  || 1;
      const dispH = this._imgRect.height || 1;
      const scale = { x: nw / dispW, y: nh / dispH };
      const cx = clamp(x - this._imgRect.left, 0, dispW);
      const cy = clamp(y - this._imgRect.top,  0, dispH);
      const cw = clamp(w, 0, dispW - cx);
      const ch = clamp(h, 0, dispH - cy);
      this._infoEl.textContent = `${Math.round(cw * scale.x)} × ${Math.round(ch * scale.y)} px`;
    }

    // Position toolbar below crop box (or above if near bottom)
    const margin = 8;
    let tbTop = y + h + margin;
    if (tbTop + 40 > window.innerHeight - margin) tbTop = y - 40 - margin;
    this._toolbar.style.left = `${x}px`;
    this._toolbar.style.top  = `${tbTop}px`;
  }

  // ---------------------------------------------------------------------------
  // Drag: move box
  // ---------------------------------------------------------------------------

  _startBoxMove(e) {
    const startX = e.clientX - this._box.x;
    const startY = e.clientY - this._box.y;
    const r = this._imgRect;

    const onMove = (me) => {
      this._box.x = clamp(me.clientX - startX, r.left, r.right  - this._box.w);
      this._box.y = clamp(me.clientY - startY, r.top,  r.bottom - this._box.h);
      this._updateDOM();
    };

    this._attachDocDrag(onMove);
  }

  // ---------------------------------------------------------------------------
  // Drag: resize handle
  // ---------------------------------------------------------------------------

  _startHandleDrag(e, id) {
    const startX = e.clientX;
    const startY = e.clientY;
    const orig   = { ...this._box };
    const r      = this._imgRect;
    const lockAR = this._arCheck && this._arCheck.checked;
    const aspect = orig.w / (orig.h || 1);

    const onMove = (me) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      let { x, y, w, h } = orig;

      // Apply deltas per handle position
      if (id.includes('e'))  w = Math.max(MIN_SIZE, orig.w + dx);
      if (id.includes('s'))  h = Math.max(MIN_SIZE, orig.h + dy);
      if (id.includes('w')) { x = Math.min(orig.x + orig.w - MIN_SIZE, orig.x + dx); w = orig.x + orig.w - x; }
      if (id.includes('n')) { y = Math.min(orig.y + orig.h - MIN_SIZE, orig.y + dy); h = orig.y + orig.h - y; }

      // Aspect-ratio lock (corner handles)
      if (lockAR && id.length === 2) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          h = w / aspect;
          if (id.includes('n')) y = orig.y + orig.h - h;
        } else {
          w = h * aspect;
          if (id.includes('w')) x = orig.x + orig.w - w;
        }
      }

      // Clamp to image bounds
      x = clamp(x, r.left, r.right  - MIN_SIZE);
      y = clamp(y, r.top,  r.bottom - MIN_SIZE);
      w = clamp(w, MIN_SIZE, r.right  - x);
      h = clamp(h, MIN_SIZE, r.bottom - y);

      this._box = { x, y, w, h };
      this._updateDOM();
    };

    this._attachDocDrag(onMove);
  }

  /**
   * Attach mousemove + mouseup to document for the duration of a drag.
   * @param {(e: MouseEvent) => void} onMove
   */
  _attachDocDrag(onMove) {
    const cleanup = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   cleanup);
      document.body.style.userSelect = '';
      document.body.style.cursor     = '';
    };
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   cleanup, { once: true });
  }

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------

  _bindEsc() {
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); this._close(false); }
      if (e.key === 'Enter')  { e.preventDefault(); this._confirm(); }
    };
    document.addEventListener('keydown', handler);
    this._disposers.push(() => document.removeEventListener('keydown', handler));
  }

  // ---------------------------------------------------------------------------
  // Confirm / Close
  // ---------------------------------------------------------------------------

  async _confirm() {
    const img = this._img;
    if (!img) { this._close(false); return; }

    const r     = this._imgRect;
    const { x, y, w, h } = this._box;

    // Convert display-px crop region → natural-px
    const scaleX = (img.naturalWidth  || img.width || 1) / (r.width  || 1);
    const scaleY = (img.naturalHeight || img.height || 1) / (r.height || 1);

    const natX = Math.round(clamp(x - r.left, 0, r.width)  * scaleX);
    const natY = Math.round(clamp(y - r.top,  0, r.height) * scaleY);
    const natW = Math.round(clamp(w, 0, r.width  - (x - r.left)) * scaleX);
    const natH = Math.round(clamp(h, 0, r.height - (y - r.top))  * scaleY);

    if (natW <= 0 || natH <= 0) { this._close(false); return; }

    // Output dimensions = display-pixel crop size (preserve visual size)
    const outW = w;
    const outH = h;

    const naturalRect = { x: natX, y: natY, width: natW, height: natH };
    const canvas = await drawCropToCanvas(img, naturalRect, outW, outH);

    if (!canvas) {
      // Cross-origin failure — inform user and abort
      alert(
        'Cannot crop this image: the image server does not allow cross-origin access.\n' +
        'Upload the image directly to use the crop tool.',
      );
      this._close(false);
      return;
    }

    // Determine output format: preserve JPEG, fall back to PNG
    const fmt = img.src.match(/^data:image\/(jpe?g)/i) ? 'image/jpeg' : 'image/png';
    const quality = fmt === 'image/jpeg' ? 0.92 : undefined;
    const newSrc = canvas.toDataURL(fmt, quality);

    // Apply the crop
    this._close(false);

    img.src = newSrc;
    // Strip explicit width/height — the image should show at its new natural size
    img.style.width  = '';
    img.style.height = '';
    img.removeAttribute('width');
    img.removeAttribute('height');

    this.context.invoke('editor.afterCommand');
    this.context.invoke('imageResizer.updateOverlay');
  }

  /**
   * Remove all overlay DOM elements and reset state.
   * @param {boolean} _committed - reserved for future use
   */
  _close(_committed) {
    this._disposers.forEach((d) => d());
    this._disposers = [];

    [this._scrim, this._cropBox, this._toolbar].forEach((el) => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    this._scrim   = null;
    this._cropBox = null;
    this._toolbar = null;
    this._infoEl  = null;
    this._handles = {};
    this._img     = null;
    this._box     = null;
    this._imgRect = null;
    this._arCheck = null;
  }
}
