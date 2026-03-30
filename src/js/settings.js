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
  bootstrapVersion: 5,
  toolbarButtonClass: 'btn btn-sm btn-light',
  // Icon options — uses Font Awesome by default. Consumers must include Font Awesome CSS.
  useFontAwesome: true,
  // Default FontAwesome prefix — 'fas' for FA5, 'fa-solid' for FA6. Change if needed.
  fontAwesomeClass: 'fas',
  pasteAsPlainText: false,
  pasteCleanHTML: true,
  allowImageUpload: true,
  maxImageSize: 5,
  tabSize: 0,
  onChange: null,
  onFocus: null,
  onBlur: null,
  onImageUpload: null,
  stickyToolbar: false,
  stickyToolbarOffset: 0,
  theme: 'light',
  codeHighlight: true,
  codeHighlightCDN: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0',
  markdownPaste: true,
  // Default font family applied to the editor and shown in the dropdown when no explicit font is set
  defaultFontFamily: 'Arial',
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
};
