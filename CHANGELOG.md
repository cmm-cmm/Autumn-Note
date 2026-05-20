# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.0] - 2026-05-20

### Added
- **pnpm workspace monorepo** — project restructured as a pnpm workspace (`pnpm-workspace.yaml`); `packages/react/` and `packages/vue/` are managed alongside the core library under a single `pnpm install`
- **`autumnnote-react`** — official React wrapper package (`packages/react/`); exposes the `Context` instance via `forwardRef` + `useImperativeHandle`; accepts `options`, `className`, and `style` props; mount-once lifecycle (use `key` prop to remount on options change)
- **`autumnnote-vue`** — official Vue 3 wrapper package (`packages/vue/`); `<AutumnNote.vue>` SFC using `<script setup>`, `defineProps`, `onMounted`/`onUnmounted`, and `defineExpose({ editor })`; access instance via `ref.value.editor.value`
- **`exports` field in `package.json`** — added `"exports"` map (`"."` → ESM/CJS, `"./dist/autumnnote.css"`) alongside existing `main`/`module` fields for better bundler compatibility
- **Docs — Framework Wrappers section** — new `docs.html` section covering React and Vue installation, lifecycle, props table, and access patterns
- **Live Demo / README** — updated to document React and Vue wrappers with installation commands and usage examples; feature strip now highlights React wrapper, Vue 3 wrapper, and pnpm monorepo

---

## [1.4.2] - 2026-05-20

### Fixed
- **Markdown inline regex — cross-line and over-greedy matches** — bold (`**`/`__`), bold-italic (`***`/`___`), and strikethrough (`~~`) patterns used `.+?` which matched across newlines and through delimiter characters, causing false positives on multi-line content or adjacent markers. Replaced with character-class negation (`[^*\n]+?`, `[^_\n]+?`, `[^\n]+?`) so each pattern is constrained to a single line and cannot consume its own delimiter
- **Checklist → paragraph conversion preserves inline formatting (toggle path)** — `toggleChecklist()` unchecked the same stripping bug as `_checklistItemToP()`: converting list items back to `<p>` discarded all inline markup (bold, italic, links, etc.) by reading `.textContent`. Fixed by cloning child nodes (skipping the checkbox `<INPUT>`) and stripping only zero-width-space anchors, consistent with the `_checklistItemToP()` fix in v1.3.0

---

## [1.4.1] - 2026-05-19

### Fixed
- **Playground — Apply Options crash** — `editor.destroy()` tears down the Context but does not remove the entry from AutumnNote's internal `WeakMap`; the subsequent `AutumnNote.create()` call returned the stale destroyed instance. Fixed by using `AutumnNote.destroy(targetEl)` which removes the entry before re-creating.
- **Playground — editor panel corners missing border** — `.an-container` carries its own `border` and `border-radius` from `autumnnote.css`; inside `.panel-editor` (which has `border-radius: 10px; overflow: hidden`) the two borders overlapped and the outer panel border was visually covered at the corners. Fixed by suppressing `.an-container`'s border and radius inside the panel, letting `.panel-editor` own the visual boundary.
- **Playground — layout shift on focus** — switching from `border: none` (0 px) to the focus border (1 px) on `.an-focused` caused a 1 px layout jump. Fixed by using `border-color: transparent` so border-width stays constant at 1 px in both states.
- **Playground — focus ring clipped at corners** — `.an-container` has `border-radius: 0` inside the panel, so the orange focus ring appeared only on straight edges; corners remained gray because `overflow: hidden` on `.panel-editor` clipped the inner border. Fixed by fully suppressing `.an-container`'s border/shadow and propagating focus state to `.panel-editor` via `onFocus`/`onBlur` callbacks so the ring draws on the element that owns `border-radius: 10px`.
- **Playground — `context.on('focus')` / `context.on('blur')` never fired** — `Context._bindEditorEvents()` invokes `options.onFocus` directly without calling `triggerEvent('focus')`, so `context.on()` listeners are never notified. Fixed by passing `onFocus`/`onBlur` as options in `AutumnNote.create()` instead.
- **Playground — editor height and @mention misaligned with Live Demo** — editor defaulted to 200 px (library default) instead of 300 px; `@mention` autocomplete was absent. Both options now match the Live Demo configuration.
- **Docs/Playground nav links — 404 on GitHub Pages** — nav `href` values used absolute paths (e.g. `/docs.html`) which resolve to `cmm-cmm.github.io/docs.html` instead of the correct `/Autumn-Note/docs.html` sub-path. Changed to relative paths (`docs.html`, `playground.html`, `./`).

### Changed
- **Project tagline** updated to *"Fast. Lightweight. Reliable. Efficient."* across all user-facing files (landing page hero, README, package.json description, demo site, user manual).
- **Docs — Plugin API section expanded** with: descriptor field reference table, event-name list for `context.on()`, full `invoke()` path reference table (16 module methods), complete custom Module class example (`WordBadgeModule`), and expanded installation code samples.

---

## [1.4.0] - 2026-05-19

### Added
- **Plugin API** — first-class plugin system for packaging editor extensions:
  - `AutumnNote.use(plugin, options?)` — installs a plugin globally; buttons declared in `plugin.buttons` are registered to the global button registry *immediately* (before any `create()` call), so they can be referenced by name string in `toolbar` config
  - `AutumnNote.hasPlugin(name)` — checks if a plugin is registered globally
  - `AutumnNote.registerButton(btnDef)` — registers a standalone button definition globally
  - `context.use(plugin, options?)` — per-instance plugin installation (call `ctx.invoke('toolbar.rebuild')` to surface new buttons in an already-rendered toolbar)
  - `context.getPlugin<T>(name)` — returns the typed public API object returned by `plugin.install()`
  - `context.invoke('toolbar.rebuild')` — new `Toolbar` method that tears down and re-renders the toolbar in-place after post-create button registration
  - `AsnPlugin<T>` TypeScript interface — fully typed plugin descriptor with `name`, `version?`, `buttons?`, `install?(ctx, opts): T`, and `uninstall?(ctx)` fields
  - `toolbar` option now accepts string button names alongside `ButtonDef` objects — string names are resolved from the global button registry at build time
- **`/docs.html`** — fully rendered API reference page with sticky sidebar navigation, section search filter, Prism.js syntax highlighting, copy-to-clipboard code blocks, and IntersectionObserver-driven active link tracking; covers all options, static methods, instance methods, events, toolbar configuration, Plugin API, i18n, and TypeScript
- **`/playground.html`** — dedicated interactive playground with: live config panel (9 toggle-able options with Apply button), snippet library (6 presets: Article, Checklist, Table, Code, Formatting, Clear), HTML / Markdown / Stats output tabs, copy + download buttons, shareable URL (state encoded as base64 URL hash), and config persistence in `localStorage`
- **Site navigation** — header nav on the landing page now includes direct links to **Docs** and **Playground**

### Fixed
- **Version strings synchronised** — `src/js/index.js` `version` field, all HTML brand badges, and built `dist/` files now all reflect the same version as `package.json`; version was previously inconsistent across files (ranging from `1.0.9` in old dist artifacts to `1.1.1` in source)

### Tests
- **2 pre-existing test failures resolved** — `Statusbar.test.js` used `innerText` setter (which jsdom does not propagate to `textContent`; fixed to use `textContent`) and `Toolbar.test.js` relied on synchronous `requestAnimationFrame` (fixed with `vi.stubGlobal` synchronous mock)
- **25 new unit tests** across 7 test files covering: `sanitise.js` `<button>` unwrap and `<base>` strip, `markdown.js` nested list indentation (2–3 levels) and `isMarkdown` false-positive prevention, `dom.js` `isEmpty` with single-`<br>` child, `func.js` `throttle` trailing call, `FindReplace.js` locale `noResults` key and index reset, `Typing.js` Enter and Tab in `<pre>` blocks, `History.js` detached-node fallback in `_restoreSelection`

---

## [1.3.0] - 2026-05-19

### Added
- **Touch support for image crop overlay** — crop handles and the crop-box drag area now respond to `touchstart`/`touchmove`/`touchend` events, enabling crop operations on mobile and tablet devices
- **Enter key in `<pre>` / code blocks** — pressing Enter inside a `<pre>` block now inserts a literal `\n` instead of creating a new block element, preserving code block structure
- **Configurable `tabSize` in code blocks** — Tab key inside a `<pre>` block inserts `' '.repeat(options.tabSize)` spaces (defaults to 4) so the indent width can be controlled per-instance
- **Nested list support in Markdown conversion** — `htmlToMarkdown()` now passes a `depth` counter through `ul`/`ol` recursion, producing correctly indented nested lists (e.g. `  - child item`) instead of flat output
- **`findReplace.noResults` i18n key** — the "No results" label in Find & Replace is now localised; all 8 language packs (`en`, `vi`, `ja`, `zh`, `fr`, `de`, `es`, `ko`) include the new key
- **Non-blocking crop error banner** — cross-origin crop failure now shows a dismissible inline banner (auto-removes after 4 s) anchored to `document.body` instead of a blocking `window.alert()`

### Changed
- **`insertTable` rewritten with Range API** — replaces the deprecated `execCommand('insertHTML')` call; the new implementation inserts the table after the nearest block ancestor, removes the empty anchor paragraph, ensures a landing `<p>` follows the table, and places the cursor in the first cell
- **Table cells initialised with `<br>`** — `<td>` and `<th>` cells are now created with a `<br>` placeholder instead of `&nbsp;`, making empty cells focusable via the caret without inserting non-breaking space characters into the content
- **`button` elements unwrapped by sanitiser** — `<button>` tags are no longer outright removed; their child nodes are preserved by unwrapping (using `replaceWith(...childNodes)`), so button-wrapped text pasted from external sources is not silently discarded
- **`removeFormat` in BubbleToolbar strips `style` attributes** — after `execCommand('removeFormat')` (which skips inline `style`), the handler now iterates all elements intersecting the selection and removes `style` attributes, producing a clean result consistent with the context menu
- **`hiliteColor` fallback for Firefox** — BubbleToolbar `_applyColor()` falls back to `backColor` when `hiliteColor` fails, ensuring highlight colour works across all browsers
- **`throttle` adds trailing-call guarantee** — the utility now schedules a trailing timeout for the final event in a burst, preventing the last event from being silently dropped; also switched from `Date.now()` to `performance.now()` for sub-millisecond accuracy
- **`lineHeight` uses `TreeWalker` with range filter** — replaces `createNodeIterator` + manual `intersectsNode` check with a `TreeWalker` that filters inline, avoiding unnecessary node visits outside the selection
- **`isEmpty()` treats lone-`<br>` nodes as empty** — a node containing only a single `<br>` child is now correctly classified as empty, fixing false-positive "non-empty" results that occurred after browser-inserted placeholder `<br>` elements
- **`rect2bnd` returns raw DOMRect values** — removed `Math.round()` calls; sub-pixel precision is preserved for accurate element positioning (rounding at display time is the browser's responsibility)

### Fixed
- **Checklist → paragraph conversion preserves inline formatting** — `_checklistItemToP()` previously stripped all markup to plain text when outdenting a checklist item; it now clones child nodes (keeping `<strong>`, `<em>`, `<a>`, etc.) and only strips zero-width-space anchors
- **FindReplace `_currentIndex` reset timing** — `_currentIndex` was reset to `0` before wrapping matches (while the array was still being built in reverse), potentially resolving an off-by-one highlight on re-search; reset now occurs after `_matches` is finalised and filtered
- **History undo cursor fallback** — when restoring a snapshot whose range references detached nodes, the editor now falls back to placing the caret at the start of the editable area rather than silently failing

---

## [1.2.2] - 2026-05-19

### Fixed
- **Clipboard data-URL crash** — `_dataUrlToBlob()` called `.match()[1]` without guarding against a `null` result when passed a malformed data URL; now uses optional chaining with an `'image/png'` fallback to prevent `TypeError`
- **Context menu table-picker label** — label showed `${cols} × ${rows}` (e.g. "3 × 5" for 5 rows × 3 cols) — reversed vs. the toolbar's `${rows} × ${cols}`; the actual `insertTable(cols, rows)` call was already correct, only the display was wrong
- **BubbleToolbar colour apply crash** — `sel.addRange(_savedRange.cloneRange())` could throw `InvalidStateError` when the saved range referenced detached nodes (e.g. user deleted content while the colour picker was open); wrapped in `try/catch` with early return to avoid a silent crash

### Performance
- **Toolbar** — `refresh()` now schedules DOM updates via `requestAnimationFrame`; rapid back-to-back calls (e.g. `afterCommand` + button click in one frame) collapse into a single repaint
- **History** — `_tokenizeImages()` fast-path skips the base64 regex scan when `innerHTML` contains no `data:` string (common case with no embedded images), eliminating a 400 ms typing pause on large documents
- **BubbleToolbar** — button elements are cached after `_build()`; `_syncActive()` iterates the cache instead of calling `querySelectorAll` on every `selectionchange` event
- **sanitise.js** — replaced 3 separate `querySelectorAll('*')` traversals with a single pass covering tag removal, attribute sanitisation, and input filtering; tag lookup switched to `Set` for O(1) access
- **Statusbar** — word-count uses `textContent` instead of `innerText`, avoiding a forced layout flush on every debounced input event
- **FindReplace** — `_findRawMatches()` caps the `TreeWalker` loop at 500 results to prevent main-thread blocking on very large documents
- **Mention** — `_renderItems()` batches list items into a `DocumentFragment` for a single `appendChild`; `_buildDropdown()` uses delegated listeners on the container instead of per-item event registration
- **ImageResizer** — overlay position is cached between scroll `rAF` frames; style writes are skipped when the position is unchanged, reducing paint work at 60 fps

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
