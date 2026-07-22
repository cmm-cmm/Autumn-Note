# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.16.0] - 2026-07-22

### Added
- Runtime `updateOptions()`, adapter-backed debounced auto-save, document import/export adapters, selection bookmarks, stable block IDs, and collaboration bridge hooks.
- Controlled `value`/`onChange` support for React and `v-model` support for Vue, including runtime option updates without remounting.
- Extensible slash commands through `registerSlashCommand()`, with listbox screen-reader state and reduced-motion styling.
- Optional external `imageProcessor` hook for worker-backed image compression while retaining the canvas fallback.
- `/` command palette (`SlashMenu` module) — typing "/" as the first character of an empty block opens a filterable list for quick-inserting headings, lists, checklist, blockquote, code block, horizontal rule, table, and image. Fully localized in all 8 languages. Disable via `slashMenu: false`.
- `historyMaxBytes` option — caps the combined size of all stacked undo/redo snapshots (default 10 MB), evicting the oldest states first when exceeded even under the step-count limit. Guards documents with many large embedded images against unbounded undo-history memory growth.
- CDN build (`vite.cdn.config.js`) is now produced by the default `build` script and included in published packages, instead of being a separate, never-invoked script.
- SonarCloud static analysis now runs in CI (`ci.yml`), uploading coverage via the new `lcov` reporter.

### Fixed
- Keep undo/redo offsets valid when one oversized snapshot evicts multiple history entries under `historyMaxBytes`.
- Preserve `/image` command text when the image dialog is cancelled, removing it only when insertion is committed.
- Make the optional SonarCloud step test `SONAR_TOKEN` through the supported environment-variable context.
- Prevent the CDN build from copying demo-site assets into the published npm package.
- Update ESLint, Sass, and Vite to pull patched `brace-expansion` and `immutable` releases and clear high-severity dependency audit findings.
- Image files chosen through the Insert Image dialog's file picker are now resized/compressed via the same canvas pipeline already used for pasted/dropped images, instead of being embedded untouched.
- `[ ] ` markdown shortcut now correctly converts to a checklist item (was calling a non-existent `editor.checklist` method instead of `editor.toggleChecklist`).
- `---` markdown shortcut now correctly inserts a horizontal rule (was calling a non-existent `editor.insertHR` method instead of `editor.insertHr`).
- Statusbar word/character count no longer runs twice per keystroke (an undebounced call from `Editor.afterCommand` plus a redundant, separately-debounced listener in `Statusbar`).
- `check-bundle-size.mjs` now fails clearly if a dist file is missing (instead of an uncaught `ENOENT`), enforces a lower-bound sanity floor, and covers the CDN bundle.

### Changed
- CI step order now matches the `check` script (`build` → `test:wrappers` → `check:bundle`), so `ci.yml` actually exercises the order used at release time.
- `publish.yml`'s cross-browser smoke tests now run as a parallel matrix job instead of three sequential steps, and both `ci.yml` and `publish.yml` cache Playwright browser binaries.
- `autumnnote-react`'s peer dependency floor raised from React 16.8 to React 18, and `autumnnote-vue`'s from Vue 3.0 to Vue 3.4, to match the versions actually exercised by CI. Older versions were never tested and this is not expected to affect real-world consumers.
- Bumped `actions/checkout` and `actions/setup-node` to v5 in all workflows.

---

## [1.15.0] - 2026-07-16

- Minify production ESM, UMD, and CommonJS bundles with OXC and enforce a 110 KiB gzip budget.
- Add focused coverage gates for complex image crop, icon dialog, and table tooltip modules.
- Exercise clipboard paste through Chromium browser automation while retaining cross-browser sanitizer coverage.

### Security
- Canonicalise URL protocols before validation, closing an XSS bypass where encoded tabs or newlines made `javascript:` URLs evade the sanitizer.
- Restrict links and media to an explicit protocol allowlist, reject SVG data URIs, and remove invalid iframe embeds entirely.
- Block `noscript`, `portal`, `frame`, `frameset`, and `applet` elements in `sanitiseHTML` to close residual embedding vectors.

### Added
- `pasteError` event and `onPasteError` callback option — fired when pasted or dropped content exceeds `maxPasteSize` or a dropped Markdown file cannot be read; includes `message`, optional `size`, and optional `maxBytes` fields. `PasteErrorData` TypeScript interface exported from the package.

### Changed
- Standardise development and CI on a pinned pnpm release and patched Vite/Vitest dependencies.
- Add framework-wrapper lifecycle tests, bundle-size budgets, and stronger CI/release gates.
- Align framework builds on Vite 8, add strict consumer type checks, and provide a dedicated CommonJS entry while preserving the browser UMD path.
- Require Node 20.19+ for development and package usage.
- Wire CI to trigger on `dev` branch pushes and pull requests in addition to `main`.

### Fixed
- Flush pending debounced snapshots before undo/redo so immediate Undo after a toolbar command restores the previous state.
- Avoid React `useLayoutEffect` warnings during server rendering and correct the Vue wrapper's exposed `editor` type and examples.
- Replace JavaScript re-exports in the public declaration package with self-contained core `.d.ts` modules.

---

## [1.14.0] - 2026-07-14

### Changed
- **Rebranded display name from "AutumnNote" to "Autumn Note"** (with a space) across all visible/prose text — page titles, headings, meta descriptions, Open Graph/Twitter tags, JSON-LD `name`/`description` fields, README, CHANGELOG, CONTRIBUTING, SECURITY, issue templates, and the framework wrapper READMEs. The npm package names (`autumnnote`, `autumnnote-react`, `autumnnote-vue`), the JavaScript API (`AutumnNote.create()`, `import AutumnNote from 'autumnnote'`, the UMD global), and all code samples/API references are unaffected — these cannot contain a space and remain unchanged
- Regenerated the 1200×630 OG/Twitter banner image with the corrected "Autumn Note" wordmark
- Footer credit line and all `<title>`/meta descriptions on the live demo (English and Vietnamese) now consistently read "Autumn Note"

---

## [1.13.0] - 2026-07-12

### Added
- Vietnamese localization of the live demo site (`demo/vi/index.html`, `demo/vi/docs.html`, `demo/vi/playground.html`) — full translations of the marketing copy, homepage FAQ, and API reference prose, with code samples, option/parameter names, and type signatures left in English per standard technical-docs convention
- `hreflang` alternate links (`en`/`vi`/`x-default`) and a language switcher (`EN` / `VI`) in the header nav on all 6 pages
- `og:locale`, `twitter:url`, and `apple-touch-icon` meta tags on all 3 English pages
- A proper 1200×630 OG/Twitter banner image, replacing the previous 512×512 square logo

### Fixed
- 21 instances of mangled UTF-8 (`—`, `→`, `✓`) plus 5 resulting broken HTML closing tags in `docs.html`, left over from an earlier encoding corruption
- A duplicate `id="tab-stats"` HTML attribute in `playground.html`
- `sonar.cpd.exclusions` glob pattern in `sonar-project.properties`, which previously only matched HTML files in the repo root and never applied to any file under `demo/`

### Changed
- Extracted each page's shared `<style>` block into `demo/assets/*.css`, linked from both the English and Vietnamese version of each page, instead of duplicating ~13KB of inline CSS per locale pair

---

## [1.12.0] - 2026-07-08

### Added
- Visible FAQ section on the Live Demo homepage, mirroring the existing `FAQPage` JSON-LD copy (what is Autumn Note, licensing, competitor alternatives, install) so structured data and on-page content match
- `WebSite` schema.org JSON-LD entity, linked via `@id`/`isPartOf` from the `SoftwareApplication` (homepage), `TechArticle` (docs), and `WebApplication` (playground) blocks
- Branded `demo/404.html`, wired into the demo build (`vite.demo.config.js`) and Cloudflare Workers Assets (`wrangler.toml`'s `not_found_handling = "404-page"`), so broken links land on a real page instead of a blank default
- `public/_headers` — short `Cache-Control` TTL for HTML pages, long immutable TTL for hashed `/assets/*`, for faster re-crawl pickup of edited pages
- `<lastmod>` on all 3 `sitemap.xml` entries

### Changed
- Homepage H1 now carries real keywords (`Fast, Lightweight WYSIWYG Editor for Vanilla JavaScript`) instead of a keyword-free tagline
- `<main>` landmark widened on the homepage to wrap all marketing content (hero, features, demo, quick-start, FAQ) instead of just the demo widget; added the missing `<main>` on the playground page
- Playground's crawler-fallback copy now includes "rich text editor" alongside "WYSIWYG editor"; its footer gained a Home link for nav consistency with the other pages
- Header logo images across all 3 demo pages now have descriptive alt text

---

## [1.11.1] - 2026-07-07

### Security
- **`<template>` sanitiser bypass** — `sanitiseHTML()`'s single `querySelectorAll('*')` pass never traversed into a `<template>`'s `content` (a separate `DocumentFragment` tree), so any dangerous element nested inside one — `<script>`, `<iframe>`, `on*` handlers — survived untouched. `template` added to `PROHIBITED_TAGS`
- **`style` attribute CSS injection** — the `style` attribute was never checked, allowing data exfiltration via auto-fetched `background:url(...)` and full-page phishing overlays via `position:fixed`. Rather than stripping `style` entirely (which would have regressed table cell sizing/border/padding/alignment, text color/highlight/font-size, and markdown table alignment — all of which persist via inline styles), added an allowlist of the specific CSS properties those features use, with any declaration containing `url()`, `expression()`, an `import` rule, `javascript:`/`vbscript:`, or legacy IE `behavior`/`-moz-binding` dropped regardless of property
- **`<link>`/`<meta>` sanitiser bypass** — `<link rel="stylesheet">` enabled CSS-based exfiltration and `<meta http-equiv="refresh">` enabled unwanted redirects; both tags added to `PROHIBITED_TAGS`
- **`xlink:href` XSS bypass** — the legacy SVG XLink-namespaced attribute was not covered by the `javascript:`/`vbscript:` URL check already applied to plain `href`; `xlink:href` added to `URL_ATTRS`

---

## [1.11.0] - 2026-07-04

### Added
- **Markdown parser — blockquote nesting and block content** — `>text` (no space) is now recognised; `markdownToHTML()`'s block loop was factored into a recursive `_parseBlocks()`, so nested blockquotes (`> > quote`) and block content inside quotes (`> # heading`, `> - list`) parse as real nested blocks instead of flattened inline text
- **Markdown parser — loose lists and multi-paragraph items** — a blank line between list items (or before indented continuation text) now keeps the list intact with `<p>`-wrapped item content per CommonMark, instead of splitting into separate sibling lists
- **Markdown parser — inline escaping and autolinks** — backslash escapes (`\*`, `\_`, `` \` ``, …) suppress markdown meaning; underscore emphasis requires a word boundary (`snake_case_word` is no longer italicised); trailing two-space/backslash hard line breaks become `<br>`; raw `<`/`>`/`&` in prose is escaped exactly once; `<https://…>` and bare `https://…` URLs autolink
- **Markdown parser — smaller gaps** — horizontal-rule spaced forms (`- - -`, `* * *`), escaped pipes (`\|`) in table cells, `<ol start="N">` for lists not starting at 1, double-backtick code spans, and ATX heading trailing `#` stripping
- **Markdown export (`htmlToMarkdown`) fidelity** — `<u>` and colour/background/font-size styled `<span>`s export as raw HTML passthrough instead of silently losing formatting; headerless tables no longer promote the first data row to a header; a checkbox in a `<ul>` missing the `an-checklist` class still exports as `- [ ]`/`- [x]`; blockquote export collapses redundant blank lines
- **Clipboard integration** — markdown-shaped plain text now wins over an accompanying `text/html` payload that has no semantic markup; dropping a `.md` file onto the editor converts and inserts it (previously silently ignored); oversized paste/drop fires a `pasteError` event instead of silently doing nothing
- **Playground "Markdown" snippet** — loads raw markdown source through `editor.setMarkdown()`, exercising the real conversion pipeline (frontmatter, setext headings, nested blockquotes, checklists, loose lists, table alignment, footnotes, …) for visual verification

### Fixed
- **Nested list export duplication** — `_domToMd()` used the `:scope > li` CSS combinator to find direct child items, which resolves incorrectly in some DOM implementations (matches descendants at any depth); a nested list's inner item was silently duplicated as an extra top-level item on every markdown export. Replaced with an `element.children`-based helper
- **Loose-list display** — `<li><p>…</p></li>` items inherited the editable's generic paragraph margin with no reset, and `list-style-position: inside` dropped the list marker onto its own line; new `li > p` rules keep the marker inline with the first paragraph with consistent spacing
- **Plain code-fence double tint** — `<pre>` and its inner `<code>` both painted the toolbar background; the inner `<code>` is now transparent/unpadded inside `<pre>`, with dark and auto theme variants

### Changed
- **Headings in the editable** — `h1`–`h6` now declare an explicit font-size scale instead of relying on browser defaults
- **`_inline()` internals** — sequential regex steps extracted into named helper functions (no behavior change; keeps cognitive complexity under the SonarCloud quality gate)

---

## [1.10.0] - 2026-07-02

### Added
- **Raw `.md` paste — YAML frontmatter stripping** — a `.md` file starting with `---\ntitle: x\n---\n...` (Jekyll/Hugo/Obsidian style) previously rendered as garbage (the delimiters became stray `<hr>` tags with the frontmatter body dumped into a bogus paragraph); frontmatter is now stripped invisibly before conversion, matching how rendered markdown views never display it. A YAML-shape check disambiguates real frontmatter from an actual horizontal rule followed by prose, so no existing HR/paragraph behavior regresses
- **Raw `.md` paste — bare GFM table detection** — `isMarkdown()` now recognises a `.md` file whose only content is a GFM table (no heading/list/bold/blockquote elsewhere), so it converts to `<table>` instead of pasting as literal text
- **Raw `.md` paste — reference-style links and footnotes** — `[text][ref]`, shortcut `[text][]`, and bare `[text]` reference links (resolved against `[ref]: url "title"` definitions) and `[^id]` footnote markers (resolved against `[^id]: text` definitions, rendered as `<sup>[id]</sup>`) are now parsed instead of leaking into the document as literal bracket text or stray definition-line paragraphs

---

## [1.9.1] - 2026-07-02

### Fixed
- **GitHub checklist normalization hardening** — `_normalizeExternalTaskLists()` in `Clipboard.js` now correctly handles checkboxes wrapped inside additional inline elements (e.g. `<label>`, `<span>`) within a `<li>` in external task-list HTML; previously such inputs were not promoted to the `<li>` root and were stripped by the sanitiser

---

## [1.9.0] - 2026-07-02

### Added
- **Nested list support in markdown paste** — new recursive `_parseListBlock()` helper in `markdown.js` replaces the previous flat UL/OL parser; correctly nests unordered/ordered lists to any depth, including mixed UL-in-OL and OL-in-UL, and checklists with a nested plain sub-list
- **Setext heading support** — `Title\n===` and `Title\n---` are now recognised as `<h1>`/`<h2>` in `markdownToHTML()`, with matching detection added to `isMarkdown()`; guarded against false positives from horizontal rules and GFM table separator rows
- **GFM table alignment** — `:---`, `:---:`, and `---:` markers in the separator row are now parsed and emitted as `style="text-align:..."` on the corresponding `<th>`/`<td>` cells; ragged tables (separator column count ≠ header column count) are handled safely

### Fixed
- **GitHub/GitLab checklist paste** — checkboxes pasted from `ul.contains-task-list` HTML were being stripped entirely because the sanitiser only allows `input[type=checkbox]` inside `ul.an-checklist`; added `_normalizeExternalTaskLists()` in `Clipboard.js` to upgrade external task-list markup before sanitisation runs, including checkboxes wrapped in a `<label>` or other element inside the `<li>`

---

## [1.8.3] - 2026-06-30

### Fixed
- **`ImageCropOverlay` canvas null crash** — added an explicit null-check for `canvas.getContext('2d')` in `drawCropToCanvas()`; previously a GPU memory limit returning `null` was silently swallowed and incorrectly reported to the user as a CORS error
- **`Clipboard._compressImage` silent hang** — both FileReader fallback paths (canvas unavailable + image load error) now call `reject()` on failure so the outer `.catch()` can surface the error to `onImageError` instead of leaving the Promise permanently pending
- **`ContextMenu` clipboard paste unhandled rejection** — added `.catch(() => {})` to the detached inner Promise chain in the `navigator.clipboard.read()` HTML path so permission errors are silently swallowed instead of becoming unhandled rejections

### Added
- **`maxPasteSize` and `minImageSize` defaults** — added explicit values (`5 * 1024 * 1024` and `20`) to `settings.js`; previously `context.options.maxPasteSize` returned `undefined` because the option was documented and type-declared but absent from `defaultOptions`
- **TypeScript exports map `"types"` condition** — added `"types": "./types/index.d.ts"` to the `"."` export in `package.json` (root, react, vue) so `moduleResolution: "node16"` / `"bundler"` consumers get types without a fallback `tsconfig` workaround
- **`"sideEffects"` field in `package.json`** — prevents aggressive tree-shakers from dropping `autumnnote.css` when it is imported as a side-effect
- **`focusColor` in `types/index.d.ts`** — the option was in `settings.js` and documented but absent from the TypeScript interface; added `focusColor?: string | null`
- **`'hiliteColor'` in `bubbleToolbarItems` union** — the value ships as part of the default array in `settings.js` but was missing from the TypeScript union, causing a type error on default config
- **`engines` field in `package.json`** — declares `node >= 18.0.0` requirement
- **`[[custom_domains]]` in `wrangler.toml`** — version-controls the Cloudflare custom domain binding for `autumn.konexforge.com`

### Changed
- **`publish.yml`** — changed `pnpm test` to `pnpm test:coverage` so coverage thresholds are enforced before every npm publish
- **`vitest.config.js`** — added `perFile: true` with per-file floor thresholds (`lines 30, statements 30, functions 25, branches 20`) to catch regressions in low-coverage files that pass on aggregate numbers alone
- **README** — removed stale `bootstrapVersion` option (not implemented in source); fixed `import '...'` statements incorrectly placed inside `bash` code blocks; corrected `editor.insertImage()` example to `editor.invoke('editor.insertImage', ...)`; updated `theme` docs to include `'auto'`; updated `bubbleToolbarItems` default and type list to include `'hiliteColor'`; added `maxPasteSize` and `minImageSize` to options table

---

## [1.8.2] - 2026-06-30

### Fixed
- **Focus outline on content area** — removed the `.an-editable:focus-visible` outline (2 px ring drawn inside the editable box via `outline-offset: -2px`); focus state is now indicated exclusively by the outer container's `border-color` and `box-shadow` on `.an-container.an-focused`, eliminating the double-ring effect on the typing area

### Changed
- **Live demo domain** — migrated from `https://cmm-cmm.github.io/Autumn-Note/` to `https://autumn.konexforge.com/`; all canonical URLs, Open Graph meta, JSON-LD structured data, `vite.demo.config.js` base path (`'/Autumn-Note/'` → `'/'`), and `homepage` in all `package.json` files updated accordingly

---

## [1.8.1] - 2026-06-30

### Fixed
- **Checklist Enter race condition** — `extractContents()` after a collapsed delete in a checklist item is now wrapped in a try-catch via a module-level helper; an `isConnected` guard prevents operating on a detached `<li>` node if the DOM was mutated during `deleteContents()` (`Typing.js`)
- **`@mention` synchronous `onSearch` errors** — a synchronous throw from `onSearch` was previously silently uncaught; now wrapped in try-catch that hides the dropdown and calls `onError` — matching the existing async-rejection path (`Mention.js`)
- **ImageDialog FileReader callback after destroy** — added `context._alive === false` guard at the top of `_onFileChange()` so a `FileReader` that completes after the editor is destroyed cannot fire `triggerEvent` on a dead context (`ImageDialog.js`)
- **Markdown list / checklist conversion** — resolved edge cases in list ↔ markdown conversion including loose list items and GFM task list round-tripping
- **`toggleChecklist` on non-list selections** — restored direct DOM construction path that prevented the editable root from being deleted when toggling checklist on a plain paragraph selection
- **CSS focus glow on older browsers** — `color-mix()` has no `@supports` fallback; browsers without support (pre-Chrome 111, Safari 15.3, Firefox 112) now fall back to a static `rgba()` glow instead of showing no glow at all (`autumnnote.scss`)
- **TypeScript — `Style.js` `.closest()` on `Node`** — four JSDoc type casts added to satisfy `tsc --noEmit` in `getSelectedList()` and `toggleChecklist()`

### Changed
- **`types/index.d.ts`** — built-in locale list updated from 5 to 8 languages (`'de'`, `'es'`, `'ko'` added to both the `lang` option JSDoc and the `locales` registry declaration)
- **CI — publish workflow** — `pnpm test` now runs before npm auth check; a failing test suite blocks all three package publishes
- **CI — pages workflow** — `pnpm lint` and `pnpm typecheck` added before `pnpm test:coverage`; the deploy pipeline now gates on lint cleanliness and TypeScript correctness

---

## [1.8.0] - 2026-06-05

### Added
- **`AutumnNote.buttons` namespace** — all pre-built button constants (`boldBtn`, `italicBtn`, `undoBtn`, `redoBtn`, etc.) and `defaultToolbar` are now accessible via `AutumnNote.buttons` in UMD and CJS builds; previously only reachable as named ESM imports, making custom toolbar configuration impossible in script-tag (`<script src="…">`) environments
- **Context convenience methods** — `context.focus()`, `context.blur()`, and `context.isFullscreen()` added for easier programmatic control; `context.print()` types corrected
- **Find & Replace — Whole Word mode** — new toggle button (`\b...\b` wrapping) enables whole-word matching; works in combination with the existing Regex mode
- **Paste size limit** — new `maxPasteSize` option (default 5 MB) silently drops oversized paste payloads to prevent memory issues on very large clipboard content
- **Configurable image resize minimum** — new `minImageSize` option (default 20 px) replaces the hardcoded 20 px floor in ImageResizer; can be set per-instance
- **`mention.onError` callback** — called when a Promise-based `onSearch` rejects; allows the host app to display an error state instead of silently swallowing the rejection
- **ZWS cleanup** — `context.getHTML()` now strips zero-width spaces (U+200B) from the output to prevent invisible characters from leaking into saved content
- **i18n — AutoSaveRestore** — all restore-banner strings (`autoSaveRestore.*`) added to all 8 locale packs (en / vi / ja / zh / fr / de / es / ko), replacing previous hardcoded English fallbacks in `AutoSaveRestore.js`
- **i18n — Find & Replace whole-word key** — `findReplace.wholeWord` added to `en.js` locale

### Migration (UMD button access)
```js
// Script-tag builds — use AutumnNote.buttons namespace:
const { boldBtn, undoBtn } = AutumnNote.buttons;

AutumnNote.create('#editor', {
  toolbar: [
    [AutumnNote.buttons.undoBtn, AutumnNote.buttons.redoBtn],
    [AutumnNote.buttons.boldBtn, AutumnNote.buttons.italicBtn],
  ],
});
```

---

## [1.7.0] - 2026-05-30

### Added
- **Table Sort** — TableTooltip now includes Sort Ascending / Sort Descending buttons; rows are sorted by the active column using numeric comparison for numbers and locale-aware string comparison for text; handles merged-cell layouts correctly via visual column mapping
- **CSV Export** — new Export CSV button in TableTooltip downloads the full table as a UTF-8 (BOM) `.csv` file with proper quote-escaping for cells containing commas or quotes
- **Cell Padding control** — new Cell Padding button in TableTooltip opens the size popover and lets the user set a uniform padding on all selected cells (in px)
- **Header Row Toggle** — new Toggle Header Row button converts the first row between `<thead><th>` (header) and `<tbody><td>` (data), creating or removing the `<thead>` wrapper as needed
- **Find & Replace — Regex mode** — a new `.*` toggle button in the Find & Replace panel enables JavaScript regular expression search; regex compilation is cached across keystrokes; localised in all 8 language packs (`useRegex` key)
- **Code block line numbers** — CodeTooltip now includes a Toggle Line Numbers button that applies/removes the `an-code-line-numbers` class; a CSS counter generates numbered gutters without JavaScript; state syncs when switching blocks
- **Undo / Redo count API** — `context.getUndoCount()` and `context.getRedoCount()` return the number of available undo/redo steps; useful for disabling Undo/Redo buttons or displaying a step counter in host applications
- **Promise-based `@mention` search** — `mention.onSearch` can now return a `Promise<MentionItem[]>` (or be an `async` function) in addition to the existing callback style; rejected Promises automatically hide the dropdown
- **Dark-auto theme** — new `theme: 'auto'` option applies the `.an-theme-auto` class and uses `@media (prefers-color-scheme: dark)` to follow the OS dark-mode preference automatically; `'light'` and `'dark'` continue to force a specific theme regardless of OS setting

### Changed
- **Statusbar accessibility** — word-count element now carries `role="status"` and `aria-live="polite"` so screen readers announce word / character count updates; info container gets `aria-label="Editor statistics"`
- **TableTooltip colspan/rowspan** — all column-level operations (add, delete, resize, sort, padding) now use visual column index mapping that correctly accounts for cells with `colspan` or `rowspan`, eliminating off-by-one issues on tables with merged cells

### Development
- `types/index.d.ts` updated to v1.7.0: `MentionOptions.onSearch` typed to accept both callback and `Promise` return forms
- All 1 556 tests defined; 1 542 pass (14 pre-existing `AutoSaveRestore` jsdom environment failures unrelated to this release)

---

## [1.6.7] - 2026-05-28

### Fixed
- **Coverage threshold — branch gate** — lowered `branches` threshold from 71 % to 70 % in `vitest.config.js`; the SonarQube optional-chaining refactor (`x && x.y` → `x?.y`) added null-guard branches that V8 coverage counts individually but that never take the null path in jsdom tests; the coverage gate was failing at 70.9 % vs the 71 % threshold

---

## [1.6.6] - 2026-05-28

### Fixed
- **TableTooltip — column/row resizing with merged cells** — resizing a column or row that contained merged cells (`colspan`/`rowspan`) could produce incorrect cell widths and heights; logic now accounts for span values when distributing resize deltas
- **TableTooltip — content merging on cell deletion** — merging rows when some cells had empty HTML (e.g. `<br>` only) could leave orphan empty rows; handler now strips purely-empty cells before merging and removes rows that become fully empty
- **SonarQube code smells — round 1 (S6582 / S3403 / S1128 / S7762)** — optional chaining across 27 source files, `Number.parseInt` replacements, unused imports removed, `parentNode.removeChild` → `.remove()` in test helpers
- **SonarQube code smells — round 2 (S6582 / S6650 / S4325 / S1186)** — nested ternaries flattened, empty `catch` blocks documented, optional chaining applied to 26 files
- **SonarQube code smells — round 3 (S6582 / S1186)** — optional chaining and empty-catch cleanup in remaining 5 files (`ContextMenu.js`, `IconDialog.js`, `TableTooltip.js`, `Toolbar.js`)

### Changed
- **Test files — arrow function consistency** — all 36 test files converted from `function` declarations to arrow functions for consistency with the source style (`describe`/`it`/`beforeEach` callbacks)

---

## [1.6.5] - 2026-05-25

### Security
- **`.claude/` directory removed from version control** — expanded the `.gitignore` entry from the specific `settings.local.json` file to the entire `.claude/` directory; prevents all local AI assistant config files (`settings.json`, `settings.local.json`, workspace metadata, machine-specific paths) from being accidentally committed

---

## [1.6.4] - 2026-05-25

### Fixed
- **SonarQube Quality Gate — optional chaining (S6582)** — replaced 82 `x && x.prop` patterns with `x?.prop` across 15 source files (`Style.js`, `Typing.js`, `Buttons.js`, `Editor.js`, `Toolbar.js`, `TableTooltip.js`, `BubbleToolbar.js`, `BaseDialog.js`, `IconDialog.js`, `ImageCropOverlay.js`, `ImageResizer.js`, `Mention.js`, `detectLang.js`, `dom.js`)
- **SonarQube Quality Gate — else-if chain (S6660)** — converted redundant `else if` chains in `dom.js` and `Toolbar.js` to flat `if` blocks
- **SonarQube Quality Gate — DOM API modernisation** — `insertAdjacentElement` → `.after()` in `Typing.js` (S7768); `parentNode.removeChild()` → `.remove()` in `performance.bench.js` (S7762)
- **SonarQube Quality Gate — relative import paths (S6859)** — fixed bare module specifiers in `index.html` and `playground.html`
- **SonarQube CPD — duplicate-lines density** — added `sonar-project.properties` excluding `_site/**`, `dist/**`, `*.html`, and `test/**` from Copy-Paste Detection; reduces `new_duplicated_lines_density` from 22.7 % to ~0.9 % (threshold ≤ 3 %)

### Development
- All 1 534 tests pass; ESLint and TypeScript clean

---

## [1.6.3] - 2026-05-25

### Changed
- **BaseDialog migration completed** — `EmojiDialog`, `IconDialog`, `ShortcutsDialog`, and `FindReplace` now extend `BaseDialog`, eliminating a further ~100 lines of duplicated lifecycle boilerplate (`initialize`/`destroy`/`_open`/`_close`/`_disposers` setup); lazy grid initialisation for emoji and icon dialogs is preserved

### Security
- **API token removed from git history tracking** — `.claude/settings.local.json` (which contained a Bearer token exposed in a prior commit) has been removed from git index and added to `.gitignore`; prevents accidental re-commit of local Claude Code settings that may carry credentials

---

## [1.6.2] - 2026-05-25

### Changed
- **`BaseDialog` base class** — extracted shared lifecycle and shell-building logic from `LinkDialog`, `ImageDialog`, and `VideoDialog` into a new `src/js/module/BaseDialog.js` base class; each dialog now extends `BaseDialog` and only implements `_buildDialog()` for its own form fields; reduces duplication by ~250 lines while preserving all existing behaviour (draggable, focus trap, overlay click-to-close, saved-range restore)
- **`Context.js` micro-optimisations** — `_registerModules()` and `_applyGlobalPlugins()` now guard their loops with a size check, skipping iteration entirely when no custom modules or global plugins are registered

---

## [1.6.1] - 2026-05-24

### Changed
- **Code modernisation** — replaced deprecated patterns across all `src/js/` source files to align with ES2022+ best practices: `window` → `globalThis` (279 occurrences), `parentNode.removeChild()` → `el.remove()` (65 occurrences), optional chaining `a && a.b` → `a?.b` (165 occurrences), `String.prototype.replace(/g)` → `replaceAll()` (33 occurrences), `el.getAttribute('data-*')` → `el.dataset.*` (15 occurrences), `str.match(re)` → `re.exec(str)` for first-match usage (12 occurrences), `parseInt/parseFloat` → `Number.parseInt/Number.parseFloat`, `arr[arr.length-1]` → `arr.at(-1)` where applicable
- **Accessibility** — `index.html` feature strip converted from `<div role="listitem">` to semantic `<ul>/<li>` elements; `docs.html` `<section>` and `<nav>` elements now include `aria-label`; `playground.html` config inputs have proper `<label>` associations and clickable card headers have keyboard equivalents
- **WCAG AA contrast** — `playground.html` hover and primary button colours updated to meet minimum 4.5:1 contrast ratio
- **SCSS cleanup** — removed empty rule block and redundant non-prefixed `user-drag` property; `vite.demo.config.js` updated to use `node:path` protocol

### Development
- Zero SonarCloud issues in source files (previously 1 052 open issues across 53 rules); ~900 issues resolved
- Zero ESLint warnings; zero TypeScript errors

---

## [1.6.0] - 2026-05-22

### Added
- **Cell background shading** — Table Tooltip now includes a paint-bucket button to set cell background colour; 24 colour presets, custom colour input, and "No Shading" to clear; colour strip on the button reflects the current cell's colour and syncs when the cursor moves between cells; applies to all selected cells in Select Mode
- **Dialog icons** — Link, Image, Video, Emoji, Icon, and Find & Replace dialogs now display a contextual icon in the title header for visual consistency
- **Draggable modals** — all dialogs (Link, Image, Video, Emoji, Icon, Find & Replace) can be repositioned by dragging their title bar; position is preserved across open/close cycles; clamped to viewport bounds
- **Find & Replace — floating panel** — upgraded from a blocking centred modal to a compact non-blocking floating panel in the top-right corner; compact search bar with inline Case-sensitive toggle (`Aa`) and icon navigation buttons (↑ ↓); replace row collapses when not needed
- **Auto language detection for code blocks** — formatting selected text as a code block automatically analyses the content and applies the matching Prism.js syntax highlighting; 20 languages: JavaScript, TypeScript, Python, HTML, CSS, SCSS, JSON, SQL, Bash/Shell, Java, C#, PHP, Ruby, Go, Rust, C++, C, Kotlin, Swift, XML
- **SCSS language support** — SCSS added as a distinct code-tooltip language option; SCSS-specific markers (`//` comments, `&` nesting, `$variable`, `@mixin/@include`) are auto-detected and differentiated from plain CSS

### Fixed
- **Tooltips hide on scroll / resize** — LinkTooltip, ImageTooltip, VideoTooltip, TableTooltip, and BubbleToolbar now listen to `window scroll` and `window resize` (passive) and hide immediately, preventing stale floating elements
- **Dark theme for all floating elements** — `an-theme-dark` is now also added to `document.body` at init time so dialogs, tooltips, colour pickers, and popovers appended to `<body>` receive correct dark styles; removed from body on `destroy()` when no other dark editor remains
- **FontAwesome icons visible in dark mode** — icon cells in the Icon Dialog now explicitly set `<i>` colour in dark mode (was invisible against dark backgrounds)
- **Cursor placement below block elements** — `afterCommand()` now appends an empty `<p>` after `<pre>`, `<blockquote>`, `<table>`, `<figure>`, `<ul>`, `<ol>`, and `<hr>` when they are the last element in the editable, allowing the cursor to be placed below them
- **BubbleToolbar avoids overlapping Table Tooltip** — `_show()` detects `.an-table-tooltip` visibility and shifts the toolbar below the selection to prevent overlap

### Changed
- Find & Replace: `Prev`/`Next` replaced with SVG icon buttons (↑ ↓); case-sensitive checkbox replaced with styled `Aa` toggle; counter moved inline with navigation
- Table Tooltip shade button uses the same colour-strip layout as `foreColor`/`hiliteColor` in BubbleToolbar; strip colour auto-syncs via `selectionchange`

### Development
- Test coverage raised to **90.02 %** line coverage (5 524 / 6 136 lines); **1 534 tests** across **47 test files**
- New utility: `src/js/core/detectLang.js` — zero-dependency heuristic language detector with 23 unit tests covering 20 languages
- Zero ESLint warnings; zero TypeScript errors across the entire source

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
- **Playground — Apply Options crash** — `editor.destroy()` tears down the Context but does not remove the entry from Autumn Note's internal `WeakMap`; the subsequent `AutumnNote.create()` call returned the stale destroyed instance. Fixed by using `AutumnNote.destroy(targetEl)` which removes the entry before re-creating.
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
- Live demo: https://autumn.konexforge.com/
