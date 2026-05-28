import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmojiDialog } from '../../src/js/module/EmojiDialog.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.restoreAllMocks();
});

const makeContext = () => {
  const container = document.createElement('div');
  const editable  = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p>hello</p>';
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    locale: en,
    options: {},
    layoutInfo: { container, editable },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
};

const makeDialog = () => {
  const ctx = makeContext();
  const ed = new EmojiDialog(ctx);
  ed.initialize();
  return { ctx, ed };
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('EmojiDialog lifecycle', () => {
  it('initialize returns the instance', () => {
    const { ed } = makeDialog();
    expect(ed).toBeInstanceOf(EmojiDialog);
  });

  it('dialog is not built until show() is called', () => {
    makeDialog();
    expect(document.querySelector('.an-dialog-overlay')).toBeNull();
  });

  it('show() builds and appends dialog to body', () => {
    const { ed } = makeDialog();
    ed.show();
    expect(document.querySelector('.an-dialog-overlay')).not.toBeNull();
    expect(document.querySelector('.an-emoji-grid')).not.toBeNull();
  });

  it('second show() reuses existing dialog', () => {
    const { ed } = makeDialog();
    ed.show();
    ed.show();
    expect(document.querySelectorAll('.an-dialog-overlay').length).toBe(1);
  });

  it('destroy removes dialog from DOM', () => {
    const { ed } = makeDialog();
    ed.show();
    ed.destroy();
    expect(document.querySelector('.an-dialog-overlay')).toBeNull();
    expect(ed._dialog).toBeNull();
  });
});

// ── _buildDialog ──────────────────────────────────────────────────────────────

describe('EmojiDialog._buildDialog', () => {
  it('creates emoji cells for each emoji', () => {
    const { ed } = makeDialog();
    ed.show();
    expect(document.querySelectorAll('.an-emoji-cell').length).toBeGreaterThan(0);
  });

  it('creates category tabs', () => {
    const { ed } = makeDialog();
    ed.show();
    expect(document.querySelectorAll('[data-cat]').length).toBeGreaterThan(1);
  });

  it('creates search input', () => {
    const { ed } = makeDialog();
    ed.show();
    expect(document.querySelector('.an-icon-search')).not.toBeNull();
  });

  it('close button click closes dialog', () => {
    const { ed } = makeDialog();
    ed.show();
    const closeBtn = document.querySelector('.an-icon-close');
    closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ed._dialog.style.display).toBe('none');
  });

  it('clicking overlay backdrop closes dialog', () => {
    const { ed } = makeDialog();
    ed.show();
    const overlay = document.querySelector('.an-dialog-overlay');
    const e = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(e, 'target', { value: overlay, configurable: true });
    overlay.dispatchEvent(e);
    expect(ed._dialog.style.display).toBe('none');
  });

  it('category tab click filters emojis', () => {
    const { ed } = makeDialog();
    ed.show();
    const catBar = document.querySelector('.an-icon-cats');
    const tab = catBar.querySelectorAll('[data-cat]')[1]; // first non-"all" tab
    tab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ed._activeCat).toBe(tab.dataset.cat);
  });

  it('grid click on emoji cell calls _onEmojiClick', () => {
    const { ed } = makeDialog();
    vi.spyOn(ed, '_onEmojiClick');
    ed.show();
    const cell = document.querySelector('.an-emoji-cell');
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ed._onEmojiClick).toHaveBeenCalledWith(cell.dataset.char);
  });
});

// ── _filterEmojis ─────────────────────────────────────────────────────────────

describe('EmojiDialog._filterEmojis', () => {
  it('hides cells that do not match query', () => {
    const { ed } = makeDialog();
    ed.show();
    ed._filterEmojis('grin', 'all');
    const cells = document.querySelectorAll('.an-emoji-cell');
    const visible = Array.from(cells).filter((c) => c.style.display !== 'none');
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.length).toBeLessThan(cells.length);
  });

  it('shows empty state when no results', () => {
    const { ed } = makeDialog();
    ed.show();
    ed._filterEmojis('zzz_no_match_xyz', 'all');
    const empty = document.querySelector('.an-icon-empty');
    expect(empty).not.toBeNull();
    expect(empty.style.display).toBe('');
  });

  it('filters by category', () => {
    const { ed } = makeDialog();
    ed.show();
    ed._filterEmojis('', 'food');
    const cells = document.querySelectorAll('.an-emoji-cell');
    const visible = Array.from(cells).filter((c) => c.style.display !== 'none');
    const allFood = visible.every((c) => c.dataset.cat === 'food');
    expect(allFood).toBe(true);
  });

  it('shows all emojis when query is empty and cat is all', () => {
    const { ed } = makeDialog();
    ed.show();
    ed._filterEmojis('', 'all');
    const cells = document.querySelectorAll('.an-emoji-cell');
    const hidden = Array.from(cells).filter((c) => c.style.display === 'none');
    expect(hidden.length).toBe(0);
  });
});

// ── _onEmojiClick ─────────────────────────────────────────────────────────────

describe('EmojiDialog._onEmojiClick', () => {
  it('inserts emoji into editable and calls afterCommand', () => {
    const { ed, ctx } = makeDialog();
    ed.show();
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.collapse(true);
    window.getSelection().addRange(range);
    ed._savedRange = null;
    ed._onEmojiClick('😀');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('calls savedRange.select() when savedRange is set', () => {
    const { ed, ctx } = makeDialog();
    ed.show();
    const selectFn = vi.fn();
    ed._savedRange = { select: selectFn };
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.collapse(true);
    window.getSelection().addRange(range);
    ed._onEmojiClick('❤️');
    expect(selectFn).toHaveBeenCalled();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('creates a new range when no selection exists', () => {
    const { ed, ctx } = makeDialog();
    ed.show();
    ed._savedRange = null;
    window.getSelection().removeAllRanges();
    expect(() => ed._onEmojiClick('🌍')).not.toThrow();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('closes dialog after emoji click', () => {
    const { ed } = makeDialog();
    ed.show();
    ed._savedRange = null;
    ed._onEmojiClick('⭐');
    expect(ed._dialog.style.display).toBe('none');
  });
});

// ── _open / _close ────────────────────────────────────────────────────────────

describe('EmojiDialog._open / _close', () => {
  it('_open shows the dialog', () => {
    const { ed } = makeDialog();
    ed.show();
    ed._dialog.style.display = 'none';
    ed._open();
    expect(ed._dialog.style.display).toBe('flex');
  });

  it('_close hides dialog and clears savedRange', () => {
    const { ed } = makeDialog();
    ed.show();
    ed._savedRange = { select: vi.fn() };
    ed._close();
    expect(ed._dialog.style.display).toBe('none');
    expect(ed._savedRange).toBeNull();
  });

  it('_close cleans up trapFocus when _removeTrap is set', () => {
    const { ed } = makeDialog();
    ed.show();
    const removeTrapFn = vi.fn();
    ed._removeTrap = removeTrapFn;
    ed._close();
    expect(removeTrapFn).toHaveBeenCalled();
    expect(ed._removeTrap).toBeNull();
  });
});
