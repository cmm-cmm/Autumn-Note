# Security audit, run 1 (2026-10-19): partial results

**Status: incomplete.** Hunting stopped early at the owner's request, during wave 4. No candidate below has been through independent validation (Phase 3) or final record verification (Phase 5). Treat every item as a **lead with evidence**, not a confirmed vulnerability. The proposed severities are the hunters' own and may change once a separate verifier reviews them.

- Source reviewed: commit `b1e22ea` (clean worktree), the whole repository.
- Profile: `standard` (coverage ledger, hunter waves, post-wave coverage critics).
- Execution: source review, plus bounded local checks only. All target code ran inside a sandbox: bubblewrap with no network, an empty environment, a read-only host, a size-capped tmpfs, CPU, memory, process, file-size and wall-clock limits. Real-browser checks used the cached Chromium headless-shell 1243 inside that sandbox, loading `dist/autumnnote.umd.js`. Nothing contacted the deployed demo, npm, GitHub or any other service.
- No prior audit run existed.

## Upstream context (cmm-cmm/Autumn-Note)

This repository is a fork of `cmm-cmm/Autumn-Note`. I checked its issues, pull requests, discussions and security advisories on 2026-10-19:

- **Security advisories:** none published.
- **Discussions:** one welcome post only, with no security discussion.
- **Issues #64, #65, #66 and #67** (all closed) reported sanitiser bypasses:
  - `<template>` content was not sanitised;
  - the `style` attribute was not filtered;
  - `<link>` and `<meta>` were not prohibited;
  - SVG `xlink:href` was not checked for `javascript:`.
- **PR #72** fixed all four in v1.11.1. This run re-checked them as regression targets, and all four stay fixed (`src/js/core/sanitise.js` `PROHIBITED_TAGS`, `URL_ATTRS`, `sanitiseStyleValue`).
- **CHANGELOG** mentions a Bearer token that was once exposed in an upstream commit (`9891d8d`) of `.claude/settings.local.json`. That commit is not in this clone, so the token's revocation cannot be checked from here. **The owner should confirm the token was revoked.**

## Candidates (unvalidated)

The full records, traces, reproduction inputs and sandbox outputs are kept outside the repository, in the local run directory (see "Resuming" below). **This public document deliberately leaves out working payloads**, because none of these issues is fixed yet.

| # | Proposed | Area | Summary |
|---|---|---|---|
| 1 | high | Undo history | Image data-URL token substitution on undo/redo can turn sanitised content into an event-handler attribute |
| 2 | high | `getHTML()` export | String cleanup of serialised HTML can turn inert comment or raw-text content into live markup |
| 3 | low | Mention | The default mention chip interpolates `item.id` and `item.label` as raw HTML |
| 4 | low | Paste | Quadratic regex backtracking in paste pre-cleaning and Markdown detection |
| 5 | low | Markdown load | Unbounded blockquote recursion in `markdownToHTML` (quadratic time, `RangeError`) |
| 6 | needs validation | Sanitiser | Kept `name`/`id` attributes can clobber `document` built-ins |
| 7 | needs validation | Drop | A non-file HTML drag into the editor bypasses the editor sanitiser |
| 8 | needs validation | Raw-text elements | Text inserted into kept `xmp`/`noembed`/`noframes` becomes markup at later re-parse sites |
| 9 | needs validation | `getHTML()` / print | The blob-to-data-URL splice in `resolveImages` is not attribute-escaped |
| 10 | needs validation | Markdown export | `htmlToMarkdown` emits text-node `<`, `>` and fence breaks as raw HTML |

### 1. Undo/redo token substitution injects attributes (proposed high)

- **Where:** `src/js/editing/History.js`:
  - `_tokenizeImages` (around line 220);
  - `_detokenizeImages` (around line 239);
  - `_restore` (around line 197).
- **Root cause:**
  - Snapshots replace `data:…;base64,…` runs with predictable `__asn_img_N__` tokens. They do this with a regex over the whole serialised HTML, and that regex can also match text content.
  - Restore then replaces every occurrence of each token anywhere in the string, including tokens a content author typed into an attribute value.
  - The result is assigned to `editable.innerHTML` without being sanitised again.
- **Effect seen in the sandbox (jsdom):** lower-trust HTML loaded with `setHTML()` had no `onerror` attribute. After one edit and an undo, an `<img>` carried an attacker-chosen `onerror`, and `getHTML()` exported it.
- **Conditions:**
  - attacker HTML reaches the editor (the demo playground restores HTML from a share link);
  - the victim edits once and presses undo;
  - the host page has no CSP that blocks inline handlers.
- **Fix direction:**
  - Tokenise only `img src` attribute values that match the safe raster data-URL pattern.
  - Use a random per-instance token prefix.
  - Restore only the tokens this instance created.
  - Re-sanitise, or adopt nodes, before writing to the live editable.

### 2. `getHTML()` string cleanup creates live markup (proposed high)

- **Where:**
  - `src/js/module/Editor.js`: `EMPTY_INLINE_RE` and `stripEmptyInline` (around line 24), `getHTML` (around line 479);
  - `src/js/Context.js`: `getHTML` (around line 509), `print` (around lines 730-753);
  - `src/js/core/sanitise.js`: `PROHIBITED_TAGS` (around line 25).
- **Root cause:**
  - `getHTML()` removes U+200B and empty inline elements from the serialised string with plain string and regex replacement.
  - The sanitiser keeps comment nodes and the raw-text elements `xmp`, `noembed`, `noframes` and `plaintext`. The browser serialises their content without escaping.
  - Removing a filler character inside such content can therefore create a real terminator (`-->` or `</xmp>`). That exposes markup the sanitiser never saw.
- **Effect seen in real Chromium:** for five payload variants, the editable stayed inert after `setHTML()`. When the `getHTML()` output was parsed again in a page, its injected handlers ran. Controls without the filler stayed inert.
- **Sinks:**
  - `print()` (a same-origin `blob:` window, and the Print button is in the default toolbar);
  - `exportDocument` / `downloadHTML`;
  - the textarea sync used for form submission;
  - change events;
  - collaboration and autosave output.
- **Fix direction:**
  - Clean a cloned DOM instead of the string: remove U+200B only from text nodes, and remove empty inline elements as nodes.
  - Drop comment nodes and prohibit `xmp`, `noembed`, `noframes` and `plaintext` in the sanitiser.

### 3. Mention chip HTML injection (proposed low)

- **Where:** `src/js/module/Mention.js` `_select` (around line 357).
- **Root cause:** the default chip is built as an HTML string from `item.id` and `item.label` with no escaping. That string goes to `insertHTML`, which applies only the general content sanitiser.
- **Effect seen in real Chromium:**
  - a display name returned by the host's `onSearch` injected a link and a remote image after the chip;
  - it also overrode the chip's `contenteditable`;
  - the sanitiser stopped script execution.
- **Fix direction:** escape `id` and `label`, or build the chip with DOM APIs. The README `onInsert` example has the same pattern.

### 4. Quadratic regexes on pasted content (proposed low)

- **Where:**
  - `src/js/module/Clipboard.js` `_cleanWordHtml` (around lines 117-137);
  - `src/js/core/markdown.js` `isMarkdown` (around line 352) and `LINK_RE` / `IMAGE_RE` (around lines 976-977);
  - the bracket-reference regexes (around lines 1023 and 1029);
  - the underline regex (around line 1086).
- **Effect:** runtime grows about four times per doubling of input. The only bound is `maxPasteSize` (5 MB), so content copied from a hostile page can freeze the editor tab. `setMarkdown()` reaches the same regexes with no size cap at all.
- **Fix direction:**
  - Do the Word cleanup on the parsed DOM.
  - Exclude `[` from label classes, and stop `<u>` scans at the next opener.
  - Cap how much input `isMarkdown` inspects.

### 5. Blockquote recursion (proposed low)

- **Where:** `src/js/core/markdown.js` `_parseBlocks`, blockquote branch (around lines 524-531).
- **Effect seen in real Chromium:** nesting is quadratic in time. About 8,000 nested `>` markers (8 KB) throw `RangeError` out of `setMarkdown()`, so the document never loads.
- **Fix direction:** count markers once per line, cap the nesting depth (for example at 100), and treat deeper markers as text.

### 6-10. Leads that need validation

**6. Document clobbering (`src/js/core/sanitise.js` attribute loop)**
- **Lead:** `name`/`id` values such as `createElement` or `head` are kept. In a real browser they could shadow `document` methods and break the editor and the host page.
- **Blocker:** jsdom does not implement document named properties. The next step is a real-browser check, which is now possible with the sandbox runner.

**7. Native HTML drop (`src/js/module/Clipboard.js` `_onDrop`, around line 393)**
- **Lead:** non-file drops are left to the browser's own drop, with no editor sanitising.
- **Blocker:** whether browsers strip handlers and `javascript:` URLs on a cross-origin drag is not yet established.

**8. Raw-text elements plus text insertion (`src/js/core/sanitise.js`, `src/js/editing/insert.js`)**
- **Lead:** text inserted inside a kept `xmp` element became live markup at the table-merge, header-toggle, checklist and code-language re-parse sites in Chromium.
- **Blocker:** a cross-principal writer (paste or drop into that element) is not yet shown. The hunter for this was stopped before it returned.

**9. `resolveImages` splice (`src/js/module/Clipboard.js`, around line 690)**
- **Lead:** registry data URLs are spliced into the `src` attribute without escaping.
- **Blocker:** whether a real `FileReader` keeps a quote from `File.type` was not observed.

**10. Markdown export (`src/js/core/markdown.js`, around lines 91, 158 and 235)**
- **Lead:** inert text such as `&lt;img …&gt;` is exported as raw HTML.
- **Blocker:** the impact depends on the host rendering the exported Markdown with raw HTML enabled.

## Coverage

There are 23 coverage units in the ledger.

| Status | Count | Units |
|---|---|---|
| covered | 12 | see below |
| candidate | 9 | the units behind the candidates above |
| deferred | 1 | paste or drop into raw-text elements; the hunter was stopped |
| not applicable | 1 | host-supplied markup options (`icons`, `fontAwesomeClass`, context-menu icons) are host-trusted by design |

The 12 covered units were reviewed and no candidate came out of them:
- the sanitiser rules (58-payload mXSS re-parse matrix, upstream #64-#67 regressions);
- content load paths;
- `format.js` transforms (360 real-browser runs);
- URL consumers (link tooltip, image and video dialogs, Prism language URL);
- autosave storage;
- the demo share link (sanitised) and demo framing;
- CI workflows (`pull_request` only, SHA-pinned actions, OIDC publish limited to release events);
- CI cache scoping;
- runtime CDN loading;
- repository secrets and debug exposure;
- a wildcard pass.

Three post-wave coverage critics ran. The final "clean" critic did not run, so **this run does not claim complete coverage.**

## Hardening notes (not findings)

**Sanitiser and HTML handling**
- Prohibit `xmp`, `noembed`, `noframes` and `plaintext`, and drop comment nodes.
- Replace the remaining serialise-then-reparse sites with node moves: `insert.js:83`, `Codeview.js:74`, `renderer.js:46`, `Style.js:223/585`, `CodeTooltip.js:373` and `TableTooltip.js:827/1297/1313`.
- Re-check hrefs with `sanitiseUrl` in `LinkTooltip._openLink` before `window.open`.
- Limit the SVG image-upload fallback in `_compressImage` to raster types.

**Exports**
- Neutralise leading `=`, `+`, `-`, `@` in CSV export cells.

**Runtime assets and autosave**
- Add Subresource Integrity for the pinned default Prism and Font Awesome CDN assets.
- Load the autosave draft at mount only through the restore and timeout logic.
- Recommend a per-user `autoSaveKey`.

**Demo site**
- Add `X-Frame-Options` / `frame-ancestors`, a CSP, `X-Content-Type-Options` and `Referrer-Policy` to `public/_headers`.

**CI and release**
- Pin the npm version used in `publish.yml`.
- Give the publish job a protected environment.
- Add an explicit `permissions: contents: read` to `ci.yml`.

## Resuming

The local run directory is `~/security-audit-skill/Autumn-Note/run-1/`. It is not in this repository. It holds:

- `run-metadata.json`, with `run_status: incomplete`;
- `architecture.md`;
- `coverage-ledger.json` (it passes the skill's `validate-coverage-ledger.cjs`);
- `results/` (hunter results and `candidates.json`);
- `agents/*/artifacts/` (promoted sandbox outputs);
- `tools/` (sandbox and browser runners, the artifact promoter, prompt builders).

Next steps, in order:

1. Run a fresh hunter for the deferred unit (paste or drop into raw-text elements).
2. Run the final clean coverage critic.
3. **Phase 3:** give each of the 10 candidates to an independent verifier. Use the sandboxed Chromium runner to resolve the browser-only blockers (items 6, 7 and 9).
4. Write `findings.json` and validate it with `validate-findings.cjs`.
5. **Phase 5:** run final record verification.
6. Write the reports.
7. Fix the confirmed findings, starting with #2 and #1. Each fix needs a regression test in `test/`.
