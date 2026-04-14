import { describe, it, expect, afterEach, vi } from 'vitest';
import { IconDialog } from '../../src/js/module/IconDialog.js';
import { en } from '../../src/js/i18n/en.js';

function setCaret(node, offset) {
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

afterEach(() => {
  document.body.innerHTML = '';
  const sel = window.getSelection();
  if (sel) sel.removeAllRanges();
});

describe('IconDialog insertion caret behavior', () => {
  it('keeps caret after inserted icon at end of line', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>hello</p>';
    document.body.appendChild(editable);

    const text = editable.querySelector('p').firstChild;
    setCaret(text, text.textContent.length);

    const context = {
      layoutInfo: { editable },
      options: {},
      locale: en,
      invoke: vi.fn(),
    };

    const dialog = new IconDialog(context);
    dialog.initialize();
    dialog.show();

    dialog._selectedIcon = 'house';
    dialog._onInsert();

    const icon = editable.querySelector('i.fa-house');
    expect(icon).not.toBeNull();

    const sel = window.getSelection();
    const r = sel.getRangeAt(0);
    expect(r.startContainer.nodeType).toBe(Node.TEXT_NODE);
    expect(r.startContainer.previousSibling).toBe(icon);
    expect(r.startContainer.textContent.startsWith('\u200B')).toBe(true);
    expect(r.startOffset).toBe(1);

    expect(context.invoke).toHaveBeenCalledWith('editor.afterCommand');

    dialog.destroy();
  });
});
