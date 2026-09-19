/**
 * Theme, portal and runtime appearance options. The dark theme used to put
 * `an-theme-dark` on document.body, which darkened the host page and every
 * light editor sharing it; floating UI now lives in a per-editor portal.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import AutumnNote from '../../src/js/index.js';

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
  document.body.className = '';
  AutumnNote.resetDefaults();
  vi.restoreAllMocks();
});

const makeEditor = (options = {}) => {
  const ta = document.createElement('textarea');
  ta.value = '<p>Hello world</p>';
  document.body.appendChild(ta);
  return AutumnNote.create(ta, { bubbleToolbar: false, markdownShortcuts: false, ...options });
};

describe('portal', () => {
  it('creates one portal per editor and mounts floating UI in it', () => {
    const editor = makeEditor();
    const { portal } = editor.layoutInfo;
    expect(portal.classList.contains('an-portal')).toBe(true);
    expect(portal.parentNode).toBe(document.body);
    // Tooltips are built at initialize()
    expect(portal.querySelector('.an-link-tooltip')).not.toBeNull();
    expect(document.body.querySelector(':scope > .an-link-tooltip')).toBeNull();
    editor.destroy();
  });

  it('removes the portal on destroy', () => {
    const editor = makeEditor();
    const { portal } = editor.layoutInfo;
    editor.destroy();
    expect(portal.isConnected).toBe(false);
  });

  it('mounts into popupContainer (selector or element) and moves at runtime', () => {
    const host = document.createElement('div');
    host.id = 'modal';
    document.body.appendChild(host);
    const editor = makeEditor({ popupContainer: '#modal' });
    expect(editor.layoutInfo.portal.parentNode).toBe(host);

    const other = document.createElement('section');
    document.body.appendChild(other);
    editor.updateOptions({ popupContainer: other });
    expect(editor.layoutInfo.portal.parentNode).toBe(other);
    editor.destroy();
  });

  it('falls back to document.body when the popupContainer selector matches nothing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const editor = makeEditor({ popupContainer: '#missing' });
    expect(editor.layoutInfo.portal.parentNode).toBe(document.body);
    expect(warn).toHaveBeenCalled();
    editor.destroy();
  });

  it('mounts into a ShadowRoot', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    const editor = makeEditor({ popupContainer: root });
    expect(editor.layoutInfo.portal.parentNode).toBe(root);
    editor.destroy();
  });
});

describe('theme', () => {
  it('never touches document.body', () => {
    const editor = makeEditor({ theme: 'dark' });
    expect(document.body.classList.contains('an-theme-dark')).toBe(false);
    expect(editor.layoutInfo.container.classList.contains('an-theme-dark')).toBe(true);
    expect(editor.layoutInfo.portal.classList.contains('an-theme-dark')).toBe(true);
    editor.destroy();
  });

  it('keeps a light editor light next to a dark one', () => {
    const dark = makeEditor({ theme: 'dark' });
    const light = makeEditor();
    expect(light.layoutInfo.container.closest('.an-theme-dark')).toBeNull();
    expect(light.layoutInfo.portal.closest('.an-theme-dark')).toBeNull();
    dark.destroy();
    light.destroy();
  });

  it('switches theme at runtime', () => {
    const editor = makeEditor();
    const { container, portal } = editor.layoutInfo;
    editor.updateOptions({ theme: 'auto' });
    expect(container.classList.contains('an-theme-auto')).toBe(true);
    expect(portal.classList.contains('an-theme-auto')).toBe(true);
    editor.updateOptions({ theme: 'light' });
    expect(container.classList.contains('an-theme-auto')).toBe(false);
    expect(portal.classList.contains('an-theme-auto')).toBe(false);
    editor.destroy();
  });
});

describe('themeVars, focusColor, zIndexOffset', () => {
  it('applies token overrides to container and portal, accepting short and full names', () => {
    const editor = makeEditor({ themeVars: { primary: '#f97316', '--an-radius': '10px' } });
    for (const el of [editor.layoutInfo.container, editor.layoutInfo.portal]) {
      expect(el.style.getPropertyValue('--an-primary')).toBe('#f97316');
      expect(el.style.getPropertyValue('--an-radius')).toBe('10px');
    }
    editor.destroy();
  });

  it('clears overrides that are no longer set', () => {
    const editor = makeEditor({ themeVars: { primary: '#f97316' } });
    // updateOptions deep-merges objects, so null is how to drop them all
    editor.updateOptions({ themeVars: null });
    editor.updateOptions({ themeVars: { text: '#222' } });
    const { container } = editor.layoutInfo;
    expect(container.style.getPropertyValue('--an-primary')).toBe('');
    expect(container.style.getPropertyValue('--an-text')).toBe('#222');
    editor.destroy();
  });

  it('updates focusColor and zIndexOffset at runtime', () => {
    const editor = makeEditor();
    editor.updateOptions({ focusColor: '#10b981', zIndexOffset: 2000 });
    const { container, portal } = editor.layoutInfo;
    expect(container.style.getPropertyValue('--an-focus-color')).toBe('#10b981');
    expect(portal.style.getPropertyValue('--an-z-offset')).toBe('2000');
    editor.updateOptions({ focusColor: null, zIndexOffset: 0 });
    expect(container.style.getPropertyValue('--an-focus-color')).toBe('');
    expect(portal.style.getPropertyValue('--an-z-offset')).toBe('');
    editor.destroy();
  });
});

describe('other runtime options', () => {
  it('toggles toolbarOverflow and stickyToolbar', () => {
    const editor = makeEditor();
    const { container } = editor.layoutInfo;
    editor.updateOptions({ toolbarOverflow: 'scroll', stickyToolbar: true, stickyToolbarOffset: 48 });
    expect(container.classList.contains('an-toolbar-overflow-scroll')).toBe(true);
    expect(container.classList.contains('an-sticky-toolbar')).toBe(true);
    expect(container.style.getPropertyValue('--an-sticky-top')).toBe('48px');
    editor.updateOptions({ toolbarOverflow: 'wrap', stickyToolbar: false });
    expect(container.classList.contains('an-toolbar-overflow-scroll')).toBe(false);
    expect(container.classList.contains('an-sticky-toolbar')).toBe(false);
    expect(container.style.getPropertyValue('--an-sticky-top')).toBe('');
    editor.destroy();
  });

  it('adds and removes the resize handle', () => {
    const editor = makeEditor({ resizable: false });
    const bar = editor.layoutInfo.statusbar;
    expect(bar.querySelector('.an-resize-handle')).toBeNull();
    editor.updateOptions({ resizable: true });
    expect(bar.querySelector('.an-resize-handle')).not.toBeNull();
    editor.updateOptions({ resizable: false });
    expect(bar.querySelector('.an-resize-handle')).toBeNull();
    editor.destroy();
  });

  it('does nothing for options passed again unchanged (framework re-renders)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const editor = makeEditor({ lang: 'en', toolbar: [['bold']], themeVars: { primary: '#f97316' } });
    const rebuild = vi.spyOn(editor._modules.get('toolbar'), 'rebuild');
    const buttonBefore = editor.layoutInfo.toolbar.querySelector('[data-btn="bold"]');
    // A wrapper passes a fresh copy of the same options on every render
    editor.updateOptions({ lang: 'en', toolbar: [['bold']], themeVars: { primary: '#f97316' } });
    expect(rebuild).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(editor.layoutInfo.toolbar.querySelector('[data-btn="bold"]')).toBe(buttonBefore);
    editor.destroy();
  });

  it('warns when a create-only option changes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const editor = makeEditor();
    editor.updateOptions({ lang: 'vi' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('lang'));
    editor.destroy();
  });
});
