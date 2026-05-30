import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ImageCropOverlay } from '../../src/js/module/ImageCropOverlay.js';

function makeImg() {
  const img = document.createElement('img');
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  img.style.width = '200px';
  img.style.height = '150px';
  Object.defineProperty(img, 'naturalWidth',  { value: 400, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
  return img;
}

function makeContext(overrides = {}) {
  const editable = document.createElement('div');
  editable.setAttribute('contenteditable', 'true');
  document.body.appendChild(editable);

  return {
    options: {},
    locale: { contextMenu: {} },
    layoutInfo: { editable, container: document.createElement('div') },
    invoke: vi.fn(),
    on: vi.fn(() => () => {}),
    ...overrides,
  };
}

describe('ImageCropOverlay', () => {
  let ctx;
  let overlay;

  beforeEach(() => {
    ctx = makeContext();
    overlay = new ImageCropOverlay(ctx);
    overlay.initialize();
  });

  afterEach(() => {
    overlay.destroy();
    ctx.layoutInfo.editable.remove();
  });

  it('initialize() returns instance', () => {
    expect(overlay).toBeInstanceOf(ImageCropOverlay);
  });

  it('destroy() removes elements from DOM and clears state', () => {
    overlay.destroy();
    expect(overlay._scrim).toBeNull();
  });

  it('_scrim is null before opening', () => {
    expect(overlay._scrim).toBeNull();
  });

  it('open() activates the overlay for a given image', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    // open should not throw
    expect(() => overlay.open(img)).not.toThrow();
  });

  it('open() sets _scrim element in DOM', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    expect(overlay._scrim).not.toBeNull();
    expect(document.body.contains(overlay._scrim)).toBe(true);
    overlay._close(false);
  });

  it('_close(false) removes scrim from DOM', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    overlay._close(false);
    expect(overlay._scrim).toBeNull();
  });

  it('double open() resets to new image', () => {
    const img1 = makeImg();
    const img2 = makeImg();
    ctx.layoutInfo.editable.appendChild(img1);
    ctx.layoutInfo.editable.appendChild(img2);
    expect(() => {
      overlay.open(img1);
      overlay.open(img2);
    }).not.toThrow();
    overlay._close(false);
  });

  it('destroy() is idempotent', () => {
    overlay.destroy();
    expect(() => overlay.destroy()).not.toThrow();
  });
});
