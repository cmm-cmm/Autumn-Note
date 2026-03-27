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
  image: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
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
  }

  initialize() {
    this.el = createElement('div', { class: 'asn-contextmenu', role: 'menu', 'aria-hidden': 'true' });
    this.el.style.display = 'none';
    document.body.appendChild(this.el);

    this._renderItems();

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
    this._disposers.forEach((d) => { try { d(); } catch (e) {} });
    this._disposers = [];
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
  }

  _renderItems() {
    if (!this.el) return;
    this.el.innerHTML = '';
    this._items.forEach((it) => {
      if (it.separator || it.sep) {
        const sep = createElement('div', { class: 'asn-context-sep' });
        this.el.appendChild(sep);
        return;
      }

      const btn = createElement('button', { type: 'button', class: 'asn-context-item', 'data-name': it.name || '' });

      // Icon
      if (it.icon) {
        const iconSpan = createElement('span', { class: 'asn-context-icon', 'aria-hidden': 'true' });
        iconSpan.innerHTML = it.icon;
        btn.appendChild(iconSpan);
      }

      // Label
      const labelSpan = createElement('span', { class: 'asn-context-label' }, [it.label || it.name]);
      btn.appendChild(labelSpan);

      const off = on(btn, 'click', (e) => {
        e.stopPropagation();
        this.hide();
        try { it.action(this.context); } catch (err) { console.error(err); }
      });
      this._disposers.push(off);
      this.el.appendChild(btn);
    });
  }

  _onContextMenu(event) {
    const editable = this.context.layoutInfo && this.context.layoutInfo.editable;
    if (!editable) return;
    if (!editable.contains(event.target)) return;
    event.preventDefault();
    this._renderItems();
    this.showAt(event.clientX, event.clientY);
  }

  _maybeHide(event) {
    if (!this.el) return;
    if (!this.el.contains(event.target)) this.hide();
  }

  showAt(x, y) {
    if (!this.el) return;
    this.el.style.display = 'block';
    const rect = this.el.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 8;
    if (top + rect.height > window.innerHeight) top = window.innerHeight - rect.height - 8;
    this.el.style.left = left + 'px';
    this.el.style.top = top + 'px';
    this.el.setAttribute('aria-hidden', 'false');
  }

  hide() {
    if (!this.el) return;
    this.el.style.display = 'none';
    this.el.setAttribute('aria-hidden', 'true');
  }
}

export default ContextMenu;
