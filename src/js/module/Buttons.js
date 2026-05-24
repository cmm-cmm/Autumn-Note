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
 * @property {string}   name          - unique identifier
 * @property {'select'} type          - discriminator for Toolbar renderer
 * @property {string}   tooltip
 * @property {Array<string|{value:string,label:string,disabled?:boolean}>} [items] - overridden at render time from options
 * @property {Function} action        - called with (context, value)
 * @property {Function} [getValue]    - called with (context) to get current value
 * @property {string}   [selectClass] - extra CSS class(es) for the <select>
 * @property {string}   [placeholder] - placeholder text for the empty option
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
 * @property {Function} [isActive]   - called with (context) to determine active state
 * @property {Function} [isDisabled] - called with (context) to determine disabled state
 * @property {string}   [className]  - extra CSS class(es)
 */

/**
 * Creates a simple button definition.
 * @param {string} name
 * @param {string} icon
 * @param {string} tooltip
 * @param {Function} action
 * @param {Function} [isActive]
 * @param {Function} [isDisabled]
 * @returns {ButtonDef}
 */
function btn(name, icon, tooltip, action, isActive, isDisabled) {
  // `icon` is an identifier (e.g. 'bold', 'italic'). Rendering to
  // visual markup (FontAwesome or fallback) is done in Toolbar._createButton
  return { name, icon, tooltip, action, isActive, isDisabled };
}

// ---------------------------------------------------------------------------
// Global button registry
// ---------------------------------------------------------------------------

/**
 * Global registry for custom buttons registered via AutumnNote.registerButton()
 * or via a plugin's `buttons` array. Toolbar resolves string names from here.
 * @type {Map<string, object>}
 */
export const _buttonRegistry = new Map();

/**
 * Registers a button definition in the global registry so it can be referenced
 * by string name in toolbar configuration: `toolbar: [['myBtn', boldBtn]]`.
 * @param {object} btnDef - Any ToolbarItemDef-compatible object with a `name` string.
 */
export function registerButton(btnDef) {
  if (!btnDef || typeof btnDef.name !== 'string') {
    console.warn('[AutumnNote] registerButton: btnDef must have a string `name` property.');
    return;
  }
  if (_buttonRegistry.has(btnDef.name)) {
    console.warn(`[AutumnNote] registerButton: overwriting existing button "${btnDef.name}".`);
  }
  _buttonRegistry.set(btnDef.name, btnDef);
}

/**
 * Looks up a button definition by name from the global registry.
 * Returns undefined when not found.
 * @param {string} name
 * @returns {object|undefined}
 */
export function getButton(name) {
  return _buttonRegistry.get(name);
}

// ---------------------------------------------------------------------------
// Style buttons
// ---------------------------------------------------------------------------

export const boldBtn = btn('bold', 'bold', 'Bold (Ctrl+B)', () => Style.bold(), () => document.queryCommandState('bold'));
export const italicBtn = btn('italic', 'italic', 'Italic (Ctrl+I)', () => Style.italic(), () => document.queryCommandState('italic'));
export const underlineBtn = btn('underline', 'underline', 'Underline (Ctrl+U)', () => Style.underline(), () => {
  // queryCommandState('underline') is unreliable inside <code> elements;
  // also check for a <u> ancestor in the DOM using startContainer for
  // consistent behaviour across both collapsed and range selections.
  if (document.queryCommandState('underline')) return true;
  const sel = globalThis.getSelection();
  if (!sel || !sel.rangeCount) return false;
  let sc = sel.getRangeAt(0).startContainer;
  if (sc.nodeType === 3) sc = sc.parentElement;
  return !!(sc && /** @type {Element} */ (sc).closest('u'));
});
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

export const undoBtn = btn('undo', 'undo', 'Undo (Ctrl+Z)', (_ctx) => _ctx.invoke('editor.undo'), undefined, (ctx) => !ctx.invoke('editor.canUndo'));
export const redoBtn = btn('redo', 'redo', 'Redo (Ctrl+Y)', (_ctx) => _ctx.invoke('editor.redo'), undefined, (ctx) => !ctx.invoke('editor.canRedo'));

// ---------------------------------------------------------------------------
// Insert media — HR, Link, Image
// ---------------------------------------------------------------------------

export const hrBtn = btn('hr', 'minus', 'Horizontal Rule', () => Style.execCommand('insertHorizontalRule'));
export const linkBtn = btn('link', 'link', 'Insert Link', (ctx) => ctx.invoke('linkDialog.show'));
export const imageBtn = btn('image', 'image', 'Insert Image', (ctx) => ctx.invoke('imageDialog.show'));
export const videoBtn = btn('video', 'video', 'Insert Video', (ctx) => ctx.invoke('videoDialog.show'));
export const emojiBtn = btn('emoji', 'emoji', 'Insert Emoji', (ctx) => ctx.invoke('emojiDialog.show'));
export const iconBtn  = btn('icon',  'icon',  'Insert FA Icon', (ctx) => ctx.invoke('iconDialog.show'));

/** @type {ButtonDef & { type: 'grid' }} */
export const tableBtn = {
  name: 'table',
  type: 'grid',
  icon: 'table',
  tooltip: 'Insert Table',
  action: (ctx, rows, cols) => {
    ctx.invoke('editor.insertTable', cols, rows);
    ctx.invoke('editor.afterCommand');
  },
};

// ---------------------------------------------------------------------------
// Font size dropdown
// ---------------------------------------------------------------------------

/** @type {DropdownDef} */
export const fontSizeBtn = {
  name: 'fontSize',
  type: 'select',
  tooltip: 'Font Size',
  placeholder: 'Size',
  selectClass: 'an-select-narrow',
  items: ['8px', '10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px'],
  action: (ctx, value) => Style.fontSize(value, ctx.layoutInfo.editable),
  getValue: (ctx) => {
    try {
      const sel = globalThis.getSelection();
      if (sel && sel.rangeCount) {
        let el = /** @type {Element|null} */ (sel.getRangeAt(0).startContainer);
        if (el && el.nodeType === 3) el = el.parentElement;
        while (el && el.nodeType === 1 && !/** @type {HTMLElement} */ (el).style.fontSize) el = el.parentElement;
        const size = (el && /** @type {HTMLElement} */ (el).style.fontSize) ? /** @type {HTMLElement} */ (el).style.fontSize : '';
        if (size) return size;
      }
      // Fallback: read the base font size from the editable element itself
      const editable = ctx?.layoutInfo?.editable;
      if (editable) return editable.style.fontSize || '';
      return '';
    } catch { return ''; }
  },
};

// ---------------------------------------------------------------------------
// Remove format button
// ---------------------------------------------------------------------------

export const removeFormatBtn = btn('removeFormat', 'remove-format', 'Remove Format', () => Style.execCommand('removeFormat'));

// ---------------------------------------------------------------------------
// Direction (LTR / RTL) toggle button
// ---------------------------------------------------------------------------

export const directionBtn = btn(
  'direction',
  'direction',
  'Toggle Text Direction (LTR / RTL)',
  (ctx) => {
    const editable = ctx.layoutInfo.editable;
    const current = editable.getAttribute('dir') || 'ltr';
    const next = current === 'ltr' ? 'rtl' : 'ltr';
    editable.setAttribute('dir', next);
    editable.style.textAlign = next === 'rtl' ? 'right' : 'left';
    ctx.invoke('editor.afterCommand');
  },
);

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
  selectClass: 'an-select-style',
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
  selectClass: 'an-select-narrow',
  items: ['1.0', '1.15', '1.5', '1.75', '2.0', '2.5', '3.0'],
  action: (_ctx, value) => Style.lineHeight(value),
  getValue: () => {
    try {
      const sel = globalThis.getSelection();
      if (!sel || !sel.rangeCount) return '';
      const BLOCKS = new Set(['P','DIV','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE','PRE','TD','TH']);
      let el = /** @type {Element|null} */ (sel.getRangeAt(0).startContainer);
      if (el && el.nodeType === 3) el = el.parentElement;
      while (el && !BLOCKS.has(/** @type {Element} */ (el).tagName)) el = el.parentElement;
      if (!el) return '';
      return /** @type {HTMLElement} */ (el).style.lineHeight || getComputedStyle(/** @type {Element} */ (el)).lineHeight || '';
    } catch { return ''; }
  },
};

// ---------------------------------------------------------------------------
// Code view / fullscreen
// ---------------------------------------------------------------------------

export const codeviewBtn = btn('codeview', 'code', 'HTML Code View', (ctx) => ctx.invoke('codeview.toggle'), (ctx) => ctx.invoke('codeview.isActive'));
export const fullscreenBtn = btn('fullscreen', 'expand', 'Fullscreen', (ctx) => ctx.invoke('fullscreen.toggle'), (ctx) => ctx.invoke('fullscreen.isActive'));
export const shortcutsBtn = btn('shortcuts', 'keyboard', 'Keyboard Shortcuts (Ctrl+Shift+/)', (ctx) => ctx.invoke('shortcutsDialog.show'));
export const findBtn = btn('find', 'search', 'Find (Ctrl+F)', (ctx) => ctx.invoke('findReplace.show', 'find'));
export const findReplaceBtn = btn('findReplace', 'find-replace', 'Find & Replace (Ctrl+H)', (ctx) => ctx.invoke('findReplace.show', 'replace'));
export const inlineCodeBtn = btn('inlineCode', 'inline-code', 'Inline Code (Ctrl+`)', (ctx) => ctx.invoke('editor.inlineCode'), () => Style.isInlineCode());
export const checklistBtn  = btn('checklist',  'checklist',   'Checklist', (ctx) => ctx.invoke('editor.toggleChecklist'), () => Style.isInChecklist());
export const printBtn      = btn('print',      'print',       'Print', (ctx) => ctx.invoke('editor.print'));

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
  [paragraphStyleBtn, fontFamilyBtn, fontSizeBtn, lineHeightBtn],
  [undoBtn, redoBtn],
  [boldBtn, italicBtn, underlineBtn, strikeBtn, inlineCodeBtn],
  [superscriptBtn, subscriptBtn],
  [foreColorBtn, backColorBtn],
  [alignLeftBtn, alignCenterBtn, alignRightBtn, alignJustifyBtn],
  [ulBtn, olBtn, checklistBtn, indentBtn, outdentBtn],
  [hrBtn, linkBtn, imageBtn, videoBtn, tableBtn, emojiBtn, iconBtn],
  [removeFormatBtn, codeviewBtn, fullscreenBtn, findBtn, printBtn, shortcutsBtn],
];
