import { describe, it, expect, afterEach, vi } from 'vitest';
import AutumnNote from '../../src/js/index.js';

if (typeof document.queryCommandState !== 'function') {
  Object.defineProperty(document, 'queryCommandState', {
    value: () => false,
    configurable: true,
    writable: true,
  });
}

if (typeof document.queryCommandValue !== 'function') {
  Object.defineProperty(document, 'queryCommandValue', {
    value: () => '',
    configurable: true,
    writable: true,
  });
}

if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', {
    value: () => true,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  document.body.innerHTML = '';
  AutumnNote.resetDefaults();
});

describe('AutumnNote integration', () => {
  it('creates, resolves, and destroys instance via public API', () => {
    const ta = document.createElement('textarea');
    ta.id = 'ed';
    ta.value = '<p>Hello</p>';
    document.body.appendChild(ta);

    const editor = AutumnNote.create('#ed');
    expect(editor).toBeTruthy();
    expect(AutumnNote.getInstance('#ed')).toBe(editor);

    AutumnNote.destroy('#ed');
    expect(AutumnNote.getInstance('#ed')).toBeNull();
    expect(ta.style.display).toBe('');
  });

  it('syncs editable content back to textarea on input immediately', () => {
    const ta = document.createElement('textarea');
    ta.id = 'sync-editor';
    ta.value = '<p>start</p>';
    document.body.appendChild(ta);

    const editor = AutumnNote.create('#sync-editor');
    const editable = editor.layoutInfo.editable;

    editable.innerHTML = '<p>fresh now</p>';
    editable.dispatchEvent(new Event('input', { bubbles: true }));

    expect(ta.value).toBe('<p>fresh now</p>');

    editor.destroy();
  });

  it('supports readOnly mode and custom module registration', () => {
    const ta = document.createElement('textarea');
    ta.id = 'ro-editor';
    ta.value = '<p>x</p>';
    document.body.appendChild(ta);

    class DemoModule {
      constructor(ctx) {
        this.ctx = ctx;
      }
      initialize() {
        this.ctx._demoInit = true;
      }
      ping(v) {
        return `pong:${v}`;
      }
    }

    AutumnNote.registerModule('demoModuleTest', DemoModule);

    const editor = AutumnNote.create('#ro-editor', { readOnly: true });
    expect(editor.layoutInfo.editable.getAttribute('contenteditable')).toBe('false');
    expect(editor._demoInit).toBe(true);
    expect(editor.invoke('demoModuleTest.ping', 'ok')).toBe('pong:ok');

    editor.destroy();
  });

  it('applies defaults set via setDefaults to newly created instances', () => {
    AutumnNote.setDefaults({ placeholder: 'Default placeholder' });

    const ta = document.createElement('textarea');
    ta.id = 'defaults-editor';
    document.body.appendChild(ta);

    const editor = AutumnNote.create('#defaults-editor');
    expect(editor.layoutInfo.editable.dataset.placeholder).toBe('Default placeholder');

    editor.destroy();
  });
});
