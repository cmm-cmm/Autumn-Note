import { describe, it, expect, vi, afterEach } from 'vitest';
import { CodeTooltip } from '../../src/js/module/CodeTooltip.js';
import { en } from '../../src/js/i18n/en.js';

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const CODE_HTML = '<pre><code class="language-javascript">const x = 1;</code></pre>';

function makeContext(html = CODE_HTML) {
  const container = document.createElement('div');
  const editable  = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    locale: en,
    options: { codeHighlight: false },
    layoutInfo: { container, editable },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
}

function makeTooltip(html) {
  const ctx = makeContext(html);
  const ct = new CodeTooltip(ctx);
  ct.initialize();
  return { ctx, ct };
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

describe('CodeTooltip lifecycle', () => {
  it('initialize creates .an-code-tooltip in body', () => {
    makeTooltip();
    expect(document.querySelector('.an-code-tooltip')).not.toBeNull();
  });

  it('tooltip is initially hidden', () => {
    const { ct } = makeTooltip();
    expect(ct._el.style.display).toBe('none');
  });

  it('destroy removes tooltip from DOM', () => {
    const { ct } = makeTooltip();
    ct.destroy();
    expect(document.querySelector('.an-code-tooltip')).toBeNull();
  });

  it('destroy clears disposers', () => {
    const { ct } = makeTooltip();
    ct.destroy();
    expect(ct._disposers.length).toBe(0);
    expect(ct._el).toBeNull();
  });
});

// ── _buildTooltip ─────────────────────────────────────────────────────────────

describe('CodeTooltip._buildTooltip', () => {
  it('creates copy button', () => {
    const { ct } = makeTooltip();
    expect(ct._copyBtn).not.toBeNull();
  });

  it('creates language label', () => {
    const { ct } = makeTooltip();
    expect(ct._label).not.toBeNull();
  });

  it('has role=toolbar', () => {
    const { ct } = makeTooltip();
    expect(ct._el.getAttribute('role')).toBe('toolbar');
  });
});

// ── _show / _hide ─────────────────────────────────────────────────────────────

describe('CodeTooltip._show', () => {
  it('shows tooltip (display = flex)', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.getBoundingClientRect = () => ({ top: 50, bottom: 200, left: 40, right: 400, width: 360, height: 150 });
    ct._activePre = pre;
    ct._show(pre);
    expect(ct._el.style.display).toBe('flex');
  });
});

describe('CodeTooltip._hide', () => {
  it('hides tooltip', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.getBoundingClientRect = () => ({ top: 50, bottom: 200, left: 40, right: 400, width: 360, height: 150 });
    ct._activePre = pre;
    ct._show(pre);
    ct._hide();
    expect(ct._el.style.display).toBe('none');
  });

  it('_clearTimers nullifies both timers', () => {
    vi.useFakeTimers();
    const { ct } = makeTooltip();
    ct._showTimer = setTimeout(() => {}, 500);
    ct._hideTimer = setTimeout(() => {}, 500);
    ct._clearTimers();
    expect(ct._showTimer).toBeNull();
    expect(ct._hideTimer).toBeNull();
  });
});

// ── _scheduleShow / _scheduleHide ─────────────────────────────────────────────

describe('CodeTooltip timer management', () => {
  it('_scheduleShow shows tooltip after delay', () => {
    vi.useFakeTimers();
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.getBoundingClientRect = () => ({ top: 50, bottom: 200, left: 40, right: 400, width: 360, height: 150 });
    ct._scheduleShow(pre);
    expect(ct._el.style.display).toBe('none');
    vi.advanceTimersByTime(300); // past default SHOW_DELAY
    expect(ct._el.style.display).toBe('flex');
  });

  it('_scheduleHide hides tooltip after delay', () => {
    vi.useFakeTimers();
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.getBoundingClientRect = () => ({ top: 50, bottom: 200, left: 40, right: 400, width: 360, height: 150 });
    ct._activePre = pre;
    ct._show(pre);
    ct._scheduleHide();
    vi.advanceTimersByTime(300);
    expect(ct._el.style.display).toBe('none');
  });
});

// ── _copyCode ─────────────────────────────────────────────────────────────────

describe('CodeTooltip._copyCode', () => {
  it('calls navigator.clipboard.writeText with code content', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.getBoundingClientRect = () => ({ top: 50, bottom: 200, left: 40, right: 400, width: 360, height: 150 });
    ct._activePre = pre;
    ct._show(pre);
    ct._copyCode();
    expect(writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it('does nothing when no activePre', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { ct } = makeTooltip();
    ct._activePre = null;
    ct._copyCode();
    expect(writeText).not.toHaveBeenCalled();
  });
});

// ── _toParagraph ──────────────────────────────────────────────────────────────

describe('CodeTooltip._toParagraph', () => {
  it('replaces pre with p preserving text', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    ct._activePre = pre;
    ct._toParagraph();
    expect(ctx.layoutInfo.editable.querySelector('pre')).toBeNull();
    expect(ctx.layoutInfo.editable.querySelector('p')).not.toBeNull();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no activePre', () => {
    const { ct, ctx } = makeTooltip();
    ct._activePre = null;
    ct._toParagraph();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });

  it('preserves multi-line content as br elements', () => {
    const { ct, ctx } = makeTooltip('<pre><code>line1\nline2</code></pre>');
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    ct._activePre = pre;
    ct._toParagraph();
    const p = ctx.layoutInfo.editable.querySelector('p');
    expect(p).not.toBeNull();
    expect(p.querySelector('br')).not.toBeNull();
  });
});

// ── _delete ───────────────────────────────────────────────────────────────────

describe('CodeTooltip._delete', () => {
  it('removes the pre block from DOM', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    ct._activePre = pre;
    ct._delete();
    expect(ctx.layoutInfo.editable.querySelector('pre')).toBeNull();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no activePre', () => {
    const { ct, ctx } = makeTooltip();
    ct._activePre = null;
    ct._delete();
    expect(ctx.invoke).not.toHaveBeenCalled();
  });
});

// ── _syncWrapBtn ──────────────────────────────────────────────────────────────

describe('CodeTooltip._syncWrapBtn', () => {
  it('adds active class when pre has pre-wrap', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.style.whiteSpace = 'pre-wrap';
    ct._activePre = pre;
    ct._syncWrapBtn();
    expect(ct._wrapBtn.classList.contains('active')).toBe(true);
  });

  it('removes active class when pre does not have pre-wrap', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.style.whiteSpace = '';
    ct._activePre = pre;
    ct._syncWrapBtn();
    expect(ct._wrapBtn.classList.contains('active')).toBe(false);
  });

  it('does nothing when no activePre', () => {
    const { ct } = makeTooltip();
    ct._activePre = null;
    expect(() => ct._syncWrapBtn()).not.toThrow();
  });
});

// ── _syncLangSelect ───────────────────────────────────────────────────────────

describe('CodeTooltip._syncLangSelect', () => {
  it('sets select value from data-language attribute', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.setAttribute('data-language', 'javascript');
    ct._activePre = pre;
    ct._syncLangSelect();
    expect(ct._langSelect.value).toBe('javascript');
  });

  it('sets select value from code class language-xxx', () => {
    const { ct, ctx } = makeTooltip('<pre><code class="language-python">print()</code></pre>');
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    ct._activePre = pre;
    ct._syncLangSelect();
    expect(ct._langSelect.value).toBe('python');
  });

  it('does nothing when no activePre', () => {
    const { ct } = makeTooltip();
    ct._activePre = null;
    expect(() => ct._syncLangSelect()).not.toThrow();
  });
});

// ── _flashCopied ──────────────────────────────────────────────────────────────

describe('CodeTooltip._flashCopied', () => {
  it('temporarily changes copy button innerHTML', () => {
    vi.useFakeTimers();
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    ct._activePre = pre;
    const original = ct._copyBtn.innerHTML;
    ct._flashCopied();
    expect(ct._copyBtn.innerHTML).not.toBe(original);
    vi.advanceTimersByTime(1500);
    expect(ct._copyBtn.innerHTML).toBe(original);
  });

  it('does nothing when no copyBtn', () => {
    const { ct } = makeTooltip();
    ct._copyBtn = null;
    expect(() => ct._flashCopied()).not.toThrow();
  });
});

// ── _toggleWrap ───────────────────────────────────────────────────────────────

describe('CodeTooltip._toggleWrap', () => {
  it('toggles pre white-space between pre and pre-wrap', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.getBoundingClientRect = () => ({ top: 50, bottom: 200, left: 40, right: 400, width: 360, height: 150 });
    ct._activePre = pre;
    ct._toggleWrap();
    expect(pre.style.whiteSpace).toBe('pre-wrap');
    ct._toggleWrap();
    expect(pre.style.whiteSpace).toBe('pre');
  });

  it('does nothing when no activePre', () => {
    const { ct } = makeTooltip();
    ct._activePre = null;
    expect(() => ct._toggleWrap()).not.toThrow();
  });

  it('calls editor.afterCommand after toggling', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    pre.getBoundingClientRect = () => ({ top: 50, bottom: 200, left: 40, right: 400, width: 360, height: 150 });
    ct._activePre = pre;
    ct._toggleWrap();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });
});

// ── _onLangChange ─────────────────────────────────────────────────────────────

describe('CodeTooltip._onLangChange', () => {
  it('updates language class on existing code element', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    ct._activePre = pre;
    ct._langSelect.value = 'python';
    ct._onLangChange();
    const codeEl = pre.querySelector('code');
    expect(codeEl.className).toBe('language-python');
  });

  it('creates code element if not present', () => {
    const { ct, ctx } = makeTooltip('<pre>some code text</pre>');
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    ct._activePre = pre;
    ct._langSelect.value = 'python';
    ct._onLangChange();
    expect(pre.querySelector('code')).not.toBeNull();
    expect(pre.querySelector('code').className).toBe('language-python');
  });

  it('clears language class when empty value selected', () => {
    const { ct, ctx } = makeTooltip();
    const pre = ctx.layoutInfo.editable.querySelector('pre');
    ct._activePre = pre;
    ct._langSelect.value = '';
    ct._onLangChange();
    const codeEl = pre.querySelector('code');
    expect(codeEl.className).toBe('');
    expect(pre.hasAttribute('data-language')).toBe(false);
  });

  it('does nothing when no activePre', () => {
    const { ct } = makeTooltip();
    ct._activePre = null;
    expect(() => ct._onLangChange()).not.toThrow();
  });
});
