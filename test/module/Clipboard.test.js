import { describe, it, expect, vi, afterEach } from 'vitest';
import { Clipboard } from '../../src/js/module/Clipboard.js';

if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const makeContext = (opts = {}) => {
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
};

const makeClipboard = (opts = {}) => {
  const ctx = makeContext(opts);
  const cb = new Clipboard(ctx);
  cb.initialize();
  return { ctx, cb };
};

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

// ── _normalizeExternalTaskLists ───────────────────────────────────────────────

describe('Clipboard._normalizeExternalTaskLists', () => {
  it('adds an-checklist class and normalizes a GitHub-style direct checkbox', () => {
    const { cb } = makeClipboard();
    const html = '<ul class="contains-task-list">'
      + '<li class="task-list-item"><input type="checkbox" disabled class="task-list-item-checkbox">Todo</li>'
      + '</ul>';
    const out = cb._normalizeExternalTaskLists(html);
    expect(out).toContain('an-checklist');
    expect(out).toContain('contenteditable="false"');
    expect(out).not.toContain('disabled');
    expect(out).not.toContain('task-list-item-checkbox');
    expect(out).toContain('Todo');
  });

  it('normalizes a checkbox wrapped in a <label> inside the <li>', () => {
    const { cb } = makeClipboard();
    const html = '<ul><li><label><input type="checkbox" disabled>Wrapped</label></li></ul>';
    const out = cb._normalizeExternalTaskLists(html);
    expect(out).toContain('an-checklist');
    expect(out).toContain('contenteditable="false"');
    expect(out).not.toContain('disabled');
    expect(out).toContain('Wrapped');
  });

  it('preserves checked state', () => {
    const { cb } = makeClipboard();
    const html = '<ul><li><input type="checkbox" checked disabled>Done</li></ul>';
    const out = cb._normalizeExternalTaskLists(html);
    expect(out).toContain('checked');
    expect(out).toContain('an-checklist');
  });

  it('normalizes multiple task lists in the same paste', () => {
    const { cb } = makeClipboard();
    const html = '<ul><li><input type="checkbox">A</li></ul><p>text</p><ul><li><input type="checkbox">B</li></ul>';
    const out = cb._normalizeExternalTaskLists(html);
    const matches = out.match(/an-checklist/g) || [];
    expect(matches.length).toBe(2);
  });

  it('leaves an already-normalized ul.an-checklist untouched', () => {
    const { cb } = makeClipboard();
    const html = '<ul class="an-checklist"><li><input type="checkbox" contenteditable="false">Todo</li></ul>';
    const out = cb._normalizeExternalTaskLists(html);
    expect(out).toBe(html);
  });

  it('ignores checkboxes outside any list', () => {
    const { cb } = makeClipboard();
    const html = '<p><input type="checkbox">Not a list</p>';
    const out = cb._normalizeExternalTaskLists(html);
    expect(out).not.toContain('an-checklist');
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

  it('returns early when no image files in drop', () => {
    const { cb } = makeClipboard();
    const textFile = new File(['txt'], 'doc.txt', { type: 'text/plain' });
    const event = {
      dataTransfer: { files: [textFile] },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 100,
      clientY: 100,
    };
    cb._onDrop(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('calls _insertImageFiles when image file is dropped', () => {
    const onImageUpload = vi.fn();
    const { cb } = makeClipboard({ onImageUpload });
    const imgFile = new File(['data'], 'photo.png', { type: 'image/png' });
    const event = {
      dataTransfer: { files: [imgFile] },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 100,
      clientY: 100,
    };
    cb._onDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onImageUpload).toHaveBeenCalledWith([imgFile]);
  });

  it('converts a dropped .md file to HTML and inserts it', async () => {
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const { cb } = makeClipboard();
    const mdFile = new File(['# Heading'], 'notes.md', { type: 'text/markdown' });
    const event = {
      dataTransfer: { files: [mdFile] },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 100,
      clientY: 100,
    };
    const callsBefore = document.execCommand.mock.calls.length;
    cb._onDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    await vi.waitFor(() => expect(document.execCommand.mock.calls.length).toBeGreaterThan(callsBefore));
    const call = document.execCommand.mock.calls.at(-1);
    expect(call).toEqual(['insertHTML', false, expect.stringContaining('<h1>Heading</h1>')]);
  });

  it('is a no-op for a dropped file that is neither an image nor a .md file (regression)', () => {
    const { cb } = makeClipboard();
    const textFile = new File(['plain text'], 'notes.txt', { type: 'text/plain' });
    const event = {
      dataTransfer: { files: [textFile] },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 100,
      clientY: 100,
    };
    cb._onDrop(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not handle a dropped .md file when markdownPaste is false', () => {
    const { cb } = makeClipboard({ markdownPaste: false });
    const mdFile = new File(['# Heading'], 'notes.md', { type: 'text/markdown' });
    const event = {
      dataTransfer: { files: [mdFile] },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 100,
      clientY: 100,
    };
    cb._onDrop(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('fires a pasteError event for an oversized dropped .md file', () => {
    const { cb, ctx } = makeClipboard({ maxPasteSize: 0.000001 });
    const mdFile = new File(['#'.repeat(1000)], 'notes.md', { type: 'text/markdown' });
    const event = {
      dataTransfer: { files: [mdFile] },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 100,
      clientY: 100,
    };
    cb._onDrop(event);
    expect(ctx.triggerEvent).toHaveBeenCalledWith('pasteError', expect.objectContaining({ size: mdFile.size }));
  });

  it('fires pasteError without inserting content when a dropped .md file cannot be read', () => {
    class FailingFileReader {
      readAsText() {
        this.onerror?.(new ProgressEvent('error'));
      }
    }
    vi.stubGlobal('FileReader', FailingFileReader);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { cb, ctx } = makeClipboard();
    const mdFile = new File(['# Heading'], 'broken.md', { type: 'text/markdown' });
    const callsBefore = document.execCommand.mock.calls.length;

    cb._insertMarkdownFile(mdFile);

    expect(warn).toHaveBeenCalledWith(
      '[AutumnNote] Failed to read dropped markdown file "broken.md".',
    );
    expect(ctx.triggerEvent).toHaveBeenCalledOnce();
    expect(ctx.triggerEvent).toHaveBeenCalledWith('pasteError', {
      message: 'Failed to read dropped markdown file "broken.md".',
    });
    expect(ctx.invoke).not.toHaveBeenCalledWith('editor.afterCommand');
    expect(document.execCommand.mock.calls).toHaveLength(callsBefore);
  });
});

// ── _onPaste ──────────────────────────────────────────────────────────────────

describe('Clipboard._onPaste', () => {
  beforeEach(() => {
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
  });

  function makePasteEvent(types, dataMap = {}) {
    return {
      clipboardData: {
        items: [],
        types,
        getData: (t) => dataMap[t] || '',
        includes: (t) => types.includes(t),
      },
      preventDefault: vi.fn(),
    };
  }

  it('returns early when no clipboardData', () => {
    const { cb } = makeClipboard();
    const callsBefore = document.execCommand.mock.calls.length;
    expect(() => cb._onPaste({ clipboardData: null })).not.toThrow();
    expect(document.execCommand.mock.calls.length).toBe(callsBefore);
  });

  it('pastes as plain text when forcePlain is true', () => {
    const { cb } = makeClipboard();
    cb._forcePlain = true;
    const event = makePasteEvent(['text/plain'], { 'text/plain': 'Hello World' });
    cb._onPaste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, expect.stringContaining('Hello World'));
    expect(cb._forcePlain).toBe(false);
  });

  it('pastes as plain text when pasteAsPlainText option is true', () => {
    const { cb } = makeClipboard({ pasteAsPlainText: true });
    const event = makePasteEvent(['text/plain'], { 'text/plain': 'Plain only' });
    cb._onPaste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, expect.any(String));
  });

  it('converts multi-line plain text to paragraphs', () => {
    const { cb } = makeClipboard({ pasteAsPlainText: true });
    const event = makePasteEvent(['text/plain'], { 'text/plain': 'Line 1\nLine 2' });
    cb._onPaste(event);
    const call = document.execCommand.mock.calls.at(-1);
    expect(call[2]).toContain('<p>');
  });

  it('converts markdown to HTML when no text/html in clipboard', () => {
    const { cb } = makeClipboard();
    const event = makePasteEvent(['text/plain'], { 'text/plain': '# Heading\n\nParagraph' });
    cb._onPaste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, expect.stringContaining('h1'));
  });

  it('strips YAML frontmatter from a raw .md paste', () => {
    const { cb } = makeClipboard();
    const md = '---\ntitle: My Post\nauthor: Jane\n---\n\n# Heading';
    const event = makePasteEvent(['text/plain'], { 'text/plain': md });
    cb._onPaste(event);
    const call = document.execCommand.mock.calls.at(-1);
    expect(call[2]).toContain('h1');
    expect(call[2]).not.toContain('title');
    expect(call[2]).not.toContain('hr');
  });

  it('converts a bare GFM table with no other markdown markers', () => {
    const { cb } = makeClipboard();
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const event = makePasteEvent(['text/plain'], { 'text/plain': md });
    cb._onPaste(event);
    const call = document.execCommand.mock.calls.at(-1);
    expect(call[2]).toContain('table');
    expect(call[2]).toContain('th');
    expect(call[2]).toContain('td');
  });

  it('resolves reference links and footnotes in a raw .md paste', () => {
    const { cb } = makeClipboard();
    const md = '# Notes\n\nSee [ref link][1] and a footnote[^a].\n\n[1]: https://example.com\n[^a]: footnote body';
    const event = makePasteEvent(['text/plain'], { 'text/plain': md });
    cb._onPaste(event);
    const call = document.execCommand.mock.calls.at(-1);
    expect(call[2]).toContain('href="https://example.com"');
    expect(call[2]).toContain('sup');
    expect(call[2]).not.toContain('footnote body');
  });

  it('prefers markdown conversion when accompanying HTML has no semantic markup', () => {
    const { cb } = makeClipboard();
    const event = makePasteEvent(['text/html', 'text/plain'], {
      'text/html': '<div># Heading</div>',
      'text/plain': '# Heading',
    });
    cb._onPaste(event);
    const call = document.execCommand.mock.calls.at(-1);
    expect(call[2]).toContain('<h1>Heading</h1>');
  });

  it('still prefers the HTML branch when the HTML has real semantic markup (regression)', () => {
    const { cb } = makeClipboard();
    const event = makePasteEvent(['text/html', 'text/plain'], {
      'text/html': '<table><tr><td>cell</td></tr></table>',
      'text/plain': '# Heading',
    });
    cb._onPaste(event);
    const call = document.execCommand.mock.calls.at(-1);
    expect(call[2]).toContain('<table');
    expect(call[2]).not.toContain('<h1>');
  });

  it('fires a pasteError event and does not insert when paste content exceeds maxPasteSize', () => {
    const { cb, ctx } = makeClipboard({ maxPasteSize: 0.000001 });
    const event = makePasteEvent(['text/plain'], { 'text/plain': 'a'.repeat(1000) });
    const callsBefore = document.execCommand.mock.calls.length;
    cb._onPaste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(ctx.triggerEvent).toHaveBeenCalledWith('pasteError', expect.objectContaining({ size: 1000 }));
    expect(document.execCommand.mock.calls.length).toBe(callsBefore);
  });

  it('sanitises HTML when text/html is in clipboard (pasteCleanHTML default)', () => {
    const { cb } = makeClipboard();
    const event = makePasteEvent(['text/html', 'text/plain'], {
      'text/html': '<p>Hello <strong>world</strong></p>',
      'text/plain': 'Hello world',
    });
    cb._onPaste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, expect.stringContaining('Hello'));
  });

  it('calls _cleanWordHtml for Word content', () => {
    const { cb } = makeClipboard();
    const cleanSpy = vi.spyOn(cb, '_cleanWordHtml').mockReturnValue('<p>clean</p>');
    const event = makePasteEvent(['text/html', 'text/plain'], {
      'text/html': '<p class="MsoNormal">Word content</p>',
      'text/plain': 'Word content',
    });
    cb._onPaste(event);
    expect(cleanSpy).toHaveBeenCalled();
  });

  it('calls _cleanSocialHtml for social media content', () => {
    const { cb } = makeClipboard();
    const cleanSpy = vi.spyOn(cb, '_cleanSocialHtml').mockReturnValue('<p>clean</p>');
    const event = makePasteEvent(['text/html', 'text/plain'], {
      'text/html': '<span class="x1n2onr6">Social content</span>',
      'text/plain': 'Social content',
    });
    cb._onPaste(event);
    expect(cleanSpy).toHaveBeenCalled();
  });

  it('calls _stripAttributes when pasteStripAttributes is true', () => {
    const { cb } = makeClipboard({ pasteStripAttributes: true });
    const stripSpy = vi.spyOn(cb, '_stripAttributes').mockReturnValue('<p>stripped</p>');
    const event = makePasteEvent(['text/html', 'text/plain'], {
      'text/html': '<p class="foo">Content</p>',
      'text/plain': 'Content',
    });
    cb._onPaste(event);
    expect(stripSpy).toHaveBeenCalled();
  });

  it('calls onPaste hook when provided', () => {
    const onPaste = vi.fn();
    const { cb } = makeClipboard({ onPaste });
    const event = makePasteEvent(['text/plain'], { 'text/plain': 'text' });
    cb._onPaste(event);
    expect(onPaste).toHaveBeenCalledWith(expect.objectContaining({ text: 'text' }));
  });

  it('handles image item in clipboard', () => {
    const onImageUpload = vi.fn();
    const { cb } = makeClipboard({ onImageUpload });
    const imgFile = new File(['data'], 'photo.png', { type: 'image/png' });
    const event = {
      clipboardData: {
        items: [{ kind: 'file', type: 'image/png', getAsFile: () => imgFile }],
        types: ['Files'],
        getData: () => '',
      },
      preventDefault: vi.fn(),
    };
    cb._onPaste(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onImageUpload).toHaveBeenCalledWith([imgFile]);
  });
});

// ── _insertImageFiles — compress path ─────────────────────────────────────────

describe('Clipboard._insertImageFiles compress path', () => {
  it('inserts image via blob URL after successful compression', async () => {
    const { cb } = makeClipboard();
    const fakeDataUrl = 'data:image/png;base64,abc123';
    vi.spyOn(cb, '_compressImage').mockResolvedValue(fakeDataUrl);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    cb._insertImageFiles([file]);
    await Promise.resolve();
    expect(cb.context.invoke).toHaveBeenCalledWith('editor.insertImage', 'blob:fake-url', 'photo');
    URL.createObjectURL.mockRestore?.();
  });

  it('triggers imageError event when compression fails', async () => {
    const { cb } = makeClipboard();
    vi.spyOn(cb, '_compressImage').mockRejectedValue(new Error('canvas error'));
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    cb._insertImageFiles([file]);
    await Promise.resolve();
    await Promise.resolve();
    expect(cb.context.triggerEvent).toHaveBeenCalledWith(
      'imageError',
      expect.objectContaining({ file }),
    );
  });
});

// ── _placeCaretAtPoint ────────────────────────────────────────────────────────

describe('Clipboard._placeCaretAtPoint', () => {
  it('does not throw when caretRangeFromPoint is unavailable', () => {
    const { cb } = makeClipboard();
    const orig = document.caretRangeFromPoint;
    delete document.caretRangeFromPoint;
    expect(() => cb._placeCaretAtPoint(100, 100)).not.toThrow();
    if (orig) document.caretRangeFromPoint = orig;
  });

  it('sets selection when caretRangeFromPoint returns a range', () => {
    const { cb } = makeClipboard();
    const editable = cb.context.layoutInfo.editable;
    editable.innerHTML = '<p>text</p>';
    const fakeRange = document.createRange();
    fakeRange.setStart(editable.querySelector('p').firstChild, 0);
    const origFn = document.caretRangeFromPoint;
    document.caretRangeFromPoint = () => fakeRange;
    expect(() => cb._placeCaretAtPoint(50, 50)).not.toThrow();
    if (origFn) document.caretRangeFromPoint = origFn;
    else delete document.caretRangeFromPoint;
  });

  it('uses caretPositionFromPoint when caretRangeFromPoint is not available', () => {
    const { cb } = makeClipboard();
    const editable = cb.context.layoutInfo.editable;
    editable.innerHTML = '<p>text</p>';
    const textNode = editable.querySelector('p').firstChild;

    const origCRFP = document.caretRangeFromPoint;
    delete document.caretRangeFromPoint;
    document.caretPositionFromPoint = () => ({ offsetNode: textNode, offset: 0 });

    expect(() => cb._placeCaretAtPoint(50, 50)).not.toThrow();

    delete document.caretPositionFromPoint;
    if (origCRFP) document.caretRangeFromPoint = origCRFP;
  });
});
