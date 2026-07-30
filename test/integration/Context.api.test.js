/**
 * Coverage for the public Context APIs added in 1.16 — runtime option updates,
 * adapter-backed auto-save, document import/export, block IDs and selection
 * bookmarks. These went out with very little branch coverage, so the error and
 * fallback paths are exercised here alongside the happy paths.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import AutumnNote from '../../src/js/index.js';

// jsdom stubs for browser APIs used by editor modules
for (const [name, value] of [
  ['queryCommandState', () => false],
  ['queryCommandValue', () => ''],
  ['execCommand', () => true],
]) {
  if (typeof document[name] !== 'function') {
    Object.defineProperty(document, name, { value, configurable: true, writable: true });
  }
}

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  AutumnNote.resetDefaults();
  vi.clearAllMocks();
});

const makeEditor = (options = {}) => {
  const ta = document.createElement('textarea');
  ta.value = '<p>Hello world</p>';
  document.body.appendChild(ta);
  return AutumnNote.create(ta, {
    bubbleToolbar: false,
    markdownShortcuts: false,
    ...options,
  });
};

// ── Runtime module toggles ───────────────────────────────────────────────────

describe('Context runtime module toggles', () => {
  it('registers a module that was disabled at create()', () => {
    const editor = makeEditor({ bubbleToolbar: false });
    expect(editor._modules.has('bubbleToolbar')).toBe(false);

    editor.updateOptions({ bubbleToolbar: true });

    expect(editor._modules.has('bubbleToolbar')).toBe(true);
    editor.destroy();
  });

  it('tears down a module that gets disabled', () => {
    const editor = makeEditor({ slashMenu: true });
    expect(editor._modules.has('slashMenu')).toBe(true);

    editor.updateOptions({ slashMenu: false });

    expect(editor._modules.has('slashMenu')).toBe(false);
    editor.destroy();
  });

  it('leaves already-correct modules untouched', () => {
    const editor = makeEditor({ slashMenu: true });
    const before = editor._modules.get('slashMenu');

    editor.updateOptions({ height: 250 });

    expect(editor._modules.get('slashMenu')).toBe(before);
    editor.destroy();
  });
});

// ── Auto-save lifecycle ──────────────────────────────────────────────────────

describe('Context auto-save lifecycle', () => {
  it('emits autoSave with the persisted payload', async () => {
    const saved = [];
    const editor = makeEditor({
      autoSave: true, autoSaveKey: 'ctx-key', autoSaveDelay: 1,
      autoSaveAdapter: { save: (payload) => { saved.push(payload); } },
    });
    const events = [];
    editor.on('autoSave', (e) => events.push(e));

    editor.triggerEvent('change', '<p>saved</p>');
    await new Promise((r) => setTimeout(r, 20));

    expect(saved[0]).toEqual(expect.objectContaining({ key: 'ctx-key', html: '<p>saved</p>' }));
    expect(events[0]).toEqual(expect.objectContaining({ key: 'ctx-key', html: '<p>saved</p>' }));
    editor.destroy();
  });

  it('emits autoSaveError when the adapter rejects', async () => {
    const editor = makeEditor({
      autoSave: true, autoSaveKey: 'ctx-err', autoSaveDelay: 1,
      autoSaveAdapter: { save: () => Promise.reject(new Error('disk full')) },
    });
    const errors = [];
    editor.on('autoSaveError', (e) => errors.push(e));

    editor.triggerEvent('change', '<p>x</p>');
    await new Promise((r) => setTimeout(r, 20));

    expect(errors[0]).toEqual(expect.objectContaining({ key: 'ctx-err' }));
    expect(errors[0].error).toBeInstanceOf(Error);
    editor.destroy();
  });

  it('destroy() flushes the pending save and still delivers the event', async () => {
    const editor = makeEditor({
      autoSave: true, autoSaveKey: 'ctx-destroy', autoSaveDelay: 50,
      autoSaveAdapter: { save: async () => { await new Promise((r) => setTimeout(r, 1)); } },
    });
    const events = [];
    editor.on('autoSave', (e) => events.push(e));

    editor.triggerEvent('change', '<p>final</p>');
    await editor.destroy(); // the debounce timer has not fired yet

    expect(events).toHaveLength(1);
    expect(events[0].html).toBe('<p>final</p>');
  });

  it('loadAutoSave reads through the adapter when provided', async () => {
    const editor = makeEditor({
      autoSave: true, autoSaveKey: 'ctx-load',
      autoSaveAdapter: { save: () => {}, load: ({ key }) => `<p>from ${key}</p>` },
    });
    await expect(editor.loadAutoSave()).resolves.toBe('<p>from ctx-load</p>');
    editor.destroy();
  });

  it('loadAutoSave falls back to localStorage without an adapter', async () => {
    localStorage.setItem('ctx-ls', '<p>stored</p>');
    const editor = makeEditor({ autoSave: true, autoSaveKey: 'ctx-ls' });
    await expect(editor.loadAutoSave()).resolves.toBe('<p>stored</p>');
    editor.destroy();
    localStorage.removeItem('ctx-ls');
  });
});

// ── Document import / export ─────────────────────────────────────────────────

describe('Context document import/export', () => {
  it('round-trips the built-in html format', async () => {
    const editor = makeEditor();
    await editor.importDocument('html', '<p>Imported HTML</p>');
    await expect(editor.exportDocument('html')).resolves.toContain('Imported HTML');
    editor.destroy();
  });

  it('supports the built-in text format', async () => {
    const editor = makeEditor();
    await editor.importDocument('text', 'plain words');
    // Asserted via textContent: getText() reads innerText, which jsdom does not
    // implement, so exportDocument('text') always yields '' under jsdom.
    expect(editor.layoutInfo.editable.textContent).toContain('plain words');
    editor.destroy();
  });

  it('rejects an unknown import format', async () => {
    const editor = makeEditor();
    await expect(editor.importDocument('docx', {})).rejects.toThrow(/No importer registered/);
    editor.destroy();
  });

  it('rejects an unknown export format', async () => {
    const editor = makeEditor();
    await expect(editor.exportDocument('pdf')).rejects.toThrow(/No exporter registered/);
    editor.destroy();
  });

  it('prefers a registered adapter over the built-in handler', async () => {
    const editor = makeEditor({
      documentAdapters: {
        html: {
          import: (data) => `<p>via adapter: ${data}</p>`,
          export: () => 'adapter export',
        },
      },
    });
    await editor.importDocument('html', 'payload');
    expect(editor.getHTML()).toContain('via adapter: payload');
    await expect(editor.exportDocument('html')).resolves.toBe('adapter export');
    editor.destroy();
  });

  it('getDocument/loadDocument round-trip content and reset history', () => {
    const editor = makeEditor();
    editor.setHTML('<p>Snapshot me</p>');

    const snapshot = editor.getDocument();
    expect(snapshot).toEqual(expect.objectContaining({ version: 1 }));
    expect(snapshot.html).toContain('Snapshot me');

    editor.setHTML('<p>Something else</p>');
    editor.loadDocument(snapshot);

    expect(editor.getHTML()).toContain('Snapshot me');
    // loadDocument() clears history, so the restored state is the new baseline
    expect(editor.invoke('editor.canUndo')).toBe(false);
    editor.destroy();
  });

  it('loadDocument tolerates a missing html field', () => {
    const editor = makeEditor();
    expect(() => editor.loadDocument({})).not.toThrow();
    expect(() => editor.loadDocument(null)).not.toThrow();
    editor.destroy();
  });
});

// ── Block IDs ────────────────────────────────────────────────────────────────

describe('Context block IDs', () => {
  it('assigns a unique id to every top-level block', () => {
    const editor = makeEditor({ blockIds: true });
    editor.setHTML('<p>One</p><p>Two</p>');

    editor.ensureBlockIds();
    const ids = [...editor.layoutInfo.editable.children].map((b) => b.getAttribute('data-an-block-id'));

    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    editor.destroy();
  });

  it('keeps existing ids stable across repeated calls', () => {
    const editor = makeEditor({ blockIds: true });
    editor.setHTML('<p>One</p><p>Two</p>');

    editor.ensureBlockIds();
    const first = [...editor.layoutInfo.editable.children].map((b) => b.getAttribute('data-an-block-id'));
    editor.ensureBlockIds();
    const second = [...editor.layoutInfo.editable.children].map((b) => b.getAttribute('data-an-block-id'));

    expect(second).toEqual(first);
    editor.destroy();
  });
});

// ── Selection bookmarks ──────────────────────────────────────────────────────

describe('Context selection bookmarks', () => {
  it('captures and restores a caret position', () => {
    const editor = makeEditor();
    const editable = editor.layoutInfo.editable;
    editable.innerHTML = '<p>bookmark me</p>';
    const textNode = editable.querySelector('p').firstChild;

    const range = document.createRange();
    range.setStart(textNode, 4);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const bookmark = editor.getSelectionBookmark();
    expect(bookmark).toEqual(expect.objectContaining({ start: 4, end: 4 }));

    sel.removeAllRanges();
    expect(editor.restoreSelectionBookmark(bookmark)).toBe(true);
    expect(window.getSelection().rangeCount).toBeGreaterThan(0);
    editor.destroy();
  });

  it('restoreSelectionBookmark returns false for a missing bookmark', () => {
    const editor = makeEditor();
    expect(editor.restoreSelectionBookmark(null)).toBe(false);
    editor.destroy();
  });
});
