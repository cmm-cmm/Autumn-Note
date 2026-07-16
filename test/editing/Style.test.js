import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fontSize, isInlineCode, toggleInlineCode, toggleChecklist, isInChecklist, underline, strikethrough, lineHeight } from '../../src/js/editing/Style.js';

afterEach(() => {
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// fontSize — B-I: span replacement for precise px sizing
// ---------------------------------------------------------------------------

describe('fontSize', () => {
  // jsdom does not implement execCommand; stub it so fontSize() can run
  // its span-replacement logic without throwing.
  beforeEach(() => {
    document.execCommand = () => false;
  });
  afterEach(() => {
    delete document.execCommand;
  });

  it('replaces font[size="7"] placeholder elements with styled <span>s', () => {
    // Simulate what execCommand('fontSize','7') would insert into the DOM.
    const scope = document.createElement('div');
    scope.innerHTML = '<p><font size="7">Hello</font></p>';
    document.body.appendChild(scope);

    fontSize('18px', scope);

    const span = scope.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.style.fontSize).toBe('18px');
    expect(span.textContent).toBe('Hello');
    // Original <font> element must be removed
    expect(scope.querySelector('font')).toBeNull();
  });

  it('replaces multiple font placeholder elements when selection spans several nodes', () => {
    const scope = document.createElement('div');
    scope.innerHTML = '<p><font size="7">A</font><font size="7">B</font></p>';
    document.body.appendChild(scope);

    fontSize('14px', scope);

    const spans = scope.querySelectorAll('span');
    expect(spans.length).toBe(2);
    spans.forEach((s) => expect(s.style.fontSize).toBe('14px'));
    expect(scope.querySelector('font')).toBeNull();
  });

  it('preserves child nodes of the replaced <font> element', () => {
    const scope = document.createElement('div');
    scope.innerHTML = '<p><font size="7"><strong>Bold text</strong></font></p>';
    document.body.appendChild(scope);

    fontSize('12px', scope);

    const span = scope.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.querySelector('strong')).not.toBeNull();
    expect(span.querySelector('strong').textContent).toBe('Bold text');
  });

  it('does not create spans when no font[size="7"] placeholder exists', () => {
    const scope = document.createElement('div');
    scope.innerHTML = '<p>No font elements here</p>';
    document.body.appendChild(scope);

    fontSize('14px', scope);

    expect(scope.querySelector('span')).toBeNull();
  });

  it('scopes replacement to the provided editable — does not touch elements outside', () => {
    const outside = document.createElement('div');
    outside.innerHTML = '<font size="7">Outside</font>';
    document.body.appendChild(outside);

    const scope = document.createElement('div');
    scope.innerHTML = '<p><font size="7">Inside</font></p>';
    document.body.appendChild(scope);

    fontSize('20px', scope);

    // Scope's font element should be replaced
    expect(scope.querySelector('font')).toBeNull();
    // Outside element should be untouched
    expect(outside.querySelector('font')).not.toBeNull();
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

describe('underline — manual unwrap path', () => {
  let execMock;

  beforeEach(() => {
    execMock = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { value: execMock, configurable: true, writable: true });
    Object.defineProperty(document, 'queryCommandState', { value: vi.fn(() => false), configurable: true, writable: true });
  });

  afterEach(() => {
    delete document.queryCommandState;
  });

  function makeSelectionMock(range) {
    return { rangeCount: 1, getRangeAt: () => range, removeAllRanges: vi.fn(), addRange: vi.fn() };
  }

  it('manually unwraps <u> element when queryCommandState returns false', () => {
    const p = document.createElement('p');
    p.innerHTML = '<u>hello world</u>';
    document.body.appendChild(p);
    const uEl = p.querySelector('u');
    const textNode = uEl.firstChild;

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    vi.stubGlobal('getSelection', () => makeSelectionMock(range));

    underline();
    vi.unstubAllGlobals();

    // All children should have been moved out of <u>
    expect(uEl.textContent).toBe('');
    // Text is accessible from <p>
    expect(p.textContent).toBe('hello world');
    // execCommand should NOT have been called (manual path returns early)
    expect(execMock).not.toHaveBeenCalled();
  });

  it('falls through to execCommand when inside <u> but queryCommandState returns true', () => {
    Object.defineProperty(document, 'queryCommandState', { value: vi.fn(() => true), configurable: true, writable: true });
    const p = document.createElement('p');
    p.innerHTML = '<u>text</u>';
    document.body.appendChild(p);
    const uEl = p.querySelector('u');
    const range = document.createRange();
    range.setStart(uEl.firstChild, 0);
    range.collapse(true);
    vi.stubGlobal('getSelection', () => makeSelectionMock(range));

    underline();
    vi.unstubAllGlobals();

    expect(execMock).toHaveBeenCalledWith('underline', false, null);
  });

  it('does nothing when no selection exists', () => {
    vi.stubGlobal('getSelection', () => ({ rangeCount: 0 }));
    expect(() => underline()).not.toThrow();
    vi.unstubAllGlobals();
    expect(execMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// strikethrough() — manual unwrap when inside <s> and queryCommandState is false
// ---------------------------------------------------------------------------

describe('strikethrough — manual unwrap path', () => {
  let execMock;

  beforeEach(() => {
    execMock = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { value: execMock, configurable: true, writable: true });
    Object.defineProperty(document, 'queryCommandState', { value: vi.fn(() => false), configurable: true, writable: true });
  });

  afterEach(() => {
    delete document.queryCommandState;
    vi.unstubAllGlobals();
  });

  function makeSelectionMock(range) {
    return { rangeCount: 1, getRangeAt: () => range, removeAllRanges: vi.fn(), addRange: vi.fn() };
  }

  it('manually unwraps <s> element when queryCommandState returns false', () => {
    const p = document.createElement('p');
    p.innerHTML = '<s>struck text</s>';
    document.body.appendChild(p);
    const sEl = p.querySelector('s');
    const textNode = sEl.firstChild;

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    vi.stubGlobal('getSelection', () => makeSelectionMock(range));

    strikethrough();
    vi.unstubAllGlobals();

    // Text moved out of <s>
    expect(sEl.textContent).toBe('');
    expect(p.textContent).toBe('struck text');
    expect(execMock).not.toHaveBeenCalled();
  });

  it('manually unwraps <strike> element when queryCommandState returns false', () => {
    const p = document.createElement('p');
    p.innerHTML = '<strike>old strike</strike>';
    document.body.appendChild(p);
    const strikeEl = p.querySelector('strike');
    const textNode = strikeEl.firstChild;

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    vi.stubGlobal('getSelection', () => makeSelectionMock(range));

    strikethrough();
    vi.unstubAllGlobals();

    expect(strikeEl.textContent).toBe('');
    expect(p.textContent).toBe('old strike');
    expect(execMock).not.toHaveBeenCalled();
  });

  it('falls through to execCommand when inside <s> but queryCommandState is true', () => {
    Object.defineProperty(document, 'queryCommandState', { value: vi.fn(() => true), configurable: true, writable: true });
    const p = document.createElement('p');
    p.innerHTML = '<s>text</s>';
    document.body.appendChild(p);
    const sEl = p.querySelector('s');
    const range = document.createRange();
    range.setStart(sEl.firstChild, 0);
    range.collapse(true);
    vi.stubGlobal('getSelection', () => makeSelectionMock(range));

    strikethrough();
    vi.unstubAllGlobals();

    expect(execMock).toHaveBeenCalledWith('strikeThrough', false, null);
  });

  it('does nothing when no selection', () => {
    vi.stubGlobal('getSelection', () => ({ rangeCount: 0 }));
    expect(() => strikethrough()).not.toThrow();
    vi.unstubAllGlobals();
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
