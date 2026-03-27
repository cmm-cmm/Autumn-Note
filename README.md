# AfterSummerNote

A modern, lightweight WYSIWYG rich-text editor inspired by [Summernote](https://github.com/summernote/summernote) — rewritten with vanilla JavaScript (ES2022+), no jQuery dependency.

## Features

- **No jQuery** — pure vanilla JavaScript, ~zero runtime dependencies
- **Bootstrap friendly** — optional integration with Bootstrap 4 and 5 for toolbar button styling
  (set `useBootstrap: true` in options). When enabled, toolbar buttons use Bootstrap classes
  (customizable via `toolbarButtonClass`).
- **Modular architecture** — every feature is an independent module
- **Rich editing** — bold, italic, underline, strikethrough, super/subscript, colour picker, font size, headings, alignment, lists, indentation, tables, links, images, horizontal rules
- **Undo / redo** — built-in history stack (100 levels)
- **Clipboard handling** — paste sanitisation to strip XSS vectors
- **Code view** — toggle HTML source editor with sanitisation
- **Fullscreen mode** — expand to fill the viewport
- **Statusbar** — word/character count + drag-to-resize
- **Link dialog** — insert/edit hyperlinks
- **Image dialog** — insert by URL or file upload (base64 embed)
- **Placeholder text** — CSS-based, no DOM pollution
- **Content security** — every HTML input is sanitised; `javascript:` URLs are rejected
- **Plugin-ready** — register custom modules via `aftersummernote.defaults`

---

## Installation

### npm / pnpm / yarn

```bash
npm install aftersummernote
```

### CDN (after building)

```html
<link rel="stylesheet" href="dist/aftersummernote.css" />
<script src="dist/aftersummernote.umd.js"></script>
```

Note: to use the bundled FontAwesome icons and Bootstrap button styling you should include
their CSS in your page. Example (Bootstrap 5 + Font Awesome 5):

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://use.fontawesome.com/releases/v5.15.4/css/all.css" rel="stylesheet">
```

---

## Quick Start

### ES Module

```js
import AfterSummerNote from 'aftersummernote';

const editor = AfterSummerNote.create('#my-editor', {
  placeholder: 'Start typing…',
  height: 300,
  // Optional: enable Bootstrap-styled toolbar buttons and FontAwesome icons
  useBootstrap: true,
  toolbarButtonClass: 'btn btn-sm btn-light',
  useFontAwesome: true,
  fontAwesomeClass: 'fas',
  onChange(html) {
    console.log(html);
  },
});
```

### Script tag (UMD)

```html
<div id="my-editor"><p>Hello!</p></div>
<script src="aftersummernote.umd.js"></script>
<script>
  const editor = AfterSummerNote.create('#my-editor');
</script>
```

---

## API

### Factory

| Method | Description |
|---|---|
| `AfterSummerNote.create(selector, options?)` | Creates editor instance(s). Returns a `Context`. |
| `AfterSummerNote.destroy(selector)` | Destroys editor(s) and restores original element. |
| `AfterSummerNote.getInstance(selector)` | Returns the `Context` for a given element. |

### Context (editor instance)

| Method | Description |
|---|---|
| `editor.getHTML()` | Returns the current HTML content. |
| `editor.setHTML(html)` | Sets HTML content (sanitised). |
| `editor.getText()` | Returns plain text. |
| `editor.clear()` | Clears content. |
| `editor.setDisabled(bool)` | Enables / disables the editor. |
| `editor.destroy()` | Removes the editor from the DOM. |
| `editor.on(event, fn)` | Subscribes to editor events. Returns unsubscribe. |
| `editor.invoke('module.method', ...args)` | Call any module method directly. |

### Events

| Name | Payload | Description |
|---|---|---|
| `change` | `html: string` | Fired after every content change. |
| `focus` | — | Editor gained focus. |
| `blur` | — | Editor lost focus. |

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `''` | Placeholder text when empty. |
| `height` | `number` | `200` | Min editor height in px. |
| `minHeight` | `number` | `100` | Minimum height in px. |
| `maxHeight` | `number` | `0` | Maximum height (0 = unlimited). |
| `focus` | `boolean` | `false` | Auto-focus on init. |
| `resizeable` | `boolean` | `true` | Show resize handle. |
| `toolbar` | `Array` | default | Toolbar button groups. |
| `pasteCleanHTML` | `boolean` | `true` | Sanitise pasted HTML. |
| `allowImageUpload` | `boolean` | `true` | Allow file upload in image dialog. |
| `maxImageSize` | `number` | `5` | Max upload size (MB). |
| `tabSize` | `number` | `0` | Spaces per Tab key press (0 = default behaviour). |
| `onChange` | `Function` | `null` | `(html) => void` |
| `onFocus` | `Function` | `null` | `(context) => void` |
| `onBlur` | `Function` | `null` | `(context) => void` |

---

## Project Structure

```
src/
├── js/
│   ├── core/
│   │   ├── dom.js          DOM utilities (no jQuery)
│   │   ├── range.js        Selection / Range API wrapper
│   │   ├── func.js         General utility helpers
│   │   ├── key.js          Keyboard key constants
│   │   ├── lists.js        Array helpers
│   │   └── env.js          Browser/platform detection
│   ├── editing/
│   │   ├── History.js      Undo/redo stack
│   │   ├── Style.js        execCommand style wrappers
│   │   ├── Table.js        Table creation and manipulation
│   │   └── Typing.js       Tab / Enter behaviour
│   ├── module/
│   │   ├── Editor.js       Core editing commands
│   │   ├── Toolbar.js      Toolbar UI
│   │   ├── Buttons.js      Button definitions
│   │   ├── Statusbar.js    Status bar + resize handle
│   │   ├── Clipboard.js    Paste sanitisation
│   │   ├── Placeholder.js  Placeholder text
│   │   ├── Codeview.js     HTML source toggle
│   │   ├── Fullscreen.js   Fullscreen mode
│   │   ├── LinkDialog.js   Link insert/edit dialog
│   │   └── ImageDialog.js  Image insert dialog
│   ├── Context.js          Editor instance hub
│   ├── settings.js         Default options
│   ├── renderer.js         DOM skeleton builder
│   └── index.js            Public entry point
└── styles/
    ├── _variables.scss     SCSS design tokens
    └── aftersummernote.scss Main stylesheet
```

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (Vite)
npm run dev

# Build library
npm run build

# Run tests
npm test
```

---

## Security

- All HTML set via `setHTML()` or pasted is passed through a DOM-based sanitiser that strips `<script>`, `<iframe>`, `<object>` and all `on*` event attributes.
- `javascript:` URLs are rejected in links and images.
- Code view output is sanitised before being applied to the editor DOM.

---

## Differences from Summernote

| Feature | Summernote | AfterSummerNote |
|---|---|---|
| jQuery required | ✅ Yes | ❌ No |
| Bootstrap required | Optional | ❌ No |
| Build system | Vite | Vite |
| Module format | ES + UMD | ES + UMD |
| Written in | ES5/ES6 mix | ES2022 |
| HTML sanitisation | Basic | Built-in (DOMParser-based) |

---

## License

MIT
