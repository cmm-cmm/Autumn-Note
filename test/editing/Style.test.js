import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fontSize, isInlineCode, toggleInlineCode, toggleChecklist, isInChecklist } from '../../src/js/editing/Style.js';

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

  it('calls insertHTML with an-checklist markup for a range selection', () => {
    const p = document.createElement('p');
    p.textContent = 'Selected text';
    document.body.appendChild(p);

    let insertedHTML = '';
    document.execCommand = (cmd, _ui, val) => {
      if (cmd === 'insertHTML') insertedHTML = val;
      return false;
    };

    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.setEnd(p.firstChild, p.textContent.length);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    expect(insertedHTML).toContain('an-checklist');
    expect(insertedHTML).toContain('Selected text');
  });

  it('does nothing when range selection is whitespace-only', () => {
    const p = document.createElement('p');
    p.textContent = '   ';
    document.body.appendChild(p);

    let execCalled = false;
    document.execCommand = () => { execCalled = true; return false; };

    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.setEnd(p.firstChild, 3);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    toggleChecklist();

    // execCommand should NOT be called because all lines are empty after filter
    expect(execCalled).toBe(false);
  });
});
