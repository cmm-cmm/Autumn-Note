import { createElement, on, trapFocus, makeDraggable, portalOf, setIcon } from '../core/dom.js';
import { withSavedRange } from '../core/range.js';

/** Source of unique ids for dialog titles (aria-labelledby targets). */
let titleSeq = 0;

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
    /** @type {HTMLElement|null} Element focused before the dialog opened. */
    this._returnFocus = null;
  }

  // ---------------------------------------------------------------------------
  // Abstract — subclasses must override
  // ---------------------------------------------------------------------------

  /** @returns {HTMLElement} */
  _buildDialog() { throw new Error('_buildDialog() must be implemented by subclass'); }

  // ---------------------------------------------------------------------------
  // Lifecycle (shared)
  // ---------------------------------------------------------------------------

  initialize() {
    this._dialog = this._buildDialog();
    portalOf(this.context).appendChild(this._dialog);
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
      const active = /** @type {HTMLElement|null} */ (document.activeElement);
      this._returnFocus = active && active !== document.body && !this._dialog.contains(active) ? active : null;
      this._dialog.style.display = 'flex';
      this._removeTrap = trapFocus(this._dialog, () => this._close());
      setTimeout(() => this._firstInput?.focus(), 50);
    }
  }

  /**
   * Hides the dialog and puts keyboard focus back where the user was.
   *
   * Dismissing (Cancel, Escape, overlay click) returns focus to the element
   * that opened the dialog, or to the editable with the saved selection when
   * that element is gone. After an insert, pass `{ toEditor: true }`: the
   * caller has already placed the caret after the new content, so focus moves
   * to the editable and that caret is kept rather than the stale saved range.
   * @param {{ toEditor?: boolean }} [opts]
   */
  _close({ toEditor = false } = {}) {
    const dialog = this._dialog;
    const wasOpen = !!dialog && dialog.style.display !== 'none';
    if (dialog) dialog.style.display = 'none';
    if (this._removeTrap) { this._removeTrap(); this._removeTrap = null; }
    const savedRange = this._savedRange;
    const returnFocus = this._returnFocus;
    this._savedRange = null;
    this._returnFocus = null;
    if (!wasOpen) return;

    // Only move focus that the dialog itself holds (or that was lost to
    // <body>); a subclass or the host page that already focused something
    // else keeps it.
    const active = document.activeElement;
    if (active && active !== document.body && !dialog.contains(active)) return;

    if (toEditor) { this._focusEditable(); return; }
    const editable = this.context.layoutInfo?.editable;
    if (returnFocus?.isConnected && returnFocus !== editable) {
      returnFocus.focus({ preventScroll: true });
      if (document.activeElement === returnFocus) return;
    }
    this._focusEditable(savedRange);
  }

  /**
   * Focuses the editable without losing the caret: focusing can reset the
   * selection in some browsers, so the live (or given saved) range is re-applied.
   * @param {import('../core/range.js').WrappedRange|null} [savedRange]
   */
  _focusEditable(savedRange = null) {
    const editable = this.context.layoutInfo?.editable;
    if (!editable) return;
    const sel = globalThis.getSelection();
    const live = sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    editable.focus({ preventScroll: true });
    let saved = null;
    try { saved = savedRange?.toNativeRange() ?? null; } catch { saved = null; } // stale after a DOM change
    if (sel && saved && editable.contains(saved.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(saved);
    } else if (sel && live && editable.contains(live.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(live);
    }
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
    const titleId = `an-dialog-title-${++titleSeq}`;
    const overlay = createElement('div', {
      class: 'an-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': ariaLabel,
      'aria-labelledby': titleId,
    });
    const box = createElement('div', { class: 'an-dialog-box' });

    const header = createElement('div', { class: 'an-dialog-header' });
    const iconEl = createElement('span', { class: 'an-dialog-icon', 'aria-hidden': 'true' });
    setIcon(iconEl, iconHtml);
    const titleEl = createElement('h3', { class: 'an-dialog-title', id: titleId });
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
    // Cancel first, primary last: the commit action sits at the end of the
    // reading and tab order, where the eye and the Tab key finish.
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(insertBtn);

    const d1 = on(insertBtn, 'click', onInsert);
    const d2 = on(cancelBtn, 'click', () => this._close());
    this._disposers.push(d1, d2);

    return btnRow;
  }
}
