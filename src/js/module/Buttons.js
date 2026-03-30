/**
 * Buttons.js - Toolbar button definitions and factories
 * All buttons are plain objects describing their appearance and action.
 * They are rendered by the Toolbar module.
 */

import * as Style from '../editing/Style.js';

// ---------------------------------------------------------------------------
// Dropdown definition helper
// ---------------------------------------------------------------------------

/**
 * @typedef {object} DropdownDef
 * @property {string}   name       - unique identifier
 * @property {'select'} type       - discriminator for Toolbar renderer
 * @property {string}   tooltip
 * @property {string[]} [items]    - overridden at render time from options
 * @property {Function} action     - called with (context, value)
 * @property {Function} [getValue] - called with (context) to get current value
 */

// ---------------------------------------------------------------------------
// Button factory helpers
// ---------------------------------------------------------------------------

/**
 * @typedef {object} ButtonDef
 * @property {string}   name        - unique identifier
 * @property {string}   icon        - SVG or HTML icon markup / text
 * @property {string}   tooltip     - tooltip string
 * @property {Function} action      - called with (context) when clicked
 * @property {Function} [isActive]  - called with (context) to determine active state
 * @property {string}   [className] - extra CSS class(es)
 */

/**
 * Creates a simple button definition.
 * @param {string} name
 * @param {string} icon
 * @param {string} tooltip
 * @param {Function} action
 * @param {Function} [isActive]
 * @returns {ButtonDef}
 */
function btn(name, icon, tooltip, action, isActive) {
  // `icon` is an identifier (e.g. 'bold', 'italic'). Rendering to
  // visual markup (FontAwesome or fallback) is done in Toolbar._createButton
  return { name, icon, tooltip, action, isActive };
}

// ---------------------------------------------------------------------------
// Style buttons
// ---------------------------------------------------------------------------

export const boldBtn = btn('bold', 'bold', 'Bold (Ctrl+B)', () => Style.bold(), () => document.queryCommandState('bold'));
export const italicBtn = btn('italic', 'italic', 'Italic (Ctrl+I)', () => Style.italic(), () => document.queryCommandState('italic'));
export const underlineBtn = btn('underline', 'underline', 'Underline (Ctrl+U)', () => Style.underline(), () => document.queryCommandState('underline'));
export const strikeBtn = btn('strikethrough', 'strikethrough', 'Strikethrough', () => Style.strikethrough(), () => document.queryCommandState('strikeThrough'));
export const superscriptBtn = btn('superscript', 'superscript', 'Superscript', () => Style.superscript(), () => document.queryCommandState('superscript'));
export const subscriptBtn = btn('subscript', 'subscript', 'Subscript', () => Style.subscript(), () => document.queryCommandState('subscript'));

// ---------------------------------------------------------------------------
// Alignment buttons
// ---------------------------------------------------------------------------

export const alignLeftBtn = btn('alignLeft', 'align-left', 'Align Left', () => Style.justifyLeft());
export const alignCenterBtn = btn('alignCenter', 'align-center', 'Align Center', () => Style.justifyCenter());
export const alignRightBtn = btn('alignRight', 'align-right', 'Align Right', () => Style.justifyRight());
export const alignJustifyBtn = btn('alignJustify', 'align-justify', 'Justify', () => Style.justifyFull());

// ---------------------------------------------------------------------------
// List buttons
// ---------------------------------------------------------------------------

export const ulBtn = btn('ul', 'list-ul', 'Unordered List', () => Style.insertUnorderedList());
export const olBtn = btn('ol', 'list-ol', 'Ordered List', () => Style.insertOrderedList());

// ---------------------------------------------------------------------------
// Indent buttons
// ---------------------------------------------------------------------------

export const indentBtn = btn('indent', 'indent', 'Indent', () => Style.indent());
export const outdentBtn = btn('outdent', 'outdent', 'Outdent', () => Style.outdent());

// ---------------------------------------------------------------------------
// Undo / redo buttons
// ---------------------------------------------------------------------------

export const undoBtn = btn('undo', 'undo', 'Undo (Ctrl+Z)', (_ctx) => _ctx.invoke('editor.undo'));
export const redoBtn = btn('redo', 'redo', 'Redo (Ctrl+Y)', (_ctx) => _ctx.invoke('editor.redo'));

// ---------------------------------------------------------------------------
// Insert media — HR, Link, Image
// ---------------------------------------------------------------------------

export const hrBtn = btn('hr', 'minus', 'Horizontal Rule', () => Style.execCommand('insertHorizontalRule'));
export const linkBtn = btn('link', 'link', 'Insert Link', (ctx) => ctx.invoke('linkDialog.show'));
export const imageBtn = btn('image', 'image', 'Insert Image', (ctx) => ctx.invoke('imageDialog.show'));
export const videoBtn = btn('video', 'video', 'Insert Video', (ctx) => ctx.invoke('videoDialog.show'));

/** @type {ButtonDef & { type: 'grid' }} */
export const tableBtn = {
  name: 'table',
  type: 'grid',
  icon: 'table',
  tooltip: 'Insert Table',
  action: (ctx, rows, cols) => {
    Style.insertTable(rows, cols);
    ctx.invoke('editor.afterCommand');
  },
};

// ---------------------------------------------------------------------------
// Font family dropdown
// ---------------------------------------------------------------------------

/** @type {DropdownDef} */
export const fontFamilyBtn = {
  name: 'fontFamily',
  type: 'select',
  tooltip: 'Font Family',
  action: (ctx, value) => Style.fontName(value),
  getValue: () => {
    try { return document.queryCommandValue('fontName') || ''; } catch { return ''; }
  },
};

// ---------------------------------------------------------------------------
// Paragraph style dropdown (Normal / H1-H6 / Quote / Code)
// ---------------------------------------------------------------------------

/** @type {DropdownDef} */
export const paragraphStyleBtn = {
  name: 'paragraphStyle',
  type: 'select',
  tooltip: 'Paragraph Style',
  placeholder: 'Style',
  selectClass: 'asn-select-style',
  items: [
    { value: 'p',          label: 'Normal' },
    { value: 'h1',         label: 'H1'     },
    { value: 'h2',         label: 'H2'     },
    { value: 'h3',         label: 'H3'     },
    { value: 'h4',         label: 'H4'     },
    { value: 'h5',         label: 'H5'     },
    { value: 'h6',         label: 'H6'     },
    { value: 'blockquote', label: 'Quote'  },
    { value: 'pre',        label: 'Code'   },
  ],
  action: (_ctx, value) => Style.formatBlock(value),
  getValue: () => {
    try {
      const raw = document.queryCommandValue('formatBlock').toLowerCase().replace(/[<>]/g, '');
      return raw === 'div' ? 'p' : (raw || 'p');
    } catch { return ''; }
  },
};

// ---------------------------------------------------------------------------
// Line-height dropdown
// ---------------------------------------------------------------------------

/** @type {DropdownDef} */
export const lineHeightBtn = {
  name: 'lineHeight',
  type: 'select',
  tooltip: 'Line Height',
  placeholder: '\u2195 Line',
  selectClass: 'asn-select-narrow',
  items: ['1.0', '1.15', '1.5', '1.75', '2.0', '2.5', '3.0'],
  action: (_ctx, value) => Style.lineHeight(value),
  getValue: () => {
    try {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return '';
      const BLOCKS = new Set(['P','DIV','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE','PRE','TD','TH']);
      let el = sel.getRangeAt(0).startContainer;
      if (el.nodeType === 3) el = el.parentElement;
      while (el && !BLOCKS.has(el.tagName)) el = el.parentElement;
      return el ? (el.style.lineHeight || '') : '';
    } catch { return ''; }
  },
};

// ---------------------------------------------------------------------------
// Code view / fullscreen
// ---------------------------------------------------------------------------

export const codeviewBtn = btn('codeview', 'code', 'HTML Code View', (ctx) => ctx.invoke('codeview.toggle'), (ctx) => ctx.invoke('codeview.isActive'));
export const fullscreenBtn = btn('fullscreen', 'expand', 'Fullscreen', (ctx) => ctx.invoke('fullscreen.toggle'), (ctx) => ctx.invoke('fullscreen.isActive'));

// ---------------------------------------------------------------------------
// Text / background colour pickers
// ---------------------------------------------------------------------------

/** @type {{ name: string, type: 'colorpicker', icon: string, tooltip: string, defaultColor: string, action: Function }} */
export const foreColorBtn = {
  name: 'foreColor',
  type: 'colorpicker',
  icon: 'foreColor',
  tooltip: 'Text Color',
  defaultColor: '#e11d48',
  action: (ctx, color) => Style.foreColor(color),
};

/** @type {{ name: string, type: 'colorpicker', icon: string, tooltip: string, defaultColor: string, action: Function }} */
export const backColorBtn = {
  name: 'backColor',
  type: 'colorpicker',
  icon: 'backColor',
  tooltip: 'Highlight Color',
  defaultColor: '#fbbf24',
  action: (ctx, color) => Style.backColor(color),
};

// ---------------------------------------------------------------------------
// Default toolbar layout
// ---------------------------------------------------------------------------

/**
 * The default toolbar button groups.
 * Each sub-array is a button group (separated by a divider).
 */
export const defaultToolbar = [
  [paragraphStyleBtn, fontFamilyBtn, lineHeightBtn],
  [undoBtn, redoBtn],
  [boldBtn, italicBtn, underlineBtn, strikeBtn],
  [superscriptBtn, subscriptBtn],
  [foreColorBtn, backColorBtn],
  [alignLeftBtn, alignCenterBtn, alignRightBtn, alignJustifyBtn],
  [ulBtn, olBtn, indentBtn, outdentBtn],
  [hrBtn, linkBtn, imageBtn, videoBtn, tableBtn],
  [codeviewBtn, fullscreenBtn],
];
