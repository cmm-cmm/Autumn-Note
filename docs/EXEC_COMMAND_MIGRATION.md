# `execCommand` Migration

Autumn Note currently centralizes most formatting through `Style.execCommand`, with a small number of direct calls in editor modules. Browser support remains adequate, but `document.execCommand()` is deprecated and must not be used for new features.

## Migration order

1. Replace insertion commands (`insertHTML`, `insertText`, horizontal rules) with `Range.deleteContents()` and `Range.insertNode()`. Preserve selection and dispatch the existing change event once per operation.
2. Replace link creation/removal with range extraction plus `<a>` wrapping/unwrapping. Continue routing URLs through the shared sanitizer.
3. Replace block/list commands with DOM transforms scoped to the selected blocks. Preserve checklist and nested-list behavior.
4. Replace inline formatting with semantic element wrapping and explicit normalization of overlapping ranges.
5. Retain `execCommand` behind a compatibility adapter until equivalent browser tests pass, then remove the adapter.

Each stage must keep the public `Context.invoke('editor.*')` API unchanged and add Chromium, Firefox, WebKit, jsdom, undo/redo, collapsed-selection, multi-block-selection, and paste regression coverage.
