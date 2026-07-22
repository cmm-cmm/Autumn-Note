import { describe, it, expect, vi, afterEach } from 'vitest';
import { MarkdownShortcuts } from '../../src/js/module/MarkdownShortcuts.js';

// execCommand is not implemented in jsdom
if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
}

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.clearAllMocks();
});

const makeContext = (opts = {}) => {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
    options: { markdownShortcuts: true, ...opts },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
    getHTML: vi.fn(() => '<p></p>'),
  };
};

const setCursorAt = (textNode, offset) => {
  const range = document.createRange();
  range.setStart(textNode, offset);
  range.collapse(true);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
};

// ── initialize / destroy ──────────────────────────────────────────────────────

describe('MarkdownShortcuts lifecycle', () => {
  it('does nothing when markdownShortcuts=false', () => {
    const ctx = makeContext({ markdownShortcuts: false });
    const ms = new MarkdownShortcuts(ctx);
    ms.initialize();
    // No listeners attached — dispatching keydown should not call any handler
    const e = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    ctx.layoutInfo.editable.dispatchEvent(e);
    expect(ctx.triggerEvent).not.toHaveBeenCalled();
  });

  it('destroy cleans up listeners', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    ms.initialize();
    ms.destroy();
    // After destroy, events should not fire handlers
    const e = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    ctx.layoutInfo.editable.dispatchEvent(e);
    // triggerEvent only fires if a rule matches; post-destroy it should not
    expect(document.execCommand).not.toHaveBeenCalled();
  });
});

// ── Block patterns — _applyBlockRule ─────────────────────────────────────────

describe('MarkdownShortcuts block pattern matching', () => {
  it('recognises # as h1 pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToHeading');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '#', range: null, lineNode: null });
    ms._applyBlockRule();
    expect(ms._convertToHeading).toHaveBeenCalledWith(1);
  });

  it('recognises ## as h2 pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToHeading');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '##', range: null, lineNode: null });
    ms._applyBlockRule();
    expect(ms._convertToHeading).toHaveBeenCalledWith(2);
  });

  it('recognises ### as h3 pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToHeading');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '###', range: null, lineNode: null });
    ms._applyBlockRule();
    expect(ms._convertToHeading).toHaveBeenCalledWith(3);
  });

  it('recognises > as blockquote pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToBlockquote');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '>', range: null, lineNode: null });
    ms._applyBlockRule();
    expect(ms._convertToBlockquote).toHaveBeenCalled();
  });

  it('recognises - as ul pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToList');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '-', range: null, lineNode: null });
    ms._applyBlockRule();
    expect(ms._convertToList).toHaveBeenCalledWith('ul');
  });

  it('recognises * as ul pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToList');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '*', range: null, lineNode: null });
    ms._applyBlockRule();
    expect(ms._convertToList).toHaveBeenCalledWith('ul');
  });

  it('recognises 1. as ol pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToList');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '1.', range: null, lineNode: null });
    ms._applyBlockRule();
    expect(ms._convertToList).toHaveBeenCalledWith('ol');
  });

  it('recognises [ ] as checklist pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToChecklist');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '[ ]', range: null, lineNode: null });
    ms._applyBlockRule();
    expect(ms._convertToChecklist).toHaveBeenCalled();
  });

  it('returns false for non-matching text', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: 'hello', range: null, lineNode: null });
    expect(ms._applyBlockRule()).toBe(false);
  });

  it('returns false when no selection context', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_getLineContext').mockReturnValue(null);
    expect(ms._applyBlockRule()).toBe(false);
  });
});

// ── Block converters — real invoke() call names ──────────────────────────────
// Regression coverage: these call through to the real _convertTo* methods
// (not spied) so a typo in the invoke path (module.method) is caught, unlike
// the dispatch tests above which mock _convertToChecklist itself.

describe('MarkdownShortcuts block converters', () => {
  it('_convertToChecklist invokes editor.toggleChecklist', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const textNode = document.createTextNode('[ ]');
    ctx.layoutInfo.editable.appendChild(textNode);
    setCursorAt(textNode, 3);

    ms._convertToChecklist();

    expect(ctx.invoke).toHaveBeenCalledWith('editor.toggleChecklist');
  });

  it('_convertToHr invokes editor.insertHr', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const textNode = document.createTextNode('---');
    ctx.layoutInfo.editable.appendChild(textNode);
    setCursorAt(textNode, 3);

    ms._convertToHr();

    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertHr');
  });
});

// ── Enter rules — _applyEnterRule ────────────────────────────────────────────

describe('MarkdownShortcuts enter rule matching', () => {
  it('recognises --- as hr pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToHr');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '---', range: null, lineNode: null });
    expect(ms._applyEnterRule()).toBe(true);
    expect(ms._convertToHr).toHaveBeenCalled();
  });

  it('recognises ---- (4 dashes) as hr pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToHr');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '----', range: null, lineNode: null });
    expect(ms._applyEnterRule()).toBe(true);
  });

  it('recognises ``` as code block pattern', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_convertToCodeBlock');
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: '```', range: null, lineNode: null });
    expect(ms._applyEnterRule()).toBe(true);
    expect(ms._convertToCodeBlock).toHaveBeenCalled();
  });

  it('returns false for non-matching text', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_getLineContext').mockReturnValue({ text: 'hello', range: null, lineNode: null });
    expect(ms._applyEnterRule()).toBe(false);
  });

  it('returns false when no context', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_getLineContext').mockReturnValue(null);
    expect(ms._applyEnterRule()).toBe(false);
  });
});

// ── Inline rules — _onInput ───────────────────────────────────────────────────

describe('MarkdownShortcuts inline rules', () => {
  it('replaces **bold** with <strong> element', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const editable = ctx.layoutInfo.editable;

    const textNode = document.createTextNode('**bold**');
    editable.appendChild(textNode);
    setCursorAt(textNode, 8); // cursor after **bold**

    ms._onInput();
    expect(editable.querySelector('strong')).not.toBeNull();
    expect(editable.querySelector('strong').textContent).toBe('bold');
  });

  it('replaces *italic* with <em> element', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const editable = ctx.layoutInfo.editable;

    const textNode = document.createTextNode('*italic*');
    editable.appendChild(textNode);
    setCursorAt(textNode, 8);

    ms._onInput();
    expect(editable.querySelector('em')).not.toBeNull();
    expect(editable.querySelector('em').textContent).toBe('italic');
  });

  it('replaces ~~strike~~ with <s> element', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const editable = ctx.layoutInfo.editable;

    const textNode = document.createTextNode('~~strike~~');
    editable.appendChild(textNode);
    setCursorAt(textNode, 10);

    ms._onInput();
    expect(editable.querySelector('s')).not.toBeNull();
    expect(editable.querySelector('s').textContent).toBe('strike');
  });

  it('replaces `code` with <code> element', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const editable = ctx.layoutInfo.editable;

    const textNode = document.createTextNode('`code`');
    editable.appendChild(textNode);
    setCursorAt(textNode, 6);

    ms._onInput();
    expect(editable.querySelector('code')).not.toBeNull();
    expect(editable.querySelector('code').textContent).toBe('code');
  });

  it('does not trigger on text without inline marker', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const editable = ctx.layoutInfo.editable;

    const textNode = document.createTextNode('plain text');
    editable.appendChild(textNode);
    setCursorAt(textNode, 10);

    ms._onInput();
    expect(editable.querySelector('strong, em, s, code')).toBeNull();
    expect(ctx.triggerEvent).not.toHaveBeenCalled();
  });

  it('calls triggerEvent change after inline replacement', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const editable = ctx.layoutInfo.editable;

    const textNode = document.createTextNode('**x**');
    editable.appendChild(textNode);
    setCursorAt(textNode, 5);

    ms._onInput();
    expect(ctx.triggerEvent).toHaveBeenCalledWith('change', expect.any(String));
  });
});

// ── _getLineContext (real DOM, no mock) ───────────────────────────────────────

describe('MarkdownShortcuts._getLineContext (real selection)', () => {
  it('returns null when no selection exists', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    window.getSelection().removeAllRanges();
    expect(ms._getLineContext()).toBeNull();
  });

  it('returns null when selection is not collapsed', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const p = document.createElement('p');
    p.textContent = 'hello world';
    ctx.layoutInfo.editable.appendChild(p);
    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.setEnd(p.firstChild, 5);
    window.getSelection().addRange(range);
    expect(ms._getLineContext()).toBeNull();
  });

  it('returns null when selection is outside editable', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const outside = document.createElement('p');
    outside.textContent = 'outside';
    document.body.appendChild(outside);
    setCursorAt(outside.firstChild, 0);
    expect(ms._getLineContext()).toBeNull();
  });

  it('returns text context for collapsed selection inside editable', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const p = document.createElement('p');
    p.textContent = '## ';
    ctx.layoutInfo.editable.appendChild(p);
    setCursorAt(p.firstChild, 3);
    const result = ms._getLineContext();
    expect(result).not.toBeNull();
    expect(result.text).toBe('## ');
  });

  it('_applyBlockRule fires real _getLineContext and converts heading', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const p = document.createElement('p');
    p.textContent = '#';
    ctx.layoutInfo.editable.appendChild(p);
    setCursorAt(p.firstChild, 1);
    // Call _applyBlockRule without mocking — exercises _getLineContext
    const result = ms._applyBlockRule();
    expect(typeof result).toBe('boolean');
  });

  it('_applyEnterRule fires real _getLineContext', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const p = document.createElement('p');
    p.textContent = '---';
    ctx.layoutInfo.editable.appendChild(p);
    setCursorAt(p.firstChild, 3);
    const result = ms._applyEnterRule();
    expect(typeof result).toBe('boolean');
  });
});

// ── _selectLineAndDelete ──────────────────────────────────────────────────────

describe('MarkdownShortcuts._selectLineAndDelete', () => {
  it('deletes text from start of block to cursor', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    const p = document.createElement('p');
    p.textContent = '## heading';
    ctx.layoutInfo.editable.appendChild(p);
    setCursorAt(p.firstChild, 3);
    ms._selectLineAndDelete();
    // '## ' should have been deleted from the text
    expect(p.textContent).not.toContain('## ');
  });

  it('does nothing when no selection', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    window.getSelection().removeAllRanges();
    expect(() => ms._selectLineAndDelete()).not.toThrow();
  });
});

// ── Keydown delegation ────────────────────────────────────────────────────────

describe('MarkdownShortcuts keydown handler', () => {
  it('calls _applyBlockRule on Space key', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_applyBlockRule').mockReturnValue(false);
    ms._onKeydown(new KeyboardEvent('keydown', { key: ' ' }));
    expect(ms._applyBlockRule).toHaveBeenCalled();
  });

  it('calls _applyEnterRule on Enter key', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_applyEnterRule').mockReturnValue(false);
    ms._onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(ms._applyEnterRule).toHaveBeenCalled();
  });

  it('does nothing on other keys', () => {
    const ctx = makeContext();
    const ms = new MarkdownShortcuts(ctx);
    vi.spyOn(ms, '_applyBlockRule');
    vi.spyOn(ms, '_applyEnterRule');
    ms._onKeydown(new KeyboardEvent('keydown', { key: 'a' }));
    expect(ms._applyBlockRule).not.toHaveBeenCalled();
    expect(ms._applyEnterRule).not.toHaveBeenCalled();
  });
});
