/**
 * BubbleToolbar.js — A mini floating toolbar that appears above the current
 * text selection, allowing quick access to common formatting actions without
 * reaching for the main toolbar.
 *
 * Activated when `bubbleToolbar: true`.  The set of visible buttons is
 * controlled by `bubbleToolbarItems` (array of button name strings).
 *
 * Built-in names: 'bold', 'italic', 'underline', 'strikethrough',
 *   'link', 'foreColor', 'hiliteColor', 'removeFormat', 'inlineCode'.
 * Any name not found in the built-in map is silently ignored.
 */

import { on } from '../core/dom.js';

const COLOR_PRESETS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#efefef', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#d9d2e9', '#ead1dc',
];

// Minimal SVG icon set — only what the bubble toolbar needs.
const _S = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const _svg = (p) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" ${_S} style="display:block">${p}</svg>`;

const _ICONS = {
  bold:          _svg('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>'),
  italic:        _svg('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'),
  underline:     _svg('<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>'),
  strikethrough: _svg('<path d="M17.3 12H6.7"/><path d="M10 6.5C10 5.1 11.1 4 12.5 4c1.4 0 2.5 1.1 2.5 2.5 0 .8-.4 1.5-1 2"/><path d="M14 17.5C14 19 12.9 20 11.5 20 10.1 20 9 18.9 9 17.5c0-.8.4-1.5 1-2"/>'),
  link:          _svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  foreColor:     _svg('<path d="M4 20L12 4L20 20"/><line x1="7.5" y1="14" x2="16.5" y2="14"/>'),
  hiliteColor:   _svg('<path d="M3 21v-4l9-9 4 4-9 9z"/><path d="M12 8l4 4"/><line x1="3" y1="21" x2="21" y2="21"/>'),
  removeFormat:  _svg('<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'),
  inlineCode:    _svg('<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v5c0 1.1.9 2 2 2a2 2 0 0 1-2 2v5a2 2 0 0 1-2 2h-1"/>'),
};

// Color buttons are handled via _openColorPicker; not in _ACTIONS.
const _ACTIONS = {
  bold:          (ctx) => ctx.invoke('editor.bold'),
  italic:        (ctx) => ctx.invoke('editor.italic'),
  underline:     (ctx) => ctx.invoke('editor.underline'),
  strikethrough: (ctx) => ctx.invoke('editor.strikethrough'),
  link:          (ctx) => ctx.invoke('linkDialog.show'),
  removeFormat:  (ctx) => {
    const editable = ctx.layoutInfo && ctx.layoutInfo.editable;
    if (!editable) return;
    editable.focus();
    document.execCommand('removeFormat');
    // Also strip inline style attributes which execCommand('removeFormat') misses
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
      const range = sel.getRangeAt(0);
      const ancestor = range.commonAncestorContainer;
      const root = /** @type {Element|null} */ (ancestor.nodeType === 1 ? ancestor : ancestor.parentElement);
      if (root) {
        const candidates = [root, ...root.querySelectorAll('[style]')];
        for (const el of candidates) {
          if (el.hasAttribute('style') && range.intersectsNode(el)) {
            el.removeAttribute('style');
          }
        }
      }
    }
    ctx.invoke('editor.afterCommand');
  },
  inlineCode:    (ctx) => ctx.invoke('editor.inlineCode'),
};

const _ACTIVE = {
  bold:          () => document.queryCommandState('bold'),
  italic:        () => document.queryCommandState('italic'),
  underline:     () => document.queryCommandState('underline'),
  strikethrough: () => document.queryCommandState('strikeThrough'),
};

const _COLOR_TYPES = { foreColor: true, hiliteColor: true };

export class BubbleToolbar {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this.options = context.options;

    /** @type {HTMLElement|null} */
    this._el = null;
    /** @type {HTMLElement|null} */
    this._picker = null;
    this._pickerType = null; // 'foreColor' | 'hiliteColor'
    this._savedRange = null;
    this._visible = false;
    this._rafId = null;
    this._contextMenuOpen = false;
    this._disposers = [];

    this._onSelectionChange = this._onSelectionChange.bind(this);
    this._onMousedown = this._onMousedown.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
  }

  initialize() {
    if (!this.options.bubbleToolbar) return this;
    this._build();
    this._buildColorPicker();
    const d1 = on(document, 'selectionchange', this._onSelectionChange);
    const d2 = on(document, 'mousedown', this._onMousedown);
    const d3 = on(document, 'keydown', this._onKeydown);
    const d4 = on(document, 'contextmenu', this._onContextMenu);
    const d5 = this.context.on('contextMenu:show', () => {
      this._contextMenuOpen = true;
      this._hide();
    });
    const d6 = this.context.on('contextMenu:hide', () => {
      this._contextMenuOpen = false;
    });
    this._disposers.push(d1, d2, d3, d4, d5, d6);
    return this;
  }

  destroy() {
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
    this._el = null;
    if (this._picker && this._picker.parentNode) this._picker.parentNode.removeChild(this._picker);
    this._picker = null;
    this._disposers.forEach((d) => d());
    this._disposers = [];
    cancelAnimationFrame(this._rafId);
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  _build() {
    const el = document.createElement('div');
    el.className = 'an-bubble-toolbar';
    el.setAttribute('role', 'toolbar');
    el.setAttribute('aria-label', 'Formatting');

    const items = this.options.bubbleToolbarItems || ['bold', 'italic', 'underline', 'link', 'foreColor', 'hiliteColor', 'removeFormat'];
    for (const name of items) {
      if (!_ICONS[name]) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.name = name;
      btn.setAttribute('aria-label', name);

      if (_COLOR_TYPES[name]) {
        // Color button: SVG icon stacked above a colored strip, matching ContextMenu style
        btn.className = 'an-bubble-btn an-bubble-btn--color';
        const iconWrap = document.createElement('span');
        iconWrap.className = 'an-bubble-btn-svg';
        iconWrap.innerHTML = _ICONS[name];
        const strip = document.createElement('span');
        strip.className = 'an-bubble-color-strip';
        strip.style.background = name === 'foreColor' ? '#000000' : 'transparent';
        btn.appendChild(iconWrap);
        btn.appendChild(strip);
      } else {
        btn.className = 'an-bubble-btn';
        btn.innerHTML = _ICONS[name];
      }

      btn.addEventListener('mousedown', (e) => {
        // Prevent mousedown from collapsing selection before click fires
        e.preventDefault();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Color buttons: save selection and open the picker
        if (_COLOR_TYPES[name]) {
          this._openColorPicker(name, btn);
          return;
        }

        this.context.invoke('editor.focus');
        if (_ACTIONS[name]) _ACTIONS[name](this.context);
        this._syncActive();
      });
      el.appendChild(btn);
    }

    document.body.appendChild(el);
    this._el = el;
    // Cache button references once — avoids querySelectorAll on every selectionchange
    this._btnCache = Array.from(el.querySelectorAll('.an-bubble-btn'));
  }

  _buildColorPicker() {
    const picker = document.createElement('div');
    picker.className = 'an-bubble-color-picker';
    picker.style.display = 'none';

    // Prevent any mousedown inside the picker from collapsing the editor selection
    picker.addEventListener('mousedown', (e) => e.preventDefault());

    const palette = document.createElement('div');
    palette.className = 'an-context-color-palette';

    COLOR_PRESETS.forEach((color) => {
      const sw = document.createElement('div');
      sw.className = 'an-context-color-swatch';
      sw.title = color;
      sw.style.background = color;
      sw.setAttribute('role', 'button');
      sw.setAttribute('aria-label', color);
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        this._applyColor(this._pickerType, color);
      });
      palette.appendChild(sw);
    });

    // "No highlight" swatch — only shown for hiliteColor
    const noColorBtn = document.createElement('div');
    noColorBtn.className = 'an-context-color-swatch an-context-color-none';
    noColorBtn.title = 'No highlight';
    noColorBtn.setAttribute('role', 'button');
    noColorBtn.setAttribute('aria-label', 'No highlight');
    noColorBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>`;
    noColorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._applyColor('hiliteColor', 'transparent');
    });

    // Custom color input row
    const customRow = document.createElement('div');
    customRow.className = 'an-context-color-custom';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#000000';
    colorInput.title = 'Custom color';
    // stopPropagation so the picker's mousedown-preventDefault doesn't block the native color dialog
    colorInput.addEventListener('mousedown', (e) => e.stopPropagation());
    colorInput.addEventListener('change', () => {
      this._applyColor(this._pickerType, colorInput.value);
    });
    const customLabel = document.createElement('span');
    customLabel.textContent = 'Custom…';
    customRow.appendChild(colorInput);
    customRow.appendChild(customLabel);

    picker.appendChild(palette);
    picker.appendChild(customRow);
    document.body.appendChild(picker);

    this._picker = picker;
    const pickerAny = /** @type {any} */ (picker);
    pickerAny._paletteEl = palette;
    pickerAny._noColorBtn = noColorBtn;
    pickerAny._colorInput = colorInput;
  }

  _openColorPicker(type, anchorBtn) {
    // Save current selection before the picker might shift focus
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      this._savedRange = sel.getRangeAt(0).cloneRange();
    }

    this._pickerType = type;

    // Toggle "No highlight" swatch based on type
    const pickerAny = /** @type {any} */ (this._picker);
    const palette = pickerAny._paletteEl;
    const noColorBtn = pickerAny._noColorBtn;
    if (type === 'hiliteColor') {
      if (!palette.contains(noColorBtn)) palette.appendChild(noColorBtn);
    } else {
      if (palette.contains(noColorBtn)) palette.removeChild(noColorBtn);
    }

    // Seed the custom color input
    /** @type {any} */ (this._picker)._colorInput.value = type === 'foreColor' ? '#000000' : '#ffff00';

    // Position the picker above the bubble toolbar (not blocking the content below it).
    // Fall back to below the toolbar if there's not enough room above.
    this._picker.style.display = 'block';
    const pw = this._picker.offsetWidth;
    const ph = this._picker.offsetHeight;
    const toolbarRect = this._el.getBoundingClientRect();

    let top = toolbarRect.top - ph - 6;
    if (top < 8) top = toolbarRect.bottom + 6;

    // Align horizontally with the clicked button, clamped to viewport
    const btnRect = anchorBtn.getBoundingClientRect();
    let left = btnRect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));

    this._picker.style.left = `${left}px`;
    this._picker.style.top = `${top}px`;
  }

  _closeColorPicker() {
    if (this._picker) this._picker.style.display = 'none';
    this._pickerType = null;
  }

  /** Restore the saved selection, apply execCommand, update the color strip, then close the picker. */
  _applyColor(type, color) {
    const editable = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!editable || !this._savedRange) return;

    editable.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    try { sel.addRange(this._savedRange.cloneRange()); } catch (_) { return; }

    // Firefox does not support 'hiliteColor'; fall back to 'backColor'
    const cmd = type === 'hiliteColor' ? 'hiliteColor' : type;
    if (!document.execCommand(cmd, false, color) && cmd === 'hiliteColor') {
      document.execCommand('backColor', false, color);
    }
    this.context.invoke('editor.afterCommand');

    // Update the color strip on the corresponding button
    const name = type === 'hiliteColor' ? 'hiliteColor' : 'foreColor';
    const btn = this._el && this._el.querySelector(`[data-name="${name}"]`);
    const strip = btn && btn.querySelector('.an-bubble-color-strip');
    if (strip) /** @type {HTMLElement} */ (strip).style.background = color === 'transparent' ? 'transparent' : color;

    this._closeColorPicker();
    this._syncActive();
  }

  // ---------------------------------------------------------------------------
  // Show / hide
  // ---------------------------------------------------------------------------

  _show(rect) {
    if (!this._el) return;
    const el = this._el;

    // Measure while invisible — position:fixed so no scroll offset needed
    el.style.visibility = 'hidden';
    el.style.display = 'flex';

    const bw = el.offsetWidth;
    const bh = el.offsetHeight;
    const gap = 8;

    // Center horizontally above the selection; flip below if no room above
    let left = rect.left + rect.width / 2 - bw / 2;
    let top = rect.top - bh - gap;

    left = Math.max(8, Math.min(left, window.innerWidth - bw - 8));

    if (top < 8) {
      top = rect.bottom + gap;
    }

    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
    el.style.visibility = '';

    this._syncActive();
    this._syncColorStrips();
    this._visible = true;
  }

  _hide() {
    if (!this._el) return;
    this._el.style.display = 'none';
    this._visible = false;
    this._closeColorPicker();
  }

  _syncActive() {
    if (!this._btnCache) return;
    this._btnCache.forEach((btn) => {
      const activeFn = _ACTIVE[/** @type {HTMLElement} */ (btn).dataset.name];
      btn.classList.toggle('an-active', !!(activeFn && activeFn()));
    });
  }

  /** Read the current selection's color and update the color-strip indicators. */
  _syncColorStrips() {
    if (!this._el) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node = sel.getRangeAt(0).startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node) return;
    const cs = window.getComputedStyle(/** @type {Element} */ (node));

    const foreBtn = this._el.querySelector('[data-name="foreColor"]');
    const foreStrip = foreBtn && foreBtn.querySelector('.an-bubble-color-strip');
    if (foreStrip) /** @type {HTMLElement} */ (foreStrip).style.background = cs.color || '#000000';

    const hiliteBtn = this._el.querySelector('[data-name="hiliteColor"]');
    const hiliteStrip = hiliteBtn && hiliteBtn.querySelector('.an-bubble-color-strip');
    if (hiliteStrip) {
      const bg = cs.backgroundColor;
      /** @type {HTMLElement} */ (hiliteStrip).style.background = (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') ? 'transparent' : bg;
    }
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  _onSelectionChange() {
    cancelAnimationFrame(this._rafId);
    this._rafId = requestAnimationFrame(() => {
      if (this._contextMenuOpen) return;
      // Keep toolbar visible while color picker is open
      if (this._picker && this._picker.style.display !== 'none') return;

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        this._hide();
        return;
      }

      const editable = this.context.layoutInfo.editable;
      if (!editable.contains(sel.anchorNode)) {
        this._hide();
        return;
      }

      // Don't show in read-only mode
      if (this.context.options.readOnly) {
        this._hide();
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0) {
        this._hide();
        return;
      }

      this._show(rect);
    });
  }

  _onMousedown(e) {
    // Hide when clicking outside both the editable, the bubble toolbar, and the color picker
    if (!this._visible) return;
    if (this._el && this._el.contains(e.target)) return;
    if (this._picker && this._picker.contains(e.target)) return;
    const editable = this.context.layoutInfo.editable;
    if (editable.contains(e.target)) return;
    this._hide();
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      if (this._picker && this._picker.style.display !== 'none') {
        this._closeColorPicker();
      } else if (this._visible) {
        this._hide();
      }
    }
  }

  _onContextMenu() {
    // Hide immediately on right-click — contextMenu:show event will also set the flag,
    // but firing here prevents a one-frame flicker before the event propagates.
    this._hide();
  }
}
