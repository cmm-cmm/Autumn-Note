import { describe, it, expect, afterEach, vi } from 'vitest';
import { ContextMenu } from '../../src/js/module/ContextMenu.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function setCollapsedSelection(node, offset = 0) {
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  return range;
}

function makeContext(html = '<p><span style="font-size:20px;color:#ff0000">abc</span></p>') {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
    options: {},
    locale: en,
    invoke: vi.fn(),
  };
}

describe('ContextMenu format operations', () => {
  it('copies formatting from saved selection', () => {
    const context = makeContext();
    const menu = new ContextMenu(context);
    menu.initialize();

    const textNode = context.layoutInfo.editable.querySelector('span').firstChild;
    menu._savedRange = setCollapsedSelection(textNode, 1).cloneRange();

    expect(menu.hasCopiedFormat()).toBe(false);
    menu.copyFormat();

    expect(menu.hasCopiedFormat()).toBe(true);
    expect(menu._copiedFormat).toBeTruthy();
    expect(menu._copiedFormat.fontSize).toBe('20px');

    menu.destroy();
  });

  it('applies and removes format using execCommand then triggers afterCommand', () => {
    const context = makeContext('<p><span style="color:#000">abc</span></p>');
    const menu = new ContextMenu(context);
    menu.initialize();

    if (typeof document.execCommand !== 'function') {
      Object.defineProperty(document, 'execCommand', {
        value: () => true,
        configurable: true,
        writable: true,
      });
    }
    const execSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const textNode = context.layoutInfo.editable.querySelector('span').firstChild;
    menu._savedRange = setCollapsedSelection(textNode, 1).cloneRange();

    menu._copiedFormat = {
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true,
      fontFamily: 'serif',
      fontSize: '18px',
      color: 'rgb(0, 128, 0)',
      backgroundColor: 'rgb(255, 255, 0)',
    };

    menu.pasteFormat();
    expect(execSpy).toHaveBeenCalledWith('removeFormat');
    expect(execSpy).toHaveBeenCalledWith('bold');
    expect(execSpy).toHaveBeenCalledWith('italic');
    expect(execSpy).toHaveBeenCalledWith('underline');
    expect(execSpy).toHaveBeenCalledWith('strikeThrough');
    expect(context.invoke).toHaveBeenCalledWith('editor.afterCommand');

    menu.removeFormat();
    expect(execSpy).toHaveBeenCalledWith('removeFormat');
    expect(context.invoke).toHaveBeenCalledWith('editor.afterCommand');

    execSpy.mockRestore();
    menu.destroy();
  });
});
