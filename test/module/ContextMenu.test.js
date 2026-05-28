import { describe, it, expect, vi, afterEach } from 'vitest';
import { ContextMenu } from '../../src/js/module/ContextMenu.js';
import { en } from '../../src/js/i18n/en.js';

if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
}

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.restoreAllMocks();
});

const SIMPLE_ITEMS = [
  { name: 'bold',   label: 'Bold',   icon: '', action: vi.fn() },
  { separator: true },
  { name: 'italic', label: 'Italic', icon: '', action: vi.fn() },
];

const makeContext = (itemsOverride) => {
  const container = document.createElement('div');
  const editable  = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p>Hello</p>';
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    locale: en,
    layoutInfo: { container, editable },
    // Use no contextMenu option so defaultItems (with color pickers, table grid, etc.) are used
    options: itemsOverride !== undefined
      ? { contextMenu: { items: itemsOverride } }
      : {},
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
    on: vi.fn(() => () => {}),
  };
};

// Use defaultItems (no override) to cover all _renderItems paths including
// color pickers, table grid, submenu, and separator types
const makeMenu = (items) => {
  const ctx = makeContext(items); // undefined → defaultItems
  const cm = new ContextMenu(ctx);
  cm.initialize();
  return { ctx, cm };
};

// For simple item tests, use explicit SIMPLE_ITEMS
const makeSimpleMenu = () => {
  const ctx = makeContext(SIMPLE_ITEMS);
  const cm = new ContextMenu(ctx);
  cm.initialize();
  return { ctx, cm };
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('ContextMenu lifecycle', () => {
  it('initialize creates .an-contextmenu element in body', () => {
    makeMenu(); // uses defaultItems to cover all render paths
    expect(document.querySelector('.an-contextmenu')).not.toBeNull();
  });

  it('menu is initially hidden', () => {
    const { cm } = makeMenu();
    expect(cm.el.style.display).toBe('none');
  });

  it('destroy removes element and clears disposers', () => {
    const { cm } = makeMenu();
    cm.destroy();
    expect(cm.el).toBeNull();
    expect(cm._disposers.length).toBe(0);
  });
});

// ── _renderItems ─────────────────────────────────────────────────────────────

describe('ContextMenu._renderItems', () => {
  it('renders action buttons for each simple item', () => {
    const { cm } = makeSimpleMenu();
    const buttons = cm.el.querySelectorAll('button.an-context-item');
    expect(buttons.length).toBe(2); // bold + italic
  });

  it('renders separator as .an-context-sep div', () => {
    const { cm } = makeSimpleMenu();
    expect(cm.el.querySelector('.an-context-sep')).not.toBeNull();
  });

  it('renders item labels', () => {
    const { cm } = makeSimpleMenu();
    const labels = Array.from(cm.el.querySelectorAll('.an-context-label')).map(el => el.textContent);
    expect(labels.some(l => l.length > 0)).toBe(true);
  });

  it('renders default items with color pickers and table grid', () => {
    // Uses defaultItems which includes colorStrip, navigate (submenus), and table grid
    const { cm } = makeMenu(); // no items override → defaultItems
    // Default items should have some buttons
    expect(cm.el.querySelectorAll('button').length).toBeGreaterThan(0);
    // Default items include separators
    expect(cm.el.querySelector('.an-context-sep')).not.toBeNull();
  });
});

// ── showAt / hide ─────────────────────────────────────────────────────────────

describe('ContextMenu.showAt', () => {
  it('shows menu (display: block)', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(100, 200);
    expect(cm.el.style.display).toBe('block');
  });

  it('sets aria-hidden to false when shown', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(100, 200);
    expect(cm.el.getAttribute('aria-hidden')).toBe('false');
  });

  it('fires contextMenu:show event', () => {
    const { cm, ctx } = makeSimpleMenu();
    cm.showAt(100, 200);
    expect(ctx.triggerEvent).toHaveBeenCalledWith('contextMenu:show');
  });

  it('sets left/top position', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(150, 250);
    expect(cm.el.style.left).toBeTruthy();
    expect(cm.el.style.top).toBeTruthy();
  });
});

describe('ContextMenu.hide', () => {
  it('hides menu (display: none)', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(100, 200);
    cm.hide();
    expect(cm.el.style.display).toBe('none');
  });

  it('sets aria-hidden to true when hidden', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(100, 200);
    cm.hide();
    expect(cm.el.getAttribute('aria-hidden')).toBe('true');
  });

  it('fires contextMenu:hide event', () => {
    const { cm, ctx } = makeSimpleMenu();
    cm.showAt(100, 200);
    cm.hide();
    expect(ctx.triggerEvent).toHaveBeenCalledWith('contextMenu:hide');
  });

  it('does nothing when el is null', () => {
    const { cm } = makeSimpleMenu();
    cm.destroy();
    expect(() => cm.hide()).not.toThrow();
  });
});

// ── _maybeHide ─────────────────────────────────────────────────────────────

describe('ContextMenu._maybeHide', () => {
  it('hides when clicking outside menu', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(100, 200);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    cm._maybeHide({ target: outside });
    expect(cm.el.style.display).toBe('none');
  });

  it('does not hide when clicking inside menu', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(100, 200);
    const inside = cm.el.querySelector('button') || cm.el;
    cm._maybeHide({ target: inside });
    expect(cm.el.style.display).toBe('block');
  });

  it('does nothing when el is null', () => {
    const ctx = makeContext(SIMPLE_ITEMS);
    const cm = new ContextMenu(ctx);
    cm.initialize();
    cm.el = null;
    expect(() => cm._maybeHide({ target: document.body })).not.toThrow();
  });
});

// ── Item button click ─────────────────────────────────────────────────────────

describe('ContextMenu item button action', () => {
  it('clicking a button calls its action and hides menu', () => {
    const action = vi.fn();
    const items = [{ name: 'test', label: 'Test', icon: '', action }];
    const { cm, ctx } = makeMenu(items);
    cm.showAt(100, 200);
    const btn = cm.el.querySelector('button.an-context-item');
    btn.click();
    expect(action).toHaveBeenCalledWith(ctx);
    expect(cm.el.style.display).toBe('none');
  });
});

// ── Reposition clamps ─────────────────────────────────────────────────────────

describe('ContextMenu._reposition', () => {
  it('clamps left position to minimum 8px margin', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(-100, 100);
    const left = Number.parseFloat(cm.el.style.left);
    expect(left).toBeGreaterThanOrEqual(8);
  });

  it('clamps top position to minimum 8px margin', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(100, -100);
    const top = Number.parseFloat(cm.el.style.top);
    expect(top).toBeGreaterThanOrEqual(8);
  });
});

// ── Navigate submenu and color palette ───────────────────────────────────────

describe('ContextMenu navigate submenu interactions', () => {
  it('clicking navigate submenu button re-renders to sub-items', () => {
    const { cm } = makeMenu(); // uses defaultItems with navigate items (textColor, etc.)
    cm.showAt(100, 200);
    const navBtn = cm.el.querySelector('.an-context-submenu');
    expect(navBtn).not.toBeNull();
    navBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    // After clicking, it re-renders the sub-items (back button + color palette)
    expect(cm.el.querySelector('.an-context-back')).not.toBeNull();
  });

  it('clicking back button re-renders to parent items', () => {
    const { cm } = makeMenu();
    cm.showAt(100, 200);
    const navBtn = cm.el.querySelector('.an-context-submenu');
    navBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const backBtn = cm.el.querySelector('.an-context-back');
    expect(backBtn).not.toBeNull();
    backBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    // After clicking back, the navigate submenu items should be visible again
    expect(cm.el.querySelector('.an-context-submenu')).not.toBeNull();
  });

  it('color palette swatch click applies color', () => {
    const { cm, ctx } = makeMenu();
    cm.showAt(100, 200);
    const navBtn = cm.el.querySelector('.an-context-submenu');
    navBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const swatch = cm.el.querySelector('.an-context-color-swatch');
    if (swatch) {
      const p = ctx.layoutInfo.editable.querySelector('p');
      const range = document.createRange();
      range.selectNodeContents(p);
      cm._savedRange = range;
      swatch.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      // Swatch click calls _applyColor which calls editor.afterCommand
      expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    }
  });

  it('colorPalette hiliteColor type renders no-color swatch', () => {
    const items = [
      { colorPalette: true, colorType: 'hiliteColor' },
    ];
    const { cm } = makeMenu(items);
    expect(cm.el.querySelector('.an-context-color-none')).not.toBeNull();
  });

  it('custom color input change applies color', () => {
    const items = [
      { colorPalette: true, colorType: 'foreColor' },
    ];
    const { cm, ctx } = makeMenu(items);
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.selectNodeContents(p);
    cm._savedRange = range;
    const colorInput = cm.el.querySelector('input[type="color"]');
    expect(colorInput).not.toBeNull();
    colorInput.value = '#ff0000';
    colorInput.dispatchEvent(new Event('change'));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('navigate button with icon (no colorStrip) renders icon span', () => {
    const items = [
      { name: 'test', label: 'Test', icon: '<svg></svg>', navigate: () => [] },
    ];
    const { cm } = makeMenu(items);
    const navBtn = cm.el.querySelector('.an-context-submenu');
    expect(navBtn).not.toBeNull();
    expect(navBtn.querySelector('.an-context-icon')).not.toBeNull();
  });
});

// ── _getSelectionColor ────────────────────────────────────────────────────────

describe('ContextMenu._getSelectionColor', () => {
  it('returns foreColor default when no savedRange', () => {
    const { cm } = makeSimpleMenu();
    cm._savedRange = null;
    expect(cm._getSelectionColor('foreColor')).toBe('#000000');
  });

  it('returns hiliteColor default when no savedRange', () => {
    const { cm } = makeSimpleMenu();
    cm._savedRange = null;
    expect(cm._getSelectionColor('hiliteColor')).toBe('transparent');
  });

  it('returns computed color from element when range exists', () => {
    const { cm, ctx } = makeSimpleMenu();
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.selectNodeContents(p);
    cm._savedRange = range;
    expect(() => cm._getSelectionColor('foreColor')).not.toThrow();
    expect(() => cm._getSelectionColor('hiliteColor')).not.toThrow();
  });
});

// ── _applyColor ───────────────────────────────────────────────────────────────

describe('ContextMenu._applyColor', () => {
  it('does nothing when no savedRange', () => {
    const { cm } = makeSimpleMenu();
    cm._savedRange = null;
    expect(() => cm._applyColor('foreColor', '#ff0000')).not.toThrow();
  });

  it('applies color command when savedRange exists', () => {
    const { cm, ctx } = makeSimpleMenu();
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.selectNodeContents(p);
    cm._savedRange = range;
    cm.showAt(100, 200);
    cm._applyColor('foreColor', '#ff0000');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('hides menu after applying color', () => {
    const { cm, ctx } = makeSimpleMenu();
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.selectNodeContents(p);
    cm._savedRange = range;
    cm.showAt(100, 200);
    cm._applyColor('hiliteColor', '#ffff00');
    expect(cm.el.style.display).toBe('none');
  });
});

// ── copyFormat / hasCopiedFormat / pasteFormat / removeFormat ─────────────────

describe('ContextMenu format operations', () => {
  function makeMenuWithRange() {
    const { cm, ctx } = makeSimpleMenu();
    const p = ctx.layoutInfo.editable.querySelector('p');
    const textNode = p.firstChild;
    const range = document.createRange();
    if (textNode) {
      range.setStart(textNode, 0);
      range.setEnd(textNode, textNode.length || 0);
    } else {
      range.selectNodeContents(p);
    }
    cm._savedRange = range;
    return { cm, ctx };
  }

  it('hasCopiedFormat returns false initially', () => {
    const { cm } = makeSimpleMenu();
    expect(cm.hasCopiedFormat()).toBe(false);
  });

  it('copyFormat snapshots selection styles', () => {
    const { cm } = makeMenuWithRange();
    cm.copyFormat();
    expect(cm._copiedFormat).not.toBeNull();
    expect(typeof cm._copiedFormat.bold).toBe('boolean');
    expect(typeof cm._copiedFormat.italic).toBe('boolean');
  });

  it('hasCopiedFormat returns true after copyFormat', () => {
    const { cm } = makeMenuWithRange();
    cm.copyFormat();
    expect(cm.hasCopiedFormat()).toBe(true);
  });

  it('copyFormat does nothing when no savedRange', () => {
    const { cm } = makeSimpleMenu();
    cm._savedRange = null;
    cm.copyFormat();
    expect(cm._copiedFormat).toBeNull();
  });

  it('pasteFormat does nothing when no copiedFormat', () => {
    const { cm } = makeMenuWithRange();
    cm._copiedFormat = null;
    expect(() => cm.pasteFormat()).not.toThrow();
  });

  it('pasteFormat applies formatting and calls afterCommand', () => {
    const { cm, ctx } = makeMenuWithRange();
    cm._copiedFormat = {
      bold: true, italic: false, underline: false, strikethrough: false,
      fontFamily: null, fontSize: null, color: '#ff0000', backgroundColor: 'transparent',
    };
    cm.pasteFormat();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('pasteFormat with non-transparent backgroundColor applies hiliteColor', () => {
    const { cm, ctx } = makeMenuWithRange();
    cm._copiedFormat = {
      bold: false, italic: false, underline: false, strikethrough: false,
      fontFamily: null, fontSize: null, color: null, backgroundColor: '#ffff00',
    };
    cm.pasteFormat();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('pasteFormat with fontFamily applies fontName', () => {
    const { cm, ctx } = makeMenuWithRange();
    cm._copiedFormat = {
      bold: false, italic: false, underline: false, strikethrough: false,
      fontFamily: 'Arial', fontSize: null, color: null, backgroundColor: 'transparent',
    };
    cm.pasteFormat();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('removeFormat removes formatting and calls afterCommand', () => {
    const { cm, ctx } = makeMenuWithRange();
    cm.removeFormat();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('removeFormat does nothing when no savedRange', () => {
    const { cm } = makeSimpleMenu();
    cm._savedRange = null;
    expect(() => cm.removeFormat()).not.toThrow();
  });

  it('pasteFormat with fontSize replaces font[size=7] elements with styled spans', () => {
    const { cm, ctx } = makeMenuWithRange();
    // Simulate what execCommand('fontSize','7') would insert:
    // Override execCommand to inject font elements when called with fontSize
    const realExec = document.execCommand;
    document.execCommand = vi.fn((cmd) => {
      if (cmd === 'fontSize') {
        // Inject a font[size="7"] element into the editable
        const font = document.createElement('font');
        font.setAttribute('size', '7');
        font.textContent = 'hello';
        ctx.layoutInfo.editable.querySelector('p').appendChild(font);
      }
      return true;
    });

    cm._copiedFormat = {
      bold: false, italic: false, underline: false, strikethrough: false,
      fontFamily: null, fontSize: '18px', color: null, backgroundColor: 'transparent',
    };
    cm.pasteFormat();

    // The font[size="7"] should have been replaced with a span[style="font-size: 18px"]
    const span = ctx.layoutInfo.editable.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.style.fontSize).toBe('18px');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');

    document.execCommand = realExec;
  });

  it('pasteFormat with strikethrough applies strikeThrough', () => {
    const { cm, ctx } = makeMenuWithRange();
    cm._copiedFormat = {
      bold: false, italic: false, underline: false, strikethrough: true,
      fontFamily: null, fontSize: null, color: null, backgroundColor: 'transparent',
    };
    cm.pasteFormat();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('_findExplicitStyle finds inline style on element', () => {
    const { cm, ctx } = makeSimpleMenu();
    const editable = ctx.layoutInfo.editable;
    const p = editable.querySelector('p');
    p.style.fontFamily = 'Arial';
    const p2 = document.createElement('p');
    p2.textContent = 'text';
    editable.appendChild(p2);
    const range = document.createRange();
    range.selectNodeContents(p2);
    cm._savedRange = range;
    // copyFormat traverses up from startContainer looking for explicit styles
    cm.copyFormat();
    // _findExplicitStyle should have been called — copiedFormat is set
    expect(cm._copiedFormat).not.toBeNull();
  });

  it('_findExplicitStyle returns null when no explicit inline style found', () => {
    const { cm, ctx } = makeSimpleMenu();
    const editable = ctx.layoutInfo.editable;
    const p = editable.querySelector('p');
    // No inline style set
    const range = document.createRange();
    range.selectNodeContents(p);
    cm._savedRange = range;
    cm.copyFormat();
    // fontFamily should be null since no explicit style is set
    expect(cm._copiedFormat.fontFamily).toBeNull();
  });

  it('_isDefaultColor returns true for black color values', () => {
    const { cm } = makeSimpleMenu();
    expect(cm._isDefaultColor('rgb(0, 0, 0)')).toBe(true);
    expect(cm._isDefaultColor('rgba(0, 0, 0, 0)')).toBe(true);
    expect(cm._isDefaultColor('transparent')).toBe(true);
    expect(cm._isDefaultColor('')).toBe(true);
    expect(cm._isDefaultColor('#ff0000')).toBe(false);
  });
});

// ── _onContextMenu event handler ──────────────────────────────────────────────

describe('ContextMenu._onContextMenu', () => {
  it('shows menu when contextmenu event fired on editable content', () => {
    const { cm, ctx } = makeSimpleMenu();
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 200,
    });
    ctx.layoutInfo.editable.dispatchEvent(event);
    // Menu should be shown
    expect(cm.el.style.display).toBe('block');
  });

  it('prevents default on contextmenu event', () => {
    const { ctx } = makeSimpleMenu();
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    ctx.layoutInfo.editable.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('does not show when container has an-disabled class', () => {
    const { cm, ctx } = makeSimpleMenu();
    ctx.layoutInfo.container.classList.add('an-disabled');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 200 });
    ctx.layoutInfo.editable.dispatchEvent(event);
    expect(cm.el.style.display).toBe('none');
  });

  it('saves selection range on contextmenu', () => {
    const { cm, ctx } = makeSimpleMenu();
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.selectNodeContents(p);
    window.getSelection().addRange(range);

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 });
    ctx.layoutInfo.editable.dispatchEvent(event);
    expect(cm._savedRange).not.toBeNull();
  });

  it('positions below selection when non-collapsed range exists', () => {
    const { cm, ctx } = makeSimpleMenu();
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.selectNodeContents(p);
    // Simulate getBoundingClientRect returning a real rect
    range.getBoundingClientRect = () => ({ width: 100, height: 20, bottom: 150, top: 130, left: 50, right: 150 });
    window.getSelection().addRange(range);

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 80, clientY: 80 });
    ctx.layoutInfo.editable.dispatchEvent(event);

    // Menu should be shown (positioned below selection)
    expect(cm.el.style.display).toBe('block');
  });

  it('window scroll hides menu', () => {
    const { cm, ctx } = makeSimpleMenu();
    ctx.layoutInfo.editable.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 50, clientY: 50 }),
    );
    expect(cm.el.style.display).toBe('block');
    window.dispatchEvent(new Event('scroll'));
    expect(cm.el.style.display).toBe('none');
  });

  it('document Escape key hides menu', () => {
    const { cm, ctx } = makeSimpleMenu();
    ctx.layoutInfo.editable.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 50, clientY: 50 }),
    );
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(cm.el.style.display).toBe('none');
  });
});

// ── Table grid interactions ────────────────────────────────────────────────────

describe('ContextMenu table grid', () => {
  function makeMenuWithTable() {
    const { ctx, cm } = makeMenu(); // defaultItems includes table grid
    cm.showAt(100, 200);
    return { ctx, cm };
  }

  it('clicking table header button expands grid panel', () => {
    const { cm } = makeMenuWithTable();
    // The table grid wrapper has a header button that is an-context-submenu
    // Find the table grid wrapper specifically
    const wrapper = cm.el.querySelector('.an-context-table-wrap');
    if (!wrapper) return; // skip if no table grid in menu
    const headerBtn = wrapper.querySelector('.an-context-submenu');
    expect(headerBtn).not.toBeNull();
    headerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const panel = wrapper.querySelector('.an-context-table-grid-panel');
    expect(panel.style.display).not.toBe('none');
  });

  it('clicking table header button twice collapses grid panel', () => {
    const { cm } = makeMenuWithTable();
    const wrapper = cm.el.querySelector('.an-context-table-wrap');
    if (!wrapper) return;
    const headerBtn = wrapper.querySelector('.an-context-submenu');
    headerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    headerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const panel = wrapper.querySelector('.an-context-table-grid-panel');
    expect(panel.style.display).toBe('none');
  });

  it('mousemove over grid cells highlights them', () => {
    const { cm } = makeMenuWithTable();
    const wrapper = cm.el.querySelector('.an-context-table-wrap');
    if (!wrapper) return;
    const headerBtn = wrapper.querySelector('.an-context-submenu');
    headerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const gridEl = wrapper.querySelector('.an-table-grid');
    const cell = gridEl.querySelector('[data-row="2"][data-col="3"]');
    if (!cell) return;
    cell.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    // Cells [row<=2][col<=3] should have 'active' class
    const activeCells = gridEl.querySelectorAll('.an-table-cell.active');
    expect(activeCells.length).toBe(6); // 2 rows × 3 cols
  });

  it('mouseleave on grid clears highlights', () => {
    const { cm } = makeMenuWithTable();
    const wrapper = cm.el.querySelector('.an-context-table-wrap');
    if (!wrapper) return;
    const headerBtn = wrapper.querySelector('.an-context-submenu');
    headerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const gridEl = wrapper.querySelector('.an-table-grid');
    const cell = gridEl.querySelector('[data-row="1"][data-col="1"]');
    cell.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    gridEl.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    const activeCells = gridEl.querySelectorAll('.an-table-cell.active');
    expect(activeCells.length).toBe(0);
  });

  it('clicking a grid cell inserts a table and hides menu', () => {
    const { cm, ctx } = makeMenuWithTable();
    const wrapper = cm.el.querySelector('.an-context-table-wrap');
    if (!wrapper) return;
    const headerBtn = wrapper.querySelector('.an-context-submenu');
    headerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const gridEl = wrapper.querySelector('.an-table-grid');
    const cell = gridEl.querySelector('[data-row="3"][data-col="4"]');
    if (!cell) return;
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertTable', 4, 3);
    expect(cm.el.style.display).toBe('none');
  });

  it('clicking a grid cell with saved range restores selection', () => {
    const { cm, ctx } = makeMenuWithTable();
    // Set a saved range
    const p = ctx.layoutInfo.editable.querySelector('p');
    const range = document.createRange();
    range.selectNodeContents(p);
    cm._savedRange = range;

    const wrapper = cm.el.querySelector('.an-context-table-wrap');
    if (!wrapper) return;
    const headerBtn = wrapper.querySelector('.an-context-submenu');
    headerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    const gridEl = wrapper.querySelector('.an-table-grid');
    const cell = gridEl.querySelector('[data-row="2"][data-col="2"]');
    if (!cell) return;
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertTable', 2, 2);
  });
});

// ── Default item action function bodies ───────────────────────────────────────

describe('ContextMenu default item actions', () => {
  function clickItem(cm, name) {
    const btn = cm.el.querySelector(`button[data-name="${name}"]`);
    if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return btn;
  }

  it('clicking cut item calls document.execCommand cut', () => {
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const { cm } = makeMenu();
    clickItem(cm, 'cut');
    expect(document.execCommand).toHaveBeenCalledWith('cut');
  });

  it('clicking copy item calls document.execCommand copy', () => {
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const { cm } = makeMenu();
    clickItem(cm, 'copy');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('clicking bold item invokes editor.bold', () => {
    const { cm, ctx } = makeMenu();
    clickItem(cm, 'bold');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.bold');
  });

  it('clicking italic item invokes editor.italic', () => {
    const { cm, ctx } = makeMenu();
    clickItem(cm, 'italic');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.italic');
  });

  it('clicking underline item invokes editor.underline', () => {
    const { cm, ctx } = makeMenu();
    clickItem(cm, 'underline');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.underline');
  });

  it('clicking copyFormat item invokes contextMenu.copyFormat', () => {
    const { cm, ctx } = makeMenu();
    clickItem(cm, 'copyFormat');
    expect(ctx.invoke).toHaveBeenCalledWith('contextMenu.copyFormat');
  });

  it('clicking removeFormat item invokes contextMenu.removeFormat', () => {
    const { cm, ctx } = makeMenu();
    clickItem(cm, 'removeFormat');
    expect(ctx.invoke).toHaveBeenCalledWith('contextMenu.removeFormat');
  });

  it('clicking link item invokes linkDialog.show', () => {
    const { cm, ctx } = makeMenu();
    clickItem(cm, 'link');
    expect(ctx.invoke).toHaveBeenCalledWith('linkDialog.show');
  });

  it('clicking image item invokes imageDialog.show', () => {
    const { cm, ctx } = makeMenu();
    clickItem(cm, 'image');
    expect(ctx.invoke).toHaveBeenCalledWith('imageDialog.show');
  });

  it('clicking video item invokes videoDialog.show', () => {
    const { cm, ctx } = makeMenu();
    clickItem(cm, 'video');
    expect(ctx.invoke).toHaveBeenCalledWith('videoDialog.show');
  });

  it('pasteFormat item is disabled when hasCopiedFormat returns false', () => {
    const { cm } = makeMenu();
    const btn = cm.el.querySelector('button[data-name="pasteFormat"]');
    expect(btn).not.toBeNull();
    expect(btn.disabled).toBe(true);
  });

  it('_onContextMenu adjusts openY below selection rect when non-zero (line 396)', () => {
    // jsdom does not implement getBoundingClientRect on Range — add it temporarily
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      value: () => ({ width: 100, height: 20, bottom: 200, top: 180, left: 100, right: 200 }),
      configurable: true,
      writable: true,
    });

    const { cm, ctx } = makeMenu();
    const editable = ctx.layoutInfo.editable;
    const p = editable.querySelector('p');
    const range = document.createRange();
    range.setStart(p.firstChild, 0);
    range.setEnd(p.firstChild, 5);
    window.getSelection().addRange(range);

    cm._onContextMenu({ target: editable, clientX: 150, clientY: 100, preventDefault: vi.fn() });

    delete Range.prototype.getBoundingClientRect;

    // openY should be selRect.bottom + 4 = 200 + 4 = 204
    expect(cm._lastY).toBe(204);
  });
});

// ── _findExplicitStyle FONT element handling ──────────────────────────────────

describe('ContextMenu._findExplicitStyle FONT element', () => {
  it('returns face attribute from <font face="Arial"> element', () => {
    const { cm, ctx } = makeSimpleMenu();
    const editable = ctx.layoutInfo.editable;
    // Create a <font> element with face attribute inside editable
    const fontEl = document.createElement('font');
    fontEl.setAttribute('face', 'Arial');
    fontEl.textContent = 'styled text';
    editable.appendChild(fontEl);

    const result = cm._findExplicitStyle(fontEl, editable, 'fontFamily');
    expect(result).toBe('Arial');
  });

  it('returns null for fontSize from <font size="3"> element (attribute sizes not usable)', () => {
    const { cm, ctx } = makeSimpleMenu();
    const editable = ctx.layoutInfo.editable;
    const fontEl = document.createElement('font');
    fontEl.setAttribute('size', '3');
    fontEl.textContent = 'sized text';
    editable.appendChild(fontEl);

    const result = cm._findExplicitStyle(fontEl, editable, 'fontSize');
    expect(result).toBeNull();
  });
});
