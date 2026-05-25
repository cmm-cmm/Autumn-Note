/**
 * LinkDialog.js - Dialog for inserting / editing hyperlinks
 * Inspired by Summernote's LinkDialog — rewritten without jQuery
 */

import { createElement, on } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

export class LinkDialog extends BaseDialog {
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Opens the link dialog.
   * Pre-fills with the currently selected link if present.
   */
  show() {
    this._saveRange();
    this._prefill();
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const L = this.context.locale.linkDialog;
    const { overlay, box } = this._buildDialogShell(L.ariaLabel, ICON_SVG, L.title);

    // URL field
    const urlLabel = createElement('label', { class: 'an-label' });
    urlLabel.textContent = L.url;
    const urlInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'url',
      class: 'an-input',
      placeholder: L.urlPlaceholder,
      id: 'an-link-url',
      name: 'url',
      autocomplete: 'off',
    }));
    this._urlInput = urlInput;
    this._firstInput = urlInput;

    // Text field
    const textLabel = createElement('label', { class: 'an-label' });
    textLabel.textContent = L.displayText;
    const textInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'text',
      class: 'an-input',
      placeholder: L.textPlaceholder,
      id: 'an-link-text',
      name: 'linkText',
      autocomplete: 'off',
    }));
    this._textInput = textInput;

    // Open in new tab
    const tabLabel = createElement('label', { class: 'an-label an-label-inline' });
    const tabCheckbox = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'checkbox',
      id: 'an-link-newtab',
      name: 'openInNewTab',
    }));
    this._tabCheckbox = tabCheckbox;
    tabLabel.appendChild(tabCheckbox);
    tabLabel.appendChild(document.createTextNode(' ' + L.openInNewTab));

    const btnRow = this._buildButtonRow(L.insertBtn, L.cancelBtn, () => this._onInsert());

    box.append(urlLabel, urlInput, textLabel, textInput, tabLabel, btnRow);

    const d4 = on(urlInput,  'keydown', (e) => { if (/** @type {KeyboardEvent} */ (e).key === 'Enter') { e.preventDefault(); this._onInsert(); } });
    const d5 = on(textInput, 'keydown', (e) => { if (/** @type {KeyboardEvent} */ (e).key === 'Enter') { e.preventDefault(); this._onInsert(); } });
    this._disposers.push(d4, d5);

    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  _prefill() {
    // Try to find currently selected anchor
    const sel = globalThis.getSelection();
    let anchor = null;
    if (sel && sel.rangeCount > 0) {
      let node = sel.getRangeAt(0).startContainer;
      while (node) {
        if (node.nodeName === 'A') { anchor = node; break; }
        node = node.parentNode;
      }
    }
    if (anchor) {
      this._urlInput.value = /** @type {Element} */ (anchor).getAttribute('href') || '';
      this._textInput.value = anchor.textContent || '';
      this._tabCheckbox.checked = /** @type {Element} */ (anchor).getAttribute('target') === '_blank';
    } else {
      this._urlInput.value = '';
      this._textInput.value = sel ? sel.toString() : '';
      this._tabCheckbox.checked = false;
    }
  }

  _onInsert() {
    let url = this._urlInput.value.trim();
    const text = this._textInput.value.trim();
    const newTab = this._tabCheckbox.checked;

    if (!url) {
      this._urlInput.focus();
      return;
    }

    // Auto-prefix with https:// if no protocol is present
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      url = 'https://' + url;
    }

    // Block unsafe protocols
    try {
      const parsed = new URL(url);
      if (/^javascript:/i.test(parsed.protocol) || /^vbscript:/i.test(parsed.protocol) || /^data:/i.test(parsed.protocol)) {
        this._urlInput.focus();
        return;
      }
    } catch {
      // URL constructor failed — not a valid URL
      this._urlInput.focus();
      return;
    }

    // Restore selection then insert
    if (this._savedRange) {
      this._savedRange.select();
    }

    this.context.invoke('editor.insertLink', url, text, newTab);
    this._close();
  }
}
