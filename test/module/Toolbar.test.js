import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toolbar } from '../../src/js/module/Toolbar.js';
import { en } from '../../src/js/i18n/en.js';

beforeEach(() => {
  // Toolbar.refresh() is debounced via requestAnimationFrame.
  // Replace rAF with a synchronous stub so assertions can check state immediately.
  vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

function makeContext() {
  return {
    options: {
      useFontAwesome: false,
      toolbar: [[
        {
          name: 'bold',
          icon: 'bold',
          tooltip: 'Bold',
          action: vi.fn(),
          isActive: () => true,
          isDisabled: () => false,
        },
      ]],
    },
    locale: en,
    invoke: vi.fn(),
  };
}

describe('Toolbar', () => {
  it('builds toolbar buttons and refreshes active state', () => {
    const context = makeContext();
    const toolbar = new Toolbar(context);
    toolbar.initialize();

    expect(toolbar.el).not.toBeNull();
    const btn = toolbar.el.querySelector('button[data-btn="bold"]');
    expect(btn).not.toBeNull();

    toolbar.refresh();
    expect(btn.classList.contains('active')).toBe(true);

    toolbar.destroy();
  });

  it('button with isDisabled=true gets disabled attribute after refresh', () => {
    const context = {
      options: {
        useFontAwesome: false,
        toolbar: [[{
          name: 'cut', icon: 'cut', tooltip: 'Cut',
          action: vi.fn(),
          isActive: () => false,
          isDisabled: () => true,
        }]],
      },
      locale: en,
      invoke: vi.fn(),
    };
    const toolbar = new Toolbar(context);
    toolbar.initialize();
    toolbar.refresh();
    const btn = toolbar.el.querySelector('button[data-btn="cut"]');
    expect(btn.disabled).toBe(true);
    toolbar.destroy();
  });

  it('multiple groups each render as an-btn-group', () => {
    const context = {
      options: {
        useFontAwesome: false,
        toolbar: [
          [{ name: 'bold', icon: 'bold', tooltip: 'B', action: vi.fn(), isActive: () => false, isDisabled: () => false }],
          [{ name: 'italic', icon: 'italic', tooltip: 'I', action: vi.fn(), isActive: () => false, isDisabled: () => false }],
        ],
      },
      locale: en,
      invoke: vi.fn(),
    };
    const toolbar = new Toolbar(context);
    toolbar.initialize();
    expect(toolbar.el.querySelectorAll('.an-btn-group').length).toBe(2);
    toolbar.destroy();
  });

  it('destroy clears el and disposers', () => {
    const context = makeContext();
    const toolbar = new Toolbar(context);
    toolbar.initialize();
    toolbar.destroy();
    expect(toolbar.el).toBeNull();
    expect(toolbar._disposers.length).toBe(0);
  });

  it('show() makes toolbar visible', () => {
    const context = makeContext();
    const toolbar = new Toolbar(context);
    toolbar.initialize();
    toolbar.el.style.display = 'none';
    toolbar.show();
    expect(toolbar.el.style.display).not.toBe('none');
    toolbar.destroy();
  });

  it('hide() hides toolbar', () => {
    const context = makeContext();
    const toolbar = new Toolbar(context);
    toolbar.initialize();
    toolbar.hide();
    expect(toolbar.el.style.display).toBe('none');
    toolbar.destroy();
  });

  it('rebuild() re-renders buttons', () => {
    const context = makeContext();
    const toolbar = new Toolbar(context);
    toolbar.initialize();
    vi.spyOn(toolbar, '_buildButtons');
    toolbar.rebuild();
    expect(toolbar._buildButtons).toHaveBeenCalled();
    toolbar.destroy();
  });
});
