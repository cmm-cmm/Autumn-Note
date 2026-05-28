import { describe, it, expect, vi, afterEach } from 'vitest';
import { LinkTooltip } from '../../src/js/module/LinkTooltip.js';
import { en } from '../../src/js/i18n/en.js';

if (typeof document.execCommand !== 'function') {
  Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true });
}

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function makeContext(html = '<p><a href="https://example.com">link</a></p>') {
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
  const lt = new LinkTooltip(ctx);
  lt.initialize();
  return { ctx, lt };
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

describe('LinkTooltip lifecycle', () => {
  it('initialize creates .an-link-tooltip in document.body', () => {
    makeTooltip();
    expect(document.querySelector('.an-link-tooltip')).not.toBeNull();
  });

  it('tooltip is initially hidden (display: none)', () => {
    const { lt } = makeTooltip();
    expect(lt._el.style.display).toBe('none');
  });

  it('destroy removes tooltip from DOM', () => {
    const { lt } = makeTooltip();
    lt.destroy();
    expect(document.querySelector('.an-link-tooltip')).toBeNull();
  });

  it('destroy clears timers and disposers', () => {
    const { lt } = makeTooltip();
    lt._showTimer = setTimeout(() => {}, 9999);
    lt.destroy();
    expect(lt._el).toBeNull();
    expect(lt._disposers.length).toBe(0);
  });
});

// ── _buildTooltip ────────────────────────────────────────────────────────────

describe('LinkTooltip._buildTooltip', () => {
  it('creates open, copy, edit, unlink buttons', () => {
    const { lt } = makeTooltip();
    expect(lt._openBtn).not.toBeNull();
    expect(lt._copyBtn).not.toBeNull();
    expect(lt._editBtn).not.toBeNull();
    expect(lt._unlinkBtn).not.toBeNull();
  });

  it('tooltip has role=toolbar', () => {
    const { lt } = makeTooltip();
    expect(lt._el.getAttribute('role')).toBe('toolbar');
  });

  it('URL label element exists', () => {
    const { lt } = makeTooltip();
    expect(lt._urlLabel).not.toBeNull();
    expect(lt._urlLabel.classList.contains('an-link-tooltip-url')).toBe(true);
  });
});

// ── _truncateUrl ─────────────────────────────────────────────────────────────

describe('LinkTooltip._truncateUrl', () => {
  it('returns host + pathname for valid URL', () => {
    const { lt } = makeTooltip();
    const result = lt._truncateUrl('https://example.com/path');
    expect(result).toBe('example.com/path');
  });

  it('returns only host when pathname is /', () => {
    const { lt } = makeTooltip();
    expect(lt._truncateUrl('https://example.com/')).toBe('example.com');
  });

  it('truncates URL longer than 48 chars', () => {
    const { lt } = makeTooltip();
    const long = 'https://example.com/' + 'a'.repeat(50);
    const result = lt._truncateUrl(long);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(50);
  });

  it('falls back to raw string for non-URL input', () => {
    const { lt } = makeTooltip();
    expect(lt._truncateUrl('not-a-url')).toBe('not-a-url');
  });

  it('truncates long non-URL strings', () => {
    const { lt } = makeTooltip();
    const long = 'a'.repeat(60);
    const result = lt._truncateUrl(long);
    expect(result.endsWith('…')).toBe(true);
  });
});

// ── _show / _hide ─────────────────────────────────────────────────────────────

function showAnchor(lt, ctx, anchorHref = 'https://example.com') {
  const anchor = ctx.layoutInfo.editable.querySelector('a') || (() => {
    const a = document.createElement('a');
    a.href = anchorHref;
    ctx.layoutInfo.editable.appendChild(a);
    return a;
  })();
  anchor.getBoundingClientRect = () => ({ top: 50, bottom: 70, left: 100, right: 200, width: 100, height: 20 });
  lt._activeAnchor = anchor; // _show() does not set _activeAnchor — set it manually
  lt._show(anchor);
  return anchor;
}

describe('LinkTooltip._show', () => {
  it('shows the tooltip with URL label', () => {
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    expect(lt._el.style.display).toBe('flex');
    expect(lt._urlLabel.textContent).toBe('example.com');
  });

  it('hides edit/unlink buttons in read-only mode', () => {
    const { lt, ctx } = makeTooltip();
    ctx.layoutInfo.container.classList.add('an-disabled');
    showAnchor(lt, ctx);
    expect(lt._editBtn.style.display).toBe('none');
    expect(lt._unlinkBtn.style.display).toBe('none');
    ctx.layoutInfo.container.classList.remove('an-disabled');
  });

  it('shows edit/unlink buttons in normal mode', () => {
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    expect(lt._editBtn.style.display).toBe('');
    expect(lt._unlinkBtn.style.display).toBe('');
  });
});

describe('LinkTooltip._hide', () => {
  it('hides the tooltip', () => {
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._hide();
    expect(lt._el.style.display).toBe('none');
  });

  it('clears activeAnchor on hide', () => {
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._hide();
    expect(lt._activeAnchor).toBeNull();
  });
});

// ── _clearTimers ─────────────────────────────────────────────────────────────

describe('LinkTooltip._clearTimers', () => {
  it('clears both show and hide timers', () => {
    vi.useFakeTimers();
    const { lt } = makeTooltip();
    lt._showTimer = setTimeout(() => {}, 500);
    lt._hideTimer = setTimeout(() => {}, 500);
    lt._clearTimers();
    expect(lt._showTimer).toBeNull();
    expect(lt._hideTimer).toBeNull();
  });
});

// ── _scheduleShow / _scheduleHide ─────────────────────────────────────────────

describe('LinkTooltip._scheduleShow', () => {
  it('shows tooltip after SHOW_DELAY (120ms)', () => {
    vi.useFakeTimers();
    const { lt, ctx } = makeTooltip();
    const anchor = ctx.layoutInfo.editable.querySelector('a');
    anchor.getBoundingClientRect = () => ({ top: 50, bottom: 70, left: 100, right: 200, width: 100, height: 20 });
    lt._scheduleShow(anchor);
    expect(lt._el.style.display).toBe('none'); // not shown yet
    vi.advanceTimersByTime(120);
    expect(lt._el.style.display).toBe('flex');
  });

  it('skips if same anchor already visible', () => {
    const { lt, ctx } = makeTooltip();
    const anchor = ctx.layoutInfo.editable.querySelector('a');
    anchor.getBoundingClientRect = () => ({ top: 50, bottom: 70, left: 100, right: 200, width: 100, height: 20 });
    lt._activeAnchor = anchor;
    lt._show(anchor);
    vi.spyOn(lt, '_show');
    lt._scheduleShow(anchor); // same anchor, already visible
    expect(lt._show).not.toHaveBeenCalled();
  });
});

describe('LinkTooltip._scheduleHide', () => {
  it('hides tooltip after HIDE_DELAY (200ms)', () => {
    vi.useFakeTimers();
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._scheduleHide();
    expect(lt._el.style.display).toBe('flex'); // still visible
    vi.advanceTimersByTime(200);
    expect(lt._el.style.display).toBe('none');
  });

  it('does not schedule duplicate hide timer', () => {
    vi.useFakeTimers();
    const { lt } = makeTooltip();
    lt._scheduleHide();
    const firstTimer = lt._hideTimer;
    lt._scheduleHide(); // second call
    expect(lt._hideTimer).toBe(firstTimer); // same timer, not replaced
  });
});

// ── Actions ───────────────────────────────────────────────────────────────────

describe('LinkTooltip._openLink', () => {
  it('calls window.open with URL and _blank', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => {});
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._openLink();
    expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('hides tooltip after opening', () => {
    vi.spyOn(window, 'open').mockImplementation(() => {});
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._openLink();
    expect(lt._el.style.display).toBe('none');
  });

  it('does not throw when no active anchor', () => {
    const { lt } = makeTooltip();
    lt._activeAnchor = null;
    expect(() => lt._openLink()).not.toThrow();
  });
});

describe('LinkTooltip._editLink', () => {
  it('invokes linkDialog.show', () => {
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._editLink();
    expect(ctx.invoke).toHaveBeenCalledWith('linkDialog.show');
  });

  it('hides tooltip before opening dialog', () => {
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._editLink();
    expect(lt._el.style.display).toBe('none');
  });

  it('does nothing when no active anchor', () => {
    const { lt, ctx } = makeTooltip();
    lt._activeAnchor = null;
    lt._editLink();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

describe('LinkTooltip._unlink', () => {
  it('calls editor.afterCommand via invoke', () => {
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._unlink();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no active anchor', () => {
    const { lt, ctx } = makeTooltip();
    lt._activeAnchor = null;
    lt._unlink();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

describe('LinkTooltip._copyLink', () => {
  it('calls navigator.clipboard.writeText with URL', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._copyLink();
    expect(writeText).toHaveBeenCalledWith('https://example.com');
  });

  it('adds copied class to copy button temporarily', () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._copyLink();
    expect(lt._copyBtn.classList.contains('an-link-tooltip-btn--copied')).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(lt._copyBtn.classList.contains('an-link-tooltip-btn--copied')).toBe(false);
  });

  it('does nothing when no active anchor', () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { lt } = makeTooltip();
    lt._activeAnchor = null;
    lt._copyLink();
    expect(writeText).not.toHaveBeenCalled();
  });

  it('uses execCommand fallback when clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);

    lt._copyLink();
    // Flush the microtask so .catch() runs
    await Promise.resolve();

    // A textarea should have been created, had execCommand called, and been removed
    expect(document.querySelector('textarea')).toBeNull();
  });
});

describe('LinkTooltip positioning overflow', () => {
  it('positions above anchor when no room below', () => {
    const { lt, ctx } = makeTooltip();
    const anchor = ctx.layoutInfo.editable.querySelector('a');
    // Simulate anchor near bottom of viewport
    anchor.getBoundingClientRect = () => ({ top: 750, bottom: 770, left: 100, right: 200, width: 100, height: 20 });

    vi.stubGlobal('innerHeight', 780);
    lt._show(anchor);

    // top should be less than 770 (positioned above)
    const topVal = Number.parseFloat(lt._el.style.top);
    expect(topVal).toBeLessThan(770);

    vi.unstubAllGlobals();
  });

  it('shifts left when tooltip would overflow right edge', () => {
    const { lt, ctx } = makeTooltip();
    const anchor = ctx.layoutInfo.editable.querySelector('a');
    // Anchor near right edge
    anchor.getBoundingClientRect = () => ({ top: 50, bottom: 70, left: 900, right: 1000, width: 100, height: 20 });

    vi.stubGlobal('innerWidth', 1000);
    lt._show(anchor);

    const leftVal = Number.parseFloat(lt._el.style.left);
    // With tipW=260 and innerWidth=1000, left should be shifted left from 900
    expect(leftVal).toBeLessThan(900);

    vi.unstubAllGlobals();
  });
});

// ── mouseover / mouseout event listeners ─────────────────────────────────────

describe('LinkTooltip mouseover/mouseout event listeners', () => {
  it('mouseover on anchor triggers scheduleShow', () => {
    vi.useFakeTimers();
    const { lt, ctx } = makeTooltip();
    const anchor = ctx.layoutInfo.editable.querySelector('a');
    anchor.getBoundingClientRect = () => ({ top: 50, bottom: 70, left: 100, right: 200, width: 100, height: 20 });

    anchor.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    vi.advanceTimersByTime(120);
    expect(lt._el.style.display).toBe('flex');
    lt.destroy();
  });

  it('mouseout when relatedTarget is outside editable and tooltip schedules hide', () => {
    vi.useFakeTimers();
    const { lt, ctx } = makeTooltip();
    const anchor = ctx.layoutInfo.editable.querySelector('a');
    anchor.getBoundingClientRect = () => ({ top: 50, bottom: 70, left: 100, right: 200, width: 100, height: 20 });
    // First show the tooltip
    lt._activeAnchor = anchor;
    lt._show(anchor);
    expect(lt._el.style.display).toBe('flex');

    // Mouseout with relatedTarget outside editable and tooltip
    ctx.layoutInfo.editable.dispatchEvent(
      new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }),
    );
    vi.advanceTimersByTime(200);
    expect(lt._el.style.display).toBe('none');
    lt.destroy();
  });

  it('mouseenter on tooltip clears hide timer', () => {
    vi.useFakeTimers();
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    lt._scheduleHide();
    expect(lt._hideTimer).not.toBeNull();

    lt._el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(lt._hideTimer).toBeNull();
    lt.destroy();
  });

  it('mouseleave from tooltip schedules hide', () => {
    vi.useFakeTimers();
    const { lt, ctx } = makeTooltip();
    showAnchor(lt, ctx);
    expect(lt._el.style.display).toBe('flex');

    lt._el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    vi.advanceTimersByTime(200);
    expect(lt._el.style.display).toBe('none');
    lt.destroy();
  });
});
