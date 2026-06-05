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

  it('AutumnNote.defaults getter returns a copy of default options', () => {
    const defaults = AutumnNote.defaults;
    expect(typeof defaults).toBe('object');
    expect(defaults).toHaveProperty('height');
    // It's a copy, modifying it should not affect originals
    defaults.height = 9999;
    expect(AutumnNote.defaults.height).not.toBe(9999);
  });

  it('AutumnNote.create with NodeList creates multiple editors', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    document.body.appendChild(div1);
    document.body.appendChild(div2);

    const editors = AutumnNote.create(document.querySelectorAll('div:not([class])'));
    const arr = Array.isArray(editors) ? editors : [editors];
    expect(arr.length).toBeGreaterThan(0);
    arr.forEach((e) => e.destroy());
  });

  it('options.focus:true focuses the editable after initialization', () => {
    const ta = document.createElement('textarea');
    ta.id = 'focus-test-editor';
    document.body.appendChild(ta);

    const focused = [];
    const origFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function () { focused.push(this); };

    const editor = AutumnNote.create('#focus-test-editor', { focus: true });
    HTMLElement.prototype.focus = origFocus;

    const editable = editor.layoutInfo.editable;
    expect(focused).toContain(editable);
    editor.destroy();
  });

  it('options.onDestroy callback is called when editor is destroyed', () => {
    const ta = document.createElement('textarea');
    ta.id = 'ondestroy-test-editor';
    document.body.appendChild(ta);

    const onDestroy = vi.fn();
    const editor = AutumnNote.create('#ondestroy-test-editor', { onDestroy });
    editor.destroy();

    expect(onDestroy).toHaveBeenCalledTimes(1);
    expect(onDestroy).toHaveBeenCalledWith(editor);
  });
});

// ── AutumnNote.buttons namespace ──────────────────────────────────────────────

describe('AutumnNote.buttons namespace', () => {
  it('exposes a buttons object on the AutumnNote global', () => {
    expect(typeof AutumnNote.buttons).toBe('object');
    expect(AutumnNote.buttons).not.toBeNull();
  });

  it('contains boldBtn with expected shape', () => {
    const { boldBtn } = AutumnNote.buttons;
    expect(boldBtn.name).toBe('bold');
    expect(typeof boldBtn.action).toBe('function');
  });

  it('contains undoBtn and redoBtn', () => {
    expect(AutumnNote.buttons.undoBtn.name).toBe('undo');
    expect(AutumnNote.buttons.redoBtn.name).toBe('redo');
  });

  it('includes defaultToolbar array', () => {
    expect(Array.isArray(AutumnNote.buttons.defaultToolbar)).toBe(true);
    expect(AutumnNote.buttons.defaultToolbar.length).toBeGreaterThan(0);
  });

  it('buttons namespace has at least 40 entries (all built-in buttons + defaultToolbar)', () => {
    expect(Object.keys(AutumnNote.buttons).length).toBeGreaterThanOrEqual(40);
  });
});
