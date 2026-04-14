import { describe, it, expect, vi, afterEach } from 'vitest';
import { LinkDialog } from '../../src/js/module/LinkDialog.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext() {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p>hello</p>';
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    locale: en,
    invoke: vi.fn(),
  };
}

describe('LinkDialog', () => {
  it('auto-prefixes protocol and invokes editor.insertLink', () => {
    const context = makeContext();
    const dialog = new LinkDialog(context);
    dialog.initialize();

    dialog._savedRange = { select: vi.fn() };
    dialog._urlInput.value = 'example.com';
    dialog._textInput.value = 'Example';
    dialog._tabCheckbox.checked = true;

    dialog._onInsert();

    expect(context.invoke).toHaveBeenCalledWith('editor.insertLink', 'https://example.com', 'Example', true);
    expect(dialog._savedRange).toBeNull();

    dialog.destroy();
  });

  it('rejects unsafe javascript URL', () => {
    const context = makeContext();
    const dialog = new LinkDialog(context);
    dialog.initialize();

    dialog._urlInput.value = 'javascript:alert(1)';
    dialog._textInput.value = 'x';
    dialog._onInsert();

    expect(context.invoke).not.toHaveBeenCalled();
    dialog.destroy();
  });
});
