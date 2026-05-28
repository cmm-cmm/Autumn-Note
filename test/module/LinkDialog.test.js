import { describe, it, expect, vi, afterEach } from 'vitest';
import { LinkDialog } from '../../src/js/module/LinkDialog.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.restoreAllMocks();
});

const makeContext = () => {
  const container = document.createElement('div');
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p>hello world</p>';
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    options: {},
    layoutInfo: { container, editable },
    locale: en,
    invoke: vi.fn(),
  };
};

const makeDialog = () => {
  const ctx = makeContext();
  const ld = new LinkDialog(ctx);
  ld.initialize();
  return { ctx, ld };
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('LinkDialog lifecycle', () => {
  it('initialize appends dialog to body', () => {
    makeDialog();
    expect(document.querySelector('.an-dialog-overlay')).not.toBeNull();
  });

  it('dialog is not visible before show() is called', () => {
    const { ld } = makeDialog();
    expect(ld._dialog.style.display).not.toBe('flex');
  });

  it('destroy removes dialog and clears disposers', () => {
    const { ld } = makeDialog();
    ld.destroy();
    expect(document.querySelector('.an-dialog-overlay')).toBeNull();
    expect(ld._dialog).toBeNull();
    expect(ld._disposers.length).toBe(0);
  });

  it('show() opens dialog (display: flex)', () => {
    const { ld } = makeDialog();
    ld.show();
    expect(ld._dialog.style.display).toBe('flex');
  });

  it('cancel button closes dialog', () => {
    const { ld } = makeDialog();
    ld.show();
    const cancelBtn = ld._dialog.querySelector('.an-btn:not(.an-btn-primary)');
    cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ld._dialog.style.display).toBe('none');
  });

  it('clicking backdrop closes dialog', () => {
    const { ld } = makeDialog();
    ld.show();
    const e = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(e, 'target', { value: ld._dialog, configurable: true });
    ld._dialog.dispatchEvent(e);
    expect(ld._dialog.style.display).toBe('none');
  });

  it('_close clears savedRange', () => {
    const { ld } = makeDialog();
    ld._savedRange = { select: vi.fn() };
    ld._removeTrap = vi.fn();
    ld._close();
    expect(ld._savedRange).toBeNull();
  });
});

// ── _prefill ──────────────────────────────────────────────────────────────────

describe('LinkDialog._prefill', () => {
  it('fills inputs from selected anchor when cursor is inside a link', () => {
    const { ld, ctx } = makeDialog();
    const a = document.createElement('a');
    a.href = 'https://example.com';
    a.textContent = 'Example';
    a.setAttribute('target', '_blank');
    ctx.layoutInfo.editable.appendChild(a);
    const range = document.createRange();
    range.selectNodeContents(a);
    window.getSelection().addRange(range);
    ld._prefill();
    expect(ld._urlInput.value).toBe('https://example.com');
    expect(ld._textInput.value).toBe('Example');
    expect(ld._tabCheckbox.checked).toBe(true);
  });

  it('fills text from selection when no anchor', () => {
    const { ld, ctx } = makeDialog();
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.setEnd(p.firstChild, 5);
    window.getSelection().addRange(range);
    ld._prefill();
    expect(ld._textInput.value).toBe('hello');
    expect(ld._urlInput.value).toBe('');
    expect(ld._tabCheckbox.checked).toBe(false);
  });

  it('clears all fields when no selection', () => {
    const { ld } = makeDialog();
    window.getSelection().removeAllRanges();
    ld._urlInput.value = 'old';
    ld._textInput.value = 'old';
    ld._tabCheckbox.checked = true;
    ld._prefill();
    expect(ld._urlInput.value).toBe('');
    expect(ld._tabCheckbox.checked).toBe(false);
  });
});

// ── _onInsert ─────────────────────────────────────────────────────────────────

describe('LinkDialog._onInsert', () => {
  it('auto-prefixes https:// when no protocol present', () => {
    const { ld, ctx } = makeDialog();
    ld._savedRange = { select: vi.fn() };
    ld._urlInput.value = 'example.com';
    ld._textInput.value = 'Example';
    ld._tabCheckbox.checked = false;
    ld._onInsert();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertLink', 'https://example.com', 'Example', false);
  });

  it('does nothing when URL is empty', () => {
    const { ld, ctx } = makeDialog();
    ld._urlInput.value = '';
    ld._onInsert();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('rejects javascript: protocol', () => {
    const { ld, ctx } = makeDialog();
    ld._urlInput.value = 'javascript:alert(1)';
    ld._onInsert();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('rejects vbscript: protocol', () => {
    const { ld, ctx } = makeDialog();
    ld._urlInput.value = 'vbscript:msgbox(1)';
    ld._onInsert();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('rejects data: protocol', () => {
    const { ld, ctx } = makeDialog();
    ld._urlInput.value = 'data:text/html,<script>alert(1)</script>';
    ld._onInsert();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('rejects completely invalid URL after prefixing', () => {
    const { ld, ctx } = makeDialog();
    ld._urlInput.value = ':::invalid:::';
    ld._onInsert();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('invokes insertLink with openInNewTab=true when checkbox checked', () => {
    const { ld, ctx } = makeDialog();
    ld._savedRange = { select: vi.fn() };
    ld._urlInput.value = 'https://example.com';
    ld._textInput.value = 'Link';
    ld._tabCheckbox.checked = true;
    ld._onInsert();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertLink', 'https://example.com', 'Link', true);
  });

  it('calls savedRange.select() before inserting', () => {
    const { ld } = makeDialog();
    const selectFn = vi.fn();
    ld._savedRange = { select: selectFn };
    ld._urlInput.value = 'https://example.com';
    ld._onInsert();
    expect(selectFn).toHaveBeenCalled();
  });

  it('closes dialog after successful insert', () => {
    const { ld } = makeDialog();
    ld.show();
    ld._savedRange = { select: vi.fn() };
    ld._urlInput.value = 'https://example.com';
    ld._onInsert();
    expect(ld._dialog.style.display).toBe('none');
  });

  it('Enter key in URL input triggers insert', () => {
    const { ld, ctx } = makeDialog();
    ld.show();
    ld._savedRange = { select: vi.fn() };
    ld._urlInput.value = 'https://example.com';
    ld._urlInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertLink', expect.any(String), expect.any(String), expect.any(Boolean));
  });

  it('Enter key in text input triggers insert', () => {
    const { ld, ctx } = makeDialog();
    ld.show();
    ld._savedRange = { select: vi.fn() };
    ld._urlInput.value = 'https://example.com';
    ld._textInput.value = 'link text';
    ld._textInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertLink', expect.any(String), 'link text', false);
  });

  it('preserves existing protocol in URL', () => {
    const { ld, ctx } = makeDialog();
    ld._savedRange = { select: vi.fn() };
    ld._urlInput.value = 'http://example.com';
    ld._onInsert();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertLink', 'http://example.com', '', false);
  });

  it('preserves mailto: protocol', () => {
    const { ld, ctx } = makeDialog();
    ld._savedRange = { select: vi.fn() };
    ld._urlInput.value = 'mailto:user@example.com';
    ld._onInsert();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertLink', 'mailto:user@example.com', '', false);
  });
});
