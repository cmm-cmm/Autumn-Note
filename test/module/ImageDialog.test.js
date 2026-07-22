import { describe, it, expect, vi, afterEach } from 'vitest';
import { ImageDialog } from '../../src/js/module/ImageDialog.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
});

const makeContext = () => {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    locale: en,
    invoke: vi.fn((path) => {
      if (path === 'clipboard.compressAndRegister') return Promise.resolve('blob:mock-url');
      return undefined;
    }),
    triggerEvent: vi.fn(),
  };
};

describe('ImageDialog', () => {
  it('invokes editor.insertImage with selected alignment', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    dialog._savedRange = { select: vi.fn() };
    dialog._urlInput.value = 'https://example.com/a.png';
    dialog._altInput.value = 'Alt';
    const centerRadio = dialog._alignRow.querySelector('input[value="center"]');
    centerRadio.checked = true;

    dialog._onInsert();

    expect(context.invoke).toHaveBeenCalledWith('editor.insertImage', 'https://example.com/a.png', 'Alt', 'center');
    expect(dialog._savedRange).toBeNull();

    dialog.destroy();
  });

  it('does not insert when src is empty', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    dialog._urlInput.value = '   ';
    dialog._onInsert();

    expect(context.invoke).not.toHaveBeenCalled();
    dialog.destroy();
  });

  it('skips _onFileChange when the context has been destroyed', () => {
    const context = makeContext();
    context._alive = false;
    const dialog = new ImageDialog(context);
    dialog.initialize();

    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(dialog._fileInput, 'files', { value: [file], configurable: true });

    dialog._onFileChange();

    expect(context.triggerEvent).not.toHaveBeenCalled();
    expect(dialog._urlInput.value).toBe('');

    dialog.destroy();
  });
});

// ---------------------------------------------------------------------------
// C2: TIFF / BMP rejection in file upload
// ---------------------------------------------------------------------------

describe('ImageDialog — unsupported format rejection in file input', () => {
  it('shows a hint message and fires imageError when a TIFF file is selected', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    // Simulate a TIFF file being selected through the hidden file input
    const tiffFile = new File(['data'], 'scan.tiff', { type: 'image/tiff' });
    Object.defineProperty(dialog._fileInput, 'files', { value: [tiffFile], configurable: true });

    dialog._onFileChange();

    // Hint text must be set (not empty)
    expect(dialog._fileHint.textContent).not.toBe('');
    // imageError event must be fired
    expect(context.triggerEvent).toHaveBeenCalledWith(
      'imageError',
      expect.objectContaining({ file: tiffFile }),
    );
    // URL input must NOT be populated with base64 data (the TIFF was rejected)
    expect(dialog._urlInput.value).toBe('');

    dialog.destroy();
  });

  it('shows a hint message and fires imageError when a BMP file is selected', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    const bmpFile = new File(['data'], 'bitmap.bmp', { type: 'image/bmp' });
    Object.defineProperty(dialog._fileInput, 'files', { value: [bmpFile], configurable: true });

    dialog._onFileChange();

    expect(dialog._fileHint.textContent).not.toBe('');
    expect(context.triggerEvent).toHaveBeenCalledWith(
      'imageError',
      expect.objectContaining({ file: bmpFile }),
    );

    dialog.destroy();
  });

  it('clears an existing hint and does NOT fire imageError for a valid PNG file', async () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    // Pre-set a stale hint from a previous error
    dialog._fileHint.textContent = 'Old error message';

    const pngFile = new File(['data'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(dialog._fileInput, 'files', { value: [pngFile], configurable: true });

    dialog._onFileChange();
    await Promise.resolve();
    await Promise.resolve();

    expect(dialog._fileHint.textContent).toBe('');
    expect(dialog._urlInput.value).toBe('blob:mock-url');
    const errorCalls = context.triggerEvent.mock.calls.filter(([ev]) => ev === 'imageError');
    expect(errorCalls).toHaveLength(0);

    dialog.destroy();
  });

  it('falls back to embedding the original file when clipboard.compressAndRegister rejects', async () => {
    class StubFileReader {
      readAsDataURL() {
        this.onload?.({ target: { result: 'data:image/png;base64,fallback' } });
      }
    }
    vi.stubGlobal('FileReader', StubFileReader);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const context = makeContext();
    context.invoke = vi.fn((path) => {
      if (path === 'clipboard.compressAndRegister') return Promise.reject(new Error('canvas unavailable'));
      return undefined;
    });
    const dialog = new ImageDialog(context);
    dialog.initialize();

    const pngFile = new File(['data'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(dialog._fileInput, 'files', { value: [pngFile], configurable: true });

    dialog._onFileChange();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(warn).toHaveBeenCalled();
    expect(dialog._urlInput.value).toBe('data:image/png;base64,fallback');

    dialog.destroy();
    vi.unstubAllGlobals();
    warn.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// C3: show / open / close lifecycle
// ---------------------------------------------------------------------------

describe('ImageDialog — show / open / close', () => {
  it('show() opens the dialog with display:flex', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    dialog.show();
    expect(dialog._dialog.style.display).toBe('flex');

    dialog.destroy();
  });

  it('show() resets URL and alt inputs', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    dialog._urlInput.value = 'https://old.com/img.png';
    dialog._altInput.value = 'old alt';

    dialog.show();

    expect(dialog._urlInput.value).toBe('');
    expect(dialog._altInput.value).toBe('');

    dialog.destroy();
  });

  it('_close() hides the dialog', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    dialog._open();
    expect(dialog._dialog.style.display).toBe('flex');

    dialog._close();
    expect(dialog._dialog.style.display).toBe('none');

    dialog.destroy();
  });

  it('_close() clears savedRange', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    dialog._savedRange = { select: vi.fn() };
    dialog._close();
    expect(dialog._savedRange).toBeNull();

    dialog.destroy();
  });
});

// ---------------------------------------------------------------------------
// C4: file size rejection
// ---------------------------------------------------------------------------

describe('ImageDialog — file size validation', () => {
  it('rejects files larger than 5 MB (default) with imageError event', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'huge.png', { type: 'image/png' });
    Object.defineProperty(dialog._fileInput, 'files', { value: [bigFile], configurable: true });

    dialog._onFileChange();

    expect(dialog._fileHint.textContent).not.toBe('');
    expect(context.triggerEvent).toHaveBeenCalledWith(
      'imageError',
      expect.objectContaining({ file: bigFile }),
    );

    dialog.destroy();
  });

  it('rejects files larger than custom maxImageSize option', () => {
    const context = makeContext();
    context.options.maxImageSize = 1;
    const dialog = new ImageDialog(context);
    dialog.initialize();

    const bigFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    Object.defineProperty(dialog._fileInput, 'files', { value: [bigFile], configurable: true });

    dialog._onFileChange();

    expect(context.triggerEvent).toHaveBeenCalledWith(
      'imageError',
      expect.objectContaining({ file: bigFile }),
    );

    dialog.destroy();
  });
});
