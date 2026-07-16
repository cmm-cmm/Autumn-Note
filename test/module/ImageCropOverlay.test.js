import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ImageCropOverlay } from '../../src/js/module/ImageCropOverlay.js';

function makeImg() {
  const img = document.createElement('img');
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  img.style.width = '200px';
  img.style.height = '150px';
  Object.defineProperty(img, 'naturalWidth',  { value: 400, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
  img.getBoundingClientRect = () => ({
    left: 10, top: 20, right: 210, bottom: 170,
    width: 200, height: 150, x: 10, y: 20, toJSON: () => ({}),
  });
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
    vi.restoreAllMocks();
    vi.useRealTimers();
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

  it('builds eight handles, dimensions info, and a bounded toolbar', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);

    expect(Object.keys(overlay._handles)).toHaveLength(8);
    expect(overlay._infoEl.textContent).toBe('352 × 252 px');
    expect(overlay._cropBox.style.left).toBe('22px');
    expect(overlay._toolbar.querySelectorAll('button')).toHaveLength(2);
  });

  it('moves and resizes the crop box through document drag events', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);

    overlay._startBoxMove({ clientX: 30, clientY: 40 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 70 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(overlay._box.x).toBeGreaterThan(22);
    expect(document.body.style.userSelect).toBe('');

    const previousWidth = overlay._box.w;
    overlay._startHandleDrag({ clientX: 100, clientY: 100 }, 'e');
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 100 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(overlay._box.w).toBeGreaterThanOrEqual(previousWidth);
  });

  it('supports aspect-ratio locked corner resize', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    overlay._arCheck.checked = true;
    const aspect = overlay._box.w / overlay._box.h;
    overlay._startHandleDrag({ clientX: 100, clientY: 100 }, 'se');
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 105 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(overlay._box.w / overlay._box.h).toBeCloseTo(aspect, 5);
  });

  it('closes on Escape and confirms on Enter', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    const confirm = vi.spyOn(overlay, '_confirm').mockResolvedValue();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(confirm).toHaveBeenCalledOnce();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    expect(overlay._scrim).toBeNull();
  });

  it('shows and automatically removes crop errors', () => {
    vi.useFakeTimers();
    overlay._showCropError('Cannot crop');
    expect(document.querySelector('[role="alert"]')?.textContent).toBe('Cannot crop');
    vi.advanceTimersByTime(4000);
    expect(document.querySelector('[role="alert"]')).toBeNull();
    vi.useRealTimers();
  });

  it('runs handle, crop-box, toolbar, and scrim DOM handlers', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    const move = vi.spyOn(overlay, '_startBoxMove');
    const resize = vi.spyOn(overlay, '_startHandleDrag');

    overlay._cropBox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 30, clientY: 30 }));
    overlay._handles.e.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }));
    expect(move).toHaveBeenCalledOnce();
    expect(resize).toHaveBeenCalledWith(expect.any(MouseEvent), 'e');

    const confirm = vi.spyOn(overlay, '_confirm').mockResolvedValue();
    const [confirmBtn, cancelBtn] = overlay._toolbar.querySelectorAll('button');
    confirmBtn.dispatchEvent(new MouseEvent('mouseover'));
    expect(confirmBtn.style.background).not.toBe('none');
    confirmBtn.dispatchEvent(new MouseEvent('mouseout'));
    confirmBtn.click();
    expect(confirm).toHaveBeenCalledOnce();
    cancelBtn.click();
    expect(overlay._scrim).toBeNull();

    overlay.open(img);
    overlay._scrim.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(overlay._scrim).toBeNull();
  });

  it('moves and resizes through touch events and cleans drag listeners', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);

    const touchStart = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperty(touchStart, 'touches', { value: [{ clientX: 50, clientY: 60 }] });
    overlay._cropBox.dispatchEvent(touchStart);
    const touchMove = new Event('touchmove', { bubbles: true, cancelable: true });
    Object.defineProperty(touchMove, 'touches', { value: [{ clientX: 70, clientY: 80 }] });
    document.dispatchEvent(touchMove);
    document.dispatchEvent(new Event('touchend'));
    expect(document.body.style.userSelect).toBe('');

    const handleTouch = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperty(handleTouch, 'touches', { value: [{ clientX: 100, clientY: 100 }] });
    overlay._handles.nw.dispatchEvent(handleTouch);
    const resizeMove = new Event('touchmove', { bubbles: true, cancelable: true });
    Object.defineProperty(resizeMove, 'touches', { value: [{ clientX: 110, clientY: 115 }] });
    document.dispatchEvent(resizeMove);
    document.dispatchEvent(new Event('touchend'));
    expect(overlay._box.w).toBeGreaterThanOrEqual(20);
  });

  it('covers every resize direction and the vertical aspect-ratio branch', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    for (const id of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
      overlay._startHandleDrag({ clientX: 100, clientY: 100 }, id);
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 95, clientY: 125 }));
      document.dispatchEvent(new MouseEvent('mouseup'));
    }
    overlay._arCheck.checked = true;
    overlay._startHandleDrag({ clientX: 100, clientY: 100 }, 'nw');
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 98, clientY: 125 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(overlay._box.x).toBeGreaterThanOrEqual(10);
  });

  it('positions the toolbar above a crop near the viewport bottom', () => {
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    const originalHeight = globalThis.innerHeight;
    Object.defineProperty(globalThis, 'innerHeight', { value: 180, configurable: true });
    overlay._updateDOM();
    expect(parseFloat(overlay._toolbar.style.top)).toBeLessThan(overlay._box.y);
    Object.defineProperty(globalThis, 'innerHeight', { value: originalHeight, configurable: true });
  });

  it('applies a successful crop and records the edit', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
      getImageData: vi.fn(() => new Uint8ClampedArray(4)),
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,cropped');
    const img = makeImg();
    img.setAttribute('width', '200');
    img.setAttribute('height', '150');
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);

    await overlay._confirm();
    expect(drawImage).toHaveBeenCalledOnce();
    expect(img.src).toContain('data:image/png;base64,cropped');
    expect(img.hasAttribute('width')).toBe(false);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    expect(ctx.invoke).toHaveBeenCalledWith('imageResizer.updateOverlay');
  });

  it('reports canvas failures and closes without changing the image', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const error = vi.spyOn(overlay, '_showCropError');
    const img = makeImg();
    const original = img.src;
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    await overlay._confirm();
    expect(error).toHaveBeenCalledOnce();
    expect(img.src).toBe(original);
    expect(overlay._scrim).toBeNull();
  });

  it('closes safely when confirm has no image or an empty crop', async () => {
    await overlay._confirm();
    const img = makeImg();
    ctx.layoutInfo.editable.appendChild(img);
    overlay.open(img);
    overlay._box.w = 0;
    await overlay._confirm();
    expect(overlay._scrim).toBeNull();
  });
});
