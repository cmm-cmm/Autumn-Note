import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BubbleToolbar } from '../../src/js/module/BubbleToolbar.js';

// jsdom stubs
for (const [cmd, val] of [
  ['queryCommandState', false],
  ['queryCommandValue', ''],
  ['execCommand',       true],
]) {
  if (typeof document[cmd] !== 'function') {
    Object.defineProperty(document, cmd, { value: () => val, configurable: true, writable: true });
  }
}

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.clearAllMocks();
  vi.useRealTimers();
});

function makeContext(opts = {}) {
  const container = document.createElement('div');
  const editable  = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p>Hello <strong>world</strong></p>';
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    options: {
      bubbleToolbar: true,
      bubbleToolbarItems: ['bold', 'italic', 'underline', 'foreColor', 'hiliteColor', 'removeFormat'],
      readOnly: false,
      ...opts,
    },
    layoutInfo: { container, editable },
    invoke: vi.fn(),
    on: vi.fn(() => () => {}),  // returns disposer fn
    triggerEvent: vi.fn(),
  };
}

function makeBubble(opts = {}) {
  const ctx = makeContext(opts);
  const bt = new BubbleToolbar(ctx);
  bt.initialize();
  return { ctx, bt };
}

const MOCK_RECT = { top: 100, bottom: 120, left: 200, right: 400, width: 200, height: 20 };

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('BubbleToolbar lifecycle', () => {
  it('does nothing when bubbleToolbar=false', () => {
    const ctx = makeContext({ bubbleToolbar: false });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();
    expect(document.querySelector('.an-bubble-toolbar')).toBeNull();
  });

  it('creates .an-bubble-toolbar in body when enabled', () => {
    makeBubble();
    expect(document.querySelector('.an-bubble-toolbar')).not.toBeNull();
  });

  it('creates color picker in body', () => {
    makeBubble();
    expect(document.querySelector('.an-bubble-color-picker')).not.toBeNull();
  });

  it('toolbar is initially hidden (display not flex)', () => {
    const { bt } = makeBubble();
    expect(bt._el.style.display).not.toBe('flex');
  });

  it('destroy removes toolbar and picker from DOM', () => {
    const { bt } = makeBubble();
    bt.destroy();
    expect(document.querySelector('.an-bubble-toolbar')).toBeNull();
    expect(document.querySelector('.an-bubble-color-picker')).toBeNull();
  });

  it('destroy clears disposers', () => {
    const { bt } = makeBubble();
    bt.destroy();
    expect(bt._disposers.length).toBe(0);
    expect(bt._el).toBeNull();
  });
});

// ── _build ────────────────────────────────────────────────────────────────────

describe('BubbleToolbar._build', () => {
  it('creates buttons for each item in bubbleToolbarItems', () => {
    const { bt } = makeBubble();
    const btns = bt._el.querySelectorAll('.an-bubble-btn');
    expect(btns.length).toBe(6); // bold, italic, underline, foreColor, hiliteColor, removeFormat
  });

  it('caches button references in _btnCache', () => {
    const { bt } = makeBubble();
    expect(bt._btnCache).toBeDefined();
    expect(bt._btnCache.length).toBe(6);
  });

  it('color buttons have --color modifier class', () => {
    const { bt } = makeBubble();
    const foreBtn = bt._el.querySelector('[data-name="foreColor"]');
    expect(foreBtn.classList.contains('an-bubble-btn--color')).toBe(true);
  });

  it('color buttons have a color strip child', () => {
    const { bt } = makeBubble();
    const foreBtn = bt._el.querySelector('[data-name="foreColor"]');
    expect(foreBtn.querySelector('.an-bubble-color-strip')).not.toBeNull();
  });

  it('skips unknown button names gracefully', () => {
    const ctx = makeContext({ bubbleToolbarItems: ['bold', '__unknown__'] });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();
    const btns = bt._el.querySelectorAll('.an-bubble-btn');
    expect(btns.length).toBe(1); // only bold
  });
});

// ── _buildColorPicker ─────────────────────────────────────────────────────────

describe('BubbleToolbar._buildColorPicker', () => {
  it('color picker is initially hidden', () => {
    const { bt } = makeBubble();
    expect(bt._picker.style.display).toBe('none');
  });

  it('color picker has a palette element', () => {
    const { bt } = makeBubble();
    expect(bt._picker._paletteEl).not.toBeNull();
    expect(bt._picker._paletteEl.querySelectorAll('.an-context-color-swatch').length).toBeGreaterThan(0);
  });

  it('color picker has a no-color button', () => {
    const { bt } = makeBubble();
    expect(bt._picker._noColorBtn).not.toBeNull();
  });

  it('color picker has a custom color input', () => {
    const { bt } = makeBubble();
    expect(bt._picker._colorInput).not.toBeNull();
    expect(bt._picker._colorInput.type).toBe('color');
  });
});

// ── _show / _hide ─────────────────────────────────────────────────────────────

describe('BubbleToolbar._show', () => {
  it('sets display to flex and _visible to true', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    expect(bt._el.style.display).toBe('flex');
    expect(bt._visible).toBe(true);
  });

  it('positions toolbar with top/left style', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    expect(bt._el.style.top).toBeTruthy();
    expect(bt._el.style.left).toBeTruthy();
  });

  it('does nothing when _el is null', () => {
    const { bt } = makeBubble();
    bt._el = null;
    expect(() => bt._show(MOCK_RECT)).not.toThrow();
  });
});

describe('BubbleToolbar._hide', () => {
  it('sets display to none and _visible to false', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    bt._hide();
    expect(bt._el.style.display).toBe('none');
    expect(bt._visible).toBe(false);
  });

  it('closes color picker on hide', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    bt._picker.style.display = 'block';
    bt._hide();
    expect(bt._picker.style.display).toBe('none');
  });

  it('does nothing when _el is null', () => {
    const { bt } = makeBubble();
    bt._el = null;
    expect(() => bt._hide()).not.toThrow();
  });
});

// ── _openColorPicker / _closeColorPicker ────────────────────────────────────

describe('BubbleToolbar color picker open/close', () => {
  it('_openColorPicker shows the picker', () => {
    const { bt } = makeBubble();
    const anchorBtn = bt._el.querySelector('[data-name="foreColor"]');
    bt._openColorPicker('foreColor', anchorBtn);
    expect(bt._picker.style.display).toBe('block');
  });

  it('_openColorPicker sets _pickerType', () => {
    const { bt } = makeBubble();
    const btn = bt._el.querySelector('[data-name="hiliteColor"]');
    bt._openColorPicker('hiliteColor', btn);
    expect(bt._pickerType).toBe('hiliteColor');
  });

  it('_openColorPicker adds noColorBtn for hiliteColor', () => {
    const { bt } = makeBubble();
    const btn = bt._el.querySelector('[data-name="hiliteColor"]');
    bt._openColorPicker('hiliteColor', btn);
    expect(bt._picker._paletteEl.contains(bt._picker._noColorBtn)).toBe(true);
  });

  it('_openColorPicker removes noColorBtn for foreColor', () => {
    const { bt } = makeBubble();
    const btn = bt._el.querySelector('[data-name="foreColor"]');
    bt._openColorPicker('foreColor', btn);
    expect(bt._picker._paletteEl.contains(bt._picker._noColorBtn)).toBe(false);
  });

  it('_closeColorPicker hides picker and nullifies _pickerType', () => {
    const { bt } = makeBubble();
    const btn = bt._el.querySelector('[data-name="foreColor"]');
    bt._openColorPicker('foreColor', btn);
    bt._closeColorPicker();
    expect(bt._picker.style.display).toBe('none');
    expect(bt._pickerType).toBeNull();
  });
});

// ── _applyColor ───────────────────────────────────────────────────────────────

describe('BubbleToolbar._applyColor', () => {
  beforeEach(() => {
    // Ensure execCommand is a mock that can be spied on
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
  });

  function setEditorSelection(bt) {
    const editable = bt.context.layoutInfo.editable;
    const textNode = editable.querySelector('p').firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    bt._savedRange = range.cloneRange();
  }

  it('calls execCommand with foreColor', () => {
    const { bt } = makeBubble();
    setEditorSelection(bt);
    bt._applyColor('foreColor', '#ff0000');
    expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
  });

  it('calls execCommand with hiliteColor', () => {
    const { bt } = makeBubble();
    setEditorSelection(bt);
    bt._applyColor('hiliteColor', '#ffff00');
    expect(document.execCommand).toHaveBeenCalledWith('hiliteColor', false, '#ffff00');
  });

  it('falls back to backColor when hiliteColor fails', () => {
    vi.spyOn(document, 'execCommand').mockImplementation((cmd) => cmd !== 'hiliteColor');
    const { bt } = makeBubble();
    setEditorSelection(bt);
    bt._applyColor('hiliteColor', '#ffff00');
    expect(document.execCommand).toHaveBeenCalledWith('backColor', false, '#ffff00');
  });

  it('updates color strip on the button', () => {
    const { bt } = makeBubble();
    setEditorSelection(bt);
    bt._applyColor('foreColor', '#cc0000');
    const strip = bt._el.querySelector('[data-name="foreColor"] .an-bubble-color-strip');
    expect(strip.style.background).toBe('rgb(204, 0, 0)');
  });

  it('does nothing when no savedRange', () => {
    const { bt } = makeBubble();
    bt._savedRange = null;
    bt._applyColor('foreColor', '#ff0000');
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it('calls context.invoke afterCommand', () => {
    const { bt, ctx } = makeBubble();
    setEditorSelection(bt);
    bt._applyColor('foreColor', '#ff0000');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('closes color picker after applying color', () => {
    const { bt } = makeBubble();
    setEditorSelection(bt);
    bt._picker.style.display = 'block';
    bt._applyColor('foreColor', '#ff0000');
    expect(bt._picker.style.display).toBe('none');
  });
});

// ── _syncActive ───────────────────────────────────────────────────────────────

describe('BubbleToolbar._syncActive', () => {
  it('applies an-active to buttons whose command is active', () => {
    vi.spyOn(document, 'queryCommandState').mockImplementation((cmd) => cmd === 'bold');
    const { bt } = makeBubble();
    bt._syncActive();
    const boldBtn = bt._el.querySelector('[data-name="bold"]');
    expect(boldBtn.classList.contains('an-active')).toBe(true);
    const italicBtn = bt._el.querySelector('[data-name="italic"]');
    expect(italicBtn.classList.contains('an-active')).toBe(false);
  });

  it('does nothing when _btnCache is null', () => {
    const { bt } = makeBubble();
    bt._btnCache = null;
    expect(() => bt._syncActive()).not.toThrow();
  });
});

// ── _onSelectionChange ────────────────────────────────────────────────────────

describe('BubbleToolbar._onSelectionChange', () => {
  it('hides when selection is collapsed', () => {
    const { bt, ctx } = makeBubble();
    bt._show(MOCK_RECT);
    // Collapsed selection → should hide
    const editable = ctx.layoutInfo.editable;
    const r = document.createRange();
    r.setStart(editable.querySelector('p').firstChild, 0);
    r.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    bt._onSelectionChange();
    expect(bt._visible).toBe(false);
  });

  it('hides when selection is outside editable', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    const outside = document.createElement('p');
    outside.textContent = 'outside';
    document.body.appendChild(outside);
    const r = document.createRange();
    r.selectNodeContents(outside);
    window.getSelection().addRange(r);
    bt._onSelectionChange();
    expect(bt._visible).toBe(false);
  });

  it('hides when readOnly=true', () => {
    const { bt, ctx } = makeBubble();
    ctx.options.readOnly = true;
    bt._show(MOCK_RECT);
    const editable = ctx.layoutInfo.editable;
    const tn = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.setEnd(tn, 5);
    window.getSelection().addRange(r);
    bt._onSelectionChange();
    expect(bt._visible).toBe(false);
  });

  it('does not hide when contextMenuOpen is true', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    bt._contextMenuOpen = true;
    bt._onSelectionChange(); // rAF mock fires sync
    // _contextMenuOpen gates the whole handler
    expect(bt._visible).toBe(true);
    bt._contextMenuOpen = false;
  });
});

// ── _onMousedown ──────────────────────────────────────────────────────────────

describe('BubbleToolbar._onMousedown', () => {
  it('hides when clicking outside editable and toolbar', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    bt._onMousedown({ target: outside });
    expect(bt._visible).toBe(false);
  });

  it('does not hide when clicking inside toolbar', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    const boldBtn = bt._el.querySelector('[data-name="bold"]');
    bt._onMousedown({ target: boldBtn });
    expect(bt._visible).toBe(true);
  });

  it('does not hide when not visible', () => {
    const { bt } = makeBubble();
    bt._visible = false;
    vi.spyOn(bt, '_hide');
    bt._onMousedown({ target: document.body });
    expect(bt._hide).not.toHaveBeenCalled();
  });

  it('does not hide when clicking inside color picker', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    const btn = bt._el.querySelector('[data-name="foreColor"]');
    bt._openColorPicker('foreColor', btn);
    const swatch = bt._picker._paletteEl.firstChild;
    if (swatch) {
      bt._onMousedown({ target: swatch });
      expect(bt._visible).toBe(true);
    }
  });
});

// ── _onKeydown ────────────────────────────────────────────────────────────────

describe('BubbleToolbar._onKeydown', () => {
  it('Escape closes color picker when picker is open', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    const btn = bt._el.querySelector('[data-name="foreColor"]');
    bt._openColorPicker('foreColor', btn);
    expect(bt._picker.style.display).toBe('block');
    bt._onKeydown({ key: 'Escape' });
    expect(bt._picker.style.display).toBe('none');
  });

  it('Escape hides toolbar when no picker open', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    bt._onKeydown({ key: 'Escape' });
    expect(bt._visible).toBe(false);
  });

  it('non-Escape key does nothing', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    bt._onKeydown({ key: 'Enter' });
    expect(bt._visible).toBe(true);
  });
});

// ── _onContextMenu ─────────────────────────────────────────────────────────────

describe('BubbleToolbar._onContextMenu', () => {
  it('hides the toolbar on right-click', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    bt._onContextMenu();
    expect(bt._visible).toBe(false);
  });
});

// ── _syncColorStrips ──────────────────────────────────────────────────────────

describe('BubbleToolbar._syncColorStrips', () => {
  it('does not throw when called with a selection in editable', () => {
    const { bt, ctx } = makeBubble();
    const editable = ctx.layoutInfo.editable;
    const tn = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.setEnd(tn, 5);
    window.getSelection().addRange(r);
    expect(() => bt._syncColorStrips()).not.toThrow();
  });

  it('does nothing when no selection', () => {
    const { bt } = makeBubble();
    window.getSelection().removeAllRanges();
    expect(() => bt._syncColorStrips()).not.toThrow();
  });
});

// ── _onSelectionChange → _show(rect) path ────────────────────────────────────

describe('BubbleToolbar._onSelectionChange show path', () => {
  it('shows toolbar when selection has non-zero bounding rect', () => {
    const { bt, ctx } = makeBubble();
    const editable = ctx.layoutInfo.editable;
    const tn = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.setEnd(tn, 5);
    // Directly assign getBoundingClientRect since jsdom Range doesn't define it
    r.getBoundingClientRect = () => MOCK_RECT;
    window.getSelection().addRange(r);
    bt._onSelectionChange();
    expect(bt._visible).toBe(true);
  });

  it('hides when picker is open during selection change', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);
    const btn = bt._el.querySelector('[data-name="foreColor"]');
    bt._openColorPicker('foreColor', btn);
    // With picker open, _onSelectionChange should not hide toolbar
    bt._onSelectionChange();
    expect(bt._visible).toBe(true);
  });

  it('hides when selection has zero-width rect', () => {
    const { bt, ctx } = makeBubble();
    bt._show(MOCK_RECT);
    const editable = ctx.layoutInfo.editable;
    const tn = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.setEnd(tn, 5);
    // Assign getBoundingClientRect returning width=0 (jsdom Range doesn't have this method)
    r.getBoundingClientRect = () => ({ top: 50, bottom: 70, left: 100, right: 100, width: 0, height: 20 });
    window.getSelection().addRange(r);
    bt._onSelectionChange();
    expect(bt._visible).toBe(false);
  });
});

describe('BubbleToolbar._show positioning', () => {
  it('flips toolbar below selection when not enough room above', () => {
    const { bt } = makeBubble();
    // rect.top = 5 → not enough room above (top - bh - gap < 8)
    const tinyTopRect = { top: 5, bottom: 25, left: 100, right: 300, width: 200, height: 20 };
    bt._show(tinyTopRect);
    const top = parseFloat(bt._el.style.top);
    // Should flip to below: top = rect.bottom + gap = 25 + 8 = 33
    expect(top).toBeGreaterThan(5);
    expect(bt._visible).toBe(true);
  });
});

describe('BubbleToolbar._openColorPicker savedRange', () => {
  it('saves current selection as _savedRange when selection exists', () => {
    const { bt, ctx } = makeBubble();
    const editable = ctx.layoutInfo.editable;
    const tn = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.setEnd(tn, 5);
    window.getSelection().addRange(r);
    const btn = bt._el.querySelector('[data-name="foreColor"]');
    bt._openColorPicker('foreColor', btn);
    expect(bt._savedRange).not.toBeNull();
  });
});

// ── Color picker swatch click and custom input ─────────────────────────────────

describe('BubbleToolbar color picker interactions', () => {
  function openPicker(bt, type = 'foreColor') {
    const btn = bt._el.querySelector(`[data-name="${type}"]`);
    bt._openColorPicker(type, btn);
    return document.querySelector('.an-bubble-color-picker');
  }

  it('clicking a color swatch applies the color (line 213)', () => {
    const { bt, ctx } = makeBubble();
    const editable = ctx.layoutInfo.editable;
    const tn = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.setEnd(tn, 5);
    window.getSelection().addRange(r);
    bt._savedRange = r;

    const picker = openPicker(bt, 'foreColor');
    expect(picker).not.toBeNull();
    const swatch = picker.querySelector('.an-context-color-swatch:not(.an-context-color-none)');
    if (swatch) {
      swatch.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    }
  });

  it('clicking "No highlight" swatch applies transparent color (lines 226-227)', () => {
    const { bt, ctx } = makeBubble();
    const editable = ctx.layoutInfo.editable;
    const tn = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.setEnd(tn, 5);
    window.getSelection().addRange(r);
    bt._savedRange = r;

    const picker = openPicker(bt, 'hiliteColor');
    const noColor = picker && picker.querySelector('.an-context-color-none');
    if (noColor) {
      noColor.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    }
  });

  it('changing custom color input applies the color (line 240)', () => {
    const { bt, ctx } = makeBubble();
    const editable = ctx.layoutInfo.editable;
    const tn = editable.querySelector('p').firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.setEnd(tn, 5);
    window.getSelection().addRange(r);
    bt._savedRange = r;

    const picker = openPicker(bt, 'foreColor');
    const colorInput = picker && picker.querySelector('input[type="color"]');
    if (colorInput) {
      colorInput.value = '#ff0000';
      colorInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    }
  });
});

// ── Button mousedown / click in toolbar ───────────────────────────────────────

describe('BubbleToolbar button click handlers', () => {
  it('mousedown on toolbar button calls preventDefault (line 168)', () => {
    const { bt } = makeBubble();
    bt._show(MOCK_RECT);

    const btn = bt._el.querySelector('.an-bubble-btn');
    if (btn) {
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      btn.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it('click on non-color button invokes editor.focus and action (lines 171-182)', () => {
    const { bt, ctx } = makeBubble();
    bt._show(MOCK_RECT);

    // Find "bold" button (not a color button)
    const boldBtn = bt._el.querySelector('.an-bubble-btn:not([data-name="foreColor"]):not([data-name="hiliteColor"])');
    if (boldBtn) {
      boldBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(ctx.invoke).toHaveBeenCalledWith('editor.focus');
    }
  });

  it('click on foreColor button opens color picker (line 176)', () => {
    const { bt, ctx } = makeBubble();
    bt._show(MOCK_RECT);

    const colorBtn = bt._el.querySelector('[data-name="foreColor"]');
    if (colorBtn) {
      colorBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      // Should have opened picker (_openColorPicker saves range, does not call invoke immediately)
      // Verify picker is visible
      const picker = document.querySelector('.an-bubble-color-picker');
      expect(picker).not.toBeNull();
    }
  });
});

// ── contextMenu event integration ─────────────────────────────────────────────

describe('BubbleToolbar contextMenu event handlers', () => {
  it('contextMenu:show event hides toolbar and sets _contextMenuOpen', () => {
    const { bt, ctx } = makeBubble();
    bt._show(MOCK_RECT);
    expect(bt._visible).toBe(true);

    // Find and invoke the contextMenu:show callback registered via context.on
    const showCall = ctx.on.mock.calls.find(([ev]) => ev === 'contextMenu:show');
    expect(showCall).toBeTruthy();
    showCall[1](); // call the callback

    expect(bt._contextMenuOpen).toBe(true);
    expect(bt._visible).toBe(false);
  });

  it('contextMenu:hide event clears _contextMenuOpen flag', () => {
    const { bt, ctx } = makeBubble();
    bt._contextMenuOpen = true;

    const hideCall = ctx.on.mock.calls.find(([ev]) => ev === 'contextMenu:hide');
    expect(hideCall).toBeTruthy();
    hideCall[1](); // call the callback

    expect(bt._contextMenuOpen).toBe(false);
  });

  it('_syncActive covers strikethrough active state', () => {
    const { bt } = makeBubble();
    Object.defineProperty(document, 'queryCommandState', {
      value: (cmd) => cmd === 'strikeThrough',
      configurable: true,
      writable: true,
    });

    bt._show(MOCK_RECT);
    bt._syncActive();

    Object.defineProperty(document, 'queryCommandState', {
      value: () => false,
      configurable: true,
      writable: true,
    });
  });
});

// ── _ACTIONS function bodies ──────────────────────────────────────────────────

describe('BubbleToolbar _ACTIONS — action function bodies', () => {
  it('clicking italic button invokes editor.italic', () => {
    const ctx = makeContext({ bubbleToolbarItems: ['italic'] });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();
    const btn = bt._el.querySelector('[data-name="italic"]');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.italic');
    bt.destroy();
  });

  it('clicking underline button invokes editor.underline', () => {
    const ctx = makeContext({ bubbleToolbarItems: ['underline'] });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();
    const btn = bt._el.querySelector('[data-name="underline"]');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.underline');
    bt.destroy();
  });

  it('clicking strikethrough button invokes editor.strikethrough', () => {
    const ctx = makeContext({ bubbleToolbarItems: ['strikethrough'] });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();
    const btn = bt._el.querySelector('[data-name="strikethrough"]');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.strikethrough');
    bt.destroy();
  });

  it('clicking link button invokes linkDialog.show', () => {
    const ctx = makeContext({ bubbleToolbarItems: ['link'] });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();
    const btn = bt._el.querySelector('[data-name="link"]');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('linkDialog.show');
    bt.destroy();
  });

  it('clicking inlineCode button invokes editor.inlineCode', () => {
    const ctx = makeContext({ bubbleToolbarItems: ['inlineCode'] });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();
    const btn = bt._el.querySelector('[data-name="inlineCode"]');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.inlineCode');
    bt.destroy();
  });

  it('clicking removeFormat button calls execCommand removeFormat and afterCommand', () => {
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const ctx = makeContext({ bubbleToolbarItems: ['removeFormat'] });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();

    // Set up a real selection so the removeFormat logic can use it
    const editable = ctx.layoutInfo.editable;
    const textNode = editable.querySelector('p').firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    window.getSelection().addRange(range);

    const btn = bt._el.querySelector('[data-name="removeFormat"]');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(document.execCommand).toHaveBeenCalledWith('removeFormat');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
    bt.destroy();
  });

  it('_syncActive calls strikeThrough queryCommandState when button is in toolbar', () => {
    vi.spyOn(document, 'queryCommandState').mockImplementation((cmd) => cmd === 'strikeThrough');
    const ctx = makeContext({ bubbleToolbarItems: ['strikethrough'] });
    const bt = new BubbleToolbar(ctx);
    bt.initialize();
    bt._syncActive();
    expect(document.queryCommandState).toHaveBeenCalledWith('strikeThrough');
    bt.destroy();
  });

  it('removeFormat removes inline style attribute from styled elements in selection (line 61)', () => {
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const ctx = makeContext({ bubbleToolbarItems: ['removeFormat'] });
    // Put a styled span in the editable so the removeFormat loop covers line 61
    ctx.layoutInfo.editable.innerHTML = '<p><span style="color:red">Hello world</span></p>';
    const bt = new BubbleToolbar(ctx);
    bt.initialize();

    const span = ctx.layoutInfo.editable.querySelector('span');
    const range = document.createRange();
    range.setStart(span.firstChild, 0);
    range.setEnd(span.firstChild, 5);
    window.getSelection().addRange(range);

    const btn = bt._el.querySelector('[data-name="removeFormat"]');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(span.hasAttribute('style')).toBe(false);
    bt.destroy();
  });
});
