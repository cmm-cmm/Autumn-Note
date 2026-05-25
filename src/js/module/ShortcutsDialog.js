/**
 * ShortcutsDialog.js - Modal dialog listing all keyboard shortcuts.
 * Opened via the toolbar '?' button or Shift+? inside the editor.
 */

import { createElement, on } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';

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

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M6 11h.01M10 11h.01M14 11h.01M18 11h.01M6 15h.01M18 15h.01M10 15h4"/><path d="M7 3l5 4 5-4"/></svg>`;

export class ShortcutsDialog extends BaseDialog {
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  show() {
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const L = this.context.locale.shortcutsDialog;
    const { overlay, box } = this._buildDialogShell(L.ariaLabel, ICON_SVG, L.title);
    box.classList.add('an-shortcuts-box');

    // Close button pinned to the right of the header row
    const closeBtn = createElement('button', {
      type: 'button',
      class: 'an-icon-close',
      'aria-label': L.close,
      style: 'margin-left:auto',
    });
    closeBtn.textContent = '×';
    this._closeBtn = closeBtn;
    this._firstInput = closeBtn;
    box.querySelector('.an-dialog-header').appendChild(closeBtn);

    const shortcuts = this.context.locale.shortcutsDialog.shortcuts || SHORTCUTS;
    shortcuts.forEach(({ category, items }) => {
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

    const d1 = on(closeBtn, 'click', () => this._close());
    this._disposers.push(d1);

    return overlay;
  }
}
