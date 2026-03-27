/**
 * Toolbar.js - Builds and manages the editor toolbar UI
 * Inspired by Summernote's Toolbar module — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';

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
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this.el = createElement('div', { class: 'asn-toolbar' });
    this._buildButtons();
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
    toolbar.forEach((group) => {
      const groupEl = createElement('div', { class: 'asn-btn-group' });
      group.forEach((btnDef) => {
        const el = btnDef.type === 'select'
          ? this._createSelect(btnDef)
          : this._createButton(btnDef);
        groupEl.appendChild(el);
      });
      this.el.appendChild(groupEl);
    });
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

    const select = createElement('select', {
      class: 'asn-select',
      title: def.tooltip || '',
      'data-btn': def.name,
      'aria-label': def.tooltip || def.name,
    });

    // Blank "placeholder" option
    const placeholder = createElement('option', { value: '' }, ['Font']);
    select.appendChild(placeholder);

    items.forEach((font) => {
      const opt = createElement('option', { value: font }, [font]);
      opt.style.fontFamily = font;
      select.appendChild(opt);
    });

    const disposer = on(select, 'change', (e) => {
      const value = e.target.value;
      if (!value) return;
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
    const baseClass = useBootstrap ? (this.options.toolbarButtonClass || 'btn btn-sm btn-light') : `asn-btn`;
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
    const useFA = !!this.options.useFontAwesome;

    const hasFontAwesome = () => {
      if (!useFA) return false;
      // Fast heuristic: check for common FA classes in the document or stylesheet hrefs
      if (document.querySelector('.fa, .fas, .far, .fal, .fab, .fa-solid')) return true;
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.href || '').join(' ');
      return /fontawesome|font-awesome|use\.fontawesome|all\.css/.test(links);
    };

    // Heroicons-style stroke SVGs — consistent with context menu icons
    const S = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const svgWrap = (paths) => `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ${S} style="display:block">${paths}</svg>`;

    const svgMap = new Map([
      // Format
      ['bold',          svgWrap('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>')],
      ['italic',        svgWrap('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>')],
      ['underline',     svgWrap('<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>')],
      ['strikethrough', svgWrap('<path d="M17.3 12H6.7"/><path d="M10 6.5C10 5.1 11.1 4 12.5 4c1.4 0 2.5 1.1 2.5 2.5 0 .8-.4 1.5-1 2"/><path d="M14 17.5C14 19 12.9 20 11.5 20 10.1 20 9 18.9 9 17.5c0-.8.4-1.5 1-2"/>')],
      ['superscript',   svgWrap('<path d="m4 19 8-8"/><path d="m12 19-8-8"/><path d="M20 12h-4c0-1.5.44-2 1.5-2.5S20 8.33 20 7.25C20 6 19 5 17.5 5S15 6 15 7"/>')],
      ['subscript',     svgWrap('<path d="m4 5 8 8"/><path d="m12 5-8 8"/><path d="M20 21h-4c0-1.5.44-2 1.5-2.5S20 17.33 20 16.25C20 15 19 14 17.5 14S15 15 15 16"/>')],
      // Alignment
      ['align-left',    svgWrap('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>')],
      ['align-center',  svgWrap('<line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
      ['align-right',   svgWrap('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>')],
      ['align-justify', svgWrap('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')],
      // Lists
      ['list-ul',       svgWrap('<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>')],
      ['list-ol',       svgWrap('<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1V3"/><path d="M4 10h2l-2 2h2"/><path d="M4 16.5A1.5 1.5 0 0 1 5.5 15a1.5 1.5 0 0 1 0 3H4"/>')],
      ['indent',        svgWrap('<polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
      ['outdent',       svgWrap('<polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>')],
      // History
      ['undo',          svgWrap('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>')],
      ['redo',          svgWrap('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>')],
      // Insert
      ['minus',         svgWrap('<line x1="5" y1="12" x2="19" y2="12"/>')],
      ['link',          svgWrap('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>')],
      ['image',         svgWrap('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>')],
      // View
      ['code',          svgWrap('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>')],
      ['expand',        svgWrap('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>')],
    ]);

    const faPrefix = this.options.fontAwesomeClass || 'fas';
    const faMap = new Map([
      ['bold', 'fa-bold'],
      ['italic', 'fa-italic'],
      ['underline', 'fa-underline'],
      ['strikethrough', 'fa-strikethrough'],
      ['superscript', 'fa-superscript'],
      ['subscript', 'fa-subscript'],
      ['align-left', 'fa-align-left'],
      ['align-center', 'fa-align-center'],
      ['align-right', 'fa-align-right'],
      ['align-justify', 'fa-align-justify'],
      ['list-ul', 'fa-list-ul'],
      ['list-ol', 'fa-list-ol'],
      ['indent', 'fa-indent'],
      ['outdent', 'fa-outdent'],
      ['undo', 'fa-rotate-left'],
      ['redo', 'fa-rotate-right'],
      ['minus', 'fa-minus'],
      ['link', 'fa-link'],
      ['image', 'fa-image'],
      ['code', 'fa-code'],
      ['expand', 'fa-expand'],
    ]);

    const useFaNow = hasFontAwesome();
    if (useFaNow) {
      const faName = faMap.get(btnDef.icon) || faMap.get(btnDef.name) || null;
      if (faName) {
        btn.innerHTML = `<i class="${faPrefix} ${faName}" aria-hidden="true"></i>`;
      } else if (svgMap.has(btnDef.icon)) {
        btn.innerHTML = svgMap.get(btnDef.icon);
      } else {
        btn.textContent = btnDef.icon || btnDef.name;
      }
    } else {
      // FontAwesome absent: use SVG fallback when available
      if (svgMap.has(btnDef.icon)) {
        btn.innerHTML = svgMap.get(btnDef.icon);
      } else if (svgMap.has(btnDef.name)) {
        btn.innerHTML = svgMap.get(btnDef.name);
      } else {
        btn.textContent = btnDef.icon || btnDef.name;
      }
    }

    const disposer = on(btn, 'click', (event) => {
      event.preventDefault();
      // Restore focus to the editor before executing the action
      this.context.invoke('editor.focus');
      btnDef.action(this.context);
      this.refresh();
    });

    this._disposers.push(disposer);
    return btn;
  }

  // ---------------------------------------------------------------------------
  // State refresh (active / disabled states)
  // ---------------------------------------------------------------------------

  refresh() {
    if (!this.el) return;
    const toolbar = this.options.toolbar || [];
    const btnMap = new Map(toolbar.flat().map((b) => [b.name, b]));

    // Sync button active states
    this.el.querySelectorAll('button[data-btn]').forEach((btn) => {
      const def = btnMap.get(btn.getAttribute('data-btn'));
      if (def && typeof def.isActive === 'function') {
        btn.classList.toggle('active', !!def.isActive(this.context));
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
