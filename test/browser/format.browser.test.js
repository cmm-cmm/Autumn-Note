import { userEvent } from 'vitest/browser';
import AutumnNote from '../../src/js/index.js';

// The formatting engine's DOM suite, on each real engine. It was written
// against jsdom; running it here is what shows the transforms do not lean on
// anything jsdom happens to do differently from a browser.
import '../editing/format.test.js';

/**
 * What only a browser can show: text typed after a format was chosen with
 * nothing selected. The engine opens a placeholder for it, and the browser has
 * to put the typed characters inside that placeholder.
 */
describe('typing after a formatting command, on a real engine', () => {
  let target;
  let editor;
  let editable;

  afterEach(() => {
    editor?.destroy();
    target?.remove();
    editor = null;
    target = null;
  });

  function mount(html) {
    target = document.createElement('textarea');
    document.body.appendChild(target);
    editor = AutumnNote.create(target, { toolbar: [], bubbleToolbar: false });
    editable = editor.layoutInfo.editable;
    editor.invoke('editor.setHTML', html);
    editable.focus();
  }

  function caretAtEnd(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  it('types bold text after Bold, and plain text after Bold again', async () => {
    mount('<p>Hello</p>');
    caretAtEnd(editable.querySelector('p'));

    editor.invoke('editor.bold');
    await userEvent.keyboard('X');
    editor.invoke('editor.bold');
    await userEvent.keyboard('Y');

    expect(editor.getHTML()).toBe('<p>Hello<b>X</b>Y</p>');
    expect(editable.textContent).toBe('HelloXY'); // no zero-width space left behind
  });

  it('types in the chosen colour', async () => {
    mount('<p>Hello</p>');
    caretAtEnd(editable.querySelector('p'));

    editor.invoke('editor.foreColor', '#ff0000');
    await userEvent.keyboard('Z');

    const span = editable.querySelector('span');
    expect(span?.textContent).toBe('Z');
    expect(span?.style.color).toBe('rgb(255, 0, 0)');
  });

  it('bolds a selection with the keyboard shortcut', async () => {
    mount('<p>Hello world</p>');
    const text = editable.querySelector('p').firstChild;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 5);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    const mod = /Mac|iPhone|iPad/.test(navigator.platform) ? 'Meta' : 'Control';
    await userEvent.keyboard(`{${mod}>}b{/${mod}}`);

    expect(editor.getHTML()).toBe('<p><b>Hello</b> world</p>');
  });

  it('makes a list and keeps typing in it', async () => {
    mount('<p>one</p>');
    caretAtEnd(editable.querySelector('p'));

    editor.invoke('editor.insertUL');
    await userEvent.keyboard('!');

    // The editor keeps a paragraph after a trailing list to leave it by
    expect(editor.getHTML()).toBe('<ul><li>one!</li></ul><p><br></p>');
  });
});
