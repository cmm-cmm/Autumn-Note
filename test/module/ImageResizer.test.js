import { describe, it, expect, afterEach } from 'vitest';
import { ImageResizer } from '../../src/js/module/ImageResizer.js';

afterEach(() => {
  document.body.innerHTML = '';
});

if (typeof window.requestAnimationFrame !== 'function') {
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
}
if (typeof window.cancelAnimationFrame !== 'function') {
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}

function makeContext() {
  const container = document.createElement('div');
  container.className = 'an-container';
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p><img src="x.png" alt="img"></p>';
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    layoutInfo: { editable, container },
  };
}

describe('ImageResizer', () => {
  it('selects image on click, shows overlay, and deselects on outside click', () => {
    const context = makeContext();
    const img = context.layoutInfo.editable.querySelector('img');
    const resizer = new ImageResizer(context);
    resizer.initialize();

    img.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(resizer.getActiveImage()).toBe(img);
    expect(img.classList.contains('an-image-selected')).toBe(true);
    expect(resizer._overlay.style.display).toBe('block');

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(resizer.getActiveImage()).toBeNull();
    expect(resizer._overlay.style.display).toBe('none');

    resizer.destroy();
  });

  it('removes overlay from DOM on destroy', () => {
    const context = makeContext();
    const resizer = new ImageResizer(context);
    resizer.initialize();

    expect(document.querySelector('.an-image-resizer')).not.toBeNull();
    resizer.destroy();
    expect(document.querySelector('.an-image-resizer')).toBeNull();
  });
});
