import AutumnNote from '../../src/js/index.js';
import { insertHTMLNative, insertTextNative, insertHorizontalRuleNative } from '../../src/js/editing/insert.js';

/**
 * The jsdom suite proves the DOM bookkeeping; this one proves the part jsdom
 * cannot: that a real engine's Selection and contenteditable agree with what
 * these functions do. Stage 1 of the execCommand migration only ships if it
 * behaves the same on all three engines.
 */
describe('native insertion primitives in a real browser', () => {
  let target;
  let editor;
  let editable;

  afterEach(() => {
    editor?.destroy();
    target?.remove();
    editor = null;
    target = null;
    editable = null;
  });

  function mount(html) {
    target = document.createElement('textarea');
    document.body.appendChild(target);
    editor = AutumnNote.create(target, { toolbar: [] });
    editable = document.querySelector('.an-editable');
    editor.invoke('editor.setHTML', html);
    editable.focus();
    return editable;
  }

  /** Puts the caret at `offset` inside the text node at `selector`. */
  function caret(selector, offset) {
    const node = editable.querySelector(selector).firstChild;
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  it('inserts HTML at the caret and leaves the caret after it', () => {
    mount('<p>ab</p>');
    caret('p', 1);

    expect(insertHTMLNative('<b>X</b>')).toBe(true);
    expect(insertHTMLNative('<u>Y</u>')).toBe(true);
    expect(editable.querySelector('p').innerHTML).toBe('a<b>X</b><u>Y</u>b');
  });

  it('replaces a real selection', () => {
    mount('<p>abcd</p>');
    const node = editable.querySelector('p').firstChild;
    const range = document.createRange();
    range.setStart(node, 1);
    range.setEnd(node, 3);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    insertHTMLNative('<i>Z</i>');
    expect(editable.querySelector('p').textContent).toBe('aZd');
  });

  it('inserts text literally, with newlines as <br> in a paragraph', () => {
    mount('<p>x</p>');
    caret('p', 1);

    insertTextNative('<b>&amp;</b>\ntwo');
    const p = editable.querySelector('p');
    expect(p.querySelector('b')).toBeNull();
    expect(p.querySelectorAll('br')).toHaveLength(1);
    expect(p.textContent).toBe('x<b>&amp;</b>two');
  });

  it('keeps a newline literal inside a <pre>, which the engine renders as a line break', () => {
    mount('<pre><code>ab</code></pre>');
    caret('pre code', 1);

    insertTextNative('\n');
    const pre = editable.querySelector('pre');
    expect(pre.querySelector('br')).toBeNull();
    expect(pre.textContent).toBe('a\nb');
    // The point of the special case: the engine actually lays this out as two
    // lines, which it would not for a "\n" in ordinary flow content.
    expect(getComputedStyle(pre).whiteSpace.startsWith('pre')).toBe(true);
  });

  it('places a rule after the caret block and gives the caret somewhere to go', () => {
    mount('<p>only</p>');
    caret('p', 4);

    expect(insertHorizontalRuleNative()).toBe(true);
    expect([...editable.children].map((el) => el.tagName)).toEqual(['P', 'HR', 'P']);

    const sel = window.getSelection();
    expect(editable.lastElementChild.contains(sel.getRangeAt(0).startContainer)).toBe(true);
  });

  it('declines to write when the selection is outside editable content', () => {
    mount('<p>ab</p>');
    const outside = document.createElement('p');
    outside.textContent = 'elsewhere';
    document.body.appendChild(outside);

    const range = document.createRange();
    range.setStart(outside.firstChild, 1);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    expect(insertHTMLNative('<b>X</b>')).toBe(false);
    expect(insertTextNative('X')).toBe(false);
    expect(insertHorizontalRuleNative()).toBe(false);
    expect(document.body.querySelector('hr')).toBeNull();
    outside.remove();
  });

  it('routes toolbar-level insertion through the native path', () => {
    mount('<p>ab</p>');
    caret('p', 2);

    editor.invoke('editor.insertText', 'CD');
    expect(editable.textContent).toContain('abCD');
  });
});
