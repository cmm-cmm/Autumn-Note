/**
 * count.js — word and character counting for the editor.
 *
 * Shared so the statusbar and the maxWords/maxChars limits cannot disagree
 * about what a word is. They used to: the statusbar segmented with `Intl`
 * while the limit split on whitespace, which counts an entire Japanese
 * document as one word and made `maxWords` unenforceable in any script that
 * does not space its words.
 */

// Cache the segmenter instance at module level to avoid per-call allocation
const _segmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'word' })
    : null;

/**
 * Count words in a string, CJK-aware.
 * Uses Intl.Segmenter (Chromium 87+, Firefox 125+, Safari 17+) when available,
 * falling back to a simple whitespace split for older environments.
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  if (_segmenter) {
    let count = 0;
    for (const seg of _segmenter.segment(trimmed)) {
      if (seg.isWordLike) count++;
    }
    return count;
  }
  // Fallback: split on whitespace
  return trimmed.split(/\s+/).length;
}

/**
 * Elements that start a new line of text. Used to join content the way the
 * reader sees it: `textContent` glues `<p>hello</p><p>world</p>` into
 * "helloworld", which any word counter then reports as one word.
 */
const BLOCK_TAGS = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BR', 'DD', 'DIV', 'DL', 'DT',
  'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4',
  'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION',
  'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
]);

/**
 * Appends `node`'s text into `lines` with a newline at every block boundary,
 * and into `flat` without one.
 *
 * `lines` is what `innerText` gives, minus `innerText`'s forced layout pass —
 * the counters run on every keystroke, so a reflow per character is not on.
 * `flat` is exactly what `textContent` gives, produced by the same walk so the
 * cold path does not traverse the subtree twice to get both.
 * @param {Node} node
 * @param {string[]} lines
 * @param {string[]} flat
 */
function _collectText(node, lines, flat) {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === 3) {
      const data = /** @type {Text} */ (child).data;
      lines.push(data);
      flat.push(data);
    } else if (child.nodeType === 1) {
      const block = BLOCK_TAGS.has(/** @type {Element} */ (child).tagName);
      if (block) lines.push('\n');
      _collectText(child, lines, flat);
      if (block) lines.push('\n');
    }
  }
}

/**
 * Both readings of a subtree's text: block-aware for counting words, flat for
 * matching `textContent`.
 * @param {Node} node
 * @returns {{ lines: string, flat: string }}
 */
export function readText(node) {
  if (node.nodeType === 3) {
    const data = /** @type {Text} */ (node).data;
    return { lines: data, flat: data };
  }
  /** @type {string[]} */ const lines = [];
  /** @type {string[]} */ const flat = [];
  _collectText(node, lines, flat);
  return { lines: lines.join(''), flat: flat.join('') };
}

/**
 * Word and character counts for a subtree, cached per top-level child.
 *
 * `Intl.Segmenter` over a whole document was the most expensive thing the
 * editor did per keystroke. A keystroke changes one block, so a cached counter
 * re-segments only that block; the rest costs a string comparison.
 */
export class TextCounter {
  constructor() {
    /**
     * Keyed on the child node itself, so removed nodes fall out with no
     * bookkeeping.
     * @type {WeakMap<Node, {key: string, words: number, chars: number}>}
     */
    this._cache = new WeakMap();
  }

  /**
   * @param {HTMLElement} root
   * @returns {{ words: number, chars: number }}
   */
  counts(root) {
    let words = 0;
    let chars = 0;
    /** @type {{node: Node, key: string, text: string, start: number}[]} */
    const cold = [];
    /** @type {string[]} */
    const parts = [];
    let offset = 0;

    for (let node = root.firstChild; node; node = node.nextSibling) {
      const hit = this._cache.get(node);
      // The flat text is the change key. Read it from the node only when there
      // is an entry that could still be valid; a node with no entry is being
      // walked anyway, and that walk yields the same string for free.
      if (hit && hit.key === (node.textContent || '')) {
        words += hit.words;
        chars += hit.chars;
        continue;
      }
      const { lines, flat } = readText(node);
      cold.push({ node, key: flat, text: lines, start: offset });
      parts.push(lines);
      offset += lines.length + 1; // +1 for the newline the join inserts
    }

    if (cold.length) {
      const counted = _countBatch(cold, parts.join('\n'));
      cold.forEach((child, i) => {
        const entry = {
          key: child.key,
          words: counted[i],
          // Newlines are separators, not characters the reader typed — and the
          // ones inside a <pre> were never counted either.
          chars: child.key.replaceAll('\n', '').length,
        };
        this._cache.set(child.node, entry);
        words += entry.words;
        chars += entry.chars;
      });
    }

    return { words, chars };
  }
}

/**
 * Word counts for each cold child, from a single pass over their joined text.
 *
 * The children are joined with a newline, which is a word boundary in every
 * script, so no word can be counted across two of them. Segments arrive in
 * increasing offset order, so attributing each one is a walk, not a search.
 *
 * One pass rather than one call each: `Intl.Segmenter.segment()` carries enough
 * per-call setup that 1200 small calls cost roughly three times a single large
 * one, so the cold path — setHTML, paste, undo of a big edit — would otherwise
 * pay for the warm path's speed.
 * @param {{start: number, text: string}[]} cold
 * @param {string} joined
 * @returns {number[]}
 */
function _countBatch(cold, joined) {
  if (!_segmenter) return cold.map((c) => countWords(c.text));
  const counts = new Array(cold.length).fill(0);
  let i = 0;
  for (const seg of _segmenter.segment(joined)) {
    if (!seg.isWordLike) continue;
    while (i < cold.length - 1 && seg.index >= cold[i + 1].start) i++;
    counts[i]++;
  }
  return counts;
}
