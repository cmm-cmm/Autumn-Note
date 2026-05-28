import { describe, it, expect, vi, afterEach } from 'vitest';
import { VideoDialog } from '../../src/js/module/VideoDialog.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.restoreAllMocks();
});

const makeContext = () => {
  const container = document.createElement('div');
  const editable  = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = '<p>hello</p>';
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    locale: en,
    options: {},
    layoutInfo: { container, editable },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
};

const makeDialog = () => {
  const ctx = makeContext();
  const vd = new VideoDialog(ctx);
  vd.initialize();
  return { ctx, vd };
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('VideoDialog lifecycle', () => {
  it('initialize builds and appends dialog to body', () => {
    makeDialog();
    expect(document.querySelector('.an-dialog-overlay')).not.toBeNull();
  });

  it('dialog is not visible before show() is called', () => {
    const { vd } = makeDialog();
    expect(vd._dialog.style.display).not.toBe('flex');
  });

  it('destroy removes dialog from DOM and clears disposers', () => {
    const { vd } = makeDialog();
    vd.destroy();
    expect(document.querySelector('.an-dialog-overlay')).toBeNull();
    expect(vd._dialog).toBeNull();
    expect(vd._disposers.length).toBe(0);
  });

  it('show() opens dialog (display: flex)', () => {
    const { vd } = makeDialog();
    vd.show();
    expect(vd._dialog.style.display).toBe('flex');
  });

  it('show() resets URL input and width to defaults', () => {
    const { vd } = makeDialog();
    vd._urlInput.value = 'old-url';
    vd._widthInput.value = '999';
    vd.show();
    expect(vd._urlInput.value).toBe('');
    expect(vd._widthInput.value).toBe('560');
  });

  it('cancel button closes dialog', () => {
    const { vd } = makeDialog();
    vd.show();
    const cancelBtn = vd._dialog.querySelector('.an-btn:not(.an-btn-primary)');
    cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(vd._dialog.style.display).toBe('none');
  });

  it('clicking overlay backdrop closes dialog', () => {
    const { vd } = makeDialog();
    vd.show();
    const e = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(e, 'target', { value: vd._dialog, configurable: true });
    vd._dialog.dispatchEvent(e);
    expect(vd._dialog.style.display).toBe('none');
  });

  it('_close clears savedRange and removeTrap', () => {
    const { vd } = makeDialog();
    vd._savedRange = { select: vi.fn() };
    vd._removeTrap = vi.fn();
    vd._close();
    expect(vd._savedRange).toBeNull();
  });
});

// ── _parseVideoUrl ────────────────────────────────────────────────────────────

describe('VideoDialog._parseVideoUrl', () => {
  it('returns null for empty string', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('')).toBeNull();
  });

  it('returns null for invalid (non-URL) string', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('not-a-url')).toBeNull();
  });

  it('returns null for javascript: protocol', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('javascript:alert(1)')).toBeNull();
  });

  it('returns null for vbscript: protocol', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('vbscript:msgbox(1)')).toBeNull();
  });

  it('parses YouTube watch URL', () => {
    const { vd } = makeDialog();
    const result = vd._parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result.type).toBe('YouTube');
    expect(result.embedUrl).toContain('embed/dQw4w9WgXcQ');
  });

  it('parses YouTube watch URL with extra query params', () => {
    const { vd } = makeDialog();
    const result = vd._parseVideoUrl('https://www.youtube.com/watch?t=30&v=dQw4w9WgXcQ&list=PL');
    expect(result.type).toBe('YouTube');
    expect(result.embedUrl).toContain('dQw4w9WgXcQ');
  });

  it('parses YouTube embed URL directly', () => {
    const { vd } = makeDialog();
    const result = vd._parseVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(result.type).toBe('YouTube');
  });

  it('parses YouTube short link (youtu.be)', () => {
    const { vd } = makeDialog();
    const result = vd._parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result.type).toBe('YouTube');
    expect(result.embedUrl).toContain('embed/dQw4w9WgXcQ');
  });

  it('parses YouTube Shorts URL', () => {
    const { vd } = makeDialog();
    const result = vd._parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    expect(result).not.toBeNull();
    expect(result.type).toBe('YouTube Shorts');
    expect(result.embedUrl).toContain('embed/dQw4w9WgXcQ');
  });

  it('parses Vimeo URL', () => {
    const { vd } = makeDialog();
    const result = vd._parseVideoUrl('https://vimeo.com/123456789');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Vimeo');
    expect(result.embedUrl).toContain('player.vimeo.com/video/123456789');
  });

  it('parses .mp4 direct video URL', () => {
    const { vd } = makeDialog();
    const result = vd._parseVideoUrl('https://example.com/video.mp4');
    expect(result).not.toBeNull();
    expect(result.type).toBe('Direct video');
  });

  it('parses .webm direct video URL', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('https://example.com/v.webm').type).toBe('Direct video');
  });

  it('parses .ogg direct video URL', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('https://example.com/v.ogg').type).toBe('Direct video');
  });

  it('parses .ogv direct video URL', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('https://example.com/v.ogv').type).toBe('Direct video');
  });

  it('parses .mov direct video URL', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('https://example.com/v.mov').type).toBe('Direct video');
  });

  it('parses direct video URL with query string', () => {
    const { vd } = makeDialog();
    const result = vd._parseVideoUrl('https://example.com/video.mp4?token=abc');
    expect(result.type).toBe('Direct video');
  });

  it('returns null for unknown safe URL', () => {
    const { vd } = makeDialog();
    expect(vd._parseVideoUrl('https://example.com/notavideo')).toBeNull();
  });
});

// ── _buildEmbedHtml ───────────────────────────────────────────────────────────

describe('VideoDialog._buildEmbedHtml', () => {
  it('builds valid YouTube iframe HTML without NaN artifacts', () => {
    const { vd } = makeDialog();
    const html = vd._buildEmbedHtml('https://www.youtube.com/watch?v=abcdefghijk', 560);
    expect(html).toContain('<iframe');
    expect(html).toContain('src="https://www.youtube.com/embed/abcdefghijk"');
    expect(html).toContain('width="560"');
    expect(html).toContain('height="315"');
    expect(html).not.toContain('NaN');
    expect(html).toContain('an-video-wrapper');
    expect(html).toContain('an-video-shield');
  });

  it('builds Vimeo iframe HTML', () => {
    const { vd } = makeDialog();
    const html = vd._buildEmbedHtml('https://vimeo.com/123456', 480);
    expect(html).toContain('iframe');
    expect(html).toContain('player.vimeo.com');
    expect(html).toContain('480');
  });

  it('builds YouTube Shorts iframe HTML', () => {
    const { vd } = makeDialog();
    const html = vd._buildEmbedHtml('https://www.youtube.com/shorts/dQw4w9WgXcQ', 320);
    expect(html).toContain('iframe');
    expect(html).toContain('YouTube Shorts video player');
  });

  it('builds video element for direct mp4 URL', () => {
    const { vd } = makeDialog();
    const html = vd._buildEmbedHtml('https://example.com/video.mp4', 640);
    expect(html).toContain('<video');
    expect(html).toContain('controls');
    expect(html).toContain('640');
  });

  it('builds video element for unknown safe URL (fallback path)', () => {
    const { vd } = makeDialog();
    const html = vd._buildEmbedHtml('https://example.com/media-stream', 400);
    expect(html).toContain('<video');
    expect(html).toContain('https://example.com/media-stream');
  });

  it('returns null for javascript: URL', () => {
    const { vd } = makeDialog();
    expect(vd._buildEmbedHtml('javascript:alert(1)', 560)).toBeNull();
  });

  it('applies 16:9 aspect ratio', () => {
    const { vd } = makeDialog();
    const html = vd._buildEmbedHtml('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 160);
    expect(html).toContain('height="90"');
  });

  it('escapes double quotes in direct video src', () => {
    const { vd } = makeDialog();
    const html = vd._buildEmbedHtml('https://example.com/video.mp4?foo="bar"', 560);
    expect(html).not.toContain('"bar"');
    expect(html).toContain('%22');
  });
});

// ── _onInsert ─────────────────────────────────────────────────────────────────

describe('VideoDialog._onInsert', () => {
  it('does nothing when URL field is empty', () => {
    const { vd, ctx } = makeDialog();
    vd._urlInput.value = '';
    vd._onInsert();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('shows invalidUrl hint for javascript: URL', () => {
    const { vd } = makeDialog();
    vd._urlInput.value = 'javascript:alert(1)';
    vd._onInsert();
    expect(vd._hintEl.textContent).toBeTruthy();
  });

  it('inserts YouTube video and closes dialog', () => {
    const { vd, ctx } = makeDialog();
    vd.show();
    vd._urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    vd._widthInput.value = '560';
    vd._onInsert();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertVideo', expect.stringContaining('iframe'));
    expect(vd._dialog.style.display).toBe('none');
  });

  it('inserts direct mp4 video', () => {
    const { vd, ctx } = makeDialog();
    vd.show();
    vd._urlInput.value = 'https://example.com/clip.mp4';
    vd._onInsert();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertVideo', expect.stringContaining('video'));
  });

  it('uses minimum width of 80 when width is below minimum', () => {
    const { vd, ctx } = makeDialog();
    vd.show();
    vd._urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    vd._widthInput.value = '20';
    vd._onInsert();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertVideo', expect.stringContaining('width="80"'));
  });

  it('Enter key in URL input triggers insert', () => {
    const { vd, ctx } = makeDialog();
    vd.show();
    vd._urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    vd._urlInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.insertVideo', expect.any(String));
  });

  it('calls savedRange.select() before inserting', () => {
    const { vd } = makeDialog();
    vd.show();
    const selectFn = vi.fn();
    vd._savedRange = { select: selectFn };
    vd._urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    vd._onInsert();
    expect(selectFn).toHaveBeenCalled();
  });
});

// ── Live URL hint ─────────────────────────────────────────────────────────────

describe('VideoDialog URL input live hint', () => {
  it('shows detected type hint for recognised YouTube URL', () => {
    const { vd } = makeDialog();
    vd.show();
    vd._urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    vd._urlInput.dispatchEvent(new Event('input'));
    expect(vd._hintEl.textContent).toBeTruthy();
  });

  it('shows unknownFormat hint for unrecognised URL', () => {
    const { vd } = makeDialog();
    vd.show();
    vd._urlInput.value = 'https://example.com/page';
    vd._urlInput.dispatchEvent(new Event('input'));
    expect(vd._hintEl.textContent).toBeTruthy();
  });

  it('clears hint when URL input is empty', () => {
    const { vd } = makeDialog();
    vd.show();
    vd._urlInput.value = '';
    vd._urlInput.dispatchEvent(new Event('input'));
    expect(vd._hintEl.textContent).toBe('');
  });
});
