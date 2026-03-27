// ContextMenu.js - Right-click context menu for editor actions
import { createElement, on } from '../core/dom.js';

// SVG icon map — 16×16 Heroicons-style paths
const ICONS = {
  undo: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
  redo: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>`,
  cut: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="20" r="3"/><circle cx="6" cy="4" r="3"/><line x1="19" y1="5" x2="6" y2="19"/><line x1="19" y1="19" x2="13.5" y2="13.5"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  paste: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
  bold: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>`,
  italic: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>`,
  underline: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>`,
  link: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  image:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  // Table operations
  rowAbove:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3v7"/><path d="M9 7l3-4 3 4"/></svg>`,
  rowBelow:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 12v7"/><path d="M9 17l3 4 3-4"/></svg>`,
  colLeft:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 12h7"/><path d="M7 8l-4 4 4 4"/></svg>`,
  colRight:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M12 12h9"/><path d="M17 8l4 4-4 4"/></svg>`,
  deleteRow:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="21" y1="15" x2="15" y2="21"/></svg>`,
  deleteCol:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="15" y1="6" x2="21" y2="12"/><line x1="21" y1="6" x2="15" y2="12"/></svg>`,
  mergeCells:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="8" height="10" rx="1"/><rect x="14" y="7" width="8" height="10" rx="1"/><path d="M10 12h4"/><path d="M12 10l2 2-2 2"/></svg>`,
  colWidth:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="7" y1="12" x2="17" y2="12"/><path d="M10 9l-3 3 3 3"/><path d="M14 9l3 3-3 3"/></svg>`,
  rowHeight:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><line x1="12" y1="7" x2="12" y2="17"/><path d="M9 10l3-3 3 3"/><path d="M9 14l3 3 3-3"/></svg>`,
  table:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
  deleteTable: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="16" y1="16" x2="22" y2="22" stroke="#ef4444"/><line x1="22" y1="16" x2="16" y2="22" stroke="#ef4444"/></svg>`,
  back:        `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
};

const defaultItems = [
  { name: 'undo',      label: 'Undo',         icon: ICONS.undo,      action: (ctx) => ctx.invoke('editor.undo') },
  { name: 'redo',      label: 'Redo',         icon: ICONS.redo,      action: (ctx) => ctx.invoke('editor.redo') },
  { separator: true },
  { name: 'cut',       label: 'Cut',          icon: ICONS.cut,       action: () => document.execCommand('cut') },
  { name: 'copy',      label: 'Copy',         icon: ICONS.copy,      action: () => document.execCommand('copy') },
  { name: 'paste',     label: 'Paste',        icon: ICONS.paste,     action: () => document.execCommand('paste') },
  { separator: true },
  { name: 'bold',      label: 'Bold',         icon: ICONS.bold,      action: (ctx) => ctx.invoke('editor.bold') },
  { name: 'italic',    label: 'Italic',       icon: ICONS.italic,    action: (ctx) => ctx.invoke('editor.italic') },
  { name: 'underline', label: 'Underline',    icon: ICONS.underline, action: (ctx) => ctx.invoke('editor.underline') },
  { separator: true },
  { name: 'link',      label: 'Insert Link',  icon: ICONS.link,      action: (ctx) => ctx.invoke('linkDialog.open') },
  { name: 'image',     label: 'Insert Image', icon: ICONS.image,     action: (ctx) => ctx.invoke('imageDialog.open') },
];

export class ContextMenu {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this.options = context.options || {};
    this._items = (this.options.contextMenu && this.options.contextMenu.items) || defaultItems;
    this.el = null;
    this._disposers = [];
    this._menuDisposers = []; // disposers for dynamically-rendered menu buttons
    this._targetCell = null; // <td>/<th> that received the right-click
    this._sizePopover = null;
    this._lastX = 0;
    this._lastY = 0;
  }

  initialize() {
    this.el = createElement('div', { class: 'asn-contextmenu', role: 'menu', 'aria-hidden': 'true' });
    this.el.style.display = 'none';
    document.body.appendChild(this.el);

    this._sizePopover = this._buildSizePopover();
    document.body.appendChild(this._sizePopover);

    this._renderItems(this._items);

    const editable = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (editable) {
      this._disposers.push(on(editable, 'contextmenu', (e) => this._onContextMenu(e)));
    }

    this._disposers.push(on(document, 'click', (e) => this._maybeHide(e)));
    this._disposers.push(on(document, 'keydown', (e) => { if (e.key === 'Escape') this.hide(); }));
    this._disposers.push(on(window, 'scroll', () => this.hide(), { passive: true }));

    return this;
  }

  destroy() {
    this._menuDisposers.forEach((d) => { try { d(); } catch (e) {} });
    this._menuDisposers = [];
    this._disposers.forEach((d) => { try { d(); } catch (e) {} });
    this._disposers = [];
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
    if (this._sizePopover && this._sizePopover.parentNode) {
      this._sizePopover.parentNode.removeChild(this._sizePopover);
    }
    this._sizePopover = null;
  }

  _renderItems(items) {
    // Clean up previously registered per-item listeners
    this._menuDisposers.forEach((d) => d());
    this._menuDisposers = [];

    if (!this.el) return;
    this.el.innerHTML = '';

    items.forEach((it) => {
      if (it.separator || it.sep) {
        this.el.appendChild(createElement('div', { class: 'asn-context-sep' }));
        return;
      }

      // Back-navigation header
      if (it.back) {
        const backBtn = createElement('button', { type: 'button', class: 'asn-context-back' });
        const iconSpan = createElement('span', { class: 'asn-context-icon', 'aria-hidden': 'true' });
        iconSpan.innerHTML = ICONS.back;
        backBtn.appendChild(iconSpan);
        backBtn.appendChild(createElement('span', { class: 'asn-context-label' }, [it.label || 'Back']));
        const off = on(backBtn, 'click', (e) => {
          e.stopPropagation();
          this._renderItems(it.navigate());
          this._reposition();
        });
        this._menuDisposers.push(off);
        this.el.appendChild(backBtn);
        return;
      }

      // Submenu-navigate item (shows ▶ chevron, re-renders without closing)
      if (it.navigate) {
        const btn = createElement('button', { type: 'button', class: 'asn-context-item asn-context-submenu', 'data-name': it.name || '' });
        if (it.icon) {
          const iconSpan = createElement('span', { class: 'asn-context-icon', 'aria-hidden': 'true' });
          iconSpan.innerHTML = it.icon;
          btn.appendChild(iconSpan);
        }
        btn.appendChild(createElement('span', { class: 'asn-context-label' }, [it.label || it.name]));
        const chevron = createElement('span', { class: 'asn-context-chevron', 'aria-hidden': 'true' });
        chevron.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
        btn.appendChild(chevron);
        const off = on(btn, 'click', (e) => {
          e.stopPropagation();
          this._renderItems(it.navigate());
          this._reposition();
        });
        this._menuDisposers.push(off);
        this.el.appendChild(btn);
        return;
      }

      // Regular item
      const btn = createElement('button', { type: 'button', class: 'asn-context-item', 'data-name': it.name || '' });
      if (it.icon) {
        const iconSpan = createElement('span', { class: 'asn-context-icon', 'aria-hidden': 'true' });
        iconSpan.innerHTML = it.icon;
        btn.appendChild(iconSpan);
      }
      btn.appendChild(createElement('span', { class: 'asn-context-label' }, [it.label || it.name]));
      const off = on(btn, 'click', (e) => {
        e.stopPropagation();
        this.hide();
        try { it.action(this.context); } catch (err) { console.error(err); }
      });
      this._menuDisposers.push(off);
      this.el.appendChild(btn);
    });
  }

  _onContextMenu(event) {
    const editable = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!editable) return;
    if (!editable.contains(event.target)) return;
    event.preventDefault();
    this._lastX = event.clientX;
    this._lastY = event.clientY;
    const cell = event.target.closest('td, th');
    this._targetCell = cell || null;
    // Always show default items; append Table Format entry when inside a table cell
    const items = cell ? this._buildCombinedItems(cell) : this._items;
    this._renderItems(items);
    this.showAt(event.clientX, event.clientY);
  }

  _maybeHide(event) {
    if (!this.el) return;
    if (!this.el.contains(event.target)) this.hide();
  }

  showAt(x, y) {
    if (!this.el) return;
    this.el.style.display = 'block';
    this._reposition(x, y);
    this.el.setAttribute('aria-hidden', 'false');
  }

  _reposition(x, y) {
    if (!this.el) return;
    const rx = x !== undefined ? x : this._lastX;
    const ry = y !== undefined ? y : this._lastY;
    const rect = this.el.getBoundingClientRect();
    let left = rx;
    let top = ry;
    if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 8;
    if (top + rect.height > window.innerHeight) top = window.innerHeight - rect.height - 8;
    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }

  hide() {
    if (!this.el) return;
    this.el.style.display = 'none';
    this.el.setAttribute('aria-hidden', 'true');
  }

  // ---------------------------------------------------------------------------
  // Table context menu items
  // ---------------------------------------------------------------------------

  /** Default items + "Table Format ▶" entry when right-clicking inside a cell. */
  _buildCombinedItems(cell) {
    return [
      ...this._items,
      { separator: true },
      {
        name: 'tableFormat',
        label: 'Table Format',
        icon: ICONS.table,
        navigate: () => this._buildTableSubItems(cell),
      },
    ];
  }

  /** Table sub-menu with ← Back at the top. */
  _buildTableSubItems(cell) {
    return [
      { back: true, label: 'Table Format', navigate: () => this._buildCombinedItems(cell) },
      { separator: true },
      { name: 'addRowAbove', label: 'Add Row Above',    icon: ICONS.rowAbove,   action: () => this._addRow(cell, 'above') },
      { name: 'addRowBelow', label: 'Add Row Below',    icon: ICONS.rowBelow,   action: () => this._addRow(cell, 'below') },
      { separator: true },
      { name: 'addColLeft',  label: 'Add Column Left',  icon: ICONS.colLeft,    action: () => this._addColumn(cell, 'left') },
      { name: 'addColRight', label: 'Add Column Right', icon: ICONS.colRight,   action: () => this._addColumn(cell, 'right') },
      { separator: true },
      { name: 'deleteRow',   label: 'Delete Row',       icon: ICONS.deleteRow,  action: () => this._deleteRow(cell) },
      { name: 'deleteCol',   label: 'Delete Column',    icon: ICONS.deleteCol,  action: () => this._deleteColumn(cell) },
      { separator: true },
      { name: 'mergeCells',  label: 'Merge Cells',      icon: ICONS.mergeCells, action: () => this._mergeCells(cell) },
      { separator: true },
      { name: 'colWidth',    label: 'Column Width\u2026',   icon: ICONS.colWidth,   action: () => this._openSizePopover('col', cell) },
      { name: 'rowHeight',   label: 'Row Height\u2026',     icon: ICONS.rowHeight,  action: () => this._openSizePopover('row', cell) },
      { separator: true },
      { name: 'deleteTable', label: 'Delete Table',        icon: ICONS.deleteTable, action: () => this._deleteTable(cell) },
    ];
  }

  // ---------------------------------------------------------------------------
  // Table operations
  // ---------------------------------------------------------------------------

  _addRow(cell, position) {
    const row = cell.closest('tr');
    if (!row) return;
    const colCount = Array.from(row.cells).reduce((sum, c) => sum + (c.colSpan || 1), 0);
    const newRow = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td');
      td.style.border = '1px solid #dee2e6';
      td.style.padding = '6px 12px';
      td.innerHTML = '&#8203;';
      newRow.appendChild(td);
    }
    if (position === 'above') {
      row.parentElement.insertBefore(newRow, row);
    } else {
      row.insertAdjacentElement('afterend', newRow);
    }
    this.context.invoke('editor.afterCommand');
  }

  _addColumn(cell, position) {
    const row = cell.closest('tr');
    const table = cell.closest('table');
    if (!row || !table) return;
    const colIndex = Array.from(row.cells).indexOf(cell);
    Array.from(table.querySelectorAll('tr')).forEach((r) => {
      const cells = Array.from(r.cells);
      const td = document.createElement('td');
      td.style.border = '1px solid #dee2e6';
      td.style.padding = '6px 12px';
      td.innerHTML = '&#8203;';
      const ref = position === 'left' ? cells[colIndex] : (cells[colIndex + 1] || null);
      r.insertBefore(td, ref);
    });
    this.context.invoke('editor.afterCommand');
  }

  _deleteRow(cell) {
    const row = cell.closest('tr');
    const table = cell.closest('table');
    if (!row || !table) return;
    if (table.querySelectorAll('tr').length <= 1) return;
    row.parentElement.removeChild(row);
    this.context.invoke('editor.afterCommand');
  }

  _deleteColumn(cell) {
    const row = cell.closest('tr');
    const table = cell.closest('table');
    if (!row || !table) return;
    if (row.cells.length <= 1) return;
    const colIndex = Array.from(row.cells).indexOf(cell);
    Array.from(table.querySelectorAll('tr')).forEach((r) => {
      const c = r.cells[colIndex];
      if (c) r.removeChild(c);
    });
    this.context.invoke('editor.afterCommand');
  }

  _deleteTable(cell) {
    const table = cell.closest('table');
    if (!table) return;
    table.parentNode.removeChild(table);
    this.context.invoke('editor.afterCommand');
  }

  _mergeCells(cell) {
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

  // ---------------------------------------------------------------------------
  // Size popover (column width / row height)
  // ---------------------------------------------------------------------------

  _buildSizePopover() {
    const popover = createElement('div', { class: 'asn-size-popover' });
    popover.style.display = 'none';

    const titleEl = createElement('div', { class: 'asn-size-popover-title' });
    const body = createElement('div', { class: 'asn-size-popover-body' });
    const inputEl = createElement('input', {
      type: 'number', class: 'asn-size-input', min: '1', max: '2000', step: '1',
    });
    const unitEl = createElement('span', { class: 'asn-size-unit' }, ['px']);
    body.appendChild(inputEl);
    body.appendChild(unitEl);

    const actionsEl = createElement('div', { class: 'asn-size-popover-actions' });
    const cancelBtn = createElement('button', { type: 'button', class: 'asn-btn' });
    cancelBtn.textContent = 'Cancel';
    const applyBtn = createElement('button', { type: 'button', class: 'asn-btn asn-btn-primary' });
    applyBtn.textContent = 'Apply';
    actionsEl.appendChild(cancelBtn);
    actionsEl.appendChild(applyBtn);

    popover.appendChild(titleEl);
    popover.appendChild(body);
    popover.appendChild(actionsEl);

    this._sizeTitleEl = titleEl;
    this._sizeInputEl = inputEl;
    this._sizeApply = null;

    const d1 = on(applyBtn, 'click', () => {
      const val = parseInt(this._sizeInputEl.value, 10);
      if (val > 0 && typeof this._sizeApply === 'function') this._sizeApply(val);
      this._hideSizePopover();
    });
    const d2 = on(cancelBtn, 'click', () => this._hideSizePopover());
    const d3 = on(inputEl, 'keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyBtn.click(); }
      if (e.key === 'Escape') this._hideSizePopover();
    });
    const d4 = on(document, 'click', (e) => {
      if (this._sizePopover
        && this._sizePopover.style.display !== 'none'
        && !this._sizePopover.contains(e.target)) {
        this._hideSizePopover();
      }
    });
    this._disposers.push(d1, d2, d3, d4);
    return popover;
  }

  _openSizePopover(type, cell) {
    if (!this._sizePopover) return;
    const isCol = type === 'col';
    this._sizeTitleEl.textContent = isCol ? 'Column Width (px)' : 'Row Height (px)';
    this._sizeInputEl.value = isCol
      ? (cell.offsetWidth || 120)
      : (cell.closest('tr') ? (cell.closest('tr').offsetHeight || 40) : 40);

    this._sizeApply = (val) => {
      if (isCol) {
        const table = cell.closest('table');
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
      if (!this._sizePopover) return;
      const pw = this._sizePopover.offsetWidth || 220;
      const ph = this._sizePopover.offsetHeight || 110;
      let left = this._lastX;
      let top = this._lastY;
      if (left + pw > window.innerWidth) left = window.innerWidth - pw - 8;
      if (top + ph > window.innerHeight) top = window.innerHeight - ph - 8;
      this._sizePopover.style.left = `${left}px`;
      this._sizePopover.style.top = `${top}px`;
      if (this._sizeInputEl) { this._sizeInputEl.focus(); this._sizeInputEl.select(); }
    });
  }

  _hideSizePopover() {
    if (this._sizePopover) this._sizePopover.style.display = 'none';
    this._sizeApply = null;
  }
}

export default ContextMenu;
