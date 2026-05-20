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
});
