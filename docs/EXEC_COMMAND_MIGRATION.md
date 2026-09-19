# `execCommand` Migration

**Status: complete.** Autumn Note no longer calls `document.execCommand`, `document.queryCommandState` or `document.queryCommandValue` anywhere. Every command is a DOM transform the editor performs itself, and the result is the same on Chromium, Firefox, WebKit and jsdom.

`document.execCommand()` is deprecated, and it was also the source of cross-engine bugs: Chromium wrote `<b>` where others wrote `<span style>`, fonts came out as `<font>` tags, `queryCommandState('underline')` was wrong inside `<code>`, and Firefox merged a list item into the one above it on outdent.

## Where things live

| Concern | Module |
|---|---|
| Insertion: HTML, text, line breaks, horizontal rules | `src/js/editing/insert.js` |
| Inline formats, styles (colour, highlight, font, size), links, blocks, alignment, lists, indentation, and the state queries | `src/js/editing/format.js` |
| Command names, checklists, inline code, line height | `src/js/editing/Style.js` |
| Copy and cut | `src/js/core/clipboard.js` (async Clipboard API) |

`Style.execCommand(name, value)` still exists for plugins and keeps the `document.execCommand` command names (`bold`, `foreColor`, `formatBlock`, `insertHTML`, …), but it dispatches to the functions above. An unknown name logs a warning and returns `false`.

## How the formatting engine works

Inline commands share one technique:

1. Split the selection into **runs**, one per leaf block it touches.
2. **Split** every inline ancestor at the run's two ends, so the selected content becomes whole children of the block.
3. **Wrap or unwrap** those children.
4. **Merge** adjacent elements that are now identical, healing the splits.

The selection is carried across as character offsets from the editing host, which none of these steps change.

A collapsed selection (a caret) formats what is typed next: the engine opens an empty element held open by a zero-width space and puts the caret in it. `absorbPlaceholder()` drops that space once real text is typed, and `getHTML()` strips both the space and any placeholder left empty.

State is read from the DOM (`isInlineActive`, `currentBlockTag`, `currentFontFamily`), so a toolbar button shows exactly what its command toggles. `<b>`/`<strong>` and `font-weight: bold` count as bold, and so on for the other formats. Headings are not reported as bold.

## Output

| Command | Before (varied by engine) | Now |
|---|---|---|
| Bold, italic, underline | `<b>`, `<i>`, `<u>` or styled spans | `<b>`, `<i>`, `<u>` |
| Strikethrough | `<strike>` | `<s>` |
| Text colour, highlight | `<font color>` or `<span style>` | `<span style="color: …">`, `<span style="background-color: …">` |
| Font family | `<font face>` | `<span style="font-family: …">` |
| Font size | `<font size="7">`, rewritten to a span | `<span style="font-size: …">` |
| Indent a paragraph | `<blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;">` | `margin-left: 40px` on the block (`margin-right` in RTL) |
| Indent a list item | a sublist beside the item, then repaired | a sublist inside the item above |
| Outdent a top-level list item | engine-dependent | a paragraph |

Existing content keeps working: the engine reads `<strong>`, `<em>`, `<strike>`, `<del>`, `<font>` and styled spans, and outdenting content inside the old borderless blockquote unwraps it. The sanitiser allows `font-family`, `margin-left` and `margin-right` in inline styles so the new output survives `setHTML()`, paste and auto-save restore.

## Conventions

- **Report failure, do not throw.** Each function returns `false` when there is no usable selection.
- **Refuse selections outside editable content.** Without an explicit editable, a command only acts inside *some* contenteditable host, so a stale selection elsewhere on the page is never written into.
- **Test in jsdom and on every engine.** `test/editing/format.test.js` covers the transforms and the selection they leave. `test/browser/format.browser.test.js` runs the same suite on Chromium, Firefox and WebKit, and adds real typing after a formatting command.

## History

| Stage | Shipped |
|---|---|
| 1. Insertion commands (`insertHTML`, `insertText`, `insertHorizontalRule`, `insertLineBreak`) | 2.5.0 – 2.7.0 |
| 2. Link creation and removal | Unreleased |
| 3. Block and list commands | Unreleased (nested-item outdent was already native) |
| 4. Inline formatting and style queries | Unreleased |
| 5. Adapter removed, copy/cut on the Clipboard API | Unreleased |
