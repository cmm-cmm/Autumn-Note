import { describe, it, expect, vi, afterEach } from 'vitest';
import { Editor } from '../../src/js/module/Editor.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext(html = '<p>x</p>') {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    invoke: vi.fn((path, raw) => (path === 'clipboard.resolveImages' ? raw : undefined)),
    triggerEvent: vi.fn(),
  };
}

describe('Editor content helpers', () => {
  it('getHTML strips zero-width spaces before returning', () => {
    const context = makeContext('<p>a\u200Bb</p>');
    const editor = new Editor(context);
    const out = editor.getHTML();
    expect(out).toBe('<p>ab</p>');
    expect(context.invoke).toHaveBeenCalledWith('clipboard.resolveImages', '<p>ab</p>');
  });

  it('isEmpty treats media as non-empty content', () => {
    const context = makeContext('<p>\u00a0</p>');
    const editor = new Editor(context);
    expect(editor.isEmpty()).toBe(true);

    context.layoutInfo.editable.innerHTML = '<p></p><img src="x">';
    expect(editor.isEmpty()).toBe(false);
  });
});
