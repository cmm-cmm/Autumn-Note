# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Autumn Note** is a zero-dependency WYSIWYG rich-text editor written in vanilla JavaScript (ES2022+). It builds to ES Module and UMD formats and is published to npm as `autumnnote`.

## Commands

```bash
pnpm dev                # Vite dev server with HMR
pnpm build              # Build ES + UMD + CSS → dist/
pnpm build:demo         # Build demo site (vite.demo.config.js)
pnpm build:cdn          # CDN build with bundle visualizer
pnpm preview            # Preview dist/ locally

pnpm test               # Run Vitest once (jsdom)
pnpm test:watch         # Vitest in watch mode
pnpm test:coverage      # Vitest with v8 coverage

pnpm lint               # ESLint on library, tests, wrappers, scripts, configs
pnpm typecheck          # tsc --noEmit for core + React/Vue wrapper consumers
pnpm analyze            # Bundle size visualization
pnpm bench              # Vitest benchmarks
```

Run a single test file:
```bash
pnpm vitest run test/core/dom.test.js
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

30 modules split by responsibility:
- **Core UI**: `Editor`, `Toolbar`, `Buttons`, `Statusbar`
- **Dialogs**: `BaseDialog`, `LinkDialog`, `ImageDialog`, `VideoDialog`, `EmojiDialog`, `IconDialog`, `FindReplace`, `ShortcutsDialog`
- **Floating toolbars**: `LinkTooltip`, `ImageTooltip`, `VideoTooltip`, `TableTooltip`, `CodeTooltip`, `BubbleToolbar`
- **Editing behaviors**: `Clipboard`, `ContextMenu`, `MarkdownShortcuts`, `Codeview`, `Fullscreen`, `ImageResizer`, `ImageCropOverlay`, `VideoResizer`
- **UX**: `Placeholder`, `AutoSaveRestore`, `Mention`, `SlashMenu`

### Core Utilities (`src/js/core/`)

| File | Purpose |
|---|---|
| `count.js` | Word/character counting — one implementation for the statusbar and the maxWords/maxChars limits |
| `keymap.js` | Keyboard shortcut table (`DEFAULT_KEYMAP`), combo parsing/matching; `keyMap` option merges over it |
| `palette.js` | The one colour palette shared by toolbar, bubble toolbar and context menu (`colorPalette`/`colorSwatches`) |
| `clipboard.js` | Async Clipboard API writes for copy/cut (no `execCommand('copy')`) |
| `dom.js` | DOM helpers (createElement, on, closest, …) |
| `range.js` | Selection & Range API wrappers |
| `func.js` | mergeDeep, debounce, general utils |
| `key.js` | Keyboard constants |
| `sanitise.js` | DOM-based XSS sanitiser — strips scripts/on* attrs, rejects `javascript:`/`data:` URLs |
| `markdown.js` | Bidirectional HTML ↔ Markdown conversion (with GFM checklist support) |

### Editing Layer (`src/js/editing/`)

- **`History.js`** — undo/redo stack of DOM snapshots
- **`insert.js`** — Range-based `insertHTML`/`insertText`/`insertHorizontalRule`; each returns `false` when it cannot act so the caller falls back
- **`Style.js`** — formatting commands and style queries; dispatches to `format.js` / `insert.js` and owns the checklist transitions
- **`format.js`** — the formatting engine: inline formats, styles, links, blocks, lists and indentation as DOM transforms (split → wrap/unwrap → merge), plus the state queries the toolbar reads
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
- Never call `document.execCommand` or `document.queryCommand*` — every command is a DOM transform in `editing/format.js` / `editing/insert.js` (see `docs/EXEC_COMMAND_MIGRATION.md`), and copy/cut go through `core/clipboard.js`. A formatting change needs a jsdom test in `test/editing/format.test.js`, which `test/browser/format.browser.test.js` also runs on Chromium, Firefox and WebKit.
- Toolbar config is a 2D array of button names or definition objects. A name resolves through `resolveButton()`: the editor's `buttons` option, then `registerButton()`, then the built-in buttons by `name`.
- Floating UI (dialogs, tooltips, popovers, menus) mounts into the editor's portal via `portalOf(this.context)` from `core/dom.js` — never `document.body` directly. The portal carries the theme class and `themeVars`; `renderer.applyAppearance()` keeps container and portal in sync and is re-run by `updateOptions()`.
- Styles read design tokens as `var(--an-*, <SCSS fallback>)`. Dark-mode rules go through the `an-dark-theme` / `an-dark-scope` mixins so `theme: 'dark'` and `'auto'` cannot drift apart.
- Every option callback goes through `context.triggerEvent(name, ...)` (which also calls `on<Name>`), never `options.onX(...)` directly — otherwise `editor.on(name)` listeners miss it.
- A new option needs a default in `settings.js`, a JSDoc `@property`, a `types/index.d.ts` entry and a README options-table row; `test/docs/options-documented.test.js` enforces all four.
- Custom modules can be registered globally via `AutumnNote.registerModule('name', Class)` before `create()`.
