/**
 * Toolbar.js - Builds and manages the editor toolbar UI
 * Inspired by Summernote's Toolbar module — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';

// Module-level cache for FontAwesome detection.
// Evaluated once per page load so all Toolbar instances on the same page agree
// on whether the HOST PAGE included FA — regardless of whether IconDialog later
// auto-injects its own FA <link> for the icon-picker glyph rendering.
let _faPageLevelReady = null;

// ---------------------------------------------------------------------------
// Module-level icon lookup tables — built once, shared across all instances.
// Previously these were re-created inside _createButton() on every button
// render, producing O(buttons × map-size) allocations per toolbar init.
// ---------------------------------------------------------------------------
const _S = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const _svgWrap = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${_S} style="display:block">${paths}</svg>`;

const _SVG_MAP = new Map([
  // Format
  ['bold',          _svgWrap('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>')],
  ['italic',        _svgWrap('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>')],
  ['underline',     _svgWrap('<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>')],
  ['strikethrough', _svgWrap('<path d="M17.3 12H6.7"/><path d="M10 6.5C10 5.1 11.1 4 12.5 4c1.4 0 2.5 1.1 2.5 2.5 0 .8-.4 1.5-1 2"/><path d="M14 17.5C14 19 12.9 20 11.5 20 10.1 20 9 18.9 9 17.5c0-.8.4-1.5 1-2"/>')],
  ['superscript',   _svgWrap('<path d="m4 19 8-8"/><path d="m12 19-8-8"/><path d="M20 12h-4c0-1.5.44-2 1.5-2.5S20 8.33 20 7.25C20 6 19 5 17.5 5S15 6 15 7"/>')],
  ['subscript',     _svgWrap('<path d="m4 5 8 8"/><path d="m12 5-8 8"/><path d="M20 21h-4c0-1.5.44-2 1.5-2.5S20 17.33 20 16.25C20 15 19 14 17.5 14S15 15 15 16"/>')],
  // Alignment
  ['align-left',    _svgWrap('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>')],
  ['align-center',  _svgWrap('<line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
  ['align-right',   _svgWrap('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>')],
  ['align-justify', _svgWrap('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
  // Lists
  ['list-ul',       _svgWrap('<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>')],
  ['list-ol',       _svgWrap('<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1V3"/><path d="M4 10h2l-2 2h2"/><path d="M4 16.5A1.5 1.5 0 0 1 5.5 15a1.5 1.5 0 0 1 0 3H4"/>')],
  ['indent',        _svgWrap('<polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
  ['outdent',       _svgWrap('<polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
  // History
  ['undo',          _svgWrap('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>')],
  ['redo',          _svgWrap('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>')],
  // Insert
  ['minus',         _svgWrap('<line x1="5" y1="12" x2="19" y2="12"/>')],
  ['link',          _svgWrap('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>')],
  ['image',         _svgWrap('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>')],
  ['video',         _svgWrap('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>')],
  ['table',         _svgWrap('<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>')],
  ['emoji',         _svgWrap('<circle cx="12" cy="12" r="10"/><path d="M8.5 14.5s1.5 2.5 3.5 2.5 3.5-2.5 3.5-2.5"/><circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none"/>')],
  ['icon',          _svgWrap('<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><rect x="5" y="13" width="6" height="6" rx="1"/><rect x="13" y="13" width="6" height="6" rx="1"/>')],
  // View
  ['code',          _svgWrap('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
  ['expand',        _svgWrap('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')],
  // Color pickers
  ['foreColor',     _svgWrap('<path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/>')],
  ['backColor',     _svgWrap('<path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/>')],
  ['keyboard',      _svgWrap('<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="10" stroke-width="2.5"/><line x1="10" y1="10" x2="10" y2="10" stroke-width="2.5"/><line x1="14" y1="10" x2="14" y2="10" stroke-width="2.5"/><line x1="18" y1="10" x2="18" y2="10" stroke-width="2.5"/><line x1="8" y1="14" x2="16" y2="14" stroke-width="2"/>')],
  ['caption',       _svgWrap('<rect x="3" y="3" width="18" height="11" rx="2"/><line x1="6" y1="18" x2="18" y2="18"/><line x1="9" y1="21" x2="15" y2="21"/>')],
  ['remove-format', _svgWrap('<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>')],
  ['direction',     _svgWrap('<path d="M12 20V4"/><path d="m9 7-3 3 3 3"/><path d="M4 10h8"/><path d="m15 7 3 3-3 3"/><path d="M20 10h-8"/>')],
  ['search',        _svgWrap('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>')],
  ['find-replace',  _svgWrap('<circle cx="10" cy="10" r="6"/><line x1="18" y1="18" x2="14.35" y2="14.35"/><path d="M16 19h6"/><path d="M19 16v6"/>')],
  ['inline-code',   _svgWrap('<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v5c0 1.1.9 2 2 2a2 2 0 0 1-2 2v5a2 2 0 0 1-2 2h-1"/>')],
  ['checklist',     _svgWrap('<rect x="3" y="4" width="5" height="5" rx="1"/><path d="m4 6.5 1 1 2-2"/><rect x="3" y="13" width="5" height="5" rx="1"/><line x1="10" y1="6.5" x2="21" y2="6.5"/><line x1="10" y1="15.5" x2="21" y2="15.5"/>')],
  ['print',         _svgWrap('<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>')],
]);

const _FA_MAP = new Map([
  ['bold',          'fa-bold'],
  ['italic',        'fa-italic'],
  ['underline',     'fa-underline'],
  ['strikethrough', 'fa-strikethrough'],
  ['superscript',   'fa-superscript'],
  ['subscript',     'fa-subscript'],
  ['align-left',    'fa-align-left'],
  ['align-center',  'fa-align-center'],
  ['align-right',   'fa-align-right'],
  ['align-justify', 'fa-align-justify'],
  ['list-ul',       'fa-list-ul'],
  ['list-ol',       'fa-list-ol'],
  ['indent',        'fa-indent'],
  ['outdent',       'fa-outdent'],
  ['undo',          'fa-rotate-left'],
  ['redo',          'fa-rotate-right'],
  ['minus',         'fa-minus'],
  ['link',          'fa-link'],
  ['image',         'fa-image'],
  ['code',          'fa-code'],
  ['expand',        'fa-expand'],
  ['emoji',         'fa-face-smile'],
  ['icon',          'fa-icons'],
  ['foreColor',     'fa-font'],
  ['backColor',     'fa-highlighter'],
  ['keyboard',      'fa-keyboard'],
  ['remove-format', 'fa-remove-format'],
  ['direction',     'fa-arrow-right-arrow-left'],
  ['search',        'fa-magnifying-glass'],
  ['find-replace',  'fa-magnifying-glass-plus'],
  ['inline-code',   'fa-code'],
  ['checklist',     'fa-list-check'],
  ['print',         'fa-print'],
]);

export class Toolbar {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    /** @type {HTMLElement|null} */
    this.el = null;
    /** @type {Array<() => void>} disposers */
    this._disposers = [];
    /** @type {Array<() => void>} closers for all open color picker popups */
    this._colorPickerClosers = [];
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this.el = createElement('div', { class: 'an-toolbar' });
    // Detect FontAwesome once at toolbar build time to avoid re-querying the DOM
    // for every button rendered.
    this._faReady = this._detectFontAwesome();
    this._buildButtons();
    this._btnMap = new Map((this.options.toolbar || []).flat().map((b) => [b.name, b]));
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  _buildButtons() {
    const toolbar = this.options.toolbar || [];
    // Build into a DocumentFragment so all groups are appended in a single
    // DOM operation, avoiding one reflow per group.
    const fragment = document.createDocumentFragment();
    toolbar.forEach((group) => {
      const groupEl = createElement('div', { class: 'an-btn-group' });
      group.forEach((btnDef) => {
        let el;
        if (btnDef.type === 'select') el = this._createSelect(btnDef);
        else if (btnDef.type === 'grid') el = this._createGridPicker(btnDef);
        else if (btnDef.type === 'colorpicker') el = this._createColorPicker(btnDef);
        else el = this._createButton(btnDef);
        groupEl.appendChild(el);
      });
      fragment.appendChild(groupEl);
    });
    this.el.appendChild(fragment);
  }

  /**
   * Creates a table-grid picker button with a hoverable row/col selector popup.
   * @param {import('./Buttons.js').ButtonDef} def
   * @returns {HTMLDivElement}
   */
  _createGridPicker(def) {
    const ROWS = 10;
    const COLS = 10;

    const wrap = createElement('div', { class: 'an-table-picker-wrap' });

    const useBootstrap = !!this.options.useBootstrap;
    const baseClass = useBootstrap
      ? (this.options.toolbarButtonClass || 'btn btn-sm btn-light')
      : 'an-btn';
    const btn = createElement('button', {
      type: 'button',
      class: baseClass,
      title: def.tooltip || '',
      'data-btn': def.name,
      'aria-label': def.tooltip || def.name,
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    });

    // Set icon — inline SVG (table) with optional FontAwesome fallback
    if (this._faReady) {
      const faPrefix = this.options.fontAwesomeClass || 'fas';
      btn.innerHTML = `<i class="${faPrefix} fa-table" aria-hidden="true"></i>`;
    } else {
      const S = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${S} style="display:block"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`;
    }

    // Popup
    const popup = createElement('div', {
      class: 'an-table-picker-popup',
      role: 'dialog',
      'aria-label': 'Select table size',
    });
    const grid = createElement('div', { class: 'an-table-grid' });
    const label = createElement('div', { class: 'an-table-label' });
    label.textContent = 'Insert Table';

    const cells = [];
    for (let r = 1; r <= ROWS; r++) {
      for (let c = 1; c <= COLS; c++) {
        const cell = createElement('div', {
          class: 'an-table-cell',
          'data-row': String(r),
          'data-col': String(c),
        });
        cells.push(cell);
        grid.appendChild(cell);
      }
    }

    popup.appendChild(grid);
    popup.appendChild(label);

    let isOpen = false;

    const setHighlight = (rows, cols) => {
      cells.forEach((cell) => {
        const r = +cell.getAttribute('data-row');
        const c = +cell.getAttribute('data-col');
        cell.classList.toggle('active', r <= rows && c <= cols);
      });
      label.textContent = (rows && cols) ? `${rows} × ${cols}` : 'Insert Table';
    };

    const openPopup = () => {
      isOpen = true;
      popup.style.display = 'block';
      btn.setAttribute('aria-expanded', 'true');
    };

    const closePopup = () => {
      isOpen = false;
      popup.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      setHighlight(0, 0);
    };

    const d1 = on(btn, 'click', (e) => {
      e.stopPropagation();
      if (isOpen) closePopup(); else openPopup();
    });

    const d2 = on(grid, 'mouseover', (e) => {
      const cell = e.target.closest('.an-table-cell');
      if (!cell) return;
      setHighlight(+cell.getAttribute('data-row'), +cell.getAttribute('data-col'));
    });

    const d3 = on(grid, 'mouseleave', () => setHighlight(0, 0));

    const d4 = on(grid, 'click', (e) => {
      const cell = e.target.closest('.an-table-cell');
      if (!cell) return;
      const rows = +cell.getAttribute('data-row');
      const cols = +cell.getAttribute('data-col');
      closePopup();
      this.context.invoke('editor.focus');
      def.action(this.context, rows, cols);
    });

    const d5 = on(document, 'click', () => { if (isOpen) closePopup(); });

    this._disposers.push(d1, d2, d3, d4, d5);

    wrap.appendChild(btn);
    wrap.appendChild(popup);
    return wrap;
  }

  /**
   * Creates a split color-picker widget:
   *   [icon + strip | ▾] — left applies current color, right opens swatch popup.
   * @param {{ name: string, type: 'colorpicker', tooltip: string, defaultColor: string, action: Function }} def
   * @returns {HTMLDivElement}
   */
  _createColorPicker(def) {
    const PRESETS = [
      // Grayscale
      '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#efefef', '#ffffff',
      // Saturated
      '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#9900ff', '#ff00ff',
      // Pastel
      '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#d9d2e9', '#ead1dc',
    ];

    let currentColor = def.defaultColor || '#000000';

    const wrap = createElement('div', { class: 'an-color-picker-wrap' });

    const useBootstrap = !!this.options.useBootstrap;
    const baseClass = useBootstrap ? (this.options.toolbarButtonClass || 'btn btn-sm btn-light') : 'an-btn';

    // ---- Apply button (icon + color strip) ----
    const applyBtn = createElement('button', {
      type: 'button',
      class: `${baseClass} an-color-btn`,
      title: def.tooltip || '',
      'data-btn': def.name,
      'aria-label': def.tooltip || def.name,
    });

    const S = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const iconSvg = def.name === 'foreColor'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${S} style="display:block"><path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${S} style="display:block"><path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/></svg>`;

    applyBtn.innerHTML = iconSvg;
    const strip = createElement('span', { class: 'an-color-strip' });
    strip.style.background = currentColor;
    applyBtn.appendChild(strip);

    // ---- Arrow button (open popup) ----
    const arrowBtn = createElement('button', {
      type: 'button',
      class: `${baseClass} an-color-arrow`,
      title: `Choose ${def.name === 'foreColor' ? 'text' : 'highlight'} color`,
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    });
    arrowBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:block"><path d="M7 10l5 5 5-5H7z"/></svg>`;

    // ---- Popup ----
    const popup = createElement('div', { class: 'an-color-popup' });
    popup.style.display = 'none';

    const swatches = createElement('div', { class: 'an-color-swatches' });
    const userSwatches = Array.isArray(this.options.colorSwatches) ? this.options.colorSwatches : [];
    const allColors = [...new Set([...userSwatches, ...PRESETS])];
    allColors.forEach((color) => {
      const sw = createElement('div', { class: 'an-color-swatch', title: color, 'data-color': color });
      sw.style.background = color;
      swatches.appendChild(sw);
    });

    const customRow = createElement('div', { class: 'an-color-custom' });
    const colorInput = createElement('input', { type: 'color', value: currentColor, title: 'Custom color' });
    const customLabel = createElement('span', {}, ['Custom color']);
    customRow.appendChild(colorInput);
    customRow.appendChild(customLabel);

    popup.appendChild(swatches);
    popup.appendChild(customRow);

    // ---- State ----
    let isOpen = false;
    /** @type {Range|null} saved selection range before popup opens */
    let savedRange = null;

    const saveSelection = () => {
      const sel = window.getSelection();
      savedRange = (sel && sel.rangeCount) ? sel.getRangeAt(0).cloneRange() : null;
    };

    const restoreSelection = () => {
      if (!savedRange) return;
      try {
        const sel = window.getSelection();
        if (!sel) return;
        sel.removeAllRanges();
        sel.addRange(savedRange);
      } catch (_) {
        // Range target may be detached if DOM changed while popup was open
      }
    };

    const openPopup = () => {
      // Close any other open color picker before opening this one
      this._colorPickerClosers.forEach((fn) => { if (fn !== closePopup) fn(); });
      saveSelection();
      isOpen = true;
      // Use fixed positioning so the popup escapes any overflow-clipping ancestor
      // (notably toolbar scroll mode, where overflow-x:auto coerces overflow-y)
      const rect = arrowBtn.getBoundingClientRect();
      const popupMinW = 184;
      let left = rect.left;
      if (left + popupMinW > window.innerWidth) left = rect.right - popupMinW;
      popup.style.top  = `${rect.bottom + 4}px`;
      popup.style.left = `${Math.max(4, left)}px`;
      popup.style.display = 'block';
      arrowBtn.setAttribute('aria-expanded', 'true');
    };

    const closePopup = () => {
      isOpen = false;
      popup.style.display = 'none';
      popup.style.top  = '';
      popup.style.left = '';
      arrowBtn.setAttribute('aria-expanded', 'false');
    };

    const applyColor = (color) => {
      currentColor = color;
      strip.style.background = color;
      colorInput.value = color;
      restoreSelection();
      def.action(this.context, color);
      this.context.invoke('editor.afterCommand');
      closePopup();
    };

    const d1 = on(applyBtn, 'click', (e) => {
      e.preventDefault();
      restoreSelection();
      def.action(this.context, currentColor);
      this.context.invoke('editor.afterCommand');
    });

    const d2 = on(arrowBtn, 'mousedown', (e) => {
      // Prevent editor blur so selection is preserved when the popup opens
      e.preventDefault();
    });

    const d2b = on(arrowBtn, 'click', (e) => {
      e.stopPropagation();
      if (isOpen) closePopup(); else openPopup();
    });

    const d3 = on(swatches, 'mousedown', (e) => {
      // Prevent blur before the click handler fires
      e.preventDefault();
    });

    const d3b = on(swatches, 'click', (e) => {
      const sw = e.target.closest('.an-color-swatch');
      if (sw) applyColor(sw.dataset.color);
    });

    const d4 = on(colorInput, 'change', (e) => {
      applyColor(e.target.value);
    });

    const d5 = on(document, 'click', (e) => {
      // popup is in document.body, not inside wrap — check both
      if (isOpen && !wrap.contains(e.target) && !popup.contains(e.target)) closePopup();
    });

    const d6 = on(popup, 'click', (e) => e.stopPropagation());

    // Close the popup when the viewport scrolls or resizes so the fixed-position
    // popup doesn't drift away from the button it belongs to.
    const onScrollResize = () => { if (isOpen) closePopup(); };
    document.addEventListener('scroll', onScrollResize, { passive: true, capture: true });
    window.addEventListener('resize',   onScrollResize, { passive: true });

    this._disposers.push(d1, d2, d2b, d3, d3b, d4, d5, d6,
      () => document.removeEventListener('scroll', onScrollResize, { capture: true }),
      () => window.removeEventListener('resize',   onScrollResize),
      // Remove popup from body on editor destroy
      () => { if (popup.parentNode) popup.parentNode.removeChild(popup); },
    );

    // Register this popup's closer so other color pickers can close it
    this._colorPickerClosers.push(closePopup);
    this._disposers.push(() => {
      const idx = this._colorPickerClosers.indexOf(closePopup);
      if (idx !== -1) this._colorPickerClosers.splice(idx, 1);
    });

    // Append popup to document.body so it escapes all overflow-clipping and
    // contain:layout ancestors (contain:layout makes the container a fixed-pos
    // containing block per the CSS Contain spec, breaking viewport coordinates).
    wrap.appendChild(applyBtn);
    wrap.appendChild(arrowBtn);
    document.body.appendChild(popup);
    return wrap;
  }

  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(def) {
    const items = (def.name === 'fontFamily')
      ? (this.options.fontFamilies || [])
      : (def.items || []);

    const cls = def.selectClass ? `an-select ${def.selectClass}` : 'an-select';
    const select = createElement('select', {
      class: cls,
      title: def.tooltip || '',
      'data-btn': def.name,
      'aria-label': def.tooltip || def.name,
    });

    // Blank "placeholder" option (non-selectable header)
    const placeholderText = def.placeholder || 'Font';
    const placeholder = createElement('option', { value: '', disabled: '', hidden: '' }, [placeholderText]);
    select.appendChild(placeholder);

    items.forEach((item) => {
      const value    = (typeof item === 'object') ? item.value    : item;
      const label    = (typeof item === 'object') ? item.label    : item;
      const isHeader = (typeof item === 'object') && !!item.disabled;
      const attrs    = { value };
      if (isHeader) attrs.disabled = '';
      const opt = createElement('option', attrs, [label]);
      // Only apply fontFamily face preview on real (non-header) entries
      if (def.name === 'fontFamily' && !isHeader) opt.style.fontFamily = value;
      select.appendChild(opt);
    });

    const disposer = on(select, 'change', (e) => {
      const value = e.target.value;
      const selectedOpt = e.target.options[e.target.selectedIndex];
      if (!value || selectedOpt.disabled) return;
      this.context.invoke('editor.focus');
      def.action(this.context, value);
      this.context.invoke('editor.afterCommand');
    });

    this._disposers.push(disposer);
    return select;
  }

  /**
   * @param {import('./Buttons.js').ButtonDef} btnDef
   * @returns {HTMLButtonElement}
   */
  _createButton(btnDef) {
    // Determine classes based on whether the consumer wants Bootstrap styling
    const useBootstrap = !!this.options.useBootstrap;
    const baseClass = useBootstrap ? (this.options.toolbarButtonClass || 'btn btn-sm btn-light') : `an-btn`;
    const extra = btnDef.className ? ` ${btnDef.className}` : '';
    const classAttr = `${baseClass}${extra}`;

    const btn = createElement('button', {
      type: 'button',
      class: classAttr,
      title: btnDef.tooltip || '',
      'data-btn': btnDef.name,
      'aria-label': btnDef.tooltip || btnDef.name,
    });

    // Render icon: prefer FontAwesome if enabled; otherwise fall back to SVG or text.
    const faPrefix = this.options.fontAwesomeClass || 'fas';
    const useFaNow = this._faReady;
    if (useFaNow) {
      const faName = _FA_MAP.get(btnDef.icon) || _FA_MAP.get(btnDef.name) || null;
      if (faName) {
        btn.innerHTML = `<i class="${faPrefix} ${faName}" aria-hidden="true"></i>`;
      } else if (_SVG_MAP.has(btnDef.icon)) {
        btn.innerHTML = _SVG_MAP.get(btnDef.icon);
      } else {
        btn.textContent = btnDef.icon || btnDef.name;
      }
    } else {
      // FontAwesome absent: use SVG fallback when available
      if (_SVG_MAP.has(btnDef.icon)) {
        btn.innerHTML = _SVG_MAP.get(btnDef.icon);
      } else if (_SVG_MAP.has(btnDef.name)) {
        btn.innerHTML = _SVG_MAP.get(btnDef.name);
      } else {
        btn.textContent = btnDef.icon || btnDef.name;
      }
    }

    const disposer = on(btn, 'click', (event) => {
      event.preventDefault();
      // Restore focus to the editor before executing the action
      this.context.invoke('editor.focus');
      btnDef.action(this.context);
      this.context.invoke('editor.afterCommand');
      this.refresh();
    });

    this._disposers.push(disposer);
    return btn;
  }

  // ---------------------------------------------------------------------------
  // FontAwesome detection (run once at initialize time)
  // ---------------------------------------------------------------------------

  _detectFontAwesome() {
    if (!this.options.useFontAwesome) return false;
    // Return cached result when available. This ensures that a later-initialised
    // toolbar sees the same detection state as the first one — even if IconDialog
    // has since injected its own FA <link> into <head> for the icon-picker UI.
    if (_faPageLevelReady !== null) return _faPageLevelReady;
    if (document.querySelector('.fa, .fas, .far, .fal, .fab, .fa-solid')) {
      _faPageLevelReady = true;
      return true;
    }
    // Exclude the editor-self-injected link (id='an-fontawesome-css') so it doesn't
    // count as "the host page loaded FA" for toolbar icon rendering purposes.
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .filter((l) => l.id !== 'an-fontawesome-css')
      .map((l) => l.href || '').join(' ');
    _faPageLevelReady = /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(links);
    return _faPageLevelReady;
  }

  // ---------------------------------------------------------------------------
  // State refresh (active / disabled states)
  // ---------------------------------------------------------------------------

  refresh() {
    if (!this.el) return;
    const btnMap = this._btnMap || new Map();

    // Sync button active states
    this.el.querySelectorAll('button[data-btn]').forEach((btn) => {
      const def = btnMap.get(btn.getAttribute('data-btn'));
      if (def && typeof def.isActive === 'function') {
        btn.classList.toggle('active', !!def.isActive(this.context));
      }
      if (def && typeof def.isDisabled === 'function') {
        btn.disabled = !!def.isDisabled(this.context);
      }
    });

    // Sync select dropdowns (e.g. font family) with current cursor position
    this.el.querySelectorAll('select[data-btn]').forEach((select) => {
      const def = btnMap.get(select.getAttribute('data-btn'));
      if (!def || typeof def.getValue !== 'function') return;
      // queryCommandValue returns the font name, possibly quoted — strip quotes
      let raw = (def.getValue(this.context) || '').replace(/["']/g, '').trim();
      // Fallback: when no selection/font set, use the configured default font
      if (!raw) {
        raw = this.options.defaultFontFamily
          || (this.options.fontFamilies && this.options.fontFamilies[0])
          || '';
      }
      // Try to match against available options (case-insensitive)
      const matched = Array.from(select.options).find(
        (opt) => opt.value && opt.value.toLowerCase() === raw.toLowerCase()
      );
      select.value = matched ? matched.value : '';
    });
  }

  /**
   * Shows the toolbar.
   */
  show() {
    if (this.el) this.el.style.display = '';
  }

  /**
   * Hides the toolbar.
   */
  hide() {
    if (this.el) this.el.style.display = 'none';
  }
}
