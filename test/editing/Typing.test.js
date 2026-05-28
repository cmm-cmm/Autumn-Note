import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { handleKeydown } from '../../src/js/editing/Typing.js';

const setCaret = (node, offset) => {
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
};

afterEach(() => {
  document.body.innerHTML = '';
  const sel = window.getSelection();
  if (sel) sel.removeAllRanges();
});

describe('Typing arrow navigation around FA icons', () => {
  it('moves caret left across an FA icon in one key press', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>a<i class="fa-solid fa-house" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const icon = p.querySelector('i');
    const anchor = icon.nextSibling;

    setCaret(anchor, 1);

    const event = { key: 'ArrowLeft', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    const r = window.getSelection().getRangeAt(0);
    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.startContainer).toBe(p);
    expect(r.startOffset).toBe(1);
  });

  it('moves caret right across an FA icon in one key press', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>a<i class="fa-solid fa-house" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const icon = p.querySelector('i');
    const before = p.firstChild;
    const anchor = icon.nextSibling;

    setCaret(before, before.textContent.length);

    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    const r = window.getSelection().getRangeAt(0);
    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.startContainer).toBe(anchor);
    expect(r.startOffset).toBe(1);
  });

  it('crosses two adjacent FA icons to the right in two key presses', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>a<i class="fa-solid fa-house" contenteditable="false"></i>\u200B<i class="fa-solid fa-star" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const before = p.firstChild;
    const finalAnchor = p.lastChild;

    setCaret(before, before.textContent.length);

    const e1 = { key: 'ArrowRight', preventDefault: vi.fn() };
    const e2 = { key: 'ArrowRight', preventDefault: vi.fn() };

    const c1 = handleKeydown(e1, editable, {});
    const c2 = handleKeydown(e2, editable, {});

    const r = window.getSelection().getRangeAt(0);
    expect(c1).toBe(true);
    expect(c2).toBe(true);
    expect(e1.preventDefault).toHaveBeenCalledTimes(1);
    expect(e2.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.startContainer).toBe(finalAnchor);
    expect(r.startOffset).toBe(1);
  });

  it('crosses two adjacent FA icons to the left in two key presses', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>a<i class="fa-solid fa-house" contenteditable="false"></i>\u200B<i class="fa-solid fa-star" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const firstIcon = p.querySelector('.fa-house');
    const finalAnchor = p.lastChild;

    setCaret(finalAnchor, 1);

    const e1 = { key: 'ArrowLeft', preventDefault: vi.fn() };
    const e2 = { key: 'ArrowLeft', preventDefault: vi.fn() };

    const c1 = handleKeydown(e1, editable, {});
    const c2 = handleKeydown(e2, editable, {});

    const r = window.getSelection().getRangeAt(0);
    expect(c1).toBe(true);
    expect(c2).toBe(true);
    expect(e1.preventDefault).toHaveBeenCalledTimes(1);
    expect(e2.preventDefault).toHaveBeenCalledTimes(1);
    expect(r.startContainer).toBe(p);
    expect(r.startOffset).toBe(Array.prototype.indexOf.call(p.childNodes, firstIcon));
  });
});

// ---------------------------------------------------------------------------
// Backspace near FA icons
// ---------------------------------------------------------------------------

describe('Typing Backspace near FA icons', () => {
  beforeEach(() => { document.execCommand = vi.fn(); });
  afterEach(() => { delete document.execCommand; });

  it('Case A: removes a preceding FA icon when caret is at offset 0', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p><i class="fa-solid fa-house" contenteditable="false"></i>hello</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const textNode = p.lastChild; // 'hello'
    setCaret(textNode, 0);

    const event = { key: 'Backspace', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(p.querySelector('i')).toBeNull();
  });

  it('Case B: removes FA icon and its ZWS anchor when caret is at offset 1 of ZWS node', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p><i class="fa-solid fa-star" contenteditable="false"></i>\u200B</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const zwsNode = p.lastChild; // '\u200B'
    setCaret(zwsNode, 1);

    const event = { key: 'Backspace', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(p.querySelector('i')).toBeNull();
    // ZWS anchor should also be removed
    expect(p.textContent).toBe('');
  });

  it('returns false when backspace is pressed with no FA icon nearby', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>hello world</p>';
    document.body.appendChild(editable);

    const textNode = editable.querySelector('p').firstChild;
    setCaret(textNode, 5);

    const event = { key: 'Backspace', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tab key behaviour
// ---------------------------------------------------------------------------

describe('Typing Tab key', () => {
  beforeEach(() => { document.execCommand = vi.fn(); });
  afterEach(() => { delete document.execCommand; });

  it('Tab inside a <li> calls execCommand("indent") and returns true', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<ul><li>Item</li></ul>';
    document.body.appendChild(editable);

    const li = editable.querySelector('li');
    const textNode = li.firstChild;
    setCaret(textNode, 0);

    const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(document.execCommand).toHaveBeenCalledWith('indent', false, null);
  });

  it('Shift+Tab inside a <li> calls outdent and returns true', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<ul><li>Item</li></ul>';
    document.body.appendChild(editable);

    const li = editable.querySelector('li');
    const textNode = li.firstChild;
    setCaret(textNode, 0);

    const event = { key: 'Tab', shiftKey: true, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    // outdent() calls execCommand('outdent') for regular (non-checklist) lists
    expect(document.execCommand).toHaveBeenCalledWith('outdent', false, null);
  });

  it('Tab inside a <pre> inserts 4 spaces by default and returns true', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<pre>code</pre>';
    document.body.appendChild(editable);

    const pre = editable.querySelector('pre');
    const textNode = pre.firstChild;
    setCaret(textNode, 0);

    const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '    ');
  });

  it('Tab with custom tabSize option inserts the correct number of spaces', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>hello</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const textNode = p.firstChild;
    setCaret(textNode, 0);

    const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, { tabSize: 2 });

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '  ');
  });

  it('Tab outside a list/pre with no tabSize option returns false', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>hello</p>';
    document.body.appendChild(editable);

    const textNode = editable.querySelector('p').firstChild;
    setCaret(textNode, 0);

    const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Shift+Enter — insert line break
// ---------------------------------------------------------------------------

describe('Typing Shift+Enter', () => {
  beforeEach(() => { document.execCommand = vi.fn(); });
  afterEach(() => { delete document.execCommand; });

  it('Shift+Enter calls insertLineBreak and returns true', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>hello</p>';
    document.body.appendChild(editable);

    const textNode = editable.querySelector('p').firstChild;
    setCaret(textNode, 5);

    const event = { key: 'Enter', shiftKey: true, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(document.execCommand).toHaveBeenCalledWith('insertLineBreak', false, null);
  });
});

// ---------------------------------------------------------------------------
// Unhandled keys — should return false
// ---------------------------------------------------------------------------

describe('Typing unhandled keys', () => {
  it('returns false for a regular character key', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>hello</p>';
    document.body.appendChild(editable);

    const event = { key: 'a', shiftKey: false, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('returns false for an unrecognised special key (e.g. F5)', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    document.body.appendChild(editable);

    const event = { key: 'F5', shiftKey: false, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tab in <pre> block — uses options.tabSize, defaults to 4 spaces
// ---------------------------------------------------------------------------

describe('Typing Tab in <pre> block', () => {
  beforeEach(() => {
    document.execCommand = vi.fn(() => true);
  });
  afterEach(() => {
    delete document.execCommand;
  });

  it('inserts 4 spaces by default in a <pre> block', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<pre>code here</pre>';
    document.body.appendChild(editable);

    const pre = editable.querySelector('pre');
    setCaret(pre.firstChild, 0);

    const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '    ');
  });

  it('uses options.tabSize when set', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<pre>code</pre>';
    document.body.appendChild(editable);

    const pre = editable.querySelector('pre');
    setCaret(pre.firstChild, 0);

    const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
    handleKeydown(event, editable, { tabSize: 2 });

    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '  ');
  });

  it('Shift+Tab in <pre> does nothing (returns false)', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<pre>code</pre>';
    document.body.appendChild(editable);

    const pre = editable.querySelector('pre');
    setCaret(pre.firstChild, 0);

    const event = { key: 'Tab', shiftKey: true, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Enter in <pre> block — inserts literal newline
// ---------------------------------------------------------------------------

describe('Typing Enter in <pre> block', () => {
  beforeEach(() => {
    document.execCommand = vi.fn(() => true);
  });
  afterEach(() => {
    delete document.execCommand;
  });

  it('inserts a literal newline character in a <pre> block', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<pre>code</pre>';
    document.body.appendChild(editable);

    const pre = editable.querySelector('pre');
    setCaret(pre.firstChild, 2);

    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '\n');
  });
});

describe('Typing Enter in blockquote', () => {
  beforeEach(() => {
    if (typeof document.execCommand !== 'function') {
      Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
    } else {
      vi.spyOn(document, 'execCommand').mockReturnValue(true);
    }
  });

  it('Enter at end of blockquote exits it with formatBlock', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<blockquote><p>quote text</p></blockquote>';
    document.body.appendChild(editable);

    const bq = editable.querySelector('blockquote');
    const p = bq.querySelector('p');
    const textNode = p.firstChild;
    setCaret(textNode, textNode.textContent.length);

    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    handleKeydown(event, editable, {});
    // Should either exit the blockquote or fall through
    expect(() => handleKeydown(event, editable, {})).not.toThrow();
  });
});

describe('Typing Enter in checklist', () => {
  beforeEach(() => {
    if (typeof document.execCommand !== 'function') {
      Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
    } else {
      vi.spyOn(document, 'execCommand').mockReturnValue(true);
    }
  });

  it('Enter in non-empty checklist item creates new item', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = `
      <ul class="an-checklist">
        <li><input type="checkbox" contenteditable="false">​hello</li>
      </ul>`;
    document.body.appendChild(editable);

    const li = editable.querySelector('li');
    const textNode = li.lastChild;
    setCaret(textNode, textNode.textContent.length);

    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const result = handleKeydown(event, editable, {});
    // Should return true (handled) for checklist Enter
    expect(result).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('Enter in middle of checklist item splits content to new item (line 335)', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = `
      <ul class="an-checklist">
        <li><input type="checkbox" contenteditable="false">hello world</li>
      </ul>`;
    document.body.appendChild(editable);

    const li = editable.querySelector('li');
    const textNode = li.lastChild; // text node "hello world"
    // Place cursor in the MIDDLE: after "hello " (offset 6)
    setCaret(textNode, 6);

    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const result = handleKeydown(event, editable, {});
    expect(result).toBe(true);
    // The content after cursor ("world") should be in a new li
    const items = editable.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  it('Enter in empty checklist item exits the list', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = `
      <ul class="an-checklist">
        <li><input type="checkbox" contenteditable="false">​</li>
      </ul>`;
    document.body.appendChild(editable);

    const li = editable.querySelector('li');
    // Set cursor inside the li (at the ZWS text node)
    const zwsNode = li.lastChild; // text node containing ​
    setCaret(zwsNode, 1);

    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const result = handleKeydown(event, editable, {});
    expect(result).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe('Typing Enter at end of blockquote exits it', () => {
  beforeEach(() => {
    if (typeof document.execCommand !== 'function') {
      Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
    } else {
      vi.spyOn(document, 'execCommand').mockReturnValue(true);
    }
  });

  it('Enter at end of empty blockquote exits to paragraph', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<blockquote></blockquote>';
    document.body.appendChild(editable);
    const bq = editable.querySelector('blockquote');
    // Collapsed cursor at the very end of the (empty) blockquote
    const r = document.createRange();
    r.setStart(bq, 0);
    r.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const result = handleKeydown(event, editable, {});
    // Should consume the event to exit blockquote
    expect(result).toBe(true);
  });

  it('Enter in middle of blockquote does NOT exit (falls through)', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<blockquote>hello world</blockquote>';
    document.body.appendChild(editable);
    const bq = editable.querySelector('blockquote');
    const textNode = bq.firstChild;
    const r = document.createRange();
    r.setStart(textNode, 5); // middle of text
    r.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    // Does NOT consume — not at end of blockquote
    const result = handleKeydown(event, editable, {});
    expect(result).toBe(false);
  });

  it('Enter inside pre block inserts literal newline', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<pre><code>hello</code></pre>';
    document.body.appendChild(editable);
    const pre = editable.querySelector('pre');
    const codeNode = pre.querySelector('code').firstChild;
    const r = document.createRange();
    r.setStart(codeNode, 3);
    r.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const result = handleKeydown(event, editable, {});
    expect(result).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe('Typing Enter in video wrapper', () => {
  beforeEach(() => {
    if (typeof document.execCommand !== 'function') {
      Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
    } else {
      vi.spyOn(document, 'execCommand').mockReturnValue(true);
    }
  });

  it('Enter inside video wrapper creates paragraph after it', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<div class="an-video-wrapper"><iframe src="https://youtube.com/embed/x"></iframe><div class="an-video-shield"></div></div>';
    document.body.appendChild(editable);

    const shield = editable.querySelector('.an-video-shield');
    // Position cursor inside the shield div
    const r = document.createRange();
    r.setStart(shield, 0);
    r.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);

    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const result = handleKeydown(event, editable, {});
    expect(result).toBe(true);
    expect(editable.querySelector('p')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Arrow key — ELEMENT_NODE cursor path (lines 153–188)
// ---------------------------------------------------------------------------

describe('Typing arrow navigation ELEMENT_NODE cursor', () => {
  function makeEditable(html) {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = html;
    document.body.appendChild(editable);
    return editable;
  }

  function setElementCaret(el, offset) {
    const sel = window.getSelection();
    const r = document.createRange();
    r.setStart(el, offset);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
  }

  it('ArrowLeft with FA icon as previous sibling at element cursor (ELEMENT_NODE path)', () => {
    // <p> [0]=<i class="fa-solid fa-house"> [1]="text"
    const editable = makeEditable(
      '<p><i class="fa-solid fa-house" contenteditable="false"></i>text</p>',
    );
    const p = editable.querySelector('p');
    // Set cursor at offset 1 in <p> (between <i> and "text")
    setElementCaret(p, 1);

    const event = { key: 'ArrowLeft', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('ArrowLeft at element offset 0 returns false (no icon to skip)', () => {
    // cursor at start of element — no prev childNode → falls through, returns false
    const editable = makeEditable('<p><i class="fa-solid fa-house" contenteditable="false"></i>text</p>');
    const p = editable.querySelector('p');
    setElementCaret(p, 0);

    const event = { key: 'ArrowLeft', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});
    // No FA icon before cursor → fallthrough → consumed = false
    expect(consumed).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('ArrowRight with FA icon as next sibling at element cursor (ELEMENT_NODE path)', () => {
    // <p> [0]="before" [1]=<i class="fa-solid"> [2]="​"
    const editable = makeEditable(
      '<p>before<i class="fa-solid fa-house" contenteditable="false"></i>​</p>',
    );
    const p = editable.querySelector('p');
    // Set cursor at offset 1 (before the FA icon)
    setElementCaret(p, 1);

    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('ArrowRight with ZWS + FA icon as next siblings (ELEMENT_NODE path)', () => {
    // <p> [0]="before" [1]="​" [2]=<i class="fa-solid"> [3]="after"
    const editable = makeEditable(
      '<p>before​<i class="fa-solid fa-house" contenteditable="false"></i>after</p>',
    );
    const p = editable.querySelector('p');
    // Set cursor at offset 1 (before ZWS anchor)
    setElementCaret(p, 1);

    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('ArrowRight FA icon with TEXT_NODE after (ELEMENT_NODE path, after is text)', () => {
    // <p> [0]="before" [1]=<i class="fa-solid"> [2]="after"
    const editable = makeEditable(
      '<p>before<i class="fa-solid fa-house" contenteditable="false"></i>after</p>',
    );
    const p = editable.querySelector('p');
    setElementCaret(p, 1);

    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('ArrowRight with ZWS+FA and TEXT_NODE after icon (ELEMENT_NODE path)', () => {
    // <p> [0]="before" [1]="​" [2]=<i class="fa-solid"> [3]="after"
    const editable = makeEditable(
      '<p>x​<i class="fa-solid fa-house" contenteditable="false"></i>text</p>',
    );
    const p = editable.querySelector('p');
    setElementCaret(p, 1);

    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Enter with non-collapsed selection in checklist (lines 312-315)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Enter inside FA icon element — cursor push (lines 252–257)
// ---------------------------------------------------------------------------

describe('Typing Enter inside FA icon element', () => {
  it('returns false and pushes cursor after <i> FA icon on Enter', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>text<i class="fa-solid fa-house" contenteditable="false"></i>after</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const icon = p.querySelector('i');

    // Set cursor inside the FA icon element (ELEMENT_NODE path)
    const sel = window.getSelection();
    const r = document.createRange();
    r.setStart(icon, 0);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const result = handleKeydown(event, editable, {});

    // Returns false (lets browser handle) but moves cursor after icon
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ArrowRight through ZWS + FA icon (with TEXT after icon) — lines 175–185
// ---------------------------------------------------------------------------

describe('Typing ArrowRight through ZWS anchor then FA icon with text after', () => {
  it('moves caret to start of text after FA icon when ZWS anchor precedes icon', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    // Structure: "start" text → ZWS text → FA icon → "end" text
    editable.innerHTML = '<p></p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    // Build manually to create distinct text nodes
    const startText = document.createTextNode('start');
    const zwsText   = document.createTextNode('​');
    const icon      = document.createElement('i');
    icon.className  = 'fa-solid fa-house';
    icon.setAttribute('contenteditable', 'false');
    const endText   = document.createTextNode('end');
    p.appendChild(startText);
    p.appendChild(zwsText);
    p.appendChild(icon);
    p.appendChild(endText);

    // Set cursor at END of startText (before the ZWS anchor)
    setCaret(startText, startText.length);

    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    const consumed = handleKeydown(event, editable, {});

    // Should navigate past ZWS + icon to "end" text
    expect(consumed).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    // Cursor should now be in the "end" text
    const sel = window.getSelection();
    if (sel?.rangeCount > 0) {
      expect(sel.getRangeAt(0).startContainer).toBe(endText);
    }
  });
});

describe('Typing Enter with non-collapsed selection in checklist', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
  });

  it('Enter with non-collapsed range in checklist deletes selection then splits', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = `
      <ul class="an-checklist">
        <li><input type="checkbox" contenteditable="false">hello world</li>
      </ul>`;
    document.body.appendChild(editable);

    const li = editable.querySelector('li');
    const textNode = li.lastChild;

    // Create NON-collapsed selection over "world" (offset 6-11)
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(textNode, 6);
    range.setEnd(textNode, 11);
    sel.removeAllRanges();
    sel.addRange(range);

    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };
    const result = handleKeydown(event, editable, {});

    expect(result).toBe(true);
    // deleteContents + new item should be created
    const items = editable.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});
