import { describe, it, expect, vi, afterEach } from 'vitest';
import { Fullscreen } from '../../src/js/module/Fullscreen.js';

afterEach(() => {
  document.body.innerHTML = '';
  document.body.style.overflow = '';
});

function makeContext() {
  const container = document.createElement('div');
  container.style.height = '420px';
  document.body.appendChild(container);
  return {
    layoutInfo: { container },
    invoke: vi.fn(),
  };
}

describe('Fullscreen', () => {
  it('activates and deactivates fullscreen state', () => {
    const context = makeContext();
    const fs = new Fullscreen(context);

    fs.activate();
    expect(fs.isActive()).toBe(true);
    expect(context.layoutInfo.container.classList.contains('an-fullscreen')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    fs.deactivate();
    expect(fs.isActive()).toBe(false);
    expect(context.layoutInfo.container.classList.contains('an-fullscreen')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('exits on Escape after initialize listener is bound', () => {
    const context = makeContext();
    const fs = new Fullscreen(context);
    fs.initialize();
    fs.activate();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fs.isActive()).toBe(false);

    fs.destroy();
  });
});
