/**
 * ShortcutsDialog.js - Modal dialog listing all keyboard shortcuts.
 * Opened via the toolbar '?' button or Shift+? inside the editor.
 */

import { createElement, on, trapFocus } from '../core/dom.js';

const SHORTCUTS = [
  {
    category: 'Text Formatting',
    items: [
      { keys: 'Ctrl + B',         action: 'Bold' },
      { keys: 'Ctrl + I',         action: 'Italic' },
      { keys: 'Ctrl + U',         action: 'Underline' },
      { keys: 'Ctrl + K',         action: 'Insert / edit link' },
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
    category: 'Clipboard',
    items: [
      { keys: 'Ctrl + Shift + V', action: 'Paste as plain text' },
    ],
  },
  {
    category: 'Find & Replace',
    items: [
      { keys: 'Ctrl + F', action: 'Find in document' },
      { keys: 'Ctrl + H', action: 'Find & Replace' },
    ],
  },
  {
    category: 'Editor',
    items: [
      { keys: 'Ctrl + Shift + /', action: 'Show this keyboard shortcuts dialog' },
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
      this._removeTrap = trapFocus(this._dialog, () => this._close());
      setTimeout(() => this._closeBtn && this._closeBtn.focus(), 50);
    }
  }

  _close() {
    if (this._dialog) this._dialog.style.display = 'none';
    if (this._removeTrap) { this._removeTrap(); this._removeTrap = null; }
  }

  _buildDialog() {
    const overlay = createElement('div', {
      class: 'an-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Keyboard Shortcuts',
    });

    const box = createElement('div', { class: 'an-dialog-box an-shortcuts-box' });

    // Title row with close button
    const titleRow = createElement('div', { class: 'an-icon-title-row' });
    const title = createElement('h3', { class: 'an-dialog-title' });
    title.textContent = 'Keyboard Shortcuts';
    const closeBtn = createElement('button', {
      type: 'button',
      class: 'an-icon-close',
      'aria-label': 'Close',
    });
    closeBtn.textContent = '×';
    this._closeBtn = closeBtn;
    titleRow.append(title, closeBtn);
    box.appendChild(titleRow);

    SHORTCUTS.forEach(({ category, items }) => {
      const catEl = createElement('div', { class: 'an-shortcuts-cat' });
      catEl.textContent = category;
      box.appendChild(catEl);

      const table = createElement('div', { class: 'an-shortcuts-table' });
      items.forEach(({ keys, action }) => {
        const row = createElement('div', { class: 'an-shortcuts-row' });
        const keyEl = createElement('span', { class: 'an-shortcuts-key' });
        keyEl.textContent = keys;
        const actEl = createElement('span', { class: 'an-shortcuts-action' });
        actEl.textContent = action;
        row.append(keyEl, actEl);
        table.appendChild(row);
      });
      box.appendChild(table);
    });

    overlay.appendChild(box);

    const d1 = on(closeBtn, 'click', () => this._close());
    const d2 = on(overlay, 'click', (e) => { if (e.target === overlay) this._close(); });
    this._disposers.push(d1, d2);

    return overlay;
  }
}
