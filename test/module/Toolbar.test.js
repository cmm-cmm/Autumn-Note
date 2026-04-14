import { describe, it, expect, vi, afterEach } from 'vitest';
import { Toolbar } from '../../src/js/module/Toolbar.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
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
