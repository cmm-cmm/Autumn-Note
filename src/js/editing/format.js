/**
 * format.js — the editor's own formatting engine.
 *
 * Replaces `document.execCommand` for every formatting command (stages 2–5 of
 * docs/EXEC_COMMAND_MIGRATION.md). The API is deprecated, and its output and
 * state reporting differ between engines — `<b>` vs `<span style>`, `<font>`
 * tags, Firefox merging list items on outdent — so each command here is a DOM
 * transform whose result is the same everywhere, jsdom included.
 *
 * Inline commands share one technique:
 *   1. split the selection into runs, one per leaf block it touches;
 *   2. split every inline ancestor at the run's two ends, so the selected
 *      content becomes whole children of the block;
 *   3. wrap or unwrap those children;
 *   4. merge adjacent elements that are now identical, healing the splits.
 * The selection is carried across as character offsets, which none of these
 * steps change.
 *
 * Everything reports failure by returning false and never throws on odd DOM.
 */

import { usableRange, editableHost } from './insert.js';

// ---------------------------------------------------------------------------
// Node classification
// ---------------------------------------------------------------------------

const BLOCK_TAGS = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'CAPTION', 'DD', 'DETAILS', 'DIV', 'DL', 'DT',
  'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'SUMMARY',
  'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
]);

/** Inline elements that carry formatting and may be split, merged or unwrapped. */
const FORMATTING_TAGS = new Set([
  'A', 'B', 'BIG', 'CITE', 'CODE', 'DFN', 'EM', 'FONT', 'I', 'INS', 'KBD', 'MARK', 'Q',
  'S', 'SAMP', 'SMALL', 'SPAN', 'STRIKE', 'STRONG', 'SUB', 'SUP', 'TT', 'U', 'VAR', 'DEL',
]);

/** What "Remove format" strips — Chromium's list, minus links. */
const REMOVABLE_TAGS = new Set([
  'B', 'BIG', 'CITE', 'CODE', 'DEL', 'DFN', 'EM', 'FONT', 'I', 'INS', 'KBD', 'MARK', 'Q',
  'S', 'SAMP', 'SMALL', 'SPAN', 'STRIKE', 'STRONG', 'SUB', 'SUP', 'TT', 'U', 'VAR',
]);

/** Leaf content that can sit in a run besides text. */
const ATOMIC_INLINE = new Set(['IMG', 'BR', 'INPUT', 'IFRAME', 'VIDEO', 'AUDIO', 'CANVAS', 'SVG', 'svg']);

const ZWSP = '\u200B';

/** @param {Node|null} node @returns {node is Element} */
const isElement = (node) => !!node && node.nodeType === 1;

/** @param {Node|null} node */
export const isBlockNode = (node) => isElement(node) && BLOCK_TAGS.has(node.nodeName);

/**
 * Whether `el` is content rather than formatting: an element with nothing
 * inside it (a Font Awesome `<i class="fa-…">` icon) or a read-only island
 * (a mention). Unwrapping the first would delete it; merging either would
 * turn two into one.
 * @param {Element} el
 */
const isContentElement = (el) => !el.hasChildNodes() || el.getAttribute('contenteditable') === 'false';

/** @param {Node} node */
function indexOf(node) {
  let i = 0;
  for (let n = node.previousSibling; n; n = n.previousSibling) i++;
  return i;
}

/**
 * The nearest block ancestor of `node` (itself included), stopping at `host`.
 * @param {Node} node
 * @param {Element} host
 * @returns {Element}
 */
function leafBlock(node, host) {
  let cur = isElement(node) ? node : node.parentElement;
  while (cur && cur !== host) {
    if (BLOCK_TAGS.has(cur.nodeName)) return cur;
    cur = cur.parentElement;
  }
  return host;
}

/** True when `node` sits inside a contenteditable="false" island below `host`. */
function inReadOnlyIsland(node, host) {
  for (let cur = isElement(node) ? node : node.parentElement; cur && cur !== host; cur = cur.parentElement) {
    if (cur.getAttribute('contenteditable') === 'false') return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Selection bookkeeping (character offsets from the editing host)
// ---------------------------------------------------------------------------

/**
 * @param {Element} host
 * @param {Node} node
 * @param {number} offset
 */
function charOffset(host, node, offset) {
  const r = document.createRange();
  r.selectNodeContents(host);
  try { r.setEnd(node, offset); } catch { return 0; }
  return r.toString().length;
}

/**
 * The (text node, offset) at character `pos`. At a boundary between two text
 * nodes `preferLater` picks the second — a range start then lands inside the
 * text that follows it, and a range end (preferLater = false) inside the text
 * before it, so the selection hugs the content it was around.
 * @param {Element} host
 * @param {number} pos
 * @param {boolean} preferLater
 * @returns {[Node, number]|null}
 */
function pointAt(host, pos, preferLater) {
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  let count = 0;
  let last = null;
  let n;
  while ((n = walker.nextNode())) {
    const len = /** @type {Text} */ (n).length;
    if (preferLater ? pos < count + len : pos <= count + len) return [n, pos - count];
    count += len;
    last = n;
  }
  if (last) return [last, /** @type {Text} */ (last).length];
  return null;
}

/**
 * @param {Element} host
 * @param {Range} range
 */
function saveSelection(host, range) {
  return {
    start: charOffset(host, range.startContainer, range.startOffset),
    end: charOffset(host, range.endContainer, range.endOffset),
  };
}

/**
 * @param {Element} host
 * @param {{ start: number, end: number }} saved
 */
function restoreSelection(host, saved) {
  const collapsed = saved.start === saved.end;
  // A caret stays at the end of the text it followed.
  const s = pointAt(host, saved.start, !collapsed);
  const e = collapsed ? s : pointAt(host, saved.end, false);
  if (!s || !e) return;
  const r = document.createRange();
  try {
    r.setStart(s[0], s[1]);
    r.setEnd(e[0], e[1]);
  } catch { return; }
  setSelection(r);
}

/** @param {Range} range */
function setSelection(range) {
  const sel = globalThis.getSelection?.();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Places the caret at (node, offset).
 * @param {Node} node
 * @param {number} offset
 */
function setCaret(node, offset) {
  const r = document.createRange();
  r.setStart(node, offset);
  r.collapse(true);
  setSelection(r);
}

// ---------------------------------------------------------------------------
// Range walking
// ---------------------------------------------------------------------------

/**
 * Whether `range` selects at least one character of `text`.
 * @param {Range} range
 * @param {Text} text
 */
function selectsText(range, text) {
  if (!text.length) return false;
  if (text === range.startContainer && range.startOffset >= text.length) return false;
  if (text === range.endContainer && range.endOffset === 0) return false;
  try { return range.intersectsNode(text); } catch { return false; }
}

/**
 * Whether `range` contains the whole of `node`.
 * @param {Range} range
 * @param {Node} node
 */
function containsNode(range, node) {
  const parent = node.parentNode;
  if (!parent) return false;
  const i = indexOf(node);
  try {
    return range.comparePoint(parent, i) >= 0 && range.comparePoint(parent, i + 1) <= 0;
  } catch { return false; }
}

/**
 * The leaves (text nodes and atomic inline elements) the range covers, in
 * document order, outside read-only islands.
 * @param {Range} range
 * @param {Element} host
 * @returns {Node[]}
 */
function leavesIn(range, host) {
  const root = range.commonAncestorContainer;
  if (root.nodeType === 3) {
    return selectsText(range, /** @type {Text} */ (root)) && !inReadOnlyIsland(root, host) ? [root] : [];
  }
  const out = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeType === 3) {
      if (selectsText(range, /** @type {Text} */ (n)) && !inReadOnlyIsland(n, host)) out.push(n);
    } else if (ATOMIC_INLINE.has(n.nodeName) && containsNode(range, n) && !inReadOnlyIsland(n, host)) {
      out.push(n);
    }
  }
  return out;
}

/**
 * Groups the range's leaves into runs: consecutive leaves with the same leaf
 * block. Each run gets the two boundary points it spans.
 * @param {Range} range
 * @param {Element} host
 * @returns {{ block: Element, start: () => [Node, number], end: () => [Node, number] }[]}
 */
function runsIn(range, host) {
  const leaves = leavesIn(range, host);
  const runs = [];
  let cur = null;
  for (const leaf of leaves) {
    const block = leafBlock(leaf, host);
    if (!cur || cur.block !== block) {
      cur = { block, first: leaf, last: leaf };
      runs.push(cur);
    } else {
      cur.last = leaf;
    }
  }
  // Boundaries next to a node are resolved when the run is processed: an
  // earlier run in the same block (one broken by a nested list) may have
  // split or wrapped nodes and shifted the child indexes.
  const { startContainer, startOffset, endContainer, endOffset } = range;
  return runs.map(({ block, first, last }) => ({
    block,
    start: () => (first === startContainer && first.nodeType === 3
      ? [first, startOffset]
      : [first.parentNode, indexOf(first)]),
    end: () => (last === endContainer && last.nodeType === 3
      ? [last, endOffset]
      : [last.parentNode, indexOf(last) + 1]),
  }));
}

// ---------------------------------------------------------------------------
// Splitting and merging
// ---------------------------------------------------------------------------

/**
 * Splits every element between the point and `limit` so the point becomes a
 * position among `limit`'s children, and returns that child index. Nothing is
 * cloned at an element's edge, so no empty halves are left behind.
 * @param {Node} node
 * @param {number} offset
 * @param {Element} limit
 * @returns {number}
 */
function splitTo(node, offset, limit) {
  let parent;
  let index;
  if (node.nodeType === 3) {
    const text = /** @type {Text} */ (node);
    parent = text.parentNode;
    if (offset <= 0) index = indexOf(text);
    else if (offset >= text.length) index = indexOf(text) + 1;
    else index = indexOf(text.splitText(offset));
  } else {
    parent = node;
    index = offset;
  }
  while (parent && parent !== limit) {
    const grand = parent.parentNode;
    const at = indexOf(parent);
    if (index <= 0) {
      index = at;
    } else if (index >= parent.childNodes.length) {
      index = at + 1;
    } else {
      const clone = /** @type {Element} */ (parent.cloneNode(false));
      clone.removeAttribute('id');
      while (parent.childNodes.length > index) clone.appendChild(parent.childNodes[index]);
      grand.insertBefore(clone, parent.nextSibling);
      index = at + 1;
    }
    parent = grand;
  }
  return index;
}

/**
 * Splits `block`'s inline content at both ends of a run and returns the
 * children of `block` that now hold exactly the run.
 * @param {Element} block
 * @param {[Node, number]} start
 * @param {[Node, number]} end
 * @returns {Node[]}
 */
function isolate(block, start, end) {
  const endIndex = splitTo(end[0], end[1], block);
  const endRef = block.childNodes[endIndex] || null;
  const startIndex = splitTo(start[0], start[1], block);
  const nodes = [];
  for (let n = block.childNodes[startIndex]; n && n !== endRef; n = n.nextSibling) nodes.push(n);
  return nodes;
}

/** @param {Element} a @param {Element} b */
function sameShape(a, b) {
  if (a.nodeName !== b.nodeName || a.attributes.length !== b.attributes.length) return false;
  for (const attr of a.attributes) {
    if (b.getAttribute(attr.name) !== attr.value) return false;
  }
  return true;
}

/**
 * Merges adjacent identical formatting elements below `el`, recursively, and
 * drops formatting elements left with no content. Heals what splitTo cut.
 * Blocks are not entered — they are merged as runs of their own.
 * @param {Element} el
 */
function mergeInline(el) {
  let n = el.firstChild;
  while (n) {
    const next = n.nextSibling;
    // An emptied attribute-less wrapper is what a split or a lifted caret
    // placeholder leaves; one with attributes may be an icon — keep it.
    if (isElement(n) && FORMATTING_TAGS.has(n.nodeName) && !n.hasChildNodes() && n.attributes.length === 0) {
      n.remove();
      n = next;
      continue;
    }
    if (isElement(n) && isElement(next) && FORMATTING_TAGS.has(n.nodeName) && sameShape(n, next)
        && !isContentElement(n) && !isContentElement(next)) {
      while (next.firstChild) n.appendChild(next.firstChild);
      next.remove();
      continue; // compare n with its new next sibling
    }
    if (isElement(n) && !isBlockNode(n)) mergeInline(n);
    n = next;
  }
}

/**
 * Replaces `el` with its children.
 * @param {Element} el
 */
function unwrap(el) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  el.remove();
}

/**
 * Wraps each maximal run of non-block nodes in `nodes` with a fresh element.
 * @param {Node[]} nodes - consecutive siblings
 * @param {() => Element} make
 * @returns {Element[]} the wrappers
 */
function wrapRuns(nodes, make) {
  const wrappers = [];
  let wrapper = null;
  for (const node of nodes) {
    if (isBlockNode(node)) { wrapper = null; continue; }
    if (!wrapper) {
      wrapper = make();
      node.parentNode.insertBefore(wrapper, node);
      wrappers.push(wrapper);
    }
    wrapper.appendChild(node);
  }
  return wrappers;
}

/**
 * Runs `transform` on the content of every run in the current selection and
 * then restores the selection. `transform` receives a temporary container
 * holding one run's nodes; whatever it leaves in the container is put back.
 * @param {Element} host
 * @param {Range} range
 * @param {(box: Element) => void} transform
 */
function transformRuns(host, range, transform) {
  const saved = saveSelection(host, range);
  const runs = runsIn(range, host);
  const blocks = new Set();
  for (const run of runs) {
    const nodes = isolate(run.block, run.start(), run.end());
    for (const box of wrapRuns(nodes, () => document.createElement('span'))) {
      transform(box);
      unwrap(box);
    }
    blocks.add(run.block);
  }
  blocks.forEach((b) => { mergeInline(b); b.normalize(); });
  restoreSelection(host, saved);
  return runs.length > 0;
}

// ---------------------------------------------------------------------------
// Inline formats
// ---------------------------------------------------------------------------

/**
 * @typedef {object} InlineFormat
 * @property {string} tag - element created when applying
 * @property {Set<string>} tags - elements that carry the format
 * @property {(style: CSSStyleDeclaration) => boolean} styled - inline style that carries it
 * @property {(el: HTMLElement) => void} unstyle - removes that inline style
 * @property {string} [excludes] - format removed when this one is applied
 */

/** @param {HTMLElement} el @param {string} token */
function dropDecoration(el, token) {
  const value = el.style.textDecorationLine || el.style.textDecoration || '';
  const rest = value.split(/\s+/).filter((t) => t && t !== token && t !== 'none');
  el.style.removeProperty('text-decoration');
  el.style.removeProperty('text-decoration-line');
  if (rest.length) el.style.textDecorationLine = rest.join(' ');
}

/** @param {CSSStyleDeclaration} s @param {string} token */
const hasDecoration = (s, token) => (s.textDecorationLine || s.textDecoration || '').split(/\s+/).includes(token);

/** @type {Record<string, InlineFormat>} */
export const INLINE_FORMATS = {
  bold: {
    tag: 'b',
    tags: new Set(['B', 'STRONG']),
    styled: (s) => /^(bold|bolder|[6-9]00)$/.test(s.fontWeight),
    unstyle: (el) => el.style.removeProperty('font-weight'),
  },
  italic: {
    tag: 'i',
    tags: new Set(['I', 'EM']),
    styled: (s) => s.fontStyle === 'italic' || s.fontStyle === 'oblique',
    unstyle: (el) => el.style.removeProperty('font-style'),
  },
  underline: {
    tag: 'u',
    tags: new Set(['U', 'INS']),
    styled: (s) => hasDecoration(s, 'underline'),
    unstyle: (el) => dropDecoration(el, 'underline'),
  },
  strikethrough: {
    tag: 's',
    tags: new Set(['S', 'STRIKE', 'DEL']),
    styled: (s) => hasDecoration(s, 'line-through'),
    unstyle: (el) => dropDecoration(el, 'line-through'),
  },
  superscript: {
    tag: 'sup',
    tags: new Set(['SUP']),
    styled: (s) => s.verticalAlign === 'super',
    unstyle: (el) => el.style.removeProperty('vertical-align'),
    excludes: 'subscript',
  },
  subscript: {
    tag: 'sub',
    tags: new Set(['SUB']),
    styled: (s) => s.verticalAlign === 'sub',
    unstyle: (el) => el.style.removeProperty('vertical-align'),
    excludes: 'superscript',
  },
};

/**
 * @param {Node} node
 * @param {InlineFormat} fmt
 */
function carries(node, fmt) {
  if (!isElement(node)) return false;
  if (fmt.tags.has(node.nodeName)) return true;
  const style = /** @type {HTMLElement} */ (node).style;
  return !!style && fmt.styled(style);
}

/**
 * Whether `node` is formatted with `fmt` by itself or an ancestor below `host`.
 * @param {Node} node
 * @param {InlineFormat} fmt
 * @param {Element} host
 */
function formattedAt(node, fmt, host) {
  for (let cur = isElement(node) ? node : node.parentElement; cur && cur !== host; cur = cur.parentElement) {
    if (carries(cur, fmt)) return true;
  }
  return false;
}

/**
 * Removes `fmt` from `el` and every element below it.
 * @param {Element} el
 * @param {InlineFormat} fmt
 */
function stripFormat(el, fmt) {
  const found = [...el.querySelectorAll('*')].filter((d) => carries(d, fmt)).reverse();
  for (const d of found) clearFormatOn(/** @type {HTMLElement} */ (d), fmt);
}

/**
 * @param {HTMLElement} el
 * @param {InlineFormat} fmt
 */
function clearFormatOn(el, fmt) {
  if (isContentElement(el)) return;
  if (fmt.tags.has(el.nodeName)) {
    // A <b style="color:red"> keeps its colour as a span.
    if (el.getAttribute('style')) {
      const span = document.createElement('span');
      span.setAttribute('style', el.getAttribute('style'));
      el.parentNode.insertBefore(span, el);
      while (el.firstChild) span.appendChild(el.firstChild);
      el.remove();
      if (fmt.styled(span.style)) fmt.unstyle(span);
      return;
    }
    unwrap(el);
    return;
  }
  fmt.unstyle(el);
  if (!el.getAttribute('style')) el.removeAttribute('style');
  if ((el.nodeName === 'SPAN' || el.nodeName === 'FONT') && el.attributes.length === 0) unwrap(el);
}

/**
 * Whether the selection is entirely formatted with `name`: the caret's
 * position when collapsed, otherwise every selected character. Read from the
 * DOM, so it agrees with what the command toggles.
 * @param {string} name - a key of INLINE_FORMATS
 * @param {HTMLElement} [editable]
 */
export function isInlineActive(name, editable) {
  const fmt = INLINE_FORMATS[name];
  const range = usableRange(editable);
  if (!fmt || !range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  if (range.collapsed) return formattedAt(range.startContainer, fmt, host);
  const texts = leavesIn(range, host).filter((n) => n.nodeType === 3 && /[^\s\u200B]/.test(/** @type {Text} */ (n).data));
  if (!texts.length) return formattedAt(range.startContainer, fmt, host);
  return texts.every((t) => formattedAt(t, fmt, host));
}

/**
 * @param {Range} range
 * @param {HTMLElement} [editable]
 * @returns {Element|null}
 */
function hostOf(range, editable) {
  if (editable && editable !== /** @type {any} */ (document)) return editable;
  return editableHost(range.commonAncestorContainer);
}

/**
 * Turns an inline format on or off for the selection. `on` defaults to the
 * opposite of the current state (a toggle).
 * @param {string} name - a key of INLINE_FORMATS
 * @param {boolean} [on]
 * @param {HTMLElement} [editable]
 * @returns {boolean} false when there is no usable selection
 */
export function setInline(name, on, editable) {
  const fmt = INLINE_FORMATS[name];
  const range = usableRange(editable);
  if (!fmt || !range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  const apply = on ?? !isInlineActive(name, editable);

  if (range.collapsed) {
    if (apply) {
      if (formattedAt(range.startContainer, fmt, host)) return true;
      caretInside(range, () => document.createElement(fmt.tag), fmt.excludes ? INLINE_FORMATS[fmt.excludes] : null, host);
    } else {
      caretOutside(range, fmt, host);
    }
    return true;
  }

  const exclude = fmt.excludes ? INLINE_FORMATS[fmt.excludes] : null;
  return transformRuns(host, range, (box) => {
    stripFormat(box, fmt);
    if (exclude && apply) stripFormat(box, exclude);
    if (!apply) return;
    const el = document.createElement(fmt.tag);
    while (box.firstChild) el.appendChild(box.firstChild);
    box.appendChild(el);
  });
}

// ---------------------------------------------------------------------------
// Collapsed selections — formatting what is typed next
// ---------------------------------------------------------------------------

/**
 * Puts the caret inside a new, empty formatting element (held open by a
 * zero-width space) so the next typed text takes the format. A caret already
 * sitting in such a placeholder is reused rather than nested.
 * @param {Range} range
 * @param {() => Element} make
 * @param {InlineFormat|null} exclude
 * @param {Element} host
 */
function caretInside(range, make, exclude, host) {
  const el = make();
  const node = range.startContainer;
  if (node.nodeType === 3 && /** @type {Text} */ (node).data === ZWSP) {
    node.parentNode.insertBefore(el, node);
    el.appendChild(node);
  } else {
    el.appendChild(document.createTextNode(ZWSP));
    range.insertNode(el);
  }
  if (exclude) {
    const outer = outermostCarrier(el, exclude, host);
    if (outer) liftOut(el.firstChild, outer, exclude);
  }
  const text = el.ownerDocument.contains(el) ? findPlaceholder(el) : null;
  if (text) setCaret(text, text.length);
}

/** @param {Element} el @returns {Text|null} */
function findPlaceholder(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n; let last = null;
  while ((n = walker.nextNode())) last = n;
  return /** @type {Text|null} */ (last);
}

/**
 * The outermost element carrying `fmt` above `node`, within its leaf block.
 * @param {Node} node
 * @param {InlineFormat} fmt
 * @param {Element} host
 */
function outermostCarrier(node, fmt, host) {
  let found = null;
  for (let cur = isElement(node) ? node : node.parentElement; cur && cur !== host && !isBlockNode(cur); cur = cur.parentElement) {
    if (carries(cur, fmt)) found = cur;
  }
  return found;
}

/**
 * Moves `node` out of `carrier` (which carries `fmt`), keeping every other
 * format between them, by splitting the carrier around it.
 * @param {Node} node
 * @param {Element} carrier
 * @param {InlineFormat} fmt
 */
function liftOut(node, carrier, fmt) {
  const parent = /** @type {Element} */ (carrier.parentNode);
  const pieces = isolate(parent, [node.parentNode, indexOf(node)], [node.parentNode, indexOf(node) + 1]);
  for (const piece of pieces) {
    if (!isElement(piece)) continue;
    stripFormat(piece, fmt);
    if (carries(piece, fmt)) clearFormatOn(/** @type {HTMLElement} */ (piece), fmt);
  }
  mergeInline(parent);
}

/**
 * Moves the caret out of `fmt` so the next typed text is not formatted.
 * @param {Range} range
 * @param {InlineFormat} fmt
 * @param {Element} host
 */
function caretOutside(range, fmt, host) {
  let text = range.startContainer;
  if (!(text.nodeType === 3 && /** @type {Text} */ (text).data === ZWSP)) {
    text = document.createTextNode(ZWSP);
    range.insertNode(text);
  }
  const carrier = outermostCarrier(text, fmt, host);
  if (carrier) liftOut(text, carrier, fmt);
  if (text.parentNode) setCaret(text, 1);
}

/**
 * Drops the zero-width space that held a caret placeholder open once real text
 * has been typed next to it, keeping the caret where it is. Called on input.
 * @param {HTMLElement} [editable]
 */
export function absorbPlaceholder(editable) {
  const range = usableRange(editable);
  if (!range || !range.collapsed || range.startContainer.nodeType !== 3) return;
  const text = /** @type {Text} */ (range.startContainer);
  const at = text.data.indexOf(ZWSP);
  if (at === -1 || text.data.length < 2) return;
  const offset = range.startOffset;
  text.deleteData(at, 1);
  setCaret(text, offset > at ? offset - 1 : offset);
}

// ---------------------------------------------------------------------------
// Style-valued formats: colour, highlight, font family, font size
// ---------------------------------------------------------------------------

/** CSS property → legacy <font> attribute that carried the same thing. */
const FONT_ATTR = { color: 'color', 'font-family': 'face', 'font-size': 'size' };

/**
 * Applies an inline CSS property to the selection — a span per run, with the
 * property removed from whatever the run already contained so the new value
 * wins. A collapsed selection formats what is typed next.
 * @param {string} prop - e.g. 'color', 'background-color', 'font-family', 'font-size'
 * @param {string} value
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
export function applyStyle(prop, value, editable) {
  const range = usableRange(editable);
  if (!range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  const make = () => {
    const span = document.createElement('span');
    span.style.setProperty(prop, value);
    return span;
  };
  if (range.collapsed) {
    caretInside(range, make, null, host);
    return true;
  }
  return transformRuns(host, range, (box) => {
    for (const el of [...box.querySelectorAll('*')].reverse()) {
      const h = /** @type {HTMLElement} */ (el);
      if (h.style?.getPropertyValue(prop)) h.style.removeProperty(prop);
      if (h.nodeName === 'FONT' && FONT_ATTR[prop]) h.removeAttribute(FONT_ATTR[prop]);
      if (!h.getAttribute('style')) h.removeAttribute('style');
      if ((h.nodeName === 'SPAN' || h.nodeName === 'FONT') && h.attributes.length === 0) unwrap(h);
    }
    // One span around a lone span: set the property on it instead of nesting.
    const only = box.childNodes.length === 1 ? box.firstChild : null;
    if (only && isElement(only) && only.nodeName === 'SPAN') {
      /** @type {HTMLElement} */ (only).style.setProperty(prop, value);
      return;
    }
    const span = make();
    while (box.firstChild) span.appendChild(box.firstChild);
    box.appendChild(span);
  });
}

/**
 * Removes inline formatting from the selection: formatting elements are
 * unwrapped and inline styles dropped. Links, and block formatting, stay.
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
export function removeFormat(editable) {
  const range = usableRange(editable);
  if (!range || range.collapsed) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  return transformRuns(host, range, (box) => {
    for (const el of [...box.querySelectorAll('*')].reverse()) {
      if (isContentElement(el)) continue;
      if (REMOVABLE_TAGS.has(el.nodeName)) unwrap(el);
      else if (!isBlockNode(el)) el.removeAttribute('style');
    }
  });
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

/**
 * Links the selected content to `href`, replacing any links inside it.
 * @param {string} href - already sanitised by the caller
 * @param {HTMLElement} [editable]
 * @returns {HTMLAnchorElement[]} the links created (empty when nothing was selected)
 */
export function createLink(href, editable) {
  const range = usableRange(editable);
  if (!range || range.collapsed) return [];
  const host = hostOf(range, editable);
  if (!host) return [];
  /** @type {HTMLAnchorElement[]} */
  const links = [];
  transformRuns(host, range, (box) => {
    box.querySelectorAll('a').forEach((a) => unwrap(a));
    const a = document.createElement('a');
    a.setAttribute('href', href);
    while (box.firstChild) a.appendChild(box.firstChild);
    box.appendChild(a);
    links.push(a);
  });
  // Merging may have folded a new link into an identical neighbour.
  return links.filter((a) => a.isConnected);
}

/**
 * Removes every link the selection touches — the whole link, not only the
 * selected part, which is what "remove link" is expected to do.
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
export function unlink(editable) {
  const range = usableRange(editable);
  if (!range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  const saved = saveSelection(host, range);
  const anchors = new Set();
  const start = isElement(range.startContainer) ? range.startContainer : range.startContainer.parentElement;
  const around = start?.closest('a');
  if (around && host.contains(around)) anchors.add(around);
  if (!range.collapsed) {
    host.querySelectorAll('a').forEach((a) => {
      try { if (range.intersectsNode(a)) anchors.add(a); } catch { /* detached */ }
    });
  }
  if (!anchors.size) return false;
  anchors.forEach((a) => {
    const parent = a.parentElement;
    unwrap(a);
    parent?.normalize();
  });
  restoreSelection(host, saved);
  return true;
}

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

/**
 * Wraps the loose inline content around `node` (directly inside `host`) in a
 * paragraph, so block commands always have a block to act on.
 * @param {Node} node - a child of host
 * @param {Element} host
 * @returns {HTMLParagraphElement}
 */
function wrapLooseInline(node, host) {
  let first = node;
  while (first.previousSibling && !isBlockNode(first.previousSibling)) first = first.previousSibling;
  let last = node;
  while (last.nextSibling && !isBlockNode(last.nextSibling)) last = last.nextSibling;
  const p = document.createElement('p');
  host.insertBefore(p, first);
  let n = first;
  while (n) {
    const next = n === last ? null : n.nextSibling;
    p.appendChild(n);
    n = next;
  }
  return p;
}

/**
 * The leaf blocks the selection touches, in document order. Loose inline
 * content directly in the host is wrapped in a paragraph first.
 * @param {Range} range
 * @param {Element} host
 * @returns {Element[]}
 */
function blocksIn(range, host) {
  const blocks = [];
  const seen = new Set();
  let leaves = leavesIn(range, host);
  if (!leaves.length) leaves = [range.startContainer];
  for (const leaf of leaves) {
    if (leaf === host || !host.contains(leaf)) continue;
    let block = leafBlock(leaf, host);
    if (block === host) {
      let child = leaf;
      while (child.parentNode !== host) child = child.parentNode;
      block = isBlockNode(child) ? /** @type {Element} */ (child) : wrapLooseInline(child, host);
    }
    if (!seen.has(block)) { seen.add(block); blocks.push(block); }
  }
  if (!blocks.length && range.startContainer === host) {
    const child = host.childNodes[Math.min(range.startOffset, host.childNodes.length - 1)];
    if (child && !isBlockNode(child)) blocks.push(wrapLooseInline(child, host));
    else if (child && !LIST_LIKE.has(child.nodeName)) blocks.push(/** @type {Element} */ (child));
  }
  return blocks;
}

/** Blocks that hold other blocks rather than text. */
const LIST_LIKE = new Set(['UL', 'OL', 'DL', 'TABLE', 'TBODY', 'THEAD', 'TFOOT', 'TR']);

/**
 * Gives a block with no visible content a <br>, which is what lets the caret
 * sit in it (an empty text node does not).
 * @param {Element} el
 */
function keepFillable(el) {
  if (el.textContent || el.querySelector('br, img, input, iframe, video, hr, table')) return;
  while (el.firstChild) el.firstChild.remove();
  el.appendChild(document.createElement('br'));
}

/** Attributes a block keeps when its tag changes. */
const KEPT_BLOCK_ATTRS = ['style', 'dir', 'lang', 'data-an-block-id'];

/**
 * Replaces `el` with a `tag` element holding the same children.
 * @param {Element} el
 * @param {string} tag
 * @returns {HTMLElement}
 */
function retag(el, tag) {
  const next = document.createElement(tag);
  for (const name of KEPT_BLOCK_ATTRS) {
    const v = el.getAttribute(name);
    if (v != null) next.setAttribute(name, v);
  }
  while (el.firstChild) next.appendChild(el.firstChild);
  el.parentNode.replaceChild(next, el);
  return next;
}

/** Cells and list items hold a format block inside them instead of becoming one. */
const CONTAINER_BLOCKS = new Set(['LI', 'TD', 'TH', 'DD', 'DT', 'CAPTION', 'FIGCAPTION', 'SUMMARY']);

/**
 * Changes the selected blocks to `tag` (p, h1–h6, blockquote, pre).
 * @param {string} tag
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
export function formatBlock(tag, editable) {
  const range = usableRange(editable);
  if (!range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  const name = String(tag).replace(/[<>]/g, '').toLowerCase();
  if (!name) return false;
  const saved = saveSelection(host, range);
  const created = [];
  for (const block of blocksIn(range, host)) {
    if (block.nodeName.toLowerCase() === name) continue;
    if (CONTAINER_BLOCKS.has(block.nodeName)) {
      if (name === 'p') continue;
      const inner = document.createElement(name);
      while (block.firstChild && !isBlockNode(block.firstChild)) inner.appendChild(block.firstChild);
      block.insertBefore(inner, block.firstChild);
      created.push(inner);
      continue;
    }
    // A heading inside a list item or cell goes back to plain content.
    if (name === 'p' && CONTAINER_BLOCKS.has(block.parentElement?.nodeName ?? '')) {
      unwrap(block);
      continue;
    }
    if (block.nodeName === 'PRE') preToLines(block);
    const next = retag(block, name);
    keepFillable(next);
    created.push(next);
  }
  if (name === 'pre') joinAdjacentPre(created);
  restoreSelection(host, saved);
  return true;
}

/**
 * Turns a code block's newlines into <br>s before it becomes a normal block,
 * where they would otherwise collapse into spaces.
 * @param {Element} pre
 */
function preToLines(pre) {
  const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
  const texts = [];
  let n;
  while ((n = walker.nextNode())) texts.push(n);
  for (const text of texts) {
    const parts = text.data.split('\n');
    if (parts.length === 1) continue;
    const frag = document.createDocumentFragment();
    parts.forEach((part, i) => {
      if (i) frag.appendChild(document.createElement('br'));
      if (part) frag.appendChild(document.createTextNode(part));
    });
    text.parentNode.replaceChild(frag, text);
  }
  const code = pre.querySelector(':scope > code');
  if (code && pre.childNodes.length === 1) unwrap(code);
}

/**
 * Code blocks made from consecutive paragraphs become one block, one line per
 * paragraph, rather than a stack of single-line blocks.
 * @param {HTMLElement[]} pres
 */
function joinAdjacentPre(pres) {
  for (let i = pres.length - 1; i > 0; i--) {
    const cur = pres[i];
    const prev = pres[i - 1];
    if (cur.previousElementSibling !== prev || cur.previousSibling !== prev) continue;
    brToNewline(prev);
    brToNewline(cur);
    prev.appendChild(document.createTextNode('\n'));
    while (cur.firstChild) prev.appendChild(cur.firstChild);
    cur.remove();
  }
  pres.forEach((p) => { if (p.isConnected) { brToNewline(p); p.normalize(); } });
}

/** @param {Element} el */
function brToNewline(el) {
  el.querySelectorAll('br').forEach((br) => br.replaceWith(document.createTextNode('\n')));
}

/**
 * Sets text-align on the selected blocks. 'left' clears it, since that is the
 * default in a left-to-right document.
 * @param {'left'|'center'|'right'|'justify'} align
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
export function align(align, editable) {
  const range = usableRange(editable);
  if (!range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  const saved = saveSelection(host, range);
  for (const block of blocksIn(range, host)) {
    const el = /** @type {HTMLElement} */ (block);
    const rtl = getComputedStyle(el).direction === 'rtl';
    if ((align === 'left' && !rtl) || (align === 'right' && rtl)) el.style.removeProperty('text-align');
    else el.style.textAlign = align;
    if (!el.getAttribute('style')) el.removeAttribute('style');
  }
  restoreSelection(host, saved);
  return true;
}

/** Current text-align of the block at the caret, as the toolbar reports it. */
export function currentAlign(editable) {
  const range = usableRange(editable);
  if (!range) return '';
  const host = hostOf(range, editable);
  if (!host) return '';
  const block = leafBlock(range.startContainer, host);
  return getComputedStyle(block).textAlign;
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

/**
 * The list items the selection touches, grouped by list.
 * @param {Range} range
 * @param {Element} host
 * @returns {Map<Element, Element[]>}
 */
function selectedItems(range, host) {
  const groups = new Map();
  for (const block of blocksIn(range, host)) {
    const li = block.nodeName === 'LI' ? block : block.closest('li');
    if (!li || !host.contains(li)) continue;
    const list = li.parentElement;
    if (!groups.has(list)) groups.set(list, []);
    const items = groups.get(list);
    if (!items.includes(li)) items.push(li);
  }
  return groups;
}

/**
 * Makes the selected blocks a list of `type`, or — when the selection is in
 * a list of that type already — turns those items back into paragraphs.
 * @param {'ul'|'ol'} type
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
export function toggleList(type, editable) {
  const range = usableRange(editable);
  if (!range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  const tag = type.toUpperCase();
  const saved = saveSelection(host, range);
  const groups = selectedItems(range, host);
  const lists = [...groups.keys()];
  if (lists.length && lists.every((list) => list.nodeName === tag)) {
    for (const [list, items] of groups) itemsToParagraphs(list, items);
  } else {
    // Collected before retagging, which moves the nodes the range points into.
    const loose = blocksIn(range, host).filter((b) => b.nodeName !== 'LI' && !b.closest('li'));
    for (const list of lists) if (list.nodeName !== tag) retagList(list, tag.toLowerCase());
    makeList(loose, tag.toLowerCase());
  }
  restoreSelection(host, saved);
  return true;
}

/**
 * Changes a list's tag, keeping its attributes and items.
 * @param {Element} list
 * @param {string} tag
 */
function retagList(list, tag) {
  const next = document.createElement(tag);
  for (const attr of list.attributes) next.setAttribute(attr.name, attr.value);
  while (list.firstChild) next.appendChild(list.firstChild);
  list.replaceWith(next);
}

/**
 * Converts `items` (children of `list`) to paragraphs where they stand,
 * splitting the list around them.
 * @param {Element} list
 * @param {Element[]} items
 */
function itemsToParagraphs(list, items) {
  const all = [...list.children];
  const first = all.indexOf(items[0]);
  const last = all.indexOf(items.at(-1));
  if (first === -1 || last === -1) return;
  const after = all.slice(last + 1);
  let anchor = list;
  for (const li of all.slice(first, last + 1)) {
    const p = document.createElement('p');
    const lifted = [];
    for (const child of [...li.childNodes]) {
      if (isElement(child) && (child.nodeName === 'UL' || child.nodeName === 'OL')) lifted.push(child);
      else if (!(isElement(child) && child.nodeName === 'INPUT')) p.appendChild(child);
    }
    if (!p.hasChildNodes()) p.appendChild(document.createElement('br'));
    const align = /** @type {HTMLElement} */ (li).style.textAlign;
    if (align) p.style.textAlign = align;
    anchor.after(p);
    anchor = p;
    for (const sub of lifted) { anchor.after(sub); anchor = sub; }
    li.remove();
  }
  if (after.length) {
    const rest = /** @type {Element} */ (list.cloneNode(false));
    rest.removeAttribute('id');
    after.forEach((li) => rest.appendChild(li));
    anchor.after(rest);
  }
  if (!list.children.length) list.remove();
}

/**
 * Wraps `blocks` into lists: consecutive sibling blocks share one list, and a
 * table cell gets a list inside it. A new list joins a plain neighbouring
 * list of the same kind.
 * @param {Element[]} blocks
 * @param {string} tag - 'ul' | 'ol'
 */
function makeList(blocks, tag) {
  const lists = [];
  let list = null;
  for (const block of blocks) {
    if (CONTAINER_BLOCKS.has(block.nodeName)) {
      const inner = document.createElement(tag);
      const li = document.createElement('li');
      while (block.firstChild) li.appendChild(block.firstChild);
      if (!li.hasChildNodes()) li.appendChild(document.createElement('br'));
      inner.appendChild(li);
      block.appendChild(inner);
      list = null;
      continue;
    }
    if (!list || list.nextElementSibling !== block || !onlySpaceBetween(list, block)) {
      list = document.createElement(tag);
      block.parentNode.insertBefore(list, block);
      lists.push(list);
    }
    const li = document.createElement('li');
    const alignValue = /** @type {HTMLElement} */ (block).style?.textAlign;
    if (alignValue) li.style.textAlign = alignValue;
    if (block.nodeName === 'PRE' || block.nodeName === 'BLOCKQUOTE') {
      li.appendChild(block);
    } else {
      while (block.firstChild) li.appendChild(block.firstChild);
      block.remove();
    }
    keepFillable(li);
    list.appendChild(li);
  }
  lists.forEach(joinSiblingLists);
}

/** Whether only whitespace text lies between two siblings. */
function onlySpaceBetween(a, b) {
  for (let n = a.nextSibling; n && n !== b; n = n.nextSibling) {
    if (n.nodeType !== 3 || /\S/.test(/** @type {Text} */ (n).data)) return false;
  }
  return true;
}

/** @param {Element} list */
function joinSiblingLists(list) {
  if (!list.isConnected) return;
  const prev = list.previousElementSibling;
  if (prev && prev.nodeName === list.nodeName && !prev.className && !list.className && onlySpaceBetween(prev, list)) {
    while (list.firstChild) prev.appendChild(list.firstChild);
    list.remove();
    list = prev;
  }
  const next = list.nextElementSibling;
  if (next && next.nodeName === list.nodeName && !next.className && !list.className && onlySpaceBetween(list, next)) {
    while (next.firstChild) list.appendChild(next.firstChild);
    next.remove();
  }
}

/** Indentation step for blocks outside lists. */
const INDENT_PX = 40;

/** @param {HTMLElement} el */
const marginSide = (el) => (getComputedStyle(el).direction === 'rtl' ? 'margin-right' : 'margin-left');

/**
 * Indents the selection: list items move into a sublist of the item above
 * them, other blocks get a left margin (right in RTL).
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
export function indent(editable) {
  const range = usableRange(editable);
  if (!range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  const saved = saveSelection(host, range);
  const groups = selectedItems(range, host);
  if (groups.size) {
    for (const [list, items] of groups) {
      const target = items[0].previousElementSibling;
      if (!target || target.nodeName !== 'LI') continue;
      let sub = target.lastElementChild;
      if (!sub || sub.nodeName !== list.nodeName) {
        sub = /** @type {Element} */ (list.cloneNode(false));
        sub.removeAttribute('id');
        sub.removeAttribute('data-an-block-id');
        target.appendChild(sub);
      }
      for (const li of items) sub.appendChild(li);
    }
  } else {
    for (const block of blocksIn(range, host)) {
      const el = /** @type {HTMLElement} */ (block);
      const side = marginSide(el);
      const current = parseFloat(el.style.getPropertyValue(side)) || 0;
      el.style.setProperty(side, `${current + INDENT_PX}px`);
    }
  }
  restoreSelection(host, saved);
  return true;
}

/**
 * Outdents the selection: list items move up a level (top-level items become
 * paragraphs), other blocks lose one step of margin.
 * @param {HTMLElement} [editable]
 * @returns {boolean}
 */
export function outdent(editable) {
  const range = usableRange(editable);
  if (!range) return false;
  const host = hostOf(range, editable);
  if (!host) return false;
  const saved = saveSelection(host, range);
  const groups = selectedItems(range, host);
  if (groups.size) {
    for (const [list, items] of groups) {
      const outer = list.parentElement;
      if (outer?.nodeName === 'LI') liftItems(list, items, outer);
      else itemsToParagraphs(list, items);
    }
  } else {
    for (const block of blocksIn(range, host)) {
      const el = /** @type {HTMLElement} */ (block);
      const side = marginSide(el);
      const current = parseFloat(el.style.getPropertyValue(side)) || 0;
      if (current > INDENT_PX) el.style.setProperty(side, `${current - INDENT_PX}px`);
      else el.style.removeProperty(side);
      if (!el.getAttribute('style')) el.removeAttribute('style');
      // Content indented by an older version sits in a borderless blockquote.
      const legacy = el.parentElement;
      if (current === 0 && legacy?.nodeName === 'BLOCKQUOTE' && /border:\s*none/.test(legacy.getAttribute('style') || '')) unwrap(legacy);
    }
  }
  restoreSelection(host, saved);
  return true;
}

/**
 * Moves `items` out of the nested `list` to follow `outerItem`, keeping the
 * items below them nested under the last one.
 * @param {Element} list
 * @param {Element[]} items
 * @param {Element} outerItem
 */
function liftItems(list, items, outerItem) {
  const lastItem = items.at(-1);
  const following = [];
  for (let n = lastItem.nextElementSibling; n; n = n.nextElementSibling) following.push(n);
  if (following.length) {
    const carrier = /** @type {Element} */ (list.cloneNode(false));
    carrier.removeAttribute('id');
    following.forEach((li) => carrier.appendChild(li));
    lastItem.appendChild(carrier);
  }
  let anchor = outerItem;
  for (const li of items) { anchor.after(li); anchor = li; }
  if (!list.children.length) list.remove();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * The tag of the block at the caret — 'p' for loose text in the host.
 * @param {HTMLElement} [editable]
 */
export function currentBlockTag(editable) {
  const range = usableRange(editable);
  if (!range) return '';
  const host = hostOf(range, editable);
  if (!host) return '';
  const block = leafBlock(range.startContainer, host);
  // A format block inside a list item or cell names the format.
  if (block === host) return 'p';
  if (CONTAINER_BLOCKS.has(block.nodeName)) return 'p';
  return block.nodeName.toLowerCase();
}

/**
 * The first family of the font at the caret, unquoted.
 * @param {HTMLElement} [editable]
 */
export function currentFontFamily(editable) {
  const range = usableRange(editable);
  if (!range) return '';
  const node = range.startContainer;
  const el = isElement(node) ? node : node.parentElement;
  if (!el) return '';
  const family = getComputedStyle(el).fontFamily || '';
  return family.split(',')[0].replace(/["']/g, '').trim();
}
