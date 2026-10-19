/**
 * ShortcutsDialog.js - Modal dialog listing all keyboard shortcuts.
 * Opened via the toolbar '?' button or Shift+? inside the editor.
 */

import { createElement, on, svgIcon } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';
import { en } from '../i18n/en.js';
import { DEFAULT_KEYMAP, parseCombo, comboId, formatCombo, resolveKeyMap } from '../core/keymap.js';

/**
 * Id used to compare a shortcut shown in the dialog with a keyMap combo.
 * The dialog writes every Ctrl/Cmd shortcut as "Ctrl", so Ctrl and Mod match.
 * @param {import('../core/keymap.js').ParsedCombo} parsed
 * @returns {string}
 */
function _displayId(parsed) {
  return comboId({ ...parsed, mod: parsed.mod || parsed.ctrl, ctrl: false });
}


const ICON_SVG = svgIcon(`<rect x="2" y="7" width="20" height="14"/><path d="M6 11h.01M10 11h.01M14 11h.01M18 11h.01M6 15h.01M18 15h.01M10 15h4"/><path d="M7 3l5 4 5-4"/>`, 18);

export class ShortcutsDialog extends BaseDialog {
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  show() {
    // keyMap can change through updateOptions(); re-render the list each time.
    if (this._listEl) this._renderShortcuts(this._listEl);
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

    this._listEl = createElement('div', { class: 'an-shortcuts-list' });
    this._renderShortcuts(this._listEl);
    box.appendChild(this._listEl);

    const d1 = on(closeBtn, 'click', () => this._close());
    this._disposers.push(d1);

    return overlay;
  }

  /**
   * Fills the list: the locale's built-in shortcuts minus any the keyMap
   * disabled or reassigned, then a "Custom" section for the keyMap's own
   * bindings.
   * @param {HTMLElement} listEl
   */
  _renderShortcuts(listEl) {
    listEl.textContent = '';
    const L = this.context.locale.shortcutsDialog;
    // A context without the editor module (e.g. a bare test context) shows the defaults.
    const bindings = this.context.invoke?.('editor.getKeyBindings') || resolveKeyMap(null);

    // Default combos that no longer run their default command
    const active = new Map(bindings.map((b) => [_displayId(b.parsed), b.command]));
    const suppressed = new Set();
    for (const [combo, command] of Object.entries(DEFAULT_KEYMAP)) {
      const id = _displayId(parseCombo(combo));
      if (active.get(id) !== command) suppressed.add(id);
    }

    const sections = (L.shortcuts || en.shortcutsDialog.shortcuts).map(({ category, items }) => ({
      category,
      items: items.flatMap(({ keys, action }) => {
        // Alternatives are separated by a spaced slash ("Ctrl + Y  /  Ctrl + Shift + Z");
        // a bare "/" is a key ("Ctrl + Shift + /").
        const kept = keys.split(/\s+\/\s+/).map((k) => k.trim()).filter((k) => {
          const parsed = parseCombo(k.replace(/\s+/g, ''));
          return !parsed || !suppressed.has(_displayId(parsed));
        });
        return kept.length ? [{ keys: kept.join('  /  '), action }] : [];
      }),
    }));

    // Bindings that are not simply a default
    const defaults = new Map(Object.entries(DEFAULT_KEYMAP)
      .map(([combo, command]) => [comboId(parseCombo(combo)), command]));
    const custom = bindings
      .filter((b) => defaults.get(comboId(b.parsed)) !== b.command)
      .map((b) => ({ keys: formatCombo(b.parsed), action: this._describe(b) }));
    if (custom.length) sections.push({ category: L.customCategory || 'Custom', items: custom });

    for (const { category, items } of sections) {
      if (!items.length) continue;
      const catEl = createElement('div', { class: 'an-shortcuts-cat' });
      catEl.textContent = category;
      listEl.appendChild(catEl);

      const table = createElement('div', { class: 'an-shortcuts-table' });
      for (const { keys, action } of items) {
        const row = createElement('div', { class: 'an-shortcuts-row' });
        const keyEl = createElement('span', { class: 'an-shortcuts-key' });
        keyEl.textContent = keys;
        const actEl = createElement('span', { class: 'an-shortcuts-action' });
        actEl.textContent = action;
        row.append(keyEl, actEl);
        table.appendChild(row);
      }
      listEl.appendChild(table);
    }
  }

  /**
   * Label for a custom binding: its description, else the toolbar tooltip of
   * the command it names, else the command name.
   * @param {import('../core/keymap.js').KeyBinding} binding
   * @returns {string}
   */
  _describe(binding) {
    if (binding.description) return binding.description;
    if (typeof binding.command === 'string') {
      const label = this.context.locale.toolbar?.[binding.command];
      return typeof label === 'string' ? label : binding.command;
    }
    return this.context.locale.shortcutsDialog.customCategory || 'Custom';
  }
}
