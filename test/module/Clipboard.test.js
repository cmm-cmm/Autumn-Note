import { describe, it, expect, vi, afterEach } from 'vitest';
import { Clipboard } from '../../src/js/module/Clipboard.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext() {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
}

describe('Clipboard', () => {
  it('setForcePlain toggles one-shot plain paste flag', () => {
    const c = new Clipboard(makeContext());
    c.setForcePlain(true);
    expect(c._forcePlain).toBe(true);
    c.setForcePlain(false);
    expect(c._forcePlain).toBe(false);
  });

  it('resolveImages replaces known blob URLs with data URLs', () => {
    const c = new Clipboard(makeContext());
    c._blobRegistry = new Map([
      ['blob:abc', 'data:image/png;base64,AAA'],
    ]);
    const html = '<p><img src="blob:abc"></p>';
    expect(c.resolveImages(html)).toContain('data:image/png;base64,AAA');
  });
});

// ---------------------------------------------------------------------------
// C2: Unsupported image format rejection (_insertImageFiles)
// ---------------------------------------------------------------------------

describe('Clipboard — unsupported image format rejection', () => {
  it('fires imageError and does not invoke insertImage for image/tiff files', () => {
    const context = makeContext();
    const cb = new Clipboard(context);
    cb.initialize();

    const tiffFile = new File(['data'], 'photo.tiff', { type: 'image/tiff' });
    cb._insertImageFiles([tiffFile]);

    expect(context.triggerEvent).toHaveBeenCalledWith(
      'imageError',
      expect.objectContaining({ file: tiffFile }),
    );
    expect(context.invoke).not.toHaveBeenCalledWith(
      expect.stringContaining('insertImage'),
      expect.anything(),
      expect.anything(),
    );

    cb.destroy();
  });

  it('fires imageError and does not invoke insertImage for image/bmp files', () => {
    const context = makeContext();
    const cb = new Clipboard(context);
    cb.initialize();

    const bmpFile = new File(['data'], 'bitmap.bmp', { type: 'image/bmp' });
    cb._insertImageFiles([bmpFile]);

    expect(context.triggerEvent).toHaveBeenCalledWith(
      'imageError',
      expect.objectContaining({ file: bmpFile }),
    );

    cb.destroy();
  });

  it('fires imageError for image/x-tiff (alternate MIME type)', () => {
    const context = makeContext();
    const cb = new Clipboard(context);
    cb.initialize();

    const file = new File(['data'], 'scan.tif', { type: 'image/x-tiff' });
    cb._insertImageFiles([file]);

    expect(context.triggerEvent).toHaveBeenCalledWith(
      'imageError',
      expect.objectContaining({ file }),
    );

    cb.destroy();
  });

  it('does NOT reject supported formats (PNG, JPEG, WebP)', () => {
    const context = makeContext();
    // Stub onImageUpload to capture files without performing actual compression
    context.options.onImageUpload = vi.fn();
    const cb = new Clipboard(context);
    cb.initialize();

    const pngFile  = new File(['data'], 'photo.png',  { type: 'image/png' });
    const jpegFile = new File(['data'], 'photo.jpg',  { type: 'image/jpeg' });
    const webpFile = new File(['data'], 'photo.webp', { type: 'image/webp' });

    cb._insertImageFiles([pngFile]);
    cb._insertImageFiles([jpegFile]);
    cb._insertImageFiles([webpFile]);

    // triggerEvent must not have been called with 'imageError'
    const errorCalls = context.triggerEvent.mock.calls.filter(([ev]) => ev === 'imageError');
    expect(errorCalls).toHaveLength(0);
    // onImageUpload should have been invoked for each supported file
    expect(context.options.onImageUpload).toHaveBeenCalledTimes(3);

    cb.destroy();
  });
});
