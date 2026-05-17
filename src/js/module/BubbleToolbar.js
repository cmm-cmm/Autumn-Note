/**
 * BubbleToolbar.js — A mini floating toolbar that appears above the current
 * text selection, allowing quick access to common formatting actions without
 * reaching for the main toolbar.
 *
 * Activated when `bubbleToolbar: true`.  The set of visible buttons is
 * controlled by `bubbleToolbarItems` (array of button name strings).
 *
 * Built-in names: 'bold', 'italic', 'underline', 'strikethrough',
 *   'link', 'foreColor', 'removeFormat', 'inlineCode'.
 * Any name not found in the built-in map is silently ignored.
 */

import { on } from '../core/dom.js';

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
  removeFormat:  _svg('<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'),
  inlineCode:    _svg('<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v5c0 1.1.9 2 2 2a2 2 0 0 1-2 2v5a2 2 0 0 1-2 2h-1"/>'),
};

const _ACTIONS = {
  bold:          (ctx) => ctx.invoke('editor.bold'),
  italic:        (ctx) => ctx.invoke('editor.italic'),
  underline:     (ctx) => ctx.invoke('editor.underline'),
  strikethrough: (ctx) => ctx.invoke('editor.strikethrough'),
  link:          (ctx) => ctx.invoke('linkDialog.show'),
  foreColor:     (ctx) => {
    const color = window.prompt('Text color (hex or name):', '#000000');
    if (color) ctx.invoke('editor.foreColor', color);
  },
  removeFormat:  (ctx) => ctx.invoke('editor.removeFormat'),
  inlineCode:    (ctx) => ctx.invoke('editor.inlineCode'),
};

const _ACTIVE = {
  bold:          () => document.queryCommandState('bold'),
  italic:        () => document.queryCommandState('italic'),
  underline:     () => document.queryCommandState('underline'),
  strikethrough: () => document.queryCommandState('strikeThrough'),
};

export class BubbleToolbar {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this.options = context.options;

    /** @type {HTMLElement|null} */
    this._el = null;
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

    const items = this.options.bubbleToolbarItems || ['bold', 'italic', 'underline', 'link', 'foreColor', 'removeFormat'];
    for (const name of items) {
      if (!_ICONS[name] || !_ACTIONS[name]) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'an-bubble-btn';
      btn.dataset.name = name;
      btn.setAttribute('aria-label', name);
      btn.innerHTML = _ICONS[name];
      btn.addEventListener('mousedown', (e) => {
        // Prevent mousedown from collapsing selection before click fires
        e.preventDefault();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.context.invoke('editor.focus');
        _ACTIONS[name](this.context);
        this.context.invoke('editor.afterCommand');
        this._syncActive();
      });
      el.appendChild(btn);
    }

    document.body.appendChild(el);
    this._el = el;
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
    this._visible = true;
  }

  _hide() {
    if (!this._el) return;
    this._el.style.display = 'none';
    this._visible = false;
  }

  _syncActive() {
    if (!this._el) return;
    this._el.querySelectorAll('.an-bubble-btn').forEach((btn) => {
      const name = btn.dataset.name;
      const activeFn = _ACTIVE[name];
      btn.classList.toggle('an-active', !!(activeFn && activeFn()));
    });
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  _onSelectionChange() {
    cancelAnimationFrame(this._rafId);
    this._rafId = requestAnimationFrame(() => {
      if (this._contextMenuOpen) return;

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

      // Don't show inside code view or read-only
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
    // Hide when clicking outside both the editable and the bubble toolbar
    if (!this._visible) return;
    if (this._el && this._el.contains(e.target)) return;
    const editable = this.context.layoutInfo.editable;
    if (editable.contains(e.target)) return;
    this._hide();
  }

  _onKeydown(e) {
    if (e.key === 'Escape' && this._visible) {
      this._hide();
    }
  }

  _onContextMenu() {
    // Hide immediately on right-click — contextMenu:show event will also set the flag,
    // but firing here prevents a one-frame flicker before the event propagates.
    this._hide();
  }
}
