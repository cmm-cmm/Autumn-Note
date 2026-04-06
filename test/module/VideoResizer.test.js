import { describe, it, expect, afterEach } from 'vitest';
import { VideoResizer } from '../../src/js/module/VideoResizer.js';

afterEach(() => {
  document.body.innerHTML = '';
});

if (typeof window.requestAnimationFrame !== 'function') {
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
}
if (typeof window.cancelAnimationFrame !== 'function') {
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}

// jsdom does not expose DragEvent — provide a minimal polyfill.
if (typeof globalThis.DragEvent === 'undefined') {
  globalThis.DragEvent = class DragEvent extends Event {
    constructor(type, init = {}) {
      super(type, init);
      this.dataTransfer = init.dataTransfer || null;
    }
  };
}

function makeContext() {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = [
    '<div class="an-video-wrapper">',
    '  <iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>',
    '  <div class="an-video-shield"></div>',
    '</div>',
  ].join('');
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
  };
}

describe('VideoResizer', () => {
  it('selects video wrapper on click and deselects on outside click', () => {
    const context = makeContext();
    const wrapper = context.layoutInfo.editable.querySelector('.an-video-wrapper');
    const shield = wrapper.querySelector('.an-video-shield');
    const resizer = new VideoResizer(context);
    resizer.initialize();

    shield.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(resizer.getActiveWrapper()).toBe(wrapper);
    expect(wrapper.classList.contains('an-video-selected')).toBe(true);
    expect(resizer._overlay.style.display).toBe('block');

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(resizer.getActiveWrapper()).toBeNull();
    expect(resizer._overlay.style.display).toBe('none');

    resizer.destroy();
  });

  it('removes overlay from DOM on destroy', () => {
    const context = makeContext();
    const resizer = new VideoResizer(context);
    resizer.initialize();

    expect(document.querySelector('.an-video-resizer')).not.toBeNull();
    resizer.destroy();
    expect(document.querySelector('.an-video-resizer')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// D1: dragstart prevention on .an-video-wrapper
// ---------------------------------------------------------------------------

describe('VideoResizer — dragstart prevention', () => {
  it('calls preventDefault() on dragstart events originating inside .an-video-wrapper', () => {
    const context = makeContext();
    const resizer = new VideoResizer(context);
    resizer.initialize();

    const wrapper = context.layoutInfo.editable.querySelector('.an-video-wrapper');
    const iframe  = wrapper.querySelector('iframe');

    const dragEvent = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    iframe.dispatchEvent(dragEvent);

    expect(dragEvent.defaultPrevented).toBe(true);

    resizer.destroy();
  });

  it('does NOT prevent dragstart for elements outside .an-video-wrapper', () => {
    const context = makeContext();
    // Add a plain paragraph alongside the video wrapper
    const p = document.createElement('p');
    p.textContent = 'Draggable text';
    context.layoutInfo.editable.appendChild(p);

    const resizer = new VideoResizer(context);
    resizer.initialize();

    const dragEvent = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    p.dispatchEvent(dragEvent);

    expect(dragEvent.defaultPrevented).toBe(false);

    resizer.destroy();
  });
});
