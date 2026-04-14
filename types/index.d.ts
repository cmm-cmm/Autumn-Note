/**
 * AutumnNote – TypeScript declarations
 * @version 1.0.4
 */

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface AsnOptions {
  /** Placeholder text when the editor is empty. */
  placeholder?: string;
  /** Editor height in px (sets the min-height of the editable area). */
  height?: number;
  /** Minimum height in px for the editable area. */
  minHeight?: number;
  /** Maximum height in px (0 = unlimited). */
  maxHeight?: number;
  /** Auto-focus the editor on init. */
  focus?: boolean;
  /** Show the resize handle in the statusbar. */
  resizable?: boolean;
  /** Toolbar button group configuration. */
  toolbar?: Array<Array<ToolbarItemDef>>;
  /** Use Bootstrap button classes on toolbar buttons. */
  useBootstrap?: boolean;
  /** CSS class(es) applied to Bootstrap toolbar buttons. */
  toolbarButtonClass?: string;
  /** Use Font Awesome icons (default: true). */
  useFontAwesome?: boolean;
  /** Font Awesome prefix class, e.g. 'fas' (FA5) or 'fa-solid' (FA6). */
  fontAwesomeClass?: string;
  /** Force plain-text paste — strips all HTML on paste. */
  pasteAsPlainText?: boolean;
  /** Sanitise HTML on paste. */
  pasteCleanHTML?: boolean;
  /** Strip class/style/data-* attributes from pasted HTML (default: false). */
  pasteStripAttributes?: boolean;
  /** Allow file upload in the image dialog. */
  allowImageUpload?: boolean;
  /** Maximum image upload size in MB. */
  maxImageSize?: number;
  /** Number of spaces inserted when Tab is pressed (outside a list). */
  tabSize?: number;
  /** Callback on content change. */
  onChange?: (html: string) => void;
  /** Callback on editor focus. */
  onFocus?: (context: Context) => void;
  /** Callback fired on editor blur. */
  onBlur?: (context: Context) => void;
  /** Callback after the editor has initialised. */
  onInit?: (context: Context) => void;
  /** Callback fired just before the editor instance is destroyed. */
  onDestroy?: (context: Context) => void;
  /** Callback fired whenever the selection changes inside the editor. */
  onSelectionChange?: (context: Context) => void;
  /** Callback fired when the character limit is reached. */
  onCharLimitReached?: (context: Context) => void;
  /** Callback fired when the word limit is reached. */
  onWordLimitReached?: (context: Context) => void;
  /** Custom image upload handler. */
  onImageUpload?: (files: File[]) => void;
  /** Callback when an image upload error occurs. */
  onImageError?: (error: { file?: File; message: string; error?: unknown }) => void;
  /** Stick the toolbar to the viewport top when scrolling. */
  stickyToolbar?: boolean;
  /** Top offset in px for sticky toolbar (e.g. height of a fixed nav bar). */
  stickyToolbarOffset?: number;
  /** Colour theme: 'light' (default) | 'dark'. */
  theme?: 'light' | 'dark';
  /** Auto-load Prism.js for syntax highlighting inside code blocks. */
  codeHighlight?: boolean;
  /** CDN base URL for Prism assets. */
  codeHighlightCDN?: string;
  /** Convert pasted Markdown text to HTML. */
  markdownPaste?: boolean;
  /** Maximum undo/redo history steps. */
  historyLimit?: number;
  /** Default font family applied to the editable area on init. */
  defaultFontFamily?: string;
  /** Default font size applied to the editable area on init (e.g. '14px'). */
  defaultFontSize?: string;
  /** Font families shown in the font-family toolbar dropdown. */
  fontFamilies?: string[];
  /** Start the editor in read-only (non-editable) mode. */
  readOnly?: boolean;
  /** Enable browser spellcheck in the editable area (default: true). */
  spellcheck?: boolean;
  /** Text direction for the editable area: 'ltr' (default) | 'rtl'. */
  direction?: 'ltr' | 'rtl';
  /** How the toolbar handles overflow: 'wrap' (default) | 'scroll'. */
  toolbarOverflow?: 'wrap' | 'scroll';
  /** Auto-save content to localStorage on every change. */
  autoSave?: boolean;
  /** localStorage key used for auto-save. */
  autoSaveKey?: string;
  /** Maximum character count for the statusbar warning (0 = unlimited). */
  maxChars?: number;
  /** Maximum word count for the statusbar warning (0 = unlimited). */
  maxWords?: number;
  /** Insert a header row (<thead>) when creating new tables. */
  tableHeaderRow?: boolean;
  /** Callback fired after every paste event. */
  onPaste?: (data: { text: string; html: string | null }) => void;
  /** Additional color swatches shown at the top of the color picker. */
  colorSwatches?: string[];
  /**
   * Display language for the editor UI.
   * Built-in: 'en' (default) | 'vi' | 'ja' | 'zh' | 'fr'.
   * Pass a partial locale object to override individual strings.
   */
  lang?: string | Partial<AsnLocale>;
}

// ---------------------------------------------------------------------------
// Button / toolbar definitions
// ---------------------------------------------------------------------------

export interface ButtonDef {
  /** Unique identifier used in toolbar config arrays. */
  name: string;
  /** Icon identifier (maps to SVG or Font Awesome class). */
  icon: string;
  /** Tooltip text. */
  tooltip: string;
  /** Action executed when the button is clicked. */
  action: (context: Context) => void;
  /** Returns true when the button should appear "active" (pressed). */
  isActive?: (context: Context) => boolean;
  /** Returns true when the button should be disabled. */
  isDisabled?: (context: Context) => boolean;
  /** Additional CSS class(es) added to the button element. */
  className?: string;
}

export interface GridButtonDef {
  /** Unique identifier used in toolbar config arrays. */
  name: string;
  /** Discriminator for table grid picker buttons. */
  type: 'grid';
  /** Icon identifier (maps to SVG or Font Awesome class). */
  icon: string;
  /** Tooltip text. */
  tooltip: string;
  /** Action executed when a grid size is selected. */
  action: (context: Context, rows: number, cols: number) => void;
}

export interface ColorPickerDef {
  /** Unique identifier used in toolbar config arrays. */
  name: string;
  /** Discriminator for split color picker buttons. */
  type: 'colorpicker';
  /** Icon identifier (maps to SVG or Font Awesome class). */
  icon: string;
  /** Tooltip text. */
  tooltip: string;
  /** Default color shown in the picker. */
  defaultColor: string;
  /** Action executed when a color is selected/applied. */
  action: (context: Context, color: string) => void;
}

export interface DropdownDef {
  /** Unique identifier. */
  name: string;
  /** Must be 'select' to identify as a dropdown. */
  type: 'select';
  /** Tooltip text. */
  tooltip: string;
  /** Static item list (may be overridden at render time from options). */
  items?: Array<string | { value: string; label: string }>;
  /** Action executed when a value is selected. */
  action: (context: Context, value: string) => void;
  /** Returns the current value to show as selected. */
  getValue?: (context: Context) => string;
}

export type ToolbarItemDef = ButtonDef | DropdownDef | GridButtonDef | ColorPickerDef;

// ---------------------------------------------------------------------------
// Entry-point re-exports
// ---------------------------------------------------------------------------

/** Runtime default options object (same export as `src/js/index.js`). */
export declare const defaultOptions: Required<AsnOptions>;

// ---------------------------------------------------------------------------
// Locale / i18n
// ---------------------------------------------------------------------------

/** Full locale object shape used by the editor. All leaf values are strings or template functions. */
export interface AsnLocale {
  toolbar: Record<string, string | ((n: string | number) => string)>;
  linkDialog: Record<string, string>;
  imageDialog: Record<string, string>;
  videoDialog: Record<string, string | ((type: string) => string)>;
  emojiDialog: Record<string, string | Record<string, string>>;
  iconDialog: Record<string, string | Record<string, string>>;
  findReplace: Record<string, string>;
  shortcutsDialog: {
    title: string;
    ariaLabel: string;
    close: string;
    shortcuts: Array<{ category: string; items: Array<{ keys: string; action: string }> }>;
  };
  contextMenu: Record<string, string>;
  statusbar: {
    resizeHandle: string;
    words: (n: number) => string;
    wordsLimit: (n: number, max: number) => string;
    chars: (n: number) => string;
    charsLimit: (n: number, max: number) => string;
  };
  tooltips: {
    link: Record<string, string>;
    image: Record<string, string>;
    code: Record<string, string>;
    table: Record<string, string>;
    video: Record<string, string>;
  };
  errors: {
    imageFormat: (type: string) => string;
    imageSize: (maxMb: number) => string;
  };
}

/** Registry of all built-in locales (keys: 'en', 'vi', 'ja', 'zh', 'fr'). */
export declare const locales: Record<string, AsnLocale>;

/**
 * Resolves a lang value to a full AsnLocale.
 * - string key → looks up locales registry, deep-merges with 'en' fallback.
 * - object → deep-merges with 'en' as base.
 * - falsy / 'en' → returns the canonical English locale.
 */
export declare function resolveLocale(lang: string | Partial<AsnLocale> | null | undefined): AsnLocale;

// Re-export core utility modules exposed by the package entry-point.
export * from '../src/js/core/dom.js';
export * from '../src/js/core/range.js';
export * from '../src/js/core/func.js';
export * from '../src/js/core/key.js';
export * from '../src/js/core/lists.js';
export * from '../src/js/core/env.js';
export * from '../src/js/core/sanitise.js';

// ---------------------------------------------------------------------------
// Context — per-instance editor hub
// ---------------------------------------------------------------------------

export declare class Context {
  readonly targetEl: HTMLElement;
  readonly options: Required<AsnOptions>;
  readonly layoutInfo: {
    container: HTMLElement;
    editable: HTMLElement;
    toolbar?: HTMLElement;
    statusbar?: HTMLElement;
  };

  constructor(targetEl: HTMLElement, userOptions?: AsnOptions);

  /** Initialises the editor (called automatically by AutumnNote.create). */
  initialize(): this;

  /** Invokes a method on a registered module (e.g. 'editor.bold'). */
  invoke(path: string, ...args: unknown[]): unknown;

  /** Subscribes to an editor event. Returns an unsubscribe function. */
  on(eventName: string, handler: (...args: unknown[]) => void): () => void;

  /** Unsubscribes from an editor event. */
  off(eventName: string, handler: (...args: unknown[]) => void): void;

  /** Triggers an editor event. */
  triggerEvent(eventName: string, ...args: unknown[]): void;

  /** Returns the current HTML content of the editor. */
  getHTML(): string;

  /** Sets the HTML content of the editor. */
  setHTML(html: string): void;

  /** Returns the plain-text content of the editor. */
  getText(): string;

  /** Sets the editor content from a plain-text string (HTML-escaped). */
  setText(text: string): void;

  /** Clears the editor content. */
  clear(): void;

  /**
   * Resets the undo/redo history stack.
   * Useful after programmatically loading content via setHTML() / setMarkdown()
   * so that Ctrl+Z cannot undo back to the previous document.
   */
  clearHistory(): void;

  /** Returns true when the editor has no meaningful content. */
  isEmpty(): boolean;

  /** Inserts HTML at the current cursor position. */
  insertHTML(html: string): void;

  /** Inserts plain text at the current cursor position. */
  insertText(text: string): void;

  /** Sets editor content from a Markdown string. */
  setMarkdown(md: string): void;

  /** Returns the editor content as a Markdown string. */
  getMarkdown(): string;

  /** Returns the current word count of the editor content. */
  getWordCount(): number;

  /** Returns the current character count (excluding newlines) of the editor content. */
  getCharCount(): number;

  /** Downloads the editor content as an HTML file. */
  downloadHTML(filename?: string): void;

  /** Downloads the editor content as a plain-text file. */
  downloadText(filename?: string): void;

  /** Downloads the editor content as a Markdown file. */
  downloadMarkdown(filename?: string): void;

  /** Enables or disables (read-only) mode on this instance. */
  setDisabled(disabled: boolean): void;

  /**
   * Registers and initialises a custom module on this instance.
   * @param name   - Key used for ctx.invoke() calls (e.g. 'myModule')
   * @param ModuleClass - Class with `initialize()` and optional `destroy()`
   */
  registerModule(name: string, ModuleClass: new (ctx: Context) => object): this;

  /** Completely removes the editor and restores the original element. */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Pre-built toolbar buttons (re-exported for custom toolbar config)
// ---------------------------------------------------------------------------

export declare const boldBtn: ButtonDef;
export declare const italicBtn: ButtonDef;
export declare const underlineBtn: ButtonDef;
export declare const strikeBtn: ButtonDef;
export declare const superscriptBtn: ButtonDef;
export declare const subscriptBtn: ButtonDef;
export declare const alignLeftBtn: ButtonDef;
export declare const alignCenterBtn: ButtonDef;
export declare const alignRightBtn: ButtonDef;
export declare const alignJustifyBtn: ButtonDef;
export declare const ulBtn: ButtonDef;
export declare const olBtn: ButtonDef;
export declare const indentBtn: ButtonDef;
export declare const outdentBtn: ButtonDef;
export declare const undoBtn: ButtonDef;
export declare const redoBtn: ButtonDef;
export declare const hrBtn: ButtonDef;
export declare const linkBtn: ButtonDef;
export declare const imageBtn: ButtonDef;
export declare const videoBtn: ButtonDef;
export declare const tableBtn: GridButtonDef;
export declare const codeviewBtn: ButtonDef;
export declare const fullscreenBtn: ButtonDef;
export declare const emojiBtn: ButtonDef;
export declare const iconBtn: ButtonDef;
export declare const shortcutsBtn: ButtonDef;
export declare const findBtn: ButtonDef;
export declare const findReplaceBtn: ButtonDef;
export declare const inlineCodeBtn: ButtonDef;
export declare const checklistBtn: ButtonDef;
export declare const printBtn: ButtonDef;
export declare const removeFormatBtn: ButtonDef;
export declare const directionBtn: ButtonDef;
export declare const fontFamilyBtn: DropdownDef;
export declare const fontSizeBtn: DropdownDef;
export declare const lineHeightBtn: DropdownDef;
export declare const paragraphStyleBtn: DropdownDef;
export declare const foreColorBtn: ColorPickerDef;
export declare const backColorBtn: ColorPickerDef;
export declare const defaultToolbar: Array<Array<ToolbarItemDef>>;

// ---------------------------------------------------------------------------
// Main AutumnNote API
// ---------------------------------------------------------------------------

export interface AutumnNoteStatic {
  /**
   * Creates (or returns existing) editor instance(s) on one or more elements.
   * Returns a single Context when one element is matched, or an array otherwise.
   */
  create(selector: string | Element | NodeList | Element[], options?: AsnOptions): Context | Context[];

  /** Destroys the editor(s) on the given selector. */
  destroy(selector: string | Element | NodeList | Element[]): void;

  /** Returns the Context for a given element, or null if not initialised. */
  getInstance(selector: string | Element): Context | null;

  /** Read-only snapshot of the current global defaults. */
  readonly defaults: Readonly<AsnOptions>;

  /** Merges options into the global defaults (applies to all future instances). */
  setDefaults(overrides: Partial<AsnOptions>): void;

  /** Restores global defaults back to their original factory values. */
  resetDefaults(): void;

  /**
   * Registers a custom module to be included in every new editor instance.
   * @param name        - Key for `ctx.invoke()` (e.g. 'myPlugin')
   * @param ModuleClass - Class with `initialize()` and optional `destroy()`
   */
  registerModule(name: string, ModuleClass: new (ctx: Context) => object): void;

  /** Library version string. */
  readonly version: string;
}

declare const AutumnNote: AutumnNoteStatic;
export default AutumnNote;
