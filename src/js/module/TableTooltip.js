// TableTooltip.js - Hover tooltip for tables inside the editor
// Shows a horizontal action bar above (or below) the hovered table,
// similar in appearance and interaction to ImageTooltip / VideoTooltip.
import { createElement, on } from '../core/dom.js';

const SHOW_DELAY = 120;
const HIDE_DELAY = 200;

const ICONS = {
  rowAbove:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3v7"/><path d="M9 7l3-4 3 4"/></svg>`,
  rowBelow:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 12v7"/><path d="M9 17l3 4 3-4"/></svg>`,
  deleteRow:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="21" y1="15" x2="15" y2="21"/></svg>`,
  colLeft:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 12h7"/><path d="M7 8l-4 4 4 4"/></svg>`,
  colRight:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M12 12h9"/><path d="M17 8l4 4-4 4"/></svg>`,
  deleteCol:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="15" y1="6" x2="21" y2="12"/><line x1="21" y1="6" x2="15" y2="12"/></svg>`,
  mergeCells:  `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="8" height="10" rx="1"/><rect x="14" y="7" width="8" height="10" rx="1"/><path d="M10 12h4"/><path d="M12 10l2 2-2 2"/></svg>`,
  colWidth:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="7" y1="12" x2="17" y2="12"/><path d="M10 9l-3 3 3 3"/><path d="M14 9l3 3-3 3"/></svg>`,
  rowHeight:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><line x1="12" y1="7" x2="12" y2="17"/><path d="M9 10l3-3 3 3"/><path d="M9 14l3 3 3-3"/></svg>`,
  deleteTable: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="16" y1="16" x2="22" y2="22" stroke="#ef4444"/><line x1="22" y1="16" x2="16" y2="22" stroke="#ef4444"/></svg>`,
};

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
  }

  initialize() {
    this._el = this._buildTooltip();
    document.body.appendChild(this._el);

    this._sizePopover = this._buildSizePopover();
    document.body.appendChild(this._sizePopover);

    const editable = this.context.layoutInfo.editable;

    this._disposers.push(
      on(editable, 'mouseover', (e) => {
        const table = e.target.closest('table');
        if (table && editable.contains(table)) {
          const cell = e.target.closest('td, th');
          if (cell) this._activeCell = cell;
          this._scheduleShow(table);
        }
      }),
      on(editable, 'mouseout', (e) => {
        const to = e.relatedTarget;
        if (!to || (
          !editable.contains(to) &&
          !this._el.contains(to) &&
          !(this._sizePopover && this._sizePopover.contains(to))
        )) {
          this._scheduleHide();
        }
      }),
      on(document, 'click', (e) => {
        if (this._activeTable &&
          !this._activeTable.contains(e.target) &&
          !this._el.contains(e.target) &&
          !(this._sizePopover && this._sizePopover.contains(e.target))) {
          this._hide();
        }
      }),
    );

    this._initColResize();
    return this;
  }

  // ---------------------------------------------------------------------------
  // Column drag-resize
  // ---------------------------------------------------------------------------

  _initColResize() {
    const editable = this.context.layoutInfo.editable;
    let _nearCell  = null;
    let _resizing  = false;
    let _startX    = 0;
    let _startW    = 0;
    let _colIdx    = -1;
    let _table     = null;

    const onEditorMove = (e) => {
      if (_resizing) return;
      const cell = e.target.closest('td, th');
      if (!cell || !editable.contains(cell)) {
        if (_nearCell) { _nearCell.style.cursor = ''; _nearCell = null; }
        return;
      }
      const rect = cell.getBoundingClientRect();
      if (Math.abs(e.clientX - rect.right) < 6) {
        cell.style.cursor = 'col-resize';
        _nearCell = cell;
      } else {
        if (_nearCell) { _nearCell.style.cursor = ''; _nearCell = null; }
      }
    };

    const onEditorDown = (e) => {
      if (!_nearCell) return;
      _resizing  = true;
      _startX    = e.clientX;
      _startW    = _nearCell.offsetWidth;
      _table     = _nearCell.closest('table');
      _colIdx    = Array.from(_nearCell.closest('tr').cells).indexOf(_nearCell);
      document.body.style.userSelect = 'none';
      document.body.style.cursor     = 'col-resize';
      e.preventDefault();
      e.stopPropagation();
    };

    const onDocMove = (e) => {
      if (!_resizing) return;
      const newW = Math.max(30, _startW + (e.clientX - _startX));
      if (_table && _colIdx >= 0) {
        Array.from(_table.querySelectorAll('tr')).forEach((r) => {
          const c = r.cells[_colIdx];
          if (c) { c.style.width = `${newW}px`; c.style.minWidth = `${newW}px`; }
        });
      }
    };

    const onDocUp = () => {
      if (!_resizing) return;
      _resizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor     = '';
      _table  = null;
      _colIdx = -1;
      this.context.invoke('editor.afterCommand');
    };

    this._disposers.push(
      on(editable,  'mousemove', onEditorMove),
      on(editable,  'mousedown', onEditorDown),
      on(document,  'mousemove', onDocMove),
      on(document,  'mouseup',   onDocUp),
    );
  }

  destroy() {
    this._clearTimers();
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    this._el = null;
    if (this._sizePopover && this._sizePopover.parentNode) {
      this._sizePopover.parentNode.removeChild(this._sizePopover);
    }
    this._sizePopover = null;
  }

  // ---------------------------------------------------------------------------
  // Build tooltip bar
  // ---------------------------------------------------------------------------

  _buildTooltip() {
    const el = createElement('div', {
      class: 'an-link-tooltip an-table-tooltip',
      role: 'toolbar',
      'aria-label': 'Table actions',
    });
    el.style.display = 'none';

    // Label
    this._label = createElement('span', { class: 'an-link-tooltip-url' });
    this._label.textContent = 'Table';
    el.appendChild(this._label);

    el.appendChild(this._sep());

    // Row operations
    el.appendChild(this._makeBtn(ICONS.rowAbove, 'Add Row Above', () => this._addRow('above')));
    el.appendChild(this._makeBtn(ICONS.rowBelow, 'Add Row Below', () => this._addRow('below')));
    el.appendChild(this._makeBtn(ICONS.deleteRow, 'Delete Row',   () => this._deleteRow()));

    el.appendChild(this._sep());

    // Column operations
    el.appendChild(this._makeBtn(ICONS.colLeft,   'Add Column Left',  () => this._addColumn('left')));
    el.appendChild(this._makeBtn(ICONS.colRight,  'Add Column Right', () => this._addColumn('right')));
    el.appendChild(this._makeBtn(ICONS.deleteCol, 'Delete Column',    () => this._deleteColumn()));

    el.appendChild(this._sep());

    // Merge cells
    el.appendChild(this._makeBtn(ICONS.mergeCells, 'Merge Cells', () => this._mergeCells()));

    el.appendChild(this._sep());

    // Resize
    el.appendChild(this._makeBtn(ICONS.colWidth,  'Column Width', () => this._openSizePopover('col')));
    el.appendChild(this._makeBtn(ICONS.rowHeight, 'Row Height',   () => this._openSizePopover('row')));

    el.appendChild(this._sep());

    // Delete table (danger)
    el.appendChild(this._makeBtn(ICONS.deleteTable, 'Delete Table', () => this._deleteTable(), true));

    // Keep tooltip alive while hovering.
    // Don't schedule hide on mouseleave when the size popover is open —
    // the user is moving the mouse toward it.
    this._disposers.push(
      on(el, 'mouseenter', () => this._clearTimers()),
      on(el, 'mouseleave', () => {
        if (this._sizePopover && this._sizePopover.style.display !== 'none') return;
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
    this._positionNear(this._activeTable);
  }

  _hide() {
    this._el.style.display = 'none';
    this._activeTable = null;
    this._activeCell = null;
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
    if (left + tipW > window.innerWidth - margin) left = window.innerWidth - tipW - margin;
    if (left < margin)                            left = margin;

    this._el.style.left = `${left}px`;
    this._el.style.top  = `${top}px`;
  }

  // ---------------------------------------------------------------------------
  // Helper: get active cell (fallback to first td/th in table)
  // ---------------------------------------------------------------------------

  _getCell() {
    return this._activeCell
      || (this._activeTable && this._activeTable.querySelector('td, th'));
  }

  // ---------------------------------------------------------------------------
  // Table operations
  // ---------------------------------------------------------------------------

  _addRow(position) {
    const cell = this._getCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    const colCount = Array.from(row.cells).reduce((sum, c) => sum + (c.colSpan || 1), 0);
    const newRow = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
      newRow.appendChild(createElement('td', {}, ['\u00a0']));
    }
    if (position === 'above') row.parentElement?.insertBefore(newRow, row);
    else row.insertAdjacentElement('afterend', newRow);
    this._positionNear(this._activeTable);
    this.context.invoke('editor.afterCommand');
  }

  _addColumn(position) {
    const cell = this._getCell();
    if (!cell) return;
    const row   = cell.closest('tr');
    const table = cell.closest('table');
    if (!row || !table) return;
    const colIndex = Array.from(row.cells).indexOf(cell);
    Array.from(table.querySelectorAll('tr')).forEach((r) => {
      const cells = Array.from(r.cells);
      const td = createElement('td', {}, ['\u00a0']);
      const ref = position === 'left' ? cells[colIndex] : (cells[colIndex + 1] || null);
      r.insertBefore(td, ref);
    });
    this._positionNear(this._activeTable);
    this.context.invoke('editor.afterCommand');
  }

  _deleteRow() {
    const cell = this._getCell();
    if (!cell) return;
    const row   = cell.closest('tr');
    const table = cell.closest('table');
    if (!row || !table) return;
    if (table.querySelectorAll('tr').length <= 1) return;
    this._activeCell = null;
    row.parentElement?.removeChild(row);
    this._positionNear(this._activeTable);
    this.context.invoke('editor.afterCommand');
  }

  _deleteColumn() {
    const cell = this._getCell();
    if (!cell) return;
    const row   = cell.closest('tr');
    const table = cell.closest('table');
    if (!row || !table) return;
    if (row.cells.length <= 1) return;
    const colIndex = Array.from(row.cells).indexOf(cell);
    this._activeCell = null;
    Array.from(table.querySelectorAll('tr')).forEach((r) => {
      const c = r.cells[colIndex];
      if (c) r.removeChild(c);
    });
    this._positionNear(this._activeTable);
    this.context.invoke('editor.afterCommand');
  }

  _mergeCells() {
    const cell = this._getCell();
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const selected = Array.from(row.cells).filter((c) => {
      try { return range.intersectsNode(c); } catch { return false; }
    });
    if (selected.length < 2) return;
    const first = selected[0];
    first.colSpan = selected.reduce((sum, c) => sum + (c.colSpan || 1), 0);
    first.innerHTML = selected.map((c) => c.innerHTML).join('');
    selected.slice(1).forEach((c) => row.removeChild(c));
    this.context.invoke('editor.afterCommand');
  }

  _deleteTable() {
    const table = this._activeTable;
    if (!table) return;
    this._hide();
    if (table.parentNode) table.parentNode.removeChild(table);
    this.context.invoke('editor.afterCommand');
  }

  // ---------------------------------------------------------------------------
  // Size popover (column width / row height)
  // ---------------------------------------------------------------------------

  _buildSizePopover() {
    const popover = createElement('div', { class: 'an-size-popover' });
    popover.style.display = 'none';

    const titleEl = createElement('div', { class: 'an-size-popover-title' });
    const body    = createElement('div', { class: 'an-size-popover-body' });
    const inputEl = createElement('input', {
      type: 'number', class: 'an-size-input', min: '1', max: '2000', step: '1',
    });
    const unitEl = createElement('span', { class: 'an-size-unit' }, ['px']);
    body.appendChild(inputEl);
    body.appendChild(unitEl);

    const actionsEl  = createElement('div', { class: 'an-size-popover-actions' });
    const cancelBtn  = createElement('button', { type: 'button', class: 'an-btn' });
    cancelBtn.textContent = 'Cancel';
    const applyBtn   = createElement('button', { type: 'button', class: 'an-btn an-btn-primary' });
    applyBtn.textContent = 'Apply';
    actionsEl.appendChild(cancelBtn);
    actionsEl.appendChild(applyBtn);

    popover.appendChild(titleEl);
    popover.appendChild(body);
    popover.appendChild(actionsEl);

    this._sizeTitleEl = titleEl;
    this._sizeInputEl = inputEl;
    this._sizeApply   = null;

    const d1 = on(applyBtn, 'click', () => {
      const val = parseInt(this._sizeInputEl.value, 10);
      if (val > 0 && typeof this._sizeApply === 'function') this._sizeApply(val);
      this._hideSizePopover();
    });
    const d2 = on(cancelBtn, 'click', () => this._hideSizePopover());
    const d3 = on(inputEl, 'keydown', (e) => {
      if (e.key === 'Enter')  { e.preventDefault(); applyBtn.click(); }
      if (e.key === 'Escape') this._hideSizePopover();
    });
    const d4 = on(document, 'click', (e) => {
      if (this._sizePopover &&
          this._sizePopover.style.display !== 'none' &&
          !this._sizePopover.contains(e.target) &&
          !this._el.contains(e.target)) {
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
    const isCol = type === 'col';
    this._sizeTitleEl.textContent = isCol ? 'Column Width (px)' : 'Row Height (px)';
    this._sizeInputEl.value = isCol
      ? (cell.offsetWidth || 120)
      : (cell.closest('tr') ? (cell.closest('tr').offsetHeight || 40) : 40);

    this._sizeApply = (val) => {
      if (isCol) {
        const table    = cell.closest('table');
        const colIndex = Array.from(cell.closest('tr').cells).indexOf(cell);
        Array.from(table.querySelectorAll('tr')).forEach((r) => {
          const c = r.cells[colIndex];
          if (c) { c.style.width = `${val}px`; c.style.minWidth = `${val}px`; }
        });
      } else {
        const row = cell.closest('tr');
        if (row) Array.from(row.cells).forEach((c) => { c.style.height = `${val}px`; });
      }
      this.context.invoke('editor.afterCommand');
    };

    this._sizePopover.style.display = 'block';
    requestAnimationFrame(() => {
      if (!this._sizePopover || !this._el) return;
      const tipRect = this._el.getBoundingClientRect();
      const pw = this._sizePopover.offsetWidth  || 220;
      const ph = this._sizePopover.offsetHeight || 110;
      let left = tipRect.left;
      let top  = tipRect.bottom + 6;
      if (left + pw > window.innerWidth  - 8) left = window.innerWidth  - pw - 8;
      if (top  + ph > window.innerHeight - 8) top  = tipRect.top - ph - 6;
      this._sizePopover.style.left = `${left}px`;
      this._sizePopover.style.top  = `${top}px`;
      if (this._sizeInputEl) { this._sizeInputEl.focus(); this._sizeInputEl.select(); }
    });
  }

  _hideSizePopover() {
    if (this._sizePopover) this._sizePopover.style.display = 'none';
    this._sizeApply = null;
  }
}
