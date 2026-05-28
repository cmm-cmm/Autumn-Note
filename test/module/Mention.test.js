import { describe, it, expect, vi, afterEach } from 'vitest';
import { Mention } from '../../src/js/module/Mention.js';

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.clearAllMocks();
});

const USERS = [
  { id: 1, label: 'Alice' },
  { id: 2, label: 'Bob' },
  { id: 3, label: 'Carol' },
];

function makeContext(mentionCfg = {}) {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
    options: {
      mention: {
        trigger: '@',
        minChars: 0,
        debounce: 0,
        onSearch: vi.fn((q, cb) => cb(USERS)),
        ...mentionCfg,
      },
    },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
    getHTML: vi.fn(() => '<p></p>'),
  };
}

function setCursor(textNode, offset) {
  const r = document.createRange();
  r.setStart(textNode, offset);
  r.collapse(true);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(r);
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

describe('Mention lifecycle', () => {
  it('skips initialization when mention config is missing', () => {
    const ctx = makeContext();
    ctx.options.mention = undefined;
    const m = new Mention(ctx);
    m.initialize();
    expect(document.querySelector('.an-mention-dropdown')).toBeNull();
  });

  it('skips initialization when onSearch is not a function', () => {
    const m = new Mention(makeContext({ onSearch: null }));
    m.initialize();
    expect(document.querySelector('.an-mention-dropdown')).toBeNull();
  });

  it('creates dropdown element on initialize', () => {
    const m = new Mention(makeContext());
    m.initialize();
    expect(document.querySelector('.an-mention-dropdown')).not.toBeNull();
  });

  it('destroy removes dropdown from DOM', () => {
    const m = new Mention(makeContext());
    m.initialize();
    expect(document.querySelector('.an-mention-dropdown')).not.toBeNull();
    m.destroy();
    expect(document.querySelector('.an-mention-dropdown')).toBeNull();
  });

  it('destroy is safe when called without initialize', () => {
    const m = new Mention(makeContext());
    expect(() => m.destroy()).not.toThrow();
  });

  it('applies custom trigger, minChars, debounce from config', () => {
    const m = new Mention(makeContext({ trigger: '#', minChars: 2, debounce: 100 }));
    m.initialize();
    expect(m._cfg.trigger).toBe('#');
    expect(m._cfg.minChars).toBe(2);
    expect(m._cfg.debounce).toBe(100);
  });
});

// ── _renderItems ─────────────────────────────────────────────────────────────

describe('Mention._renderItems', () => {
  it('renders items as .an-mention-item elements', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    const items = m._dropdown.querySelectorAll('.an-mention-item');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toBe('Alice');
    expect(items[1].textContent).toBe('Bob');
  });

  it('sets data-index on each item', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    const items = m._dropdown.querySelectorAll('.an-mention-item');
    expect(items[0].dataset.index).toBe('0');
    expect(items[2].dataset.index).toBe('2');
  });

  it('highlights the first item by default', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    const items = m._dropdown.querySelectorAll('.an-mention-item');
    expect(items[0].classList.contains('an-mention-active')).toBe(true);
    expect(items[1].classList.contains('an-mention-active')).toBe(false);
  });

  it('respects maxResults limit', () => {
    const m = new Mention(makeContext({ maxResults: 2 }));
    m.initialize();
    m._renderItems(USERS); // 3 users but max is 2
    expect(m._dropdown.querySelectorAll('.an-mention-item').length).toBe(2);
  });

  it('renders avatar img when item has avatar', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems([{ id: 1, label: 'Avatar User', avatar: 'https://example.com/a.png' }]);
    expect(m._dropdown.querySelector('img.an-mention-avatar')).not.toBeNull();
  });

  it('sets _activeIndex to -1 when no items', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems([]);
    expect(m._activeIndex).toBe(-1);
  });
});

// ── _highlightItem ────────────────────────────────────────────────────────────

describe('Mention._highlightItem', () => {
  it('adds an-mention-active to indexed item and removes from others', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._highlightItem(1);
    const items = m._dropdown.querySelectorAll('.an-mention-item');
    expect(items[0].classList.contains('an-mention-active')).toBe(false);
    expect(items[1].classList.contains('an-mention-active')).toBe(true);
    expect(items[2].classList.contains('an-mention-active')).toBe(false);
  });

  it('updates _activeIndex', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._highlightItem(2);
    expect(m._activeIndex).toBe(2);
  });
});

// ── _hideDropdown ─────────────────────────────────────────────────────────────

describe('Mention._hideDropdown', () => {
  it('hides dropdown and resets state', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._open = true;
    m._query = 'ali';
    m._hideDropdown();
    expect(m._open).toBe(false);
    expect(m._items).toEqual([]);
    expect(m._activeIndex).toBe(-1);
    expect(m._query).toBe('');
    expect(m._dropdown.style.display).toBe('none');
  });
});

// ── _getQueryAtCursor ────────────────────────────────────────────────────────

describe('Mention._getQueryAtCursor', () => {
  it('returns null when no selection exists', () => {
    const m = new Mention(makeContext());
    m.initialize();
    expect(m._getQueryAtCursor()).toBeNull();
  });

  it('returns null when selection is not collapsed', () => {
    const m = new Mention(makeContext());
    m.initialize();
    const el = m.context.layoutInfo.editable;
    el.textContent = '@alice';
    const r = document.createRange();
    r.selectNodeContents(el);
    window.getSelection().addRange(r);
    expect(m._getQueryAtCursor()).toBeNull();
  });

  it('returns null when no trigger found before cursor', () => {
    const m = new Mention(makeContext());
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('hello world');
    el.appendChild(tn);
    setCursor(tn, 5);
    expect(m._getQueryAtCursor()).toBeNull();
  });

  it('returns query string after trigger character', () => {
    const m = new Mention(makeContext());
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('@alice');
    el.appendChild(tn);
    setCursor(tn, 6); // cursor after 'alice'
    const result = m._getQueryAtCursor();
    expect(result).toBe('alice');
  });

  it('returns empty string when cursor is right after trigger', () => {
    const m = new Mention(makeContext({ minChars: 0 }));
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('@');
    el.appendChild(tn);
    setCursor(tn, 1);
    expect(m._getQueryAtCursor()).toBe('');
  });

  it('returns null when space in query and allowSpaces=false', () => {
    const m = new Mention(makeContext({ allowSpaces: false }));
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('@alice doe');
    el.appendChild(tn);
    setCursor(tn, 10);
    expect(m._getQueryAtCursor()).toBeNull();
  });

  it('returns query with space when allowSpaces=true', () => {
    const m = new Mention(makeContext({ allowSpaces: true }));
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('@alice doe');
    el.appendChild(tn);
    setCursor(tn, 10);
    expect(m._getQueryAtCursor()).toBe('alice doe');
  });

  it('returns null when query length is below minChars', () => {
    const m = new Mention(makeContext({ minChars: 3 }));
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('@ab');
    el.appendChild(tn);
    setCursor(tn, 3);
    expect(m._getQueryAtCursor()).toBeNull();
  });

  it('stores triggerNode and triggerOffset', () => {
    const m = new Mention(makeContext());
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('@alice');
    el.appendChild(tn);
    setCursor(tn, 6);
    m._getQueryAtCursor();
    expect(m._triggerNode).toBe(tn);
    expect(m._triggerOffset).toBe(0);
  });
});

// ── _onKeydown ────────────────────────────────────────────────────────────────

describe('Mention._onKeydown', () => {
  it('does nothing when dropdown is closed', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._open = false;
    vi.spyOn(m, '_highlightItem');
    m._onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(m._highlightItem).not.toHaveBeenCalled();
  });

  it('ArrowDown moves highlight down wrapping', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._open = true;
    m._highlightItem(2);
    m._onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(m._activeIndex).toBe(0); // wraps around
  });

  it('ArrowUp moves highlight up wrapping', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._open = true;
    m._highlightItem(0);
    m._onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(m._activeIndex).toBe(2); // wraps to last
  });

  it('Escape hides dropdown', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._open = true;
    vi.spyOn(m, '_hideDropdown');
    m._onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(m._hideDropdown).toHaveBeenCalled();
  });

  it('Enter selects active item', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._open = true;
    m._highlightItem(1);
    vi.spyOn(m, '_select');
    m._onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(m._select).toHaveBeenCalledWith(1);
  });

  it('Tab selects active item', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._open = true;
    m._highlightItem(0);
    vi.spyOn(m, '_select');
    m._onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(m._select).toHaveBeenCalledWith(0);
  });
});

// ── _onDocClick ───────────────────────────────────────────────────────────────

describe('Mention._onDocClick', () => {
  it('hides dropdown when clicking outside', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._open = true;
    vi.spyOn(m, '_hideDropdown');
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    m._onDocClick({ target: outside });
    expect(m._hideDropdown).toHaveBeenCalled();
  });

  it('does not hide when clicking inside dropdown', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._open = true;
    vi.spyOn(m, '_hideDropdown');
    const inside = document.createElement('div');
    m._dropdown.appendChild(inside);
    m._onDocClick({ target: inside });
    expect(m._hideDropdown).not.toHaveBeenCalled();
  });

  it('does nothing when dropdown is closed', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._open = false;
    vi.spyOn(m, '_hideDropdown');
    m._onDocClick({ target: document.body });
    expect(m._hideDropdown).not.toHaveBeenCalled();
  });
});

// ── _select ───────────────────────────────────────────────────────────────────

describe('Mention._select', () => {
  it('does nothing when index is out of range', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    expect(() => m._select(99)).not.toThrow();
  });

  it('inserts default mention chip HTML via context.invoke', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._triggerNode = null; // skip text node deletion
    m._select(0);
    expect(m.context.invoke).toHaveBeenCalledWith(
      'editor.insertHTML',
      expect.stringContaining('@Alice'),
    );
  });

  it('uses custom onInsert when provided', () => {
    const onInsert = vi.fn(() => '<b>custom</b>');
    const m = new Mention(makeContext({ onInsert }));
    m.initialize();
    m._renderItems(USERS);
    m._triggerNode = null;
    m._select(0);
    expect(onInsert).toHaveBeenCalledWith(USERS[0]);
    expect(m.context.invoke).toHaveBeenCalledWith('editor.insertHTML', expect.stringContaining('<b>custom</b>'));
  });

  it('cleans up trigger text node on select', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('hello @ali');
    el.appendChild(tn);
    m._triggerNode = tn;
    m._triggerOffset = 6; // @ is at index 6
    m._query = 'ali';
    m._select(0);
    // 'hello ' + '' (trigger+query removed) = 'hello '
    expect(tn.textContent).toBe('hello ');
  });

  it('hides dropdown after selection', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._triggerNode = null;
    vi.spyOn(m, '_hideDropdown');
    m._select(0);
    expect(m._hideDropdown).toHaveBeenCalled();
  });

  it('fires triggerEvent change after insert', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._triggerNode = null;
    m._select(0);
    expect(m.context.triggerEvent).toHaveBeenCalledWith('change', expect.any(String));
  });
});

// ── _showDropdown / _positionDropdown ─────────────────────────────────────────

describe('Mention._showDropdown', () => {
  it('sets _open to true and calls _positionDropdown', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._renderItems(USERS);
    m._caretRect = { top: 100, bottom: 120, height: 20, left: 200, width: 10 };
    m._showDropdown();
    expect(m._open).toBe(true);
  });
});

describe('Mention._positionDropdown', () => {
  it('does nothing when caretRect height is 0', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._caretRect = { height: 0, top: 0, bottom: 0, left: 0 };
    expect(() => m._positionDropdown()).not.toThrow();
    expect(m._dropdown.style.display).not.toBe('block');
  });

  it('positions dropdown when caretRect has height', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._caretRect = { top: 100, bottom: 120, height: 20, left: 200, width: 10 };
    m._positionDropdown();
    expect(m._dropdown.style.top).toBeTruthy();
    expect(m._dropdown.style.left).toBeTruthy();
  });
});

// ── _onInput with timer ───────────────────────────────────────────────────────

describe('Mention._onInput debounce path', () => {
  it('calls onSearch after debounce timer fires', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn((q, cb) => cb(USERS));
    const m = new Mention(makeContext({ onSearch, debounce: 100 }));
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('@ali');
    el.appendChild(tn);
    setCursor(tn, 4);
    m._caretRect = { top: 100, bottom: 120, height: 20, left: 200 };
    vi.spyOn(m, '_captureCaretRect').mockImplementation(() => {});
    m._onInput();
    expect(onSearch).not.toHaveBeenCalled(); // not called yet (debounce pending)
    vi.advanceTimersByTime(100);
    expect(onSearch).toHaveBeenCalled();
    vi.useRealTimers();
    m.destroy();
  });

  it('hides dropdown when onSearch returns empty array', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn((q, cb) => cb([]));
    const m = new Mention(makeContext({ onSearch, debounce: 0 }));
    m.initialize();
    const el = m.context.layoutInfo.editable;
    const tn = document.createTextNode('@xyz');
    el.appendChild(tn);
    setCursor(tn, 4);
    m._open = true;
    vi.spyOn(m, '_captureCaretRect').mockImplementation(() => {});
    vi.spyOn(m, '_hideDropdown');
    m._onInput();
    vi.advanceTimersByTime(0);
    expect(m._hideDropdown).toHaveBeenCalled();
    vi.useRealTimers();
    m.destroy();
  });

  it('hides dropdown when no query found at cursor', () => {
    const m = new Mention(makeContext());
    m.initialize();
    m._open = true;
    vi.spyOn(m, '_getQueryAtCursor').mockReturnValue(null);
    vi.spyOn(m, '_hideDropdown');
    m._onInput();
    expect(m._hideDropdown).toHaveBeenCalled();
    m.destroy();
  });
});
