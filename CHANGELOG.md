# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.7] - 2026-04-06

### Added
- **Color palette in Context Menu** — right-click context menu now includes a custom colour palette for quick text/highlight colour changes
- **Color-strip variant for context menu icons** — icons in the context menu display a colour-strip indicator for colour-related actions
- **Checklist on collapsed cursor** — inserting a checklist item now works correctly when the cursor is collapsed (no selection)
- **Unit tests** — expanded test coverage for Editor, Clipboard, ImageDialog, Placeholder, Tooltip, and VideoResizer modules

### Changed
- **Read-only mode enforcement** — tooltips and resizers now check `readOnly` state and prevent all interactions when the editor is in read-only mode
- **Checklist with `input[type="checkbox"]`** — checklist rendering now handles native checkbox inputs alongside the custom toggle; sanitisation updated accordingly
- **Selection handling** — improved accuracy of selection save/restore when caret is at edge positions
- **Image format validation** — stricter MIME-type and extension checks in ImageDialog
- **Placeholder behaviour** — placeholder now hides/shows more reliably after programmatic content changes
- **VideoDialog** — added TypeScript type annotations for input elements

### Fixed
- **Cross-origin check** — replaced `location.origin` with `window.location.origin` to avoid `ReferenceError` in non-browser environments

---

## [1.0.6] - 2026-04-04

### Added
- **Table border width adjustment** — new control in `TableTooltip` to set border width on selected cells/table
- **CDN build** (`vite.cdn.config.js`) — minified UMD bundle optimised for direct `<script>` tag usage
- **TypeScript configuration** (`tsconfig.json`) — enables `typecheck` script for project-wide type checking
- **Performance benchmarks** (`test/perf/performance.bench.js`) — Vitest bench suite covering critical hot-path functions

### Changed
- **Performance** — moved predicate functions outside keydown handler in `Typing.js`; reduced `Clipboard._cleanSocialHtml` from O(n²) to O(n); optimised `FindReplace` match-building; `Toolbar` now uses `DocumentFragment` for batch DOM updates; cached regex for language-class extraction in `CodeTooltip`
- **`FindReplace`** — added safety checks and regex caching for more robust find/replace operations
- **`Clipboard`** — added safety checks to prevent errors on malformed clipboard content
- **`CodeTooltip`** — switched to `codeHighlightCDN` option for loading Prism resources
- **Vite config** — supports dynamic plugin loading for bundle analysis; UMD output asset naming made consistent
- Removed `NODE_ENV` checks from `Context` and `Clipboard` warning paths for cleaner runtime behaviour

### Fixed
- **Backspace near FA icons** — cursor position is now correctly restored after deleting a FontAwesome icon element

---

## [1.0.5] - 2026-04-03

### Added
- **Image crop overlay** (`ImageCropOverlay`) — interactive inline crop tool for images inside the editor; uses clip-path scrim with drag handles (corners + edges), canvas-based crop on confirm, and CORS fallback warning
- Crop action added to **ImageTooltip** to trigger the new crop overlay
- Comprehensive **unit tests** for 20+ modules: Context, Table, ImageDialog, Buttons, Clipboard, Codeview, ContextMenu, Editor, FindReplace, Fullscreen, ImageResizer, LinkDialog, Placeholder, ShortcutsDialog, Statusbar, Toolbar, VideoResizer, RemainingModules smoke tests, and integration tests
- Expanded **TypeScript definitions** (`types/index.d.ts`) with broader API coverage

### Changed
- Input value now synchronised on every `input` event via `Context` for more responsive state tracking

### Fixed
- Checklist toggle supports multi-line selection in both directions

---

## [1.0.4] - 2026-04-02

### Changed
- Optimised resize overlay updates in `ImageResizer` and `VideoResizer` using `requestAnimationFrame` and debounce for smoother dragging
- Improved tooltip repositioning performance in `ImageTooltip`, `TableTooltip`, and `VideoTooltip` with `requestAnimationFrame`-based scheduling

---

## [1.0.3] - 2026-04-02

### Added
- Favicon (`/image/favicon.ico`) added to the dev and demo pages
- `focusColor` option — accepts any valid CSS colour string to override the default blue focus ring on the editor
- `readOnly` option — starts the editor in read-only (non-editable) mode with toolbar hidden; synced preview panel added to the demo page

### Changed
- Enhanced caret navigation around FontAwesome icon elements in Typing and IconDialog
- Refactored read-only editor internals with improved placeholder styling
- Toolbar now correctly hides when the editor is initialised in `readOnly` mode

---

## [1.0.2] - 2026-04-01

### Added
- Preview functionality in VideoTooltip with visual styling for video selection
- `requestAnimationFrame`-based overlay position updates in ImageResizer and VideoResizer for smoother resizing

### Changed
- Enhanced preview mode handling in VideoTooltip to prevent accidental exit
- Updated video wrapper width for better responsive layout of `<iframe>` and `<video>` elements in VideoDialog
- Improved tooltip positioning logic and image deletion handling in editor
- Enhanced checklist functionality and cursor positioning
- Improved statusbar resizing logic and editable area minimum height
- Enhanced icon handling and backspace behaviour in editor
- Strengthened sanitisation of iframe sources

### Fixed
- ESLint config export changed from `export default` to `module.exports` for proper CJS compatibility

---

## [1.0.0] - 2026-03-31

### Added
- Core WYSIWYG editor built with vanilla JavaScript (ES2022+), no jQuery
- Toolbar with full text formatting: bold, italic, underline, strikethrough, superscript, subscript
- Paragraph styles: Normal, H1–H6, Blockquote, Code block
- Font family dropdown (10 families by default)
- Line height dropdown (1.0 – 3.0)
- Text & highlight colour picker with last-used colour memory
- Alignment: left, center, right, justify
- Ordered and unordered lists with indent/outdent; Tab/Shift+Tab support
- Undo/redo history stack (100 levels, Ctrl+Z / Ctrl+Y)
- Insert: horizontal rule, link dialog, image dialog (URL & file upload), video dialog (YouTube, Vimeo, direct URL)
- Table — interactive grid picker (up to 10×10) with full row/column/cell management tooltip
- Emoji picker (~380 Unicode emoji, 7 categories, keyword search)
- FontAwesome icon picker (FA 6 Free Solid, 8 categories, keyword search)
- Inline floating tooltips for link, image, video, table, and code block elements
- Right-click context menu (undo, redo, cut, copy, paste, format tools)
- Image & video drag-to-resize handles
- Statusbar with live word/character count and height drag handle
- Code view (toggle raw HTML with sanitisation)
- Fullscreen mode
- CSS placeholder via `::before` pseudo-element
- Bootstrap 4/5 integration (`useBootstrap` option)
- FontAwesome auto-detection with SVG icon fallback
- Custom module registration via `AutumnNote.registerModule()`
- DOM-based HTML sanitiser: strips `<script>`, `<iframe>`, `on*` handlers, `javascript:` and `data:` URLs
- ES module + UMD builds via Vite
- TypeScript type definitions
- GitHub Pages live demo: https://cmm-cmm.github.io/Autumn-Note/
