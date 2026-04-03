import { describe, it, expect, vi, afterEach } from 'vitest';
import { Codeview } from '../../src/js/module/Codeview.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext(html = '<p>Hello</p>') {
  const root = document.createElement('div');
  const editable = document.createElement('div');
  editable.innerHTML = html;
  root.appendChild(editable);
  document.body.appendChild(root);
  return {
    options: {},
    layoutInfo: { editable },
    invoke: vi.fn(),
  };
}

describe('Codeview', () => {
  it('toggles to textarea and back, sanitizing unsafe HTML on deactivate', () => {
    const context = makeContext('<p>Hi</p>');
    const cv = new Codeview(context);

    cv.activate();
    expect(cv.isActive()).toBe(true);
    expect(context.layoutInfo.editable.style.display).toBe('none');
    expect(document.querySelector('textarea.an-codeview')).not.toBeNull();

    cv._textarea.value = '<p>safe</p><script>alert(1)</script>';
    cv.deactivate();

    expect(cv.isActive()).toBe(false);
    expect(context.layoutInfo.editable.style.display).toBe('');
    expect(context.layoutInfo.editable.innerHTML).toContain('<p>safe</p>');
    expect(context.layoutInfo.editable.innerHTML).not.toContain('<script');
    expect(context.invoke).toHaveBeenCalledWith('toolbar.refresh');
    expect(context.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });
});
