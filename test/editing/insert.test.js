import {
  insertHTMLNative, insertTextNative, insertLineBreakNative, insertHorizontalRuleNative,
} from '../../src/js/editing/insert.js';

/**
 * Stage 1 of the execCommand migration. Every function here returns false when
 * it cannot act, which is what keeps `Style.execCommand` able to fall back, so
 * the false cases matter as much as the successful ones.
 */
describe('native insertion primitives', () => {
  let editable;

  const mount = (html = '<p>ab</p>') => {
    editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    editable.innerHTML = html;
    document.body.appendChild(editable);
    return editable;
  };

  /** Puts the caret at `offset` inside `node`. */
  const caret = (node, offset) => {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return range;
  };

  /** Selects `[start, end)` inside `node`. */
  const select = (node, start, end) => {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  afterEach(() => {
    editable?.remove();
    editable = null;
    window.getSelection().removeAllRanges();
  });

  describe('insertHTMLNative', () => {
    it('inserts at the caret', () => {
      mount('<p>ab</p>');
      const text = editable.querySelector('p').firstChild;
      caret(text, 1);

      expect(insertHTMLNative('<b>X</b>')).toBe(true);
      expect(editable.querySelector('p').innerHTML).toBe('a<b>X</b>b');
    });

    it('replaces the selection', () => {
      mount('<p>abcd</p>');
      select(editable.querySelector('p').firstChild, 1, 3);

      expect(insertHTMLNative('<i>Z</i>')).toBe(true);
      expect(editable.querySelector('p').textContent).toBe('aZd');
      expect(editable.querySelector('i')).not.toBeNull();
    });

    it('inserts a multi-node fragment in order', () => {
      mount('<p>x</p>');
      caret(editable.querySelector('p').firstChild, 1);

      insertHTMLNative('<b>1</b><b>2</b><b>3</b>');
      expect([...editable.querySelectorAll('b')].map((b) => b.textContent)).toEqual(['1', '2', '3']);
    });

    it('leaves the caret after the inserted content', () => {
      mount('<p>ab</p>');
      caret(editable.querySelector('p').firstChild, 1);
      insertHTMLNative('<b>X</b>');

      insertHTMLNative('<u>Y</u>');
      expect(editable.querySelector('p').innerHTML).toBe('a<b>X</b><u>Y</u>b');
    });

    it('reports false with no selection so the caller can fall back', () => {
      mount();
      window.getSelection().removeAllRanges();
      expect(insertHTMLNative('<b>X</b>')).toBe(false);
      expect(editable.querySelector('b')).toBeNull();
    });

    it('refuses a selection outside any editable', () => {
      mount();
      const outside = document.createElement('p');
      outside.textContent = 'elsewhere';
      document.body.appendChild(outside);
      caret(outside.firstChild, 1);

      expect(insertHTMLNative('<b>X</b>')).toBe(false);
      expect(outside.querySelector('b')).toBeNull();
      outside.remove();
    });

    it('refuses a selection inside contenteditable="false"', () => {
      mount('<p>a<span contenteditable="false">locked</span></p>');
      caret(editable.querySelector('span').firstChild, 1);

      expect(insertHTMLNative('<b>X</b>')).toBe(false);
    });

    it('refuses a selection outside the editable it was given', () => {
      mount();
      const other = document.createElement('div');
      other.setAttribute('contenteditable', 'true');
      other.innerHTML = '<p>other</p>';
      document.body.appendChild(other);
      caret(other.querySelector('p').firstChild, 1);

      expect(insertHTMLNative('<b>X</b>', editable)).toBe(false);
      expect(other.querySelector('b')).toBeNull();
      other.remove();
    });
  });

  describe('insertTextNative', () => {
    it('inserts literal text without parsing it as HTML', () => {
      mount('<p>ab</p>');
      caret(editable.querySelector('p').firstChild, 1);

      expect(insertTextNative('<b>not markup</b>')).toBe(true);
      expect(editable.querySelector('b')).toBeNull();
      expect(editable.textContent).toBe('a<b>not markup</b>b');
    });

    it('replaces the selection', () => {
      mount('<p>abcd</p>');
      select(editable.querySelector('p').firstChild, 1, 3);

      insertTextNative('-');
      expect(editable.textContent).toBe('a-d');
    });

    it('turns newlines into <br> in ordinary content', () => {
      mount('<p>x</p>');
      caret(editable.querySelector('p').firstChild, 1);

      insertTextNative('one\ntwo');
      const p = editable.querySelector('p');
      expect(p.querySelectorAll('br')).toHaveLength(1);
      expect(p.textContent).toBe('xonetwo');
    });

    it('keeps newlines literal inside preformatted content', () => {
      mount('<pre><code>ab</code></pre>');
      caret(editable.querySelector('code').firstChild, 1);

      insertTextNative('\n');
      const pre = editable.querySelector('pre');
      expect(pre.querySelector('br')).toBeNull();
      expect(pre.textContent).toBe('a\nb');
    });

    it('reports false with no selection', () => {
      mount();
      window.getSelection().removeAllRanges();
      expect(insertTextNative('x')).toBe(false);
    });
  });

  describe('insertLineBreakNative', () => {
    it('inserts a br and moves the caret after it', () => {
      mount();
      caret(editable.querySelector('p').firstChild, 1);
      expect(insertLineBreakNative()).toBe(true);
      expect(editable.querySelector('p').innerHTML).toBe('a<br>b');
      expect(getSelection().anchorNode).toBe(editable.querySelector('p'));
    });

    it('returns false outside editable content', () => {
      const outside = document.createTextNode('outside');
      document.body.appendChild(outside);
      caret(outside, 0);
      expect(insertLineBreakNative()).toBe(false);
    });
  });

  describe('insertHorizontalRuleNative', () => {
    it('places the rule after the block holding the caret', () => {
      mount('<p>one</p><p>two</p>');
      caret(editable.querySelectorAll('p')[0].firstChild, 3);

      expect(insertHorizontalRuleNative()).toBe(true);
      const kids = [...editable.children].map((el) => el.tagName);
      expect(kids).toEqual(['P', 'HR', 'P']);
    });

    it('adds a paragraph to type in when the rule ends the document', () => {
      mount('<p>only</p>');
      caret(editable.querySelector('p').firstChild, 4);

      insertHorizontalRuleNative();
      expect([...editable.children].map((el) => el.tagName)).toEqual(['P', 'HR', 'P']);
      expect(editable.lastElementChild.querySelector('br')).not.toBeNull();
    });

    it('leaves the caret in the block after the rule', () => {
      mount('<p>only</p>');
      caret(editable.querySelector('p').firstChild, 4);
      insertHorizontalRuleNative();

      const sel = window.getSelection();
      expect(editable.lastElementChild.contains(sel.getRangeAt(0).startContainer)).toBe(true);
    });

    it('does not stack a second empty paragraph between two rules', () => {
      mount('<p>only</p>');
      caret(editable.querySelector('p').firstChild, 4);
      insertHorizontalRuleNative();
      insertHorizontalRuleNative();

      expect([...editable.children].map((el) => el.tagName)).toEqual(['P', 'HR', 'P', 'HR', 'P']);
    });

    it('reports false with no selection', () => {
      mount();
      window.getSelection().removeAllRanges();
      expect(insertHorizontalRuleNative()).toBe(false);
      expect(editable.querySelector('hr')).toBeNull();
    });
  });
});
