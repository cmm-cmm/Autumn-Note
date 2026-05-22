import { describe, it, expect, vi, afterEach } from 'vitest';
import { ImageResizer } from '../../src/js/module/ImageResizer.js';

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

function makeContext(html = '<p><img src="test.png" alt="test" style="width:200px;height:150px"></p>') {
  const container = document.createElement('div');
  container.className = 'an-container';
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    layoutInfo: { container, editable },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
}

function makeResizer(html) {
  const ctx = makeContext(html);
  const ir = new ImageResizer(ctx);
  ir.initialize();
  return { ctx, ir };
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('ImageResizer lifecycle', () => {
  it('initialize creates .an-image-resizer overlay', () => {
    const { ir } = makeResizer();
    expect(ir._overlay).not.toBeNull();
    expect(ir._overlay.classList.contains('an-image-resizer')).toBe(true);
  });

  it('overlay is initially hidden', () => {
    const { ir } = makeResizer();
    expect(ir._overlay.style.display).toBe('none');
  });

  it('overlay has 8 resize handles', () => {
    const { ir } = makeResizer();
    expect(ir._overlay.querySelectorAll('[data-handle]').length).toBe(8);
  });

  it('destroy removes overlay from DOM and clears disposers', () => {
    const { ir } = makeResizer();
    ir.destroy();
    expect(ir._overlay).toBeNull();
    expect(ir._disposers.length).toBe(0);
  });
});

// ── _select / _deselect ───────────────────────────────────────────────────────

describe('ImageResizer._select', () => {
  it('shows overlay and marks image as selected', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 50, left: 100, width: 200, height: 150, bottom: 200, right: 300 });
    ir._select(img);
    expect(ir._activeImg).toBe(img);
    expect(img.classList.contains('an-image-selected')).toBe(true);
    expect(ir._overlay.style.display).toBe('block');
  });

  it('deselects previous image when a new one is selected', () => {
    const ctx = makeContext('<p><img src="a.png"><img src="b.png"></p>');
    const ir = new ImageResizer(ctx);
    ir.initialize();
    const [img1, img2] = ctx.layoutInfo.editable.querySelectorAll('img');
    [img1, img2].forEach(i => { i.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 }); });
    ir._select(img1);
    ir._select(img2);
    expect(img1.classList.contains('an-image-selected')).toBe(false);
    expect(img2.classList.contains('an-image-selected')).toBe(true);
  });
});

describe('ImageResizer._deselect', () => {
  it('removes selected class and hides overlay', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 50, left: 100, width: 200, height: 150, bottom: 200, right: 300 });
    ir._select(img);
    ir._deselect();
    expect(ir._activeImg).toBeNull();
    expect(img.classList.contains('an-image-selected')).toBe(false);
    expect(ir._overlay.style.display).toBe('none');
  });

  it('is safe to call when no image is selected', () => {
    const { ir } = makeResizer();
    expect(() => ir._deselect()).not.toThrow();
  });
});

// ── Public API ────────────────────────────────────────────────────────────────

describe('ImageResizer public API', () => {
  it('getActiveImage returns current selected image', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 });
    ir._select(img);
    expect(ir.getActiveImage()).toBe(img);
  });

  it('getActiveImage returns null when no image selected', () => {
    const { ir } = makeResizer();
    expect(ir.getActiveImage()).toBeNull();
  });

  it('deselect() deselects active image', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 });
    ir._select(img);
    ir.deselect();
    expect(ir._activeImg).toBeNull();
  });

  it('updateOverlay calls _updateOverlayPosition()', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 });
    ir._select(img);
    vi.spyOn(ir, '_updateOverlayPosition');
    ir.updateOverlay();
    expect(ir._updateOverlayPosition).toHaveBeenCalled();
  });
});

// ── Click handlers ────────────────────────────────────────────────────────────

describe('ImageResizer click handlers', () => {
  it('_onEditorClick selects clicked image', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 });
    const e = { target: img, preventDefault: vi.fn() };
    e.target.closest = (sel) => sel === 'img' ? img : null;
    ir._onEditorClick(e);
    expect(ir._activeImg).toBe(img);
  });

  it('_onEditorClick skips when container is disabled', () => {
    const { ir, ctx } = makeResizer();
    ctx.layoutInfo.container.classList.add('an-disabled');
    const img = ctx.layoutInfo.editable.querySelector('img');
    const e = { target: img, preventDefault: vi.fn() };
    ir._onEditorClick(e);
    expect(ir._activeImg).toBeNull();
    ctx.layoutInfo.container.classList.remove('an-disabled');
  });

  it('_onDocClick deselects when clicking outside selected image', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 });
    ir._select(img);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    ir._onDocClick({ target: outside });
    expect(ir._activeImg).toBeNull();
  });

  it('_onDocClick does not deselect when clicking overlay', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 });
    ir._select(img);
    const handle = ir._overlay.querySelector('[data-handle]');
    ir._onDocClick({ target: handle });
    expect(ir._activeImg).toBe(img); // still selected
  });

  it('_onDocClick does nothing when no active image', () => {
    const { ir } = makeResizer();
    expect(() => ir._onDocClick({ target: document.body })).not.toThrow();
    expect(ir._activeImg).toBeNull();
  });
});

// ── _updateOverlayPositionNow ────────────────────────────────────────────────

describe('ImageResizer._updateOverlayPositionNow', () => {
  it('does nothing when no activeImg', () => {
    const { ir } = makeResizer();
    expect(() => ir._updateOverlayPositionNow()).not.toThrow();
  });

  it('updates overlay position when image is selected', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 50, left: 100, width: 200, height: 150, bottom: 200, right: 300 });
    Object.defineProperty(ir._overlay, 'offsetParent', { value: document.body, configurable: true });
    document.body.getBoundingClientRect = () => ({ top: 0, left: 0, width: 800, height: 600 });
    ir._select(img);
    expect(() => ir._updateOverlayPositionNow()).not.toThrow();
  });
});

// ── _startResize ──────────────────────────────────────────────────────────────

describe('ImageResizer._startResize (drag)', () => {
  it('drag resize works without throwing', () => {
    const { ir, ctx } = makeResizer();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 50, left: 100, width: 200, height: 150, bottom: 200, right: 300 });
    ir._select(img);

    // Simulate handle mousedown → triggers _startResize
    const handle = ir._overlay.querySelector('[data-handle="se"]');
    expect(() => {
      handle.dispatchEvent(new MouseEvent('mousedown', { clientX: 300, clientY: 200, bubbles: true, cancelable: true }));
      // Move
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 350, clientY: 250, bubbles: true }));
      // Release
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    }).not.toThrow();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('_startResize does nothing when no active image', () => {
    const { ir } = makeResizer();
    ir._activeImg = null;
    expect(() => ir._startResize({ clientX: 0, clientY: 0 }, 'se')).not.toThrow();
  });
});
