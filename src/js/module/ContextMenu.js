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
  video:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  // Image format operations
  floatLeft:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1"/><line x1="12" y1="6" x2="22" y2="6"/><line x1="12" y1="9" x2="22" y2="9"/><line x1="12" y1="12" x2="22" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>`,
  floatRight:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="8" height="8" rx="1"/><line x1="2" y1="6" x2="12" y2="6"/><line x1="2" y1="9" x2="12" y2="9"/><line x1="2" y1="12" x2="12" y2="12"/><line x1="2" y1="16" x2="22" y2="16"/><line x1="2" y1="20" x2="18" y2="20"/></svg>`,
  floatNone:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="17" y2="19"/></svg>`,
  originalSize:`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  deleteImg:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  // Video format operations
  videoAlign:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  deleteVideo: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  // Format painter operations
  copyFormat:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  pasteFormat: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>`,
  removeFormat:`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`,
  // Table
  table:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
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
  { name: 'copyFormat',   label: 'Copy Format',   icon: ICONS.copyFormat,   action: (ctx) => ctx.invoke('contextMenu.copyFormat') },
  { name: 'pasteFormat',  label: 'Paste Format',  icon: ICONS.pasteFormat,  action: (ctx) => ctx.invoke('contextMenu.pasteFormat'), disabled: (ctx) => !ctx.invoke('contextMenu.hasCopiedFormat') },
  { name: 'removeFormat', label: 'Remove Format', icon: ICONS.removeFormat, action: (ctx) => ctx.invoke('contextMenu.removeFormat') },
  { separator: true },
  { name: 'link',      label: 'Insert Link',  icon: ICONS.link,      action: (ctx) => ctx.invoke('linkDialog.show') },
  { name: 'image',     label: 'Insert Image', icon: ICONS.image,     action: (ctx) => ctx.invoke('imageDialog.show') },
  { name: 'video',     label: 'Insert Video', icon: ICONS.video,     action: (ctx) => ctx.invoke('videoDialog.show') },
  { name: 'table',     label: 'Insert Table', icon: ICONS.table,     tableGrid: true },
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
    this._lastX = 0;
    this._lastY = 0;
    this._copiedFormat = null;
    this._savedRange = null;
  }

  initialize() {
    this.el = createElement('div', { class: 'an-contextmenu', role: 'menu', 'aria-hidden': 'true' });
    this.el.style.display = 'none';
    document.body.appendChild(this.el);

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
  }

  _renderItems(items) {
    // Clean up previously registered per-item listeners
    this._menuDisposers.forEach((d) => d());
    this._menuDisposers = [];

    if (!this.el) return;
    this.el.innerHTML = '';

    items.forEach((it) => {
      if (it.separator || it.sep) {
        this.el.appendChild(createElement('div', { class: 'an-context-sep' }));
        return;
      }

      // Back-navigation header
      if (it.back) {
        const backBtn = createElement('button', { type: 'button', class: 'an-context-back' });
        const iconSpan = createElement('span', { class: 'an-context-icon', 'aria-hidden': 'true' });
        iconSpan.innerHTML = ICONS.back;
        backBtn.appendChild(iconSpan);
        backBtn.appendChild(createElement('span', { class: 'an-context-label' }, [it.label || 'Back']));
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
        const btn = createElement('button', { type: 'button', class: 'an-context-item an-context-submenu', 'data-name': it.name || '' });
        if (it.icon) {
          const iconSpan = createElement('span', { class: 'an-context-icon', 'aria-hidden': 'true' });
          iconSpan.innerHTML = it.icon;
          btn.appendChild(iconSpan);
        }
        btn.appendChild(createElement('span', { class: 'an-context-label' }, [it.label || it.name]));
        const chevron = createElement('span', { class: 'an-context-chevron', 'aria-hidden': 'true' });
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

      // Table grid picker item — expands an inline grid panel when clicked
      if (it.tableGrid) {
        const GRID_ROWS = 8, GRID_COLS = 8;
        const wrapper = createElement('div', { class: 'an-context-table-wrap' });

        const headerBtn = createElement('button', { type: 'button', class: 'an-context-item an-context-submenu', 'data-name': it.name || 'table' });
        if (it.icon) {
          const iconSpan = createElement('span', { class: 'an-context-icon', 'aria-hidden': 'true' });
          iconSpan.innerHTML = it.icon;
          headerBtn.appendChild(iconSpan);
        }
        headerBtn.appendChild(createElement('span', { class: 'an-context-label' }, [it.label || 'Insert Table']));
        const chevron = createElement('span', { class: 'an-context-chevron', 'aria-hidden': 'true' });
        chevron.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
        headerBtn.appendChild(chevron);

        const panel = createElement('div', { class: 'an-context-table-grid-panel' });
        panel.style.display = 'none';

        const gridEl = createElement('div', { class: 'an-table-grid' });
        gridEl.style.gridTemplateColumns = `repeat(${GRID_COLS}, 16px)`;
        const labelEl = createElement('div', { class: 'an-table-label' });
        labelEl.textContent = 'Insert Table';

        const cells = [];
        for (let r = 1; r <= GRID_ROWS; r++) {
          for (let c = 1; c <= GRID_COLS; c++) {
            const cell = createElement('div', { class: 'an-table-cell', 'data-row': String(r), 'data-col': String(c) });
            cell.style.width = '16px';
            cell.style.height = '16px';
            cells.push(cell);
            gridEl.appendChild(cell);
          }
        }

        const setHighlight = (rows, cols) => {
          cells.forEach((cell) => {
            cell.classList.toggle('active', +cell.dataset.row <= rows && +cell.dataset.col <= cols);
          });
          labelEl.textContent = (rows && cols) ? `${cols} × ${rows}` : 'Insert Table';
        };

        panel.appendChild(gridEl);
        panel.appendChild(labelEl);

        let expanded = false;
        const offHeader = on(headerBtn, 'click', (e) => {
          e.stopPropagation();
          expanded = !expanded;
          panel.style.display = expanded ? '' : 'none';
          chevron.style.transform = expanded ? 'rotate(90deg)' : '';
          this._reposition();
        });
        this._menuDisposers.push(offHeader);

        const offMove = on(gridEl, 'mousemove', (e) => {
          const cell = e.target.closest('[data-row]');
          if (!cell) return;
          setHighlight(+cell.dataset.row, +cell.dataset.col);
        });
        const offLeave = on(gridEl, 'mouseleave', () => setHighlight(0, 0));
        const offClick = on(gridEl, 'click', (e) => {
          const cell = e.target.closest('[data-row]');
          if (!cell) return;
          const rows = +cell.dataset.row;
          const cols = +cell.dataset.col;
          const editable = this.context.layoutInfo && this.context.layoutInfo.editable;
          if (editable && this._savedRange) {
            editable.focus();
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this._savedRange.cloneRange());
          }
          this.hide();
          this.context.invoke('editor.insertTable', cols, rows);
        });
        this._menuDisposers.push(offMove, offLeave, offClick);

        wrapper.appendChild(headerBtn);
        wrapper.appendChild(panel);
        this.el.appendChild(wrapper);
        return;
      }

      // Regular item
      const btn = createElement('button', { type: 'button', class: 'an-context-item', 'data-name': it.name || '' });
      if (typeof it.disabled === 'function' ? it.disabled(this.context) : !!it.disabled) btn.disabled = true;
      if (it.icon) {
        const iconSpan = createElement('span', { class: 'an-context-icon', 'aria-hidden': 'true' });
        iconSpan.innerHTML = it.icon;
        btn.appendChild(iconSpan);
      }
      btn.appendChild(createElement('span', { class: 'an-context-label' }, [it.label || it.name]));
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
    const winSel = window.getSelection();
    this._savedRange = (winSel && winSel.rangeCount > 0) ? winSel.getRangeAt(0).cloneRange() : null;
    this._renderItems(this._items);
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
  // Format operations (Copy Format / Paste Format / Remove Format)
  // ---------------------------------------------------------------------------

  /** Returns true if a format has been copied — used to disable Paste Format. */
  hasCopiedFormat() { return !!this._copiedFormat; }

  /** Snapshot inline styles at the selection anchor node. */
  copyFormat() {
    const range = this._savedRange;
    if (!range) return;
    const editable = this.context.layoutInfo && this.context.layoutInfo.editable;
    let node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node || !editable || !editable.contains(node)) return;

    // Walk up to collect explicitly-set inline properties from the nearest styled ancestor
    const cs = window.getComputedStyle(node);

    // Detect if an explicit font-family / font-size is set on an element (not just inherited)
    const explicitFontFamily = this._findExplicitStyle(node, editable, 'fontFamily');
    const explicitFontSize   = this._findExplicitStyle(node, editable, 'fontSize');

    this._copiedFormat = {
      bold:            parseInt(cs.fontWeight, 10) >= 700,
      italic:          cs.fontStyle === 'italic' || cs.fontStyle === 'oblique',
      underline:       (cs.textDecorationLine || '').includes('underline'),
      strikethrough:   (cs.textDecorationLine || '').includes('line-through'),
      fontFamily:      explicitFontFamily,
      fontSize:        explicitFontSize,
      color:           this._isDefaultColor(cs.color) ? null : cs.color,
      backgroundColor: cs.backgroundColor,
    };
  }

  /** Walk up the tree looking for a property explicitly set in inline style. Returns null if only inherited. */
  _findExplicitStyle(node, boundary, prop) {
    let el = node;
    while (el && el !== boundary && el !== document.body) {
      if (el.style && el.style[prop]) return el.style[prop];
      // also check font element attributes
      if (el.nodeName === 'FONT') {
        if (prop === 'fontFamily' && el.getAttribute('face')) return el.getAttribute('face');
        if (prop === 'fontSize'   && el.getAttribute('size')) {
          // font size attribute is 1-7; skip these since we need px
          return null;
        }
      }
      el = el.parentElement;
    }
    return null;
  }

  /** Checks if a computed color looks like the default browser text color (black). */
  _isDefaultColor(color) {
    return !color || color === 'rgb(0, 0, 0)' || color === 'rgba(0, 0, 0, 0)' || color === 'transparent';
  }

  /** Apply the most-recently copied format to the saved selection. */
  pasteFormat() {
    if (!this._copiedFormat || !this._savedRange) return;
    const fmt = this._copiedFormat;
    const editable = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!editable) return;

    // CRITICAL: focus the editable FIRST, then restore selection.
    // Calling focus() after addRange() can wipe the selection in Chrome/Firefox.
    editable.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(this._savedRange.cloneRange());

    // Strip existing inline formatting so we start from a clean state.
    // After removeFormat, bold/italic/underline/strikethrough are guaranteed off.
    document.execCommand('removeFormat');

    // Apply each format positively — no toggle-check needed after removeFormat.
    if (fmt.bold)          document.execCommand('bold');
    if (fmt.italic)        document.execCommand('italic');
    if (fmt.underline)     document.execCommand('underline');
    if (fmt.strikethrough) document.execCommand('strikeThrough');

    if (fmt.color) document.execCommand('foreColor', false, fmt.color);

    const isTransparent = (c) => !c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
    if (!isTransparent(fmt.backgroundColor)) {
      document.execCommand('hiliteColor', false, fmt.backgroundColor);
    }

    // Font size — use a unique data-marker to avoid touching pre-existing font[size="7"] nodes.
    if (fmt.fontSize) {
      const marker = `fs-${Date.now()}`;
      document.execCommand('fontSize', false, '7');
      editable.querySelectorAll('font[size="7"]').forEach((el) => el.setAttribute('data-an-tmp', marker));
      editable.querySelectorAll(`[data-an-tmp="${marker}"]`).forEach((el) => {
        const span = document.createElement('span');
        span.style.fontSize = fmt.fontSize;
        el.parentNode.insertBefore(span, el);
        while (el.firstChild) span.appendChild(el.firstChild);
        el.parentNode.removeChild(el);
      });
    }

    // Font family — only apply if it was explicitly set (not just inherited default).
    if (fmt.fontFamily) {
      document.execCommand('fontName', false, fmt.fontFamily);
    }

    this.context.invoke('editor.afterCommand');
  }

  /** Strip all inline formatting from the saved selection. */
  removeFormat() {
    if (!this._savedRange) return;
    const editable = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!editable) return;

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(this._savedRange.cloneRange());
    editable.focus();

    document.execCommand('removeFormat');

    const range = sel.getRangeAt(0);
    const root = range.commonAncestorContainer;
    const rootEl = root.nodeType === Node.TEXT_NODE ? root.parentElement : root;
    const iter = document.createNodeIterator(rootEl, NodeFilter.SHOW_ELEMENT);
    let el;
    while ((el = iter.nextNode())) {
      if (!editable.contains(el) || el === editable) continue;
      try { if (range.intersectsNode(el)) el.removeAttribute('style'); } catch { /* ignore */ }
    }

    this.context.invoke('editor.afterCommand');
  }
}

export default ContextMenu;
