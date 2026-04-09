# AutumnNote — Developer Manual

AutumnNote is a modern, lightweight WYSIWYG rich-text editor built with plain JavaScript and no jQuery dependency. It wraps any `<textarea>` (or block element) and exposes a clean API for reading/writing HTML content, customising the toolbar, handling events, and integrating with your own upload pipeline.

---

## Table of Contents

1. [Installation](#1-installation)
2. [Quick Start](#2-quick-start)
3. [Configuration Options](#3-configuration-options)
4. [Public API — Static Methods](#4-public-api--static-methods)
5. [Public API — Instance Methods](#5-public-api--instance-methods)
6. [Events](#6-events)
7. [Toolbar Customisation](#7-toolbar-customisation)
8. [Keyboard Shortcuts](#8-keyboard-shortcuts)
9. [Theming (Light / Dark)](#9-theming-light--dark)
10. [Code Highlighting](#10-code-highlighting)
11. [Image Upload](#11-image-upload)
12. [Bootstrap Integration](#12-bootstrap-integration)
13. [Multiple Editors](#13-multiple-editors)
14. [Destroying an Editor](#14-destroying-an-editor)
15. [Advanced — Module Invocation](#15-advanced--module-invocation)
16. [Building from Source](#16-building-from-source)
17. [Find & Replace](#17-find--replace)
18. [Checklist](#18-checklist)
19. [Image Crop Overlay](#19-image-crop-overlay)
20. [Read-only Mode](#20-read-only-mode)
21. [Auto-save](#21-auto-save)
22. [RTL Support](#22-rtl-support)
23. [Character & Word Limits](#23-character--word-limits)

---

## 1. Installation

### npm

```bash
npm install autumnnote
```

Import in your JavaScript entry point:

```js
import AutumnNote from 'autumnnote';
import 'autumnnote/dist/autumnnote.css';
```

### Script Tag (UMD)

Download the pre-built files from `dist/` and include them in your HTML:

```html
<link rel="stylesheet" href="dist/autumnnote.css">
<script src="dist/autumnnote.umd.js"></script>
<!-- AutumnNote is now available as window.AutumnNote -->
```

---

## 2. Quick Start

Replace a `<textarea>` with an editor:

```html
<textarea id="editor">Hello, <b>world</b>!</textarea>

<script type="module">
  import AutumnNote from './dist/autumnnote.es.js';

  const editor = AutumnNote.create('#editor', {
    height: 300,
    onChange(html) {
      console.log('Content changed:', html);
    }
  });
</script>
```

`AutumnNote.create()` hides the original element and inserts the editor UI in its place. The textarea value is kept in sync so standard form submission works without any extra code.

---

## 3. Configuration Options

Pass options as the second argument to `AutumnNote.create()`, or set global defaults with `AutumnNote.setDefaults()`.

| Option | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `''` | Placeholder text shown when the editor is empty. |
| `height` | `number` | `200` | Initial editor height in pixels. |
| `minHeight` | `number` | `100` | Minimum resizable height in pixels. |
| `maxHeight` | `number` | `0` | Maximum resizable height in pixels. `0` means unlimited. |
| `focus` | `boolean` | `false` | Automatically focus the editor on creation. |
| `resizable` | `boolean` | `true` | Show the resize handle at the bottom of the editor. |
| `toolbar` | `Array[]` | _all buttons_ | Toolbar layout. See [Toolbar Customisation](#7-toolbar-customisation). |
| `toolbarOverflow` | `string` | `'wrap'` | How the toolbar handles overflow: `'wrap'` (wraps to next line) or `'scroll'` (single scrollable row). |
| `useBootstrap` | `boolean` | `false` | Apply Bootstrap CSS classes to toolbar buttons. |
| `bootstrapVersion` | `number` | `5` | Bootstrap major version (`4` or `5`). |
| `toolbarButtonClass` | `string` | `'btn btn-sm btn-light'` | CSS classes added to each toolbar button when `useBootstrap` is `true`. |
| `useFontAwesome` | `boolean` | `true` | Use Font Awesome icons for toolbar buttons. Set to `false` to use built-in SVG fallbacks. |
| `fontAwesomeClass` | `string` | `'fas'` | Font Awesome prefix class. Use `'fas'` for FA5, `'fa-solid'` for FA6. |
| `pasteAsPlainText` | `boolean` | `false` | Strip all formatting when pasting. |
| `pasteCleanHTML` | `boolean` | `true` | Sanitise HTML on paste (removes scripts, dangerous attributes, etc.). |
| `pasteStripAttributes` | `boolean` | `false` | Strip `class`, `style`, and `data-*` attributes from pasted HTML elements. |
| `markdownPaste` | `boolean` | `true` | Convert pasted Markdown shortcuts (e.g. `**bold**`, `# Heading`) to HTML as you type. |
| `allowImageUpload` | `boolean` | `true` | Allow dragging/pasting images and file upload in the image dialog. |
| `maxImageSize` | `number` | `5` | Maximum image file size in megabytes. |
| `tabSize` | `number` | `4` | Number of spaces inserted when Tab is pressed. |
| `historyLimit` | `number` | `100` | Maximum number of undo steps to retain. |
| `defaultFontFamily` | `string` | `'Arial'` | Font shown by default in the font-family dropdown. |
| `defaultFontSize` | `string` | `'14px'` | Default font size applied to new content. |
| `fontFamilies` | `string[]` | _(see below)_ | List of fonts available in the font-family dropdown. |
| `stickyToolbar` | `boolean` | `false` | Pin the toolbar to the viewport top while scrolling. |
| `stickyToolbarOffset` | `number` | `0` | Top offset in pixels for the sticky toolbar (e.g. height of a fixed nav bar). |
| `theme` | `string` | `'light'` | Colour theme: `'light'` or `'dark'`. |
| `readOnly` | `boolean` | `false` | Start the editor in non-editable mode with toolbar hidden. Toggle at runtime via `setDisabled()`. |
| `spellcheck` | `boolean` | `true` | Enable browser spellcheck in the editable area. |
| `direction` | `string` | `'ltr'` | Text direction: `'ltr'` (default) or `'rtl'`. Sets `dir` attribute on the editable area. |
| `autoSave` | `boolean` | `false` | Persist content to `localStorage` on every change. |
| `autoSaveKey` | `string` | `'autumnnote-autosave'` | `localStorage` key used when `autoSave` is enabled. |
| `maxChars` | `number` | `0` | Maximum character count. `0` = unlimited. Shows a warning in the statusbar when reached. |
| `maxWords` | `number` | `0` | Maximum word count. `0` = unlimited. Shows a warning in the statusbar when reached. |
| `tableHeaderRow` | `boolean` | `false` | Insert a `<thead>` header row when creating new tables. |
| `codeHighlight` | `boolean` | `true` | Syntax-highlight `<code>` blocks using Prism.js via CDN. |
| `codeHighlightCDN` | `string` | `'https://cdnjs.cloudflare.com/…/prism/1.29.0'` | Base URL for Prism.js CDN assets. |
| `colorSwatches` | `string[]` | `[]` | Custom brand colour swatches prepended to the colour picker palette. |
| `focusColor` | `string` | `null` | Custom focus ring colour (any valid CSS colour string). Overrides the default blue. |
| `onChange` | `function\|null` | `null` | Called with `(html: string)` on every content change. |
| `onFocus` | `function\|null` | `null` | Called with `(context)` when the editor gains focus. |
| `onBlur` | `function\|null` | `null` | Called with `(context)` when the editor loses focus. |
| `onInit` | `function\|null` | `null` | Called with `(context)` once the editor has fully initialised. |
| `onImageUpload` | `function\|null` | `null` | Called with `(files: FileList)` when images are dropped/pasted. See [Image Upload](#11-image-upload). |
| `onImageError` | `function\|null` | `null` | Called with `({ file, message })` when an image is rejected (e.g. over `maxImageSize`). |
| `onPaste` | `function\|null` | `null` | Called with `({ text, html })` after every paste event. |
| `onSelectionChange` | `function\|null` | `null` | Called with `(context)` when the cursor or selection changes inside the editor. |
| `onDestroy` | `function\|null` | `null` | Called with `(context)` just before the editor instance is destroyed. |
| `onCharLimitReached` | `function\|null` | `null` | Called with `(context)` when `maxChars` is hit. |
| `onWordLimitReached` | `function\|null` | `null` | Called with `(context)` when `maxWords` is hit. |

**Default `fontFamilies`:**
```js
['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
 'Impact', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana']
```

### Example — Full options

```js
AutumnNote.create('#editor', {
  height: 400,
  minHeight: 150,
  maxHeight: 800,
  placeholder: 'Start typing…',
  focus: true,
  theme: 'dark',
  direction: 'ltr',
  readOnly: false,
  spellcheck: true,
  pasteAsPlainText: false,
  pasteCleanHTML: true,
  pasteStripAttributes: false,
  allowImageUpload: true,
  maxImageSize: 10,
  stickyToolbar: true,
  stickyToolbarOffset: 56,  // height of a fixed nav bar
  autoSave: true,
  autoSaveKey: 'my-draft',
  maxChars: 5000,
  maxWords: 1000,
  tableHeaderRow: true,
  historyLimit: 50,
  fontFamilies: ['Arial', 'Roboto', 'Open Sans'],
  defaultFontFamily: 'Roboto',
  defaultFontSize: '16px',
  colorSwatches: ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'],
  focusColor: '#f97316',
  onChange(html) { /* ... */ },
  onInit(ctx) { /* ... */ },
  onDestroy(ctx) { /* ... */ },
  onCharLimitReached(ctx) { alert('Limit reached'); },
});
```

---

## 4. Public API — Static Methods

These are methods on the `AutumnNote` object itself (not on an editor instance).

### `AutumnNote.create(selector, options?)`

Creates one or more editor instances.

- **`selector`** — a CSS selector string, a single `Element`, a `NodeList`, or an `Array<Element>`.
- **`options`** — optional [configuration object](#3-configuration-options).
- **Returns** — a single `Context` instance when one element is matched; an array of `Context` instances when multiple elements are matched.

```js
// Single editor
const editor = AutumnNote.create('#my-editor');

// Multiple editors at once
const editors = AutumnNote.create('.rich-text-area');
```

### `AutumnNote.destroy(selector)`

Destroys editor instance(s) and restores the original element(s).

```js
AutumnNote.destroy('#my-editor');
```

### `AutumnNote.getInstance(selector)`

Returns the `Context` instance already attached to the matched element, or `null` if none exists.

```js
const editor = AutumnNote.getInstance('#my-editor');
if (editor) {
  console.log(editor.getHTML());
}
```

### `AutumnNote.setDefaults(overrides)`

Merges `overrides` into the global default options. Any editor created **after** this call will inherit the new defaults.

```js
AutumnNote.setDefaults({
  height: 350,
  theme: 'dark',
  useFontAwesome: false
});
```

### `AutumnNote.defaults`

Read-only getter — returns a shallow copy of the current global defaults.

```js
console.log(AutumnNote.defaults.theme); // 'light'
```

### `AutumnNote.version`

String containing the library version.

```js
console.log(AutumnNote.version); // '1.0.0'
```

---

## 5. Public API — Instance Methods

Each call to `AutumnNote.create()` returns a `Context` instance with the following methods.

### Content

#### `editor.getHTML()` → `string`

Returns the current HTML content of the editor. Blob URLs created from pasted images are automatically resolved to their data URIs so the returned string is fully self-contained.

```js
const html = editor.getHTML();
```

#### `editor.setHTML(html)`

Replaces the editor content with the provided HTML string. The HTML is sanitised before insertion and the undo history is reset.

```js
editor.setHTML('<p>New <strong>content</strong></p>');
```

#### `editor.getText()` → `string`

Returns the editor content as plain text (no HTML tags).

```js
const text = editor.getText();
```

#### `editor.clear()`

Clears all content from the editor.

```js
editor.clear();
```

#### `editor.setDisabled(disabled)`

Toggles the editor between read-only (`true`) and editable (`false`) modes. When disabled, the toolbar remains visible but user input is blocked.

```js
editor.setDisabled(true);  // read-only
editor.setDisabled(false); // editable again
```

### Formatting Commands

These methods apply formatting to the current selection, mirroring the toolbar buttons.

| Method | Description |
|---|---|
| `editor.bold()` | Bold |
| `editor.italic()` | Italic |
| `editor.underline()` | Underline |
| `editor.strikethrough()` | Strikethrough |
| `editor.superscript()` | Superscript |
| `editor.subscript()` | Subscript |
| `editor.justifyLeft()` | Align left |
| `editor.justifyCenter()` | Align centre |
| `editor.justifyRight()` | Align right |
| `editor.justifyFull()` | Justify |
| `editor.indent()` | Increase indent |
| `editor.outdent()` | Decrease indent |
| `editor.insertUL()` | Unordered list |
| `editor.insertOL()` | Ordered list |
| `editor.formatBlock(tagName)` | Apply block-level tag (e.g. `'h1'`, `'p'`, `'blockquote'`) |
| `editor.foreColor(color)` | Set foreground / text colour |
| `editor.backColor(color)` | Set background / highlight colour |
| `editor.fontName(name)` | Set font family |
| `editor.fontSize(size)` | Set font size (e.g. `'14px'`) |
| `editor.insertHr()` | Insert a horizontal rule |

```js
editor.foreColor('#e74c3c');
editor.formatBlock('h2');
editor.fontSize('18px');
```

### Insert Helpers

#### `editor.insertLink(url, text, openInNewTab?)`

Creates a hyperlink at the current selection. If text is selected, that text becomes the link. If the cursor is collapsed, `text` is used as the link label.

- `url` — the href (must be a valid `http://`, `https://`, `mailto:`, or relative URL).
- `text` — display text when nothing is selected.
- `openInNewTab` — defaults to `false`. When `true`, adds `target="_blank" rel="noopener noreferrer"`.

```js
editor.insertLink('https://example.com', 'Visit us', true);
```

#### `editor.unlink()`

Removes the hyperlink from the currently selected or focused anchor element.

#### `editor.insertImage(src, alt?)`

Inserts an image at the cursor position. `src` accepts a URL or a data URI.

```js
editor.insertImage('https://example.com/photo.jpg', 'A photo');
editor.insertImage('data:image/png;base64,...', 'Inline image');
```

#### `editor.insertTable(cols, rows)`

Inserts a table with the specified number of columns and rows.

```js
editor.insertTable(3, 4); // 3 columns, 4 rows
```

### Undo / Redo

| Method | Description |
|---|---|
| `editor.undo()` | Undo the last change |
| `editor.redo()` | Redo the last undone change |
| `editor.canUndo()` → `boolean` | Whether undo is available |
| `editor.canRedo()` → `boolean` | Whether redo is available |

### Focus

#### `editor.invoke('editor.focus')`

Programmatically focuses the editor. See [Advanced — Module Invocation](#15-advanced--module-invocation).

### Event Subscription

#### `editor.on(eventName, handler)` → `() => void`

Subscribes to a named editor event. Returns an unsubscribe function.

```js
const unsub = editor.on('change', (html) => {
  console.log('changed:', html);
});

// Later:
unsub();
```

#### `editor.off(eventName, handler)`

Removes a previously registered handler.

### Destroy

#### `editor.destroy()`

Completely removes this editor instance, restores the original element, and cleans up all event listeners and DOM nodes. Prefer `AutumnNote.destroy(selector)` when you only have a selector reference.

---

## 6. Events

Events can be registered either as option callbacks or via `editor.on()`.

| Event name | Option callback | Arguments | Description |
|---|---|---|---|
| `change` | `onChange` | `html: string` | Fired ~400 ms after every content mutation. |
| `focus` | `onFocus` | `context` | Fired when the editable area gains focus. |
| `blur` | `onBlur` | `context` | Fired when the editable area loses focus. |
| `init` | `onInit` | `context` | Fired once, after the editor has fully initialised. |
| `imageUpload` | `onImageUpload` | `files: FileList` | Fired when images are dropped or pasted, **only** when `onImageUpload` is provided. The editor does **not** embed the image itself — your handler must insert it. |
| `imageError` | `onImageError` | `{ file, message }` | Fired when an image is rejected (e.g. exceeds `maxImageSize`). |
| `paste` | `onPaste` | `{ text, html }` | Fired after every paste event with the raw clipboard text and HTML. |
| `selectionChange` | `onSelectionChange` | `context` | Fired when the cursor or selection changes inside the editor. |
| `destroy` | `onDestroy` | `context` | Fired just before the editor instance is destroyed. |
| `charLimitReached` | `onCharLimitReached` | `context` | Fired when the character count hits `maxChars`. |
| `wordLimitReached` | `onWordLimitReached` | `context` | Fired when the word count hits `maxWords`. |

### Using `editor.on()`

```js
const editor = AutumnNote.create('#editor');

editor.on('change', (html) => saveToServer(html));
editor.on('focus', (ctx) => console.log('focused', ctx));
```

### Using option callbacks

```js
AutumnNote.create('#editor', {
  onChange(html) { saveToServer(html); },
  onFocus(ctx)   { console.log('focused'); },
  onBlur(ctx)    { console.log('blurred'); },
  onInit(ctx)    { ctx.setHTML(loadFromServer()); }
});
```

---

## 7. Toolbar Customisation

The `toolbar` option accepts an array of **groups**. Each group is an array of button definition objects. AutumnNote exports all built-in button definitions so you can compose any layout.

### Named Exports

```js
import {
  boldBtn, italicBtn, underlineBtn, strikeBtn,
  superscriptBtn, subscriptBtn,
  alignLeftBtn, alignCenterBtn, alignRightBtn, alignJustifyBtn,
  ulBtn, olBtn, checklistBtn, indentBtn, outdentBtn,
  undoBtn, redoBtn,
  hrBtn,
  linkBtn, imageBtn, videoBtn,
  emojiBtn, iconBtn, tableBtn,
  fontFamilyBtn, paragraphStyleBtn, lineHeightBtn,
  codeviewBtn, fullscreenBtn, shortcutsBtn,
  foreColorBtn, backColorBtn,
  findBtn, findReplaceBtn,
} from 'autumnnote';
```

### Default Toolbar Layout

If you do not specify `toolbar`, this layout is used:

```js
[
  [paragraphStyleBtn, fontFamilyBtn, lineHeightBtn],
  [undoBtn, redoBtn],
  [boldBtn, italicBtn, underlineBtn, strikeBtn],
  [superscriptBtn, subscriptBtn],
  [foreColorBtn, backColorBtn],
  [alignLeftBtn, alignCenterBtn, alignRightBtn, alignJustifyBtn],
  [ulBtn, olBtn, checklistBtn, indentBtn, outdentBtn],
  [hrBtn, linkBtn, imageBtn, videoBtn, tableBtn, emojiBtn, iconBtn],
  [codeviewBtn, fullscreenBtn, shortcutsBtn]
]
```

### Custom Toolbar Example

```js
import AutumnNote, { boldBtn, italicBtn, underlineBtn, ulBtn, olBtn, linkBtn, undoBtn, redoBtn } from 'autumnnote';

AutumnNote.create('#editor', {
  toolbar: [
    [undoBtn, redoBtn],
    [boldBtn, italicBtn, underlineBtn],
    [ulBtn, olBtn],
    [linkBtn]
  ]
});
```

### Minimal Toolbar

```js
AutumnNote.create('#editor', {
  toolbar: [
    [boldBtn, italicBtn],
    [linkBtn, imageBtn]
  ]
});
```

### Hiding the Toolbar

Pass an empty array to create a toolbar-less editor (still supports keyboard shortcuts):

```js
AutumnNote.create('#editor', { toolbar: [] });
```

---

## 8. Keyboard Shortcuts

| Keys | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` / `Ctrl + Y` | Redo |
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + U` | Underline |
| `Ctrl + F` | Open Find dialog |
| `Ctrl + H` | Open Find & Replace dialog |
| `Shift + Enter` | Insert line break (`<br>`) |
| `Tab` | Insert spaces / indent list item |
| `Shift + Tab` | Outdent list item |
| `Shift + ?` | Open Keyboard Shortcuts dialog |

> The number of spaces inserted by `Tab` is controlled by the `tabSize` option.

---

## 9. Theming (Light / Dark)

Set the `theme` option to `'light'` (default) or `'dark'`:

```js
AutumnNote.create('#editor', { theme: 'dark' });
```

### SCSS Variables

If you build AutumnNote from source, you can customise every colour by overriding the SCSS variables in `src/styles/_variables.scss` before importing `autumnnote.scss`.

Key variables (light / dark pairs):

```scss
// Light theme (defaults)
$an-bg:              #ffffff;
$an-text:            #212529;
$an-border:          #dee2e6;
$an-toolbar-bg:      #f8f9fa;
$an-btn-hover-bg:    #e2e6ea;
$an-statusbar-bg:    #f8f9fa;
$an-statusbar-text:  #6c757d;

// Dark theme
$an-dark-bg:              #1e1e2e;
$an-dark-text:            #cdd6f4;
$an-dark-border:          #45475a;
$an-dark-toolbar-bg:      #181825;
$an-dark-btn-hover-bg:    #313244;
$an-dark-statusbar-bg:    #181825;
$an-dark-statusbar-text:  #a6adc8;
```

---

## 10. Code Highlighting

When `codeHighlight: true` (the default), AutumnNote loads [Prism.js](https://prismjs.com/) from a CDN and applies syntax highlighting to any `<code>` block that carries a `language-*` class.

The default CDN is:

```
https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0
```

Override it with `codeHighlightCDN`:

```js
AutumnNote.create('#editor', {
  codeHighlightCDN: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0'
});
```

Disable code highlighting entirely:

```js
AutumnNote.create('#editor', { codeHighlight: false });
```

---

## 11. Image Upload

By default, images dropped or pasted into the editor are embedded as data URIs. To upload to your own server instead, set the `onImageUpload` callback:

```js
AutumnNote.create('#editor', {
  onImageUpload(files) {
    // `files` is a FileList
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      fetch('/api/upload', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(({ url }) => {
          // Insert the returned URL into the editor
          editor.insertImage(url, file.name);
        });
    }
  },
  onImageError({ file, message }) {
    console.error(`Rejected ${file.name}: ${message}`);
  }
});
```

> **Note:** When `onImageUpload` is set, the editor does **not** embed images automatically. Your callback is fully responsible for calling `editor.insertImage()` with the final URL.

### Restricting image size

```js
AutumnNote.create('#editor', {
  maxImageSize: 2, // reject images larger than 2 MB
  onImageError({ file, message }) {
    alert(message);
  }
});
```

### Disabling image upload entirely

```js
AutumnNote.create('#editor', { allowImageUpload: false });
```

---

## 12. Bootstrap Integration

Set `useBootstrap: true` to apply Bootstrap CSS classes to toolbar buttons:

```js
AutumnNote.create('#editor', {
  useBootstrap: true,
  toolbarButtonClass: 'btn btn-sm btn-outline-secondary' // optional override
});
```

The editor itself does not depend on Bootstrap — this flag simply switches the CSS class names on the rendered `<button>` elements so they pick up your existing Bootstrap styles.

---

## 13. Multiple Editors

`AutumnNote.create()` accepts any selector that can match multiple elements:

```js
// All textareas on the page
const editors = AutumnNote.create('textarea.rich');

// An array of elements
const editors = AutumnNote.create([el1, el2, el3]);

// Configure each editor identically
AutumnNote.create('textarea.rich', {
  height: 250,
  theme: 'dark'
});
```

When multiple elements are matched, `create()` returns an **array** of `Context` instances.

```js
const [first, second] = AutumnNote.create('.editor');

first.setHTML('<p>Hello</p>');
second.setHTML('<p>World</p>');
```

---

## 14. Destroying an Editor

Destroying an editor removes the editor UI, restores the original element, and cleans up all event listeners and timers.

```js
// Via static method (recommended — only requires the selector)
AutumnNote.destroy('#my-editor');

// Via the context instance
const editor = AutumnNote.create('#my-editor');
// ...
editor.destroy();
```

---

## 15. Advanced — Module Invocation

Internally, AutumnNote is composed of named modules (`editor`, `toolbar`, `clipboard`, `linkDialog`, etc.). The `invoke()` method lets you call any public method on any module directly.

```js
context.invoke('moduleName.methodName', arg1, arg2, ...);
```

This is primarily used for building toolbar buttons or extending the editor. Most common use-cases are already covered by the instance API, but `invoke()` gives access to anything internal.

### Useful invocation paths

| Path | Description |
|---|---|
| `'editor.focus'` | Focus the editable area |
| `'editor.bold'` | Apply bold to selection |
| `'editor.insertLink', url, text, newTab` | Insert a link |
| `'editor.insertImage', src, alt` | Insert an image |
| `'editor.insertTable', cols, rows` | Insert a table |
| `'editor.getHTML'` | Get editor HTML |
| `'editor.setHTML', html` | Set editor HTML |
| `'editor.canUndo'` | Check undo availability |
| `'toolbar.refresh'` | Force toolbar button state refresh |
| `'codeview.toggle'` | Toggle HTML source view |
| `'fullscreen.toggle'` | Toggle fullscreen mode |
| `'linkDialog.show'` | Open the link dialog |
| `'imageDialog.show'` | Open the image dialog |
| `'videoDialog.show'` | Open the video dialog |
| `'emojiDialog.show'` | Open the emoji picker |
| `'findReplace.show', mode` | Open Find (`mode: 'find'`) or Find & Replace (`mode: 'replace'`) dialog |
| `'editor.toggleChecklist'` | Toggle checklist on current selection |
| `'shortcutsDialog.show'` | Open the keyboard shortcuts dialog |

### Example

```js
const editor = AutumnNote.create('#editor');

// Programmatically open the image dialog
editor.invoke('imageDialog.show');

// Toggle HTML source view
editor.invoke('codeview.toggle');

// Check and read current content
if (editor.invoke('editor.canUndo')) {
  console.log('Can undo');
}
```

---

## 16. Building from Source

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Development server

Starts a live-reload dev server with `examples/basic.html`:

```bash
npm run dev
```

### Production build

Outputs to `dist/`:

```bash
npm run build
```

Generated files:

| File | Format | Usage |
|---|---|---|
| `dist/autumnnote.es.js` | ES Module | `import` in bundlers |
| `dist/autumnnote.umd.js` | UMD | `<script>` tag / AMD |
| `dist/autumnnote.css` | CSS | styles for both formats |

### Tests

```bash
npm test          # run all tests once
npm run test:watch # run in watch mode
```

### Linting

```bash
npm run lint
```

### Type checking

```bash
npm run typecheck
```

---

## 17. Find & Replace

AutumnNote includes a built-in Find and Replace dialog available via keyboard shortcuts or toolbar buttons.

- **`Ctrl+F`** opens the **Find** panel — a compact overlay that highlights all matches in the editor using `<mark>` elements and allows Prev/Next navigation.
- **`Ctrl+H`** opens the **Find & Replace** panel — the same overlay extended with a replace input, a single-replace button, and a Replace All button.

### Features

- **Case-sensitive** toggle via a checkbox.
- **Live matching** using `TreeWalker` — matches update as you type in the find box.
- **Match counter** shows the current match position and total count (e.g. `2 / 7`).
- **Replace** replaces only the currently highlighted match and advances to the next.
- **Replace All** replaces every match in one operation.
- Closing the dialog removes all `<mark>` highlights and restores the editor state.

### Programmatic usage

```js
// Open find-only mode
editor.invoke('findReplace.show', 'find');

// Open find-and-replace mode
editor.invoke('findReplace.show', 'replace');
```

---

## 18. Checklist

A checklist inserts interactive checkbox items inside the editor content.

```js
// Toggle checklist on the current selection
editor.invoke('editor.toggleChecklist');
```

- Clicking a checkbox in the rendered editor toggles its checked state.
- Outdenting a checklist item at the top level converts it to a plain paragraph.
- The `checklistBtn` export adds a toolbar button for this action.

```js
import AutumnNote, { checklistBtn } from 'autumnnote';

AutumnNote.create('#editor', {
  toolbar: [
    [boldBtn, italicBtn],
    [ulBtn, olBtn, checklistBtn],
  ],
});
```

---

## 19. Image Crop Overlay

When the user clicks an inserted image, the image tooltip includes a **Crop** action. Clicking it opens an inline crop overlay directly over the image.

### How it works

1. A semi-transparent scrim covers the image.
2. Corner and edge drag handles allow the user to select the crop region.
3. Pressing **Confirm** renders the cropped area to a `<canvas>` and replaces the `src` of the image with the resulting data URI.
4. Pressing **Cancel** dismisses the overlay without any changes.

### CORS limitation

If the image is hosted on a different origin without CORS headers, the canvas export will be blocked by the browser's security policy. AutumnNote shows a clear warning in this case and cancels the operation gracefully.

---

## 20. Read-only Mode

Use `readOnly: true` to initialise the editor as a non-editable preview. The toolbar is hidden and all user input is blocked.

```js
const preview = AutumnNote.create('#preview', { readOnly: true });
preview.setHTML(savedHtml);
```

Toggle read-only state at runtime:

```js
editor.setDisabled(true);  // enter read-only mode
editor.setDisabled(false); // return to editable mode
```

Video embeds suppress the click-shield overlay in read-only mode so embedded players work normally.

---

## 21. Auto-save

Enable auto-save to persist content to `localStorage` on every content change.

```js
AutumnNote.create('#editor', {
  autoSave: true,
  autoSaveKey: 'my-editor-draft',
});
```

Restore a draft on page load:

```js
const editor = AutumnNote.create('#editor', {
  autoSave: true,
  autoSaveKey: 'my-editor-draft',
  onInit(ctx) {
    const draft = localStorage.getItem('my-editor-draft');
    if (draft) ctx.setHTML(draft);
  },
});
```

---

## 22. RTL Support

Set `direction: 'rtl'` to flip the editor layout and content direction for right-to-left languages.

```js
AutumnNote.create('#editor', { direction: 'rtl' });
```

This sets the `dir` attribute on the editable area and mirrors toolbar alignment controls accordingly.

---

## 23. Character & Word Limits

Use `maxChars` and/or `maxWords` to enforce content length limits. When a limit is reached, the statusbar shows a warning and the relevant callback fires.

```js
AutumnNote.create('#editor', {
  maxChars: 1000,
  maxWords: 200,
  onCharLimitReached(ctx) {
    alert('Character limit reached!');
  },
  onWordLimitReached(ctx) {
    alert('Word limit reached!');
  },
});
```

Subscribing via events:

```js
editor.on('charLimitReached', (ctx) => showWarning('Too many characters'));
editor.on('wordLimitReached', (ctx) => showWarning('Too many words'));
```

---

## Appendix — All Available Button Exports

| Export name | Toolbar label / icon | Description |
|---|---|---|
| `paragraphStyleBtn` | Paragraph Style | Block format dropdown (H1–H6, p, blockquote, pre) |
| `fontFamilyBtn` | Font Family | Font family dropdown |
| `lineHeightBtn` | Line Height | Line height dropdown |
| `undoBtn` | Undo | Undo last change |
| `redoBtn` | Redo | Redo last undone change |
| `boldBtn` | Bold | Bold (Ctrl+B) |
| `italicBtn` | Italic | Italic (Ctrl+I) |
| `underlineBtn` | Underline | Underline (Ctrl+U) |
| `strikeBtn` | Strikethrough | Strikethrough |
| `superscriptBtn` | Superscript | Superscript |
| `subscriptBtn` | Subscript | Subscript |
| `foreColorBtn` | Font Colour | Text foreground colour picker |
| `backColorBtn` | Highlight | Text background / highlight colour picker |
| `alignLeftBtn` | Align Left | Left align |
| `alignCenterBtn` | Align Center | Centre align |
| `alignRightBtn` | Align Right | Right align |
| `alignJustifyBtn` | Justify | Full justify |
| `ulBtn` | Unordered List | Bullet list |
| `olBtn` | Ordered List | Numbered list |
| `checklistBtn` | Checklist | Toggle interactive checkbox list |
| `indentBtn` | Indent | Increase indent |
| `outdentBtn` | Outdent | Decrease indent |
| `hrBtn` | Horizontal Rule | Insert `<hr>` |
| `linkBtn` | Link | Insert / edit hyperlink |
| `imageBtn` | Image | Insert image from URL or upload |
| `videoBtn` | Video | Embed YouTube / Vimeo / direct video |
| `tableBtn` | Table | Insert table (grid picker) |
| `emojiBtn` | Emoji | Open emoji picker |
| `iconBtn` | Icon | Insert Font Awesome icon |
| `findBtn` | Find | Open Find dialog (Ctrl+F) |
| `findReplaceBtn` | Find & Replace | Open Find & Replace dialog (Ctrl+H) |
| `codeviewBtn` | Code View | Toggle raw HTML source view |
| `fullscreenBtn` | Fullscreen | Toggle fullscreen mode |
| `shortcutsBtn` | Shortcuts | Show keyboard shortcuts reference |
