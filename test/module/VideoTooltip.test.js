import { describe, it, expect, vi, afterEach } from 'vitest';
import { VideoTooltip } from '../../src/js/module/VideoTooltip.js';
import { en } from '../../src/js/i18n/en.js';

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
  vi.clearAllMocks();
});

const VIDEO_HTML = `
  <div class="an-video-wrapper" style="width:320px;height:180px">
    <iframe src="https://www.youtube.com/embed/test"></iframe>
    <div class="an-video-shield"></div>
  </div>
`;

function makeContext(html = VIDEO_HTML) {
  const container = document.createElement('div');
  const editable = document.createElement('div');
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
  const vt = new VideoTooltip(ctx);
  vt.initialize();
  return { ctx, vt };
}

function showWrapper(vt, ctx) {
  const wrapper = ctx.layoutInfo.editable.querySelector('.an-video-wrapper');
  wrapper.getBoundingClientRect = () => ({ top: 100, bottom: 280, left: 50, right: 370, width: 320, height: 180 });
  vt._activeWrapper = wrapper;
  vt._show(wrapper);
  return wrapper;
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

describe('VideoTooltip lifecycle', () => {
  it('creates .an-video-tooltip in body on initialize', () => {
    makeTooltip();
    expect(document.querySelector('.an-video-tooltip')).not.toBeNull();
  });

  it('tooltip is initially hidden', () => {
    const { vt } = makeTooltip();
    expect(vt._el.style.display).toBe('none');
  });

  it('destroy removes tooltip from DOM', () => {
    const { vt } = makeTooltip();
    vt.destroy();
    expect(document.querySelector('.an-video-tooltip')).toBeNull();
  });

  it('destroy clears disposers', () => {
    const { vt } = makeTooltip();
    vt.destroy();
    expect(vt._disposers.length).toBe(0);
    expect(vt._el).toBeNull();
  });
});

// ── _buildTooltip ─────────────────────────────────────────────────────────────

describe('VideoTooltip._buildTooltip', () => {
  it('creates float, center, delete, preview buttons', () => {
    const { vt } = makeTooltip();
    expect(vt._floatLeftBtn).not.toBeNull();
    expect(vt._floatNoneBtn).not.toBeNull();
    expect(vt._floatRightBtn).not.toBeNull();
    expect(vt._alignCenterBtn).not.toBeNull();
    expect(vt._deleteBtn).not.toBeNull();
    expect(vt._previewBtn).not.toBeNull();
  });

  it('delete button has danger class', () => {
    const { vt } = makeTooltip();
    expect(vt._deleteBtn.classList.contains('an-link-tooltip-btn--danger')).toBe(true);
  });
});

// ── _show / _hide ─────────────────────────────────────────────────────────────

describe('VideoTooltip._show', () => {
  it('sets display to flex', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    expect(vt._el.style.display).toBe('flex');
  });
});

describe('VideoTooltip._hide', () => {
  it('hides tooltip and clears activeWrapper', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._hide();
    expect(vt._el.style.display).toBe('none');
    expect(vt._activeWrapper).toBeNull();
  });

  it('exits preview mode on hide', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._previewMode = true;
    vi.spyOn(vt, '_exitPreview');
    vt._hide();
    expect(vt._exitPreview).toHaveBeenCalled();
  });
});

// ── Timers ────────────────────────────────────────────────────────────────────

describe('VideoTooltip._clearTimers', () => {
  it('clears showTimer and hideTimer', () => {
    vi.useFakeTimers();
    const { vt } = makeTooltip();
    vt._showTimer = setTimeout(() => {}, 500);
    vt._hideTimer = setTimeout(() => {}, 500);
    vt._clearTimers();
    expect(vt._showTimer).toBeNull();
    expect(vt._hideTimer).toBeNull();
  });
});

describe('VideoTooltip._scheduleShow', () => {
  it('shows after SHOW_DELAY (100ms)', () => {
    vi.useFakeTimers();
    const { vt, ctx } = makeTooltip();
    const wrapper = ctx.layoutInfo.editable.querySelector('.an-video-wrapper');
    wrapper.getBoundingClientRect = () => ({ top: 100, bottom: 280, left: 50, right: 370, width: 320, height: 180 });
    vt._scheduleShow(wrapper);
    expect(vt._el.style.display).toBe('none');
    vi.advanceTimersByTime(100);
    expect(vt._el.style.display).toBe('flex');
  });

  it('skips if same wrapper already visible', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    vi.spyOn(vt, '_show');
    vt._scheduleShow(wrapper);
    expect(vt._show).not.toHaveBeenCalled();
  });
});

describe('VideoTooltip._scheduleHide', () => {
  it('hides after HIDE_DELAY (180ms)', () => {
    vi.useFakeTimers();
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._scheduleHide();
    expect(vt._el.style.display).toBe('flex');
    vi.advanceTimersByTime(180);
    expect(vt._el.style.display).toBe('none');
  });

  it('does not hide when in preview mode', () => {
    vi.useFakeTimers();
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._previewMode = true;
    vt._scheduleHide();
    vi.advanceTimersByTime(500);
    expect(vt._el.style.display).toBe('flex'); // still visible
    vt._previewMode = false;
  });
});

// ── Actions ───────────────────────────────────────────────────────────────────

describe('VideoTooltip._setFloat', () => {
  it('sets float left on wrapper', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    vt._setFloat('left');
    expect(wrapper.style.float).toBe('left');
    expect(wrapper.style.marginRight).toBe('12px');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('sets float right on wrapper', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    vt._setFloat('right');
    expect(wrapper.style.float).toBe('right');
    expect(wrapper.style.marginLeft).toBe('12px');
  });

  it('clears float when value is empty', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    wrapper.style.float = 'left';
    vt._setFloat('');
    expect(wrapper.style.float).toBe('');
    expect(wrapper.style.display).toBe('');
  });

  it('does nothing when no activeWrapper', () => {
    const { vt, ctx } = makeTooltip();
    vt._activeWrapper = null;
    vt._setFloat('left');
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

describe('VideoTooltip._setCenter', () => {
  it('centers wrapper with auto margins', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    vt._setCenter();
    expect(wrapper.style.marginLeft).toBe('auto');
    expect(wrapper.style.marginRight).toBe('auto');
    expect(wrapper.style.display).toBe('block');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no activeWrapper', () => {
    const { vt, ctx } = makeTooltip();
    vt._activeWrapper = null;
    vt._setCenter();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

describe('VideoTooltip._resetSize', () => {
  it('clears wrapper and embed size attributes', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    const iframe = wrapper.querySelector('iframe');
    iframe.setAttribute('width', '640');
    iframe.setAttribute('height', '360');
    vt._resetSize();
    expect(iframe.getAttribute('width')).toBeNull();
    expect(iframe.getAttribute('height')).toBeNull();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no activeWrapper', () => {
    const { vt, ctx } = makeTooltip();
    vt._activeWrapper = null;
    vt._resetSize();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

describe('VideoTooltip._delete', () => {
  it('removes wrapper from DOM', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    expect(ctx.layoutInfo.editable.contains(wrapper)).toBe(true);
    vt._delete();
    expect(ctx.layoutInfo.editable.contains(wrapper)).toBe(false);
  });

  it('invokes editor.afterCommand after delete', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._delete();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no activeWrapper', () => {
    const { vt, ctx } = makeTooltip();
    vt._activeWrapper = null;
    vt._delete();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

// ── Preview ───────────────────────────────────────────────────────────────────

describe('VideoTooltip preview mode', () => {
  it('_enterPreview hides shield and sets _previewMode=true', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    const shield = wrapper.querySelector('.an-video-shield');
    vt._enterPreview();
    expect(vt._previewMode).toBe(true);
    expect(shield.style.display).toBe('none');
  });

  it('_exitPreview restores shield and sets _previewMode=false', () => {
    const { vt, ctx } = makeTooltip();
    const wrapper = showWrapper(vt, ctx);
    const shield = wrapper.querySelector('.an-video-shield');
    vt._enterPreview();
    vt._exitPreview();
    expect(vt._previewMode).toBe(false);
    expect(shield.style.display).toBe('');
  });

  it('_togglePreview toggles between enter and exit', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vi.spyOn(vt, '_enterPreview');
    vi.spyOn(vt, '_exitPreview');
    vt._togglePreview();
    expect(vt._enterPreview).toHaveBeenCalled();
    vt._togglePreview();
    expect(vt._exitPreview).toHaveBeenCalled();
  });

  it('_enterPreview adds active class to preview button', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._enterPreview();
    expect(vt._previewBtn.classList.contains('an-link-tooltip-btn--copied')).toBe(true);
  });

  it('_exitPreview removes active class from preview button', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._enterPreview();
    vt._exitPreview();
    expect(vt._previewBtn.classList.contains('an-link-tooltip-btn--copied')).toBe(false);
  });

  it('destroy calls _exitPreview when in preview mode', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._previewMode = true;
    vi.spyOn(vt, '_exitPreview');
    vt.destroy();
    expect(vt._exitPreview).toHaveBeenCalled();
  });

  it('mousedown outside wrapper exits preview via _previewClickOff', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vt._enterPreview();
    expect(vt._previewMode).toBe(true);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    expect(vt._previewMode).toBe(false);
  });
});

// ── Button click handler ──────────────────────────────────────────────────────

describe('VideoTooltip button click handlers', () => {
  it('clicking the delete button fires _delete', () => {
    const { vt, ctx } = makeTooltip();
    showWrapper(vt, ctx);
    vi.spyOn(vt, '_delete');
    const deleteBtn = vt._el.querySelector('.an-link-tooltip-btn--danger');
    if (deleteBtn) {
      deleteBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(vt._delete).toHaveBeenCalled();
    }
  });
});
