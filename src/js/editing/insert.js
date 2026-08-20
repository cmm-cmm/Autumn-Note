/**
 * insert.js — native replacements for the insertion `execCommand`s.
 *
 * Stage 1 of docs/EXEC_COMMAND_MIGRATION.md. `insertHTML`, `insertText` and
 * `insertHorizontalRule` are the easiest commands to leave behind: they do not
 * have to reason about overlapping inline formatting the way `bold` or
 * `fontName` do, so a Range-based implementation is a straight substitution
 * rather than a rewrite of the formatting model.
 *
 * Each function returns `false` when there is no usable selection, which is the
 * caller's signal to fall back to `document.execCommand`. That keeps the
 * compatibility adapter the migration doc asks for: nothing silently stops
 * working while the native paths are proven in browsers.
 *
 * The HTML given to `insertHTMLNative` is inserted as-is — callers sanitise
 * first, exactly as they did before.
 */

/**
 * The nearest ancestor that makes `node` editable, if there is one.
 *
 * Reads the attribute and falls back to the property, rather than using
 * `isContentEditable`: jsdom implements neither `isContentEditable` nor the
 * property/attribute reflection, so an editable built with
 * `el.contentEditable = 'true'` is only visible through the property there, and
 * one built from markup only through the attribute.
 * @param {Node|null} node
 * @returns {Element|null}
 */
function _editableHost(node) {
  let cur = node && node.nodeType === 1 ? /** @type {Element} */ (node) : node?.parentElement;
  while (cur) {
    const flag = cur.getAttribute?.('contenteditable') ?? /** @type {HTMLElement} */ (cur).contentEditable;
    if (flag === 'false') return null;
    // 'inherit' is the browser's answer for ordinary elements: keep climbing.
    if (flag != null && flag !== 'inherit') return cur;
    cur = cur.parentElement;
  }
  return null;
}

/**
 * The current selection range, but only when it is somewhere these functions
 * may write to.
 *
 * With an explicit `editable` that means inside it; without one it means inside
 * *some* contenteditable host. The second check matters: `Style.execCommand`
 * does not know which editor it is acting for, and `document.execCommand` is
 * itself a no-op when the selection sits outside editable content. Without the
 * check a stale selection elsewhere in the page would have the native path
 * cheerfully insert into it.
 * @param {HTMLElement|Document} [editable]
 * @returns {Range|null}
 */
function _usableRange(editable) {
  const sel = globalThis.getSelection?.();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (editable && editable !== document) {
    const root = /** @type {HTMLElement} */ (editable);
    return root.contains(range.commonAncestorContainer) ? range : null;
  }
  return _editableHost(range.commonAncestorContainer) ? range : null;
}

/**
 * Collapses the selection immediately after `node`.
 * @param {Node} node
 */
function _caretAfter(node) {
  const sel = globalThis.getSelection?.();
  if (!sel) return;
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Replaces the selection with `html`.
 * @param {string} html - already sanitised by the caller
 * @param {HTMLElement} [editable] - restricts the operation to this subtree
 * @returns {boolean} false when there is no usable selection
 */
export function insertHTMLNative(html, editable) {
  const range = _usableRange(editable);
  if (!range) return false;

  const template = document.createElement('template');
  template.innerHTML = html;
  const fragment = template.content;
  // Held before insertion: appending the fragment empties it.
  const lastNode = fragment.lastChild;

  range.deleteContents();
  range.insertNode(fragment);

  if (lastNode) _caretAfter(lastNode);
  return true;
}

/**
 * Replaces the selection with literal text.
 *
 * A newline becomes a `<br>`, which is what execCommand did and what
 * contenteditable expects — a raw "\n" in a text node renders as a space.
 * @param {string} text
 * @param {HTMLElement} [editable]
 * @returns {boolean} false when there is no usable selection
 */
export function insertTextNative(text, editable) {
  const range = _usableRange(editable);
  if (!range) return false;

  range.deleteContents();

  const value = String(text);
  const fragment = document.createDocumentFragment();

  // Inside preformatted content a newline is a newline; everywhere else it has
  // to become a <br>, because a raw "\n" in a text node renders as a space.
  if (!value.includes('\n') || _inPreformatted(range.startContainer, editable)) {
    fragment.appendChild(document.createTextNode(value));
  } else {
    value.split('\n').forEach((line, i) => {
      if (i > 0) fragment.appendChild(document.createElement('br'));
      if (line) fragment.appendChild(document.createTextNode(line));
    });
  }

  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  if (lastNode) _caretAfter(lastNode);
  return true;
}

/**
 * Inserts a soft line break without relying on execCommand('insertLineBreak').
 * Kept as a named operation so callers do not have to encode editing semantics
 * as an HTML string.
 * @param {HTMLElement} [editable]
 * @returns {boolean} false when there is no usable selection
 */
export function insertLineBreakNative(editable) {
  return insertTextNative('\n', editable);
}

/**
 * True when `node` sits in content that preserves whitespace.
 *
 * Checks the tag first because jsdom does not apply the UA stylesheet's
 * `white-space: pre` to `<pre>`, so the computed style alone would miss it.
 * @param {Node} node
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
function _inPreformatted(node, editable) {
  let cur = node.nodeType === 1 ? /** @type {Element} */ (node) : node.parentElement;
  while (cur && cur !== editable) {
    if (cur.tagName === 'PRE' || cur.tagName === 'TEXTAREA') return true;
    const ws = globalThis.getComputedStyle?.(cur)?.whiteSpace;
    if (ws && ws.startsWith('pre')) return true;
    cur = cur.parentElement;
  }
  return false;
}

/**
 * Inserts a horizontal rule at the selection.
 *
 * The rule is placed after the block the caret is in rather than inside it, and
 * a paragraph follows it so there is somewhere to type — a bare `<hr>` at the
 * end of the document leaves the caret with nowhere to go.
 * @param {HTMLElement} [editable]
 * @returns {boolean} false when there is no usable selection
 */
export function insertHorizontalRuleNative(editable) {
  const range = _usableRange(editable);
  if (!range) return false;

  const hr = document.createElement('hr');
  range.deleteContents();

  const block = _closestBlock(range.startContainer, editable);
  if (block && block.parentNode) {
    block.parentNode.insertBefore(hr, block.nextSibling);
  } else {
    range.insertNode(hr);
  }

  let after = hr.nextElementSibling;
  if (!after || after.tagName === 'HR') {
    const p = document.createElement('p');
    p.appendChild(document.createElement('br'));
    hr.parentNode?.insertBefore(p, hr.nextSibling);
    after = p;
  }

  const sel = globalThis.getSelection?.();
  if (sel) {
    const caret = document.createRange();
    caret.setStart(after, 0);
    caret.collapse(true);
    sel.removeAllRanges();
    sel.addRange(caret);
  }
  return true;
}

const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'LI']);

/**
 * Nearest block-level ancestor of `node`, stopping at `editable`.
 * @param {Node} node
 * @param {HTMLElement} [editable]
 * @returns {Element|null}
 */
function _closestBlock(node, editable) {
  let cur = node.nodeType === 1 ? /** @type {Element} */ (node) : node.parentElement;
  while (cur && cur !== editable) {
    if (BLOCK_TAGS.has(cur.tagName)) return cur;
    cur = cur.parentElement;
  }
  return null;
}
