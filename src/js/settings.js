/**
 * settings.js - Default editor options
 * Inspired by Summernote's settings.js
 */

import { defaultToolbar } from './module/Buttons.js';

/**
 * @typedef {object} AsnOptions
 * @property {string}   [placeholder]       - Placeholder text when editor is empty
 * @property {number}   [height]            - Editor height in px (min)
 * @property {number}   [minHeight]         - Minimum height in px
 * @property {number}   [maxHeight]         - Maximum height in px (0 = unlimited)
 * @property {boolean}  [focus]             - Auto-focus on init
 * @property {boolean}  [resizable]         - Show resize handle
 * @property {Array}    [toolbar]           - Toolbar button group config
 * @property {boolean}  [pasteAsPlainText]  - Force plain-text paste
 * @property {boolean}  [pasteCleanHTML]    - Sanitise HTML on paste
 * @property {boolean}  [pasteStripAttributes] - Strip class/style/data-* from pasted HTML (default: false)
 * @property {boolean}  [allowImageUpload]  - Allow file upload in image dialog
 * @property {number}   [maxImageSize]      - Max upload size in MB
 * @property {number}   [tabSize]           - Spaces per tab in non-list context
 * @property {Function} [onChange]          - Callback on content change
 * @property {Function} [onFocus]           - Callback on focus
 * @property {Function} [onBlur]            - Callback on blur
 * @property {Function} [onImageUpload]     - Custom upload handler: (files) => void
 * @property {boolean}  [stickyToolbar]     - Stick the toolbar to the viewport top when scrolling
 * @property {number}   [stickyToolbarOffset] - Top offset in px for sticky toolbar (e.g. fixed nav height)
 * @property {string}   [theme]             - 'light' (default) | 'dark'
 * @property {boolean}  [codeHighlight]     - Auto-load Prism.js for syntax highlighting of code blocks
 * @property {string}   [codeHighlightCDN]  - CDN base URL for Prism assets (defaults to cdnjs)
 * @property {boolean}  [markdownPaste]     - Convert pasted Markdown text to HTML (default: true)
 * @property {boolean}  [readOnly]          - Start editor in read-only / non-editable mode
 * @property {boolean}  [spellcheck]        - Enable browser spellcheck in the editable area (default: true)
 * @property {string}   [direction]         - Text direction: 'ltr' (default) | 'rtl'
 * @property {string}   [toolbarOverflow]   - Toolbar overflow strategy: 'wrap' (default) | 'scroll'
 * @property {boolean}  [autoSave]          - Auto-save content to localStorage on change
 * @property {string}   [autoSaveKey]       - localStorage key used for auto-save (default: 'autumnnote-autosave')
 * @property {number}   [maxChars]          - Maximum character count (0 = unlimited). Shows warning in statusbar.
 * @property {number}   [maxWords]          - Maximum word count (0 = unlimited). Shows warning in statusbar.
 * @property {boolean}  [tableHeaderRow]    - Insert a header row (<thead><th>) when creating tables
 * @property {Function} [onPaste]           - Callback fired on every paste: ({ text, html }) => void
 * @property {Function} [onSelectionChange]   - Callback fired on cursor/selection change: (context) => void
 * @property {string[]}  [colorSwatches]       - Custom brand colour swatches prepended to the colour-picker palette
 * @property {Function} [onDestroy]            - Callback fired when the editor is destroyed: (context) => void
 * @property {Function} [onCharLimitReached]   - Callback fired when the character limit is hit: (context) => void
 * @property {Function} [onWordLimitReached]   - Callback fired when the word limit is hit: (context) => void
 * @property {string}   [focusColor]            - Custom focus ring colour, e.g. '#f97316'. Overrides the default blue.
 */

/** @type {AsnOptions} */
export const defaultOptions = {
  placeholder: '',
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: false,
  resizable: true,
  toolbar: defaultToolbar,
  // UI integration options
  // If `useBootstrap` is true, toolbar buttons will use the Bootstrap button classes
  // (set `toolbarButtonClass` to customize). Works with Bootstrap 4 and 5.
  useBootstrap: false,
  toolbarButtonClass: 'btn btn-sm btn-light',
  // Icon options — uses Font Awesome by default. Consumers must include Font Awesome CSS.
  useFontAwesome: true,
  // Default FontAwesome prefix — 'fas' for FA5, 'fa-solid' for FA6. Change if needed.
  fontAwesomeClass: 'fas',
  pasteAsPlainText: false,
  pasteCleanHTML: true,
  pasteStripAttributes: false,
  allowImageUpload: true,
  maxImageSize: 5,
  tabSize: 4,
  onChange: null,
  onFocus: null,
  onBlur: null,
  onInit: null,
  onImageUpload: null,
  onImageError: null,
  stickyToolbar: false,
  stickyToolbarOffset: 0,
  theme: 'light',
  codeHighlight: true,
  codeHighlightCDN: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0',
  markdownPaste: true,
  historyLimit: 100,
  // Default font family applied to the editor and shown in the dropdown when no explicit font is set
  defaultFontFamily: 'Arial',
  // Default font size applied to the editor and shown in the size dropdown when no explicit size is set
  defaultFontSize: '14px',
  // Font families shown in the toolbar font-family dropdown
  fontFamilies: [
    'Arial',
    'Arial Black',
    'Comic Sans MS',
    'Courier New',
    'Georgia',
    'Impact',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
  ],
  // Read-only mode — disables all editing when true
  readOnly: false,
  // Enable/disable browser spell-check on the editable area
  spellcheck: true,
  // Text direction: 'ltr' (default) or 'rtl'
  direction: 'ltr',
  // How the toolbar handles overflow: 'wrap' (default, wraps to next line) or 'scroll' (single scrollable row)
  toolbarOverflow: 'wrap',
  // Auto-save content to localStorage on every change
  autoSave: false,
  // localStorage key used when autoSave is enabled
  autoSaveKey: 'autumnnote-autosave',
  // Maximum character count (0 = unlimited)
  maxChars: 0,
  // Maximum word count (0 = unlimited)
  maxWords: 0,
  // Insert a header row (<thead>) when creating new tables
  tableHeaderRow: false,
  // Callback fired on every cursor/selection change inside the editor
  onSelectionChange: null,
  // Custom brand colour swatches to prepend to the toolbar colour-picker palette
  colorSwatches: [],
  // Callback fired after a paste event: function({ text, html })
  onPaste: null,
  // Callback fired just before the editor instance is destroyed
  onDestroy: null,
  // Callback fired when the character limit is reached: function(context)
  onCharLimitReached: null,
  // Callback fired when the word limit is reached: function(context)
  onWordLimitReached: null,
  // Custom focus ring colour — overrides the default blue when set.
  // Accepts any valid CSS colour string, e.g. '#f97316', 'hsl(25,90%,55%)'.
  focusColor: null,
};
