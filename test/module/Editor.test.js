import { describe, it, expect, vi, afterEach } from 'vitest';
import { Editor } from '../../src/js/module/Editor.js';

// execCommand is not implemented in jsdom
if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
}

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.clearAllMocks();
});

function makeContext(html = '<p>x</p>') {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    invoke: vi.fn((path, raw) => (path === 'clipboard.resolveImages' ? raw : undefined)),
    triggerEvent: vi.fn(),
  };
}

describe('Editor content helpers', () => {
  it('getHTML strips zero-width spaces before returning', () => {
    const context = makeContext('<p>a\u200Bb</p>');
    const editor = new Editor(context);
    const out = editor.getHTML();
    expect(out).toBe('<p>ab</p>');
    expect(context.invoke).toHaveBeenCalledWith('clipboard.resolveImages', '<p>ab</p>');
  });

  it('isEmpty treats media as non-empty content', () => {
    const context = makeContext('<p>\u00a0</p>');
    const editor = new Editor(context);
    expect(editor.isEmpty()).toBe(true);

    context.layoutInfo.editable.innerHTML = '<p></p><img src="x">';
    expect(editor.isEmpty()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// C4: _cleanOrphanedFigures — removes figure.an-figure elements without <img>
// ---------------------------------------------------------------------------

describe('Editor._cleanOrphanedFigures', () => {
  it('removes a figure.an-figure that contains only a figcaption (no img)', () => {
    const context = makeContext(
      '<p>Text before</p>' +
      '<figure class="an-figure"><figcaption class="an-figcaption">Caption</figcaption></figure>' +
      '<p>Text after</p>',
    );
    const editor = new Editor(context);

    editor._cleanOrphanedFigures();

    expect(context.layoutInfo.editable.querySelector('figure.an-figure')).toBeNull();
    // Surrounding paragraphs must be preserved
    const paras = context.layoutInfo.editable.querySelectorAll('p');
    expect(paras.length).toBe(2);
  });

  it('preserves a figure.an-figure that still contains an <img>', () => {
    const context = makeContext(
      '<figure class="an-figure">' +
        '<img src="photo.jpg" alt="photo">' +
        '<figcaption class="an-figcaption">A caption</figcaption>' +
      '</figure>',
    );
    const editor = new Editor(context);

    editor._cleanOrphanedFigures();

    expect(context.layoutInfo.editable.querySelector('figure.an-figure')).not.toBeNull();
    expect(context.layoutInfo.editable.querySelector('img')).not.toBeNull();
  });

  it('removes multiple orphaned figures in a single call', () => {
    const context = makeContext(
      '<figure class="an-figure"><figcaption>Cap 1</figcaption></figure>' +
      '<p>Middle</p>' +
      '<figure class="an-figure"><figcaption>Cap 2</figcaption></figure>',
    );
    const editor = new Editor(context);

    editor._cleanOrphanedFigures();

    expect(context.layoutInfo.editable.querySelectorAll('figure.an-figure').length).toBe(0);
  });

  it('is called by afterCommand so orphans are cleaned on every edit', () => {
    const context = makeContext(
      '<figure class="an-figure"><figcaption>Ghost</figcaption></figure>',
    );
    const editor = new Editor(context);

    editor.afterCommand();

    expect(context.layoutInfo.editable.querySelector('figure.an-figure')).toBeNull();
  });
});

// ── Content API ───────────────────────────────────────────────────────────────

describe('Editor content API', () => {
  it('setHTML sanitises and sets editable innerHTML', () => {
    const context = makeContext('<p>old</p>');
    const editor = new Editor(context);
    editor.setHTML('<p>new content</p>');
    expect(context.layoutInfo.editable.innerHTML).toContain('new content');
  });

  it('setHTML strips script tags (sanitiser)', () => {
    const context = makeContext('<p>safe</p>');
    const editor = new Editor(context);
    editor.setHTML('<p>ok</p><script>evil()</script>');
    expect(context.layoutInfo.editable.innerHTML).not.toContain('<script>');
    expect(context.layoutInfo.editable.innerHTML).toContain('ok');
  });

  it('setText sets plain text content', () => {
    const context = makeContext('<p>old</p>');
    const editor = new Editor(context);
    editor.setText('plain text');
    expect(context.layoutInfo.editable.textContent).toBe('plain text');
  });

  it('clear empties the editor', () => {
    const context = makeContext('<p>hello</p>');
    const editor = new Editor(context);
    editor.clear();
    expect(context.layoutInfo.editable.textContent.trim()).toBe('');
  });

  it('isEmpty returns true for whitespace-only content', () => {
    const context = makeContext('<p>   </p>');
    const editor = new Editor(context);
    expect(editor.isEmpty()).toBe(true);
  });

  // Note: innerText getter is not implemented in jsdom (no layout engine),
  // so isEmpty() text detection only works in real browsers. We test media instead.
  it('isEmpty returns false when content has an image', () => {
    const context = makeContext('<p><img src="x.png"></p>');
    const editor = new Editor(context);
    expect(editor.isEmpty()).toBe(false);
  });

  it('isEmpty returns false when content has a table', () => {
    const context = makeContext('<table><tr><td></td></tr></table>');
    const editor = new Editor(context);
    expect(editor.isEmpty()).toBe(false);
  });

  it('getMarkdown converts HTML to Markdown', () => {
    const context = makeContext('<h1>Title</h1><p>Body</p>');
    const editor = new Editor(context);
    const md = editor.getMarkdown();
    expect(md).toContain('# Title');
    expect(md).toContain('Body');
  });

  it('setMarkdown converts Markdown to HTML and sets editor', () => {
    const context = makeContext('<p>old</p>');
    const editor = new Editor(context);
    editor.setMarkdown('# Hello\n\nParagraph');
    expect(context.layoutInfo.editable.innerHTML).toMatch(/<h1>Hello<\/h1>/i);
  });
});

// ── History API ───────────────────────────────────────────────────────────────

describe('Editor history API', () => {
  it('canUndo returns false when no history module', () => {
    const context = makeContext();
    const editor = new Editor(context);
    expect(editor.canUndo()).toBe(false);
  });

  it('canRedo returns false when no history module', () => {
    const context = makeContext();
    const editor = new Editor(context);
    expect(editor.canRedo()).toBe(false);
  });

  it('undo does nothing gracefully when no history', () => {
    const context = makeContext();
    const editor = new Editor(context);
    expect(() => editor.undo()).not.toThrow();
  });

  it('redo does nothing gracefully when no history', () => {
    const context = makeContext();
    const editor = new Editor(context);
    expect(() => editor.redo()).not.toThrow();
  });

  it('clearHistory does not throw without history', () => {
    const context = makeContext();
    const editor = new Editor(context);
    expect(() => editor.clearHistory()).not.toThrow();
  });
});

// ── Focus ─────────────────────────────────────────────────────────────────────

describe('Editor focus', () => {
  it('focus() calls editable.focus()', () => {
    const context = makeContext('<p>text</p>');
    const editor = new Editor(context);
    const focusSpy = vi.spyOn(context.layoutInfo.editable, 'focus');
    editor.focus();
    expect(focusSpy).toHaveBeenCalled();
  });
});

// ── State API ────────────────────────────────────────────────────────────────

describe('Editor state API', () => {
  it('afterCommand triggers toolbar.refresh and statusbar.update', () => {
    const context = makeContext('<p>x</p>');
    const editor = new Editor(context);
    editor.afterCommand();
    expect(context.invoke).toHaveBeenCalledWith('toolbar.refresh');
    expect(context.invoke).toHaveBeenCalledWith('statusbar.update');
  });

  it('afterCommand triggers change event (debounced 400ms)', () => {
    vi.useFakeTimers();
    const context = makeContext('<p>hello</p>');
    const editor = new Editor(context);
    editor.afterCommand();
    vi.advanceTimersByTime(400);
    expect(context.triggerEvent).toHaveBeenCalledWith('change', expect.any(String));
    vi.useRealTimers();
  });
});

// ── Inline helpers ────────────────────────────────────────────────────────────

describe('Editor _escapeAttr', () => {
  it('escapes &, <, >, " in attribute values', () => {
    const context = makeContext();
    const editor = new Editor(context);
    expect(editor._escapeAttr('a & b')).toBe('a &amp; b');
    expect(editor._escapeAttr('<tag>')).toBe('&lt;tag&gt;');
    expect(editor._escapeAttr('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('handles null/undefined gracefully', () => {
    const context = makeContext();
    const editor = new Editor(context);
    expect(editor._escapeAttr(null)).toBe('');
    expect(editor._escapeAttr(undefined)).toBe('');
  });
});

// ── Insert API ────────────────────────────────────────────────────────────────

describe('Editor insert API', () => {
  it('insertHr triggers toolbar.refresh via afterCommand', () => {
    vi.useFakeTimers();
    const context = makeContext('<p>text</p>');
    const editor = new Editor(context);
    editor.insertHr();
    expect(context.invoke).toHaveBeenCalledWith('toolbar.refresh');
    vi.useRealTimers();
  });

  it('insertVideo inserts HTML via execCommand', () => {
    vi.useFakeTimers();
    const context = makeContext('<p>text</p>');
    const editor = new Editor(context);
    const html = '<div class="an-video-wrapper"><iframe src="https://www.youtube.com/embed/test"></iframe></div>';
    editor.insertVideo(html);
    expect(document.execCommand).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('insertVideo skips empty html', () => {
    const context = makeContext('<p>text</p>');
    const editor = new Editor(context);
    const callsBefore = document.execCommand.mock?.calls?.length ?? 0;
    editor.insertVideo('');
    expect(document.execCommand.mock?.calls?.length ?? 0).toBe(callsBefore);
  });

  it('insertTable calls afterCommand (invoke toolbar.refresh)', () => {
    vi.useFakeTimers();
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const context = makeContext('<p>text</p>');
    context.options = { ...context.options, tableHeaderRow: false };
    const editor = new Editor(context);
    editor.insertTable(3, 2);
    expect(context.invoke).toHaveBeenCalledWith('toolbar.refresh');
    vi.useRealTimers();
  });

  it('unlink triggers toolbar.refresh via afterCommand', () => {
    vi.useFakeTimers();
    const context = makeContext('<p><a href="https://example.com">link</a></p>');
    const editor = new Editor(context);
    editor.unlink();
    expect(context.invoke).toHaveBeenCalledWith('toolbar.refresh');
    vi.useRealTimers();
  });

  it('insertLink skips when URL is empty', () => {
    const context = makeContext('<p>hello</p>');
    const editor = new Editor(context);
    const callsBefore = document.execCommand.mock?.calls?.length ?? 0;
    editor.insertLink('', 'text');
    expect(document.execCommand.mock?.calls?.length ?? 0).toBe(callsBefore);
  });

  it('insertImage skips when src is empty', () => {
    const context = makeContext('<p>hello</p>');
    const editor = new Editor(context);
    const callsBefore = document.execCommand.mock?.calls?.length ?? 0;
    editor.insertImage('');
    expect(document.execCommand.mock?.calls?.length ?? 0).toBe(callsBefore);
  });
});

// ── _getClosestAnchor ─────────────────────────────────────────────────────────

describe('Editor._getClosestAnchor', () => {
  it('returns null when no selection', () => {
    const context = makeContext();
    const editor = new Editor(context);
    expect(editor._getClosestAnchor()).toBeNull();
  });

  it('returns anchor element when cursor is inside a link', () => {
    const context = makeContext('<p><a href="https://example.com">link text</a></p>');
    const editor = new Editor(context);
    const a = context.layoutInfo.editable.querySelector('a');
    const tn = a.firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    expect(editor._getClosestAnchor()).toBe(a);
  });

  it('returns null when cursor is not inside a link', () => {
    const context = makeContext('<p>hello</p>');
    const editor = new Editor(context);
    const tn = context.layoutInfo.editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    expect(editor._getClosestAnchor()).toBeNull();
  });
});
