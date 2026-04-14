/**
 * test/core/dom.test.js
 * Unit tests for src/js/core/dom.js
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  ELEMENT_NODE, TEXT_NODE,
  isElement, isText, isVoid, isPara, isLi, isList, isTable,
  isInline, isEditable, isAnchor, isImage,
  closest, closestPara, ancestors, children,
  prevElement, nextElement,
  createElement, remove, unwrap, wrap, insertAfter,
  nodeValue, isEmpty, outerHtml,
  isInsideEditable, on, trapFocus,
} from '../../src/js/core/dom.js';

afterEach(() => { document.body.innerHTML = ''; });

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('ELEMENT_NODE / TEXT_NODE', () => {
  it('ELEMENT_NODE is 1', () => expect(ELEMENT_NODE).toBe(1));
  it('TEXT_NODE is 3', () => expect(TEXT_NODE).toBe(3));
});

// ---------------------------------------------------------------------------
// Node-type predicates
// ---------------------------------------------------------------------------

describe('isElement', () => {
  it('returns true for element nodes', () => expect(isElement(document.createElement('div'))).toBe(true));
  it('returns false for text nodes', () => expect(isElement(document.createTextNode('hi'))).toBe(false));
  // isElement uses short-circuit (node && ...) — null returns null which is falsy
  it('returns false for null', () => expect(isElement(null)).toBeFalsy());
});

describe('isText', () => {
  it('returns true for text nodes', () => expect(isText(document.createTextNode('x'))).toBe(true));
  it('returns false for elements', () => expect(isText(document.createElement('span'))).toBe(false));
  // isText uses short-circuit (node && ...) — null returns null which is falsy
  it('returns false for null', () => expect(isText(null)).toBeFalsy());
});

describe('isVoid', () => {
  ['br', 'hr', 'img', 'input', 'link', 'meta', 'source', 'wbr'].forEach((tag) => {
    it(`returns true for <${tag}>`, () => expect(isVoid(document.createElement(tag))).toBe(true));
  });
  it('returns false for <div>', () => expect(isVoid(document.createElement('div'))).toBe(false));
  it('returns false for <p>', () => expect(isVoid(document.createElement('p'))).toBe(false));
  it('returns false for text nodes', () => expect(isVoid(document.createTextNode('x'))).toBe(false));
});

describe('isPara', () => {
  ['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'td', 'th', 'pre'].forEach((tag) => {
    it(`returns true for <${tag}>`, () => expect(isPara(document.createElement(tag))).toBe(true));
  });
  it('returns false for <span>', () => expect(isPara(document.createElement('span'))).toBe(false));
  it('returns false for text nodes', () => expect(isPara(document.createTextNode('x'))).toBe(false));
});

describe('isLi', () => {
  it('returns true for <li>', () => expect(isLi(document.createElement('li'))).toBe(true));
  it('returns false for <ul>', () => expect(isLi(document.createElement('ul'))).toBe(false));
  it('returns false for <ol>', () => expect(isLi(document.createElement('ol'))).toBe(false));
});

describe('isList', () => {
  it('returns true for <ul>', () => expect(isList(document.createElement('ul'))).toBe(true));
  it('returns true for <ol>', () => expect(isList(document.createElement('ol'))).toBe(true));
  it('returns false for <li>', () => expect(isList(document.createElement('li'))).toBe(false));
  it('returns false for <div>', () => expect(isList(document.createElement('div'))).toBe(false));
});

describe('isTable', () => {
  it('returns true for <table>', () => expect(isTable(document.createElement('table'))).toBe(true));
  it('returns false for <td>', () => expect(isTable(document.createElement('td'))).toBe(false));
  it('returns false for <div>', () => expect(isTable(document.createElement('div'))).toBe(false));
});

describe('isInline', () => {
  ['a', 'b', 'em', 'i', 'span', 'strong', 'code', 'sup', 'sub', 'u', 's', 'small', 'big'].forEach((tag) => {
    it(`returns true for <${tag}>`, () => expect(isInline(document.createElement(tag))).toBe(true));
  });
  it('returns false for <div>', () => expect(isInline(document.createElement('div'))).toBe(false));
  it('returns false for <p>', () => expect(isInline(document.createElement('p'))).toBe(false));
});

describe('isEditable', () => {
  // jsdom does not implement isContentEditable correctly — mock via Object.defineProperty
  it('returns truthy for element with isContentEditable = true', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'isContentEditable', { get: () => true, configurable: true });
    expect(isEditable(el)).toBeTruthy();
  });
  it('returns falsy for element with isContentEditable = false', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'isContentEditable', { get: () => false, configurable: true });
    expect(isEditable(el)).toBeFalsy();
  });
  it('returns falsy for text nodes', () => {
    expect(isEditable(document.createTextNode('x'))).toBeFalsy();
  });
});

describe('isAnchor', () => {
  it('returns true for <a>', () => expect(isAnchor(document.createElement('a'))).toBe(true));
  it('returns false for <span>', () => expect(isAnchor(document.createElement('span'))).toBe(false));
});

describe('isImage', () => {
  it('returns true for <img>', () => expect(isImage(document.createElement('img'))).toBe(true));
  it('returns false for <div>', () => expect(isImage(document.createElement('div'))).toBe(false));
  it('returns false for <picture>', () => expect(isImage(document.createElement('picture'))).toBe(false));
});

// ---------------------------------------------------------------------------
// Tree traversal
// ---------------------------------------------------------------------------

describe('closest', () => {
  it('returns the node itself when it matches', () => {
    const p = document.createElement('p');
    expect(closest(p, isPara)).toBe(p);
  });

  it('walks up ancestors to find a matching node', () => {
    const p = document.createElement('p');
    const span = document.createElement('span');
    const text = document.createTextNode('hi');
    p.appendChild(span);
    span.appendChild(text);
    expect(closest(text, isPara)).toBe(p);
  });

  it('returns null when no ancestor matches', () => {
    const span = document.createElement('span');
    expect(closest(span, isTable)).toBeNull();
  });

  it('stops at the stopAt boundary (exclusive)', () => {
    const outer = document.createElement('p');
    const inner = document.createElement('span');
    outer.appendChild(inner);
    // `outer` is a para, but it is the stopAt boundary, so it should not match
    expect(closest(inner, isPara, outer)).toBeNull();
  });
});

describe('closestPara', () => {
  it('returns the nearest para ancestor', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    div.appendChild(span);
    expect(closestPara(span)).toBe(div);
  });

  it('returns the element itself if it is a para', () => {
    const p = document.createElement('p');
    expect(closestPara(p)).toBe(p);
  });
});

describe('ancestors', () => {
  it('returns intermediate ancestors up to (not including) stopAt', () => {
    const root = document.createElement('div');
    const mid = document.createElement('p');
    const leaf = document.createElement('span');
    root.appendChild(mid);
    mid.appendChild(leaf);
    expect(ancestors(leaf, root)).toEqual([mid]);
  });

  it('returns all ancestors when no stopAt given', () => {
    const outer = document.createElement('section');
    const inner = document.createElement('p');
    outer.appendChild(inner);
    const result = ancestors(inner);
    expect(result).toContain(outer);
  });

  it('returns empty array when node has no parent', () => {
    expect(ancestors(document.createElement('div'))).toEqual([]);
  });
});

describe('children', () => {
  it('returns all child nodes as an array', () => {
    const ul = document.createElement('ul');
    const li1 = document.createElement('li');
    const li2 = document.createElement('li');
    ul.appendChild(li1);
    ul.appendChild(li2);
    const result = children(ul);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(li1);
    expect(result[1]).toBe(li2);
  });

  it('returns empty array for childless nodes', () => {
    expect(children(document.createElement('br'))).toEqual([]);
  });

  it('includes text node children', () => {
    const p = document.createElement('p');
    const t = document.createTextNode('hello');
    p.appendChild(t);
    expect(children(p)).toContain(t);
  });
});

describe('prevElement', () => {
  it('skips text nodes and returns the previous element sibling', () => {
    const div = document.createElement('div');
    const a = document.createElement('a');
    const b = document.createElement('b');
    div.appendChild(a);
    div.appendChild(document.createTextNode(' '));
    div.appendChild(b);
    expect(prevElement(b)).toBe(a);
  });

  it('returns null when there is no previous element sibling', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    div.appendChild(span);
    expect(prevElement(span)).toBeNull();
  });

  it('returns null when all preceding siblings are text nodes', () => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode('text'));
    const span = document.createElement('span');
    div.appendChild(span);
    expect(prevElement(span)).toBeNull();
  });
});

describe('nextElement', () => {
  it('skips text nodes and returns the next element sibling', () => {
    const div = document.createElement('div');
    const a = document.createElement('a');
    const b = document.createElement('b');
    div.appendChild(a);
    div.appendChild(document.createTextNode(' '));
    div.appendChild(b);
    expect(nextElement(a)).toBe(b);
  });

  it('returns null when there is no next element sibling', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    div.appendChild(span);
    expect(nextElement(span)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// DOM mutation helpers
// ---------------------------------------------------------------------------

describe('createElement', () => {
  it('creates an element with the given tag', () => {
    expect(createElement('div').nodeName).toBe('DIV');
    expect(createElement('span').nodeName).toBe('SPAN');
  });

  it('sets attributes via the attrs object', () => {
    const el = createElement('a', { href: 'https://example.com', target: '_blank' });
    expect(el.getAttribute('href')).toBe('https://example.com');
    expect(el.getAttribute('target')).toBe('_blank');
  });

  it('appends string children as text nodes', () => {
    const el = createElement('span', {}, ['Hello']);
    expect(el.textContent).toBe('Hello');
  });

  it('appends element children', () => {
    const strong = document.createElement('strong');
    const el = createElement('p', {}, [strong]);
    expect(el.firstChild).toBe(strong);
  });

  it('handles mixed string and element children', () => {
    const em = document.createElement('em');
    em.textContent = 'world';
    const el = createElement('p', {}, ['Hello ', em]);
    expect(el.textContent).toBe('Hello world');
    expect(el.querySelector('em')).toBe(em);
  });

  it('creates element with no attrs or children when called with only tag', () => {
    const el = createElement('br');
    expect(el.attributes.length).toBe(0);
    expect(el.childNodes.length).toBe(0);
  });
});

describe('remove', () => {
  it('removes the node from its parent', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);
    remove(child);
    expect(parent.contains(child)).toBe(false);
  });

  it('is a no-op if the node has no parent', () => {
    expect(() => remove(document.createElement('span'))).not.toThrow();
  });

  it('is a no-op for null', () => {
    expect(() => remove(null)).not.toThrow();
  });
});

describe('unwrap', () => {
  it('replaces the node with its children in the parent', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const text = document.createTextNode('hello');
    span.appendChild(text);
    div.appendChild(span);

    unwrap(span);

    expect(div.querySelector('span')).toBeNull();
    expect(div.textContent).toBe('hello');
    expect(div.firstChild).toBe(text);
  });

  it('handles multiple children correctly', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const em = document.createElement('em');
    em.textContent = 'A';
    const strong = document.createElement('strong');
    strong.textContent = 'B';
    span.appendChild(em);
    span.appendChild(strong);
    div.appendChild(span);

    unwrap(span);

    expect(div.querySelector('span')).toBeNull();
    expect(div.querySelector('em')).toBe(em);
    expect(div.querySelector('strong')).toBe(strong);
  });

  it('is a no-op when the node has no parent', () => {
    expect(() => unwrap(document.createElement('span'))).not.toThrow();
  });
});

describe('wrap', () => {
  it('wraps a node with the given wrapper and returns the wrapper', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const strong = document.createElement('strong');
    div.appendChild(span);

    const result = wrap(span, strong);

    expect(result).toBe(strong);
    expect(div.firstChild).toBe(strong);
    expect(strong.firstChild).toBe(span);
  });
});

describe('insertAfter', () => {
  it('inserts a node after the last child', () => {
    const div = document.createElement('div');
    const a = document.createElement('a');
    div.appendChild(a);
    const b = document.createElement('b');

    insertAfter(b, a);

    expect(div.childNodes[0]).toBe(a);
    expect(div.childNodes[1]).toBe(b);
  });

  it('inserts between existing siblings', () => {
    const div = document.createElement('div');
    const first = document.createElement('a');
    const last = document.createElement('b');
    div.appendChild(first);
    div.appendChild(last);
    const mid = document.createElement('span');

    insertAfter(mid, first);

    expect(div.childNodes[0]).toBe(first);
    expect(div.childNodes[1]).toBe(mid);
    expect(div.childNodes[2]).toBe(last);
  });
});

// ---------------------------------------------------------------------------
// Content helpers
// ---------------------------------------------------------------------------

describe('nodeValue', () => {
  it('returns nodeValue of text nodes', () => {
    expect(nodeValue(document.createTextNode('hello'))).toBe('hello');
  });

  it('returns textContent of elements', () => {
    const el = document.createElement('p');
    el.textContent = 'world';
    expect(nodeValue(el)).toBe('world');
  });

  it('returns empty string for an empty element', () => {
    expect(nodeValue(document.createElement('div'))).toBe('');
  });
});

describe('isEmpty', () => {
  it('returns true for an empty text node', () => {
    expect(isEmpty(document.createTextNode(''))).toBe(true);
  });

  it('returns false for a non-empty text node', () => {
    expect(isEmpty(document.createTextNode('x'))).toBe(false);
  });

  it('always returns false for void elements (img, hr, br)', () => {
    expect(isEmpty(document.createElement('img'))).toBe(false);
    expect(isEmpty(document.createElement('hr'))).toBe(false);
    expect(isEmpty(document.createElement('br'))).toBe(false);
  });

  it('returns true for an element with only whitespace text', () => {
    const el = document.createElement('p');
    el.textContent = '   ';
    expect(isEmpty(el)).toBe(true);
  });

  it('returns false for an element with visible text', () => {
    const el = document.createElement('p');
    el.textContent = 'hello';
    expect(isEmpty(el)).toBe(false);
  });

  it('returns false for an element containing an img', () => {
    const el = document.createElement('p');
    el.appendChild(document.createElement('img'));
    expect(isEmpty(el)).toBe(false);
  });

  it('returns false for an element containing a table', () => {
    const el = document.createElement('div');
    el.appendChild(document.createElement('table'));
    expect(isEmpty(el)).toBe(false);
  });

  it('returns true for empty element with no content', () => {
    expect(isEmpty(document.createElement('p'))).toBe(true);
  });
});

describe('outerHtml', () => {
  it('returns the outerHTML string of an element', () => {
    const el = document.createElement('span');
    el.textContent = 'hi';
    expect(outerHtml(el)).toBe('<span>hi</span>');
  });

  it('works for elements with attributes', () => {
    const el = document.createElement('a');
    el.href = 'https://example.com';
    expect(outerHtml(el)).toContain('href');
  });
});

// ---------------------------------------------------------------------------
// isInsideEditable
// ---------------------------------------------------------------------------

describe('isInsideEditable', () => {
  // isEditable() relies on isContentEditable which jsdom doesn't fully support;
  // mock it via Object.defineProperty so closest() can find the editable ancestor.
  it('returns true when a node is inside a contenteditable element', () => {
    const editable = document.createElement('div');
    Object.defineProperty(editable, 'isContentEditable', { get: () => true, configurable: true });
    const child = document.createElement('p');
    editable.appendChild(child);
    document.body.appendChild(editable);
    expect(isInsideEditable(child)).toBe(true);
  });

  it('returns true for deeply nested node inside contenteditable', () => {
    const editable = document.createElement('div');
    Object.defineProperty(editable, 'isContentEditable', { get: () => true, configurable: true });
    const p = document.createElement('p');
    const span = document.createElement('span');
    p.appendChild(span);
    editable.appendChild(p);
    document.body.appendChild(editable);
    expect(isInsideEditable(span)).toBe(true);
  });

  it('returns false when outside any contenteditable', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(isInsideEditable(div)).toBe(false);
  });

  it('returns true for the editable element itself', () => {
    const editable = document.createElement('div');
    Object.defineProperty(editable, 'isContentEditable', { get: () => true, configurable: true });
    document.body.appendChild(editable);
    expect(isInsideEditable(editable)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// on() — event helper
// ---------------------------------------------------------------------------

describe('on', () => {
  it('adds an event listener that fires on trigger', () => {
    const el = document.createElement('button');
    document.body.appendChild(el);
    const spy = vi.fn();
    on(el, 'click', spy);
    el.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('listener receives the event object', () => {
    const el = document.createElement('button');
    document.body.appendChild(el);
    let received = null;
    on(el, 'click', (e) => { received = e; });
    el.click();
    expect(received).not.toBeNull();
    expect(received.type).toBe('click');
  });

  it('returns a disposer that removes the listener', () => {
    const el = document.createElement('button');
    document.body.appendChild(el);
    const spy = vi.fn();
    const dispose = on(el, 'click', spy);
    dispose();
    el.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('can add multiple independent listeners on the same element', () => {
    const el = document.createElement('button');
    document.body.appendChild(el);
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    on(el, 'click', spy1);
    on(el, 'click', spy2);
    el.click();
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// trapFocus() — keyboard focus trap
// ---------------------------------------------------------------------------

describe('trapFocus', () => {
  it('returns a disposer function', () => {
    const dialog = document.createElement('div');
    const btn = document.createElement('button');
    dialog.appendChild(btn);
    document.body.appendChild(dialog);
    const dispose = trapFocus(dialog, () => {});
    expect(typeof dispose).toBe('function');
    dispose();
  });

  it('calls onEscape when Escape is pressed', () => {
    const dialog = document.createElement('div');
    document.body.appendChild(dialog);
    const onEscape = vi.fn();
    const dispose = trapFocus(dialog, onEscape);

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onEscape).toHaveBeenCalledTimes(1);
    dispose();
  });

  it('disposer stops Escape from calling onEscape', () => {
    const dialog = document.createElement('div');
    document.body.appendChild(dialog);
    const onEscape = vi.fn();
    const dispose = trapFocus(dialog, onEscape);
    dispose();

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onEscape).not.toHaveBeenCalled();
  });
});
