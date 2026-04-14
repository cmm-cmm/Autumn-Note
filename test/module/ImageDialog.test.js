import { describe, it, expect, vi, afterEach } from 'vitest';
import { ImageDialog } from '../../src/js/module/ImageDialog.js';
import { en } from '../../src/js/i18n/en.js';

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
    locale: en,
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
}

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

  it('clears an existing hint and does NOT fire imageError for a valid PNG file', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();

    // Pre-set a stale hint from a previous error
    dialog._fileHint.textContent = 'Old error message';

    // A valid PNG — but FileReader is not available in jsdom so we just
    // check that the hint is cleared and no imageError is triggered.
    const pngFile = new File(['data'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(dialog._fileInput, 'files', { value: [pngFile], configurable: true });

    // FileReader.readAsDataURL is a no-op in jsdom; we only verify the rejection
    // guard is skipped (no error event fired, hint cleared).
    dialog._onFileChange();

    expect(dialog._fileHint.textContent).toBe('');
    const errorCalls = context.triggerEvent.mock.calls.filter(([ev]) => ev === 'imageError');
    expect(errorCalls).toHaveLength(0);

    dialog.destroy();
  });
});
