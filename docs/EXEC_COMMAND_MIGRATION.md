# `execCommand` Migration

Autumn Note currently centralizes most formatting through `Style.execCommand`, with a small number of direct calls in editor modules. Browser support remains adequate, but `document.execCommand()` is deprecated and must not be used for new features.

## Migration order

1. Replace insertion commands (`insertHTML`, `insertText`, horizontal rules) with `Range.deleteContents()` and `Range.insertNode()`. Preserve selection and dispatch the existing change event once per operation.
2. Replace link creation/removal with range extraction plus `<a>` wrapping/unwrapping. Continue routing URLs through the shared sanitizer.
3. Replace block/list commands with DOM transforms scoped to the selected blocks. Preserve checklist and nested-list behavior.
4. Replace inline formatting with semantic element wrapping and explicit normalization of overlapping ranges.
5. Retain `execCommand` behind a compatibility adapter until equivalent browser tests pass, then remove the adapter.

Each stage must keep the public `Context.invoke('editor.*')` API unchanged and add Chromium, Firefox, WebKit, jsdom, undo/redo, collapsed-selection, multi-block-selection, and paste regression coverage.

## Status

| Stage | State |
|---|---|
| 1. Insertion commands | **Done** — 2.5.0 |
| 2. Link creation/removal | Not started |
| 3. Block/list commands | Not started |
| 4. Inline formatting | Not started |
| 5. Remove the adapter | Blocked on 2–4 |

### Stage 1 as shipped

`src/js/editing/insert.js` holds `insertHTMLNative`, `insertTextNative` and `insertHorizontalRuleNative`. `Style.execCommand` tries the native path first and falls back to `document.execCommand` for everything else:

```js
if (cmd === 'insertHTML' && insertHTMLNative(String(value ?? ''))) return true;
if (cmd === 'insertText' && insertTextNative(String(value ?? ''))) return true;
if (cmd === 'insertHorizontalRule' && insertHorizontalRuleNative()) return true;
return document.execCommand(cmd, false, value);
```

Two conventions the later stages should follow:

- **Report failure, do not throw.** Each function returns `false` when there is no usable selection, and that return value *is* the compatibility adapter — the caller falls back rather than losing the edit.
- **Refuse selections outside editable content.** `Style.execCommand` does not know which editor instance it is acting for, and `document.execCommand` is itself a no-op outside a contenteditable host. Without that check a stale selection elsewhere in the page would be written into.

Because `insertHTML` is the substrate for paste, drop, slash-menu insertion, upload placeholders and most toolbar buttons, stage 1 is exercised far beyond its own tests — the whole suite is regression coverage for it.
