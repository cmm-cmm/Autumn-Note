import { describe, it, expect, vi, afterEach } from 'vitest';
import { Clipboard } from '../../src/js/module/Clipboard.js';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function makeContext(opts = {}) {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
    options: {
      pasteStripAttributes: false,
      pasteAsPlainText: false,
      onImageUpload: null,
      ...opts,
    },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
    getHTML: vi.fn(() => '<p></p>'),
  };
}

function makeClipboard(opts = {}) {
  const ctx = makeContext(opts);
  const cb = new Clipboard(ctx);
  cb.initialize();
  return { ctx, cb };
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

describe('Clipboard lifecycle', () => {
  it('initialize creates _blobRegistry and attaches listeners', () => {
    const { cb } = makeClipboard();
    expect(cb._blobRegistry).toBeInstanceOf(Map);
  });

  it('destroy disconnects mutation observer', () => {
    const { cb } = makeClipboard();
    const disconnectSpy = vi.spyOn(cb._mutationObserver, 'disconnect');
    cb.destroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('destroy clears blob registry', () => {
    const { cb } = makeClipboard();
    cb._blobRegistry.set('blob:fake', 'data:fake');
    cb.destroy();
    expect(cb._blobRegistry.size).toBe(0);
  });
});

// ── setForcePlain ────────────────────────────────────────────────────────────

describe('Clipboard.setForcePlain', () => {
  it('sets _forcePlain to true', () => {
    const { cb } = makeClipboard();
    cb.setForcePlain(true);
    expect(cb._forcePlain).toBe(true);
  });

  it('sets _forcePlain to false', () => {
    const { cb } = makeClipboard();
    cb.setForcePlain(true);
    cb.setForcePlain(false);
    expect(cb._forcePlain).toBe(false);
  });

  it('coerces non-boolean to boolean', () => {
    const { cb } = makeClipboard();
    cb.setForcePlain('yes');
    expect(cb._forcePlain).toBe(true);
    cb.setForcePlain(0);
    expect(cb._forcePlain).toBe(false);
  });
});

// ── _cleanWordHtml ────────────────────────────────────────────────────────────

describe('Clipboard._cleanWordHtml', () => {
  it('removes conditional comments', () => {
    const { cb } = makeClipboard();
    const input = '<!--[if mso]><p>Word only</p><![endif]--><p>Hello</p>';
    const out = cb._cleanWordHtml(input);
    expect(out).not.toContain('[if mso]');
    expect(out).toContain('<p>Hello</p>');
  });

  it('removes XML data blobs', () => {
    const { cb } = makeClipboard();
    const input = '<xml><o:OfficeDocumentSettings></o:OfficeDocumentSettings></xml><p>Text</p>';
    const out = cb._cleanWordHtml(input);
    expect(out).not.toContain('<xml>');
    expect(out).toContain('<p>Text</p>');
  });

  it('removes Office namespace elements', () => {
    const { cb } = makeClipboard();
    const input = '<p>Hello<o:p></o:p></p><w:sDt>junk</w:sDt>';
    const out = cb._cleanWordHtml(input);
    expect(out).not.toContain('<o:p>');
    expect(out).not.toContain('<w:sDt>');
    expect(out).toContain('Hello');
  });

  it('removes Mso class attributes', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanWordHtml('<p class="MsoNormal">Paragraph</p>');
    expect(out).not.toContain('MsoNormal');
    expect(out).toContain('Paragraph');
  });

  it('strips mso-* properties from inline styles, keeps others', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanWordHtml('<p style="mso-margin-alt: 0; font-size: 14px">Text</p>');
    expect(out).not.toContain('mso-margin-alt');
    expect(out).toContain('font-size: 14px');
  });

  it('removes empty paragraphs', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanWordHtml('<p>Real</p><p></p><p>&nbsp;</p>');
    expect(out).not.toMatch(/<p[^>]*>\s*(&nbsp;)?\s*<\/p>/i);
    expect(out).toContain('<p>Real</p>');
  });

  it('removes XML processing instructions', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanWordHtml('<?xml version="1.0"?><p>Content</p>');
    expect(out).not.toContain('<?xml');
    expect(out).toContain('<p>Content</p>');
  });
});

// ── _cleanSocialHtml ──────────────────────────────────────────────────────────

describe('Clipboard._cleanSocialHtml', () => {
  it('removes class and data-* attributes', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanSocialHtml('<p class="r-bcqeeo" data-testid="tweet">Hello</p>');
    expect(out).not.toContain('r-bcqeeo');
    expect(out).not.toContain('data-testid');
    expect(out).toContain('Hello');
  });

  it('preserves semantic elements like <a>', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanSocialHtml('<span><a href="https://example.com">Link</a></span>');
    expect(out).toContain('<a');
    expect(out).toContain('Link');
  });

  it('preserves <strong> inside spans', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanSocialHtml('<span><strong>Bold text</strong></span>');
    expect(out).toContain('<strong>Bold text</strong>');
  });

  it('removes aria-* attributes', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanSocialHtml('<button aria-label="Like" aria-pressed="false">👍</button>');
    expect(out).not.toContain('aria-label');
    expect(out).not.toContain('aria-pressed');
  });

  it('removes id attribute', () => {
    const { cb } = makeClipboard();
    const out = cb._cleanSocialHtml('<p id="post-123">Post content</p>');
    expect(out).not.toContain('id=');
    expect(out).toContain('Post content');
  });
});

// ── _stripAttributes ─────────────────────────────────────────────────────────

describe('Clipboard._stripAttributes', () => {
  it('removes class, style, id', () => {
    const { cb } = makeClipboard();
    const out = cb._stripAttributes('<p class="foo" style="color:red" id="bar">Text</p>');
    expect(out).not.toContain('class=');
    expect(out).not.toContain('style=');
    expect(out).not.toContain('id=');
    expect(out).toContain('Text');
  });

  it('keeps href on anchor elements', () => {
    const { cb } = makeClipboard();
    const out = cb._stripAttributes('<a href="https://example.com" class="link">Click</a>');
    expect(out).toContain('href=');
    expect(out).not.toContain('class=');
  });

  it('keeps src and alt on images', () => {
    const { cb } = makeClipboard();
    const out = cb._stripAttributes('<img src="photo.jpg" alt="Photo" class="hero" style="width:100%">');
    expect(out).toContain('src=');
    expect(out).toContain('alt=');
    expect(out).not.toContain('class=');
  });

  it('keeps colspan and rowspan on table cells', () => {
    const { cb } = makeClipboard();
    const out = cb._stripAttributes('<table><tr><td colspan="2" rowspan="3" class="cell">Data</td></tr></table>');
    expect(out).toContain('colspan=');
    expect(out).toContain('rowspan=');
    expect(out).not.toContain('class=');
  });

  it('removes data-* attributes', () => {
    const { cb } = makeClipboard();
    const out = cb._stripAttributes('<div data-id="123" data-track="click">Content</div>');
    expect(out).not.toContain('data-id');
    expect(out).not.toContain('data-track');
    expect(out).toContain('Content');
  });
});

// ── _revokeRemovedBlobs ───────────────────────────────────────────────────────

describe('Clipboard._revokeRemovedBlobs', () => {
  it('skips when registry is empty', () => {
    const { cb } = makeClipboard();
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    cb._revokeRemovedBlobs(document.createElement('div'));
    expect(revoke).not.toHaveBeenCalled();
  });

  it('revokes blob URL when img with matching src is removed', () => {
    const { cb } = makeClipboard();
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const blobUrl = 'blob:fake-url';
    cb._blobRegistry.set(blobUrl, 'data:fake');
    const img = document.createElement('img');
    img.setAttribute('src', blobUrl);
    cb._revokeRemovedBlobs(img);
    expect(revoke).toHaveBeenCalledWith(blobUrl);
    expect(cb._blobRegistry.has(blobUrl)).toBe(false);
  });

  it('revokes blob URLs from nested imgs when container is removed', () => {
    const { cb } = makeClipboard();
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const blobUrl = 'blob:nested-url';
    cb._blobRegistry.set(blobUrl, 'data:fake');
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.setAttribute('src', blobUrl);
    div.appendChild(img);
    cb._revokeRemovedBlobs(div);
    expect(revoke).toHaveBeenCalledWith(blobUrl);
  });
});

// ── resolveImages ─────────────────────────────────────────────────────────────

describe('Clipboard.resolveImages', () => {
  it('returns html unchanged when blobRegistry is empty', () => {
    const { cb } = makeClipboard();
    const html = '<p>no blobs here</p>';
    expect(cb.resolveImages(html)).toBe(html);
  });

  it('replaces blob: URL with data URL from registry', () => {
    const { cb } = makeClipboard();
    const blobUrl = 'blob:test-abc123';
    const dataUrl = 'data:image/png;base64,abc123';
    cb._blobRegistry.set(blobUrl, dataUrl);
    const html = `<img src="${blobUrl}">`;
    const result = cb.resolveImages(html);
    expect(result).toContain(dataUrl);
    expect(result).not.toContain(blobUrl);
  });

  it('leaves unknown blob: URLs intact', () => {
    const { cb } = makeClipboard();
    const html = '<img src="blob:unknown-url">';
    const result = cb.resolveImages(html);
    expect(result).toBe(html);
  });
});

// ── _dataUrlToBlob ────────────────────────────────────────────────────────────

describe('Clipboard._dataUrlToBlob', () => {
  it('converts a data URL to a Blob', () => {
    const { cb } = makeClipboard();
    // A minimal valid PNG in base64
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const blob = cb._dataUrlToBlob(dataUrl);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });
});

// ── _insertImageFiles with onImageUpload ──────────────────────────────────────

describe('Clipboard._insertImageFiles', () => {
  it('calls onImageUpload when provided', () => {
    const onImageUpload = vi.fn();
    const { cb } = makeClipboard({ onImageUpload });
    const file = new File(['content'], 'photo.png', { type: 'image/png' });
    cb._insertImageFiles([file]);
    expect(onImageUpload).toHaveBeenCalledWith([file]);
  });

  it('does nothing for empty files array', () => {
    const { cb } = makeClipboard();
    expect(() => cb._insertImageFiles([])).not.toThrow();
  });

  it('skips unsupported image formats and triggers imageError event', () => {
    const { cb } = makeClipboard();
    const file = new File(['data'], 'image.bmp', { type: 'image/bmp' });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    cb._insertImageFiles([file]);
    expect(cb.context.triggerEvent).toHaveBeenCalledWith('imageError', expect.objectContaining({ file }));
    warn.mockRestore();
  });
});

// ── _onDragover ───────────────────────────────────────────────────────────────

describe('Clipboard._onDragover', () => {
  it('prevents default when Files in dataTransfer.types', () => {
    const { cb } = makeClipboard();
    const event = {
      dataTransfer: { types: ['Files'], dropEffect: '' },
      preventDefault: vi.fn(),
    };
    cb._onDragover(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.dataTransfer.dropEffect).toBe('copy');
  });

  it('does nothing when no Files in dataTransfer.types', () => {
    const { cb } = makeClipboard();
    const event = {
      dataTransfer: { types: ['text/plain'], dropEffect: '' },
      preventDefault: vi.fn(),
    };
    cb._onDragover(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('returns early when no dataTransfer', () => {
    const { cb } = makeClipboard();
    expect(() => cb._onDragover({ dataTransfer: null })).not.toThrow();
  });
});

// ── _onDrop ───────────────────────────────────────────────────────────────────

describe('Clipboard._onDrop', () => {
  it('returns early when no files', () => {
    const { cb } = makeClipboard();
    const event = { dataTransfer: { files: { length: 0 } }, preventDefault: vi.fn() };
    cb._onDrop(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('returns early when no dataTransfer', () => {
    const { cb } = makeClipboard();
    expect(() => cb._onDrop({ dataTransfer: null })).not.toThrow();
  });
});
