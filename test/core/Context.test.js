import { describe, it, expect, vi, afterEach } from 'vitest';
import { Context } from '../../src/js/Context.js';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function makeContext(userOptions = {}) {
  const target = document.createElement('textarea');
  document.body.appendChild(target);
  return new Context(target, userOptions);
}

// Inject a mock editor module so invoke('editor.*') works
function withEditorModule(ctx, overrides = {}) {
  const mockEditor = {
    getHTML:      vi.fn(() => '<p>hello</p>'),
    setHTML:      vi.fn(),
    getText:      vi.fn(() => 'hello'),
    setText:      vi.fn(),
    clear:        vi.fn(),
    clearHistory: vi.fn(),
    isEmpty:      vi.fn(() => false),
    insertHTML:   vi.fn(),
    insertText:   vi.fn(),
    setMarkdown:  vi.fn(),
    getMarkdown:  vi.fn(() => '# Hello'),
    ...overrides,
  };
  ctx._modules.set('editor', mockEditor);
  return mockEditor;
}

function withStatusbarModule(ctx, overrides = {}) {
  const mockStatusbar = {
    getWordCount: vi.fn(() => 3),
    getCharCount: vi.fn(() => 11),
    ...overrides,
  };
  ctx._modules.set('statusbar', mockStatusbar);
  return mockStatusbar;
}

describe('Context event system', () => {
  it('calls both subscribed handlers and option callback via triggerEvent', () => {
    const onChange = vi.fn();
    const ctx = makeContext({ onChange });
    const handler = vi.fn();

    const unsubscribe = ctx.on('change', handler);
    ctx.triggerEvent('change', '<p>a</p>');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('<p>a</p>');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('<p>a</p>');

    unsubscribe();
    ctx.triggerEvent('change', '<p>b</p>');

    // Handler was removed; options callback still receives events.
    expect(handler).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('<p>b</p>');
  });
});

describe('Context utilities', () => {
  it('toggles readonly state through setDisabled', () => {
    const ctx = makeContext();
    const editable = document.createElement('div');
    const container = document.createElement('div');
    ctx.layoutInfo.editable = editable;
    ctx.layoutInfo.container = container;

    ctx.setDisabled(true);
    expect(editable.getAttribute('contenteditable')).toBe('false');
    expect(container.classList.contains('an-disabled')).toBe(true);

    ctx.setDisabled(false);
    expect(editable.getAttribute('contenteditable')).toBe('true');
    expect(container.classList.contains('an-disabled')).toBe(false);
  });

  it('syncs HTML back to textarea target', () => {
    const ctx = makeContext();
    ctx.getHTML = () => '<p>fresh</p>';

    ctx._syncToTarget();
    expect(ctx.targetEl.value).toBe('<p>fresh</p>');
  });

  it('setDisabled disables checklist checkboxes when set to true', () => {
    const ctx = makeContext();
    const editable = document.createElement('div');
    editable.innerHTML = '<ul class="an-checklist"><li><input type="checkbox"><span>item</span></li></ul>';
    const container = document.createElement('div');
    ctx.layoutInfo.editable = editable;
    ctx.layoutInfo.container = container;

    ctx.setDisabled(true);
    expect(editable.querySelector('input[type="checkbox"]').hasAttribute('disabled')).toBe(true);

    ctx.setDisabled(false);
    expect(editable.querySelector('input[type="checkbox"]').hasAttribute('disabled')).toBe(false);
  });
});

// ── invoke() ─────────────────────────────────────────────────────────────────

describe('Context.invoke', () => {
  it('calls module method and returns result', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    const result = ctx.invoke('editor.getHTML');
    expect(editor.getHTML).toHaveBeenCalled();
    expect(result).toBe('<p>hello</p>');
  });

  it('passes arguments to module method', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.invoke('editor.setHTML', '<p>new</p>');
    expect(editor.setHTML).toHaveBeenCalledWith('<p>new</p>');
  });

  it('warns and returns undefined for unknown module', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = makeContext();
    const result = ctx.invoke('unknown.method');
    expect(result).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it('warns and returns undefined for unknown method on known module', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = makeContext();
    withEditorModule(ctx);
    const result = ctx.invoke('editor.nonExistentMethod');
    expect(result).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});

// ── Event system ─────────────────────────────────────────────────────────────

describe('Context.on / off', () => {
  it('on() subscribes and returns unsubscribe function', () => {
    const ctx = makeContext();
    const handler = vi.fn();
    const unsubscribe = ctx.on('focus', handler);
    ctx.triggerEvent('focus');
    expect(handler).toHaveBeenCalledTimes(1);
    unsubscribe();
    ctx.triggerEvent('focus');
    expect(handler).toHaveBeenCalledTimes(1); // not called again
  });

  it('off() removes a specific handler', () => {
    const ctx = makeContext();
    const h1 = vi.fn();
    const h2 = vi.fn();
    ctx.on('blur', h1);
    ctx.on('blur', h2);
    ctx.off('blur', h1);
    ctx.triggerEvent('blur');
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalled();
  });

  it('off() is a no-op for unknown event', () => {
    const ctx = makeContext();
    expect(() => ctx.off('nonexistent', vi.fn())).not.toThrow();
  });

  it('multiple handlers for same event all fire', () => {
    const ctx = makeContext();
    const h1 = vi.fn(), h2 = vi.fn(), h3 = vi.fn();
    ctx.on('change', h1);
    ctx.on('change', h2);
    ctx.on('change', h3);
    ctx.triggerEvent('change', 'data');
    expect(h1).toHaveBeenCalledWith('data');
    expect(h2).toHaveBeenCalledWith('data');
    expect(h3).toHaveBeenCalledWith('data');
  });
});

// ── Delegation API ────────────────────────────────────────────────────────────

describe('Context content delegation API', () => {
  it('getHTML() delegates to editor.getHTML', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    expect(ctx.getHTML()).toBe('<p>hello</p>');
    expect(editor.getHTML).toHaveBeenCalled();
  });

  it('setHTML() delegates to editor.setHTML', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.setHTML('<p>new</p>');
    expect(editor.setHTML).toHaveBeenCalledWith('<p>new</p>');
  });

  it('getText() delegates to editor.getText', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    expect(ctx.getText()).toBe('hello');
    expect(editor.getText).toHaveBeenCalled();
  });

  it('setText() delegates to editor.setText', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.setText('plain text');
    expect(editor.setText).toHaveBeenCalledWith('plain text');
  });

  it('clear() delegates to editor.clear', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.clear();
    expect(editor.clear).toHaveBeenCalled();
  });

  it('clearHistory() delegates to editor.clearHistory', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.clearHistory();
    expect(editor.clearHistory).toHaveBeenCalled();
  });

  it('isEmpty() delegates to editor.isEmpty', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.isEmpty();
    expect(editor.isEmpty).toHaveBeenCalled();
  });

  it('insertHTML() delegates to editor.insertHTML', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.insertHTML('<strong>bold</strong>');
    expect(editor.insertHTML).toHaveBeenCalledWith('<strong>bold</strong>');
  });

  it('insertText() delegates to editor.insertText', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.insertText('hello');
    expect(editor.insertText).toHaveBeenCalledWith('hello');
  });

  it('setMarkdown() delegates to editor.setMarkdown', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    ctx.setMarkdown('# Hello');
    expect(editor.setMarkdown).toHaveBeenCalledWith('# Hello');
  });

  it('getMarkdown() delegates to editor.getMarkdown', () => {
    const ctx = makeContext();
    const editor = withEditorModule(ctx);
    expect(ctx.getMarkdown()).toBe('# Hello');
    expect(editor.getMarkdown).toHaveBeenCalled();
  });
});

describe('Context stats delegation API', () => {
  it('getWordCount() delegates to statusbar.getWordCount', () => {
    const ctx = makeContext();
    const sb = withStatusbarModule(ctx);
    expect(ctx.getWordCount()).toBe(3);
    expect(sb.getWordCount).toHaveBeenCalled();
  });

  it('getCharCount() delegates to statusbar.getCharCount', () => {
    const ctx = makeContext();
    const sb = withStatusbarModule(ctx);
    expect(ctx.getCharCount()).toBe(11);
    expect(sb.getCharCount).toHaveBeenCalled();
  });

  it('getWordCount() returns 0 when statusbar not registered', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = makeContext();
    expect(ctx.getWordCount()).toBe(0);
  });
});

// ── registerModule ────────────────────────────────────────────────────────────

describe('Context.registerModule', () => {
  it('adds a module instance and calls initialize()', () => {
    const ctx = makeContext();
    const initialize = vi.fn();
    const MockModule = class { constructor() { this.initialize = initialize; } };
    ctx.registerModule('myMod', MockModule);
    expect(ctx._modules.has('myMod')).toBe(true);
    expect(initialize).toHaveBeenCalled();
  });

  it('module is invokable after registration', () => {
    const ctx = makeContext();
    const greet = vi.fn(() => 'hello');
    class MockModule { constructor() { this.initialize = () => {}; this.greet = greet; } }
    ctx.registerModule('greeter', MockModule);
    expect(ctx.invoke('greeter.greet')).toBe('hello');
  });
});
