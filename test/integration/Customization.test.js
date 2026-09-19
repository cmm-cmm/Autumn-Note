/**
 * Per-editor customisation: string toolbar names, per-editor buttons, icons,
 * dropdown lists, colour palette and keyboard shortcuts (keyMap).
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import AutumnNote from '../../src/js/index.js';
import { _iconRegistry } from '../../src/js/module/Buttons.js';

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
  _iconRegistry.clear();
  AutumnNote.resetDefaults();
  vi.restoreAllMocks();
});

const makeEditor = (options = {}) => {
  const ta = document.createElement('textarea');
  ta.value = '<p>Hello world</p>';
  document.body.appendChild(ta);
  return AutumnNote.create(ta, { bubbleToolbar: false, markdownShortcuts: false, ...options });
};

const btn = (editor, name) => editor.layoutInfo.toolbar.querySelector(`[data-btn="${name}"]`);

/** Dispatches a keydown on the editable and returns the event. */
const press = (editor, init) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  editor.layoutInfo.editable.dispatchEvent(event);
  return event;
};

describe('toolbar by name', () => {
  it('accepts built-in button names as strings', () => {
    const editor = makeEditor({ toolbar: [['bold', 'italic'], ['fontSize', 'foreColor', 'table']] });
    for (const name of ['bold', 'italic', 'fontSize', 'foreColor', 'table']) {
      expect(btn(editor, name)).not.toBeNull();
    }
    editor.destroy();
  });

  it('resolves per-editor buttons before the global registry', () => {
    const a = vi.fn();
    const b = vi.fn();
    const first = makeEditor({ toolbar: [['save']], buttons: { save: { icon: 'save', tooltip: 'Save', action: a } } });
    const second = makeEditor({ toolbar: [['save']], buttons: [{ name: 'save', icon: 'save', tooltip: 'Save', action: b }] });
    btn(first, 'save').click();
    btn(second, 'save').click();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    first.destroy();
    second.destroy();
  });
});

describe('icons', () => {
  it('uses markup and class-list icons from the icons option', () => {
    const editor = makeEditor({
      toolbar: [['bold', 'italic', 'table', 'foreColor']],
      icons: { bold: '<svg data-test="bold"></svg>', italic: 'bi bi-type-italic', table: '<b>T</b>', foreColor: 'my-color' },
    });
    expect(btn(editor, 'bold').querySelector('svg[data-test="bold"]')).not.toBeNull();
    expect(btn(editor, 'italic').querySelector('i.bi.bi-type-italic')).not.toBeNull();
    expect(btn(editor, 'table').innerHTML).toBe('<b>T</b>');
    expect(editor.layoutInfo.toolbar.querySelector('i.my-color')).not.toBeNull();
    editor.destroy();
  });

  it('uses registered icons, with the option taking precedence', () => {
    AutumnNote.registerIcon('bold', 'global-bold').registerIcon('italic', 'global-italic');
    const editor = makeEditor({ toolbar: [['bold', 'italic']], icons: { italic: 'local-italic' } });
    expect(btn(editor, 'bold').querySelector('i.global-bold')).not.toBeNull();
    expect(btn(editor, 'italic').querySelector('i.local-italic')).not.toBeNull();
    editor.destroy();
  });

  it('rebuilds the toolbar when icons change at runtime', () => {
    const editor = makeEditor({ toolbar: [['bold']] });
    editor.updateOptions({ icons: { bold: 'late-bold' } });
    expect(btn(editor, 'bold').querySelector('i.late-bold')).not.toBeNull();
    editor.destroy();
  });
});

describe('dropdown lists and palette', () => {
  it('takes fontSizes, lineHeights and paragraphStyles from options', () => {
    const editor = makeEditor({
      toolbar: [['fontSize', 'lineHeight', 'paragraphStyle']],
      fontSizes: ['12px', '15px'],
      lineHeights: ['1.2'],
      paragraphStyles: [{ value: 'p', label: 'Body' }, { value: 'h2', label: 'Title' }],
    });
    const values = (name) => [...btn(editor, name).querySelectorAll('option')].map((o) => o.value).filter(Boolean);
    expect(values('fontSize')).toEqual(['12px', '15px']);
    expect(values('lineHeight')).toEqual(['1.2']);
    expect(values('paragraphStyle')).toEqual(['p', 'h2']);
    editor.destroy();
  });

  it('replaces the colour palette and still prepends colorSwatches', () => {
    const editor = makeEditor({ toolbar: [['foreColor']], colorPalette: ['#111111', '#222222'], colorSwatches: ['#f97316'] });
    const colors = [...editor.layoutInfo.portal.querySelectorAll('.an-color-swatch')].map((s) => s.dataset.color);
    expect(colors).toEqual(['#f97316', '#111111', '#222222']);
    editor.destroy();
  });
});

describe('keyMap', () => {
  it('runs the default shortcuts', () => {
    const editor = makeEditor();
    const bold = vi.spyOn(editor._modules.get('editor'), 'bold');
    const event = press(editor, { key: 'b', ctrlKey: true });
    expect(bold).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    editor.destroy();
  });

  it('can give Ctrl+F back to the browser', () => {
    const editor = makeEditor({ keyMap: { 'Mod+F': false } });
    const show = vi.spyOn(editor._modules.get('findReplace'), 'show');
    const event = press(editor, { key: 'f', ctrlKey: true });
    expect(show).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
    editor.destroy();
  });

  it('runs custom handlers, and a handler returning false lets the key through', () => {
    const handler = vi.fn();
    const passThrough = vi.fn(() => false);
    const editor = makeEditor({ keyMap: { 'Mod+Alt+1': handler, 'Mod+Alt+2': passThrough } });
    expect(press(editor, { key: '1', code: 'Digit1', ctrlKey: true, altKey: true }).defaultPrevented).toBe(true);
    expect(handler).toHaveBeenCalledWith(editor, expect.any(KeyboardEvent));
    expect(press(editor, { key: '2', code: 'Digit2', ctrlKey: true, altKey: true }).defaultPrevented).toBe(false);
    expect(passThrough).toHaveBeenCalled();
    editor.destroy();
  });

  it('accepts a toolbar button name as the command', () => {
    const action = vi.fn();
    const editor = makeEditor({ buttons: { stamp: { icon: 'x', tooltip: 'Stamp', action } }, keyMap: { 'Mod+Shift+S': 'stamp' } });
    press(editor, { key: 'S', ctrlKey: true, shiftKey: true });
    expect(action).toHaveBeenCalledWith(editor);
    editor.destroy();
  });

  it('does not treat AltGr (Ctrl+Alt) as Ctrl', () => {
    const editor = makeEditor();
    const undo = vi.spyOn(editor._modules.get('editor'), 'undo');
    press(editor, { key: 'z', ctrlKey: true, altKey: true });
    expect(undo).not.toHaveBeenCalled();
    editor.destroy();
  });

  it('picks up keyMap changes made through updateOptions()', () => {
    const editor = makeEditor();
    const show = vi.spyOn(editor._modules.get('findReplace'), 'show');
    editor.updateOptions({ keyMap: { 'Mod+F': false } });
    press(editor, { key: 'f', ctrlKey: true });
    expect(show).not.toHaveBeenCalled();
    editor.destroy();
  });
});

describe('shortcuts dialog', () => {
  it('drops disabled shortcuts and lists custom ones', () => {
    const editor = makeEditor({
      keyMap: { 'Mod+F': false, 'Mod+Alt+1': { run: () => {}, description: 'Heading 1' } },
    });
    editor.invoke('shortcutsDialog.show');
    const rows = [...editor.layoutInfo.portal.querySelectorAll('.an-shortcuts-row')]
      .map((r) => r.textContent);
    expect(rows.some((t) => t.includes('Ctrl + F'))).toBe(false);
    expect(rows.some((t) => t.includes('Ctrl + H'))).toBe(true);
    expect(rows).toContain('Ctrl + Alt + 1Heading 1');
    editor.destroy();
  });
});
