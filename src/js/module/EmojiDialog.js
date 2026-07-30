/**
 * EmojiDialog.js - Browse and insert Unicode emoji / symbols (UTF-8 / utf8mb4)
 * Click an emoji to insert it directly at the caret — no extra "Insert" step.
 */

import { createElement, on, makeDraggable } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';

/**
 * Resolved emoji catalogue, shared by every editor instance on the page.
 * @type {{ EMOJI_CATS: Array, EMOJI_LIST: Array }|null}
 */
let _emojiData = null;
/** @type {Promise<{ EMOJI_CATS: Array, EMOJI_LIST: Array }>|null} */
let _emojiDataPromise = null;

/**
 * Loads the emoji catalogue on first use. The table is ~25 KB (≈6 KB gzip),
 * so it is split into its own chunk rather than shipped to every consumer —
 * including those whose toolbar never shows an emoji button.
 * @returns {Promise<{ EMOJI_CATS: Array, EMOJI_LIST: Array }>}
 */
function loadEmojiData() {
  if (_emojiData) return Promise.resolve(_emojiData);
  _emojiDataPromise ??= import('./emoji-data.js').then((mod) => {
    _emojiData = { EMOJI_CATS: mod.EMOJI_CATS, EMOJI_LIST: mod.EMOJI_LIST };
    return _emojiData;
  });
  return _emojiDataPromise;
}

// ---------------------------------------------------------------------------
// Dialog class
// ---------------------------------------------------------------------------

export class EmojiDialog extends BaseDialog {
  _activeCat = 'all';

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    // Grid is built lazily in show() to avoid ~500 DOM nodes at load time.
    return this;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Opens the picker, fetching the emoji catalogue chunk on first call.
   * Awaiting is optional — the dialog opens on its own once data arrives.
   * @returns {Promise<void>}
   */
  async show() {
    // Capture the caret before awaiting: the selection must be read while the
    // click that opened the dialog is still the current interaction.
    this._saveRange();

    if (!this._dialog) {
      const { EMOJI_CATS, EMOJI_LIST } = await loadEmojiData();
      // A second show() may have won the race while this one awaited.
      if (!this._dialog) {
        this._cats = EMOJI_CATS;
        this._list = EMOJI_LIST;
        this._dialog = this._buildDialog();
        document.body.appendChild(this._dialog);
      }
    }
    this._activeCat = 'all';
    this._searchInput.value = '';
    this._updateCatTabs();
    this._filterEmojis('', 'all');
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const L = this.context.locale.emojiDialog;
    const overlay = createElement('div', {
      class: 'an-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': L.ariaLabel,
    });
    const box = createElement('div', { class: 'an-dialog-box an-emoji-box' });

    // Title row
    const titleRow = createElement('div', { class: 'an-icon-title-row' });
    const titleGroup = createElement('div', { class: 'an-dialog-title-group' });
    const iconEl = createElement('span', { class: 'an-dialog-icon an-dialog-icon--sm' });
    iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;
    const title = createElement('h3', { class: 'an-dialog-title' });
    title.textContent = L.title;
    titleGroup.append(iconEl, title);
    const closeBtn = createElement('button', { type: 'button', class: 'an-icon-close', 'aria-label': L.close });
    closeBtn.innerHTML = '&times;';
    titleRow.append(titleGroup, closeBtn);

    // Search
    const searchInput = /** @type {HTMLInputElement} */ (createElement('input', {
      type: 'search',
      class: 'an-input an-icon-search',
      placeholder: L.searchPlaceholder,
      autocomplete: 'off',
    }));
    this._searchInput = searchInput;

    // Category tabs
    const catBar = createElement('div', { class: 'an-icon-cats' });
    const allTab = createElement('button', { type: 'button', class: 'an-icon-cat active', 'data-cat': 'all' });
    allTab.textContent = L.all;
    catBar.appendChild(allTab);
    this._cats.forEach(({ id, label }) => {
      const tab = createElement('button', { type: 'button', class: 'an-icon-cat', 'data-cat': id });
      tab.textContent = L.categories?.[id] || label;
      catBar.appendChild(tab);
    });
    this._catBar = catBar;

    // Emoji grid — one button per emoji, click = immediate insert
    const grid = createElement('div', { class: 'an-emoji-grid' });
    this._list.forEach(([char, keywords, cat]) => {
      const cell = createElement('button', {
        type: 'button',
        class: 'an-emoji-cell',
        'data-char': char,
        'data-keywords': keywords,
        'data-cat': cat,
        title: keywords.split(' ').slice(0, 2).join(' '),
      });
      cell.textContent = char;
      grid.appendChild(cell);
    });
    this._grid = grid;
    this._firstInput = searchInput;

    // Cancel only — clicking an emoji inserts immediately
    const btnRow = createElement('div', { class: 'an-dialog-actions' });
    const cancelBtn = createElement('button', { type: 'button', class: 'an-btn' });
    cancelBtn.textContent = L.cancelBtn;
    btnRow.appendChild(cancelBtn);

    box.append(titleRow, searchInput, catBar, grid, btnRow);
    overlay.appendChild(box);
    makeDraggable(titleRow, box);

    // Events
    const d1 = on(closeBtn,    'click',  () => this._close());
    const d2 = on(cancelBtn,   'click',  () => this._close());
    const d3 = on(overlay,     'click',  (e) => { if (e.target === overlay) this._close(); });
    const d4 = on(searchInput, 'input',  () => this._filterEmojis(searchInput.value, this._activeCat));
    const d5 = on(catBar,      'click',  (e) => {
      const tab = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target)?.closest('[data-cat]'));
      if (tab) {
        this._activeCat = tab.dataset.cat;
        this._updateCatTabs();
        this._filterEmojis(this._searchInput.value, this._activeCat);
      }
    });
    const d6 = on(grid, 'click', (e) => {
      const cell = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target)?.closest('.an-emoji-cell'));
      if (cell) this._onEmojiClick(cell.dataset.char);
    });
    this._disposers.push(d1, d2, d3, d4, d5, d6);
    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Filter
  // ---------------------------------------------------------------------------

  _updateCatTabs() {
    this._catBar.querySelectorAll('.an-icon-cat').forEach((tab) => {
      tab.classList.toggle('active', /** @type {HTMLElement} */ (tab).dataset.cat === this._activeCat);
    });
  }

  _filterEmojis(query, cat) {
    const q = (query || '').trim().toLowerCase();
    let count = 0;
    this._grid.querySelectorAll('.an-emoji-cell').forEach((cell) => {
      const hCell = /** @type {HTMLElement} */ (cell);
      const matchCat   = !cat || cat === 'all' || hCell.dataset.cat === cat;
      const matchQuery = !q || hCell.dataset.keywords.includes(q) || hCell.dataset.char === q;
      const visible = matchCat && matchQuery;
      hCell.style.display = visible ? '' : 'none';
      if (visible) count++;
    });
    let empty = this._grid.querySelector('.an-icon-empty');
    if (!empty) {
      empty = createElement('div', { class: 'an-icon-empty' });
      empty.textContent = 'No emojis found';
      this._grid.appendChild(empty);
    }
    /** @type {HTMLElement} */ (empty).style.display = count > 0 ? 'none' : '';
  }

  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------

  _onEmojiClick(char) {
    const savedRange = this._savedRange;
    const editable   = this.context.layoutInfo.editable;

    // 1. Restore selection while dialog is still mounted (same pattern as ImageDialog)
    if (savedRange) savedRange.select();

    const sel = globalThis.getSelection();
    let range = sel?.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editable);
      range.collapse(false);
    }

    // 2. Insert emoji as a plain text node — no ZWS or execCommand needed.
    //    Text nodes are natively navigable so the caret lands cleanly after.
    //
    // E-1: When the range covers the entire content of a <td>/<th>,
    // deleteContents() can drift the range endpoint outside the cell in some
    // browsers.  Save the cell reference first and re-anchor after deletion.
    const _sc = range.startContainer;
    const _tdAnchor = /** @type {Element|null} */ (_sc.nodeType === 1 ? _sc : _sc.parentElement)
      ?.closest('td, th');
    range.deleteContents();
    if (_tdAnchor?.isConnected && !_tdAnchor.contains(range.startContainer)) {
      range.setStart(_tdAnchor, 0);
      range.collapse(true);
    }
    const textNode = document.createTextNode(char);
    range.insertNode(textNode);

    // 3. Place caret immediately after the emoji character
    range.setStartAfter(textNode);
    range.collapse(true);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // 4. Close and restore editor focus
    this._close();
    editable.focus();
    this.context.invoke('editor.afterCommand');
  }

}
