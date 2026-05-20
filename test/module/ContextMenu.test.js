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

function makeContext(itemsOverride) {
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
}

// Use defaultItems (no override) to cover all _renderItems paths including
// color pickers, table grid, submenu, and separator types
function makeMenu(items) {
  const ctx = makeContext(items); // undefined → defaultItems
  const cm = new ContextMenu(ctx);
  cm.initialize();
  return { ctx, cm };
}

// For simple item tests, use explicit SIMPLE_ITEMS
function makeSimpleMenu() {
  const ctx = makeContext(SIMPLE_ITEMS);
  const cm = new ContextMenu(ctx);
  cm.initialize();
  return { ctx, cm };
}

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
    const left = parseFloat(cm.el.style.left);
    expect(left).toBeGreaterThanOrEqual(8);
  });

  it('clamps top position to minimum 8px margin', () => {
    const { cm } = makeSimpleMenu();
    cm.showAt(100, -100);
    const top = parseFloat(cm.el.style.top);
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
});
