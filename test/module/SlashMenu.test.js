import { describe, it, expect, vi, afterEach } from 'vitest';
import { SlashMenu } from '../../src/js/module/SlashMenu.js';
import { en } from '../../src/js/i18n/en.js';

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
    locale: en,
    options: { slashMenu: true, ...opts },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
    getHTML: vi.fn(() => '<p></p>'),
  };
};

const setCursor = (textNode, offset) => {
  const r = document.createRange();
  r.setStart(textNode, offset);
  r.collapse(true);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(r);
};

/** Types `text` into a fresh <p> inside the editable and positions the caret at the end. */
const typeIntoNewParagraph = (editable, text) => {
  const p = document.createElement('p');
  const textNode = document.createTextNode(text);
  p.appendChild(textNode);
  editable.appendChild(p);
  setCursor(textNode, text.length);
  return textNode;
};

/**
 * jsdom does not implement layout, so Range.getClientRects()/getBoundingClientRect()
 * throw or return empty rects (see Mention.test.js for the same workaround).
 * _captureCaretRect is stubbed so _onInput's positioning step is a no-op in tests.
 */
const stubCaretRect = (sm) => {
  vi.spyOn(sm, '_captureCaretRect').mockReturnValue({ top: 100, bottom: 120, height: 20, left: 200 });
};

// ── Lifecycle ────────────────────────────────────────────────────────────────

describe('SlashMenu lifecycle', () => {
  it('skips initialization when slashMenu option is false', () => {
    const ctx = makeContext({ slashMenu: false });
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    ctx.layoutInfo.editable.dispatchEvent(new Event('input'));
    expect(document.querySelector('.an-slash-menu')).toBeNull();
  });

  it('does not build the menu element until first triggered', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    expect(document.querySelector('.an-slash-menu')).toBeNull();
  });

  it('destroy is safe when called without ever triggering', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    expect(() => sm.destroy()).not.toThrow();
  });

  it('destroy removes the menu element from the DOM', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    sm._onInput();
    expect(document.querySelector('.an-slash-menu')).not.toBeNull();
    sm.destroy();
    expect(document.querySelector('.an-slash-menu')).toBeNull();
  });
});

// ── Trigger detection — _getTriggerContext ───────────────────────────────────

describe('SlashMenu trigger detection', () => {
  it('opens when "/" is the only character in an empty paragraph', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/');

    sm._onInput();

    expect(sm._open).toBe(true);
    expect(sm._filtered.length).toBeGreaterThan(0);
  });

  it('does not open for "/" in the middle of existing text (e.g. "10/20")', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    const textNode = typeIntoNewParagraph(ctx.layoutInfo.editable, '10/20');
    setCursor(textNode, 5);

    sm._onInput();

    expect(sm._open).toBe(false);
  });

  it('does not open when there is trailing content after the cursor in the block', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    const p = document.createElement('p');
    const textNode = document.createTextNode('/rest of line');
    p.appendChild(textNode);
    ctx.layoutInfo.editable.appendChild(p);
    setCursor(textNode, 1); // caret right after "/", "rest of line" still follows

    sm._onInput();

    expect(sm._open).toBe(false);
  });

  it('closes when the "/" is deleted (no longer matches trigger pattern)', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    const textNode = typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    sm._onInput();
    expect(sm._open).toBe(true);

    textNode.textContent = '';
    setCursor(textNode, 0);
    sm._onInput();

    expect(sm._open).toBe(false);
  });

  it('updates the filter query as the user types after "/"', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    const textNode = typeIntoNewParagraph(ctx.layoutInfo.editable, '/tab');

    sm._onInput();

    expect(sm._query).toBe('tab');
    expect(sm._filtered.some((c) => c.id === 'table')).toBe(true);
    expect(sm._filtered.some((c) => c.id === 'h1')).toBe(false);
  });

  it('re-filters in place (without rebuilding) on subsequent input while already open', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    const textNode = typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    sm._onInput();
    expect(sm._open).toBe(true);
    expect(sm._filtered.some((c) => c.id === 'h1')).toBe(true);

    textNode.textContent = '/tab';
    setCursor(textNode, 4);
    sm._onInput();

    expect(sm._open).toBe(true);
    expect(sm._query).toBe('tab');
    expect(sm._filtered.some((c) => c.id === 'table')).toBe(true);
    expect(sm._filtered.some((c) => c.id === 'h1')).toBe(false);
  });

  it('shows the empty state when no command matches the query', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/zzzznotacommand');

    sm._onInput();

    expect(sm._filtered.length).toBe(0);
    expect(sm._menu.querySelector('.an-slash-menu-empty')).not.toBeNull();
    expect(sm._menu.querySelector('.an-slash-menu-empty').textContent).toBe(en.slashMenu.noResults);
  });
});

// ── Keyboard navigation ───────────────────────────────────────────────────────

describe('SlashMenu keyboard navigation', () => {
  const openMenu = (query = '/') => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, query);
    sm._onInput();
    return { ctx, sm };
  };

  it('ignores keydown when the menu is closed', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    expect(() => sm._onKeydown(event)).not.toThrow();
    expect(sm._activeIndex).toBe(-1);
  });

  it('ArrowDown moves to the next item and wraps around', () => {
    const { sm } = openMenu();
    const count = sm._filtered.length;
    expect(sm._activeIndex).toBe(0);
    for (let i = 0; i < count; i++) {
      sm._onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    }
    expect(sm._activeIndex).toBe(0); // wrapped back to start
  });

  it('ArrowUp moves to the previous item and wraps around', () => {
    const { sm } = openMenu();
    sm._onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }));
    expect(sm._activeIndex).toBe(sm._filtered.length - 1);
  });

  it('Escape closes the menu without running any command', () => {
    const { ctx, sm } = openMenu();
    sm._onKeydown(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    expect(sm._open).toBe(false);
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('Enter selects the active item and invokes its command', () => {
    const { ctx, sm } = openMenu();
    sm._onKeydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(sm._open).toBe(false);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.formatBlock', 'h1');
  });

  it('Tab also selects the active item', () => {
    const { ctx, sm } = openMenu();
    sm._onKeydown(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.formatBlock', 'h1');
  });
});

// ── Selection / command execution ────────────────────────────────────────────

describe('SlashMenu selection', () => {
  it('renders custom commands with listbox accessibility state', () => {
    const run = vi.fn();
    const ctx = makeContext({ slashCommands: [{ id: 'callout', label: 'Callout', keywords: 'note', run }] });
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/call');
    sm._onInput();

    const option = sm._menu.querySelector('#an-slash-option-callout');
    expect(option).not.toBeNull();
    expect(option.getAttribute('aria-selected')).toBe('true');
    expect(sm._menu.getAttribute('aria-activedescendant')).toBe(option.id);
    sm._select(0);
    expect(run).toHaveBeenCalledWith(ctx);
  });

  it('removes the "/query" text from the DOM before running the command', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    const textNode = typeIntoNewParagraph(ctx.layoutInfo.editable, '/h1');
    sm._onInput();

    sm._select(0);

    expect(textNode.textContent).toBe('');
  });

  it('invokes each command with the expected editor/dialog method', () => {
    const cases = [
      { query: 'heading 1', id: 'h1', expect: ['editor.formatBlock', 'h1'] },
      { query: 'heading 2', id: 'h2', expect: ['editor.formatBlock', 'h2'] },
      { query: 'heading 3', id: 'h3', expect: ['editor.formatBlock', 'h3'] },
      { query: 'bullet', id: 'ul', expect: ['editor.insertUL'] },
      { query: 'numbered', id: 'ol', expect: ['editor.insertOL'] },
      { query: 'checklist', id: 'checklist', expect: ['editor.toggleChecklist'] },
      { query: 'blockquote', id: 'quote', expect: ['editor.formatBlock', 'blockquote'] },
      { query: 'code block', id: 'code', expect: ['editor.formatBlock', 'pre'] },
      { query: 'horizontal rule', id: 'hr', expect: ['editor.insertHr'] },
      { query: 'table', id: 'table', expect: ['editor.insertTable', 3, 3] },
      { query: 'image', id: 'image', expect: ['imageDialog.show', expect.objectContaining({ beforeInsert: expect.any(Function) })] },
    ];

    for (const { id, expect: expectedArgs } of cases) {
      const ctx = makeContext();
      const sm = new SlashMenu(ctx);
      sm.initialize();
    stubCaretRect(sm);
      typeIntoNewParagraph(ctx.layoutInfo.editable, `/${id}`);
      sm._onInput();
      const index = sm._filtered.findIndex((c) => c.id === id);
      expect(index, `command "${id}" not found among filtered results`).toBeGreaterThanOrEqual(0);

      sm._select(index);

      expect(ctx.invoke).toHaveBeenCalledWith(...expectedArgs);
    }
  });

  it('_select does nothing for an out-of-range index', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    sm._onInput();

    expect(() => sm._select(999)).not.toThrow();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('defers removing /image until the image dialog commits insertion', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    const textNode = typeIntoNewParagraph(ctx.layoutInfo.editable, '/image');
    sm._onInput();
    const index = sm._filtered.findIndex((c) => c.id === 'image');

    sm._select(index);

    expect(textNode.textContent).toBe('/image');
    const [, hooks] = ctx.invoke.mock.calls.at(-1);
    hooks.beforeInsert();
    expect(textNode.textContent).toBe('');
  });

  it('clicking a menu item selects it', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    sm._onInput();

    const firstItem = sm._menu.querySelector('.an-slash-menu-item');
    firstItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(ctx.invoke).toHaveBeenCalledWith('editor.formatBlock', 'h1');
  });

  it('mousemove over an item highlights it', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    sm._onInput();

    const items = sm._menu.querySelectorAll('.an-slash-menu-item');
    items[1].dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));

    expect(sm._activeIndex).toBe(1);
    expect(items[1].classList.contains('an-slash-menu-active')).toBe(true);
  });

  it('positions the menu above the caret when it would overflow the viewport bottom', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    vi.spyOn(sm, '_captureCaretRect').mockReturnValue({
      top: globalThis.innerHeight - 10,
      bottom: globalThis.innerHeight - 5,
      height: 5,
      left: 20,
    });

    sm._onInput();

    const top = Number.parseFloat(sm._menu.style.top);
    expect(top).toBeLessThan(globalThis.innerHeight - 10);
  });
});

// ── Outside click ─────────────────────────────────────────────────────────────

describe('SlashMenu outside click', () => {
  it('closes when clicking outside the menu', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    sm._onInput();
    expect(sm._open).toBe(true);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(sm._open).toBe(false);
  });

  it('does not close when the click target is inside the menu', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    typeIntoNewParagraph(ctx.layoutInfo.editable, '/');
    sm._onInput();

    sm._menu.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(sm._open).toBe(true);
  });

  it('_onDocClick is a no-op when the menu is already closed', () => {
    const ctx = makeContext();
    const sm = new SlashMenu(ctx);
    sm.initialize();
    stubCaretRect(sm);
    expect(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))).not.toThrow();
    expect(sm._open).toBe(false);
  });
});
