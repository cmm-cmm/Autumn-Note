import { describe, it, expect, afterEach, vi } from 'vitest';
import { FindReplace } from '../../src/js/module/FindReplace.js';
import { en } from '../../src/js/i18n/en.js';

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
    locale: en,
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

  it('shows empty counter when query is blank', () => {
    const context = makeContext('<p>Hello</p>');
    const dialog = new FindReplace(context);
    dialog.initialize();

    // Trigger search with empty query
    dialog._findInput.value = '';
    dialog._onSearch();

    expect(dialog._counterEl.textContent).toBe('');
    dialog.destroy();
  });

  it('shows locale noResults string when no matches found', () => {
    const context = makeContext('<p>Hello world</p>');
    const dialog = new FindReplace(context);
    dialog.initialize();

    dialog._findInput.value = 'xyz_not_found';
    dialog._onSearch();

    // Should use locale.findReplace.noResults (English: 'No results')
    expect(dialog._counterEl.textContent).toBe(context.locale.findReplace.noResults);
    dialog.destroy();
  });

  it('resets currentIndex to 0 after filtering failed matches', () => {
    const context = makeContext('<p>hello hello</p>');
    const dialog = new FindReplace(context);
    dialog.initialize();

    dialog._findInput.value = 'hello';
    dialog._onSearch();

    // currentIndex is set after filtering — should always start at 0
    expect(dialog._currentIndex).toBe(0);
    expect(dialog._counterEl.textContent).toBe('1 / 2');
    dialog.destroy();
  });
});
