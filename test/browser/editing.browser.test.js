import AutumnNote from '../../src/js/index.js';

/**
 * The jsdom suites cover the repair, the offset maths and the Tab rules in
 * isolation. This one covers the thing a user actually does, on the engine that
 * produces the damage: `execCommand('indent')` is what nests a sublist beside
 * its item, and jsdom implements neither execCommand nor Selection well enough
 * to see it.
 */
describe('editing flows in a real browser', () => {
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

  function mount(html, options = {}) {
    target = document.createElement('textarea');
    document.body.appendChild(target);
    editor = AutumnNote.create(target, { toolbar: [], ...options });
    editable = document.querySelector('.an-editable');
    editor.invoke('editor.setHTML', html);
    editable.focus();
    return editable;
  }

  const caretIn = (node, offset) => {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const pressTab = (shiftKey = false) =>
    editable.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true, shiftKey })
    );

  it('indents a list item into valid markup that survives Markdown export', () => {
    mount('<ul><li>a</li><li>b</li><li>c</li></ul>');
    caretIn(editable.querySelectorAll('li')[1].firstChild, 1);

    pressTab();

    expect(editable.querySelectorAll('ul > ul, ul > ol, ol > ul, ol > ol')).toHaveLength(0);
    expect(editable.querySelector('li > ul')).not.toBeNull();
    // The item used to disappear here entirely.
    expect(editor.invoke('editor.getMarkdown')).toBe('- a\n  - b\n- c');
  });

  it('outdents back to where it started, on every engine', () => {
    // Firefox's execCommand('outdent') dissolved the item into the one above —
    // `<li>a<ul><li>b</li></ul></li>` came back as `<li>a<br>b</li>`, three
    // items becoming two — so the nested case is done in the DOM instead.
    mount('<ul><li>a</li><li>b</li><li>c</li></ul>');
    caretIn(editable.querySelectorAll('li')[1].firstChild, 1);
    pressTab();

    const nested = editable.querySelector('li > ul li');
    caretIn(nested.firstChild, 1);
    pressTab(true);

    expect(editable.querySelectorAll('li')).toHaveLength(3);
    expect(editable.querySelector('li > ul')).toBeNull();
    // Scoped to the list: the editable always carries a trailing <p><br></p>.
    expect(editable.querySelector('ul br')).toBeNull();
    expect(editor.invoke('editor.getMarkdown')).toBe('- a\n- b\n- c');
  });

  it('leaves the caret at the edit after undo, not at the top of the document', () => {
    mount('<p>one</p><p>two</p><p>three</p>');
    caretIn(editable.querySelectorAll('p')[1].firstChild, 3);
    editor.invoke('editor.insertText', 'XX');
    expect(editable.textContent).toContain('twoXX');

    editor.invoke('editor.undo');

    expect(editable.innerHTML).toContain('<p>two</p>');
    const range = window.getSelection().getRangeAt(0);
    const probe = document.createRange();
    probe.selectNodeContents(editable);
    probe.setEnd(range.startContainer, range.startOffset);
    // "onetwo" — where the XX was, not 0.
    expect(probe.toString().length).toBe(6);
  });

  it('tabs between table cells and adds a row at the end', () => {
    mount('<table><tbody><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr></tbody></table>');
    const cellText = () => {
      let node = window.getSelection().getRangeAt(0).startContainer;
      if (node.nodeType === 3) node = node.parentElement;
      return node.closest('td, th')?.textContent.trim();
    };

    caretIn(editable.querySelectorAll('td')[0].firstChild, 2);
    pressTab();
    expect(cellText()).toBe('b1');
    pressTab();
    expect(cellText()).toBe('a2');
    pressTab();
    pressTab();

    expect(editable.querySelectorAll('tr')).toHaveLength(3);
    // No spaces were typed into the cells on the way through.
    expect(editable.querySelector('table').textContent.replace(/\s/g, '')).toBe('a1b1a2b2');
  });
});
