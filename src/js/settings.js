/**
 * settings.js - Default editor options
 * Inspired by Summernote's settings.js
 */

import { defaultToolbar, DEFAULT_FONT_SIZES, DEFAULT_LINE_HEIGHTS, DEFAULT_PARAGRAPH_STYLES } from './module/Buttons.js';

/**
 * @typedef {object} AsnOptions
 * @property {string}   [placeholder]          - Placeholder text when editor is empty
 * @property {number}   [height]               - Editor height in px (min)
 * @property {number}   [minHeight]            - Minimum height in px
 * @property {number}   [maxHeight]            - Maximum height in px (0 = unlimited)
 * @property {boolean}  [focus]                - Auto-focus on init
 * @property {boolean}  [resizable]            - Show resize handle
 * @property {boolean}  [statusbar]            - Show the statusbar (word/char count, resize handle)
 * @property {Array}    [toolbar]              - Toolbar button group config
 * @property {boolean}  [useBootstrap]         - Use Bootstrap button classes on toolbar buttons
 * @property {string}   [toolbarButtonClass]   - CSS classes for Bootstrap toolbar buttons
 * @property {boolean}  [useFontAwesome]       - Use Font Awesome icons (default: true)
 * @property {string}   [fontAwesomeClass]     - Font Awesome prefix class, e.g. 'fas' or 'fa-solid'
 * @property {boolean}  [fontAwesomeAutoInject] - Let the icon dialog inject Font Awesome CSS from a CDN when the host page has none (default: true)
 * @property {string}   [fontAwesomeCDN]       - Stylesheet URL used by that injection (defaults to cdnjs FA 6 Free)
 * @property {boolean}  [pasteAsPlainText]     - Force plain-text paste
 * @property {boolean}  [pasteCleanHTML]       - Sanitise HTML on paste
 * @property {boolean}  [pasteStripAttributes] - Strip class/style/data-* from pasted HTML (default: false)
 * @property {boolean}  [allowImageUpload]     - Allow file upload in image dialog
 * @property {number}   [maxImageSize]         - Max upload size in MB
 * @property {number}   [tabSize]              - Spaces per tab in non-list context
 * @property {number}   [historyLimit]         - Maximum undo/redo history steps
 * @property {number}   [historyMaxBytes]      - Maximum combined size (chars) of all stacked undo/redo snapshots
 * @property {string}   [defaultFontFamily]    - Default font family applied to the editable area on init
 * @property {string}   [defaultFontSize]      - Default font size applied to the editable area on init (e.g. '14px')
 * @property {string[]} [fontFamilies]         - Font families shown in the font-family toolbar dropdown
 * @property {string[]} [fontSizes]            - Sizes shown in the font-size dropdown (CSS lengths, e.g. '14px')
 * @property {string[]} [lineHeights]          - Values shown in the line-height dropdown
 * @property {Array<{value: string, label: string}>} [paragraphStyles] - Block formats in the paragraph-style dropdown
 * @property {string[]|null} [colorPalette]    - Replaces the built-in colour swatches (toolbar, bubble toolbar, context menu)
 * @property {Object<string, string>|null} [icons] - Per-editor icon overrides keyed by button or icon name: SVG markup or a CSS class list
 * @property {Object<string, object>|object[]|null} [buttons] - Per-editor button definitions, referenced by name in `toolbar`
 * @property {Object<string, *>|null} [keyMap]  - Keyboard shortcut overrides, e.g. { 'Mod+F': false, 'Mod+Shift+X': 'strikethrough' }
 * @property {Function} [onChange]             - Callback on content change
 * @property {Function} [onFocus]              - Callback on focus
 * @property {Function} [onBlur]               - Callback on blur
 * @property {Function} [onInit]               - Callback after the editor has initialised
 * @property {Function} [onImageUpload]        - Upload handler: (files, { context, setProgress }) => void | string | string[] | Promise<string|string[]>.
 *   Return (or resolve to) the uploaded URL(s) and the editor inserts a placeholder
 *   immediately and swaps the real URL in when it arrives. Returning nothing keeps
 *   the old behaviour: the handler is responsible for inserting the image itself.
 * @property {Function} [onImageError]         - Callback when an image upload error occurs
 * @property {boolean}  [stickyToolbar]        - Stick the toolbar to the viewport top when scrolling
 * @property {number}   [stickyToolbarOffset]  - Top offset in px for sticky toolbar (e.g. fixed nav height)
 * @property {string}   [theme]                - 'light' (default) | 'dark' | 'auto' (follows the OS colour scheme)
 * @property {Object<string, string|number>|null} [themeVars] - Design-token overrides, e.g. { primary: '#f97316' } (see README "Theming")
 * @property {number}   [zIndexOffset]         - Added to the z-index of every floating layer (default 0)
 * @property {string|Element|ShadowRoot|null} [popupContainer] - Where floating UI mounts (default document.body)
 * @property {boolean}  [codeHighlight]        - Auto-load Prism.js for syntax highlighting of code blocks
 * @property {string}   [codeHighlightCDN]     - CDN base URL for Prism assets, or your own origin to self-host (defaults to cdnjs). A trailing slash is normalised away.
 * @property {string}   [cspNonce]             - CSP nonce applied to dynamically injected scripts/styles
 * @property {string}   [externalAssetCrossOrigin] - crossorigin value for optional external assets
 * @property {string}   [externalAssetReferrerPolicy] - referrer policy for optional external assets
 * @property {boolean}  [markdownPaste]        - Convert pasted Markdown text to HTML (default: true)
 * @property {boolean}  [readOnly]             - Start editor in read-only / non-editable mode
 * @property {boolean}  [spellcheck]           - Enable browser spellcheck in the editable area (default: true)
 * @property {string}   [direction]            - Text direction: 'ltr' (default) | 'rtl'
 * @property {string}   [toolbarOverflow]      - Toolbar overflow strategy: 'wrap' (default) | 'scroll'
 * @property {boolean}  [autoSave]             - Auto-save content to localStorage on change
 * @property {string}   [autoSaveKey]          - localStorage key used for auto-save (default: 'autumnnote-autosave')
 * @property {number}   [autoSaveDelay]        - Debounce delay for auto-save writes in milliseconds
 * @property {object|null} [autoSaveAdapter]   - Optional async persistence adapter with save/load/remove methods
 * @property {number}   [maxChars]             - Maximum character count (0 = unlimited). Shows warning in statusbar.
 * @property {number}   [maxWords]             - Maximum word count (0 = unlimited). Shows warning in statusbar.
 * @property {boolean}  [tableHeaderRow]       - Insert a header row (<thead><th>) when creating tables
 * @property {Function} [onPaste]              - Fired on every paste before insertion: ({ text, html }) => void | false | string.
 *   Return false to cancel the paste, or an HTML string to insert instead (sanitised).
 * @property {Function} [onPasteError]         - Callback fired when pasted or dropped content cannot be processed
 * @property {Function} [onSelectionChange]    - Callback fired on cursor/selection change: (context) => void
 * @property {string[]} [colorSwatches]        - Custom brand colour swatches prepended to the colour-picker palette
 * @property {Function} [onDestroy]            - Callback fired when the editor is destroyed: (context) => void
 * @property {Function} [onCharLimitReached]   - Callback fired when the character limit is hit: (context) => void
 * @property {Function} [onWordLimitReached]   - Callback fired when the word limit is hit: (context) => void
 * @property {string}   [focusColor]           - Custom focus ring colour, e.g. '#f97316'. Overrides the default blue.
 * @property {boolean}  [autoSaveRestore]      - Show a restore banner when a previously auto-saved draft exists
 * @property {number}   [autoSaveRestoreTimeout] - Maximum age in days for a draft to be offered for restore (0 = no expiry)
 * @property {Function} [onAutoSaveRestore]    - Callback fired after the user chooses to restore a draft
 * @property {boolean}  [markdownShortcuts]    - Convert markdown syntax typed inline to HTML
 * @property {boolean}  [bubbleToolbar]        - Show a mini floating toolbar above text selections
 * @property {string[]} [bubbleToolbarItems]   - Button names for the bubble toolbar
 * @property {object|null} [mention]            - @mention configuration (onSearch, minChars, ...)
 * @property {boolean}  [slashMenu]            - Show a "/" command palette for quick block insertion (default true)
 * @property {string}   [lang]                 - Display language or partial locale object override
 * @property {{items?: object[]}|null} [contextMenu] - Right-click menu override; `items` replaces the built-in list
 */

export const defaultOptions = {
  placeholder: '',
  height: 200,
  minHeight: 100,
  maxHeight: 0,
  focus: false,
  resizable: true,
  // false hides the statusbar; word/char counts stay available through the API
  statusbar: true,
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
  // The icon dialog needs FA glyphs to render its grid. When the host page ships
  // no Font Awesome of its own, it pulls the stylesheet from a CDN. Set to false
  // on pages with a strict CSP, an offline deployment, or a no-third-party-request
  // policy — the dialog still works, it just renders without glyphs unless the
  // page provides FA itself.
  fontAwesomeAutoInject: true,
  fontAwesomeCDN: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
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
  // Design-token overrides for this editor, e.g. { primary: '#f97316', radius: '10px' }.
  themeVars: null,
  // Added to the z-index of every floating layer, e.g. to sit above a host modal.
  zIndexOffset: 0,
  // Where dialogs, tooltips and menus mount: selector, element or ShadowRoot (null = document.body).
  popupContainer: null,
  codeHighlight: true,
  codeHighlightCDN: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0',
  cspNonce: '',
  externalAssetCrossOrigin: 'anonymous',
  externalAssetReferrerPolicy: 'no-referrer',
  markdownPaste: true,
  historyLimit: 100,
  // Max combined size (chars) of all stacked undo/redo snapshots. Guards
  // against documents with many large embedded images holding dozens of
  // full-size copies in memory despite historyLimit.
  historyMaxBytes: 10 * 1024 * 1024,
  // Default font family applied to the editor and shown in the dropdown when no explicit font is set
  defaultFontFamily: 'Arial',
  // Default font size applied to the editor and shown in the size dropdown when no explicit size is set
  defaultFontSize: '14px',
  // Lists behind the toolbar dropdowns. Replace to offer your own values.
  fontSizes: [...DEFAULT_FONT_SIZES],
  lineHeights: [...DEFAULT_LINE_HEIGHTS],
  paragraphStyles: DEFAULT_PARAGRAPH_STYLES.map((item) => ({ ...item })),
  // Replaces the built-in colour swatches when set (colorSwatches are still prepended).
  colorPalette: null,
  // Per-editor icon overrides: { bold: '<svg ...>', italic: 'bi bi-type-italic' }.
  icons: null,
  // Per-editor button definitions usable by name in `toolbar`: { myBtn: { icon, tooltip, action } }.
  buttons: null,
  // Keyboard shortcut overrides merged over the defaults; false disables one.
  keyMap: null,
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
  autoSaveDelay: 400,
  autoSaveAdapter: null,
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
  // Callback fired for rejected/failed paste and drop payloads: function({ message, size?, maxBytes? })
  onPasteError: null,
  // Callback fired just before the editor instance is destroyed
  onDestroy: null,
  // Callback fired when the character limit is reached: function(context)
  onCharLimitReached: null,
  // Callback fired when the word limit is reached: function(context)
  onWordLimitReached: null,
  // Custom focus ring colour — overrides the default blue when set.
  // Accepts any valid CSS colour string, e.g. '#f97316', 'hsl(25,90%,55%)'.
  focusColor: null,
  // Display language for the editor UI.
  // Built-in values: 'en' (default), 'vi', 'ja', 'zh', 'fr', 'de', 'es', 'ko'.
  // Pass a partial or full locale object to override individual strings.
  lang: 'en',

  // Auto-save restore: show a banner when a draft exists in localStorage.
  // Requires autoSave: true. Set autoSaveRestoreTimeout to the max age in days
  // (0 = no expiry). onAutoSaveRestore(html, context) fires after restore.
  autoSaveRestore: false,
  autoSaveRestoreTimeout: 7,
  onAutoSaveRestore: null,

  // Markdown input shortcuts: convert markdown syntax typed inline to HTML.
  // e.g. "## " at line start → <h2>, "**bold**" → <strong>
  markdownShortcuts: true,

  // "/" command palette for quick block insertion (headings, lists, table, image, ...).
  // Triggers only when "/" is the first character typed on an otherwise-empty line.
  slashMenu: true,
  // Additional slash-menu commands supplied by applications/plugins.
  slashCommands: [],

  // Optional import/export adapters keyed by format name.
  documentAdapters: {},
  // Optional collaboration bridge notified with local HTML changes.
  collaborationAdapter: null,

  // Optional image processor (for example a Web Worker bridge). Receives a
  // File and returns a data URL; Clipboard's canvas pipeline remains fallback.
  imageProcessor: null,
  // Add stable data-an-block-id attributes to top-level document blocks.
  blockIds: false,

  // Maximum paste size in bytes (default 5 MB, 0 = unlimited). Larger pastes are dropped and fire `pasteError`.
  maxPasteSize: 5 * 1024 * 1024,
  // Minimum image dimension in px during resize (width and height). Prevents images from being
  // resized below this value.
  minImageSize: 20,

  // Bubble toolbar: show a mini floating toolbar above text selections.
  bubbleToolbar: false,
  bubbleToolbarItems: ['bold', 'italic', 'underline', 'link', 'foreColor', 'hiliteColor', 'removeFormat'],

  // @mention support. mention.onSearch(query, callback) must be provided to activate.
  // mention.minChars defaults to 0 — dropdown opens immediately on trigger character.
  mention: null,
};
