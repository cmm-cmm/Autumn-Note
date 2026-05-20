import { describe, it, expect, vi, afterEach } from 'vitest';
import { ImageTooltip } from '../../src/js/module/ImageTooltip.js';
import { en } from '../../src/js/i18n/en.js';

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
}

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.useRealTimers();
  vi.clearAllMocks();
});

const IMG_HTML = '<figure class="an-figure"><img src="https://example.com/photo.jpg" alt="photo" style="width:320px;height:240px"><figcaption class="an-figcaption">Caption</figcaption></figure>';

function makeContext(html = IMG_HTML) {
  const container = document.createElement('div');
  const editable  = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    locale: en,
    layoutInfo: { container, editable },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
}

function makeTooltip(html) {
  const ctx = makeContext(html);
  const it2 = new ImageTooltip(ctx);
  it2.initialize();
  return { ctx, it2 };
}

function showImg(it2, ctx) {
  const img = ctx.layoutInfo.editable.querySelector('img');
  img.getBoundingClientRect = () => ({ top: 50, bottom: 290, left: 40, right: 360, width: 320, height: 240 });
  it2._activeImg = img;
  it2._show(img);
  return img;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('ImageTooltip lifecycle', () => {
  it('creates .an-image-tooltip in body on initialize', () => {
    makeTooltip();
    expect(document.querySelector('.an-image-tooltip')).not.toBeNull();
  });

  it('tooltip is initially hidden', () => {
    const { it2 } = makeTooltip();
    expect(it2._el.style.display).toBe('none');
  });

  it('destroy removes tooltip from DOM', () => {
    const { it2 } = makeTooltip();
    it2.destroy();
    expect(document.querySelector('.an-image-tooltip')).toBeNull();
  });

  it('destroy clears disposers', () => {
    const { it2 } = makeTooltip();
    it2.destroy();
    expect(it2._disposers.length).toBe(0);
    expect(it2._el).toBeNull();
  });
});

// ── _buildTooltip ─────────────────────────────────────────────────────────────

describe('ImageTooltip._buildTooltip', () => {
  it('creates float, align, crop, delete buttons', () => {
    const { it2 } = makeTooltip();
    expect(it2._floatLeftBtn).not.toBeNull();
    expect(it2._floatNoneBtn).not.toBeNull();
    expect(it2._floatRightBtn).not.toBeNull();
    expect(it2._alignCenterBtn).not.toBeNull();
    expect(it2._cropBtn).not.toBeNull();
    expect(it2._deleteBtn).not.toBeNull();
  });

  it('delete button has danger class', () => {
    const { it2 } = makeTooltip();
    expect(it2._deleteBtn.classList.contains('an-link-tooltip-btn--danger')).toBe(true);
  });

  it('tooltip has role=toolbar', () => {
    const { it2 } = makeTooltip();
    expect(it2._el.getAttribute('role')).toBe('toolbar');
  });
});

// ── _show / _hide ─────────────────────────────────────────────────────────────

describe('ImageTooltip._show', () => {
  it('shows tooltip (display = flex)', () => {
    const { it2, ctx } = makeTooltip();
    showImg(it2, ctx);
    expect(it2._el.style.display).toBe('flex');
  });

  it('shows tooltip even when read-only (mouseover is gated earlier)', () => {
    const { it2, ctx } = makeTooltip();
    ctx.layoutInfo.container.classList.add('an-disabled');
    showImg(it2, ctx);
    // _show() displays the tooltip; mouseover gating in initialize() blocks hover
    expect(it2._el.style.display).toBe('flex');
    ctx.layoutInfo.container.classList.remove('an-disabled');
  });
});

describe('ImageTooltip._hide', () => {
  it('hides tooltip and clears activeImg', () => {
    const { it2, ctx } = makeTooltip();
    showImg(it2, ctx);
    it2._hide();
    expect(it2._el.style.display).toBe('none');
    expect(it2._activeImg).toBeNull();
  });
});

// ── Timers ────────────────────────────────────────────────────────────────────

describe('ImageTooltip timer management', () => {
  it('_clearTimers nullifies show and hide timers', () => {
    vi.useFakeTimers();
    const { it2 } = makeTooltip();
    it2._showTimer = setTimeout(() => {}, 500);
    it2._hideTimer = setTimeout(() => {}, 500);
    it2._clearTimers();
    expect(it2._showTimer).toBeNull();
    expect(it2._hideTimer).toBeNull();
  });

  it('_scheduleShow shows after delay', () => {
    vi.useFakeTimers();
    const { it2, ctx } = makeTooltip();
    const img = ctx.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({ top: 50, bottom: 290, left: 40, right: 360, width: 320, height: 240 });
    it2._scheduleShow(img);
    expect(it2._el.style.display).toBe('none');
    vi.advanceTimersByTime(200);
    expect(it2._el.style.display).toBe('flex');
  });

  it('_scheduleHide hides after delay', () => {
    vi.useFakeTimers();
    const { it2, ctx } = makeTooltip();
    showImg(it2, ctx);
    it2._scheduleHide();
    vi.advanceTimersByTime(300);
    expect(it2._el.style.display).toBe('none');
  });

  it('_scheduleShow skips if same img already visible', () => {
    const { it2, ctx } = makeTooltip();
    const img = showImg(it2, ctx);
    vi.spyOn(it2, '_show');
    it2._scheduleShow(img);
    expect(it2._show).not.toHaveBeenCalled();
  });
});

// ── Actions ───────────────────────────────────────────────────────────────────

describe('ImageTooltip._setFloat', () => {
  it('sets float left on figure wrapper', () => {
    const { it2, ctx } = makeTooltip();
    const img = showImg(it2, ctx);
    const figure = img.closest('figure') || img.parentElement;
    it2._setFloat('left');
    expect(figure.style.float).toBe('left');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('sets float right on figure wrapper', () => {
    const { it2, ctx } = makeTooltip();
    const img = showImg(it2, ctx);
    const figure = img.closest('figure') || img.parentElement;
    it2._setFloat('right');
    expect(figure.style.float).toBe('right');
  });

  it('clears float', () => {
    const { it2, ctx } = makeTooltip();
    const img = showImg(it2, ctx);
    const figure = img.closest('figure') || img.parentElement;
    figure.style.float = 'left';
    it2._setFloat('');
    expect(figure.style.float).toBe('');
  });

  it('does nothing when no activeImg', () => {
    const { it2, ctx } = makeTooltip();
    it2._activeImg = null;
    it2._setFloat('left');
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

describe('ImageTooltip._setCenter', () => {
  it('centers the image wrapper', () => {
    const { it2, ctx } = makeTooltip();
    const img = showImg(it2, ctx);
    const figure = img.closest('figure') || img.parentElement;
    it2._setCenter();
    expect(figure.style.marginLeft).toBe('auto');
    expect(figure.style.marginRight).toBe('auto');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no activeImg', () => {
    const { it2, ctx } = makeTooltip();
    it2._activeImg = null;
    it2._setCenter();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

describe('ImageTooltip._delete', () => {
  it('removes the figure from DOM', () => {
    const { it2, ctx } = makeTooltip();
    const img = showImg(it2, ctx);
    const figure = img.closest('.an-figure') || img.parentElement;
    const editable = ctx.layoutInfo.editable;
    expect(editable.contains(figure)).toBe(true);
    it2._delete();
    expect(editable.contains(figure)).toBe(false);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no activeImg', () => {
    const { it2, ctx } = makeTooltip();
    it2._activeImg = null;
    it2._delete();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

describe('ImageTooltip._crop', () => {
  it('invokes imageCropOverlay.open with the active image', () => {
    const { it2, ctx } = makeTooltip();
    const img = showImg(it2, ctx);
    it2._crop();
    expect(ctx.invoke).toHaveBeenCalledWith('imageCropOverlay.open', img);
  });

  it('does nothing when no activeImg', () => {
    const { it2, ctx } = makeTooltip();
    it2._activeImg = null;
    it2._crop();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});
