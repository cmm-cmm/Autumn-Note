import { describe, it, expect, afterEach, vi } from 'vitest';
import { FindReplace } from '../../src/js/module/FindReplace.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

function makeContext(html = '<p>Hello world hello</p>') {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
    locale: en,
    invoke: vi.fn(),
  };
}

function makeDialog(html) {
  const ctx = makeContext(html);
  const fr = new FindReplace(ctx);
  fr.initialize();
  return { ctx, fr };
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('FindReplace lifecycle', () => {
  it('initialize appends dialog to body', () => {
    makeDialog();
    expect(document.querySelector('.an-fr-dialog')).not.toBeNull();
  });

  it('dialog is not visible before show() is called', () => {
    const { fr } = makeDialog();
    expect(fr._dialog.style.display).not.toBe('flex');
  });

  it('destroy removes dialog from DOM', () => {
    const { fr } = makeDialog();
    fr.destroy();
    expect(document.querySelector('.an-fr-dialog')).toBeNull();
    expect(fr._dialog).toBeNull();
  });
});

// ── show() / _open() / _close() ───────────────────────────────────────────────

describe('FindReplace show / close', () => {
  it('show() opens dialog in find mode', () => {
    const { fr } = makeDialog();
    fr.show('find');
    expect(fr._dialog.style.display).toBe('flex');
  });

  it('show() opens dialog in replace mode', () => {
    const { fr } = makeDialog();
    fr.show('replace');
    expect(fr._dialog.style.display).toBe('flex');
    const replaceRow = fr._dialog.querySelector('.an-fr-replace-row');
    expect(replaceRow.style.display).not.toBe('none');
  });

  it('_open() does not re-trap when already visible', () => {
    const { fr } = makeDialog();
    fr.show('find');
    expect(() => fr._open()).not.toThrow();
  });

  it('_close() hides dialog and calls editor.focus', () => {
    const { fr, ctx } = makeDialog();
    fr.show('find');
    fr._close();
    expect(fr._dialog.style.display).toBe('none');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.focus');
  });

  it('close button click closes dialog', () => {
    const { fr } = makeDialog();
    fr.show('find');
    const closeBtn = fr._dialog.querySelector('.an-icon-close');
    closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fr._dialog.style.display).toBe('none');
  });

  it('clicking backdrop closes dialog', () => {
    const { fr } = makeDialog();
    fr.show('find');
    const e = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(e, 'target', { value: fr._dialog, configurable: true });
    fr._dialog.dispatchEvent(e);
    expect(fr._dialog.style.display).toBe('none');
  });
});

// ── _updateMode ────────────────────────────────────────────────────────────────

describe('FindReplace._updateMode', () => {
  it('hides replace row in find mode', () => {
    const { fr } = makeDialog();
    fr._mode = 'find';
    fr._updateMode();
    const replaceRow = fr._dialog.querySelector('.an-fr-replace-row');
    expect(replaceRow.style.display).toBe('none');
  });

  it('shows replace row in replace mode', () => {
    const { fr } = makeDialog();
    fr._mode = 'replace';
    fr._updateMode();
    const replaceRow = fr._dialog.querySelector('.an-fr-replace-row');
    expect(replaceRow.style.display).not.toBe('none');
  });
});

// ── Search ────────────────────────────────────────────────────────────────────

describe('FindReplace search', () => {
  it('finds and highlights matches (case-insensitive by default)', () => {
    const { fr, ctx } = makeDialog('<p>Hello world hello</p>');
    fr._findInput.value = 'hello';
    fr._onSearch();
    const marks = ctx.layoutInfo.editable.querySelectorAll('mark.an-highlight');
    expect(marks.length).toBe(2);
    expect(fr._counterEl.textContent).toBe('1 / 2');
  });

  it('shows noResults when query has no matches', () => {
    const { fr, ctx } = makeDialog('<p>Hello world</p>');
    fr._findInput.value = 'xyz_not_found';
    fr._onSearch();
    expect(fr._counterEl.textContent).toBe(ctx.locale.findReplace.noResults);
  });

  it('clears counter when query is empty', () => {
    const { fr } = makeDialog();
    fr._findInput.value = '';
    fr._onSearch();
    expect(fr._counterEl.textContent).toBe('');
  });

  it('case-sensitive search respects case', () => {
    const { fr, ctx } = makeDialog('<p>Hello HELLO hello</p>');
    fr._caseSensitive = true;
    fr._findInput.value = 'hello';
    fr._onSearch();
    const marks = ctx.layoutInfo.editable.querySelectorAll('mark.an-highlight');
    expect(marks.length).toBe(1);
  });

  it('case checkbox change triggers re-search', () => {
    const { fr, ctx } = makeDialog('<p>Hello hello</p>');
    fr._findInput.value = 'Hello';
    fr._onSearch();
    fr._caseCheckbox.checked = true;
    fr._caseCheckbox.dispatchEvent(new Event('change'));
    const marks = ctx.layoutInfo.editable.querySelectorAll('mark.an-highlight');
    expect(marks.length).toBe(1);
  });

  it('reuses cached regex when query and case unchanged', () => {
    const { fr } = makeDialog('<p>hello hello hello</p>');
    fr._findInput.value = 'hello';
    fr._onSearch();
    const regex1 = fr._queryRegex;
    fr._onSearch();
    expect(fr._queryRegex).toBe(regex1);
  });

  it('currentIndex starts at 0 after search', () => {
    const { fr } = makeDialog('<p>hello hello</p>');
    fr._findInput.value = 'hello';
    fr._onSearch();
    expect(fr._currentIndex).toBe(0);
  });

  it('input event on findInput triggers search', () => {
    const { fr, ctx } = makeDialog('<p>hello world</p>');
    fr._findInput.value = 'hello';
    fr._findInput.dispatchEvent(new Event('input'));
    expect(ctx.layoutInfo.editable.querySelectorAll('mark.an-highlight').length).toBe(1);
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe('FindReplace navigation', () => {
  it('_next() wraps to first match after last', () => {
    const { fr } = makeDialog('<p>Hello world hello</p>');
    fr._findInput.value = 'hello';
    fr._onSearch();
    fr._next();
    expect(fr._counterEl.textContent).toBe('2 / 2');
    fr._next();
    expect(fr._counterEl.textContent).toBe('1 / 2');
  });

  it('_prev() wraps to last match from first', () => {
    const { fr } = makeDialog('<p>Hello world hello</p>');
    fr._findInput.value = 'hello';
    fr._onSearch();
    fr._prev();
    expect(fr._counterEl.textContent).toBe('2 / 2');
  });

  it('_next() does nothing when no matches', () => {
    const { fr } = makeDialog('<p>no match here</p>');
    fr._findInput.value = 'zzz';
    fr._onSearch();
    expect(() => fr._next()).not.toThrow();
  });

  it('_prev() does nothing when no matches', () => {
    const { fr } = makeDialog('<p>no match here</p>');
    fr._findInput.value = 'zzz';
    fr._onSearch();
    expect(() => fr._prev()).not.toThrow();
  });

  it('Enter key navigates to next match', () => {
    const { fr } = makeDialog('<p>hello hello</p>');
    fr._findInput.value = 'hello';
    fr._onSearch();
    fr._findInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(fr._counterEl.textContent).toBe('2 / 2');
  });

  it('Shift+Enter navigates to previous match', () => {
    const { fr } = makeDialog('<p>hello hello</p>');
    fr._findInput.value = 'hello';
    fr._onSearch();
    fr._findInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true }));
    expect(fr._counterEl.textContent).toBe('2 / 2');
  });
});

// ── Replace ───────────────────────────────────────────────────────────────────

describe('FindReplace._replace', () => {
  it('replaces current match and re-runs search', () => {
    const { fr, ctx } = makeDialog('<p>apple banana apple</p>');
    fr.show('replace');
    fr._findInput.value = 'apple';
    fr._replaceInput.value = 'orange';
    fr._onSearch();
    fr._replace();
    expect(ctx.layoutInfo.editable.textContent).toContain('orange');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('replace button click triggers _replace', () => {
    const { fr } = makeDialog('<p>hello world</p>');
    fr.show('replace');
    fr._findInput.value = 'hello';
    fr._replaceInput.value = 'hi';
    fr._onSearch();
    vi.spyOn(fr, '_replace');
    const replaceBtn = fr._dialog.querySelector('.an-fr-replace-row .an-fr-replace-btn:not(.an-btn-primary)');
    replaceBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fr._replace).toHaveBeenCalled();
  });

  it('does nothing when no matches', () => {
    const { fr } = makeDialog('<p>hello</p>');
    fr._findInput.value = 'zzz';
    fr._onSearch();
    expect(() => fr._replace()).not.toThrow();
  });

  it('Enter key in replace input triggers replace', () => {
    const { fr, ctx } = makeDialog('<p>hello world</p>');
    fr.show('replace');
    fr._findInput.value = 'hello';
    fr._replaceInput.value = 'hi';
    fr._onSearch();
    fr._replaceInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });
});

describe('FindReplace._replaceAll', () => {
  it('replaces all matches and calls afterCommand', () => {
    const { fr, ctx } = makeDialog('<p>apple banana apple</p>');
    fr._findInput.value = 'apple';
    fr._replaceInput.value = 'orange';
    fr._onSearch();
    fr._replaceAll();
    expect(ctx.layoutInfo.editable.textContent).toContain('orange banana orange');
    expect(ctx.layoutInfo.editable.querySelectorAll('mark.an-highlight').length).toBe(0);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no matches', () => {
    const { fr } = makeDialog('<p>hello</p>');
    fr._findInput.value = 'zzz';
    fr._onSearch();
    expect(() => fr._replaceAll()).not.toThrow();
  });

  it('replaceAll button click triggers _replaceAll', () => {
    const { fr } = makeDialog('<p>hello world hello</p>');
    fr.show('replace');
    fr._findInput.value = 'hello';
    fr._replaceInput.value = 'hi';
    fr._onSearch();
    vi.spyOn(fr, '_replaceAll');
    const replaceAllBtn = fr._dialog.querySelector('.an-fr-replace-row .an-fr-replace-btn.an-btn-primary');
    replaceAllBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fr._replaceAll).toHaveBeenCalled();
  });
});

// ── _clearHighlights ──────────────────────────────────────────────────────────

describe('FindReplace._clearHighlights', () => {
  it('removes all mark elements and resets state', () => {
    const { fr, ctx } = makeDialog('<p>hello hello</p>');
    fr._findInput.value = 'hello';
    fr._onSearch();
    fr._clearHighlights();
    expect(ctx.layoutInfo.editable.querySelectorAll('mark.an-highlight').length).toBe(0);
    expect(fr._matches.length).toBe(0);
    expect(fr._currentIndex).toBe(-1);
  });
});
