import { describe, it, expect, vi, afterEach } from 'vitest';
import { ImageDialog } from '../../src/js/module/ImageDialog.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext() {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
}

describe('ImageDialog', () => {
  it('invokes editor.insertImage with selected alignment', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    dialog._savedRange = { select: vi.fn() };
    dialog._urlInput.value = 'https://example.com/a.png';
    dialog._altInput.value = 'Alt';
    const centerRadio = dialog._alignRow.querySelector('input[value="center"]');
    centerRadio.checked = true;

    dialog._onInsert();

    expect(context.invoke).toHaveBeenCalledWith('editor.insertImage', 'https://example.com/a.png', 'Alt', 'center');
    expect(dialog._savedRange).toBeNull();

    dialog.destroy();
  });

  it('does not insert when src is empty', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    dialog._urlInput.value = '   ';
    dialog._onInsert();

    expect(context.invoke).not.toHaveBeenCalled();
    dialog.destroy();
  });
});
