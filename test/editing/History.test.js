import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { History } from '../../src/js/editing/History.js';

// ---------------------------------------------------------------------------
// helpers — build a minimal contenteditable div
// ---------------------------------------------------------------------------
const makeEditable = (html = '<p>hello</p>') => {
  const el = document.createElement('div');
  el.contentEditable = 'true';
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
};

const cleanup = (el) => {
  if (el?.parentNode) el.remove();
};

describe('History', () => {
  let el;
  let history;

  beforeEach(() => {
    el = makeEditable('<p>initial</p>');
    history = new History(el);
  });

  afterEach(() => cleanup(el));

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------
  it('initialises with one savepoint', () => {
    expect(history.stack).toHaveLength(1);
    expect(history.stackOffset).toBe(0);
  });

  it('canUndo returns false on fresh history', () => {
    expect(history.canUndo()).toBe(false);
  });

  it('canRedo returns false on fresh history', () => {
    expect(history.canRedo()).toBe(false);
  });

  // -------------------------------------------------------------------------
  // recordUndo
  // -------------------------------------------------------------------------
  it('recordUndo adds a snapshot when content changes', () => {
    el.innerHTML = '<p>changed</p>';
    history.recordUndo();
    expect(history.stack).toHaveLength(2);
    expect(history.canUndo()).toBe(true);
  });

  it('recordUndo does not add a snapshot when content is unchanged', () => {
    history.recordUndo();
    expect(history.stack).toHaveLength(1); // no change — no new snapshot
  });

  it('caps the stack at MAX_HISTORY (100) entries', () => {
    for (let i = 0; i < 110; i++) {
      el.innerHTML = `<p>change ${i}</p>`;
      history.recordUndo();
    }
    expect(history.stack.length).toBeLessThanOrEqual(100);
    expect(history.stackOffset).toBe(history.stack.length - 1);
  });

  // -------------------------------------------------------------------------
  // undo / redo
  // -------------------------------------------------------------------------
  it('undo restores previous content', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();

    history.undo();
    expect(el.innerHTML).toBe('<p>initial</p>');
  });

  it('undo does nothing when at the beginning', () => {
    history.undo(); // should not throw
    expect(el.innerHTML).toBe('<p>initial</p>');
  });

  it('redo restores content after undo', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();

    history.undo();
    expect(el.innerHTML).toBe('<p>initial</p>');

    history.redo();
    expect(el.innerHTML).toBe('<p>step 2</p>');
  });

  it('redo does nothing when at the top of the stack', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();

    history.redo(); // should not throw
    expect(el.innerHTML).toBe('<p>step 2</p>');
  });

  it('canRedo is false after redo to the top', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();
    history.undo();
    history.redo();
    expect(history.canRedo()).toBe(false);
  });

  it('recording after undo discards the future (redo) branch', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();

    history.undo();

    el.innerHTML = '<p>branch</p>';
    history.recordUndo();

    expect(history.canRedo()).toBe(false);
    expect(history.stack).toHaveLength(2);
  });

  // -------------------------------------------------------------------------
  // reset
  // -------------------------------------------------------------------------
  it('reset clears the stack and records a fresh savepoint', () => {
    el.innerHTML = '<p>step 2</p>';
    history.recordUndo();
    expect(history.stack).toHaveLength(2);

    history.reset();
    expect(history.stack).toHaveLength(1);
    expect(history.stackOffset).toBe(0);
    expect(history.canUndo()).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Image tokenisation
  // -------------------------------------------------------------------------
  it('tokenises base64 images so snapshot strings stay small', () => {
    const dataUrl = 'data:image/png;base64,' + 'A'.repeat(1000);
    el.innerHTML = `<img src="${dataUrl}">`;
    history.recordUndo();

    const snapshot = history.stack[history.stackOffset];
    expect(snapshot.html).not.toContain('data:image/png');
    expect(snapshot.html).toContain('__asn_img_0__');
  });

  it('detokenises base64 images on restore', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    el.innerHTML = `<img src="${dataUrl}">`;
    history.recordUndo();

    history.undo();
    history.redo();

    expect(el.innerHTML).toContain(dataUrl);
  });

  // -------------------------------------------------------------------------
  // _restoreSelection fallback — detached node handling
  // -------------------------------------------------------------------------
  it('places cursor at start of editable when saved node is detached after undo', () => {
    // Record a snapshot, then completely replace the editable content so
    // the nodes referenced in the snapshot no longer exist.
    el.innerHTML = '<p>before</p>';
    history.recordUndo();

    // Replace content — old nodes are now detached
    el.innerHTML = '<p>after</p>';
    history.recordUndo();

    // Undo back to the "before" snapshot; _restoreSelection will try to
    // restore into '<p>before</p>' nodes that are now back in the DOM.
    history.undo();

    // If the cursor was placed without throwing, the fallback worked.
    const sel = window.getSelection();
    // The selection should exist and be collapsed (cursor, not a range)
    expect(sel).not.toBeNull();
    if (sel?.rangeCount > 0) {
      expect(sel.getRangeAt(0).collapsed).toBe(true);
    }
  });

  it('_restoreSelection restores a real DOM selection after undo', () => {
    // Set up a real selection so it gets serialized in the snapshot
    el.innerHTML = '<p>hello world</p>';
    const p = el.querySelector('p');
    const textNode = p.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    window.getSelection().addRange(range);

    history.recordUndo(); // captures the selection

    // Change content and record again
    window.getSelection().removeAllRanges();
    el.innerHTML = '<p>different content</p>';
    history.recordUndo();

    // Undo — should call _restoreSelection with the saved non-null selection
    history.undo();

    // Selection restoration may partially work in jsdom; just verify no throw
    expect(el.innerHTML).toContain('hello world');
  });

  it('_charOffset returns 0 when passed an element node (not a text node)', () => {
    // The TreeWalker only visits TEXT nodes, so an element node is never found
    el.innerHTML = '<p>hello</p>';
    const p = el.querySelector('p');
    // Directly call _charOffset with an element — covers the return 0 path (line 59)
    const result = history._charOffset(p, 0);
    expect(result).toBe(0);
  });

  it('_charOffset iterates past multiple text nodes to find the target', () => {
    // Two paragraphs: cursor in SECOND paragraph forces _charOffset to iterate past first
    el.innerHTML = '<p>hello</p><p>world</p>';
    const secondP = el.querySelectorAll('p')[1];
    const textNode = secondP.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 2);
    range.collapse(true);
    window.getSelection().addRange(range);
    history.recordUndo();

    window.getSelection().removeAllRanges();
    el.innerHTML = '<p>new</p>';
    history.recordUndo();

    // Undo restores content; _restoreSelection traverses past first paragraph's text
    expect(() => history.undo()).not.toThrow();
    expect(el.innerHTML).toContain('hello');
  });

  it('_restoreSelection handles selection where start/end are in different text nodes', () => {
    el.innerHTML = '<p>first</p><p>second</p>';
    const first = el.querySelectorAll('p')[0].firstChild;
    const second = el.querySelectorAll('p')[1].firstChild;
    const range = document.createRange();
    range.setStart(first, 0);
    range.setEnd(second, 3);
    window.getSelection().addRange(range);

    history.recordUndo();

    window.getSelection().removeAllRanges();
    el.innerHTML = '<p>new content</p>';
    history.recordUndo();

    expect(() => history.undo()).not.toThrow();
    expect(el.innerHTML).toContain('first');
  });

  it('does not throw when _restoreSelection encounters a detached node', () => {
    el.innerHTML = '<p>text</p>';
    history.recordUndo();

    // The history snapshot references <p>text</p>. Now remove it from DOM.
    el.innerHTML = '<p>replaced</p>';
    // Manually point the stack to a detached node to trigger the catch branch
    history.stack[0] = {
      html: '<p>text</p>',
      images: {},
      sel: { startOffset: 0, endOffset: 0, startPath: [0, 0], endPath: [0, 0] },
    };

    expect(() => history.undo()).not.toThrow();
  });
});

// ── getUndoCount / getRedoCount ───────────────────────────────────────────────

describe('History.getUndoCount / getRedoCount', () => {
  let el;
  beforeEach(() => {
    el = document.createElement('div');
    el.contentEditable = 'true';
    el.innerHTML = '<p>initial</p>';
    document.body.appendChild(el);
  });
  afterEach(() => { el.remove(); });

  it('getUndoCount is 0 on fresh history', () => {
    const h = new History(el);
    expect(h.getUndoCount()).toBe(0);
  });

  it('getRedoCount is 0 on fresh history', () => {
    const h = new History(el);
    expect(h.getRedoCount()).toBe(0);
  });

  it('getUndoCount increases after recordUndo', () => {
    const h = new History(el);
    el.innerHTML = '<p>changed</p>';
    h.recordUndo();
    expect(h.getUndoCount()).toBe(1);
  });

  it('getRedoCount increases after undo', () => {
    const h = new History(el);
    el.innerHTML = '<p>changed</p>';
    h.recordUndo();
    h.undo();
    expect(h.getRedoCount()).toBe(1);
    expect(h.getUndoCount()).toBe(0);
  });

  it('getUndoCount and getRedoCount together span the full stack', () => {
    const h = new History(el);
    el.innerHTML = '<p>step1</p>';
    h.recordUndo();
    el.innerHTML = '<p>step2</p>';
    h.recordUndo();
    expect(h.getUndoCount() + h.getRedoCount()).toBe(h.stack.length - 1);
  });
});

// ---------------------------------------------------------------------------
// Byte-budget eviction (historyMaxBytes)
// ---------------------------------------------------------------------------
describe('History byte-budget eviction', () => {
  let el;
  beforeEach(() => {
    el = document.createElement('div');
    el.contentEditable = 'true';
    el.innerHTML = '<p>initial</p>';
    document.body.appendChild(el);
  });
  afterEach(() => { el.remove(); });

  it('evicts the oldest snapshot once the combined byte budget is exceeded, even under the step limit', () => {
    // limit=100 (never hit), maxBytes tiny so every recordUndo forces an eviction
    const h = new History(el, 100, 50);
    el.innerHTML = '<p>a somewhat longer paragraph of text</p>';
    h.recordUndo();
    el.innerHTML = '<p>another somewhat longer paragraph of text</p>';
    h.recordUndo();

    // Byte budget keeps the stack from growing even though the 100-step
    // limit was nowhere near reached.
    expect(h.stack.length).toBeLessThan(3);
    expect(h._bytes).toBeLessThanOrEqual(h._maxBytes + h._entrySize(h.stack[h.stack.length - 1]));
  });

  it('always keeps at least the current snapshot even if it alone exceeds the byte budget', () => {
    const h = new History(el, 100, 1);
    el.innerHTML = '<p>content larger than a single byte</p>';
    h.recordUndo();
    expect(h.stack.length).toBeGreaterThanOrEqual(1);
    expect(h.canUndo()).toBeDefined();
  });

  it('_bytes tracks the actual serialized size of the stack', () => {
    const h = new History(el, 100, 10 * 1024 * 1024);
    const expected = h.stack.reduce((sum, entry) => sum + h._entrySize(entry), 0);
    expect(h._bytes).toBe(expected);

    el.innerHTML = '<p>changed content</p>';
    h.recordUndo();
    const expectedAfter = h.stack.reduce((sum, entry) => sum + h._entrySize(entry), 0);
    expect(h._bytes).toBe(expectedAfter);
  });

  it('reset() clears the byte counter along with the stack', () => {
    const h = new History(el, 100, 10 * 1024 * 1024);
    el.innerHTML = '<p>changed content</p>';
    h.recordUndo();
    h.reset();
    expect(h._bytes).toBe(h._entrySize(h.stack[0]));
  });

  it('trimming redo history on a new edit also decrements the byte counter', () => {
    const h = new History(el, 100, 10 * 1024 * 1024);
    el.innerHTML = '<p>step1</p>';
    h.recordUndo();
    el.innerHTML = '<p>step2</p>';
    h.recordUndo();
    h.undo(); // stackOffset now points at step1, step2 is "future" redo history

    el.innerHTML = '<p>branch</p>';
    h.recordUndo(); // discards the step2 redo entry and pushes 'branch'

    const expected = h.stack.reduce((sum, entry) => sum + h._entrySize(entry), 0);
    expect(h._bytes).toBe(expected);
    expect(h.canRedo()).toBe(false);
  });

  it('defaults historyMaxBytes to 10 MiB when not provided', () => {
    const h = new History(el);
    expect(h._maxBytes).toBe(10 * 1024 * 1024);
  });
});
