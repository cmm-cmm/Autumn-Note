# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.1] - 2026-05-18

### Fixed
- **Table picker popup position** — popup was still appended to the toolbar DOM tree, causing `position: fixed` to break when any ancestor had `transform`/`filter`/`backdrop-filter`; popup is now appended to `document.body` (matching the color-picker pattern); a disposer removes it on editor destroy. Additionally, `display: block` was set before `left`/`top`, risking a paint flash at the viewport origin — fixed by measuring with `visibility: hidden` first, then setting the correct position before revealing
- **Demo page favicon on GitHub Pages** — `href="/image/favicon.ico"` and `src="/image/banner.png"` used absolute root paths that resolved to `https://cmm-cmm.github.io/image/…` instead of the correct `/Autumn-Note/image/…` sub-path; moved `image/` into `public/` (Vite's default `publicDir`) so Vite copies the files to `_site/image/` and rewrites HTML paths with the base during production build

---

## [1.2.0] - 2026-05-18

### Added
- **Highlight colour in bubble toolbar** — `hiliteColor` is now a first-class button; the default `bubbleToolbarItems` list is updated to include both `foreColor` and `hiliteColor`
- **Colour picker popup in bubble toolbar** — replaces the previous `window.prompt()` with a full inline colour palette (preset swatches + custom colour input) matching the context menu; the text selection is saved before the picker opens and restored before the colour command is applied
- **Mobile-responsive toolbar** — on viewports ≤ 640 px the toolbar automatically switches to a single horizontally-scrollable row instead of wrapping to multiple rows; scrollbar is hidden so touch-swipe works naturally; font-family, font-size, and paragraph-style dropdowns compact automatically
- **Demo: dark / light theme toggle** — a sun/moon toggle button in the Live Demo lets visitors preview both editor themes without writing any code

### Changed
- **Bubble toolbar colour button icons** — buttons now render an SVG icon stacked above a colour-strip indicator (matching the context menu's icon style); the strip reflects the current selection colour in real time
- **`removeFormat` in bubble toolbar** — was incorrectly invoking a non-existent `editor.removeFormat` method; now calls `document.execCommand('removeFormat')` directly, consistent with the context menu
- **Table picker popup** — switched from `position: absolute` to `position: fixed` with JS-computed coordinates; the popup no longer gets clipped by the toolbar's `overflow-x: auto` ancestor in scroll mode or on mobile
- **Editor corner radii** — `.an-toolbar` and `.an-statusbar` now carry matching `border-radius` values so the rounded corners of `.an-container` are always visible and never covered by child backgrounds; `.an-editable:last-child` receives bottom-corner radii when there is no statusbar

### Fixed
- Bubble toolbar colour picker lost selection — selection is now saved before the picker opens and restored before applying the command
- Table picker clipping in scroll mode — `an-table-picker-popup` is now `position: fixed` and escapes any `overflow-x: auto` ancestor

---

## [1.1.0] - 2026-05-17

### Added
- **Bubble toolbar** — a mini floating toolbar that appears above the current text selection for quick access to bold, italic, underline, strikethrough, link, text colour, remove format, and inline code; activated via `bubbleToolbar: true`; button set is configurable via `bubbleToolbarItems`
- **Markdown shortcuts** — type Markdown-style syntax directly in the editor and it auto-converts on Space / Enter: `# ` → H1–H3, `> ` → blockquote, `- ` / `* ` → unordered list, `1. ` → ordered list, `[ ] ` → checklist, `---` → horizontal rule, ` ``` ` → code block; inline: `**bold**`, `*italic*`, `~~strikethrough~~`, `` `code` ``; enabled by default (`markdownShortcuts: true`)
- **Auto-save restore** — when `autoSave` and `autoSaveRestore` are both `true`, a dismissible banner is shown on load if a draft exists in localStorage; configurable age window via `autoSaveRestoreTimeout` (days); `onAutoSaveRestore(html, context)` callback fires after restore
- **@mention autocomplete** — type the trigger character (default `@`) to open a floating dropdown populated by a custom `mention.onSearch(query, callback)` function; configurable `trigger`, `minChars`, `maxResults`, `debounce`, `mentionClass`, `allowSpaces`, and `onInsert` for custom chip HTML

### Changed
- Improved `ContextMenu` layout and icon rendering for better visual consistency
- `func.js` — minor utility improvements used by new modules

---

## [1.0.9] - 2026-04-14

### Added
- **Built-in localisation packs** — toolbar, dialogs, tooltips, and statusbar strings now ship with English (`en`), Vietnamese (`vi`), Japanese (`ja`), Simplified Chinese (`zh`), French (`fr`), German (`de`), Spanish (`es`), and Korean (`ko`)
- **Internationalisation test coverage** — added core tests for locale fallback, key handling, and DOM helpers that support translated UI flows

### Changed
- **Locale typing** — `AsnLocale` now accepts nested toolbar records so custom locale overrides can stay strongly typed
- **Documentation refresh** — README and manual updated to reflect the current installation guidance and localisation support

---

## [1.0.8] - 2026-04-07

### Added
- **Cell selection mode** — click-and-drag or keyboard-driven cell selection in tables with visual highlight feedback and tooltip integration
- **Unmerge cells** — new action in TableTooltip to split previously merged cells back to their original state with visual feedback
- **Iframe support in `setHTML()`** — `setHTML()` now permits `<iframe>` elements so embedded content (e.g. YouTube) can be restored programmatically

### Changed
- **Outdent converts checklist items to paragraphs** — outdenting a checklist item at the top level now converts it to a plain paragraph instead of doing nothing
- **Table tooltip handles merged cells** — improved tooltip behaviour and action availability when the selection contains merged cells
- **Strikethrough & fontSize on partial selections** — improved handling for fragmented selections; commands now apply/toggle correctly across complex inline structures
- **Checklist conversion** — `fontSize` command correctly converts checklist items when the whole list is selected
- **Tooltip vertical alignment** — tooltip content is now vertically centred for a more polished appearance
- **File input restricted to web-displayable images** — image dialog now filters `<input type="file">` to MIME types renderable in browsers (`image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`); unsupported formats show a clear error message
- **Video shield disabled in read-only mode** — the click-shield overlay on video embeds is no longer rendered when the editor is in read-only mode

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
