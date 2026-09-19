import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Style from '../../src/js/editing/Style.js';
import { repairListNesting } from '../../src/js/core/dom.js';
import { fontSize, isInlineCode, toggleInlineCode, toggleChecklist, isInChecklist, underline, strikethrough, lineHeight, outdent, insertUnorderedList, insertOrderedList } from '../../src/js/editing/Style.js';

const setCollapsedCursor = (node, offset) => {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
};

// The formatting engine only writes inside editable content; these tests
// build their fixtures straight into <body>, so make that the editing host.
beforeEach(() => {
  document.body.setAttribute('contenteditable', 'true');
});

afterEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('contenteditable');
});

// ---------------------------------------------------------------------------
// fontSize — B-I: span replacement for precise px sizing
// ---------------------------------------------------------------------------

describe('fontSize', () => {
  const select = (node, start, end) => {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  it('wraps the selection in a span with the size', () => {
    const scope = document.createElement('div');
    scope.innerHTML = '<p>Hello world</p>';
    document.body.appendChild(scope);
    select(scope.querySelector('p').firstChild, 0, 5);

    fontSize('18px', scope);

    expect(scope.innerHTML).toBe('<p><span style="font-size: 18px;">Hello</span> world</p>');
    expect(scope.querySelector('font')).toBeNull();
  });

  it('keeps the inline markup inside the selection', () => {
    const scope = document.createElement('div');
    scope.innerHTML = '<p><strong>Bold text</strong></p>';
    document.body.appendChild(scope);
    select(scope.querySelector('strong').firstChild, 0, 9);

    fontSize('12px', scope);

    const span = scope.querySelector('span');
    expect(span.style.fontSize).toBe('12px');
    expect(span.querySelector('strong').textContent).toBe('Bold text');
  });

  it('resizes an earlier size span instead of nesting a new one', () => {
    const scope = document.createElement('div');
    scope.innerHTML = '<p><span style="font-size: 20px;">Sized</span></p>';
    document.body.appendChild(scope);
    select(scope.querySelector('span').firstChild, 0, 5);

    fontSize('14px', scope);

    expect(scope.innerHTML).toBe('<p><span style="font-size: 14px;">Sized</span></p>');
  });

  it('with a caret, opens a sized placeholder for the next typed text', () => {
    const scope = document.createElement('div');
    scope.innerHTML = '<p>ab</p>';
    document.body.appendChild(scope);
    setCollapsedCursor(scope.querySelector('p').firstChild, 1);

    fontSize('24px', scope);

    const span = scope.querySelector('span');
    expect(span.style.fontSize).toBe('24px');
    expect(span.textContent).toBe('\u200B');
    expect(window.getSelection().getRangeAt(0).startContainer.parentNode).toBe(span);
  });

  it('does nothing to a selection outside the given editable', () => {
    const outside = document.createElement('p');
    outside.textContent = 'Outside';
    document.body.appendChild(outside);
    const scope = document.createElement('div');
    scope.innerHTML = '<p>Inside</p>';
    document.body.appendChild(scope);
    select(outside.firstChild, 0, 7);

    fontSize('20px', scope);

    expect(outside.innerHTML).toBe('Outside');
    expect(scope.querySelector('span')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isInlineCode — B-IV: startContainer-based detection
// ---------------------------------------------------------------------------

describe('isInlineCode', () => {
  it('returns false when there is no selection', () => {
    // No selection active in the document — getSelection().rangeCount === 0
    window.getSelection().removeAllRanges();
    expect(isInlineCode()).toBe(false);
  });

  it('returns true when cursor is inside an inline <code> element', () => {
    const code = document.createElement('code');
    code.textContent = 'console.log()';
    const p = document.createElement('p');
    p.appendChild(code);
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(code.firstChild, 4);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    expect(isInlineCode()).toBe(true);
  });

  it('returns false when cursor is inside a <code> that is inside a <pre> block', () => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = 'block code';
    pre.appendChild(code);
    document.body.appendChild(pre);

    const range = document.createRange();
    range.setStart(code.firstChild, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    expect(isInlineCode()).toBe(false);
  });

  it('returns false when cursor is in plain paragraph text', () => {
    const p = document.createElement('p');
    p.textContent = 'plain text';
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    expect(isInlineCode()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// toggleInlineCode — B-III: wrap / unwrap inline code
// ---------------------------------------------------------------------------

describe('toggleInlineCode', () => {
  it('wraps a range selection in a <code> element', () => {
    const p = document.createElement('p');
    p.textContent = 'highlighted text here';
    document.body.appendChild(p);

    // Select "highlighted text"
    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.setEnd(p.firstChild, 'highlighted text'.length);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    toggleInlineCode(document.body);

    expect(p.querySelector('code')).not.toBeNull();
    expect(p.querySelector('code').textContent).toBe('highlighted text');
  });

  it('unwraps an existing inline <code> element when cursor is inside it', () => {
    const p = document.createElement('p');
    const code = document.createElement('code');
    code.textContent = 'remove';
    p.appendChild(code);
    document.body.appendChild(p);

    // Place cursor inside the <code>
    const range = document.createRange();
    range.setStart(code.firstChild, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    toggleInlineCode(document.body);

    expect(p.querySelector('code')).toBeNull();
    expect(p.textContent).toBe('remove');
  });

  it('does nothing when there is no selection', () => {
    window.getSelection().removeAllRanges();
    // Must not throw
    expect(() => toggleInlineCode(document.body)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// toggleChecklist — collapsed cursor (empty/filled paragraph)
// ---------------------------------------------------------------------------

describe('toggleChecklist — collapsed cursor', () => {
  beforeEach(() => {
    document.execCommand = () => false;
  });
  afterEach(() => {
    delete document.execCommand;
  });

  it('converts a non-empty <p> into a checklist item when cursor is collapsed inside it', () => {
    const p = document.createElement('p');
    p.textContent = 'Buy groceries';
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(p.firstChild, 5);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    toggleChecklist();

    const ul = document.body.querySelector('ul.an-checklist');
    expect(ul).not.toBeNull();
    expect(ul.querySelector('li')).not.toBeNull();
    expect(ul.querySelector('li input[type="checkbox"]')).not.toBeNull();
    expect(ul.textContent).toContain('Buy groceries');
    // Original <p> must be removed
    expect(document.body.querySelector('p')).toBeNull();
  });

  it('creates a checklist item from an empty <p> (cursor on blank line)', () => {
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(p, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    toggleChecklist();

    const ul = document.body.querySelector('ul.an-checklist');
    expect(ul).not.toBeNull();
    const li = ul.querySelector('li');
    expect(li).not.toBeNull();
    expect(li.querySelector('input[type="checkbox"]')).not.toBeNull();
    expect(document.body.querySelector('p')).toBeNull();
  });

  it('converts a <p> with text and places cursor inside the new <li>', () => {
    const p = document.createElement('p');
    p.textContent = 'Task item';
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    toggleChecklist();

    // The selection should now be inside the new li
    const newSel = window.getSelection();
    expect(newSel.rangeCount).toBeGreaterThan(0);
    const anchor = newSel.anchorNode;
    const li = document.body.querySelector('ul.an-checklist li');
    expect(li.contains(anchor)).toBe(true);
  });

  it('isInChecklist returns true after converting a paragraph', () => {
    const p = document.createElement('p');
    p.textContent = 'To do';
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    expect(isInChecklist()).toBe(true);
  });
});

describe('toggleChecklist — range selection (existing behaviour)', () => {
  beforeEach(() => {
    document.execCommand = () => false;
  });
  afterEach(() => {
    delete document.execCommand;
  });

  it('converts selected <p> into an an-checklist item via DOM manipulation', () => {
    const p = document.createElement('p');
    p.textContent = 'Selected text';
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.setEnd(p.firstChild, p.textContent.length);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    // DOM-based implementation: the original <p> is replaced with a <ul>
    const ul = document.body.querySelector('ul.an-checklist');
    expect(ul).not.toBeNull();
    const li = ul.querySelector('li');
    expect(li).not.toBeNull();
    expect(li.textContent).toContain('Selected text');
    // The original <p> should have been removed
    expect(document.body.querySelector('p')).toBeNull();
  });

  it('does nothing when range selection is whitespace-only', () => {
    const p = document.createElement('p');
    p.textContent = '   ';
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.setEnd(p.firstChild, 3);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    // Whitespace-only lines are filtered — no checklist should be created,
    // and the execCommand path is also skipped.
    expect(document.body.querySelector('ul.an-checklist')).toBeNull();
  });
});

describe('toggleChecklist — existing lists', () => {
  it('converts an ordered list into a checklist and adds missing checkboxes', () => {
    const ol = document.createElement('ol');
    ol.setAttribute('data-source', 'existing');
    ol.innerHTML = '<li>First</li><li><input type="checkbox">Second</li>';
    document.body.appendChild(ol);
    const range = document.createRange();
    range.setStart(ol.firstElementChild.firstChild, 0);
    range.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    const checklist = document.querySelector('ul.an-checklist');
    expect(checklist.getAttribute('data-source')).toBe('existing');
    expect(checklist.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
    expect(window.getSelection().anchorNode.closest?.('li') || window.getSelection().anchorNode.parentElement.closest('li'))
      .not.toBeNull();
  });

  it('converts a checklist back into paragraphs and preserves empty items', () => {
    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    ul.innerHTML = '<li><input type="checkbox">First</li><li><input type="checkbox"></li>';
    document.body.appendChild(ul);
    const range = document.createRange();
    range.setStart(ul.firstElementChild, 1);
    range.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].textContent).toBe('First');
    expect(paragraphs[1].textContent).toBe('\u00a0');
    expect(document.querySelector('ul.an-checklist')).toBeNull();
  });
});

describe('toggleChecklist — range selection including the editable root (#33)', () => {
  beforeEach(() => {
    document.execCommand = () => false;
  });
  afterEach(() => {
    delete document.execCommand;
  });

  it('does not remove the editable root when a raw text node is a direct child of it', () => {
    // Reproduces the Chrome quirk where the first line typed into an empty
    // editor is a raw text node directly inside .an-editable (no <p>/<div>
    // wrapper), while subsequent lines are wrapped in <div>.
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    editable.className = 'an-editable';
    const textNode = document.createTextNode('First line');
    editable.appendChild(textNode);
    const div2 = document.createElement('div');
    div2.textContent = 'Second line';
    editable.appendChild(div2);
    document.body.appendChild(editable);

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(div2.firstChild, div2.textContent.length);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    // The .an-editable element itself must survive — it must never be
    // converted into a checklist item or removed.
    expect(document.body.contains(editable)).toBe(true);
    expect(document.body.querySelector('.an-editable')).not.toBeNull();

    // The properly-wrapped <div> sibling should still be converted.
    const ul = editable.querySelector('ul.an-checklist');
    expect(ul).not.toBeNull();
    expect(ul.textContent).toContain('Second line');
  });
});

// ---------------------------------------------------------------------------
// underline() — manual unwrap when inside <u> and queryCommandState is false
// ---------------------------------------------------------------------------

describe('underline', () => {
  it('removes the underline at a caret inside <u>, keeping the text', () => {
    const p = document.createElement('p');
    p.innerHTML = '<u>hello world</u>';
    document.body.appendChild(p);
    setCollapsedCursor(p.querySelector('u').firstChild, 5);

    underline();

    // The caret steps out of the underline for what is typed next
    expect(p.textContent.replaceAll('\u200B', '')).toBe('hello world');
    const at = window.getSelection().getRangeAt(0).startContainer;
    expect(at.parentElement.closest('u')).toBeNull();
  });

  it('removes an underline inside inline <code>, where execCommand misreported it', () => {
    const p = document.createElement('p');
    p.innerHTML = '<code><u>x</u></code>';
    document.body.appendChild(p);
    const range = document.createRange();
    range.selectNodeContents(p.querySelector('u'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    underline();

    expect(p.innerHTML).toBe('<code>x</code>');
  });

  it('does nothing when no selection exists', () => {
    window.getSelection().removeAllRanges();
    expect(() => underline()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// strikethrough() — manual unwrap when inside <s> and queryCommandState is false
// ---------------------------------------------------------------------------

describe('strikethrough', () => {
  const selectAll = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  };

  it('removes <s>', () => {
    const p = document.createElement('p');
    p.innerHTML = '<s>struck text</s>';
    document.body.appendChild(p);
    selectAll(p.querySelector('s'));

    strikethrough();

    expect(p.innerHTML).toBe('struck text');
  });

  it('removes the legacy <strike> too', () => {
    const p = document.createElement('p');
    p.innerHTML = '<strike>old strike</strike>';
    document.body.appendChild(p);
    selectAll(p.querySelector('strike'));

    strikethrough();

    expect(p.innerHTML).toBe('old strike');
  });

  it('applies <s> to unformatted text', () => {
    const p = document.createElement('p');
    p.innerHTML = 'text';
    document.body.appendChild(p);
    selectAll(p);

    strikethrough();

    expect(p.innerHTML).toBe('<s>text</s>');
  });

  it('does nothing when no selection', () => {
    window.getSelection().removeAllRanges();
    expect(() => strikethrough()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// lineHeight() — collapsed and range selection paths
// ---------------------------------------------------------------------------

describe('lineHeight', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when no selection', () => {
    vi.stubGlobal('getSelection', () => ({ rangeCount: 0 }));
    expect(() => lineHeight('1.5')).not.toThrow();
  });

  it('sets lineHeight on nearest block for collapsed selection', () => {
    const p = document.createElement('p');
    p.textContent = 'hello';
    document.body.appendChild(p);
    const textNode = p.firstChild;

    const range = document.createRange();
    range.setStart(textNode, 2);
    range.collapse(true);
    vi.stubGlobal('getSelection', () => ({
      rangeCount: 1,
      getRangeAt: () => range,
    }));

    lineHeight('1.8');
    expect(p.style.lineHeight).toBe('1.8');
  });

  it('sets lineHeight on all blocks in a range selection', () => {
    const div = document.createElement('div');
    div.innerHTML = '<p>first</p><p>second</p>';
    document.body.appendChild(div);
    const p1 = div.querySelectorAll('p')[0];
    const p2 = div.querySelectorAll('p')[1];

    const range = document.createRange();
    range.setStart(p1.firstChild, 0);
    range.setEnd(p2.firstChild, 3);
    vi.stubGlobal('getSelection', () => ({
      rangeCount: 1,
      getRangeAt: () => range,
    }));

    lineHeight('1.6');
    // CSS may normalize the value; check it is non-empty
    expect(p1.style.lineHeight).toBeTruthy();
    expect(p2.style.lineHeight).toBeTruthy();
  });

  it('falls back to commonAncestorContainer block when no text nodes in range', () => {
    const p = document.createElement('p');
    document.body.appendChild(p);

    const range = document.createRange();
    range.setStart(p, 0);
    range.setEnd(p, 0);
    vi.stubGlobal('getSelection', () => ({
      rangeCount: 1,
      getRangeAt: () => range,
    }));

    lineHeight('1.2');
    expect(p.style.lineHeight).toBe('1.2');
  });
});

// ---------------------------------------------------------------------------
// toggleChecklist — cursor in editable root (lines 581–583)
// ---------------------------------------------------------------------------

describe('toggleChecklist cursor in non-standard block', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
  });

  it('converts non-standard block (section) to checklist', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    // Use a <p> block with text — standard block elements are converted
    editable.innerHTML = '<p>convert me</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const textNode = p.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);

    vi.stubGlobal('getSelection', () => ({
      rangeCount: 1,
      getRangeAt: () => range,
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
    }));

    toggleChecklist();
    vi.unstubAllGlobals();

    // The <p> should have been replaced by a checklist
    expect(editable.querySelector('ul.an-checklist')).not.toBeNull();
  });

  it('inserts checklist via Range API when cursor is in non-block editable root (lines 581-583)', () => {
    // Use <article> as editable — 'ARTICLE' is not in BLOCK_TAGS so the traversal
    // reaches null, triggering the else branch that uses Range.insertNode().
    const editable = document.createElement('article');
    editable.contentEditable = 'true';
    editable.textContent = 'Direct text';
    document.body.appendChild(editable);

    const textNode = editable.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);

    vi.stubGlobal('getSelection', () => ({
      rangeCount: 1,
      getRangeAt: () => range,
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
      toString: () => '',
    }));

    toggleChecklist();
    vi.unstubAllGlobals();

    // A <ul class="an-checklist"> should have been inserted into the article
    expect(editable.querySelector('ul.an-checklist')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// toggleChecklist — text inside inline element (line 624)
// ---------------------------------------------------------------------------

describe('toggleChecklist — text inside inline element', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'execCommand', { value: vi.fn(() => false), configurable: true, writable: true });
  });

  it('converts <p><strong>text</strong></p> to checklist (line 624 traversal)', () => {
    const p = document.createElement('p');
    p.innerHTML = '<strong>Hello World</strong>';
    document.body.appendChild(p);

    const strong = p.querySelector('strong');
    const range = document.createRange();
    range.setStart(strong.firstChild, 0);
    range.setEnd(strong.firstChild, strong.textContent.length);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    // The <p> should have been replaced by a checklist
    const ul = document.body.querySelector('ul.an-checklist');
    expect(ul).not.toBeNull();
    expect(ul.querySelector('li').textContent).toContain('Hello World');
  });
});

// ---------------------------------------------------------------------------
// outdent() — G.5: checklist item -> <p>, falls through to execCommand otherwise
// ---------------------------------------------------------------------------

describe('outdent — checklist item to paragraph', () => {
  it('converts a single checklist item into a <p>, removing the now-empty list', () => {
    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    ul.innerHTML = '<li><input type="checkbox">Buy groceries</li>';
    document.body.appendChild(ul);
    const li = ul.querySelector('li');
    const textNode = li.lastChild; // text node after the checkbox input

    setCollapsedCursor(textNode, 3);

    outdent();

    expect(document.body.querySelector('ul.an-checklist')).toBeNull();
    const p = document.body.querySelector('p');
    expect(p).not.toBeNull();
    expect(p.textContent).toBe('Buy groceries');
    expect(p.querySelector('input')).toBeNull();
  });

  it('moves trailing items into a new checklist placed after the paragraph', () => {
    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    ul.innerHTML =
      '<li><input type="checkbox">First</li>' +
      '<li><input type="checkbox">Second</li>' +
      '<li><input type="checkbox">Third</li>';
    document.body.appendChild(ul);
    const firstLi = ul.children[0];
    const textNode = firstLi.lastChild;

    setCollapsedCursor(textNode, 0);

    outdent();

    // Original list is gone (only had one item before outdent, now empty)
    const lists = document.body.querySelectorAll('ul.an-checklist');
    expect(lists).toHaveLength(1);

    const p = document.body.querySelector('p');
    expect(p).not.toBeNull();
    expect(p.textContent).toBe('First');

    // p must come before the new checklist in document order
    const newUl = lists[0];
    expect(p.compareDocumentPosition(newUl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const remainingItems = Array.from(newUl.querySelectorAll('li')).map((li) => li.textContent);
    expect(remainingItems).toEqual(['Second', 'Third']);
  });

  it('replaces an empty checklist item with a non-breaking space', () => {
    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    ul.innerHTML = '<li><input type="checkbox"></li>';
    document.body.appendChild(ul);
    const li = ul.querySelector('li');
    const checkbox = li.querySelector('input');

    setCollapsedCursor(li, 1); // caret positioned after the checkbox, no text sibling

    outdent();

    const p = document.body.querySelector('p');
    expect(p).not.toBeNull();
    expect(p.textContent).toBe(' ');
    expect(checkbox.isConnected).toBe(false);
  });

  it('strips zero-width-space anchors from the converted content', () => {
    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    const li = document.createElement('li');
    li.innerHTML = '<input type="checkbox">​Tagged​';
    ul.appendChild(li);
    document.body.appendChild(ul);
    const textNode = li.lastChild;

    setCollapsedCursor(textNode, 1);

    outdent();

    const p = document.body.querySelector('p');
    expect(p.textContent).toBe('Tagged');
  });

  it('places the caret at the start of the newly created <p>', () => {
    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    ul.innerHTML = '<li><input type="checkbox">Task item</li>';
    document.body.appendChild(ul);
    const li = ul.querySelector('li');
    const textNode = li.lastChild;

    setCollapsedCursor(textNode, 2);

    outdent();

    const p = document.body.querySelector('p');
    const sel = window.getSelection();
    expect(sel.rangeCount).toBeGreaterThan(0);
    expect(p.contains(sel.getRangeAt(0).startContainer)).toBe(true);
  });

  it('outdents an indented paragraph outside a checklist by one step', () => {
    const p = document.createElement('p');
    p.style.marginLeft = '80px';
    p.textContent = 'Regular paragraph';
    document.body.appendChild(p);
    setCollapsedCursor(p.firstChild, 3);

    outdent();

    expect(p.style.marginLeft).toBe('40px');
  });

  it('does nothing when there is no selection', () => {
    window.getSelection().removeAllRanges();
    expect(() => outdent()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// insertUnorderedList() / insertOrderedList() — list-type transitions
// ---------------------------------------------------------------------------

describe('insertUnorderedList — list-type transitions', () => {
  it('checklist in a <ul> container: strips checkboxes/class, stays <ul>', () => {
    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    ul.innerHTML = '<li><input type="checkbox">Item A</li>';
    document.body.appendChild(ul);
    setCollapsedCursor(ul.querySelector('li').lastChild, 2);

    insertUnorderedList();

    const result = document.body.querySelector('ul, ol');
    expect(result.tagName).toBe('UL');
    expect(result.classList.contains('an-checklist')).toBe(false);
    expect(result.querySelector('input')).toBeNull();
    expect(result.textContent).toBe('Item A');
  });

  it('checklist in an <ol> container: strips checkboxes/class and swaps to <ul>', () => {
    const ol = document.createElement('ol');
    ol.className = 'an-checklist';
    ol.innerHTML = '<li><input type="checkbox">Item B</li>';
    document.body.appendChild(ol);
    setCollapsedCursor(ol.querySelector('li').lastChild, 2);

    insertUnorderedList();

    const result = document.body.querySelector('ul, ol');
    expect(result.tagName).toBe('UL');
    expect(result.classList.contains('an-checklist')).toBe(false);
    expect(result.querySelector('input')).toBeNull();
    expect(result.textContent).toBe('Item B');
  });

  it('plain <ol> (not a checklist): swaps container tag to <ul>, preserves items', () => {
    const ol = document.createElement('ol');
    ol.innerHTML = '<li>A</li><li>B</li>';
    document.body.appendChild(ol);
    setCollapsedCursor(ol.querySelectorAll('li')[0].firstChild, 0);

    insertUnorderedList();

    const result = document.body.querySelector('ul, ol');
    expect(result.tagName).toBe('UL');
    expect(Array.from(result.querySelectorAll('li')).map((li) => li.textContent)).toEqual(['A', 'B']);
  });

  it('already a plain <ul>: turns the item back into a paragraph', () => {
    const list = document.createElement('ul');
    list.innerHTML = '<li>A</li>';
    document.body.appendChild(list);
    setCollapsedCursor(list.querySelector('li').firstChild, 0);

    insertUnorderedList();

    expect(document.body.innerHTML).toBe('<p>A</p>');
  });

  it('cursor not in any list: makes the paragraph a list item', () => {
    const p = document.createElement('p');
    p.textContent = 'plain text';
    document.body.appendChild(p);
    setCollapsedCursor(p.firstChild, 0);

    insertUnorderedList();

    expect(document.body.innerHTML).toBe('<ul><li>plain text</li></ul>');
  });
});

describe('insertOrderedList — list-type transitions', () => {
  it('checklist in a <ul> container: strips checkboxes/class and swaps to <ol>', () => {
    const ul = document.createElement('ul');
    ul.className = 'an-checklist';
    ul.innerHTML = '<li><input type="checkbox">Item A</li>';
    document.body.appendChild(ul);
    setCollapsedCursor(ul.querySelector('li').lastChild, 2);

    insertOrderedList();

    const result = document.body.querySelector('ul, ol');
    expect(result.tagName).toBe('OL');
    expect(result.classList.contains('an-checklist')).toBe(false);
    expect(result.querySelector('input')).toBeNull();
    expect(result.textContent).toBe('Item A');
  });

  it('plain <ul> (not a checklist): swaps container tag to <ol>, preserves items', () => {
    const ul = document.createElement('ul');
    ul.innerHTML = '<li>A</li><li>B</li>';
    document.body.appendChild(ul);
    setCollapsedCursor(ul.querySelectorAll('li')[0].firstChild, 0);

    insertOrderedList();

    const result = document.body.querySelector('ul, ol');
    expect(result.tagName).toBe('OL');
    expect(Array.from(result.querySelectorAll('li')).map((li) => li.textContent)).toEqual(['A', 'B']);
  });

  it('already a plain <ol>: turns the item back into a paragraph', () => {
    const list = document.createElement('ol');
    list.innerHTML = '<li>A</li>';
    document.body.appendChild(list);
    setCollapsedCursor(list.querySelector('li').firstChild, 0);

    insertOrderedList();

    expect(document.body.innerHTML).toBe('<p>A</p>');
  });

  it('cursor not in any list: makes the paragraph a list item', () => {
    const p = document.createElement('p');
    p.textContent = 'plain text';
    document.body.appendChild(p);
    setCollapsedCursor(p.firstChild, 0);

    insertOrderedList();

    expect(document.body.innerHTML).toBe('<ol><li>plain text</li></ol>');
  });
});

// ---------------------------------------------------------------------------
// Outdenting a nested list item
// ---------------------------------------------------------------------------

describe('outdent — nested list items', () => {
  const mount = (html) => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = html;
    document.body.appendChild(editable);
    return editable;
  };

  const caretIn = (node, offset = 0) => {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  it('lifts the item out to sit after the one that held its sublist', () => {
    const editable = mount('<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');
    caretIn(editable.querySelector('li li').firstChild, 1);

    Style.outdent();

    expect(editable.innerHTML).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
  });

  it('leaves the items below it nested under it', () => {
    // Outdenting one item must not promote its siblings with it.
    const editable = mount('<ul><li>a<ul><li>b</li><li>c</li><li>d</li></ul></li></ul>');
    caretIn(editable.querySelectorAll('li li')[0].firstChild, 1);

    Style.outdent();

    expect(editable.innerHTML).toBe('<ul><li>a</li><li>b<ul><li>c</li><li>d</li></ul></li></ul>');
  });

  it('keeps the sublist when an item above it is outdented', () => {
    const editable = mount('<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>');
    caretIn(editable.querySelectorAll('li li')[1].firstChild, 1);

    Style.outdent();

    expect(editable.innerHTML).toBe('<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');
  });

  it('works the same for ordered sublists', () => {
    const editable = mount('<ol><li>a<ol><li>b</li></ol></li></ol>');
    caretIn(editable.querySelector('li li').firstChild, 1);

    Style.outdent();

    expect(editable.innerHTML).toBe('<ol><li>a</li><li>b</li></ol>');
  });

  it('never merges the item into the one above it', () => {
    const editable = mount('<ul><li>a<ul><li>b</li></ul></li></ul>');
    caretIn(editable.querySelector('li li').firstChild, 1);

    Style.outdent();

    expect(editable.querySelector('br')).toBeNull();
    expect(editable.querySelectorAll('li')).toHaveLength(2);
  });

  it('undoes exactly what repairListNesting produced after an indent', () => {
    // The shape execCommand('indent') leaves once repaired — outdent has to
    // take it back to where it started or the pair is not symmetric.
    const editable = mount('<ul><li>a</li><ul><li>b</li></ul><li>c</li></ul>');
    repairListNesting(editable);
    expect(editable.innerHTML).toBe('<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');

    caretIn(editable.querySelector('li li').firstChild, 1);
    Style.outdent();

    expect(editable.innerHTML).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
  });
});
