// TableTooltip.js - Hover tooltip for tables inside the editor
// Shows a horizontal action bar above (or below) the hovered table,
// similar in appearance and interaction to ImageTooltip / VideoTooltip.
import { createElement, on } from '../core/dom.js';

const SHOW_DELAY = 120;
const HIDE_DELAY = 200;

// ---------------------------------------------------------------------------
// Table helpers — visual column index (accounts for colspan)
// ---------------------------------------------------------------------------

/**
 * Returns the visual (logical) column index of a cell, taking colspan into
 * account for all preceding cells in the same row.
 * @param {HTMLTableCellElement} cell
 * @returns {number} 0-based visual column index, or -1 on failure
 */
function getVisualColIndex(cell) {
  const row = cell.closest('tr');
  if (!row) return -1;
  let visualIdx = 0;
  for (const c of row.cells) {
    if (c === cell) return visualIdx;
    visualIdx += c.colSpan || 1;
  }
  return -1;
}

/**
 * Finds the first cell in a row whose visual start column equals visualIdx.
 * Returns null if no exact match (e.g. the column is spanned by a merged cell).
 * @param {HTMLTableRowElement} row
 * @param {number} visualIdx
 * @returns {HTMLTableCellElement|null}
 */
function getCellAtVisualCol(row, visualIdx) {
  let vIdx = 0;
  for (const c of row.cells) {
    if (vIdx === visualIdx) return c;
    if (vIdx > visualIdx) break;
    vIdx += c.colSpan || 1;
  }
  return null;
}

/**
 * Finds the first cell whose visual range ends after visualIdx
 * (used for inserting a new column to the right of visualIdx).
 * @param {HTMLTableRowElement} row
 * @param {number} visualIdx
 * @returns {HTMLTableCellElement|null} reference cell for insertBefore, or null = append
 */
function getCellAfterVisualCol(row, visualIdx) {
  let vIdx = 0;
  for (const c of row.cells) {
    vIdx += c.colSpan || 1;
    if (vIdx > visualIdx) {
      // next cell after the one that starts at / spans visualIdx
      const next = c.nextElementSibling;
      return (next?.tagName === 'TD' || next?.tagName === 'TH') ? /** @type {HTMLTableCellElement} */ (next) : null;
    }
  }
  return null;
}

/**
 * Build a 2D grid map of the table, accounting for both rowspan and colspan.
 *
 * gridMap[r][c] = the DOM cell occupying visual grid position (r, c).
 * cellPos       = WeakMap: cell → { r, c, rs, cs }  (top-left grid origin + span).
 *
 * Uses HTMLTableElement.rows which is scoped to the table itself and never
 * includes rows from nested tables.
 *
 * @param {HTMLTableElement} table
 * @returns {{ gridMap: Object, cellPos: WeakMap }}
 */
function buildGridMap(table) {
  const rows = Array.from(table.rows);
  const gridMap = {};
  const cellPos = new WeakMap();
  rows.forEach((row, r) => {
    if (!gridMap[r]) gridMap[r] = {};
    let c = 0;
    for (const cell of row.cells) {
      // Skip positions already occupied by a rowspan from a previous row
      while (gridMap[r][c]) c++;
      const rs = cell.rowSpan || 1;
      const cs = cell.colSpan || 1;
      cellPos.set(cell, { r, c, rs, cs });
      for (let dr = 0; dr < rs; dr++) {
        if (!gridMap[r + dr]) gridMap[r + dr] = {};
        for (let dc = 0; dc < cs; dc++) {
          gridMap[r + dr][c + dc] = cell;
        }
      }
      c += cs;
    }
  });
  return { gridMap, cellPos };
}

const ICONS = {
  rowAbove:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3v7"/><path d="M9 7l3-4 3 4"/></svg>`,
  rowBelow:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 12v7"/><path d="M9 17l3 4 3-4"/></svg>`,
  deleteRow:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="21" y1="15" x2="15" y2="21"/></svg>`,
  colLeft:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 12h7"/><path d="M7 8l-4 4 4 4"/></svg>`,
  colRight:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M12 12h9"/><path d="M17 8l4 4-4 4"/></svg>`,
  deleteCol:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="15" y1="6" x2="21" y2="12"/><line x1="21" y1="6" x2="15" y2="12"/></svg>`,
  mergeCells:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="8" height="10" rx="1"/><rect x="14" y="7" width="8" height="10" rx="1"/><path d="M10 12h4"/><path d="M12 10l2 2-2 2"/></svg>`,
  unmergeCells: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="1"/><line x1="12" y1="5" x2="12" y2="19" stroke-dasharray="2.5 2"/><line x1="2" y1="12" x2="22" y2="12" stroke-dasharray="2.5 2"/><path d="M9 9 L6 12 L9 15"/><path d="M15 9 L18 12 L15 15"/></svg>`,
  colWidth:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="7" y1="12" x2="17" y2="12"/><path d="M10 9l-3 3 3 3"/><path d="M14 9l3 3-3 3"/></svg>`,
  rowHeight:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><line x1="12" y1="7" x2="12" y2="17"/><path d="M9 10l3-3 3 3"/><path d="M9 14l3 3 3-3"/></svg>`,
  tableBorder: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6" stroke-width="1"/><line x1="3" y1="13" x2="21" y2="13" stroke-width="2"/><line x1="3" y1="20" x2="21" y2="20" stroke-width="3"/></svg>`,
  deleteTable: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="16" y1="16" x2="22" y2="22" stroke="#ef4444"/><line x1="22" y1="16" x2="16" y2="22" stroke="#ef4444"/></svg>`,
  selectCells: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L4 20 L9 15 L12 21 L14 20 L11 14 L17 14 Z" fill="currentColor" opacity="0.15"/><path d="M4 4 L4 20 L9 15 L12 21 L14 20 L11 14 L17 14 Z"/></svg>`,
  cellShade:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 11L8.93 3.36a1 1 0 0 0-1.29.08L3.22 7.8a1 1 0 0 0-.07 1.29L11 20"/><path d="m5 14 5-5"/><path d="M22 22a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2c0-1.5 2.5-5 3.5-5s3.5 3.5 3.5 5z"/></svg>`,
};

const SHADE_PRESETS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#efefef', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#d9d2e9', '#ead1dc',
];

export class TableTooltip {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this._el = null;
    this._activeTable = null;
    this._activeCell = null;  // last hovered td/th
    this._showTimer = null;
    this._hideTimer = null;
    this._disposers = [];
    this._sizePopover = null;
    this._sizeApply = null;
    this._sizeTitleEl = null;
    this._sizeInputEl = null;
    // Cell shade popover
    this._shadePopover = null;
    this._shadeTitleEl = null;
    this._shadeColorStrip = null;
    // Cell selection
    this._selectMode = false;
    this._selectedCells = [];
    this._selectStart = null;
    this._selectDragging = false;
    this._selectBtn = null;
    this._editable = null;
  }

  initialize() {
    this._el = this._buildTooltip();
    document.body.appendChild(this._el);

    this._sizePopover = this._buildSizePopover();
    document.body.appendChild(this._sizePopover);

    this._shadePopover = this._buildCellShadePopover();
    document.body.appendChild(this._shadePopover);

    const editable = this.context.layoutInfo.editable;
    this._editable = editable;

    // ── Cell selection drag ──────────────────────────────────────────────────
    const onSelMousedown = (e) => {
      if (!this._selectMode) return;
      const cell = e.target.closest('td, th');
      if (!cell || !editable.contains(cell)) return;
      // Don't interfere with col/row resize (inline cursor is set by resize logic)
      if (cell.style.cursor === 'col-resize' || cell.style.cursor === 'row-resize') return;
      e.preventDefault(); // suppress text-cursor placement while selecting cells
      this._activeTable = cell.closest('table');
      this._selectStart = cell;
      this._selectDragging = true;
      this._setSelection([cell]);
    };
    const onSelMousemove = (e) => {
      if (!this._selectMode || !this._selectDragging || !this._selectStart) return;
      const cell = e.target.closest('td, th');
      if (!cell || !editable.contains(cell)) return;
      if (cell.closest('table') !== this._activeTable) return;
      this._setSelection(this._getRectCells(this._selectStart, cell));
    };
    const onSelMouseup = () => { this._selectDragging = false; };

    this._disposers.push(
      on(editable, 'mousedown', onSelMousedown),
      on(editable, 'mousemove', onSelMousemove),
      on(document, 'mouseup',   onSelMouseup),
    );
    // ────────────────────────────────────────────────────────────────────────

    this._disposers.push(
      on(editable, 'mouseover', (e) => {
        if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
        const table = /** @type {Element} */ (e.target)?.closest('table');
        if (table && editable.contains(table)) {
          const cell = /** @type {Element} */ (e.target)?.closest('td, th');
          if (cell) {
            this._activeCell = cell;
            this._syncShadeStrip();
          }
          this._scheduleShow(table);
        }
      }, { passive: true }),
      on(editable, 'mouseout', (e) => {
        if (this._selectMode) return; // keep tooltip alive during cell selection
        const to = /** @type {Node|null} */ (/** @type {MouseEvent} */ (e).relatedTarget);
        if (!to || (
          !editable.contains(to) &&
          !this._el.contains(to) &&
          !this._sizePopover?.contains(to)
        )) {
          this._scheduleHide();
        }
      }, { passive: true }),
      on(document, 'click', (e) => {
        const et = /** @type {Node} */ (e.target);
        if (this._selectMode && this._activeTable?.contains(et)) return;
        if (this._activeTable &&
          !this._activeTable.contains(et) &&
          !this._el.contains(et) &&
          !this._sizePopover?.contains(et)) {
          this._hide();
        }
      }),
      // Sync shade strip whenever selection moves to a different cell
      on(document, 'selectionchange', () => this._syncShadeStrip()),
      // Hide when the page scrolls or resizes — the tooltip position becomes stale
      on(globalThis, 'scroll',  () => this._hide(), { passive: true }),
      on(globalThis, 'resize',  () => this._hide(), { passive: true }),
    );

    this._initResize();
    return this;
  }

  // ---------------------------------------------------------------------------
  // Column & row drag-resize
  // ---------------------------------------------------------------------------

  _initResize() {
    const editable = this.context.layoutInfo.editable;
    const HIT = 6; // px proximity threshold

    // Shared hover state
    let _nearCell = null;
    let _nearEdge = null; // 'col' | 'row' | null

    // Active drag state
    let _resizing = false;
    let _edge     = null; // 'col' | 'row'
    let _startX   = 0;
    let _startY   = 0;
    let _startW   = 0;
    let _startH   = 0;
    let _colIdx   = -1;
    let _colCells = null; // cells cached at drag-start — avoids querySelectorAll every frame
    let _row      = null;
    let _table    = null;
    let _rafDocMove    = null; // pending rAF handle for resize drag
    let _rafEditorMove = null; // pending rAF handle for cursor detection

    const clearHover = () => {
      if (_nearCell) { _nearCell.style.cursor = ''; _nearCell = null; }
      _nearEdge = null;
    };

    const onEditorMove = (e) => {
      if (_resizing) return;
      if (this.context.layoutInfo.container.classList.contains('an-disabled')) {
        clearHover();
        return;
      }
      // Throttle to one check per animation frame — getBoundingClientRect forces reflow
      if (_rafEditorMove !== null) return;
      const target  = e.target;
      const clientX = e.clientX;
      const clientY = e.clientY;
      _rafEditorMove = requestAnimationFrame(() => {
        _rafEditorMove = null;
        const cell = target.closest('td, th');
        if (!cell || !editable.contains(cell)) { clearHover(); return; }
        if (_nearCell && _nearCell !== cell) _nearCell.style.cursor = '';
        const rect     = cell.getBoundingClientRect();
        const onRight  = Math.abs(clientX - rect.right)  < HIT;
        const onBottom = Math.abs(clientY - rect.bottom) < HIT;
        if (onRight) {
          cell.style.cursor = 'col-resize';
          _nearCell = cell; _nearEdge = 'col';
        } else if (onBottom) {
          cell.style.cursor = 'row-resize';
          _nearCell = cell; _nearEdge = 'row';
        } else {
          clearHover();
        }
      });
    };

    const onEditorDown = (e) => {
      if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
      if (!_nearCell || !_nearEdge) return;
      _resizing = true;
      _edge     = _nearEdge;
      _startX   = e.clientX;
      _startY   = e.clientY;
      _table    = _nearCell.closest('table');
      if (_edge === 'col') {
        _startW   = _nearCell.offsetWidth;
        _colIdx   = getVisualColIndex(_nearCell);
        // Cache column cells once so onDocMove never runs querySelectorAll per frame.
        // F-1: skip merged cells (colSpan > 1) — setting width on a merged cell
        // distributes it equally across all spanned columns instead of resizing
        // only the target column.  Rows that have an individual cell at this
        // visual column index are resized independently as expected.
        _colCells = _colIdx >= 0
          ? Array.from(_table.querySelectorAll('tr'))
              .map(r => getCellAtVisualCol(r, _colIdx))
              .filter(Boolean)
              .filter(c => (c.colSpan || 1) === 1)
          : [];
        document.body.style.cursor = 'col-resize';
      } else {
        _row    = _nearCell.closest('tr');
        _startH = _row ? _row.offsetHeight : 40;
        document.body.style.cursor = 'row-resize';
      }
      document.body.style.userSelect = 'none';
      e.preventDefault();
      e.stopPropagation();
    };

    const onDocMove = (e) => {
      if (!_resizing) return;
      // Skip if a frame is already scheduled — avoids per-pixel style thrashing
      if (_rafDocMove !== null) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      _rafDocMove = requestAnimationFrame(() => {
        _rafDocMove = null;
        if (_edge === 'col') {
          const newW = Math.max(30, _startW + (clientX - _startX));
          for (const c of _colCells) {
            c.style.width    = `${newW}px`;
            c.style.minWidth = `${newW}px`;
          }
        } else {
          const newH = Math.max(20, _startH + (clientY - _startY));
          if (_row) {
            for (const c of _row.cells) {
              c.style.height    = `${newH}px`;
              c.style.minHeight = `${newH}px`;
            }
          }
        }
      });
    };

    const onDocUp = () => {
      if (!_resizing) return;
      // Cancel any in-flight rAF so stale writes don't land after mouseup
      if (_rafDocMove !== null) { cancelAnimationFrame(_rafDocMove); _rafDocMove = null; }
      _resizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor     = '';
      _edge     = null;
      _table    = null;
      _row      = null;
      _colIdx   = -1;
      _colCells = null;
      this.context.invoke('editor.afterCommand');
    };

    this._disposers.push(
      on(editable, 'mousemove', onEditorMove),
      on(editable, 'mousedown', onEditorDown),
      on(document, 'mousemove', onDocMove),
      on(document, 'mouseup',   onDocUp),
    );
  }

  destroy() {
    this._clearTimers();
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._el?.parentNode) this._el.remove();
    this._el = null;
    if (this._sizePopover?.parentNode) {
      this._sizePopover.remove();
    }
    this._sizePopover = null;
    if (this._shadePopover?.parentNode) {
      this._shadePopover.remove();
    }
    this._shadePopover = null;
  }

  // ---------------------------------------------------------------------------
  // Build tooltip bar
  // ---------------------------------------------------------------------------

  _buildTooltip() {
    const L = this.context.locale.tooltips.table;
    const el = createElement('div', {
      class: 'an-link-tooltip an-table-tooltip',
      role: 'toolbar',
      'aria-label': L.ariaLabel,
    });
    el.style.display = 'none';

    // Label
    this._label = createElement('span', { class: 'an-link-tooltip-url' });
    this._label.textContent = L.label;
    el.appendChild(this._label);

    el.appendChild(this._sep());

    // Select-cells toggle
    this._selectBtn = this._makeBtn(ICONS.selectCells, L.selectCells, () => this._toggleSelectMode());
    el.appendChild(this._selectBtn);

    el.appendChild(this._sep());

    // Row operations
    el.appendChild(this._makeBtn(ICONS.rowAbove, L.addRowAbove, () => this._addRow('above')));
    el.appendChild(this._makeBtn(ICONS.rowBelow, L.addRowBelow, () => this._addRow('below')));
    el.appendChild(this._makeBtn(ICONS.deleteRow, L.deleteRow,  () => this._deleteRow()));

    el.appendChild(this._sep());

    // Column operations
    el.appendChild(this._makeBtn(ICONS.colLeft,   L.addColumnLeft,   () => this._addColumn('left')));
    el.appendChild(this._makeBtn(ICONS.colRight,  L.addColumnRight,  () => this._addColumn('right')));
    el.appendChild(this._makeBtn(ICONS.deleteCol, L.deleteColumn,    () => this._deleteColumn()));

    el.appendChild(this._sep());

    // Merge cells
    el.appendChild(this._makeBtn(ICONS.mergeCells,   L.mergeCells,   () => this._mergeCells()));
    el.appendChild(this._makeBtn(ICONS.unmergeCells, L.unmergeCells, () => this._unmergeCells()));

    el.appendChild(this._sep());

    // Cell background shading — uses color-strip variant like foreColor/hiliteColor buttons
    const shadeBtn = createElement('button', {
      type: 'button',
      class: 'an-link-tooltip-btn an-link-tooltip-btn--shade',
      title: L.cellBackground,
    });
    const shadeSvgWrap = createElement('span', { class: 'an-bubble-btn-svg' });
    shadeSvgWrap.innerHTML = ICONS.cellShade;
    const shadeStrip = createElement('span', { class: 'an-link-tooltip-color-strip' });
    shadeBtn.appendChild(shadeSvgWrap);
    shadeBtn.appendChild(shadeStrip);
    this._shadeColorStrip = shadeStrip;
    this._disposers.push(on(shadeBtn, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._openCellShadePopover();
    }));
    el.appendChild(shadeBtn);

    el.appendChild(this._sep());

    // Resize
    el.appendChild(this._makeBtn(ICONS.colWidth,   L.columnWidth,      () => this._openSizePopover('col')));
    el.appendChild(this._makeBtn(ICONS.rowHeight,  L.rowHeight,        () => this._openSizePopover('row')));
    el.appendChild(this._makeBtn(ICONS.tableBorder,L.tableBorderWidth, () => this._openSizePopover('border')));

    el.appendChild(this._sep());

    // Delete table (danger)
    el.appendChild(this._makeBtn(ICONS.deleteTable, L.deleteTable, () => this._deleteTable(), true));

    // Keep tooltip alive while hovering.
    // Don't schedule hide on mouseleave when the size popover is open —
    // the user is moving the mouse toward it.
    this._disposers.push(
      on(el, 'mouseenter', () => this._clearTimers()),
      on(el, 'mouseleave', () => {
        if (this._selectMode) return; // keep tooltip alive during cell selection
        if (this._sizePopover  && this._sizePopover.style.display  !== 'none') return;
        if (this._shadePopover && this._shadePopover.style.display !== 'none') return;
        this._scheduleHide();
      }),
    );

    return el;
  }

  _sep() {
    return createElement('div', { class: 'an-link-tooltip-sep' });
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
      class: isDanger
        ? 'an-link-tooltip-btn an-link-tooltip-btn--danger'
        : 'an-link-tooltip-btn',
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

  _scheduleShow(table) {
    if (this._activeTable === table && this._el.style.display !== 'none') return;
    clearTimeout(this._hideTimer);
    this._hideTimer = null;
    clearTimeout(this._showTimer);
    this._showTimer = setTimeout(() => {
      this._activeTable = table;
      this._show();
    }, SHOW_DELAY);
  }

  _scheduleHide() {
    clearTimeout(this._showTimer);
    this._showTimer = null;
    if (this._hideTimer) return;
    this._hideTimer = setTimeout(() => this._hide(), HIDE_DELAY);
  }

  _show() {
    if (!this._activeTable) return;
    this._el.style.display = 'flex';
    this._syncShadeStrip();
    // Defer: offsetWidth on a newly-visible element forces layout synchronously
    requestAnimationFrame(() => {
      if (this._activeTable) this._positionNear(this._activeTable);
    });
  }

  _syncShadeStrip() {
    if (!this._shadeColorStrip || !this._el || this._el.style.display === 'none') return;
    const cell = this._getCell();
    this._shadeColorStrip.style.background = cell?.style.backgroundColor || 'transparent';
  }

  _hide() {
    this._el.style.display = 'none';
    this._activeTable = null;
    this._activeCell = null;
    // Reset select mode
    if (this._selectMode) {
      this._selectMode = false;
      if (this._selectBtn) this._selectBtn.classList.remove('an-link-tooltip-btn--active');
      if (this._editable) this._editable.classList.remove('an-table-select-mode');
    }
    this._clearSelection();
    this._clearTimers();
    this._hideSizePopover();
  }

  _clearTimers() {
    clearTimeout(this._showTimer);
    clearTimeout(this._hideTimer);
    this._showTimer = null;
    this._hideTimer = null;
  }

  _positionNear(table) {
    if (!table) return;
    const rect   = table.getBoundingClientRect();
    const tipW   = this._el.offsetWidth  || 400;
    const tipH   = this._el.offsetHeight || 30;
    const margin = 6;

    // Center horizontally over the table; prefer above it
    let left = rect.left + (rect.width - tipW) / 2;
    let top  = rect.top - tipH - margin;

    if (top  < margin)                           top  = rect.bottom + margin;
    if (left + tipW > globalThis.innerWidth - margin) left = globalThis.innerWidth - tipW - margin;
    if (left < margin)                            left = margin;

    this._el.style.left = `${left}px`;
    this._el.style.top  = `${top}px`;
  }

  // ---------------------------------------------------------------------------
  // Helper: get active cell (fallback to first td/th in table)
  // ---------------------------------------------------------------------------

  _getCell() {
    // Prefer the cell under the current text cursor (most intuitive for operations)
    const sel = globalThis.getSelection();
    if (sel?.rangeCount) {
      let container = sel.getRangeAt(0).commonAncestorContainer;
      if (container.nodeType === 3) container = container.parentElement;
      const cellFromSel = /** @type {Element} */ (container)?.closest('td, th');
      if (cellFromSel && this._activeTable?.contains(cellFromSel)) {
        return cellFromSel;
      }
    }
    return this._activeCell
      || this._activeTable?.querySelector('td, th');
  }

  // ---------------------------------------------------------------------------
  // Cell selection helpers
  // ---------------------------------------------------------------------------

  _toggleSelectMode() {
    this._selectMode = !this._selectMode;
    if (this._selectBtn) {
      this._selectBtn.classList.toggle('an-link-tooltip-btn--active', this._selectMode);
    }
    if (this._editable) {
      this._editable.classList.toggle('an-table-select-mode', this._selectMode);
    }
    if (!this._selectMode) {
      this._clearSelection();
    }
  }

  _clearSelection() {
    this._selectedCells.forEach((c) => c.classList.remove('an-cell-selected'));
    this._selectedCells = [];
    this._selectStart = null;
  }

  _setSelection(cells) {
    // Remove highlight from cells no longer in selection
    this._selectedCells.forEach((c) => {
      if (!cells.includes(c)) c.classList.remove('an-cell-selected');
    });
    this._selectedCells = cells;
    cells.forEach((c) => c.classList.add('an-cell-selected'));
  }

  /**
   * Returns all cells in the rectangular area between startCell and endCell,
   * correctly handling rowspan/colspan by using the grid map.
   * The rect is expanded iteratively until it is stable — this ensures any
   * merged cell that starts outside the initial rect but spans into it is
   * fully included.
   */
  _getRectCells(startCell, endCell) {
    if (!startCell) return [];
    if (!endCell || startCell === endCell) return [startCell];
    const table = startCell.closest('table');
    if (!table?.contains(endCell)) return [startCell];

    const { gridMap, cellPos } = buildGridMap(table);
    const sp = cellPos.get(startCell);
    const ep = cellPos.get(endCell);
    if (!sp || !ep) return [startCell];

    let minR = Math.min(sp.r, ep.r);
    let maxR = Math.max(sp.r + sp.rs - 1, ep.r + ep.rs - 1);
    let minC = Math.min(sp.c, ep.c);
    let maxC = Math.max(sp.c + sp.cs - 1, ep.c + ep.cs - 1);

    // Iteratively expand until stable — handles spans that exceed the current rect
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = minR; r <= maxR; r++) {
        const rowMap = gridMap[r];
        if (!rowMap) continue;
        for (let c = minC; c <= maxC; c++) {
          const cell = rowMap[c];
          if (!cell) continue;
          const pos = cellPos.get(cell);
          if (!pos) continue;
          if (pos.r < minR)              { minR = pos.r;               changed = true; }
          if (pos.r + pos.rs - 1 > maxR) { maxR = pos.r + pos.rs - 1; changed = true; }
          if (pos.c < minC)              { minC = pos.c;               changed = true; }
          if (pos.c + pos.cs - 1 > maxC) { maxC = pos.c + pos.cs - 1; changed = true; }
        }
      }
    }

    // Collect unique cells in document order
    const seen = new Set();
    const result = [];
    for (let r = minR; r <= maxR; r++) {
      const rowMap = gridMap[r];
      if (!rowMap) continue;
      for (let c = minC; c <= maxC; c++) {
        const cell = rowMap[c];
        if (cell && !seen.has(cell)) {
          seen.add(cell);
          result.push(cell);
        }
      }
    }
    return result.length > 0 ? result : [startCell];
  }

  /**
   * Returns the active cell set: user-selected cells when available,
   * otherwise the single active/cursor cell.
   * @returns {HTMLTableCellElement[]}
   */
  _getSelectedCells() {
    return this._selectedCells.length > 0
      ? this._selectedCells
      : [this._getCell()].filter(Boolean);
  }

  // ---------------------------------------------------------------------------
  // Table operations
  // ---------------------------------------------------------------------------

  _addRow(position) {
    const cells = this._getSelectedCells();
    if (!cells.length) return;
    const table = cells[0].closest('table');
    if (!table) return;
    const allRows = Array.from(table.querySelectorAll('tr'));
    const selectedRows = [...new Set(cells.map((c) => c.closest('tr')).filter(Boolean))];
    // Reference row: topmost for 'above', bottommost for 'below'
    const refRow = selectedRows.reduce((best, r) => {
      const bi = allRows.indexOf(best);
      const ri = allRows.indexOf(r);
      return position === 'above' ? (ri < bi ? r : best) : (ri > bi ? r : best);
    }, selectedRows[0]);
    const colCount = Array.from(refRow.cells).reduce((sum, c) => sum + (c.colSpan || 1), 0);
    const newRow = document.createElement('tr');
    const refCells = Array.from(refRow.cells);
    for (let i = 0; i < colCount; i++) {
      const td = createElement('td', {}, ['\u00a0']);
      const ref = refCells[i];
      if (ref?.style.width)    td.style.width    = ref.style.width;
      if (ref?.style.minWidth) td.style.minWidth = ref.style.minWidth;
      newRow.appendChild(td);
    }
    if (position === 'above') refRow.parentElement?.insertBefore(newRow, refRow);
    else refRow.insertAdjacentElement('afterend', newRow);
    requestAnimationFrame(() => this._positionNear(this._activeTable));
    this.context.invoke('editor.afterCommand');
  }

  _addColumn(position) {
    const cells = this._getSelectedCells();
    if (!cells.length) return;
    const table = cells[0].closest('table');
    if (!table) return;
    const colIndices = cells.map((c) => getVisualColIndex(c));
    const targetColIdx = position === 'left' ? Math.min(...colIndices) : Math.max(...colIndices);
    const rows = Array.from(table.querySelectorAll('tr'));
    const refs      = rows.map((r) => position === 'left'
      ? getCellAtVisualCol(r, targetColIdx)
      : getCellAfterVisualCol(r, targetColIdx));
    const isHeaders = rows.map((r) => r.closest('thead') !== null);
    rows.forEach((r, i) => {
      r.insertBefore(createElement(isHeaders[i] ? 'th' : 'td', {}, ['\u00a0']), refs[i]);
    });
    requestAnimationFrame(() => this._positionNear(this._activeTable));
    this.context.invoke('editor.afterCommand');
  }

  _deleteRow() {
    const cells = this._getSelectedCells();
    if (!cells.length) return;
    const table = cells[0].closest('table');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    const totalBodyRows = tbody
      ? tbody.querySelectorAll('tr').length
      : table.querySelectorAll('tr').length;
    const selectedRows = [...new Set(cells.map((c) => c.closest('tr')).filter(Boolean))];
    const bodyRowsToDelete = selectedRows.filter((r) => r.closest('tbody'));
    // Guard: keep at least one body row
    if (bodyRowsToDelete.length >= totalBodyRows) return;
    this._activeCell = null;
    this._clearSelection();
    selectedRows.forEach((r) => r.remove());
    requestAnimationFrame(() => this._positionNear(this._activeTable));
    this.context.invoke('editor.afterCommand');
  }

  _deleteColumn() {
    const cells = this._getSelectedCells();
    if (!cells.length) return;
    const table = cells[0].closest('table');
    if (!table) return;
    const tableRows = Array.from(table.querySelectorAll('tr'));
    if (tableRows[0] && tableRows[0].cells.length <= 1) return; // guard: keep ≥1 col
    const colIndices = [...new Set(cells.map((c) => getVisualColIndex(c)))];
    if (colIndices.length >= (tableRows[0]?.cells.length ?? 1)) return;
    // Collect all cell references upfront before any removal (avoids stale visual indices)
    const cellsToDelete = [];
    colIndices.forEach((colIdx) => {
      tableRows.forEach((r) => {
        const c = getCellAtVisualCol(r, colIdx);
        if (c) cellsToDelete.push(c);
      });
    });
    this._activeCell = null;
    this._clearSelection();
    cellsToDelete.forEach((c) => c.remove());
    requestAnimationFrame(() => this._positionNear(this._activeTable));
    this.context.invoke('editor.afterCommand');
  }

  _mergeCells() {
    const cell = this._getCell();
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;

    // Prefer user panel-selected cells; fall back to text-selection range
    let selected = this._getSelectedCells().filter((c) => table.contains(c));
    if (selected.length < 2) {
      const sel = globalThis.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const allCells = Array.from(table.querySelectorAll('td, th'));
      selected = allCells.filter((c) => {
        try { return range.intersectsNode(c); } catch { return false; }
      });
      if (selected.length < 2) return;
    }

    const { gridMap, cellPos } = buildGridMap(table);

    // Bounding rect that encompasses every selected cell's full span
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    selected.forEach((c) => {
      const pos = cellPos.get(c);
      if (!pos) return;
      if (pos.r < minR)              minR = pos.r;
      if (pos.r + pos.rs - 1 > maxR) maxR = pos.r + pos.rs - 1;
      if (pos.c < minC)              minC = pos.c;
      if (pos.c + pos.cs - 1 > maxC) maxC = pos.c + pos.cs - 1;
    });
    if (minR === Infinity) return;

    // Collect every unique cell in the bounding rect
    const seen = new Set();
    const rectCells = [];
    for (let r = minR; r <= maxR; r++) {
      const rowMap = gridMap[r];
      if (!rowMap) continue;
      for (let c = minC; c <= maxC; c++) {
        const tc = rowMap[c];
        if (tc && !seen.has(tc)) { seen.add(tc); rectCells.push(tc); }
      }
    }
    if (rectCells.length < 2) return;

    const first = rectCells[0];
    first.colSpan = maxC - minC + 1;
    first.rowSpan = maxR - minR + 1;
    first.style.verticalAlign = 'middle';
    first.innerHTML = rectCells.map((c) => c.innerHTML).join('');
    rectCells.slice(1).forEach((c) => c.remove());

    this._clearSelection();
    this.context.invoke('editor.afterCommand');
  }

  _deleteTable() {
    const table = this._activeTable;
    if (!table) return;
    this._hide();
    if (table.parentNode) table.remove();
    this.context.invoke('editor.afterCommand');
  }

  _unmergeCells() {
    const cells = this._getSelectedCells();
    if (!cells.length) return;
    const table = cells[0].closest('table');
    if (!table) return;
    const mergedCells = cells.filter(
      (c) => table.contains(c) && ((c.colSpan || 1) > 1 || (c.rowSpan || 1) > 1)
    );
    if (!mergedCells.length) return;
    mergedCells.forEach((cell) => {
      if (table.contains(cell)) this._unmergeOne(cell, table);
    });
    this._clearSelection();
    requestAnimationFrame(() => this._positionNear(this._activeTable));
    this.context.invoke('editor.afterCommand');
  }

  /**
   * Split a single merged cell (colspan/rowspan > 1) back into individual cells.
   * New cells are empty (&nbsp;); the original cell retains its content.
   * @param {HTMLTableCellElement} cell
   * @param {HTMLTableElement} table
   */
  _unmergeOne(cell, table) {
    const cs = cell.colSpan || 1;
    const rs = cell.rowSpan || 1;
    if (cs === 1 && rs === 1) return;

    // Build grid map from current DOM state (before any mutation)
    const { cellPos } = buildGridMap(table);
    const pos = cellPos.get(cell);
    if (!pos) return;

    const { r, c } = pos;
    const tableRows = Array.from(table.rows);
    const tag = cell.tagName.toLowerCase(); // preserve td / th

    // Reset the original cell
    cell.rowSpan = 1;
    cell.colSpan = 1;
    cell.style.verticalAlign = '';

    // Same row: insert (cs - 1) sibling cells after the original cell
    if (cs > 1) {
      const insertRef = cell.nextElementSibling;
      for (let dc = 1; dc < cs; dc++) {
        tableRows[r].insertBefore(createElement(tag, {}, ['\u00a0']), insertRef);
      }
    }

    // Rows below: insert cs cells at the correct visual column position (for rowspan)
    for (let dr = 1; dr < rs; dr++) {
      const targetRow = tableRows[r + dr];
      if (!targetRow) continue;
      // Find the first cell in this row whose visual-col origin is beyond c
      // (using cellPos built before mutations — valid for these untouched rows)
      let ref = null;
      for (const tc of targetRow.cells) {
        const tp = cellPos.get(tc);
        if (tp && tp.c > c) { ref = tc; break; }
      }
      for (let dc = 0; dc < cs; dc++) {
        targetRow.insertBefore(createElement(tag, {}, ['\u00a0']), ref);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Size popover (column width / row height)
  // ---------------------------------------------------------------------------

  _buildSizePopover() {
    const popover = createElement('div', { class: 'an-size-popover' });
    popover.style.display = 'none';

    const titleEl = createElement('div', { class: 'an-size-popover-title' });
    const body    = createElement('div', { class: 'an-size-popover-body' });
    const inputEl = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'number', class: 'an-size-input', min: '1', max: '2000', step: '1',
    }));
    const unitEl = createElement('span', { class: 'an-size-unit' }, ['px']);
    body.appendChild(inputEl);
    body.appendChild(unitEl);

    const actionsEl  = createElement('div', { class: 'an-size-popover-actions' });
    const cancelBtn  = createElement('button', { type: 'button', class: 'an-btn' });
    cancelBtn.textContent = this.context.locale.tooltips.table.cancelBtn;
    const applyBtn   = createElement('button', { type: 'button', class: 'an-btn an-btn-primary' });
    applyBtn.textContent = this.context.locale.tooltips.table.applyBtn;
    actionsEl.appendChild(cancelBtn);
    actionsEl.appendChild(applyBtn);

    popover.appendChild(titleEl);
    popover.appendChild(body);
    popover.appendChild(actionsEl);

    this._sizeTitleEl = titleEl;
    this._sizeInputEl = inputEl;
    this._sizeApply   = null;

    const d1 = on(applyBtn, 'click', () => {
      const val = Number.parseInt(this._sizeInputEl.value, 10);
      if (val > 0 && typeof this._sizeApply === 'function') this._sizeApply(val);
      this._hideSizePopover();
    });
    const d2 = on(cancelBtn, 'click', () => this._hideSizePopover());
    const d3 = on(inputEl, 'keydown', (e) => {
      const ke = /** @type {KeyboardEvent} */ (e);
      if (ke.key === 'Enter')  { e.preventDefault(); applyBtn.click(); }
      if (ke.key === 'Escape') this._hideSizePopover();
    });
    const d4 = on(document, 'click', (e) => {
      const et = /** @type {Node} */ (e.target);
      if (this._sizePopover &&
          this._sizePopover.style.display !== 'none' &&
          !this._sizePopover.contains(et) &&
          !this._el.contains(et)) {
        this._hideSizePopover();
      }
    });
    // Keep the tooltip/popover alive while the mouse is over the popover.
    const d5 = on(popover, 'mouseenter', () => this._clearTimers());
    const d6 = on(popover, 'mouseleave', () => this._scheduleHide());
    this._disposers.push(d1, d2, d3, d4, d5, d6);
    return popover;
  }

  _openSizePopover(type) {
    const cell = this._getCell();
    if (!cell || !this._sizePopover) return;

    if (type === 'border') {
      const table = cell.closest('table');
      if (!table) return;
      const firstCell = table.querySelector('td, th');
      const currentPx = firstCell
        ? (Number.parseInt(firstCell.style.borderWidth, 10) ||
           Number.parseInt(globalThis.getComputedStyle(firstCell).borderWidth, 10) || 1)
        : 1;
      this._sizeTitleEl.textContent = this.context.locale.tooltips.table.tableBorderWidthPx;
      this._sizeInputEl.min   = '0';
      this._sizeInputEl.max   = '10';
      this._sizeInputEl.value = String(currentPx);
      this._sizeApply = (val) => {
        const cells = Array.from(table.querySelectorAll('td, th'));
        if (val === 0) {
          cells.forEach((c) => { c.style.borderWidth = '0'; c.style.borderStyle = 'none'; });
        } else {
          cells.forEach((c) => { c.style.borderWidth = `${val}px`; c.style.borderStyle = 'solid'; });
        }
        this.context.invoke('editor.afterCommand');
      };
    } else {
      const isCol = type === 'col';
      const activeCells = this._getSelectedCells().filter((c) => {
        const t = c.closest('table');
        return t && t === cell.closest('table');
      });
      this._sizeTitleEl.textContent = isCol
        ? this.context.locale.tooltips.table.columnWidthPx
        : this.context.locale.tooltips.table.rowHeightPx;
      this._sizeInputEl.min   = '1';
      this._sizeInputEl.max   = '2000';
      this._sizeInputEl.value = isCol
        ? (cell.offsetWidth || 120)
        : (cell.closest('tr') ? (cell.closest('tr').offsetHeight || 40) : 40);
      this._sizeApply = (val) => {
        const table = cell.closest('table');
        if (!table) return;
        if (isCol) {
          // Apply to all selected columns (or just the current column)
          const colIndices = [...new Set(activeCells.map((c) => getVisualColIndex(c)))];
          const tableRows  = Array.from(table.querySelectorAll('tr'));
          colIndices.forEach((colIdx) => {
            tableRows.forEach((r) => {
              const c = getCellAtVisualCol(r, colIdx);
              // F-1: skip merged cells — same reason as drag-resize _colCells.
              if (c && (c.colSpan || 1) === 1) { c.style.width = `${val}px`; c.style.minWidth = `${val}px`; }
            });
          });
        } else {
          // Apply to all selected rows (or just the current row)
          const selectedRows = [...new Set(activeCells.map((c) => c.closest('tr')).filter(Boolean))];
          selectedRows.forEach((row) => {
            for (const c of row.cells) { c.style.height = `${val}px`; c.style.minHeight = `${val}px`; }
          });
        }
        this.context.invoke('editor.afterCommand');
      };
    }

    this._sizePopover.style.display = 'block';
    requestAnimationFrame(() => {
      if (!this._sizePopover || !this._el) return;
      const tipRect = this._el.getBoundingClientRect();
      const pw = this._sizePopover.offsetWidth  || 220;
      const ph = this._sizePopover.offsetHeight || 110;
      let left = tipRect.left;
      let top  = tipRect.bottom + 6;
      if (left + pw > globalThis.innerWidth  - 8) left = globalThis.innerWidth  - pw - 8;
      if (top  + ph > globalThis.innerHeight - 8) top  = tipRect.top - ph - 6;
      this._sizePopover.style.left = `${left}px`;
      this._sizePopover.style.top  = `${top}px`;
      if (this._sizeInputEl) { this._sizeInputEl.focus(); this._sizeInputEl.select(); }
    });
  }

  _hideSizePopover() {
    if (this._sizePopover) this._sizePopover.style.display = 'none';
    this._sizeApply = null;
  }

  // ---------------------------------------------------------------------------
  // Cell background shade popover
  // ---------------------------------------------------------------------------

  _buildCellShadePopover() {
    const pop = createElement('div', { class: 'an-cell-shade-popover' });
    pop.style.display = 'none';

    const title = createElement('div', { class: 'an-size-popover-title' });
    pop.appendChild(title);
    this._shadeTitleEl = title;

    // 24-color palette — reuse existing CSS classes
    const palette = createElement('div', { class: 'an-context-color-palette' });
    SHADE_PRESETS.forEach((color) => {
      const sw = createElement('div', { class: 'an-context-color-swatch', title: color });
      sw.style.background = color;
      this._disposers.push(on(sw, 'click', (e) => {
        e.stopPropagation();
        this._applyCellShade(color);
      }));
      palette.appendChild(sw);
    });
    pop.appendChild(palette);

    // "No shading" row — clears background color
    const noShadeRow = createElement('div', { class: 'an-context-color-custom' });
    const noShadeBtn = createElement('button', { type: 'button', class: 'an-shade-no-color' });
    this._disposers.push(on(noShadeBtn, 'click', () => this._applyCellShade('')));
    noShadeRow.appendChild(noShadeBtn);
    pop.appendChild(noShadeRow);
    this._shadeNoBtn = noShadeBtn;

    // Custom color input
    const customRow = createElement('div', { class: 'an-context-color-custom' });
    const colorInput = /** @type {HTMLInputElement} */ (createElement('input', { type: 'color', class: 'an-shade-color-input', value: '#ffffff' }));
    const customLabel = createElement('span');
    customLabel.textContent = 'Custom…';
    this._disposers.push(on(colorInput, 'change', () => this._applyCellShade(colorInput.value)));
    customRow.appendChild(colorInput);
    customRow.appendChild(customLabel);
    pop.appendChild(customRow);

    // Prevent mousedown from collapsing editor selection; keep tooltip alive while hovering
    this._disposers.push(
      on(pop, 'mousedown', (e) => e.preventDefault()),
      on(pop, 'mouseenter', () => this._clearTimers()),
      on(pop, 'mouseleave', () => this._scheduleHide()),
    );

    // Close on outside click
    this._disposers.push(on(document, 'click', (e) => {
      const et = /** @type {Node} */ (e.target);
      if (this._shadePopover &&
          this._shadePopover.style.display !== 'none' &&
          !this._shadePopover.contains(et) &&
          !this._el?.contains(et)) {
        this._hideCellShadePopover();
      }
    }));

    return pop;
  }

  _openCellShadePopover() {
    if (!this._shadePopover) return;
    const L = this.context.locale.tooltips.table;
    if (this._shadeTitleEl) this._shadeTitleEl.textContent = L.cellBackground;
    if (this._shadeNoBtn)   this._shadeNoBtn.textContent  = L.noShading;

    this._shadePopover.style.display = 'block';
    requestAnimationFrame(() => {
      if (!this._shadePopover || !this._el) return;
      const pw = this._shadePopover.offsetWidth  || 170;
      const ph = this._shadePopover.offsetHeight || 120;
      const tipRect = this._el.getBoundingClientRect();
      let left = tipRect.left;
      let top  = tipRect.bottom + 6;
      if (left + pw > globalThis.innerWidth  - 8) left = globalThis.innerWidth  - pw - 8;
      if (top  + ph > globalThis.innerHeight - 8) top  = tipRect.top - ph - 6;
      this._shadePopover.style.left = `${Math.max(8, left)}px`;
      this._shadePopover.style.top  = `${Math.max(8, top)}px`;
    });
  }

  _hideCellShadePopover() {
    if (this._shadePopover) this._shadePopover.style.display = 'none';
  }

  _applyCellShade(color) {
    const cells = this._selectMode ? this._selectedCells : [this._getCell()];
    cells.forEach((cell) => {
      if (cell) cell.style.backgroundColor = color;
    });
    // Update the color strip on the shade button to reflect the applied color
    if (this._shadeColorStrip) {
      this._shadeColorStrip.style.background = color || 'transparent';
    }
    this._hideCellShadePopover();
    this.context.invoke('editor.afterCommand');
  }
}
