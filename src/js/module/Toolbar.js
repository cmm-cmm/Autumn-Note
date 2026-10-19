/**
 * Toolbar.js - Builds and manages the editor toolbar UI
 * Inspired by Summernote's Toolbar module — rewritten without jQuery
 */

import { createElement, on, portalOf, setIcon, ICON_STROKE } from '../core/dom.js';
import { resolveButton, resolveIcon } from './Buttons.js';
import { resolvePalette } from '../core/palette.js';
import { PATHS } from '../core/icon-paths.js';

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
const _svgWrap = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${ICON_STROKE} style="display:block">${paths}</svg>`;

const _SVG_MAP = new Map([
  // Format
  ['bold',          _svgWrap(PATHS.bold)],
  ['italic',        _svgWrap(PATHS.italic)],
  ['underline',     _svgWrap(PATHS.underline)],
  ['strikethrough', _svgWrap(PATHS.strike)],
  ['superscript',   _svgWrap('<path d="M4 9l8 8M12 9l-8 8M15 5l1-1h3l1 1v1.5L15 10h5"/>')],
  ['subscript',     _svgWrap('<path d="M4 6l8 8M12 6l-8 8M15 15l1-1h3l1 1v1.5L15 20h5"/>')],
  // Alignment
  ['align-left',    _svgWrap(PATHS.alignLeft)],
  ['align-center',  _svgWrap(PATHS.alignCenter)],
  ['align-right',   _svgWrap(PATHS.alignRight)],
  ['align-justify', _svgWrap(PATHS.alignJustify)],
  // Lists: square bullets, chamfered numerals
  ['list-ul',       _svgWrap('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 5h2v2H4zM4 11h2v2H4zM4 17h2v2H4z" fill="currentColor" stroke="none"/>')],
  ['list-ol',       _svgWrap('<path d="M11 6h9M11 12h9M11 18h9M4.5 4.5 6 3.5V9M4 14.5l1-1h1.5l1 1v1L4 19.5h3.5"/>')],
  ['indent',        _svgWrap('<path d="M4 8l4 4-4 4M12 6h8M12 12h8M12 18h8"/>')],
  ['outdent',       _svgWrap('<path d="M8 8l-4 4 4 4M12 6h8M12 12h8M12 18h8"/>')],
  // History
  ['undo',          _svgWrap(PATHS.undo)],
  ['redo',          _svgWrap(PATHS.redo)],
  // Insert
  ['minus',         _svgWrap('<path d="M4 12h16"/>')],
  ['link',          _svgWrap(PATHS.link)],
  ['image',         _svgWrap(PATHS.image)],
  ['video',         _svgWrap(PATHS.video)],
  ['table',         _svgWrap(PATHS.table)],
  ['emoji',         _svgWrap('<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8zM8.5 14.5 10 16h4l1.5-1.5"/><path d="M8 8.5h2v2H8zM14 8.5h2v2h-2z" fill="currentColor" stroke="none"/>')],
  ['icon',          _svgWrap('<circle cx="7.5" cy="7.5" r="3.5"/><path d="M13.5 4h7v7h-7zM7.5 13.5l4 7h-8zM17 13l3.5 3.5L17 20l-3.5-3.5z"/>')],
  // View
  ['code',          _svgWrap('<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>')],
  ['expand',        _svgWrap(PATHS.expand)],
  // Color pickers
  ['foreColor',     _svgWrap(PATHS.foreColor)],
  ['backColor',     _svgWrap(PATHS.backColor)],
  ['keyboard',      _svgWrap('<path d="M2.5 6h19v12h-19zM7 14h10"/><path d="M5.5 9h2v2h-2zM9.5 9h2v2h-2zM13.5 9h2v2h-2zM17.5 9h1v2h-1z" fill="currentColor" stroke="none"/>')],
  ['caption',       _svgWrap(PATHS.caption)],
  ['remove-format', _svgWrap(PATHS.removeFormat)],
  ['direction',     _svgWrap('<path d="M12 3v18M10 8H4M6.5 5.5 4 8l2.5 2.5M14 16h6M17.5 13.5 20 16l-2.5 2.5"/>')],
  ['search',        _svgWrap('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20.5 20.5"/>')],
  ['find-replace',  _svgWrap('<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5l1.5 1.5M15 19.5h6M18 16.5v6"/>')],
  ['inline-code',   _svgWrap(PATHS.code)],
  ['checklist',     _svgWrap('<path d="M3 4h6v6H3zM3 14h6v6H3zM4.75 7.25 5.75 8.25 7.5 6.25M12 7h9M12 17h9"/>')],
  ['print',         _svgWrap('<path d="M7 9V3h10v6M7 18H3V9h18v9h-4M7 14h10v7H7z"/>')],
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

/** Built-in dropdowns whose list comes from an option (see settings.js). */
const SELECT_ITEM_OPTIONS = {
  fontFamily: 'fontFamilies',
  fontSize: 'fontSizes',
  lineHeight: 'lineHeights',
  paragraphStyle: 'paragraphStyles',
};

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
    /** @type {number|null} rAF handle for debounced refresh */
    this._refreshRaf = null;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this.el = createElement('div', {
      class: 'an-toolbar',
      role: 'toolbar',
      'aria-orientation': 'horizontal',
      'aria-label': this.context.locale.a11y?.toolbar || 'Editor toolbar',
    });
    // Detect FontAwesome once at toolbar build time to avoid re-querying the DOM
    // for every button rendered.
    this._faReady = this._detectFontAwesome();
    this._buildButtons();
    this._initRovingFocus();
    this._btnMap = new Map(
      (this.options.toolbar || []).flat()
        .map((item) => this._resolveBtn(item)).filter(Boolean).map((b) => [b.name, b]),
    );
    return this;
  }

  destroy() {
    if (this._refreshRaf) cancelAnimationFrame(this._refreshRaf);
    this._refreshRaf = null;
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this.el?.parentNode) {
      this.el.remove();
    }
    this.el = null;
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  /**
   * Resolves a toolbar item: a string is looked up in this editor's `buttons`
   * option, then the global registry; an object passes through.
   * @param {string|object} item
   * @returns {any} a button definition (shape depends on `type`), or undefined
   */
  _resolveBtn(item) {
    return (typeof item === 'string') ? resolveButton(item, this.options) : item;
  }

  /**
   * Fires `beforeCommand`; a handler returning false cancels the command.
   * @param {string} name
   * @param {*} [value]
   * @returns {boolean} whether the command may run
   */
  _allow(name, value) {
    return this.context.triggerEvent?.('beforeCommand', { name, value, source: 'toolbar' }) !== false;
  }

  _buildButtons() {
    const toolbar = this.options.toolbar || [];
    // Build into a DocumentFragment so all groups are appended in a single
    // DOM operation, avoiding one reflow per group.
    const fragment = document.createDocumentFragment();
    toolbar.forEach((group) => {
      const groupEl = createElement('div', { class: 'an-btn-group' });
      group.forEach((item) => {
        const btnDef = this._resolveBtn(item);
        if (!btnDef) {
          console.warn(`[AutumnNote] Toolbar: button "${item}" not found in registry. Skipped.`);
          return;
        }
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
      title: this.context.locale.toolbar[def.name] || def.tooltip || '',
      'data-btn': def.name,
      'aria-label': this.context.locale.toolbar[def.name] || def.tooltip || def.name,
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    });

    // Set icon — custom icon, else inline SVG (table) with optional FontAwesome fallback
    const customIcon = resolveIcon(this.options, [def.name, def.icon]);
    if (customIcon) {
      setIcon(btn, customIcon);
    } else if (this._faReady) {
      const faPrefix = this.options.fontAwesomeClass || 'fas';
      setIcon(btn, `<i class="${faPrefix} fa-table" aria-hidden="true"></i>`);
    } else {
      setIcon(btn, _SVG_MAP.get('table'));
    }

    // Popup
    const popup = createElement('div', {
      class: 'an-table-picker-popup',
      role: 'dialog',
      'aria-label': this.context.locale.a11y?.tableSize || 'Select table size',
    });
    const grid = createElement('div', { class: 'an-table-grid' });
    const label = createElement('div', { class: 'an-table-label' });
    label.textContent = this.context.locale.toolbar.insertTableLabel || 'Insert Table';

    // Real buttons with a roving tabindex: one tab stop for the grid, arrow
    // keys move between cells, Enter/Space activate through the click handler.
    const cells = [];
    for (let r = 1; r <= ROWS; r++) {
      for (let c = 1; c <= COLS; c++) {
        const cell = createElement('button', {
          type: 'button',
          class: 'an-table-cell',
          'data-row': String(r),
          'data-col': String(c),
          'aria-label': `${r} × ${c}`,
          tabindex: r === 1 && c === 1 ? '0' : '-1',
        });
        cells.push(cell);
        grid.appendChild(cell);
      }
    }
    const cellAt = (r, c) => cells[(r - 1) * COLS + (c - 1)];

    popup.appendChild(grid);
    popup.appendChild(label);

    let isOpen = false;

    const setHighlight = (rows, cols) => {
      cells.forEach((cell) => {
        const r = +cell.dataset.row;
        const c = +cell.dataset.col;
        cell.classList.toggle('active', r <= rows && c <= cols);
      });
      label.textContent = (rows && cols) ? `${rows} × ${cols}` : (this.context.locale.toolbar.insertTableLabel || 'Insert Table');
    };

    /** Moves the roving tab stop (and focus) to a cell and previews its size. */
    const focusCell = (r, c) => {
      const cell = cellAt(r, c);
      cells.forEach((el) => el.setAttribute('tabindex', el === cell ? '0' : '-1'));
      cell.focus({ preventScroll: true });
      setHighlight(r, c);
    };

    const openPopup = (fromKeyboard = false) => {
      isOpen = true;
      const rect = btn.getBoundingClientRect();

      // Measure popup dimensions while invisible so we can set the correct
      // position before the browser paints (matches the color-picker pattern).
      popup.style.visibility = 'hidden';
      popup.style.display = 'block';
      const pw = popup.offsetWidth;
      const ph = popup.offsetHeight;

      let left = rect.left;
      let top  = rect.bottom + 4;
      if (left + pw > globalThis.innerWidth - 8) left = Math.max(8, globalThis.innerWidth - pw - 8);
      if (top  + ph > globalThis.innerHeight - 8) top  = rect.top - ph - 4;

      popup.style.left = `${left}px`;
      popup.style.top  = `${top}px`;
      popup.style.visibility = '';
      btn.setAttribute('aria-expanded', 'true');
      // Only a keyboard open moves focus in; a pointer user keeps the editor
      // selection and sees no preselected 1 × 1 until they hover.
      if (fromKeyboard) focusCell(1, 1);
      else cells.forEach((el, i) => el.setAttribute('tabindex', i === 0 ? '0' : '-1'));
    };

    const closePopup = () => {
      isOpen = false;
      // Focus inside the popup would be stranded once it hides: hand it back
      // to the trigger (a cell click then moves it on to the editable).
      const hadFocus = popup.contains(document.activeElement);
      popup.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      setHighlight(0, 0);
      if (hadFocus) btn.focus({ preventScroll: true });
    };

    const d1 = on(btn, 'click', (e) => {
      e.stopPropagation();
      // detail === 0: activated with Enter/Space rather than a pointer
      if (isOpen) closePopup(); else openPopup(/** @type {MouseEvent} */ (e).detail === 0);
    });

    const GRID_KEYS = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] };
    const dKey = on(popup, 'keydown', (e) => {
      const ke = /** @type {KeyboardEvent} */ (e);
      if (ke.key === 'Escape') {
        ke.preventDefault();
        ke.stopPropagation();
        closePopup();
        btn.focus({ preventScroll: true });
        return;
      }
      const step = GRID_KEYS[ke.key];
      const cell = /** @type {HTMLElement|null} */ (/** @type {Element} */ (ke.target)?.closest('.an-table-cell'));
      if (!step || !cell) return;
      ke.preventDefault();
      const r = Math.min(ROWS, Math.max(1, +cell.dataset.row + step[0]));
      const c = Math.min(COLS, Math.max(1, +cell.dataset.col + step[1]));
      focusCell(r, c);
    });

    const d2 = on(grid, 'mouseover', (e) => {
      const cell = /** @type {HTMLElement|null} */ (/** @type {Element} */ (e.target)?.closest('.an-table-cell'));
      if (!cell) return;
      setHighlight(+cell.dataset.row, +cell.dataset.col);
    });

    const d3 = on(grid, 'mouseleave', () => setHighlight(0, 0));

    const d4 = on(grid, 'click', (e) => {
      const cell = /** @type {HTMLElement|null} */ (/** @type {Element} */ (e.target)?.closest('.an-table-cell'));
      if (!cell) return;
      const rows = +cell.dataset.row;
      const cols = +cell.dataset.col;
      closePopup();
      if (!this._allow(def.name, { rows, cols })) return;
      this.context.invoke('editor.focus');
      def.action(this.context, rows, cols);
    });

    const d5 = on(document, 'click', () => { if (isOpen) closePopup(); });

    // Append popup to body so position:fixed is truly viewport-relative,
    // unaffected by any ancestor transform / filter (same pattern as color picker).
    this._disposers.push(d1, dKey, d2, d3, d4, d5, () => {
      if (popup.parentNode) popup.remove();
    });

    wrap.appendChild(btn);
    portalOf(this.context).appendChild(popup);
    return /** @type {HTMLDivElement} */ (wrap);
  }

  /**
   * Creates a split color-picker widget:
   *   [icon + strip | ▾] — left applies current color, right opens swatch popup.
   * @param {{ name: string, type: 'colorpicker', icon?: string, tooltip: string, defaultColor: string, action: Function }} def
   * @returns {HTMLDivElement}
   */
  _createColorPicker(def) {
    let currentColor = def.defaultColor || '#000000';

    const wrap = createElement('div', { class: 'an-color-picker-wrap' });

    const useBootstrap = !!this.options.useBootstrap;
    const baseClass = useBootstrap ? (this.options.toolbarButtonClass || 'btn btn-sm btn-light') : 'an-btn';

    // ---- Apply button (icon + color strip) ----
    const applyBtn = createElement('button', {
      type: 'button',
      class: `${baseClass} an-color-btn`,
      title: this.context.locale.toolbar[def.name] || def.tooltip || '',
      'data-btn': def.name,
      'aria-label': this.context.locale.toolbar[def.name] || def.tooltip || def.name,
    });

    const iconSvg = _SVG_MAP.get(def.name === 'foreColor' ? 'foreColor' : 'backColor');

    setIcon(applyBtn, resolveIcon(this.options, [def.name, def.icon]) ?? iconSvg);
    const strip = createElement('span', { class: 'an-color-strip' });
    strip.style.background = currentColor;
    applyBtn.appendChild(strip);

    // ---- Arrow button (open popup) ----
    const arrowBtn = createElement('button', {
      type: 'button',
      class: `${baseClass} an-color-arrow`,
      title: def.name === 'foreColor'
        ? (this.context.locale.toolbar.chooseTextColor || 'Choose text color')
        : (this.context.locale.toolbar.chooseHighlightColor || 'Choose highlight color'),
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    });
    setIcon(arrowBtn, `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:block"><path d="M7 10l5 5 5-5H7z"/></svg>`);

    // ---- Popup ----
    const popup = createElement('div', { class: 'an-color-popup' });
    popup.style.display = 'none';

    const swatches = createElement('div', { class: 'an-color-swatches' });
    resolvePalette(this.options).forEach((color) => {
      const sw = createElement('button', { type: 'button', class: 'an-color-swatch', title: color, 'aria-label': color, 'data-color': color });
      sw.style.background = color;
      swatches.appendChild(sw);
    });

    const customRow = createElement('div', { class: 'an-color-custom' });
    const colorInput = /** @type {HTMLInputElement} */ (createElement('input', { type: 'color', value: currentColor, title: this.context.locale.toolbar.customColor || 'Custom color' }));
    const customLabel = createElement('span', {}, [this.context.locale.toolbar.customColor || 'Custom color']);
    customRow.appendChild(colorInput);
    customRow.appendChild(customLabel);

    popup.appendChild(swatches);
    popup.appendChild(customRow);

    // ---- State ----
    let isOpen = false;
    /** @type {Range|null} saved selection range before popup opens */
    let savedRange = null;

    const saveSelection = () => {
      const sel = globalThis.getSelection();
      savedRange = sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    };

    const restoreSelection = () => {
      if (!savedRange) return;
      try {
        const sel = globalThis.getSelection();
        if (!sel) return;
        sel.removeAllRanges();
        sel.addRange(savedRange);
      } catch (_) {
        void _; // range may be stale if DOM changed while popup was open
      }
    };

    /** @param {boolean} [fromKeyboard] move focus into the popup (keyboard activation) */
    const openPopup = (fromKeyboard = false) => {
      // Close any other open color picker before opening this one
      this._colorPickerClosers.forEach((fn) => { if (fn !== closePopup) fn(); });
      saveSelection();
      isOpen = true;
      // Use fixed positioning so the popup escapes any overflow-clipping ancestor
      // (notably toolbar scroll mode, where overflow-x:auto coerces overflow-y)
      const rect = arrowBtn.getBoundingClientRect();
      const popupMinW = 184;
      let left = rect.left;
      if (left + popupMinW > globalThis.innerWidth) left = rect.right - popupMinW;
      popup.style.top  = `${rect.bottom + 4}px`;
      popup.style.left = `${Math.max(4, left)}px`;
      popup.style.display = 'block';
      arrowBtn.setAttribute('aria-expanded', 'true');
      // preventScroll: the capture-phase scroll listener below would close it
      if (fromKeyboard) /** @type {HTMLElement|null} */ (swatches.firstElementChild)?.focus({ preventScroll: true });
    };

    const closePopup = () => {
      isOpen = false;
      // Return focus that would be stranded in the hidden popup to the trigger
      const hadFocus = popup.contains(document.activeElement);
      popup.style.display = 'none';
      if (hadFocus) arrowBtn.focus({ preventScroll: true });
      popup.style.top  = '';
      popup.style.left = '';
      arrowBtn.setAttribute('aria-expanded', 'false');
    };

    const applyColor = (color) => {
      currentColor = color;
      strip.style.background = color;
      colorInput.value = color;
      if (!this._allow(def.name, color)) { closePopup(); return; }
      restoreSelection();
      def.action(this.context, color);
      this.context.invoke('editor.afterCommand');
      closePopup();
    };

    const d1 = on(applyBtn, 'click', (e) => {
      e.preventDefault();
      if (!this._allow(def.name, currentColor)) return;
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
      // detail === 0: activated with Enter/Space rather than a pointer
      if (isOpen) closePopup(); else openPopup(/** @type {MouseEvent} */ (e).detail === 0);
    });

    const dKey = on(popup, 'keydown', (e) => {
      if (/** @type {KeyboardEvent} */ (e).key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      closePopup();
      arrowBtn.focus({ preventScroll: true });
    });

    const d3 = on(swatches, 'mousedown', (e) => {
      // Prevent blur before the click handler fires
      e.preventDefault();
    });

    const d3b = on(swatches, 'click', (e) => {
      const sw = /** @type {Element} */ (e.target)?.closest('.an-color-swatch');
      if (sw) applyColor(/** @type {HTMLElement} */ (sw).dataset.color);
    });

    const d4 = on(colorInput, 'change', (e) => {
      applyColor(/** @type {HTMLInputElement} */ (e.target).value);
    });

    const d5 = on(document, 'click', (e) => {
      // popup is in the editor portal, not inside wrap — check both
      if (isOpen && !wrap.contains(/** @type {Node} */ (e.target)) && !popup.contains(/** @type {Node} */ (e.target))) closePopup();
    });

    const d6 = on(popup, 'click', (e) => e.stopPropagation());

    // Close the popup when the viewport scrolls or resizes so the fixed-position
    // popup doesn't drift away from the button it belongs to.
    const onScrollResize = () => { if (isOpen) closePopup(); };
    document.addEventListener('scroll', onScrollResize, { passive: true, capture: true });
    globalThis.addEventListener('resize',   onScrollResize, { passive: true });

    this._disposers.push(d1, d2, d2b, dKey, d3, d3b, d4, d5, d6,
      () => document.removeEventListener('scroll', onScrollResize, { capture: true }),
      () => globalThis.removeEventListener('resize',   onScrollResize),
      // Remove popup from body on editor destroy
      () => { if (popup.parentNode) popup.remove(); },
    );

    // Register this popup's closer so other color pickers can close it
    this._colorPickerClosers.push(closePopup);
    this._disposers.push(() => {
      const idx = this._colorPickerClosers.indexOf(closePopup);
      if (idx !== -1) this._colorPickerClosers.splice(idx, 1);
    });

    // Append popup to the editor portal so it escapes all overflow-clipping and
    // contain:layout ancestors (contain:layout makes the container a fixed-pos
    // containing block per the CSS Contain spec, breaking viewport coordinates).
    wrap.appendChild(applyBtn);
    wrap.appendChild(arrowBtn);
    portalOf(this.context).appendChild(popup);
    return /** @type {HTMLDivElement} */ (wrap);
  }

  /**
   * Creates a <select> dropdown for font-family (or similar) options.
   * @param {import('./Buttons.js').DropdownDef} def
   * @returns {HTMLSelectElement}
   */
  _createSelect(def) {
    // Built-in dropdowns take their list from an option when one is set
    const optionKey = SELECT_ITEM_OPTIONS[def.name];
    const fromOption = optionKey ? this.options[optionKey] : null;
    const items = Array.isArray(fromOption) && (fromOption.length || def.name === 'fontFamily')
      ? fromOption
      : (def.items || []);

    const cls = def.selectClass ? `an-select ${def.selectClass}` : 'an-select';
    const select = createElement('select', {
      class: cls,
      title: this.context.locale.toolbar[def.name] || def.tooltip || '',
      'data-btn': def.name,
      'aria-label': this.context.locale.toolbar[def.name] || def.tooltip || def.name,
    });

    // Blank "placeholder" option (non-selectable header)
    const placeholderText = this.context.locale.toolbar[def.name + 'Placeholder'] || def.placeholder || 'Font';
    const placeholder = createElement('option', { value: '', disabled: '', hidden: '' }, [placeholderText]);
    select.appendChild(placeholder);

    items.forEach((item) => {
      const value    = (typeof item === 'object') ? item.value    : item;
      let label;
      if (typeof item !== 'object') {
        label = item;
      } else if (def.name === 'paragraphStyle') {
        label = this.context.locale.toolbar.paragraphItems?.[item.value] || item.label;
      } else {
        label = item.label;
      }
      const isHeader = (typeof item === 'object') && !!item.disabled;
      const attrs    = { value };
      if (isHeader) attrs.disabled = '';
      const opt = createElement('option', attrs, [label]);
      // Only apply fontFamily face preview on real (non-header) entries
      if (def.name === 'fontFamily' && !isHeader) opt.style.fontFamily = value;
      select.appendChild(opt);
    });

    // Save the editor selection when the user starts interacting with the
    // dropdown (mousedown fires before the editor loses focus).  When the
    // change handler runs, focus has moved to the <select>; we restore the
    // saved range so the command acts on the intended text.
    /** @type {Range|null} */
    let _savedRange = null;
    const dMousedown = on(select, 'mousedown', () => {
      const sel = globalThis.getSelection();
      _savedRange = sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    });

    const disposer = on(select, 'change', (e) => {
      const value = /** @type {HTMLSelectElement} */ (e.target).value;
      const selectedOpt = /** @type {HTMLSelectElement} */ (e.target).options[/** @type {HTMLSelectElement} */ (e.target).selectedIndex];
      if (!value || selectedOpt.disabled) return;
      this.context.invoke('editor.focus');
      // Restore selection saved on mousedown so the action targets the correct text.
      if (_savedRange) {
        try {
          const sel = globalThis.getSelection();
          if (sel) { sel.removeAllRanges(); sel.addRange(_savedRange); }
        } catch (_) { void _; /* range may be stale if DOM changed */ }
      }
      if (!this._allow(def.name, value)) return;
      def.action(this.context, value);
      this.context.invoke('editor.afterCommand');
    });

    this._disposers.push(dMousedown, disposer);
    return /** @type {HTMLSelectElement} */ (select);
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
      title: this.context.locale.toolbar[btnDef.name] || btnDef.tooltip || '',
      'data-btn': btnDef.name,
      'aria-label': this.context.locale.toolbar[btnDef.name] || btnDef.tooltip || btnDef.name,
      // A button that reports an active state is a toggle, so its state has to
      // be exposed to assistive tech and not only through the `.active` class.
      ...(typeof btnDef.isActive === 'function' ? { 'aria-pressed': 'false' } : {}),
    });

    // Render icon: a custom icon (icons option / registerIcon) wins; then
    // FontAwesome if enabled; otherwise the built-in SVG, or text.
    const faPrefix = this.options.fontAwesomeClass || 'fas';
    const useFaNow = this._faReady;
    const customIcon = resolveIcon(this.options, [btnDef.name, btnDef.icon]);
    if (customIcon) {
      setIcon(btn, customIcon);
    } else if (useFaNow) {
      const faName = _FA_MAP.get(btnDef.icon) || _FA_MAP.get(btnDef.name) || null;
      if (faName) {
        setIcon(btn, `<i class="${faPrefix} ${faName}" aria-hidden="true"></i>`);
      } else if (_SVG_MAP.has(btnDef.icon)) {
        setIcon(btn, _SVG_MAP.get(btnDef.icon));
      } else {
        btn.textContent = btnDef.icon || btnDef.name;
      }
    } else if (_SVG_MAP.has(btnDef.icon)) {
      // FontAwesome absent: use SVG fallback when available
      setIcon(btn, _SVG_MAP.get(btnDef.icon));
    } else if (_SVG_MAP.has(btnDef.name)) {
      setIcon(btn, _SVG_MAP.get(btnDef.name));
    } else {
      btn.textContent = btnDef.icon || btnDef.name;
    }

    const disposer = on(btn, 'click', (event) => {
      event.preventDefault();
      if (!this._allow(btnDef.name)) return;
      // Restore focus to the editor before executing the action
      this.context.invoke('editor.focus');
      btnDef.action(this.context);
      this.context.invoke('editor.afterCommand');
      this.refresh();
    });

    this._disposers.push(disposer);
    return /** @type {HTMLButtonElement} */ (btn);
  }

  // ---------------------------------------------------------------------------
  // Keyboard navigation — WAI-ARIA toolbar pattern
  // ---------------------------------------------------------------------------

  /**
   * Every control the toolbar contains, in visual order. Disabled ones are
   * included so their tabindex can be cleared; `_navigable()` filters them out.
   * @returns {HTMLElement[]}
   */
  _controls() {
    if (!this.el) return [];
    return /** @type {HTMLElement[]} */ (Array.from(this.el.querySelectorAll('button, select')));
  }

  /** @returns {HTMLElement[]} controls that can actually receive focus */
  _navigable() {
    return this._controls().filter(
      (el) => !(/** @type {HTMLButtonElement} */ (el).disabled),
    );
  }

  /**
   * Enforces the roving-tabindex invariant: exactly one control sits in the tab
   * order and the rest are reached with arrow keys. The default toolbar renders
   * 39 controls, so without this a keyboard user pressed Tab 39 times to get
   * past the toolbar and into the editable area.
   *
   * @param {HTMLElement} [focused] - control that should own the tab stop;
   *   omitted on refresh, where the user's current position is preserved.
   */
  _syncRovingTabindex(focused) {
    const all = this._controls();
    const navigable = this._navigable();
    if (!navigable.length) return;
    const active = (focused && navigable.includes(focused))
      ? focused
      : navigable.find((el) => el.getAttribute('tabindex') === '0') || navigable[0];
    all.forEach((el) => el.setAttribute('tabindex', el === active ? '0' : '-1'));
  }

  /** Wires arrow-key navigation. Called on build and again after rebuild(). */
  _initRovingFocus() {
    if (!this.el) return;
    this._syncRovingTabindex();
    this._disposers.push(
      on(this.el, 'keydown', (e) => this._onToolbarKeydown(/** @type {KeyboardEvent} */ (e))),
      // Clicking or programmatically focusing a control moves the tab stop with
      // it, so Tab always leaves from wherever the user actually is.
      on(this.el, 'focusin', (e) => {
        const el = /** @type {Element} */ (e.target)?.closest?.('button, select');
        if (el) this._syncRovingTabindex(/** @type {HTMLElement} */ (el));
      }),
    );
  }

  /**
   * Home/End jump to the ends; Left/Right step between controls and wrap.
   * Up/Down are deliberately left alone so `<select>` controls keep their
   * native value-changing behaviour.
   * @param {KeyboardEvent} event
   */
  _onToolbarKeydown(event) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    const controls = this._navigable();
    const current = /** @type {HTMLElement|null} */ (
      /** @type {Element} */ (event.target)?.closest?.('button, select')
    );
    const idx = current ? controls.indexOf(current) : -1;
    if (idx === -1) return;

    let next;
    if (event.key === 'Home') {
      next = controls[0];
    } else if (event.key === 'End') {
      next = controls.at(-1);
    } else {
      // In RTL the arrow that points at the next control is the left one.
      const rtl = this.options.direction === 'rtl';
      const forward = (event.key === 'ArrowRight') !== rtl;
      next = controls[(idx + (forward ? 1 : -1) + controls.length) % controls.length];
    }
    if (!next) return;
    event.preventDefault();
    this._syncRovingTabindex(next);
    next.focus();
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
      .map((l) => /** @type {HTMLLinkElement} */ (l).href || '').join(' ');
    _faPageLevelReady = /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(links);
    return _faPageLevelReady;
  }

  // ---------------------------------------------------------------------------
  // State refresh (active / disabled states)
  // ---------------------------------------------------------------------------

  refresh() {
    // Debounce via rAF — multiple rapid calls (e.g. afterCommand + button click)
    // collapse into a single update per animation frame.
    if (this._refreshRaf) cancelAnimationFrame(this._refreshRaf);
    this._refreshRaf = requestAnimationFrame(() => {
      this._refreshRaf = null;
      this._doRefresh();
    });
  }

  _doRefresh() {
    if (!this.el) return;
    const btnMap = this._btnMap || new Map();

    // Sync button active states
    this.el.querySelectorAll('button[data-btn]').forEach((btn) => {
      const def = btnMap.get(/** @type {HTMLElement} */ (btn).dataset.btn);
      if (def && typeof def.isActive === 'function') {
        const active = !!def.isActive(this.context);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      }
      if (def && typeof def.isDisabled === 'function') {
        /** @type {HTMLButtonElement} */ (btn).disabled = !!def.isDisabled(this.context);
      }
    });

    // A button disabled just now must not be the one holding the tab stop.
    this._syncRovingTabindex();

    // Sync select dropdowns (e.g. font family) with current cursor position
    this.el.querySelectorAll('select[data-btn]').forEach((select) => {
      const def = btnMap.get(/** @type {HTMLElement} */ (select).dataset.btn);
      if (!def || typeof def.getValue !== 'function') return;
      // A font name may come back quoted — strip quotes
      let raw = (def.getValue(this.context) || '').replace(/["']/g, '').trim();
      // Fallback: when no selection/font set, use the configured default font
      if (!raw) {
        raw = this.options.defaultFontFamily
          || this.options.fontFamilies?.[0]
          || '';
      }
      // Try to match against available options (case-insensitive)
      const sel = /** @type {HTMLSelectElement} */ (select);
      const matched = Array.from(sel.options).find(
        (opt) => opt.value?.toLowerCase() === raw.toLowerCase()
      );
      sel.value = matched ? matched.value : '';
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

  /**
   * Tears down and re-renders the toolbar in-place.
   * Call after registering new buttons post-create via context.use(plugin)
   * or AutumnNote.registerButton() to make them appear in the toolbar.
   */
  rebuild() {
    if (this._refreshRaf) { cancelAnimationFrame(this._refreshRaf); this._refreshRaf = null; }
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this.el) this.el.innerHTML = '';
    this._faReady = this._detectFontAwesome();
    this._buildButtons();
    // rebuild() cleared the disposers, taking the keydown/focusin listeners
    // with them — re-arm navigation over the new controls.
    this._initRovingFocus();
    this._btnMap = new Map(
      (this.options.toolbar || []).flat()
        .map((item) => this._resolveBtn(item)).filter(Boolean).map((b) => [b.name, b]),
    );
    this.refresh();
  }
}
