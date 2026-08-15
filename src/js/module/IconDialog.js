/**
 * IconDialog.js - Browse and insert FontAwesome Free icons
 */

import { createElement, on, makeDraggable } from '../core/dom.js';
import { BaseDialog } from './BaseDialog.js';

/** Fallback stylesheet URL when `options.fontAwesomeCDN` is absent. Mirrors settings.js. */
const FONT_AWESOME_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';

/**
 * Resolved icon catalogue, shared by every editor instance on the page.
 * @type {{ ICON_CATEGORIES: Array, ICON_LIST: Array }|null}
 */
let _iconData = null;
/** @type {Promise<{ ICON_CATEGORIES: Array, ICON_LIST: Array }>|null} */
let _iconDataPromise = null;

/**
 * Loads the icon catalogue on first use. Mirrors EmojiDialog's split: the table
 * is ~6 KB gzip of slugs that consumers without an icon button never render.
 * @returns {Promise<{ ICON_CATEGORIES: Array, ICON_LIST: Array }>}
 */
function loadIconData() {
  if (_iconData) return Promise.resolve(_iconData);
  _iconDataPromise ??= import('./icon-data.js').then((mod) => {
    _iconData = { ICON_CATEGORIES: mod.ICON_CATEGORIES, ICON_LIST: mod.ICON_LIST };
    return _iconData;
  });
  return _iconDataPromise;
}

export class IconDialog extends BaseDialog {
  _selectedIcon = null;
  _activeCat = 'all';

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    // Neither the FA stylesheet nor the grid is needed until the dialog opens —
    // both are deferred to show() so merely mounting an editor makes no
    // third-party request and builds no ~250 icon cells.
    return this;
  }

  /**
   * Injects FA 6 Free CSS from a CDN if it is not already on the page.
   * This guarantees icon glyphs render in the grid, preview, and in the
   * editor content after insertion — regardless of whether the host page
   * loaded FA itself.
   *
   * Opt out with `fontAwesomeAutoInject: false`, or point the request
   * somewhere self-hosted with `fontAwesomeCDN`.
   */
  _ensureFontAwesome() {
    if (this.context.options.fontAwesomeAutoInject === false) return;
    // Fall back to the default URL rather than the option value alone: modules
    // are constructible with a partial options object, and losing the glyphs
    // silently is worse than the request the consumer did not opt out of.
    const href = this.context.options.fontAwesomeCDN || FONT_AWESOME_CDN;
    if (!href) return;

    // Already present (icon element or stylesheet link)?
    if (document.getElementById('an-fontawesome-css')) return;
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((l) => /** @type {HTMLLinkElement} */ (l).href || '').join(' ');
    if (/fontawesome|font-awesome/.test(links)) return;
    if (document.querySelector('.fa-solid, .fas, .far, .fab')) return;

    const link = document.createElement('link');
    link.id   = 'an-fontawesome-css';
    link.rel  = 'stylesheet';
    link.href = href;
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    document.head.appendChild(link);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Opens the picker, fetching the icon catalogue chunk on first call.
   * Awaiting is optional — the dialog opens on its own once data arrives.
   * @returns {Promise<void>}
   */
  async show() {
    // Capture the caret before awaiting: the selection must be read while the
    // click that opened the dialog is still the current interaction.
    this._saveRange();
    this._ensureFontAwesome();

    if (!this._dialog) {
      const { ICON_CATEGORIES, ICON_LIST } = await loadIconData();
      // A second show() may have won the race while this one awaited.
      if (!this._dialog) {
        this._cats = ICON_CATEGORIES;
        this._list = ICON_LIST;
        this._dialog = this._buildDialog();
        document.body.appendChild(this._dialog);
      }
    }
    this._selectedIcon = null;
    this._activeCat = 'all';
    this._searchInput.value = '';
    // Clear previously selected icon highlight and disable Insert button
    this._grid.querySelectorAll('.an-icon-cell.active').forEach((c) => c.classList.remove('active'));
    this._insertBtn.setAttribute('disabled', '');
    this._updateCatTabs();
    this._filterIcons('', 'all');
    this._updatePreview(null);
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const L = this.context.locale.iconDialog;
    const overlay = createElement('div', {
      class: 'an-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': L.ariaLabel,
    });

    const box = createElement('div', { class: 'an-dialog-box an-icon-box' });

    // Title row
    const titleRow = createElement('div', { class: 'an-icon-title-row' });
    const titleGroup = createElement('div', { class: 'an-dialog-title-group' });
    const iconEl = createElement('span', { class: 'an-dialog-icon an-dialog-icon--sm' });
    iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;
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
    this._firstInput = searchInput;

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

    // Icon grid
    const grid = createElement('div', { class: 'an-icon-grid' });
    this._list.forEach(([name, cat]) => {
      const cell = createElement('button', { type: 'button', class: 'an-icon-cell', 'data-name': name, 'data-cat': cat, title: name });
      const icon = createElement('i', { class: 'fa-solid fa-' + name, 'aria-hidden': 'true' });
      const label = createElement('span');
      label.textContent = name;
      cell.append(icon, label);
      grid.appendChild(cell);
    });
    this._grid = grid;

    // Options row: style + size + color
    const optRow = createElement('div', { class: 'an-icon-options' });

    const styleLabel = createElement('label', { class: 'an-label' });
    styleLabel.textContent = L.style;
    const styleSelect = /** @type {HTMLSelectElement} */ (createElement('select', { class: 'an-input an-icon-option-select' }));
    [['fa-solid', 'Solid'], ['fa-regular', 'Regular'], ['fa-light', 'Light (Pro)']].forEach(([v, t]) => {
      const opt = createElement('option', { value: v });
      opt.textContent = t;
      styleSelect.appendChild(opt);
    });
    styleSelect.value = 'fa-solid';
    this._styleSelect = styleSelect;

    const sizeLabel = createElement('label', { class: 'an-label' });
    sizeLabel.textContent = L.size;
    const sizeSelect = /** @type {HTMLSelectElement} */ (createElement('select', { class: 'an-input an-icon-option-select' }));
    [['', 'Inherit'], ['0.75em', '0.75em'], ['1em', '1em'], ['1.25em', '1.25em'], ['1.5em', '1.5em'], ['2em', '2em'], ['3em', '3em']].forEach(([v, t]) => {
      const opt = /** @type {HTMLOptionElement} */ (createElement('option', { value: v }));
      if (v === '1em') opt.selected = true;
      opt.textContent = t;
      sizeSelect.appendChild(opt);
    });
    this._sizeSelect = sizeSelect;

    const colorLabel = createElement('label', { class: 'an-label' });
    colorLabel.textContent = L.color;
    const colorInput = /** @type {HTMLInputElement} */ (createElement('input', { type: 'color', class: 'an-icon-color', value: '#000000' }));
    this._colorInput = colorInput;

    const useColorLabel = createElement('label', { class: 'an-label an-label-inline an-icon-use-color' });
    const useColorCb = /** @type {HTMLInputElement} */ (createElement('input', { type: 'checkbox', checked: '' }));
    this._useColorCb = useColorCb;
    useColorLabel.append(useColorCb, document.createTextNode(L.useColor));

    optRow.append(styleLabel, styleSelect, sizeLabel, sizeSelect, colorLabel, colorInput, useColorLabel);

    // Preview
    const preview = createElement('div', { class: 'an-icon-preview' });
    const previewHint = createElement('span', { class: 'an-icon-preview-hint' });
    previewHint.textContent = L.selectHint;
    preview.appendChild(previewHint);
    this._preview = preview;

    // Actions
    const btnRow = createElement('div', { class: 'an-dialog-actions' });
    const insertBtn = createElement('button', { type: 'button', class: 'an-btn an-btn-primary', disabled: '' });
    insertBtn.textContent = L.insertBtn;
    const cancelBtn = createElement('button', { type: 'button', class: 'an-btn' });
    cancelBtn.textContent = L.cancelBtn;
    btnRow.append(insertBtn, cancelBtn);
    this._insertBtn = insertBtn;

    box.append(titleRow, searchInput, catBar, grid, optRow, preview, btnRow);
    overlay.appendChild(box);
    makeDraggable(titleRow, box);

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    const d1 = on(closeBtn,    'click',  () => this._close());
    const d2 = on(cancelBtn,   'click',  () => this._close());
    const d3 = on(insertBtn,   'click',  () => this._onInsert());
    const d4 = on(overlay,     'click',  (e) => { if (e.target === overlay) this._close(); });
    const d5 = on(searchInput, 'input',  () => this._filterIcons(searchInput.value, this._activeCat));
    const d6 = on(catBar,      'click',  (e) => {
      const tab = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target)?.closest('[data-cat]'));
      if (tab) {
        this._activeCat = tab.dataset.cat;
        this._updateCatTabs();
        this._filterIcons(this._searchInput.value, this._activeCat);
      }
    });
    const d7 = on(grid, 'click', (e) => {
      const cell = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target)?.closest('.an-icon-cell'));
      if (cell) this._selectIcon(cell.dataset.name);
    });
    const d8 = on(styleSelect, 'change', () => this._updatePreview(this._selectedIcon));
    const d9 = on(sizeSelect,  'change', () => this._updatePreview(this._selectedIcon));
    const d10 = on(colorInput, 'input',  () => this._updatePreview(this._selectedIcon));
    const d11 = on(useColorCb, 'change', () => this._updatePreview(this._selectedIcon));

    this._disposers.push(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);

    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Filter / select
  // ---------------------------------------------------------------------------

  _updateCatTabs() {
    this._catBar.querySelectorAll('.an-icon-cat').forEach((tab) => {
      tab.classList.toggle('active', /** @type {HTMLElement} */ (tab).dataset.cat === this._activeCat);
    });
  }

  _filterIcons(query, cat) {
    const q = (query || '').trim().toLowerCase();
    let visibleCount = 0;
    this._grid.querySelectorAll('.an-icon-cell').forEach((cell) => {
      const hCell = /** @type {HTMLElement} */ (cell);
      const name = hCell.dataset.name;
      const cellCat = hCell.dataset.cat;
      const matchesCat = !cat || cat === 'all' || cellCat === cat;
      const matchesQuery = !q || name.includes(q);
      const visible = matchesCat && matchesQuery;
      hCell.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });
    // Show empty state if needed
    let empty = this._grid.querySelector('.an-icon-empty');
    if (!empty) {
      empty = createElement('div', { class: 'an-icon-empty' });
      empty.textContent = 'No icons found';
      this._grid.appendChild(empty);
    }
    /** @type {HTMLElement} */ (empty).style.display = visibleCount > 0 ? 'none' : '';
  }

  _selectIcon(name) {
    this._selectedIcon = name;
    // Highlight selected cell
    this._grid.querySelectorAll('.an-icon-cell').forEach((cell) => {
      cell.classList.toggle('active', /** @type {HTMLElement} */ (cell).dataset.name === name);
    });
    // Enable insert button
    this._insertBtn.removeAttribute('disabled');
    // Update preview
    this._updatePreview(name);
  }

  _updatePreview(name) {
    if (!this._preview) return;
    if (!name) {
      this._preview.innerHTML = '<span class="an-icon-preview-hint">Select an icon</span>';
      return;
    }
    const cls   = this._styleSelect?.value || 'fa-solid';
    const size  = this._sizeSelect?.value  || '1em';
    const useColor = this._useColorCb?.checked ?? false;
    const color = useColor ? (this._colorInput?.value ?? '') : '';
    const styleAttr = [
      size  ? `font-size:${size}`  : '',
      color ? `color:${color}`     : '',
    ].filter(Boolean).join(';');
    // Use innerHTML — atomic, no partial-update risk
    this._preview.innerHTML =
      `<i class="${cls} fa-${name}" aria-hidden="true"${
        styleAttr ? ` style="${styleAttr}"` : ''
      }></i>` +
      `<div class="an-icon-preview-name">${cls} fa-${name}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------

  _onInsert() {
    if (!this._selectedIcon) return;

    const cls      = this._styleSelect?.value || 'fa-solid';
    const size     = this._sizeSelect?.value  || '';
    const useColor = this._useColorCb?.checked ?? false;
    const color    = useColor ? (this._colorInput?.value ?? '') : '';
    const styleParts = [
      size  ? `font-size:${size}` : '',
      color ? `color:${color}`    : '',
    ].filter(Boolean);

    const iconEl = document.createElement('i');
    iconEl.className = `${cls} fa-${this._selectedIcon}`;
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.setAttribute('contenteditable', 'false');
    if (styleParts.length) iconEl.setAttribute('style', styleParts.join(';'));

    const savedRange = this._savedRange;
    const editable   = this.context.layoutInfo.editable;

    // ---- Same ordering as ImageDialog (the proven pattern) ----
    // 1. Restore the selection while the dialog is still mounted
    if (savedRange) savedRange.select();

    // 2. Get the now-live range from the selection
    const sel = globalThis.getSelection();
    let range = (sel?.rangeCount ?? 0) > 0 ? sel.getRangeAt(0) : null;
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editable);
      range.collapse(false);
    }

    // 3. Insert the <i> node directly — never via execCommand/insertHTML
    //    (execCommand leaves the caret inside the inserted element)
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
    range.insertNode(iconEl);

    // 4. Place cursor after the icon.
    //    Keep a text anchor (\u200B) after the icon so ArrowLeft/ArrowRight and
    //    caret placement at end-of-line stay stable across browsers.
    let caretTextNode = iconEl.nextSibling;
    if (caretTextNode?.nodeType !== Node.TEXT_NODE) {
      caretTextNode = document.createTextNode('\u200B');
      iconEl.parentNode.insertBefore(caretTextNode, iconEl.nextSibling);
    } else if (!caretTextNode.textContent) {
      // Split text-node insertions can leave an empty text node after icon.
      // Fill it with ZWS so caret-after-icon remains stable at end-of-line.
      caretTextNode.textContent = '\u200B';
    }

    const caretOffset = ((caretTextNode.textContent || '').startsWith('\u200B')) ? 1 : 0;
    const caretRange = document.createRange();
    caretRange.setStart(caretTextNode, Math.min(caretOffset, caretTextNode.textContent.length));
    caretRange.collapse(true);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(caretRange);
    }

    // 5. Close dialog last — same as ImageDialog
    this._close();

    // 6. Restore editor focus (needed for toolbar refresh via afterCommand)
    editable.focus();
    if (sel) {
      // Some browsers reset selection when refocusing editable after closing dialog.
      sel.removeAllRanges();
      sel.addRange(caretRange);
    }
    this.context.invoke('editor.afterCommand');
  }

  _close() {
    this._selectedIcon = null;
    super._close();
  }
}
