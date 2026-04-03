import { describe, it, expect, afterEach, vi } from 'vitest';
import { FindReplace } from '../../src/js/module/FindReplace.js';

afterEach(() => {
  document.body.innerHTML = '';
});

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

function makeContext(html = '<p>Hello world hello</p>') {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
    invoke: vi.fn(),
  };
}

describe('FindReplace', () => {
  it('finds, highlights, and navigates matches', () => {
    const context = makeContext('<p>Hello world hello</p>');
    const dialog = new FindReplace(context);
    dialog.initialize();

    dialog._findInput.value = 'hello';
    dialog._onSearch();

    const marks = context.layoutInfo.editable.querySelectorAll('mark.an-highlight');
    expect(marks.length).toBe(2);
    expect(dialog._counterEl.textContent).toBe('1 / 2');

    dialog._next();
    expect(dialog._counterEl.textContent).toBe('2 / 2');

    dialog._prev();
    expect(dialog._counterEl.textContent).toBe('1 / 2');

    dialog.destroy();
  });

  it('replaceAll updates content, clears highlights, and triggers afterCommand', () => {
    const context = makeContext('<p>apple banana apple</p>');
    const dialog = new FindReplace(context);
    dialog.initialize();

    dialog._findInput.value = 'apple';
    dialog._replaceInput.value = 'orange';
    dialog._onSearch();
    expect(context.layoutInfo.editable.querySelectorAll('mark.an-highlight').length).toBe(2);

    dialog._replaceAll();

    expect(context.layoutInfo.editable.textContent).toContain('orange banana orange');
    expect(context.layoutInfo.editable.querySelectorAll('mark.an-highlight').length).toBe(0);
    expect(context.invoke).toHaveBeenCalledWith('editor.afterCommand');

    dialog.destroy();
  });
});
