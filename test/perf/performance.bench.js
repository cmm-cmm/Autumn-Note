/**
 * performance.bench.js — Vitest benchmarks for hot-path code.
 *
 * Run with:  npm run bench
 *
 * Each benchmark measures the actual improved implementation against a
 * reference baseline defined inline so both are visible in results.
 */

import { describe, bench } from 'vitest';
import { JSDOM } from 'jsdom';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a DOM environment for benchmarks that need document/window globals */
const makeDoc = (html = '') => {
  const dom = new JSDOM(`<body>${html}</body>`);
  return dom.window.document;
};

// ---------------------------------------------------------------------------
// 1. Clipboard — _cleanSocialHtml  (O(n²) while vs O(n) reverse-pass)
// ---------------------------------------------------------------------------

describe('Clipboard._cleanSocialHtml', () => {
  /**
   * Generates deeply nested span soup like Facebook/Twitter produce.
   * depth=6, breadth=4 → ~1365 nodes
   */
  function buildSpanSoup(depth = 6, breadth = 4) {
    if (depth === 0) return 'text';
    const children = Array.from({ length: breadth }, () => `<span>${buildSpanSoup(depth - 1, breadth)}</span>`).join('');
    return `<div>${children}</div>`;
  }

  const HTML = buildSpanSoup();

  /** O(n²) baseline — previous implementation */
  function cleanSocialLegacy(html) {
    const doc = makeDoc(html);
    const UNWRAP_TAGS = new Set(['span', 'div']);
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
      changed = false;
      iterations++;
      doc.querySelectorAll('span, div').forEach((el) => {
        if (!UNWRAP_TAGS.has(el.tagName.toLowerCase())) return;
        if (el.querySelector('a, strong, em, b, i, ul, ol, li, table, img, blockquote, pre, code, h1, h2, h3, h4, h5, h6')) return;
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        el.remove();
        changed = true;
      });
    }
    return doc.body.innerHTML;
  }

  /** O(n) current implementation */
  function cleanSocialFixed(html) {
    const doc = makeDoc(html);
    const candidates = Array.from(doc.querySelectorAll('span, div'));
    for (let i = candidates.length - 1; i >= 0; i--) {
      const el = candidates[i];
      if (!el.parentNode) continue;
      if (el.querySelector('a, strong, em, b, i, ul, ol, li, table, img, blockquote, pre, code, h1, h2, h3, h4, h5, h6')) continue;
      const parent = el.parentNode;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      el.remove();
    }
    return doc.body.innerHTML;
  }

  bench('legacy O(n²) while+querySelectorAll', () => {
    cleanSocialLegacy(HTML);
  });

  bench('current O(n) reverse single-pass', () => {
    cleanSocialFixed(HTML);
  });
});

// ---------------------------------------------------------------------------
// 2. FindReplace — _findAndHighlight  (unshift O(n²) vs push+reverse O(n))
// ---------------------------------------------------------------------------

describe('FindReplace._findAndHighlight array build', () => {
  const COUNT = 500; // simulate 500 search matches

  bench('legacy unshift() — O(n²)', () => {
    const matches = [];
    for (let i = COUNT - 1; i >= 0; i--) {
      matches.unshift({ mark: { className: 'an-highlight', id: i } });
    }
    return matches;
  });

  bench('current push() + reverse() — O(n)', () => {
    const matches = [];
    for (let i = COUNT - 1; i >= 0; i--) {
      matches.push({ mark: { className: 'an-highlight', id: i } });
    }
    matches.reverse();
    return matches;
  });
});

// ---------------------------------------------------------------------------
// 3. Typing.js — module-level vs inline predicate definition overhead
// ---------------------------------------------------------------------------

describe('Typing.handleKeydown predicate allocation', () => {
  const FA_INLINE = /\bfa-/;
  const node = { nodeName: 'I', className: 'fas fa-bold' };

  bench('legacy: create arrow fn + regex per call (×1000 keydowns)', () => {
    for (let i = 0; i < 1000; i++) {
      // Simulates what happened before: new regex object created on every call
      const isFAIcon = (n) => !!(n?.nodeName === 'I' && /\bfa-/.test(n?.className || ''));
      isFAIcon(node);
    }
  });

  bench('current: module-level fn + cached regex (×1000 keydowns)', () => {
    const isFAIconCached = (n) => !!(n?.nodeName === 'I' && FA_INLINE.test(n?.className || ''));
    for (let i = 0; i < 1000; i++) {
      isFAIconCached(node);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Toolbar._buildButtons — per-group append vs DocumentFragment
// ---------------------------------------------------------------------------

describe('Toolbar._buildButtons DOM append strategy', () => {
  // Simulate 8 groups × 6 buttons = 48 buttons total (typical toolbar)
  const GROUPS = 8;
  const BUTTONS_PER_GROUP = 6;

  bench('legacy: appendChild per group — n reflows', () => {
    const doc = makeDoc();
    const toolbar = doc.createElement('div');
    doc.body.appendChild(toolbar);

    for (let g = 0; g < GROUPS; g++) {
      const group = doc.createElement('div');
      group.className = 'an-btn-group';
      for (let b = 0; b < BUTTONS_PER_GROUP; b++) {
        const btn = doc.createElement('button');
        btn.textContent = `B${g}-${b}`;
        group.appendChild(btn);
      }
      toolbar.appendChild(group); // triggers reflow per group
    }
    return toolbar.children.length;
  });

  bench('current: DocumentFragment — single reflow', () => {
    const doc = makeDoc();
    const toolbar = doc.createElement('div');
    doc.body.appendChild(toolbar);
    const fragment = doc.createDocumentFragment();

    for (let g = 0; g < GROUPS; g++) {
      const group = doc.createElement('div');
      group.className = 'an-btn-group';
      for (let b = 0; b < BUTTONS_PER_GROUP; b++) {
        const btn = doc.createElement('button');
        btn.textContent = `B${g}-${b}`;
        group.appendChild(btn);
      }
      fragment.appendChild(group);
    }
    toolbar.appendChild(fragment); // single DOM write
    return toolbar.children.length;
  });
});

// ---------------------------------------------------------------------------
// 5. CodeTooltip._syncLangSelect — inline regex vs module-level cached regex
// ---------------------------------------------------------------------------

describe('CodeTooltip._syncLangSelect regex', () => {
  const className = 'language-javascript hljs';
  const CACHED_RE = /language-(\S+)/;

  bench('legacy: new regex on every sync call', () => {
    let result;
    for (let i = 0; i < 1000; i++) {
      result = (className.match(/language-(\S+)/) || [])[1] || '';
    }
    return result;
  });

  bench('current: module-level cached regex', () => {
    let result;
    for (let i = 0; i < 1000; i++) {
      result = (CACHED_RE.exec(className) || [])[1] || '';
    }
    return result;
  });
});

// ---------------------------------------------------------------------------
// 6. Statusbar counts — whole-document segmentation vs per-block cache
//
// This was the editor's most expensive per-keystroke path: `Intl.Segmenter`
// over the entire document, 6.4 ms of a 6.7 ms `afterCommand` on a 217 KiB
// document in Chromium. A keystroke changes one block, so the current
// implementation re-segments only that block.
// ---------------------------------------------------------------------------

describe('Statusbar word/char counts', () => {
  const PARAGRAPHS = 400;

  /** A document shaped like real editor content: prose, lists, code, tables. */
  function buildDoc(doc) {
    const editable = doc.createElement('div');
    const parts = [];
    for (let i = 0; i < PARAGRAPHS; i++) {
      parts.push(`<p>Paragraph ${i} with <strong>bold</strong> and <em>italic</em> plus filler text of a realistic length.</p>`);
      if (i % 10 === 0) parts.push(`<pre><code>const x${i} = ${i};\nconsole.log(x${i});</code></pre>`);
      if (i % 25 === 0) parts.push('<ul><li>one</li><li>two</li><li>three</li></ul>');
    }
    editable.innerHTML = parts.join('');
    return editable;
  }

  const segmenter = typeof Intl?.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'word' })
    : null;

  const doc = makeDoc();
  const editable = buildDoc(doc);

  /** Previous implementation: one segmentation pass over the whole document. */
  function countLegacy(el) {
    const text = el.textContent || '';
    let words = 0;
    if (segmenter) {
      for (const seg of segmenter.segment(text.trim())) if (seg.isWordLike) words++;
    } else {
      words = text.trim().split(/\s+/).length;
    }
    return { words, chars: text.replaceAll('\n', '').length };
  }

  /**
   * Current implementation, warm: every top-level child's text is unchanged, so
   * each costs one string comparison and nothing is re-segmented.
   */
  const cache = new WeakMap();
  function countCached(el) {
    let words = 0;
    let chars = 0;
    for (let node = el.firstChild; node; node = node.nextSibling) {
      const hit = cache.get(node);
      const key = node.textContent || '';
      if (hit && hit.key === key) {
        words += hit.words;
        chars += hit.chars;
        continue;
      }
      let w = 0;
      if (segmenter) {
        for (const seg of segmenter.segment(key.trim())) if (seg.isWordLike) w++;
      } else {
        w = key.trim() ? key.trim().split(/\s+/).length : 0;
      }
      const entry = { key, words: w, chars: key.replaceAll('\n', '').length };
      cache.set(node, entry);
      words += w;
      chars += entry.chars;
    }
    return { words, chars };
  }

  countCached(editable); // warm the cache the way a mounted editor would be

  bench('legacy: segment the whole document on every keystroke', () => countLegacy(editable));

  bench('current: per-block cache, one comparison per untouched block', () => countCached(editable));
});
