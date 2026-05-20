import { describe, it, expect, vi, afterEach } from 'vitest';
import AutumnNote from '../../src/js/index.js';
import { _buttonRegistry, registerButton, getButton, boldBtn } from '../../src/js/module/Buttons.js';
import { _globalPlugins } from '../../src/js/Context.js';

// Stubs required by Editor/Toolbar in jsdom
if (typeof document.queryCommandState !== 'function') {
  Object.defineProperty(document, 'queryCommandState', { value: () => false, configurable: true, writable: true });
}
if (typeof document.queryCommandValue !== 'function') {
  Object.defineProperty(document, 'queryCommandValue', { value: () => '', configurable: true, writable: true });
}
if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', { value: () => true, configurable: true, writable: true });
}

function makeEl() {
  const ta = document.createElement('textarea');
  document.body.appendChild(ta);
  return ta;
}

afterEach(() => {
  document.body.innerHTML = '';
  AutumnNote.resetDefaults();
  _globalPlugins.clear();
  _buttonRegistry.clear();
});

// ---------------------------------------------------------------------------
// 1. registerButton / getButton
// ---------------------------------------------------------------------------

describe('registerButton / getButton', () => {
  it('registers a button and retrieves it by name', () => {
    const def = { name: 'myBtn', icon: 'star', tooltip: 'My', action: vi.fn() };
    registerButton(def);
    expect(getButton('myBtn')).toBe(def);
  });

  it('warns but last registration wins on name collision', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const def1 = { name: 'dup', icon: 'a', tooltip: 'A', action: vi.fn() };
    const def2 = { name: 'dup', icon: 'b', tooltip: 'B', action: vi.fn() };
    registerButton(def1);
    registerButton(def2);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"dup"'));
    expect(getButton('dup')).toBe(def2);
    warn.mockRestore();
  });

  it('warns and skips when btnDef has no name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerButton({ icon: 'x', action: vi.fn() });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns undefined for unknown names', () => {
    expect(getButton('__unknown__')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 2. AutumnNote.registerButton (static)
// ---------------------------------------------------------------------------

describe('AutumnNote.registerButton', () => {
  it('registers a button via the static method', () => {
    const def = { name: 'staticBtn', icon: 'star', tooltip: 'S', action: vi.fn() };
    AutumnNote.registerButton(def);
    expect(getButton('staticBtn')).toBe(def);
  });

  it('is chainable (returns AutumnNote)', () => {
    const def = { name: 'chainBtn', icon: 'x', tooltip: 'C', action: vi.fn() };
    expect(AutumnNote.registerButton(def)).toBe(AutumnNote);
  });
});

// ---------------------------------------------------------------------------
// 3. AutumnNote.use — global plugin
// ---------------------------------------------------------------------------

describe('AutumnNote.use — global plugin', () => {
  it('registers plugin buttons immediately before create()', () => {
    const plugin = {
      name: 'btn-plugin',
      buttons: [{ name: 'pluginBtn', icon: 'p', tooltip: 'P', action: vi.fn() }],
      install: vi.fn(),
    };
    AutumnNote.use(plugin);
    expect(getButton('pluginBtn')).toBeDefined();
    expect(_globalPlugins.has('btn-plugin')).toBe(true);
  });

  it('calls install() after modules initialise, passing context and options', () => {
    const install = vi.fn();
    const plugin = { name: 'install-test', install };
    AutumnNote.use(plugin, { foo: 'bar' });
    const editor = AutumnNote.create(makeEl());
    expect(install).toHaveBeenCalledTimes(1);
    expect(install).toHaveBeenCalledWith(editor, { foo: 'bar' });
    editor.destroy();
  });

  it('throws when plugin has no name', () => {
    expect(() => AutumnNote.use({ install: vi.fn() })).toThrow(TypeError);
  });

  it('warns and skips duplicate global registration', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const plugin = { name: 'dup-global', install: vi.fn() };
    AutumnNote.use(plugin);
    AutumnNote.use(plugin);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"dup-global"'));
    expect(_globalPlugins.size).toBe(1);
    warn.mockRestore();
  });

  it('is chainable (returns AutumnNote)', () => {
    const plugin = { name: 'chain-plugin', install: vi.fn() };
    expect(AutumnNote.use(plugin)).toBe(AutumnNote);
  });

  it('AutumnNote.hasPlugin returns correct boolean', () => {
    expect(AutumnNote.hasPlugin('missing')).toBe(false);
    AutumnNote.use({ name: 'present', install: vi.fn() });
    expect(AutumnNote.hasPlugin('present')).toBe(true);
  });

  it('applies global plugin to every new instance', () => {
    const install = vi.fn();
    AutumnNote.use({ name: 'multi', install });
    const e1 = AutumnNote.create(makeEl());
    const e2 = AutumnNote.create(makeEl());
    expect(install).toHaveBeenCalledTimes(2);
    e1.destroy();
    e2.destroy();
  });
});

// ---------------------------------------------------------------------------
// 4. Toolbar string name resolution
// ---------------------------------------------------------------------------

describe('Toolbar — string button name resolution', () => {
  it('renders a registered button referenced by string name', () => {
    const action = vi.fn();
    AutumnNote.registerButton({ name: 'strBtn', icon: 'x', tooltip: 'Str', action });
    const editor = AutumnNote.create(makeEl(), { toolbar: [['strBtn']] });
    expect(editor.layoutInfo.toolbar.querySelector('[data-btn="strBtn"]')).not.toBeNull();
    editor.destroy();
  });

  it('warns and skips unknown string button names', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const editor = AutumnNote.create(makeEl(), { toolbar: [['__ghost__']] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"__ghost__"'));
    editor.destroy();
    warn.mockRestore();
  });

  it('supports mixed array of ButtonDef objects and string names', () => {
    AutumnNote.registerButton({ name: 'mixedBtn', icon: 'y', tooltip: 'M', action: vi.fn() });
    const editor = AutumnNote.create(makeEl(), { toolbar: [[boldBtn, 'mixedBtn']] });
    expect(editor.layoutInfo.toolbar.querySelector('[data-btn="bold"]')).not.toBeNull();
    expect(editor.layoutInfo.toolbar.querySelector('[data-btn="mixedBtn"]')).not.toBeNull();
    editor.destroy();
  });
});

// ---------------------------------------------------------------------------
// 5. context.use — instance plugin
// ---------------------------------------------------------------------------

describe('context.use — instance plugin', () => {
  it('installs a plugin and exposes its public API via getPlugin()', () => {
    const editor = AutumnNote.create(makeEl());
    const plugin = {
      name: 'greet-plugin',
      install: (ctx, opts) => ({ greet: () => `hello ${opts.who}` }),
    };
    editor.use(plugin, { who: 'world' });
    const api = editor.getPlugin('greet-plugin');
    expect(api).not.toBeNull();
    expect(api.greet()).toBe('hello world');
    editor.destroy();
  });

  it('is chainable (returns context)', () => {
    const editor = AutumnNote.create(makeEl());
    const plugin = { name: 'chain-ctx', install: vi.fn() };
    expect(editor.use(plugin)).toBe(editor);
    editor.destroy();
  });

  it('does not install the same plugin twice on one instance', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const editor = AutumnNote.create(makeEl());
    const plugin = { name: 'once-only', install: vi.fn() };
    editor.use(plugin);
    editor.use(plugin);
    expect(plugin.install).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"once-only"'));
    warn.mockRestore();
    editor.destroy();
  });

  it('getPlugin returns null for uninstalled plugin', () => {
    const editor = AutumnNote.create(makeEl());
    expect(editor.getPlugin('ghost')).toBeNull();
    editor.destroy();
  });

  it('registers instance plugin buttons to global registry immediately', () => {
    const editor = AutumnNote.create(makeEl(), { toolbar: [] });
    const plugin = {
      name: 'btn-instance',
      buttons: [{ name: 'instanceBtn', icon: 'i', tooltip: 'I', action: vi.fn() }],
      install: vi.fn(),
    };
    editor.use(plugin);
    expect(getButton('instanceBtn')).toBeDefined();
    editor.destroy();
  });
});

// ---------------------------------------------------------------------------
// 6. toolbar.rebuild()
// ---------------------------------------------------------------------------

describe('toolbar.rebuild', () => {
  it('re-renders toolbar after post-create button registration', () => {
    const editor = AutumnNote.create(makeEl(), { toolbar: [['lateBtn']] });
    expect(editor.layoutInfo.toolbar.querySelector('[data-btn="lateBtn"]')).toBeNull();
    AutumnNote.registerButton({ name: 'lateBtn', icon: 'z', tooltip: 'Late', action: vi.fn() });
    editor.invoke('toolbar.rebuild');
    expect(editor.layoutInfo.toolbar.querySelector('[data-btn="lateBtn"]')).not.toBeNull();
    editor.destroy();
  });
});

// ---------------------------------------------------------------------------
// 7. plugin uninstall hook
// ---------------------------------------------------------------------------

describe('plugin uninstall hook', () => {
  it('calls uninstall() when the editor is destroyed', () => {
    const uninstall = vi.fn();
    const editor = AutumnNote.create(makeEl());
    editor.use({ name: 'cleanup', install: vi.fn(), uninstall });
    editor.destroy();
    expect(uninstall).toHaveBeenCalledTimes(1);
  });

  it('swallows errors thrown in uninstall()', () => {
    const editor = AutumnNote.create(makeEl());
    editor.use({
      name: 'bad-cleanup',
      install: vi.fn(),
      uninstall: () => { throw new Error('boom'); },
    });
    expect(() => editor.destroy()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 8. End-to-end: WordCountPlugin
// ---------------------------------------------------------------------------

describe('WordCountPlugin end-to-end', () => {
  it('full lifecycle: global use → create → getPlugin → destroy', () => {
    let capturedCtx = null;
    const WordCountPlugin = {
      name: 'word-count',
      version: '1.0.0',
      buttons: [{
        name: 'wordCountBtn',
        icon: 'w',
        tooltip: 'Word Count',
        action: vi.fn(),
      }],
      install(ctx, opts) {
        capturedCtx = ctx;
        return { getMax: () => opts.maxWords };
      },
    };

    AutumnNote.use(WordCountPlugin, { maxWords: 500 });
    expect(AutumnNote.hasPlugin('word-count')).toBe(true);
    expect(getButton('wordCountBtn')).toBeDefined();

    const editor = AutumnNote.create(makeEl(), { toolbar: [['wordCountBtn']] });
    expect(editor.layoutInfo.toolbar.querySelector('[data-btn="wordCountBtn"]')).not.toBeNull();
    expect(capturedCtx).toBe(editor);

    const api = editor.getPlugin('word-count');
    expect(api.getMax()).toBe(500);

    editor.destroy();
  });
});
