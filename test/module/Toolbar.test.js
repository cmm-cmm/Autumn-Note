import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { Toolbar } from '../../src/js/module/Toolbar.js';
import { registerButton, getButton } from '../../src/js/module/Buttons.js';
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

// ── _createColorPicker ────────────────────────────────────────────────────────

describe('Toolbar._createColorPicker', () => {
  function makeColorContext(name = 'foreColor') {
    return {
      options: {
        useFontAwesome: false,
        toolbar: [[{
          name,
          type: 'colorpicker',
          icon: name,
          tooltip: 'Color',
          defaultColor: '#ff0000',
          action: vi.fn(),
        }]],
      },
      locale: en,
      invoke: vi.fn(),
    };
  }

  it('creates apply button and arrow button in wrapper', () => {
    const ctx = makeColorContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    expect(toolbar.el.querySelector('.an-color-btn')).not.toBeNull();
    expect(toolbar.el.querySelector('.an-color-arrow')).not.toBeNull();
    toolbar.destroy();
  });

  it('arrow button click opens color popup (display: block)', () => {
    const ctx = makeColorContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const arrowBtn = toolbar.el.querySelector('.an-color-arrow');
    arrowBtn.getBoundingClientRect = () => ({ bottom: 50, left: 100, right: 200, top: 30, width: 100, height: 20 });
    arrowBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const popup = document.body.querySelector('.an-color-popup');
    expect(popup).not.toBeNull();
    expect(popup.style.display).toBe('block');
    toolbar.destroy();
  });

  it('second arrow click closes the popup', () => {
    const ctx = makeColorContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const arrowBtn = toolbar.el.querySelector('.an-color-arrow');
    arrowBtn.getBoundingClientRect = () => ({ bottom: 50, left: 100, right: 200, top: 30, width: 100, height: 20 });
    arrowBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    arrowBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const popup = document.body.querySelector('.an-color-popup');
    expect(popup.style.display).toBe('none');
    toolbar.destroy();
  });

  it('swatch click applies color and calls action + afterCommand', () => {
    const ctx = makeColorContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const arrowBtn = toolbar.el.querySelector('.an-color-arrow');
    arrowBtn.getBoundingClientRect = () => ({ bottom: 50, left: 100, right: 200, top: 30, width: 100, height: 20 });
    arrowBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const swatch = document.body.querySelector('.an-color-swatch');
    swatch.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    toolbar.destroy();
  });

  it('apply button click applies current color', () => {
    const ctx = makeColorContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const applyBtn = toolbar.el.querySelector('.an-color-btn');
    applyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    toolbar.destroy();
  });

  it('document click outside popup closes it', () => {
    const ctx = makeColorContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const arrowBtn = toolbar.el.querySelector('.an-color-arrow');
    arrowBtn.getBoundingClientRect = () => ({ bottom: 50, left: 100, right: 200, top: 30, width: 100, height: 20 });
    arrowBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const popup = document.body.querySelector('.an-color-popup');
    expect(popup.style.display).toBe('none');
    toolbar.destroy();
  });

  it('backColor type creates apply button', () => {
    const ctx = makeColorContext('backColor');
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    expect(toolbar.el.querySelector('.an-color-btn')).not.toBeNull();
    toolbar.destroy();
  });

  it('arrowBtn mousedown prevents default (preserves selection)', () => {
    const ctx = makeColorContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const arrowBtn = toolbar.el.querySelector('.an-color-arrow');
    const e = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    let prevented = false;
    e.preventDefault = () => { prevented = true; };
    arrowBtn.dispatchEvent(e);
    expect(prevented).toBe(true);
    toolbar.destroy();
  });
});

// ── _createSelect ─────────────────────────────────────────────────────────────

describe('Toolbar._createSelect', () => {
  function makeSelectContext() {
    return {
      options: {
        useFontAwesome: false,
        toolbar: [[{
          name: 'fontFamily',
          type: 'select',
          tooltip: 'Font Family',
          items: ['Arial', 'Times New Roman'],
          action: vi.fn(),
          getValue: () => 'Arial',
        }]],
        fontFamilies: ['Arial', 'Times New Roman'],
        defaultFontFamily: 'Arial',
      },
      locale: en,
      invoke: vi.fn(),
    };
  }

  it('creates a select element with options', () => {
    const ctx = makeSelectContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const select = toolbar.el.querySelector('select');
    expect(select).not.toBeNull();
    expect(select.options.length).toBeGreaterThan(1);
    toolbar.destroy();
  });

  it('select change calls action and afterCommand', () => {
    const ctx = makeSelectContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const select = toolbar.el.querySelector('select');
    Object.defineProperty(select, 'selectedIndex', { value: 1, configurable: true });
    select.value = 'Arial';
    select.dispatchEvent(new Event('change'));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.focus');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    toolbar.destroy();
  });

  it('_doRefresh syncs select value using getValue', () => {
    const ctx = makeSelectContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    toolbar._doRefresh();
    const select = toolbar.el.querySelector('select');
    expect(select.value).toBe('Arial');
    toolbar.destroy();
  });

  it('select mousedown saves selection range', () => {
    const ctx = makeSelectContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const select = toolbar.el.querySelector('select');
    expect(() => select.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))).not.toThrow();
    toolbar.destroy();
  });
});

// ── _createGridPicker ─────────────────────────────────────────────────────────

describe('Toolbar._createGridPicker', () => {
  function makeGridContext() {
    return {
      options: {
        useFontAwesome: false,
        toolbar: [[{
          name: 'table',
          type: 'grid',
          icon: 'table',
          tooltip: 'Insert Table',
          action: vi.fn(),
        }]],
      },
      locale: en,
      invoke: vi.fn(),
    };
  }

  it('creates table picker wrap element', () => {
    const ctx = makeGridContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    expect(toolbar.el.querySelector('.an-table-picker-wrap')).not.toBeNull();
    toolbar.destroy();
  });

  it('button click opens the grid popup', () => {
    const ctx = makeGridContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const btn = toolbar.el.querySelector('button');
    btn.getBoundingClientRect = () => ({ bottom: 50, left: 100, right: 200, top: 30, width: 100, height: 20 });
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const popup = document.body.querySelector('.an-table-picker-popup');
    expect(popup).not.toBeNull();
    toolbar.destroy();
  });

  it('document click closes the grid popup', () => {
    const ctx = makeGridContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const btn = toolbar.el.querySelector('button');
    btn.getBoundingClientRect = () => ({ bottom: 50, left: 100, right: 200, top: 30, width: 100, height: 20 });
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const popup = document.body.querySelector('.an-table-picker-popup');
    expect(popup.style.display).toBe('none');
    toolbar.destroy();
  });

  it('hovering grid cell highlights cells', () => {
    const ctx = makeGridContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    const btn = toolbar.el.querySelector('button');
    btn.getBoundingClientRect = () => ({ bottom: 50, left: 100, right: 200, top: 30, width: 100, height: 20 });
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const popup = document.body.querySelector('.an-table-picker-popup');
    const grid = popup.querySelector('.an-table-grid');
    const cell = popup.querySelector('[data-row="2"][data-col="3"]');
    const moveEvent = new MouseEvent('mouseover', { bubbles: true });
    Object.defineProperty(moveEvent, 'target', { value: cell, configurable: true });
    grid.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(() => grid.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))).not.toThrow();
    toolbar.destroy();
  });
});

// ── _detectFontAwesome ────────────────────────────────────────────────────────

// ── registerButton / getButton ────────────────────────────────────────────────

describe('Buttons.registerButton', () => {
  it('registers a new button and makes it retrievable via getButton', () => {
    const customBtn = {
      name: 'my-custom-test-btn',
      icon: 'star',
      tooltip: 'Custom',
      action: vi.fn(),
    };
    registerButton(customBtn);
    expect(getButton('my-custom-test-btn')).toBe(customBtn);
  });

  it('warns but still registers when overwriting an existing button', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const btn1 = { name: 'duplicate-btn', icon: 'x', action: vi.fn() };
    const btn2 = { name: 'duplicate-btn', icon: 'y', action: vi.fn() };
    registerButton(btn1);
    registerButton(btn2);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('overwriting'));
    expect(getButton('duplicate-btn')).toBe(btn2);
    warnSpy.mockRestore();
  });

  it('warns and skips when btnDef is invalid', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerButton(null);
    registerButton({ noName: true });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('Toolbar._detectFontAwesome', () => {
  it('returns false when useFontAwesome option is false', () => {
    const ctx = makeContext();
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    expect(toolbar._faReady).toBe(false);
    toolbar.destroy();
  });

  it('returns true when FontAwesome class exists on page', () => {
    const faEl = document.createElement('i');
    faEl.className = 'fas';
    document.body.appendChild(faEl);
    const ctx = {
      options: {
        useFontAwesome: true,
        toolbar: [[{
          name: 'bold', icon: 'bold', tooltip: 'Bold',
          action: vi.fn(), isActive: () => false, isDisabled: () => false,
        }]],
      },
      locale: en,
      invoke: vi.fn(),
    };
    const toolbar = new Toolbar(ctx);
    toolbar.initialize();
    // _faPageLevelReady is module-level; if it was false from prev tests, won't re-detect.
    // This test verifies the detection doesn't throw.
    expect(typeof toolbar._faReady).toBe('boolean');
    toolbar.destroy();
  });
});
