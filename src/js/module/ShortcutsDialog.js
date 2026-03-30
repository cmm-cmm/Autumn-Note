/**
 * ShortcutsDialog.js - Modal dialog listing all keyboard shortcuts.
 * Opened via the toolbar '?' button or Shift+? inside the editor.
 */

import { createElement, on } from '../core/dom.js';

const SHORTCUTS = [
  {
    category: 'Text Formatting',
    items: [
      { keys: 'Ctrl + B',         action: 'Bold' },
      { keys: 'Ctrl + I',         action: 'Italic' },
      { keys: 'Ctrl + U',         action: 'Underline' },
    ],
  },
  {
    category: 'History',
    items: [
      { keys: 'Ctrl + Z',                   action: 'Undo' },
      { keys: 'Ctrl + Y  /  Ctrl + Shift + Z', action: 'Redo' },
    ],
  },
  {
    category: 'Selection & Navigation',
    items: [
      { keys: 'Ctrl + A',    action: 'Select all content' },
      { keys: 'Tab',         action: 'Indent list item / insert spaces' },
      { keys: 'Shift + Tab', action: 'Outdent list item' },
    ],
  },
  {
    category: 'Editor',
    items: [
      { keys: 'Shift + ?', action: 'Show this keyboard shortcuts dialog' },
    ],
  },
];

export class ShortcutsDialog {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this._dialog = null;
    this._closeBtn = null;
    this._disposers = [];
  }

  initialize() {
    this._dialog = this._buildDialog();
    document.body.appendChild(this._dialog);
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._dialog && this._dialog.parentNode) {
      this._dialog.parentNode.removeChild(this._dialog);
    }
    this._dialog = null;
  }

  show() {
    if (this._dialog) {
      this._dialog.style.display = 'flex';
      setTimeout(() => this._closeBtn && this._closeBtn.focus(), 50);
    }
  }

  _close() {
    if (this._dialog) this._dialog.style.display = 'none';
  }

  _buildDialog() {
    const overlay = createElement('div', {
      class: 'asn-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Keyboard Shortcuts',
    });

    const box = createElement('div', { class: 'asn-dialog-box asn-shortcuts-box' });

    // Title row with close button
    const titleRow = createElement('div', { class: 'asn-icon-title-row' });
    const title = createElement('h3', { class: 'asn-dialog-title' });
    title.textContent = 'Keyboard Shortcuts';
    const closeBtn = createElement('button', {
      type: 'button',
      class: 'asn-icon-close',
      'aria-label': 'Close',
    });
    closeBtn.textContent = '×';
    this._closeBtn = closeBtn;
    titleRow.append(title, closeBtn);
    box.appendChild(titleRow);

    SHORTCUTS.forEach(({ category, items }) => {
      const catEl = createElement('div', { class: 'asn-shortcuts-cat' });
      catEl.textContent = category;
      box.appendChild(catEl);

      const table = createElement('div', { class: 'asn-shortcuts-table' });
      items.forEach(({ keys, action }) => {
        const row = createElement('div', { class: 'asn-shortcuts-row' });
        const keyEl = createElement('span', { class: 'asn-shortcuts-key' });
        keyEl.textContent = keys;
        const actEl = createElement('span', { class: 'asn-shortcuts-action' });
        actEl.textContent = action;
        row.append(keyEl, actEl);
        table.appendChild(row);
      });
      box.appendChild(table);
    });

    overlay.appendChild(box);

    const d1 = on(closeBtn, 'click', () => this._close());
    const d2 = on(overlay, 'click', (e) => { if (e.target === overlay) this._close(); });
    const d3 = on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && this._dialog && this._dialog.style.display !== 'none') {
        this._close();
      }
    });
    this._disposers.push(d1, d2, d3);

    return overlay;
  }
}
