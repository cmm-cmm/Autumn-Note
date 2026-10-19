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
    expect(dialog._fileSrc).toBe('blob:mock-url');
    expect(dialog._urlInput.value).toBe('');
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
    expect(dialog._fileSrc).toBe('data:image/png;base64,fallback');

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

  it('runs beforeInsert only when insertion is committed', () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();
    const beforeInsert = vi.fn();

    dialog.show({ beforeInsert });
    dialog._close();
    expect(beforeInsert).not.toHaveBeenCalled();

    dialog.show({ beforeInsert });
    dialog._urlInput.value = 'https://example.com/committed.png';
    dialog._onInsert();
    expect(beforeInsert).toHaveBeenCalledOnce();

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

// ---------------------------------------------------------------------------
// Layout: labelled fields, upload drop zone, preview, alignment segments
// ---------------------------------------------------------------------------

describe('ImageDialog — layout and upload flow', () => {
  const flush = async () => { for (let i = 0; i < 4; i++) await Promise.resolve(); };
  const pickFile = async (dialog, file) => {
    Object.defineProperty(dialog._fileInput, 'files', { value: [file], configurable: true });
    dialog._onFileChange();
    await flush();
  };

  it('ties every label to its control', () => {
    const dialog = new ImageDialog(makeContext());
    dialog.initialize();

    const box = dialog._dialog;
    for (const label of box.querySelectorAll('label[for]')) {
      expect(box.querySelector(`#${label.getAttribute('for')}`)).not.toBeNull();
    }
    expect(dialog._urlInput.labels).toHaveLength(1);
    expect(dialog._altInput.labels).toHaveLength(1);
    expect(dialog._fileInput.closest('label.an-image-drop')).not.toBeNull();
    expect(box.querySelector('fieldset.an-segmented legend')).not.toBeNull();

    dialog.destroy();
  });

  it('gives each dialog its own ids and radio group', () => {
    const a = new ImageDialog(makeContext());
    const b = new ImageDialog(makeContext());
    a.initialize();
    b.initialize();

    const names = (d) => new Set([...d._alignRow.querySelectorAll('input')].map((r) => r.name));
    expect([...names(a)]).toHaveLength(1);
    expect([...names(a)][0]).not.toBe([...names(b)][0]);
    expect(a._urlInput.id).not.toBe(b._urlInput.id);

    b._alignRow.querySelector('input[value="right"]').checked = true;
    expect(a._alignRow.querySelector('input:checked').value).toBe('');

    a.destroy();
    b.destroy();
  });

  it('puts Cancel before the primary Insert button', () => {
    const dialog = new ImageDialog(makeContext());
    dialog.initialize();
    const buttons = [...dialog._dialog.querySelectorAll('.an-dialog-actions button')];
    expect(buttons.map((b) => b.classList.contains('an-btn-primary'))).toEqual([false, true]);
    dialog.destroy();
  });

  it('a chosen file replaces the drop zone with a preview and is what gets inserted', async () => {
    const context = makeContext();
    const dialog = new ImageDialog(context);
    dialog.initialize();
    dialog._urlInput.value = 'https://example.com/typed.png';

    await pickFile(dialog, new File(['x'], 'cat.png', { type: 'image/png' }));

    expect(dialog._drop.hidden).toBe(true);
    expect(dialog._preview.hidden).toBe(false);
    expect(dialog._previewName.textContent).toBe('cat.png');
    expect(dialog._previewImg.getAttribute('src')).toBe('blob:mock-url');
    expect(dialog._urlInput.value).toBe('');

    dialog._onInsert();
    expect(context.invoke).toHaveBeenCalledWith('editor.insertImage', 'blob:mock-url', '', '');
    dialog.destroy();
  });

  it('Remove clears the file and brings the drop zone back', async () => {
    const dialog = new ImageDialog(makeContext());
    dialog.initialize();
    await pickFile(dialog, new File(['x'], 'cat.png', { type: 'image/png' }));

    dialog._preview.querySelector('.an-image-preview-remove').click();

    expect(dialog._fileSrc).toBeNull();
    expect(dialog._drop.hidden).toBe(false);
    expect(dialog._preview.hidden).toBe(true);
    dialog.destroy();
  });

  it('typing a URL drops a chosen file', async () => {
    const dialog = new ImageDialog(makeContext());
    dialog.initialize();
    await pickFile(dialog, new File(['x'], 'cat.png', { type: 'image/png' }));

    dialog._urlInput.value = 'https://example.com/b.png';
    dialog._urlInput.dispatchEvent(new Event('input'));

    expect(dialog._fileSrc).toBeNull();
    expect(dialog._drop.hidden).toBe(false);
    dialog.destroy();
  });

  it('previews a committed URL with loading then error state', () => {
    const dialog = new ImageDialog(makeContext());
    dialog.initialize();

    dialog._urlInput.value = 'https://example.com/missing.png';
    dialog._urlInput.dispatchEvent(new Event('change'));
    expect(dialog._preview.hidden).toBe(false);
    expect(dialog._preview.dataset.state).toBe('loading');
    expect(dialog._preview.getAttribute('aria-busy')).toBe('true');
    expect(dialog._previewStatus.textContent).toBe('');

    expect(dialog._drop.hidden).toBe(true);

    dialog._previewImg.onerror();
    expect(dialog._preview.dataset.state).toBe('error');
    expect(dialog._preview.hasAttribute('aria-busy')).toBe(false);
    expect(dialog._previewStatus.textContent).toBe(en.imageDialog.previewError);

    dialog._urlInput.value = '';
    dialog._urlInput.dispatchEvent(new Event('change'));
    expect(dialog._preview.hidden).toBe(true);
    expect(dialog._drop.hidden).toBe(false);
    dialog.destroy();
  });

  it('does not preview a non-image scheme', () => {
    const dialog = new ImageDialog(makeContext());
    dialog.initialize();
    dialog._urlInput.value = 'javascript:alert(1)';
    dialog._urlInput.dispatchEvent(new Event('change'));
    expect(dialog._preview.hidden).toBe(true);
    dialog.destroy();
  });

  it('accepts a file dropped on the drop zone', async () => {
    const dialog = new ImageDialog(makeContext());
    dialog.initialize();

    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [new File(['x'], 'd.webp', { type: 'image/webp' })] } });
    dialog._drop.dispatchEvent(drop);
    await flush();

    expect(drop.defaultPrevented).toBe(true);
    expect(dialog._fileSrc).toBe('blob:mock-url');
    dialog.destroy();
  });

  it('show() resets file, preview and alignment', async () => {
    const dialog = new ImageDialog(makeContext());
    dialog.initialize();
    await pickFile(dialog, new File(['x'], 'cat.png', { type: 'image/png' }));
    dialog._alignRow.querySelector('input[value="left"]').checked = true;

    dialog.show();

    expect(dialog._fileSrc).toBeNull();
    expect(dialog._preview.hidden).toBe(true);
    expect(dialog._drop.hidden).toBe(false);
    expect(dialog._alignRow.querySelector('input:checked').value).toBe('');
    dialog.destroy();
  });
});
