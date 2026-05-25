import { createElement, on, trapFocus, makeDraggable } from '../core/dom.js';
import { withSavedRange } from '../core/range.js';

/**
 * Shared lifecycle and shell-building logic for all modal dialogs.
 * Subclasses implement _buildDialog() for their specific form fields.
 */
export class BaseDialog {
  /** @param {import('../Context.js').Context} context */
  constructor(context) {
    this.context = context;
    this.options = context.options;
    /** @type {HTMLElement|null} */
    this._dialog = null;
    this._disposers = [];
    this._savedRange = null;
    /** @type {HTMLElement|null} First focusable input; set by subclass in _buildDialog(). */
    this._firstInput = null;
    this._removeTrap = null;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle (shared)
  // ---------------------------------------------------------------------------

  initialize() {
    this._dialog = this._buildDialog();
    document.body.appendChild(this._dialog);
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._dialog?.parentNode) {
      this._dialog.remove();
    }
    this._dialog = null;
  }

  // ---------------------------------------------------------------------------
  // Shared show helpers
  // ---------------------------------------------------------------------------

  /** Saves the current selection range before opening the dialog. */
  _saveRange() {
    withSavedRange((range) => { this._savedRange = range; });
  }

  _open() {
    if (this._dialog) {
      this._dialog.style.display = 'flex';
      this._removeTrap = trapFocus(this._dialog, () => this._close());
      setTimeout(() => this._firstInput && this._firstInput.focus(), 50);
    }
  }

  _close() {
    if (this._dialog) this._dialog.style.display = 'none';
    if (this._removeTrap) { this._removeTrap(); this._removeTrap = null; }
    this._savedRange = null;
  }

  // ---------------------------------------------------------------------------
  // Shell builders (used by subclass _buildDialog())
  // ---------------------------------------------------------------------------

  /**
   * Builds the overlay + box + header shell common to all dialogs.
   * Also wires up draggable and overlay-click-to-close.
   * @param {string} ariaLabel
   * @param {string} iconHtml  Raw SVG string for the dialog icon
   * @param {string} titleText
   * @returns {{ overlay: HTMLElement, box: HTMLElement }}
   */
  _buildDialogShell(ariaLabel, iconHtml, titleText) {
    const overlay = createElement('div', {
      class: 'an-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': ariaLabel,
    });
    const box = createElement('div', { class: 'an-dialog-box' });

    const header = createElement('div', { class: 'an-dialog-header' });
    const iconEl = createElement('span', { class: 'an-dialog-icon' });
    iconEl.innerHTML = iconHtml;
    const titleEl = createElement('h3', { class: 'an-dialog-title' });
    titleEl.textContent = titleText;
    header.appendChild(iconEl);
    header.appendChild(titleEl);

    box.appendChild(header);
    overlay.appendChild(box);
    makeDraggable(header, box);

    const d = on(overlay, 'click', (e) => { if (e.target === overlay) this._close(); });
    this._disposers.push(d);

    return { overlay, box };
  }

  /**
   * Builds an action button row with a primary insert button and a cancel button.
   * Disposers are registered automatically.
   * @param {string} insertLabel
   * @param {string} cancelLabel
   * @param {() => void} onInsert
   * @returns {HTMLElement}
   */
  _buildButtonRow(insertLabel, cancelLabel, onInsert) {
    const btnRow = createElement('div', { class: 'an-dialog-actions' });
    const insertBtn = createElement('button', { type: 'button', class: 'an-btn an-btn-primary' });
    insertBtn.textContent = insertLabel;
    const cancelBtn = createElement('button', { type: 'button', class: 'an-btn' });
    cancelBtn.textContent = cancelLabel;
    btnRow.appendChild(insertBtn);
    btnRow.appendChild(cancelBtn);

    const d1 = on(insertBtn, 'click', onInsert);
    const d2 = on(cancelBtn, 'click', () => this._close());
    this._disposers.push(d1, d2);

    return btnRow;
  }
}
