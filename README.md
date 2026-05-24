# AutumnNote — WYSIWYG Rich Text Editor

<p align="center"><img src="public/image/banner.png" width="120" alt="AutumnNote Banner"/></p>

[![npm](https://img.shields.io/npm/v/autumnnote?label=version&color=blue&logo=npm)](https://www.npmjs.com/package/autumnnote)
[![npm downloads](https://img.shields.io/npm/dw/autumnnote?label=downloads%2Fweek&logo=npm&color=cb3837)](https://www.npmjs.com/package/autumnnote)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/autumnnote?label=minzipped&color=success)](https://bundlephobia.com/package/autumnnote)
[![GitHub Stars](https://img.shields.io/github/stars/cmm-cmm/Autumn-Note?style=flat&logo=github&color=yellow)](https://github.com/cmm-cmm/Autumn-Note)
[![CI](https://github.com/cmm-cmm/Autumn-Note/actions/workflows/pages.yml/badge.svg)](https://github.com/cmm-cmm/Autumn-Note/actions/workflows/pages.yml)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-brightgreen)](https://opensource.org/licenses/MIT)
[![jQuery](https://img.shields.io/badge/jQuery-free-lightgrey)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-definitions-3178C6?logo=typescript&logoColor=white)](types/index.d.ts)

A **zero-dependency WYSIWYG rich-text editor** built with vanilla JavaScript (ES2022+) — no jQuery, no runtime dependencies. Lightweight alternative to Summernote, Quill, TinyMCE, Froala, CKEditor, ProseMirror, Trix, and Slate — with official React and Vue 3 wrappers.

> **Fast. Lightweight. Reliable. Efficient.**

[Live Demo](https://cmm-cmm.github.io/Autumn-Note/) · [Docs](https://cmm-cmm.github.io/Autumn-Note/docs.html) · [Playground](https://cmm-cmm.github.io/Autumn-Note/playground.html)

<p align="center"><img src="demo/Screenshot.png" alt="AutumnNote Screenshot"/></p>

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Framework Wrappers](#framework-wrappers)
4. [Quick Start](#quick-start)
5. [Plugin API](#plugin-api)
6. [API](#api)
7. [Options](#options)
8. [Toolbar Customisation](#toolbar-customisation)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Mentions](#mentions)
11. [Project Structure](#project-structure)
12. [Comparison](#comparison)
13. [License](#license)

---

## Features

### Editing
- **Text formatting** — bold, italic, underline, strikethrough, superscript, subscript
- **Paragraph styles** — Normal, H1–H6, Blockquote, Code block
- **Font family** — customisable dropdown (10 families by default)
- **Font size** — configurable default via `defaultFontSize`; applied to new content
- **Line height** — dropdown from 1.0 to 3.0
- **Text and highlight colour** — native colour picker with last-used colour memory; custom brand swatches via `colorSwatches`
- **Alignment** — left, center, right, justify
- **Lists** — unordered and ordered, with indent / outdent; Tab/Shift+Tab in list context
- **Checklist** — interactive checkbox list; toggle items by clicking; converts to/from plain paragraphs on outdent
- **Undo / redo** — built-in history stack (configurable depth via `historyLimit`, `Ctrl+Z` / `Ctrl+Y`)
- **Tab key** — configurable spaces-per-tab; smart list indentation inside `<li>`
- **RTL support** — set `direction: 'rtl'` to flip the editor layout and text direction

### Insert
- **Horizontal rule** — inserts an `<hr>` at the current caret position
- **Link dialog** — URL, display text (auto-filled from selection), "Open in new tab" checkbox; edits existing links when caret is inside an `<a>`
- **Image dialog** — insert by URL with alt text, or file upload (base64 embed); enforces `maxImageSize`; file input restricted to browser-renderable MIME types; supports custom `onImageUpload` handler for server-side upload
- **Image crop overlay** — inline interactive crop tool triggered from the image tooltip; corner and edge drag handles; canvas-based crop export; CORS fallback warning
- **Video dialog** — paste a YouTube watch/short URL, Vimeo URL, or direct `.mp4 / .webm / .ogg` URL; configurable width; renders as responsive `<iframe>` or `<video>`
- **Table** — interactive grid picker (up to 10x10); optional header row (`tableHeaderRow`); floating tooltip for full row/column/cell management
- **Emoji picker** — approximately 380 Unicode emoji across 7 categories (Smileys, People, Animals, Food, Travel, Objects, Symbols); keyword search; click to insert as plain UTF-8 character
- **FA Icon picker** — FontAwesome 6 Free Solid icons across 8 categories; keyword search; configurable style, size, and colour; inserts as `<i>` element; auto-injects FA CDN if not on the page

### Search
- **Find and Replace** — `Ctrl+F` to find, `Ctrl+H` for find-and-replace; compact non-blocking floating panel (top-right); TreeWalker text matching; `<mark>` highlighting; case-sensitive `Aa` toggle; icon-button Prev/Next navigation (↑ ↓); single and replace-all modes
- **Auto language detection** — when selected text is formatted as a code block the editor automatically analyses the content and applies Prism.js syntax highlighting; 20 languages detected: JavaScript, TypeScript, Python, HTML, CSS, SCSS, JSON, SQL, Bash, Java, C#, PHP, Ruby, Go, Rust, C++, C, Kotlin, Swift, XML

### Inline tooltips
Floating toolbars appear automatically when the user clicks on an editable element:

| Element | Actions |
|---|---|
| **Link** | Open in new tab, Edit (reopens dialog), Unlink |
| **Image** | Edit alt/URL (reopens dialog), Crop, Delete |
| **Video** | Edit (reopens dialog), Delete |
| **Table cell** | Row above/below, Delete row, Column left/right, Delete column, Merge cells, Unmerge cells, Cell selection mode, Column width, Row height, Border width, **Cell background colour**, Delete table |
| **Code block** | Copy code, Language selector (20 languages + SCSS), Delete block |

### Context menu
Right-click inside the editor opens a context menu with: **Undo**, **Redo**, **Cut**, **Copy**, **Paste**, **Bold**, **Italic**, **Underline**, **Copy Format**, **Paste Format**, **Remove Format**, and a **colour palette** for quick text/highlight colour changes.

### Internationalisation
- **Built-in locales** — English (`en`), Vietnamese (`vi`), Japanese (`ja`), Simplified Chinese (`zh`), French (`fr`), German (`de`), Spanish (`es`), Korean (`ko`)
- **Custom locale** — pass any partial locale object to override individual strings
- **Per-instance language** — set a different `lang` per editor instance on the same page
- **Auto-fallback** — unknown codes or missing keys fall back to English

### UI
- **Toolbar** — fully configurable button groups; overflow strategy: `wrap` (default) or `scroll`; on viewports ≤ 640 px the toolbar automatically switches to a single horizontally-scrollable row regardless of the `toolbarOverflow` setting; FontAwesome icons with built-in SVG fallback
- **Sticky toolbar** — `stickyToolbar: true` pins the toolbar to the viewport top; configurable offset for fixed nav bars
- **Dark / light theme** — `theme: 'dark'` or `theme: 'light'` (default); full SCSS variable coverage; dark styles propagate to all floating elements (dialogs, tooltips, colour pickers)
- **Draggable dialogs** — all dialogs (Link, Image, Video, Emoji, Icon, Find & Replace) can be repositioned by dragging their title bar; position is clamped to the viewport
- **Image resizer** — drag handle on selected image to resize proportionally
- **Video resizer** — drag handle on selected video embed to resize
- **Statusbar** — live word and character count; drag handle to resize editor height; limit warnings when `maxChars` or `maxWords` is reached
- **Code view** — toggle raw HTML; sanitised before applying back to the editor
- **Fullscreen** — expands the editor to fill the viewport
- **Placeholder** — CSS `::before` pseudo-element, zero DOM node cost
- **Read-only mode** — `readOnly: true` renders a non-editable preview with toolbar hidden; toggle at runtime via `editor.setDisabled()`
- **Auto-save** — `autoSave: true` persists content to `localStorage` on every change; key configurable via `autoSaveKey`
- **Auto-save restore** — when `autoSave` and `autoSaveRestore` are both `true`, a dismissible banner prompts the user to restore or discard a previously saved draft on load; configurable age window via `autoSaveRestoreTimeout`
- **Bubble toolbar** — `bubbleToolbar: true` shows a compact floating toolbar above selected text; default buttons: bold, italic, underline, strikethrough, link, **text colour**, **highlight colour**, remove format, inline code; each colour button displays a live colour-strip indicator and opens an inline colour palette (matching the context menu); button set configurable via `bubbleToolbarItems`
- **Markdown shortcuts** — `markdownShortcuts: true` (default) converts Markdown syntax typed in the editor into HTML in real time: `# ` → H1–H3, `> ` → blockquote, `- ` / `* ` → unordered list, `1. ` → ordered list, `[ ] ` → checklist, `---` → HR, ` ``` ` → code block; inline: `**bold**`, `*italic*`, `~~strikethrough~~`, `` `code` ``
- **Custom focus ring** — `focusColor` accepts any CSS colour string to override the default blue focus ring
- **Spellcheck** — browser spellcheck enabled by default (`spellcheck: true`)

### Integration
- **No jQuery** — pure vanilla ES2022, zero runtime dependencies
- **Bootstrap friendly** — optional Bootstrap 4/5 styling (`useBootstrap: true`)
- **FontAwesome ready** — auto-detects FA on the page; falls back to built-in SVG icons
- **Plugin API** — first-class plugin system: `AutumnNote.use(plugin)`, `context.getPlugin(name)`, global button registry (`registerButton`), per-instance installation, `AsnPlugin<T>` TypeScript interface
- **Tree-shakeable** — ES module build; all core utilities individually exported
- **TypeScript definitions** — bundled `types/index.d.ts` with full JSDoc coverage
- **@mention autocomplete** — type `@` (or any custom trigger) to open a floating dropdown backed by a user-supplied `onSearch` function; inserts a non-editable mention chip; customisable chip HTML via `onInsert`

### Security
- All HTML (pasted content, `setHTML()`, or code-view output) passes through a DOM-based sanitiser that strips `<script>`, `<object>`, `<embed>`, and all `on*` event handler attributes
- `<iframe>` elements are permitted in `setHTML()` with src restricted to trusted CDN hosts; `srcdoc` is stripped
- `javascript:` and `data:` URLs are rejected in links and images
- Clipboard paste sanitises rich content to remove XSS vectors before inserting
- `pasteStripAttributes` option strips `class`, `style`, and `data-*` from pasted HTML

---

## Installation

### npm / pnpm / yarn

```bash
npm install autumnnote
```

```js
import AutumnNote from 'autumnnote';
import 'autumnnote/dist/autumnnote.css';
```

### CDN

**jsDelivr** (Recommended):

```html
<script src="https://cdn.jsdelivr.net/npm/autumnnote"></script>
```

**unpkg:**

```html
<script src="https://unpkg.com/autumnnote"></script>
```


```html
<link rel="stylesheet" href="dist/autumnnote.css" />
<script src="dist/autumnnote.umd.js"></script>
```

> **FontAwesome icons** — the editor auto-detects FontAwesome on the page and falls back to built-in SVG icons when absent. To enable FA icons, include the FA stylesheet:
>
> ```html
> <!-- FontAwesome 6 Free (recommended) -->
> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
> ```

---

## Framework Wrappers

Official React and Vue 3 wrappers are available as separate packages in this monorepo (managed with pnpm workspaces).

### React

```bash
npm install autumnnote autumnnote-react
import 'autumnnote/dist/autumnnote.css';
```

```jsx
import { useRef } from 'react';
import AutumnNoteEditor from 'autumnnote-react';

function MyEditor() {
  const editorRef = useRef(null);

  return (
    <AutumnNoteEditor
      ref={editorRef}
      options={{ placeholder: 'Start typing…', height: 300, bubbleToolbar: true }}
    />
  );
}

// Access the editor instance:
editorRef.current.getHTML();
editorRef.current.invoke('editor.setHTML', '<p>Hello!</p>');
```

The `ref` is forwarded to the underlying `Context` instance via `useImperativeHandle`. Pass a `key` prop to force remount when options change.

### Vue 3

```bash
npm install autumnnote autumnnote-vue
import 'autumnnote/dist/autumnnote.css';
```

```vue
<script setup>
import { ref } from 'vue';
import AutumnNoteEditor from 'autumnnote-vue';

const editorRef = ref(null);
</script>

<template>
  <AutumnNoteEditor
    ref="editorRef"
    :options="{ placeholder: 'Start typing…', height: 300 }"
  />
</template>
```

Access the editor instance via `editorRef.value.editor.value` (the `editor` reactive ref exposed by `defineExpose`).

---

## Quick Start

### ES Module

```js
import AutumnNote from 'autumnnote';

const editor = AutumnNote.create('#my-editor', {
  placeholder: 'Start typing…',
  height: 300,
  onChange(html) {
    console.log(html);
  },
});
```

### Script tag (UMD)

```html
<div id="my-editor"><p>Hello!</p></div>
<script src="dist/autumnnote.umd.js"></script>
<script>
  const editor = AutumnNote.create('#my-editor');
</script>
```

### With Bootstrap 5

```js
const editor = AutumnNote.create('#my-editor', {
  useBootstrap: true,
  bootstrapVersion: 5,
  toolbarButtonClass: 'btn btn-sm btn-light',
});
```

### Dark mode

```js
const editor = AutumnNote.create('#my-editor', { theme: 'dark' });
```

### Read-only preview

```js
const preview = AutumnNote.create('#preview', { readOnly: true });
preview.setHTML(savedHtml);
```

### Auto-save draft

```js
const editor = AutumnNote.create('#my-editor', {
  autoSave: true,
  autoSaveKey: 'my-draft',
});
```

### Custom image upload

```js
const editor = AutumnNote.create('#my-editor', {
  onImageUpload(files) {
    const fd = new FormData();
    fd.append('file', files[0]);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(({ url }) => editor.insertImage(url, files[0].name));
  },
});
```

### Bubble toolbar

```js
const editor = AutumnNote.create('#my-editor', {
  bubbleToolbar: true,
  bubbleToolbarItems: ['bold', 'italic', 'underline', 'strikethrough', 'link', 'removeFormat'],
});
```

### @mention autocomplete

```js
const editor = AutumnNote.create('#my-editor', {
  mention: {
    onSearch(query, callback) {
      const users = [
        { id: 1, label: 'Alice' },
        { id: 2, label: 'Bob' },
        { id: 3, label: 'Charlie' },
      ];
      callback(users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())));
    },
    onInsert(item) {
      // optional: return custom HTML for the mention chip
      return `<span class="mention" data-id="${item.id}">@${item.label}</span>`;
    },
  },
});
```

---

## Plugin API

Plugins package editor extensions — custom modules, toolbar buttons, and event handlers — into a reusable, distributable object.

```js
import AutumnNote from 'autumnnote';

const WordCountPlugin = {
  name: 'word-count',
  version: '1.0.0',
  // Buttons registered BEFORE create() — usable by name in toolbar config
  buttons: [{
    name: 'wordCountBtn',
    icon: 'hashtag',
    tooltip: 'Word count',
    action: (ctx) => alert(`${ctx.getWordCount()} words`),
  }],
  // Called after all built-in modules initialise
  install(ctx, options) {
    ctx.on('change', () => console.log('words:', ctx.getWordCount()));
    return { getMax: () => options.maxWords };
  },
  uninstall(ctx) { /* cleanup */ },
};

// Global — applied to every future editor instance
AutumnNote.use(WordCountPlugin, { maxWords: 500 });

const editor = AutumnNote.create('#editor', {
  toolbar: [['bold', 'italic', 'wordCountBtn']], // 'wordCountBtn' resolved from registry
});

editor.getPlugin('word-count').getMax(); // → 500
```

**Per-instance installation:**

```js
const editor = AutumnNote.create('#editor');
editor.use(WordCountPlugin, { maxWords: 200 });
editor.invoke('toolbar.rebuild'); // re-render toolbar with new buttons
```

| Method | Description |
|---|---|
| `AutumnNote.use(plugin, opts?)` | Install globally. Buttons registered immediately; `install()` called after modules init. |
| `AutumnNote.hasPlugin(name)` | Returns `true` if plugin registered globally. |
| `AutumnNote.registerButton(def)` | Register a single button globally by name. |
| `context.use(plugin, opts?)` | Install on this instance only. |
| `context.getPlugin<T>(name)` | Returns the public API from `plugin.install()`. |

See the [full Plugin API docs →](https://cmm-cmm.github.io/Autumn-Note/docs.html#plugin-api)

---

## API

### Factory

| Method | Description |
|---|---|
| `AutumnNote.create(selector, options?)` | Creates editor instance(s). `selector` can be a CSS string, `Element`, `NodeList`, or `Element[]`. Returns a `Context` or `Context[]`. |
| `AutumnNote.destroy(selector)` | Destroys editor(s) and restores the original element. |
| `AutumnNote.getInstance(selector)` | Returns the `Context` for a given element, or `null`. |
| `AutumnNote.defaults` | Global default options object — mutate before calling `create()` to apply project-wide settings. |

### Context (instance methods)

| Method | Description |
|---|---|
| `editor.getHTML()` | Returns the current HTML. Zero-width spaces from the icon picker are stripped automatically. |
| `editor.setHTML(html)` | Sets HTML content (sanitised). `<iframe>` elements are preserved. |
| `editor.getText()` | Returns plain text with no markup. |
| `editor.clear()` | Clears all content, resets to an empty `<p>`. |
| `editor.setDisabled(bool)` | Disables (`true`) or re-enables (`false`) the editor and toolbar. |
| `editor.destroy()` | Removes the editor, disposes all modules, and restores the original element. |
| `editor.on(event, fn)` | Subscribes to an editor event. Returns an unsubscribe function. |
| `editor.off(event, fn)` | Removes a previously registered listener. |
| `editor.invoke('module.method', ...args)` | Calls any registered module method by dot-separated name. |

### Events

| Name | Payload | Description |
|---|---|---|
| `change` | `html: string` | Fired after every content mutation. Debounced internally. |
| `focus` | `context` | Editor gained focus. |
| `blur` | `context` | Editor lost focus. |
| `init` | `context` | Fired once after the editor has fully initialised. |
| `imageUpload` | `files: FileList` | Fired when images are dropped or pasted (when `onImageUpload` is provided). |
| `imageError` | `{ file, message }` | Fired when an image is rejected (e.g. over `maxImageSize`). |
| `paste` | `{ text, html }` | Fired after every paste event. |
| `selectionChange` | `context` | Fired when the cursor or selection changes. |
| `destroy` | `context` | Fired just before the editor is destroyed. |
| `charLimitReached` | `context` | Fired when `maxChars` is hit. |
| `wordLimitReached` | `context` | Fired when `maxWords` is hit. |

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `''` | Placeholder text shown when the editor is empty. |
| `height` | `number` | `200` | Initial editor height in pixels. |
| `minHeight` | `number` | `100` | Minimum resizable height in pixels. |
| `maxHeight` | `number` | `0` | Maximum resizable height in pixels. `0` = unlimited. |
| `focus` | `boolean` | `false` | Automatically focus the editor on creation. |
| `resizable` | `boolean` | `true` | Show the resize handle at the bottom of the editor. |
| `toolbar` | `Array[]` | all buttons | Toolbar layout. See [Toolbar Customisation](#toolbar-customisation). |
| `toolbarOverflow` | `string` | `'wrap'` | Toolbar overflow strategy: `'wrap'` or `'scroll'`. |
| `useBootstrap` | `boolean` | `false` | Apply Bootstrap CSS classes to toolbar buttons. |
| `bootstrapVersion` | `number` | `5` | Bootstrap major version (`4` or `5`). |
| `toolbarButtonClass` | `string` | `'btn btn-sm btn-light'` | CSS classes for toolbar buttons when `useBootstrap` is `true`. |
| `useFontAwesome` | `boolean` | `true` | Use FA icons when FontAwesome is detected on the page. |
| `fontAwesomeClass` | `string` | `'fas'` | FA prefix: `'fas'` for FA 5, `'fa-solid'` for FA 6. |
| `pasteAsPlainText` | `boolean` | `false` | Strip all formatting when pasting. |
| `pasteCleanHTML` | `boolean` | `true` | Sanitise HTML on paste. |
| `pasteStripAttributes` | `boolean` | `false` | Strip `class`, `style`, and `data-*` attributes from pasted HTML. |
| `markdownPaste` | `boolean` | `true` | Convert pasted Markdown shortcuts to HTML as you type. |
| `allowImageUpload` | `boolean` | `true` | Allow drag/paste/file upload in the image dialog. |
| `maxImageSize` | `number` | `5` | Maximum image file size in megabytes. |
| `tabSize` | `number` | `4` | Number of spaces inserted when Tab is pressed. |
| `historyLimit` | `number` | `100` | Maximum undo steps to retain. |
| `defaultFontFamily` | `string` | `'Arial'` | Font shown by default in the font-family dropdown. |
| `defaultFontSize` | `string` | `'14px'` | Default font size applied to new content. |
| `fontFamilies` | `string[]` | 10 fonts | Font families available in the font-family dropdown. |
| `stickyToolbar` | `boolean` | `false` | Pin the toolbar to the viewport top when the page is scrolled. |
| `stickyToolbarOffset` | `number` | `0` | Top offset in pixels for the sticky toolbar (e.g. height of a fixed nav bar). |
| `theme` | `string` | `'light'` | Colour theme: `'light'` or `'dark'`. |
| `readOnly` | `boolean` | `false` | Start the editor in non-editable (read-only) mode with toolbar hidden. |
| `spellcheck` | `boolean` | `true` | Enable browser spellcheck in the editable area. |
| `direction` | `string` | `'ltr'` | Text direction: `'ltr'` or `'rtl'`. |
| `autoSave` | `boolean` | `false` | Persist content to `localStorage` on every change. |
| `autoSaveKey` | `string` | `'autumnnote-autosave'` | `localStorage` key used when `autoSave` is enabled. |
| `maxChars` | `number` | `0` | Maximum character count. `0` = unlimited. Shows warning in statusbar. |
| `maxWords` | `number` | `0` | Maximum word count. `0` = unlimited. Shows warning in statusbar. |
| `tableHeaderRow` | `boolean` | `false` | Insert a `<thead>` header row when creating new tables. |
| `codeHighlight` | `boolean` | `true` | Auto-load Prism.js for syntax highlighting inside `<pre><code>` blocks. |
| `codeHighlightCDN` | `string` | cdnjs Prism 1.29.0 | Base CDN URL for Prism assets. |
| `colorSwatches` | `string[]` | `[]` | Custom brand colour swatches prepended to the colour picker palette. |
| `focusColor` | `string` | `null` | Custom focus ring colour (any valid CSS colour). Overrides the default blue. |
| `lang` | `string \| object` | `'en'` | UI display language. Built-in codes: `'en'`, `'vi'`, `'ja'`, `'zh'`, `'fr'`, `'de'`, `'es'`, `'ko'`. Pass a partial locale object for custom overrides. |
| `markdownShortcuts` | `boolean` | `true` | Convert Markdown-style syntax typed in the editor to HTML in real time (block and inline rules). |
| `bubbleToolbar` | `boolean` | `false` | Show a mini floating toolbar above the text selection for quick formatting. |
| `bubbleToolbarItems` | `string[]` | `['bold','italic','underline','link','foreColor','removeFormat']` | Buttons shown in the bubble toolbar. Available names: `'bold'`, `'italic'`, `'underline'`, `'strikethrough'`, `'link'`, `'foreColor'`, `'removeFormat'`, `'inlineCode'`. |
| `autoSaveRestore` | `boolean` | `false` | When `autoSave` is also `true`, show a restore banner on load if a draft exists. |
| `autoSaveRestoreTimeout` | `number` | `7` | Max draft age in days before it is auto-discarded. `0` = no expiry. |
| `onAutoSaveRestore` | `Function` | `null` | `(html, context) => void` — called after the user restores a draft. |
| `mention` | `object` | `null` | @mention configuration object. Set `mention.onSearch` to activate. See [Mentions](#mentions). |
| `onChange` | `Function` | `null` | `(html: string) => void` — called on every content change. |
| `onFocus` | `Function` | `null` | `(context) => void` — called when the editor gains focus. |
| `onBlur` | `Function` | `null` | `(context) => void` — called when the editor loses focus. |
| `onInit` | `Function` | `null` | `(context) => void` — called once after the editor is initialised. |
| `onImageUpload` | `Function` | `null` | `(files: FileList) => void` — custom upload handler. Overrides base64 embed. |
| `onImageError` | `Function` | `null` | `({ file, message }) => void` — called when an image is rejected. |
| `onPaste` | `Function` | `null` | `({ text, html }) => void` — called after every paste event. |
| `onSelectionChange` | `Function` | `null` | `(context) => void` — called when cursor or selection changes. |
| `onDestroy` | `Function` | `null` | `(context) => void` — called just before the editor is destroyed. |
| `onCharLimitReached` | `Function` | `null` | `(context) => void` — called when `maxChars` is hit. |
| `onWordLimitReached` | `Function` | `null` | `(context) => void` — called when `maxWords` is hit. |

---

## Toolbar Customisation

The `toolbar` option accepts an array of **groups**. Each group is an array of button definition objects exported from the package:

```js
import AutumnNote, {
  boldBtn, italicBtn, underlineBtn, strikeBtn,
  superscriptBtn, subscriptBtn,
  alignLeftBtn, alignCenterBtn, alignRightBtn, alignJustifyBtn,
  ulBtn, olBtn, checklistBtn, indentBtn, outdentBtn,
  undoBtn, redoBtn,
  hrBtn, linkBtn, imageBtn, videoBtn,
  emojiBtn, iconBtn, tableBtn,
  fontFamilyBtn, paragraphStyleBtn, lineHeightBtn,
  foreColorBtn, backColorBtn,
  findBtn, findReplaceBtn,
  codeviewBtn, fullscreenBtn, shortcutsBtn,
} from 'autumnnote';
```

### Default toolbar layout

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
  [codeviewBtn, fullscreenBtn, shortcutsBtn],
]
```

### Custom toolbar example

```js
AutumnNote.create('#editor', {
  toolbar: [
    [undoBtn, redoBtn],
    [boldBtn, italicBtn, underlineBtn],
    [ulBtn, olBtn, checklistBtn],
    [linkBtn, imageBtn],
    [findBtn, findReplaceBtn],
  ],
});
```

### Hiding the toolbar

Pass an empty array for a toolbar-less editor (keyboard shortcuts still work):

```js
AutumnNote.create('#editor', { toolbar: [] });
```

### All available buttons

| Export | Tooltip |
|---|---|
| `paragraphStyleBtn` | Paragraph Style (dropdown) |
| `fontFamilyBtn` | Font Family (dropdown) |
| `lineHeightBtn` | Line Height (dropdown) |
| `undoBtn` / `redoBtn` | Undo / Redo |
| `boldBtn` / `italicBtn` / `underlineBtn` / `strikeBtn` | Text style |
| `superscriptBtn` / `subscriptBtn` | Super / Subscript |
| `foreColorBtn` / `backColorBtn` | Text colour / Highlight colour |
| `alignLeftBtn` / `alignCenterBtn` / `alignRightBtn` / `alignJustifyBtn` | Alignment |
| `ulBtn` / `olBtn` / `checklistBtn` | Lists |
| `indentBtn` / `outdentBtn` | Indentation |
| `hrBtn` | Horizontal Rule |
| `linkBtn` | Insert / Edit Link |
| `imageBtn` | Insert Image |
| `videoBtn` | Insert Video |
| `tableBtn` | Insert Table (grid picker) |
| `emojiBtn` | Insert Emoji |
| `iconBtn` | Insert FA Icon |
| `findBtn` | Find (Ctrl+F) |
| `findReplaceBtn` | Find & Replace (Ctrl+H) |
| `codeviewBtn` | HTML Code View |
| `fullscreenBtn` | Fullscreen |
| `shortcutsBtn` | Keyboard Shortcuts dialog |

### Setting global defaults

```js
Object.assign(AutumnNote.defaults, {
  height: 400,
  theme: 'dark',
  fontFamilies: ['Inter', 'Roboto', 'Georgia', 'Courier New'],
  colorSwatches: ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'],
});
```

---

## Keyboard Shortcuts

| Keys | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` / `Ctrl + Y` | Redo |
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + U` | Underline |
| `Ctrl + F` | Open Find dialog |
| `Ctrl + H` | Open Find & Replace dialog |
| `Shift + Enter` | Insert line break |
| `Tab` | Insert spaces / indent list item |
| `Shift + Tab` | Outdent list item |
| `Shift + ?` | Open Keyboard Shortcuts dialog |

> The number of spaces inserted by `Tab` is controlled by the `tabSize` option.

---

## Mentions

The `mention` option object activates `@mention` autocomplete. Only `onSearch` is required; all other fields are optional.

| Field | Type | Default | Description |
|---|---|---|---|
| `onSearch` | `Function` | — | `(query, callback) => void` — called when the user types after the trigger character. Pass an array of `{ id, label, avatar? }` to the callback. |
| `onInsert` | `Function` | `null` | `(item) => string \| null` — return custom HTML for the inserted mention chip. Return `null` to use the built-in chip. |
| `trigger` | `string` | `'@'` | Character that opens the dropdown. |
| `minChars` | `number` | `0` | Minimum characters after the trigger before `onSearch` is called. `0` = open immediately. |
| `maxResults` | `number` | `8` | Maximum items shown in the dropdown. |
| `debounce` | `number` | `200` | Debounce delay in milliseconds for `onSearch` calls. |
| `mentionClass` | `string` | `'an-mention'` | CSS class applied to the inserted mention chip. |
| `allowSpaces` | `boolean` | `false` | Allow spaces in the query string before the dropdown closes. |

### Example

```js
AutumnNote.create('#editor', {
  mention: {
    trigger: '@',
    minChars: 1,
    onSearch(query, callback) {
      fetch(`/api/users?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(users => callback(users)); // [{ id, label, avatar? }]
    },
  },
});
```

---

## Project Structure

```
src/
├── js/
│   ├── core/
│   │   ├── dom.js            DOM utilities (createElement, on, closest, ...)
│   │   ├── range.js          Selection and Range API helpers
│   │   ├── func.js           General helpers (mergeDeep, debounce, ...)
│   │   ├── key.js            Keyboard key constants
│   │   ├── lists.js          Array helpers
│   │   ├── env.js            Browser/platform detection
│   │   ├── markdown.js       Lightweight Markdown to HTML converter
│   │   └── sanitise.js       DOM-based HTML and URL sanitiser
│   ├── editing/
│   │   ├── History.js        Undo/redo stack (configurable depth)
│   │   ├── Style.js          execCommand style wrappers
│   │   ├── Table.js          Table creation and cell manipulation
│   │   └── Typing.js         Tab/Enter/ArrowKey behaviour and FA icon caret handling
│   ├── module/
│   │   ├── Editor.js         Core editing commands, getHTML/setHTML, sanitiser
│   │   ├── Toolbar.js        Toolbar UI, button rendering (SVG + FA), dropdowns, colour picker
│   │   ├── Buttons.js        Button/dropdown/colorpicker definitions and defaultToolbar
│   │   ├── Statusbar.js      Word and character count, drag-to-resize, limit warnings
│   │   ├── Clipboard.js      Paste sanitisation (HTML clean, plain-text, Markdown modes)
│   │   ├── ContextMenu.js    Right-click context menu with colour palette
│   │   ├── Placeholder.js    CSS-based placeholder
│   │   ├── Codeview.js       HTML source view toggle
│   │   ├── Fullscreen.js     Fullscreen mode
│   │   ├── FindReplace.js    Find and Replace dialog (Ctrl+F / Ctrl+H)
│   │   ├── LinkDialog.js     Link insert/edit dialog
│   │   ├── LinkTooltip.js    Floating toolbar for links (open/edit/unlink)
│   │   ├── ImageDialog.js    Image insert dialog (URL + file upload with MIME filtering)
│   │   ├── ImageTooltip.js   Floating toolbar for images (edit/crop/delete)
│   │   ├── ImageResizer.js   rAF-based drag handle to resize images
│   │   ├── ImageCropOverlay.js  Inline crop tool (corner/edge handles, canvas export)
│   │   ├── VideoDialog.js    Video embed dialog (YouTube, Vimeo, direct file)
│   │   ├── VideoTooltip.js   Floating toolbar for video embeds (edit/delete)
│   │   ├── VideoResizer.js   rAF-based drag handle to resize video embeds
│   │   ├── TableTooltip.js   Floating toolbar for tables (row/col/merge/unmerge/select mode)
│   │   ├── CodeTooltip.js    Floating toolbar for code blocks (copy/delete)
│   │   ├── EmojiDialog.js    Unicode emoji picker (~380 emoji, 7 categories)
│   │   ├── IconDialog.js     FontAwesome icon picker (FA 6 Free Solid, 8 categories)
│   │   ├── ShortcutsDialog.js  Keyboard shortcuts reference dialog (Shift+?)
│   │   ├── BubbleToolbar.js  Mini floating toolbar above text selection
│   │   ├── MarkdownShortcuts.js  Inline Markdown-to-HTML input rules
│   │   ├── AutoSaveRestore.js   Draft restore banner for localStorage drafts
│   │   └── Mention.js        @mention autocomplete with floating dropdown
│   ├── Context.js            Editor instance hub: module registry and event bus
│   ├── settings.js           Default options (AsnOptions)
│   ├── renderer.js           DOM layout builder
│   └── index.js              Public entry point + AutumnNote factory
└── styles/
    ├── _variables.scss       SCSS design tokens (colours, spacing, radii, transitions)
    └── autumnnote.scss       Main stylesheet
```

### Monorepo structure

This project uses **pnpm workspaces** to manage the core library alongside official framework wrappers:

```
autumn-note-ce/
├── pnpm-workspace.yaml       # workspace root
├── src/                      # core library source
├── packages/
│   ├── react/                # autumnnote-react
│   │   └── src/index.jsx
│   └── vue/                  # autumnnote-vue
│       └── src/AutumnNote.vue
└── test/                     # Vitest test suite
```

### Development commands

```bash
pnpm install                           # install all workspace packages
npm run dev                            # start Vite dev server with HMR
npm run build                          # build core ES + UMD + CSS to dist/
pnpm --filter autumnnote-react build   # build React wrapper
pnpm --filter autumnnote-vue build     # build Vue wrapper
npm test                               # run Vitest test suite once
npm run test:watch                     # run tests in watch mode
npm run lint                           # ESLint
npm run typecheck                      # TypeScript type check (tsconfig.json)
```

Build output in `dist/`:

| File | Format | Use |
|---|---|---|
| `autumnnote.es.js` | ES Module | `import` in bundlers (tree-shakeable) |
| `autumnnote.umd.js` | UMD | `<script>` tag / CommonJS |
| `autumnnote.css` | CSS | Styles for both builds |

---

## Comparison

The table below compares AutumnNote against popular WYSIWYG editors: **Summernote**, **Quill**, and **TinyMCE**. Comparison is based on publicly documented feature sets.

| Feature | Summernote | Quill | TinyMCE | **AutumnNote** |
|---|---|---|---|---|
| jQuery dependency | Required | Required | Optional | **None** |
| Runtime dependencies | Several | Several | 1–2 | **Zero** |
| JavaScript standard | ES5 / legacy | ES6 mix | ES6 | **ES2022** |
| Module format | IIFE / AMD | IIFE | CommonJS + IIFE | **ES Module + UMD** |
| Build tool | Grunt | Gulp | Rollup | **Vite** |
| TypeScript definitions | External / partial | Partial | Yes | **Yes (bundled)** |
| HTML sanitisation | Basic | Whitelist-only | Moderate | **DOM-based (XSS-safe)** |
| Iframe support in setHTML | No | No | Restricted | **Yes (host-trusted)** |
| Dark theme | No | No | Yes | **Yes (built-in)** |
| RTL text direction | No | Partial | No | **Yes** |
| Built-in i18n locales | No | No | Partial | **Yes (8 languages)** |
| Custom locale object | No | No | No | **Yes** |
| Checklist (todo list) | No | No | No | **Yes** |
| Find and Replace | No | No | No | **Yes (Ctrl+F / Ctrl+H)** |
| Emoji picker | No | No | No | **Yes (~380 emoji)** |
| FA icon picker | No | No | No | **Yes (FA 6, searchable)** |
| Video embeds | No | No | No | **Yes (YouTube, Vimeo, direct)** |
| Image crop tool | No | No | No | **Yes (inline)** |
| Image / video resize | No | No | No | **Yes (drag handles)** |
| Inline tooltips | No | No | Partial | **Yes (link, image, video, table, code)** |
| Table cell merge/unmerge | No | No | Yes | **Yes** |
| Table cell selection mode | No | No | No | **Yes** |
| Context menu | No | No | No | **Yes (with colour palette)** |
| Sticky toolbar | No | No | No | **Yes** |
| Auto-save to localStorage | No | No | No | **Yes** |
| Character / word limits | No | No | No | **Yes** |
| Custom focus ring colour | No | No | No | **Yes** |
| Read-only mode | No | Partial | Yes | **Yes** |
| Custom colour swatches | No | No | No | **Yes** |
| Code view (HTML source) | No | Yes | Yes | **Yes (sanitised)** |
| Syntax highlighting | No | No | Partial | **Yes (Prism.js via CDN)** |

---

## License

[MIT](LICENSE)
