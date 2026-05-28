import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  WrappedRange,
  fromNativeRange,
  currentRange,
  rangeFromElement,
  collapsedRange,
  isSelectionInside,
  withSavedRange,
  splitText,
} from '../../src/js/core/range.js';

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
});

const makeEditable = (html = 'hello world') => {
  const el = document.createElement('div');
  el.contentEditable = 'true';
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
};

// ── WrappedRange ──────────────────────────────────────────────────────────────

describe('WrappedRange', () => {
  it('stores sc/so/ec/eo on construction', () => {
    const node = document.createTextNode('abc');
    const wr = new WrappedRange(node, 0, node, 3);
    expect(wr.sc).toBe(node);
    expect(wr.so).toBe(0);
    expect(wr.ec).toBe(node);
    expect(wr.eo).toBe(3);
  });

  it('isCollapsed returns true when start === end', () => {
    const node = document.createTextNode('abc');
    expect(new WrappedRange(node, 1, node, 1).isCollapsed()).toBe(true);
  });

  it('isCollapsed returns false when start !== end', () => {
    const node = document.createTextNode('abc');
    expect(new WrappedRange(node, 0, node, 3).isCollapsed()).toBe(false);
  });

  it('toNativeRange returns a Range with correct boundaries', () => {
    const el = makeEditable('hello');
    const textNode = el.firstChild;
    const wr = new WrappedRange(textNode, 0, textNode, 5);
    const range = wr.toNativeRange();
    expect(range instanceof Range).toBe(true);
    expect(range.startContainer).toBe(textNode);
    expect(range.endContainer).toBe(textNode);
    expect(range.startOffset).toBe(0);
    expect(range.endOffset).toBe(5);
  });

  it('toNativeRange handles detached nodes without throwing', () => {
    const node = document.createTextNode('x');
    const wr = new WrappedRange(node, 99, node, 99);
    expect(() => wr.toNativeRange()).not.toThrow();
  });

  it('toString returns the selected text', () => {
    const el = makeEditable('hello');
    const textNode = el.firstChild;
    const wr = new WrappedRange(textNode, 0, textNode, 5);
    expect(wr.toString()).toBe('hello');
  });

  it('select adds the range to the window selection', () => {
    const el = makeEditable('hello');
    const textNode = el.firstChild;
    const wr = new WrappedRange(textNode, 0, textNode, 5);
    wr.select();
    const sel = window.getSelection();
    expect(sel.rangeCount).toBe(1);
    expect(sel.toString()).toBe('hello');
  });

  it('commonAncestor returns the parent element for text nodes', () => {
    const el = makeEditable('hello');
    const textNode = el.firstChild;
    const wr = new WrappedRange(textNode, 0, textNode, 3);
    expect(wr.commonAncestor()).toBe(el);
  });

  it('insertNode inserts a node at the start of the range', () => {
    const el = makeEditable('world');
    const textNode = el.firstChild;
    const wr = new WrappedRange(textNode, 0, textNode, 0);
    const span = document.createElement('span');
    span.textContent = 'hello ';
    wr.insertNode(span);
    expect(el.querySelector('span')).not.toBeNull();
  });

  it('blockNode returns the nearest block ancestor within editable', () => {
    const el = makeEditable('<p>text</p>');
    document.body.appendChild(el);
    const p = el.querySelector('p');
    const textNode = p.firstChild;
    const wr = new WrappedRange(textNode, 0, textNode, 2);
    expect(wr.blockNode(el)).toBe(p);
  });

  it('getClientRects returns null when range has no rects', () => {
    const el = makeEditable('hello');
    const textNode = el.firstChild;
    const wr = new WrappedRange(textNode, 0, textNode, 3);
    // jsdom does not implement getClientRects on Range — stub via toNativeRange
    vi.spyOn(wr, 'toNativeRange').mockReturnValue({ getClientRects: () => ({ length: 0 }) });
    expect(wr.getClientRects()).toBeNull();
  });

  it('getClientRects returns last rect when rects exist', () => {
    const el = makeEditable('hello');
    const textNode = el.firstChild;
    const wr = new WrappedRange(textNode, 0, textNode, 3);
    const rect = { x: 10, y: 20, width: 50, height: 15 };
    vi.spyOn(wr, 'toNativeRange').mockReturnValue({ getClientRects: () => ({ length: 2, 0: {}, 1: rect }) });
    expect(wr.getClientRects()).toBe(rect);
  });
});

// ── fromNativeRange ───────────────────────────────────────────────────────────

describe('fromNativeRange', () => {
  it('wraps a native range into a WrappedRange', () => {
    const el = makeEditable('hello');
    const textNode = el.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    const wr = fromNativeRange(range);
    expect(wr instanceof WrappedRange).toBe(true);
    expect(wr.sc).toBe(textNode);
    expect(wr.eo).toBe(5);
  });
});

// ── rangeFromElement ──────────────────────────────────────────────────────────

describe('rangeFromElement', () => {
  it('covers entire element childNodes', () => {
    const el = makeEditable('<p>a</p><p>b</p>');
    const wr = rangeFromElement(el);
    expect(wr.sc).toBe(el);
    expect(wr.so).toBe(0);
    expect(wr.ec).toBe(el);
    expect(wr.eo).toBe(el.childNodes.length);
  });
});

// ── collapsedRange ────────────────────────────────────────────────────────────

describe('collapsedRange', () => {
  it('creates a collapsed range at node/0 by default', () => {
    const node = document.createTextNode('abc');
    const wr = collapsedRange(node);
    expect(wr.isCollapsed()).toBe(true);
    expect(wr.so).toBe(0);
  });

  it('creates a collapsed range at given offset', () => {
    const node = document.createTextNode('abc');
    const wr = collapsedRange(node, 2);
    expect(wr.so).toBe(2);
    expect(wr.eo).toBe(2);
  });
});

// ── currentRange ─────────────────────────────────────────────────────────────

describe('currentRange', () => {
  it('returns null when no selection exists', () => {
    expect(currentRange()).toBeNull();
  });

  it('returns a WrappedRange matching the active selection', () => {
    const el = makeEditable('hello');
    const textNode = el.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    window.getSelection().addRange(range);
    const wr = currentRange();
    expect(wr).not.toBeNull();
    expect(wr.toString()).toBe('hello');
  });

  it('returns null when selection is outside editable', () => {
    const el = makeEditable('hello');
    const outside = document.createElement('p');
    outside.textContent = 'outside';
    document.body.appendChild(outside);
    const range = document.createRange();
    range.selectNodeContents(outside);
    window.getSelection().addRange(range);
    expect(currentRange(el)).toBeNull();
  });

  it('returns WrappedRange when selection is inside editable', () => {
    const el = makeEditable('hello');
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().addRange(range);
    expect(currentRange(el)).not.toBeNull();
  });
});

// ── isSelectionInside ─────────────────────────────────────────────────────────

describe('isSelectionInside', () => {
  it('returns false when no selection', () => {
    const el = makeEditable('test');
    expect(isSelectionInside(el)).toBe(false);
  });

  it('returns true when selection is inside element', () => {
    const el = makeEditable('hello');
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().addRange(range);
    expect(isSelectionInside(el)).toBe(true);
  });

  it('returns false when selection is outside element', () => {
    const el = makeEditable('hello');
    const outside = document.createElement('p');
    outside.textContent = 'other';
    document.body.appendChild(outside);
    const range = document.createRange();
    range.selectNodeContents(outside);
    window.getSelection().addRange(range);
    expect(isSelectionInside(el)).toBe(false);
  });
});

// ── withSavedRange ─────────────────────────────────────────────────────────────

describe('withSavedRange', () => {
  it('calls fn(null) when no selection', () => {
    let received;
    withSavedRange((wr) => { received = wr; });
    expect(received).toBeNull();
  });

  it('calls fn with WrappedRange and restores selection after', () => {
    const el = makeEditable('hello');
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().addRange(range);

    let captured;
    withSavedRange((wr) => { captured = wr; });
    expect(captured instanceof WrappedRange).toBe(true);
    // Selection should be restored
    expect(window.getSelection().rangeCount).toBe(1);
  });
});

// ── splitText ────────────────────────────────────────────────────────────────

describe('splitText', () => {
  it('splits a text node at the given offset', () => {
    const el = makeEditable('helloworld');
    const textNode = el.firstChild;
    const [before, after] = splitText(textNode, 5);
    expect(before.textContent).toBe('hello');
    expect(after.textContent).toBe('world');
  });

  it('returns both text nodes as part of the DOM', () => {
    const el = makeEditable('abcdef');
    const textNode = el.firstChild;
    const [before, after] = splitText(textNode, 3);
    expect(el.childNodes.length).toBe(2);
    expect(el.childNodes[0]).toBe(before);
    expect(el.childNodes[1]).toBe(after);
  });
});
