# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Autumn Note** is a zero-dependency WYSIWYG rich-text editor written in vanilla JavaScript (ES2022+). It builds to ES Module and UMD formats and is published to npm as `autumnnote`.

## Commands

```bash
npm run dev            # Vite dev server with HMR
npm run build          # Build ES + UMD + CSS → dist/
npm run build:demo     # Build demo site (vite.demo.config.js)
npm run build:cdn      # CDN build with bundle visualizer
npm run preview        # Preview dist/ locally

npm test               # Run Vitest once (jsdom)
npm run test:watch     # Vitest in watch mode
npm run test:coverage  # Vitest with v8 coverage

npm run lint           # ESLint on src/
npm run typecheck      # tsc --noEmit (types only, no output)
npm run analyze        # Bundle size visualization
npm run bench          # Vitest benchmarks
```

Run a single test file:
```bash
npx vitest run test/core/dom.test.js
```

## Architecture

### Central Pattern: Context + Module Registry

Each editor instance is a **`Context`** object (`src/js/Context.js`). It:
- Holds merged options and the root DOM element
- Registers and initializes all feature modules
- Acts as the inter-module event bus (`context.on`, `context.invoke`)

Every feature is a **Module class** with `initialize()` and `destroy()` lifecycle methods. Modules talk to each other exclusively via:
```js
context.invoke('ModuleName.method', arg)   // call a method on another module
context.on('eventName', callback)           // subscribe to editor events
```

### Public API (`src/js/index.js`)

`AutumnNote.create(target, options)` resolves any selector/element/NodeList, caches instances in a `WeakMap`, and returns the `Context` or an array of `Context` objects.

### Module Inventory (`src/js/module/`)

29 modules split by responsibility:
- **Core UI**: `Editor`, `Toolbar`, `Buttons`, `Statusbar`
- **Dialogs**: `BaseDialog`, `LinkDialog`, `ImageDialog`, `VideoDialog`, `EmojiDialog`, `IconDialog`, `FindReplace`, `ShortcutsDialog`
- **Floating toolbars**: `LinkTooltip`, `ImageTooltip`, `VideoTooltip`, `TableTooltip`, `CodeTooltip`, `BubbleToolbar`
- **Editing behaviors**: `Clipboard`, `ContextMenu`, `MarkdownShortcuts`, `Codeview`, `Fullscreen`, `ImageResizer`, `ImageCropOverlay`, `VideoResizer`
- **UX**: `Placeholder`, `AutoSaveRestore`, `Mention`

### Core Utilities (`src/js/core/`)

| File | Purpose |
|---|---|
| `dom.js` | DOM helpers (createElement, on, closest, …) |
| `range.js` | Selection & Range API wrappers |
| `func.js` | mergeDeep, debounce, general utils |
| `key.js` | Keyboard constants |
| `sanitise.js` | DOM-based XSS sanitiser — strips scripts/on* attrs, rejects `javascript:`/`data:` URLs |
| `markdown.js` | Bidirectional HTML ↔ Markdown conversion |

### Editing Layer (`src/js/editing/`)

- **`History.js`** — undo/redo stack of DOM snapshots
- **`Style.js`** — `execCommand` wrappers for formatting
- **`Table.js`** — table creation and cell manipulation
- **`Typing.js`** — Tab/Enter/Arrow key overrides

### Styles (`src/styles/`)

Single SCSS entry point `autumnnote.scss` (~2000 lines). Design tokens live in `_variables.scss`.

### Localization (`src/js/i18n/`)

8 languages (en, vi, ja, zh, fr, de, es, ko). Resolved in `index.js` based on the `lang` option.

### TypeScript (`types/index.d.ts`)

Types and JSDoc in JS source; `tsconfig.json` uses `noEmit: true`. TypeScript is for authoring assistance and consumer types only — no compiled TS output.

## Build Outputs

| File | Entry | Format |
|---|---|---|
| `dist/autumnnote.es.js` | `src/js/index.js` | ES Module |
| `dist/autumnnote.umd.js` | `src/js/index.umd.js` | UMD |
| `dist/autumnnote.css` | `src/styles/autumnnote.scss` | CSS |

Source maps are generated; minification is intentionally disabled (consumers minify).

## Testing

Tests live in `test/` mirroring the `src/js/` structure:
- `test/core/`, `test/editing/`, `test/module/`, `test/integration/`, `test/perf/`

Environment is jsdom (simulated browser). Use `globals: true` — no explicit imports of `describe`/`it`/`expect` needed.

## Key Constraints

- **Zero runtime dependencies** — do not introduce any.
- The sanitiser in `core/sanitise.js` is security-critical; changes there need careful review.
- `execCommand` is used intentionally despite deprecation — it is still the only reliable cross-browser formatting API for contenteditable; do not replace without a complete alternative.
- Toolbar config is a 2D array of button-name strings; custom buttons must be registered in `Buttons.js` before use.
- Custom modules can be registered globally via `AutumnNote.registerModule('name', Class)` before `create()`.
