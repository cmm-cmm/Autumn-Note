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
});
