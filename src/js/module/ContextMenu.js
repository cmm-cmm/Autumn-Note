// ContextMenu.js - Right-click context menu for editor actions
import { createElement, on, portalOf, setIcon, svgIcon } from '../core/dom.js';
import { sanitiseHTML } from '../core/sanitise.js';
import { resolvePalette } from '../core/palette.js';
import { copySelection, cutSelection } from '../core/clipboard.js';
import * as Style from '../editing/Style.js';
import { insertHTMLNative, insertTextNative } from '../editing/insert.js';
import { PATHS } from '../core/icon-paths.js';

// SVG icon map — 16×16 Heroicons-style paths
const ICONS = {
  undo: svgIcon(PATHS.undo, 14),
  redo: svgIcon(PATHS.redo, 14),
  cut: svgIcon(`<circle cx="6" cy="20" r="3"/><circle cx="6" cy="4" r="3"/><line x1="19" y1="5" x2="6" y2="19"/><line x1="19" y1="19" x2="13.5" y2="13.5"/>`, 14),
  copy: svgIcon(PATHS.copy, 14),
  paste: svgIcon(`<path d="M16 4h2l2 2v14l-2 2H6l-2-2V6l2-2h2"/><rect x="8" y="2" width="8" height="4"/>`, 14),
  bold: svgIcon(PATHS.bold, 14),
  italic: svgIcon(PATHS.italic, 14),
  underline: svgIcon(PATHS.underline, 14),
  link: svgIcon(PATHS.link, 14),
  image:       svgIcon(PATHS.image, 14),
  video:       svgIcon(PATHS.video, 14),
  // Image format operations
  floatLeft:   svgIcon(PATHS.floatLeft, 14),
  floatRight:  svgIcon(PATHS.floatRight, 14),
  floatNone:   svgIcon(PATHS.floatNone, 14),
  originalSize:svgIcon(PATHS.expand, 14),
  deleteImg:   svgIcon(PATHS.trash, 14),
  // Video format operations
  videoAlign:  svgIcon(PATHS.video, 14),
  deleteVideo: svgIcon(PATHS.trash, 14),
  // Format painter operations
  copyFormat:  svgIcon(PATHS.edit, 14),
  pasteFormat: svgIcon(`<path d="M16 4h2l2 2v14l-2 2H6l-2-2V6l2-2h2"/><rect x="8" y="2" width="8" height="4"/><path d="m9 14 2 2 4-4"/>`, 14),
  removeFormat:svgIcon(PATHS.removeFormat, 14),
  // Table
  table:       svgIcon(PATHS.table, 14),
  // Color
  textColor:      svgIcon(PATHS.foreColor, 14),
  highlightColor: svgIcon(PATHS.highlight, 14),
  noColor:        `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>`,
  back:           svgIcon(`<polyline points="15 18 9 12 15 6"/>`, 14),
};


function makeColorSubItems(colorType) {
  const label = colorType === 'foreColor' ? 'Text Color' : 'Highlight Color';
  const localeKey = colorType === 'foreColor' ? 'textColor' : 'highlightColor';
  return () => [
    { back: true, label, localeKey, navigate: () => defaultItems },
    { colorPalette: true, colorType },
  ];
}

const defaultItems = [
  { name: 'cut', quick: true,       label: 'Cut',          icon: ICONS.cut,       action: (ctx) => { cutSelection(() => ctx.invoke('editor.afterCommand')); } },
  { name: 'copy', quick: true,      label: 'Copy',         icon: ICONS.copy,      action: () => { copySelection(); } },
  { name: 'paste', quick: true,     label: 'Paste',        icon: ICONS.paste,     action: (ctx) => {
    if (!navigator.clipboard) return;
    const editable = ctx.layoutInfo?.editable;
    if (!editable) return;
    // Prefer read() to get rich HTML; fall back to readText() for plain text
    const doInsert = (html, text) => {
      editable.focus();
      if (html) {
        insertHTMLNative(sanitiseHTML(html), editable);
      } else if (text) {
        insertTextNative(text, editable);
      }
      ctx.invoke('editor.afterCommand');
    };
    if (typeof navigator.clipboard.read === 'function') {
      navigator.clipboard.read().then((items) => {
        for (const item of items) {
          if (item.types.includes('text/html')) {
            item.getType('text/html').then((blob) => blob.text()).then((html) => doInsert(html, null)).catch(() => {});
            return;
          }
        }
        // No HTML item — fall through to plain text
        navigator.clipboard.readText().then((text) => doInsert(null, text)).catch(() => {});
      }).catch(() => {
        // read() denied → try readText() as fallback
        navigator.clipboard.readText().then((text) => doInsert(null, text)).catch(() => {});
      });
    } else if (typeof navigator.clipboard.readText === 'function') {
      navigator.clipboard.readText().then((text) => doInsert(null, text)).catch(() => {});
    }
  } },
  { separator: true },
  { name: 'bold', quick: true,      label: 'Bold',         icon: ICONS.bold,      action: (ctx) => ctx.invoke('editor.bold') },
  { name: 'italic', quick: true,    label: 'Italic',       icon: ICONS.italic,    action: (ctx) => ctx.invoke('editor.italic') },
  { name: 'underline', quick: true, label: 'Underline',    icon: ICONS.underline, action: (ctx) => ctx.invoke('editor.underline') },
  { separator: true },
  { name: 'textColor',      label: 'Text Color',      icon: ICONS.textColor,      colorStrip: 'foreColor',  navigate: makeColorSubItems('foreColor') },
  { name: 'highlightColor', label: 'Highlight Color', icon: ICONS.highlightColor, colorStrip: 'hiliteColor', navigate: makeColorSubItems('hiliteColor') },
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
    this.options = context.options;
    this._items = this.options.contextMenu?.items || defaultItems;
    this.el = null;
    this._disposers = [];
    this._menuDisposers = []; // disposers for dynamically-rendered menu buttons
    this._lastX = 0;
    this._lastY = 0;
    this._copiedFormat = null;
    this._savedRange = null;
    /** @type {{ left: number, top: number, bottom: number }|null} line the open menu keeps clear of */
    this._avoid = null;
  }

  initialize() {
    this.el = createElement('div', { class: 'an-contextmenu', role: 'menu', 'aria-hidden': 'true' });
    this.el.style.display = 'none';
    portalOf(this.context).appendChild(this.el);

    this._renderItems(this._items);

    const editable = this.context.layoutInfo?.editable;
    if (editable) {
      this._disposers.push(on(editable, 'contextmenu', (e) => this._onContextMenu(e)));
    }

    this._disposers.push(
      on(document, 'click', (e) => this._maybeHide(e)),
      on(document, 'keydown', (e) => { if (/** @type {KeyboardEvent} */ (e).key === 'Escape') this.hide(); }),
      on(this.el, 'keydown', (e) => this._onMenuKeydown(/** @type {KeyboardEvent} */ (e))),
      on(globalThis, 'scroll', () => this.hide(), { passive: true }),
    );

    return this;
  }

  destroy() {
    this._menuDisposers.forEach((d) => { try { d(); } catch (_e) { void _e; } });
    this._menuDisposers = [];
    this._disposers.forEach((d) => { try { d(); } catch (_e) { void _e; } });
    this._disposers = [];
    if (this.el) this.el.remove();
    this.el = null;
  }

  _renderItems(items) {
    // Clean up previously registered per-item listeners
    this._menuDisposers.forEach((d) => d());
    this._menuDisposers = [];

    if (!this.el) return;
    this.el.innerHTML = '';
    const compact = this._isCompact();
    this.el.classList.toggle('an-contextmenu--compact', compact);
    /** @type {HTMLElement|null} */
    let quickRow = null;

    items.forEach((it) => {
      if (it.separator || it.sep) {
        this.el.appendChild(createElement('div', { class: 'an-context-sep' }));
        return;
      }

      // Back-navigation header
      if (it.back) {
        const backBtn = createElement('button', { type: 'button', class: 'an-context-back', role: 'menuitem' });
        const iconSpan = createElement('span', { class: 'an-context-icon', 'aria-hidden': 'true' });
        setIcon(iconSpan, ICONS.back);
        backBtn.appendChild(iconSpan);
        const backLabel = (it.localeKey && this.context.locale.contextMenu[it.localeKey]) || it.label || this.context.locale.contextMenu.back || 'Back';
        backBtn.appendChild(createElement('span', { class: 'an-context-label' }, [backLabel]));
        const off = on(backBtn, 'click', (e) => {
          e.stopPropagation();
          const curLeft = Number.parseFloat(this.el.style.left);
          const curTop = Number.parseFloat(this.el.style.top);
          this._renderItems(it.navigate());
          this._reposition(curLeft, curTop);
          this._focusItem(0);
        });
        this._menuDisposers.push(off);
        this.el.appendChild(backBtn);
        return;
      }

      // Submenu-navigate item (shows ▶ chevron, re-renders without closing)
      if (it.navigate) {
        const btn = createElement('button', { type: 'button', class: 'an-context-item an-context-submenu', role: 'menuitem', 'aria-haspopup': 'menu', 'data-name': it.name || '' });
        if (it.icon) {
          if (it.colorStrip) {
            // Toolbar-style icon: SVG stacked above a colored strip
            const iconWrap = createElement('span', { class: 'an-context-icon an-context-icon--color', 'aria-hidden': 'true' });
            const svgSpan = createElement('span', { class: 'an-context-icon-svg' });
            setIcon(svgSpan, it.icon);
            const strip = createElement('span', { class: 'an-context-color-strip' });
            strip.style.background = this._getSelectionColor(it.colorStrip);
            iconWrap.appendChild(svgSpan);
            iconWrap.appendChild(strip);
            btn.appendChild(iconWrap);
          } else {
            const iconSpan = createElement('span', { class: 'an-context-icon', 'aria-hidden': 'true' });
            setIcon(iconSpan, it.icon);
            btn.appendChild(iconSpan);
          }
        }
        btn.appendChild(createElement('span', { class: 'an-context-label' }, [(this.context.locale.contextMenu[it.name] || it.label || it.name)]));
        const chevron = createElement('span', { class: 'an-context-chevron', 'aria-hidden': 'true' });
        setIcon(chevron, svgIcon(`<polyline points="9 18 15 12 9 6"/>`, 10, 2));
        btn.appendChild(chevron);
        const off = on(btn, 'click', (e) => {
          e.stopPropagation();
          const curLeft = Number.parseFloat(this.el.style.left);
          const curTop = Number.parseFloat(this.el.style.top);
          this._renderItems(it.navigate());
          this._reposition(curLeft, curTop);
          this._focusItem(0);
        });
        this._menuDisposers.push(off);
        this.el.appendChild(btn);
        return;
      }

      // Color palette item — renders inline color swatches
      if (it.colorPalette) {
        const palette = createElement('div', { class: 'an-context-color-palette' });
        resolvePalette(this.options).forEach((color) => {
          const sw = createElement('button', {
            type: 'button',
            class: 'an-context-color-swatch',
            title: color,
            'aria-label': color,
          });
          sw.style.background = color;
          const offSw = on(sw, 'click', (e) => { e.stopPropagation(); this._applyColor(it.colorType, color); });
          this._menuDisposers.push(offSw);
          palette.appendChild(sw);
        });
        if (it.colorType === 'hiliteColor') {
          const noColor = createElement('button', {
            type: 'button',
            class: 'an-context-color-swatch an-context-color-none',
            title: this.context.locale.contextMenu.noHighlight || 'No highlight',
            'aria-label': this.context.locale.contextMenu.noHighlight || 'No highlight',
          });
          setIcon(noColor, ICONS.noColor);
          const offNo = on(noColor, 'click', (e) => { e.stopPropagation(); this._applyColor('hiliteColor', 'transparent'); });
          this._menuDisposers.push(offNo);
          palette.appendChild(noColor);
        }
        this.el.appendChild(palette);

        // Custom color row
        const customRow = createElement('div', { class: 'an-context-color-custom' });
        const colorInput = /** @type {HTMLInputElement} */ (createElement('input', {
          type: 'color',
          value: it.colorType === 'foreColor' ? '#000000' : '#ffff00',
          title: this.context.locale.contextMenu.customColor || 'Custom color',
          'aria-label': this.context.locale.contextMenu.customColor || 'Custom color',
        }));
        const customLabel = createElement('span', {}, [this.context.locale.contextMenu.customColorLabel || 'Custom…']);
        const offCustom = on(colorInput, 'change', () => this._applyColor(it.colorType, colorInput.value));
        this._menuDisposers.push(offCustom);
        customRow.appendChild(colorInput);
        customRow.appendChild(customLabel);
        this.el.appendChild(customRow);
        return;
      }

      // Table grid picker item — expands an inline grid panel when clicked
      if (it.tableGrid) {
        const GRID_ROWS = 8, GRID_COLS = 8;
        const wrapper = createElement('div', { class: 'an-context-table-wrap' });

        const headerBtn = createElement('button', { type: 'button', class: 'an-context-item an-context-submenu', role: 'menuitem', 'aria-expanded': 'false', 'data-name': it.name || 'table' });
        if (it.icon) {
          const iconSpan = createElement('span', { class: 'an-context-icon', 'aria-hidden': 'true' });
          setIcon(iconSpan, it.icon);
          headerBtn.appendChild(iconSpan);
        }
        headerBtn.appendChild(createElement('span', { class: 'an-context-label' }, [this.context.locale.contextMenu.table || it.label || 'Insert Table']));
        const chevron = createElement('span', { class: 'an-context-chevron', 'aria-hidden': 'true' });
        setIcon(chevron, svgIcon(`<polyline points="9 18 15 12 9 6"/>`, 10, 2));
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
          labelEl.textContent = (rows && cols) ? `${rows} × ${cols}` : (this.context.locale.contextMenu.table || 'Insert Table');
        };

        panel.appendChild(gridEl);
        panel.appendChild(labelEl);

        let expanded = false;
        const offHeader = on(headerBtn, 'click', (e) => {
          e.stopPropagation();
          expanded = !expanded;
          panel.style.display = expanded ? '' : 'none';
          headerBtn.setAttribute('aria-expanded', String(expanded));
          chevron.style.transform = expanded ? 'rotate(90deg)' : '';
          this._reposition();
        });
        this._menuDisposers.push(offHeader);

        const offMove = on(gridEl, 'mousemove', (e) => {
          const cell = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target)?.closest('[data-row]'));
          if (!cell) return;
          setHighlight(+cell.dataset.row, +cell.dataset.col);
        });
        const offLeave = on(gridEl, 'mouseleave', () => setHighlight(0, 0));
        const offClick = on(gridEl, 'click', (e) => {
          const cell = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target)?.closest('[data-row]'));
          if (!cell) return;
          const rows = +cell.dataset.row;
          const cols = +cell.dataset.col;
          const editable = this.context.layoutInfo?.editable;
          if (editable && this._savedRange) {
            editable.focus();
            const sel = globalThis.getSelection();
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

      // Regular item. On small screens the `quick` items (clipboard and
      // bold/italic/underline) share one row of icon buttons at the top.
      const label = this.context.locale.contextMenu[it.name] || it.label || it.name;
      const inQuickRow = compact && it.quick && it.icon;
      if (inQuickRow && !quickRow) {
        quickRow = createElement('div', { class: 'an-context-quick', role: 'group' });
        this.el.prepend(quickRow);
      }
      const btn = createElement('button', {
        type: 'button',
        class: inQuickRow ? 'an-context-item an-context-item--icon' : 'an-context-item',
        role: 'menuitem',
        'data-name': it.name || '',
        ...(inQuickRow ? { 'aria-label': label, title: label } : {}),
      });
      if (typeof it.disabled === 'function' ? it.disabled(this.context) : !!it.disabled) /** @type {HTMLButtonElement} */ (btn).disabled = true;
      if (it.icon) {
        const iconSpan = createElement('span', { class: 'an-context-icon', 'aria-hidden': 'true' });
        setIcon(iconSpan, it.icon);
        btn.appendChild(iconSpan);
      }
      if (!inQuickRow) btn.appendChild(createElement('span', { class: 'an-context-label' }, [label]));
      const off = on(btn, 'click', (e) => {
        e.stopPropagation();
        // Disabled items stay hoverable (cursor: not-allowed), so guard here too
        if (/** @type {HTMLButtonElement} */ (btn).disabled) return;
        this.hide();
        if (this.context.triggerEvent?.('beforeCommand', { name: it.name, source: 'contextMenu' }) === false) return;
        try { it.action(this.context); } catch (err) { console.error(err); }
      });
      this._menuDisposers.push(off);
      (inQuickRow ? quickRow : this.el).appendChild(btn);
    });

    // Moving items into the quick row can leave separators at the start, at
    // the end or next to each other.
    if (quickRow) {
      let prevSep = true;
      for (const child of [...this.el.children]) {
        if (child === quickRow) continue;
        const isSep = child.classList.contains('an-context-sep');
        if (isSep && prevSep) child.remove();
        prevSep = isSep;
      }
      const last = this.el.lastElementChild;
      if (last?.classList.contains('an-context-sep')) last.remove();
    }
  }

  /** Small screens and touch: a shorter menu with a row of icon buttons. */
  _isCompact() {
    return !!globalThis.matchMedia?.('(max-width: 640px), (pointer: coarse)').matches;
  }

  /**
   * The line of text the menu must not cover: the line of the selection or
   * caret nearest the click, or the click's own line when the caret is
   * somewhere else. For the keyboard menu key (no pointer position) it is
   * the caret's line.
   * @param {MouseEvent} event
   * @returns {{ left: number, top: number, bottom: number }}
   */
  _avoidRect(event) {
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    const y = event.clientY;
    const pointerLine = { left: event.clientX, top: y - 10, bottom: y + 10 };
    const range = this._savedRange;
    if (!range) return pointerLine;
    let rects = [];
    try { rects = Array.from(range.getClientRects()).filter((r) => r.height > 0); } catch (_) { void _; }
    if (!rects.length) {
      try {
        const r = range.getBoundingClientRect();
        if (r.height > 0) rects = [r];
      } catch (_) { void _; }
    }
    if (!rects.length) {
      // An empty block (only a <br>) gives no rects: use the block's first line.
      const node = range.startContainer;
      const el = /** @type {Element|null} */ (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
      const r = el?.getBoundingClientRect();
      if (r && r.height > 0) {
        const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 20;
        rects = [{ left: r.left, top: r.top, bottom: Math.min(r.bottom, r.top + lineHeight) }];
      }
    }
    if (!rects.length) return pointerLine;
    if (fromKeyboard) {
      const last = rects[rects.length - 1];
      return { left: last.left, top: last.top, bottom: last.bottom };
    }
    const distance = (r) => (y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0);
    const nearest = rects.reduce((a, b) => (distance(b) < distance(a) ? b : a));
    if (distance(nearest) > 30) {
      // A selection stays visible wherever the click was; a caret far from
      // the click is not what the user is looking at.
      return range.collapsed ? pointerLine : { left: event.clientX, top: nearest.top, bottom: nearest.bottom };
    }
    return { left: event.clientX, top: Math.min(nearest.top, pointerLine.top), bottom: Math.max(nearest.bottom, pointerLine.bottom) };
  }

  _onContextMenu(event) {
    const editable = this.context.layoutInfo?.editable;
    if (!editable) return;
    if (!editable.contains(event.target)) return;
    if (this.context.layoutInfo.container.classList.contains('an-disabled')) return;
    event.preventDefault();

    const winSel = globalThis.getSelection();
    this._savedRange = (winSel?.rangeCount > 0) ? winSel.getRangeAt(0).cloneRange() : null;
    this._renderItems(this._items);

    // Open next to the line being worked on rather than over it: below the
    // caret or selection line, or above it when there is no room below.
    const avoid = this._avoidRect(event);
    this._lastX = avoid.left;
    this._lastY = avoid.bottom;
    this.showAt(avoid.left, avoid.bottom, avoid);
  }

  _maybeHide(event) {
    if (!this.el) return;
    if (!this.el.contains(event.target)) this.hide();
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {{ left: number, top: number, bottom: number }|null} [avoid] - a line the menu must not cover
   */
  showAt(x, y, avoid = null) {
    if (!this.el) return;
    this._avoid = avoid;
    this.el.style.display = 'block';
    this._reposition(x, y);
    this.el.setAttribute('aria-hidden', 'false');
    this._focusItem(0);
    this.context.triggerEvent('contextMenu:show');
  }

  /** Enabled, visible menu items in DOM order — the roving-focus targets. */
  _menuItems() {
    if (!this.el) return [];
    return /** @type {HTMLButtonElement[]} */ (Array.from(this.el.querySelectorAll('[role="menuitem"]')))
      .filter((el) => !el.disabled);
  }

  /** @param {number} index  Item index; negative counts from the end. */
  _focusItem(index) {
    const items = this._menuItems();
    items.at(index)?.focus({ preventScroll: true });
  }

  /** ArrowDown/ArrowUp/Home/End move focus among the enabled items. */
  _onMenuKeydown(event) {
    const items = this._menuItems();
    if (!items.length) return;
    const current = items.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));
    let next;
    switch (event.key) {
      case 'ArrowDown': next = current < 0 ? 0 : (current + 1) % items.length; break;
      case 'ArrowUp':   next = current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length; break;
      case 'Home':      next = 0; break;
      case 'End':       next = items.length - 1; break;
      default: return;
    }
    event.preventDefault();
    items[next].focus({ preventScroll: true });
  }

  /**
   * Places the menu at (x, y), its top-left corner, kept inside the viewport.
   * After a right-click it stays clear of the line in `this._avoid`: below
   * it, above it, or (when neither side has room for the whole menu) on the
   * roomier side with its height capped so it scrolls.
   * @param {number} [x]
   * @param {number} [y]
   */
  _reposition(x, y) {
    if (!this.el) return;
    const margin = 8;
    const gap = 6;
    const vw = globalThis.innerWidth;
    const vh = globalThis.innerHeight;
    const rx = x === undefined ? this._lastX : x;
    const ry = y === undefined ? this._lastY : y;
    this.el.style.maxHeight = '';
    const w = this.el.offsetWidth;
    let h = this.el.offsetHeight;
    let top = ry;
    const avoid = this._avoid;
    if (avoid) {
      const below = vh - (avoid.bottom + gap) - margin;
      const above = avoid.top - gap - margin;
      if (h <= below) top = avoid.bottom + gap;
      else if (h <= above) top = avoid.top - gap - h;
      else if (Math.max(below, above) >= 160) {
        if (below >= above) {
          top = avoid.bottom + gap;
          this.el.style.maxHeight = `${below}px`;
        } else {
          h = above;
          this.el.style.maxHeight = `${above}px`;
          top = avoid.top - gap - h;
        }
      } else {
        // No room on either side: covering the line cannot be helped.
        this.el.style.maxHeight = `${vh - 2 * margin}px`;
        h = Math.min(h, vh - 2 * margin);
        top = Math.min(Math.max(margin, ry), vh - h - margin);
      }
    } else {
      if (h > vh - 2 * margin) {
        this.el.style.maxHeight = `${vh - 2 * margin}px`;
        h = vh - 2 * margin;
      }
      if (top + h > vh - margin) top = vh - h - margin;
    }
    let left = rx;
    if (left + w > vw - margin) left = vw - w - margin;
    if (left < margin) left = margin;
    if (top < margin) top = margin;
    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }

  hide() {
    if (!this.el) return;
    // Focus left inside the menu would be stranded once it hides: return it to
    // the editable with the selection the menu was opened on.
    const hadFocus = this.el.contains(document.activeElement);
    this.el.style.display = 'none';
    this.el.setAttribute('aria-hidden', 'true');
    if (hadFocus) this._focusEditable();
    this.context.triggerEvent('contextMenu:hide');
  }

  // ---------------------------------------------------------------------------
  // Format operations (Copy Format / Paste Format / Remove Format)
  // ---------------------------------------------------------------------------

  /** Read the current selection's text or highlight color for the strip.
   * @param {'foreColor'|'hiliteColor'} type
   * @returns {string} CSS color string
   */
  _getSelectionColor(type) {
    const range = this._savedRange;
    if (!range) return type === 'foreColor' ? '#000000' : 'transparent';
    let node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node) return type === 'foreColor' ? '#000000' : 'transparent';
    const cs = globalThis.getComputedStyle(/** @type {Element} */ (node));
    if (type === 'foreColor') {
      return cs.color || '#000000';
    }
    const bg = cs.backgroundColor;
    return (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') ? 'transparent' : bg;
  }

  _focusEditable() {
    const editable = this.context.layoutInfo?.editable;
    if (!editable) return;
    editable.focus({ preventScroll: true });
    if (this._savedRange && editable.contains(this._savedRange.commonAncestorContainer)) {
      const sel = globalThis.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(this._savedRange.cloneRange());
    }
  }

  /** Restore selection, apply a color command, then hide the menu. */
  _applyColor(type, color) {
    const editable = this.context.layoutInfo?.editable;
    if (!editable || !this._savedRange) return;
    editable.focus();
    const sel = globalThis.getSelection();
    sel.removeAllRanges();
    sel.addRange(this._savedRange.cloneRange());
    Style.applyStyle(type === 'foreColor' ? 'color' : 'background-color', color, editable);
    this.context.invoke('editor.afterCommand');
    this.hide();
  }

  /** Returns true if a format has been copied — used to disable Paste Format. */
  hasCopiedFormat() { return !!this._copiedFormat; }

  /** Snapshot inline styles at the selection anchor node. */
  copyFormat() {
    const range = this._savedRange;
    if (!range) return;
    const editable = this.context.layoutInfo?.editable;
    let node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node || !editable?.contains(node)) return;

    // Walk up to collect explicitly-set inline properties from the nearest styled ancestor
    const cs = globalThis.getComputedStyle(/** @type {Element} */ (node));

    // Detect if an explicit font-family / font-size is set on an element (not just inherited)
    const explicitFontFamily = this._findExplicitStyle(node, editable, 'fontFamily');
    const explicitFontSize   = this._findExplicitStyle(node, editable, 'fontSize');

    this._copiedFormat = {
      bold:            Number.parseInt(cs.fontWeight, 10) >= 700,
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
      if (el.style?.[prop]) return el.style[prop];
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
    const editable = this.context.layoutInfo?.editable;
    if (!editable) return;

    // CRITICAL: focus the editable FIRST, then restore selection.
    // Calling focus() after addRange() can wipe the selection in Chrome/Firefox.
    editable.focus();
    const sel = globalThis.getSelection();
    sel.removeAllRanges();
    sel.addRange(this._savedRange.cloneRange());

    // Start from a clean state, then set each copied format explicitly.
    Style.removeFormat(editable);
    for (const name of ['bold', 'italic', 'underline', 'strikethrough']) {
      if (fmt[name]) Style.setInline(name, true, editable);
    }

    if (fmt.color) Style.applyStyle('color', fmt.color, editable);

    const isTransparent = (c) => !c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
    if (!isTransparent(fmt.backgroundColor)) Style.applyStyle('background-color', fmt.backgroundColor, editable);
    if (fmt.fontFamily) Style.applyStyle('font-family', fmt.fontFamily, editable);
    if (fmt.fontSize) Style.applyStyle('font-size', fmt.fontSize, editable);

    this.context.invoke('editor.afterCommand');
  }

  /** Strip all inline formatting from the saved selection. */
  removeFormat() {
    if (!this._savedRange) return;
    const editable = this.context.layoutInfo?.editable;
    if (!editable) return;

    editable.focus();
    const sel = globalThis.getSelection();
    sel.removeAllRanges();
    sel.addRange(this._savedRange.cloneRange());

    Style.removeFormat(editable);

    const range = sel.getRangeAt(0);
    const root = range.commonAncestorContainer;
    const rootEl = root.nodeType === Node.TEXT_NODE ? root.parentElement : root;
    const iter = document.createNodeIterator(rootEl, NodeFilter.SHOW_ELEMENT);
    let el;
    while ((el = iter.nextNode())) {
      if (!editable.contains(el) || el === editable) continue;
      try { if (range.intersectsNode(el)) /** @type {Element} */ (el).removeAttribute('style'); } catch { /* ignore */ }
    }

    this.context.invoke('editor.afterCommand');
  }
}

export default ContextMenu;
