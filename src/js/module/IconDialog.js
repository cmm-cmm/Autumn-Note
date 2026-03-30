/**
 * IconDialog.js - Browse and insert FontAwesome Free icons
 */

import { createElement, on } from '../core/dom.js';
import { withSavedRange } from '../core/range.js';

// ---------------------------------------------------------------------------
// Icon catalogue — FA 6 Free Solid slug names, grouped by category
// ---------------------------------------------------------------------------

const ICON_CATEGORIES = [
  { id: 'popular',       label: 'Popular' },
  { id: 'interface',     label: 'Interface' },
  { id: 'navigation',    label: 'Navigation' },
  { id: 'media',         label: 'Media' },
  { id: 'communication', label: 'Communication' },
  { id: 'files',         label: 'Files' },
  { id: 'people',        label: 'People' },
  { id: 'objects',       label: 'Objects' },
];

// Each entry: [slug, category]
const ICON_LIST = [
  // Popular
  ['house',                 'popular'],
  ['star',                  'popular'],
  ['heart',                 'popular'],
  ['check',                 'popular'],
  ['xmark',                 'popular'],
  ['plus',                  'popular'],
  ['minus',                 'popular'],
  ['magnifying-glass',      'popular'],
  ['gear',                  'popular'],
  ['bell',                  'popular'],
  ['user',                  'popular'],
  ['envelope',              'popular'],
  ['phone',                 'popular'],
  ['calendar',              'popular'],
  ['clock',                 'popular'],
  ['lock',                  'popular'],
  ['eye',                   'popular'],
  ['eye-slash',             'popular'],
  ['trash',                 'popular'],
  ['pen',                   'popular'],
  ['bookmark',              'popular'],
  ['flag',                  'popular'],
  ['thumbs-up',             'popular'],
  ['thumbs-down',           'popular'],
  ['circle-info',           'popular'],
  ['triangle-exclamation',  'popular'],
  ['circle-check',          'popular'],
  ['circle-xmark',          'popular'],
  ['share',                 'popular'],
  ['download',              'popular'],
  ['upload',                'popular'],
  ['tag',                   'popular'],
  // Interface
  ['bars',                  'interface'],
  ['ellipsis',              'interface'],
  ['ellipsis-vertical',     'interface'],
  ['list',                  'interface'],
  ['table-cells',           'interface'],
  ['table-list',            'interface'],
  ['grip',                  'interface'],
  ['filter',                'interface'],
  ['sort',                  'interface'],
  ['arrows-rotate',         'interface'],
  ['rotate',                'interface'],
  ['rotate-left',           'interface'],
  ['rotate-right',          'interface'],
  ['copy',                  'interface'],
  ['floppy-disk',           'interface'],
  ['print',                 'interface'],
  ['link',                  'interface'],
  ['code',                  'interface'],
  ['expand',                'interface'],
  ['compress',              'interface'],
  ['cloud',                 'interface'],
  ['lock-open',             'interface'],
  ['key',                   'interface'],
  ['shield',                'interface'],
  ['shield-halved',         'interface'],
  ['sliders',               'interface'],
  ['toggle-on',             'interface'],
  ['square-check',          'interface'],
  ['circle-plus',           'interface'],
  ['circle-minus',          'interface'],
  // Navigation
  ['arrow-right',           'navigation'],
  ['arrow-left',            'navigation'],
  ['arrow-up',              'navigation'],
  ['arrow-down',            'navigation'],
  ['chevron-right',         'navigation'],
  ['chevron-left',          'navigation'],
  ['chevron-up',            'navigation'],
  ['chevron-down',          'navigation'],
  ['angle-right',           'navigation'],
  ['angle-left',            'navigation'],
  ['angle-up',              'navigation'],
  ['angle-down',            'navigation'],
  ['angles-right',          'navigation'],
  ['angles-left',           'navigation'],
  ['location-dot',          'navigation'],
  ['compass',               'navigation'],
  ['map',                   'navigation'],
  ['map-pin',               'navigation'],
  ['route',                 'navigation'],
  ['circle-arrow-right',    'navigation'],
  ['circle-arrow-left',     'navigation'],
  ['arrow-trend-up',        'navigation'],
  ['arrow-trend-down',      'navigation'],
  ['right-from-bracket',    'navigation'],
  ['right-to-bracket',      'navigation'],
  // Media
  ['play',                  'media'],
  ['pause',                 'media'],
  ['stop',                  'media'],
  ['forward',               'media'],
  ['backward',              'media'],
  ['forward-step',          'media'],
  ['backward-step',         'media'],
  ['volume-high',           'media'],
  ['volume-low',            'media'],
  ['volume-xmark',          'media'],
  ['volume-off',            'media'],
  ['music',                 'media'],
  ['headphones',            'media'],
  ['microphone',            'media'],
  ['microphone-slash',      'media'],
  ['film',                  'media'],
  ['camera',                'media'],
  ['camera-rotate',         'media'],
  ['video',                 'media'],
  ['image',                 'media'],
  ['images',                'media'],
  ['photo-film',            'media'],
  ['podcast',               'media'],
  ['radio',                 'media'],
  // Communication
  ['comment',               'communication'],
  ['comments',              'communication'],
  ['comment-dots',          'communication'],
  ['message',               'communication'],
  ['paper-plane',           'communication'],
  ['reply',                 'communication'],
  ['reply-all',             'communication'],
  ['at',                    'communication'],
  ['hashtag',               'communication'],
  ['wifi',                  'communication'],
  ['signal',                'communication'],
  ['rss',                   'communication'],
  ['share-nodes',           'communication'],
  ['inbox',                 'communication'],
  ['phone-volume',          'communication'],
  ['mobile',                'communication'],
  ['mobile-screen',         'communication'],
  ['laptop',                'communication'],
  ['desktop',               'communication'],
  ['tower-broadcast',       'communication'],
  // Files
  ['file',                  'files'],
  ['file-lines',            'files'],
  ['folder',                'files'],
  ['folder-open',           'files'],
  ['folder-plus',           'files'],
  ['folder-minus',          'files'],
  ['file-image',            'files'],
  ['file-pdf',              'files'],
  ['file-code',             'files'],
  ['file-zipper',           'files'],
  ['file-audio',            'files'],
  ['file-video',            'files'],
  ['file-arrow-up',         'files'],
  ['file-arrow-down',       'files'],
  ['database',              'files'],
  ['box',                   'files'],
  ['box-open',              'files'],
  ['hard-drive',            'files'],
  ['server',                'files'],
  // People
  ['user',                  'people'],
  ['users',                 'people'],
  ['user-group',            'people'],
  ['user-plus',             'people'],
  ['user-minus',            'people'],
  ['user-check',            'people'],
  ['user-xmark',            'people'],
  ['user-tie',              'people'],
  ['user-shield',           'people'],
  ['user-secret',           'people'],
  ['person',                'people'],
  ['person-running',        'people'],
  ['person-walking',        'people'],
  ['child',                 'people'],
  ['handshake',             'people'],
  ['hand',                  'people'],
  ['hands-holding',         'people'],
  ['people-group',          'people'],
  // Objects
  ['pencil',                'objects'],
  ['paintbrush',            'objects'],
  ['eraser',                'objects'],
  ['scissors',              'objects'],
  ['wrench',                'objects'],
  ['screwdriver',           'objects'],
  ['hammer',                'objects'],
  ['toolbox',               'objects'],
  ['graduation-cap',        'objects'],
  ['book',                  'objects'],
  ['book-open',             'objects'],
  ['glasses',               'objects'],
  ['microscope',            'objects'],
  ['flask',                 'objects'],
  ['stethoscope',           'objects'],
  ['hospital',              'objects'],
  ['building',              'objects'],
  ['city',                  'objects'],
  ['car',                   'objects'],
  ['truck',                 'objects'],
  ['plane',                 'objects'],
  ['train',                 'objects'],
  ['bicycle',               'objects'],
  ['bus',                   'objects'],
  ['rocket',                'objects'],
  ['briefcase',             'objects'],
  ['cart-shopping',         'objects'],
  ['bag-shopping',          'objects'],
  ['credit-card',           'objects'],
  ['money-bill',            'objects'],
  ['chart-bar',             'objects'],
  ['chart-line',            'objects'],
  ['chart-pie',             'objects'],
  ['bolt',                  'objects'],
  ['sun',                   'objects'],
  ['moon',                  'objects'],
  ['snowflake',             'objects'],
  ['fire',                  'objects'],
  ['droplet',               'objects'],
  ['leaf',                  'objects'],
  ['tree',                  'objects'],
  ['earth-americas',        'objects'],
  ['globe',                 'objects'],
  ['award',                 'objects'],
  ['trophy',                'objects'],
  ['gift',                  'objects'],
  ['puzzle-piece',          'objects'],
];

export class IconDialog {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    /** @type {HTMLElement|null} */
    this._dialog = null;
    this._disposers = [];
    this._savedRange = null;
    this._selectedIcon = null;
    this._activeCat = 'all';
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this._ensureFontAwesome();
    this._dialog = this._buildDialog();
    document.body.appendChild(this._dialog);
    return this;
  }

  /**
   * Injects FA 6 Free CSS from CDN if it is not already on the page.
   * This guarantees icon glyphs render in the grid, preview, and in the
   * editor content after insertion — regardless of whether the host page
   * loaded FA itself.
   */
  _ensureFontAwesome() {
    // Already present (icon element or stylesheet link)?
    if (document.getElementById('an-fontawesome-css')) return;
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((l) => l.href || '').join(' ');
    if (/fontawesome|font-awesome/.test(links)) return;
    if (document.querySelector('.fa-solid, .fas, .far, .fab')) return;

    const link = document.createElement('link');
    link.id   = 'an-fontawesome-css';
    link.rel  = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    document.head.appendChild(link);
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._dialog && this._dialog.parentNode) {
      this._dialog.parentNode.removeChild(this._dialog);
    }
    this._dialog = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  show() {
    withSavedRange((range) => {
      this._savedRange = range;
    });
    this._selectedIcon = null;
    this._activeCat = 'all';
    this._searchInput.value = '';
    this._updateCatTabs();
    this._filterIcons('', 'all');
    this._updatePreview(null);
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const overlay = createElement('div', {
      class: 'an-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Insert FA icon',
    });

    const box = createElement('div', { class: 'an-dialog-box an-icon-box' });

    // Title row
    const titleRow = createElement('div', { class: 'an-icon-title-row' });
    const title = createElement('h3', { class: 'an-dialog-title' });
    title.textContent = 'Insert FA Icon';
    const closeBtn = createElement('button', { type: 'button', class: 'an-icon-close', 'aria-label': 'Close' });
    closeBtn.innerHTML = '&times;';
    titleRow.append(title, closeBtn);

    // Search
    const searchInput = createElement('input', {
      type: 'search',
      class: 'an-input an-icon-search',
      placeholder: 'Search icons…',
      autocomplete: 'off',
    });
    this._searchInput = searchInput;

    // Category tabs
    const catBar = createElement('div', { class: 'an-icon-cats' });
    const allTab = createElement('button', { type: 'button', class: 'an-icon-cat active', 'data-cat': 'all' });
    allTab.textContent = 'All';
    catBar.appendChild(allTab);
    ICON_CATEGORIES.forEach(({ id, label }) => {
      const tab = createElement('button', { type: 'button', class: 'an-icon-cat', 'data-cat': id });
      tab.textContent = label;
      catBar.appendChild(tab);
    });
    this._catBar = catBar;

    // Icon grid
    const grid = createElement('div', { class: 'an-icon-grid' });
    ICON_LIST.forEach(([name, cat]) => {
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
    styleLabel.textContent = 'Style';
    const styleSelect = createElement('select', { class: 'an-input an-icon-option-select' });
    [['fa-solid', 'Solid'], ['fa-regular', 'Regular'], ['fa-light', 'Light (Pro)']].forEach(([v, t]) => {
      const opt = createElement('option', { value: v });
      opt.textContent = t;
      styleSelect.appendChild(opt);
    });
    styleSelect.value = 'fa-solid';
    this._styleSelect = styleSelect;

    const sizeLabel = createElement('label', { class: 'an-label' });
    sizeLabel.textContent = 'Size';
    const sizeSelect = createElement('select', { class: 'an-input an-icon-option-select' });
    [['', 'Inherit'], ['0.75em', '0.75em'], ['1em', '1em'], ['1.25em', '1.25em'], ['1.5em', '1.5em'], ['2em', '2em'], ['3em', '3em']].forEach(([v, t]) => {
      const opt = createElement('option', { value: v });
      if (v === '1em') opt.selected = true;
      opt.textContent = t;
      sizeSelect.appendChild(opt);
    });
    this._sizeSelect = sizeSelect;

    const colorLabel = createElement('label', { class: 'an-label' });
    colorLabel.textContent = 'Color';
    const colorInput = createElement('input', { type: 'color', class: 'an-icon-color', value: '#000000' });
    this._colorInput = colorInput;

    const useColorLabel = createElement('label', { class: 'an-label an-label-inline an-icon-use-color' });
    const useColorCb = createElement('input', { type: 'checkbox', checked: '' });
    this._useColorCb = useColorCb;
    useColorLabel.append(useColorCb, document.createTextNode(' Use color'));

    optRow.append(styleLabel, styleSelect, sizeLabel, sizeSelect, colorLabel, colorInput, useColorLabel);

    // Preview
    const preview = createElement('div', { class: 'an-icon-preview' });
    const previewHint = createElement('span', { class: 'an-icon-preview-hint' });
    previewHint.textContent = 'Select an icon';
    preview.appendChild(previewHint);
    this._preview = preview;

    // Actions
    const btnRow = createElement('div', { class: 'an-dialog-actions' });
    const insertBtn = createElement('button', { type: 'button', class: 'an-btn an-btn-primary', disabled: '' });
    insertBtn.textContent = 'Insert FA Icon';
    const cancelBtn = createElement('button', { type: 'button', class: 'an-btn' });
    cancelBtn.textContent = 'Cancel';
    btnRow.append(insertBtn, cancelBtn);
    this._insertBtn = insertBtn;

    box.append(titleRow, searchInput, catBar, grid, optRow, preview, btnRow);
    overlay.appendChild(box);

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    const d1 = on(closeBtn,    'click',  () => this._close());
    const d2 = on(cancelBtn,   'click',  () => this._close());
    const d3 = on(insertBtn,   'click',  () => this._onInsert());
    const d4 = on(overlay,     'click',  (e) => { if (e.target === overlay) this._close(); });
    const d5 = on(searchInput, 'input',  () => this._filterIcons(searchInput.value, this._activeCat));
    const d6 = on(catBar,      'click',  (e) => {
      const tab = e.target.closest('[data-cat]');
      if (tab) {
        this._activeCat = tab.dataset.cat;
        this._updateCatTabs();
        this._filterIcons(this._searchInput.value, this._activeCat);
      }
    });
    const d7 = on(grid, 'click', (e) => {
      const cell = e.target.closest('.an-icon-cell');
      if (cell) this._selectIcon(cell.dataset.name);
    });
    const d8 = on(styleSelect, 'change', () => this._updatePreview(this._selectedIcon));
    const d9 = on(sizeSelect,  'change', () => this._updatePreview(this._selectedIcon));
    const d10 = on(colorInput, 'input',  () => this._updatePreview(this._selectedIcon));
    const d11 = on(useColorCb, 'change', () => this._updatePreview(this._selectedIcon));

    const onKeydown = (e) => {
      if (e.key === 'Escape' && this._dialog && this._dialog.style.display !== 'none') this._close();
    };
    document.addEventListener('keydown', onKeydown);
    const d12 = () => document.removeEventListener('keydown', onKeydown);

    this._disposers.push(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);

    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Filter / select
  // ---------------------------------------------------------------------------

  _updateCatTabs() {
    this._catBar.querySelectorAll('.an-icon-cat').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.cat === this._activeCat);
    });
  }

  _filterIcons(query, cat) {
    const q = (query || '').trim().toLowerCase();
    let visibleCount = 0;
    this._grid.querySelectorAll('.an-icon-cell').forEach((cell) => {
      const name = cell.dataset.name;
      const cellCat = cell.dataset.cat;
      const matchesCat = !cat || cat === 'all' || cellCat === cat;
      const matchesQuery = !q || name.includes(q);
      const visible = matchesCat && matchesQuery;
      cell.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });
    // Show empty state if needed
    let empty = this._grid.querySelector('.an-icon-empty');
    if (!empty) {
      empty = createElement('div', { class: 'an-icon-empty' });
      empty.textContent = 'No icons found';
      this._grid.appendChild(empty);
    }
    empty.style.display = visibleCount > 0 ? 'none' : '';
  }

  _selectIcon(name) {
    this._selectedIcon = name;
    // Highlight selected cell
    this._grid.querySelectorAll('.an-icon-cell').forEach((cell) => {
      cell.classList.toggle('active', cell.dataset.name === name);
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
    const cls   = (this._styleSelect && this._styleSelect.value) || 'fa-solid';
    const size  = (this._sizeSelect  && this._sizeSelect.value)  || '1em';
    const useColor = this._useColorCb ? this._useColorCb.checked : false;
    const color = (useColor && this._colorInput) ? this._colorInput.value : '';
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

    const cls      = (this._styleSelect && this._styleSelect.value) || 'fa-solid';
    const size     = (this._sizeSelect  && this._sizeSelect.value)  || '';
    const useColor = this._useColorCb ? this._useColorCb.checked    : false;
    const color    = (useColor && this._colorInput) ? this._colorInput.value : '';
    const styleParts = [
      size  ? `font-size:${size}` : '',
      color ? `color:${color}`    : '',
    ].filter(Boolean);

    const iconEl = document.createElement('i');
    iconEl.className = `${cls} fa-${this._selectedIcon}`;
    iconEl.setAttribute('aria-hidden', 'true');
    if (styleParts.length) iconEl.setAttribute('style', styleParts.join(';'));

    const savedRange = this._savedRange;
    const editable   = this.context.layoutInfo.editable;

    // ---- Same ordering as ImageDialog (the proven pattern) ----
    // 1. Restore the selection while the dialog is still mounted
    if (savedRange) savedRange.select();

    // 2. Get the now-live range from the selection
    const sel = window.getSelection();
    let range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editable);
      range.collapse(false);
    }

    // 3. Insert the <i> node directly — never via execCommand/insertHTML
    //    (execCommand leaves the caret inside the inserted element)
    range.deleteContents();
    range.insertNode(iconEl);

    // 4. Insert a zero-width space text node immediately after the icon.
    //    This is essential when the icon lands at the END of a paragraph:
    //    browsers cannot place the caret after an inline element that is the
    //    last child of a block — there is no text node to anchor into.
    //    The ZWS gives the caret a real text node to sit in, so typing after
    //    the icon works correctly. It is invisible to the reader.
    const zwsNode = document.createTextNode('\u200B');
    iconEl.parentNode.insertBefore(zwsNode, iconEl.nextSibling);

    // 5. Place caret inside the ZWS text node (offset 1 = after the ZWS char).
    range.setStart(zwsNode, 1);
    range.collapse(true);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // 5. Close dialog last — same as ImageDialog
    this._close();

    // 6. Restore editor focus (needed for toolbar refresh via afterCommand)
    editable.focus();
    this.context.invoke('editor.afterCommand');
  }

  // ---------------------------------------------------------------------------
  // Open / Close
  // ---------------------------------------------------------------------------

  _open() {
    if (this._dialog) {
      this._dialog.style.display = 'flex';
      setTimeout(() => this._searchInput && this._searchInput.focus(), 50);
    }
  }

  _close() {
    if (this._dialog) this._dialog.style.display = 'none';
    this._savedRange = null;
    this._selectedIcon = null;
  }
}
