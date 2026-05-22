import { describe, it, expect, vi, afterEach } from 'vitest';
import { VideoResizer } from '../../src/js/module/VideoResizer.js';

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

const VIDEO_HTML = `
  <div class="an-video-wrapper">
    <iframe src="https://www.youtube.com/embed/test"></iframe>
    <div class="an-video-shield"></div>
  </div>`;

function makeContext(html = VIDEO_HTML) {
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
  const vr = new VideoResizer(ctx);
  vr.initialize();
  return { ctx, vr };
}

function getWrapper(ctx) {
  const wrapper = ctx.layoutInfo.editable.querySelector('.an-video-wrapper');
  wrapper.getBoundingClientRect = () => ({ top: 50, left: 100, width: 320, height: 180, bottom: 230, right: 420 });
  return wrapper;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('VideoResizer lifecycle', () => {
  it('initialize creates .an-video-resizer overlay', () => {
    const { vr } = makeResizer();
    expect(vr._overlay).not.toBeNull();
    expect(vr._overlay.classList.contains('an-video-resizer')).toBe(true);
  });

  it('overlay is initially hidden', () => {
    const { vr } = makeResizer();
    expect(vr._overlay.style.display).toBe('none');
  });

  it('overlay has 8 resize handles', () => {
    const { vr } = makeResizer();
    expect(vr._overlay.querySelectorAll('[data-handle]').length).toBe(8);
  });

  it('destroy removes overlay and clears disposers', () => {
    const { vr } = makeResizer();
    vr.destroy();
    expect(vr._overlay).toBeNull();
    expect(vr._disposers.length).toBe(0);
  });
});

// ── _select / _deselect ───────────────────────────────────────────────────────

describe('VideoResizer._select', () => {
  it('shows overlay when wrapper is selected', () => {
    const { vr, ctx } = makeResizer();
    const wrapper = getWrapper(ctx);
    vr._select(wrapper);
    expect(vr._activeWrapper).toBe(wrapper);
    expect(vr._overlay.style.display).toBe('block');
  });

  it('deselects previous wrapper when a new one is selected', () => {
    const html = `
      <div class="an-video-wrapper"><iframe></iframe></div>
      <div class="an-video-wrapper"><iframe></iframe></div>`;
    const ctx = makeContext(html);
    const vr = new VideoResizer(ctx);
    vr.initialize();
    const wrappers = ctx.layoutInfo.editable.querySelectorAll('.an-video-wrapper');
    [wrappers[0], wrappers[1]].forEach(w => { w.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 }); });
    vr._select(wrappers[0]);
    vr._select(wrappers[1]);
    expect(vr._activeWrapper).toBe(wrappers[1]);
  });
});

describe('VideoResizer._deselect', () => {
  it('hides overlay when deselected', () => {
    const { vr, ctx } = makeResizer();
    vr._select(getWrapper(ctx));
    vr._deselect();
    expect(vr._activeWrapper).toBeNull();
    expect(vr._overlay.style.display).toBe('none');
  });

  it('is safe to call when nothing is selected', () => {
    const { vr } = makeResizer();
    expect(() => vr._deselect()).not.toThrow();
  });
});

// ── Public API ────────────────────────────────────────────────────────────────

describe('VideoResizer public API', () => {
  it('getActiveWrapper returns selected wrapper', () => {
    const { vr, ctx } = makeResizer();
    const wrapper = getWrapper(ctx);
    vr._select(wrapper);
    expect(vr.getActiveWrapper()).toBe(wrapper);
  });

  it('getActiveWrapper returns null when nothing selected', () => {
    const { vr } = makeResizer();
    expect(vr.getActiveWrapper()).toBeNull();
  });

  it('deselect() deselects active wrapper', () => {
    const { vr, ctx } = makeResizer();
    vr._select(getWrapper(ctx));
    vr.deselect();
    expect(vr._activeWrapper).toBeNull();
  });

  it('updateOverlay calls _updateOverlayPosition', () => {
    const { vr, ctx } = makeResizer();
    vr._select(getWrapper(ctx));
    vi.spyOn(vr, '_updateOverlayPosition');
    vr.updateOverlay();
    expect(vr._updateOverlayPosition).toHaveBeenCalled();
  });
});

// ── _findWrapper ──────────────────────────────────────────────────────────────

describe('VideoResizer._findWrapper', () => {
  it('finds .an-video-wrapper from a child element', () => {
    const { vr, ctx } = makeResizer();
    const shield = ctx.layoutInfo.editable.querySelector('.an-video-shield');
    const result = vr._findWrapper(shield);
    expect(result).not.toBeNull();
    expect(result.classList.contains('an-video-wrapper')).toBe(true);
  });

  it('returns null when element is not inside .an-video-wrapper', () => {
    const { vr, ctx } = makeResizer();
    const p = document.createElement('p');
    ctx.layoutInfo.editable.appendChild(p);
    expect(vr._findWrapper(p)).toBeNull();
  });
});

// ── Click handlers ────────────────────────────────────────────────────────────

describe('VideoResizer click handlers', () => {
  it('_onEditorClick selects clicked video wrapper', () => {
    const { vr, ctx } = makeResizer();
    const wrapper = getWrapper(ctx);
    const shield = wrapper.querySelector('.an-video-shield');
    const e = { target: shield, preventDefault: vi.fn() };
    vr._onEditorClick(e);
    expect(vr._activeWrapper).toBe(wrapper);
  });

  it('_onDocClick deselects when clicking outside', () => {
    const { vr, ctx } = makeResizer();
    vr._select(getWrapper(ctx));
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    vr._onDocClick({ target: outside });
    expect(vr._activeWrapper).toBeNull();
  });

  it('_onDocClick does not deselect when clicking overlay', () => {
    const { vr, ctx } = makeResizer();
    vr._select(getWrapper(ctx));
    const handle = vr._overlay.querySelector('[data-handle]');
    vr._onDocClick({ target: handle });
    expect(vr._activeWrapper).not.toBeNull();
  });

  it('_onDocClick does nothing when nothing selected', () => {
    const { vr } = makeResizer();
    expect(() => vr._onDocClick({ target: document.body })).not.toThrow();
  });
});

// ── _updateOverlayPositionNow ────────────────────────────────────────────────

describe('VideoResizer._updateOverlayPositionNow', () => {
  it('does nothing when no activeWrapper', () => {
    const { vr } = makeResizer();
    expect(() => vr._updateOverlayPositionNow()).not.toThrow();
  });

  it('updates overlay position when wrapper is selected', () => {
    const { vr, ctx } = makeResizer();
    const wrapper = getWrapper(ctx);
    Object.defineProperty(vr._overlay, 'offsetParent', { value: document.body, configurable: true });
    document.body.getBoundingClientRect = () => ({ top: 0, left: 0, width: 800, height: 600 });
    vr._select(wrapper);
    expect(() => vr._updateOverlayPositionNow()).not.toThrow();
  });
});

// ── _startResize ──────────────────────────────────────────────────────────────

describe('VideoResizer._startResize (drag)', () => {
  it('drag resize works without throwing', () => {
    const { vr, ctx } = makeResizer();
    const wrapper = getWrapper(ctx);
    vr._select(wrapper);

    // Simulate handle mousedown → triggers _startResize
    const handle = vr._overlay.querySelector('[data-handle="se"]');
    expect(() => {
      handle.dispatchEvent(new MouseEvent('mousedown', { clientX: 420, clientY: 230, bubbles: true, cancelable: true }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 470, clientY: 280, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    }).not.toThrow();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('_startResize does nothing when no active wrapper', () => {
    const { vr } = makeResizer();
    vr._activeWrapper = null;
    expect(() => vr._startResize({ clientX: 0, clientY: 0 }, 'se')).not.toThrow();
  });
});
