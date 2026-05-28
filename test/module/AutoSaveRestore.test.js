import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoSaveRestore } from '../../src/js/module/AutoSaveRestore.js';
import { en } from '../../src/js/i18n/en.js';

const DRAFT_KEY  = 'an-autosave-test';
const META_KEY   = DRAFT_KEY + ':asrmeta';
const DRAFT_HTML = '<p>Saved draft content</p>';

const makeContext = (optOverrides = {}) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return {
    locale: en,
    layoutInfo: { container },
    options: {
      autoSave: true,
      autoSaveRestore: true,
      autoSaveKey: DRAFT_KEY,
      autoSaveRestoreTimeout: 7,
      ...optOverrides,
    },
    setHTML: vi.fn(),
    clearHistory: vi.fn(),
  };
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('AutoSaveRestore', () => {
  it('does nothing when autoSave is false', () => {
    const ctx = makeContext({ autoSave: false });
    const asr = new AutoSaveRestore(ctx);
    asr.initialize();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).toBeNull();
  });

  it('does nothing when autoSaveRestore is false', () => {
    const ctx = makeContext({ autoSaveRestore: false });
    const asr = new AutoSaveRestore(ctx);
    asr.initialize();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).toBeNull();
  });

  it('does nothing when no draft in localStorage', () => {
    const ctx = makeContext();
    new AutoSaveRestore(ctx).initialize();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).toBeNull();
  });

  it('shows restore banner when fresh draft exists', () => {
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: Date.now() }));
    const ctx = makeContext();
    new AutoSaveRestore(ctx).initialize();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).not.toBeNull();
  });

  it('removes expired draft and shows no banner', () => {
    const oldDate = Date.now() - (8 * 86400000); // 8 days ago — exceeds 7-day timeout
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: oldDate }));
    const ctx = makeContext();
    new AutoSaveRestore(ctx).initialize();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).toBeNull();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('shows banner with no expiry check when timeout=0', () => {
    const oldDate = Date.now() - (100 * 86400000);
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: oldDate }));
    const ctx = makeContext({ autoSaveRestoreTimeout: 0 });
    new AutoSaveRestore(ctx).initialize();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).not.toBeNull();
  });

  it('banner has restore and discard buttons', () => {
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: Date.now() }));
    const ctx = makeContext();
    new AutoSaveRestore(ctx).initialize();
    const banner = ctx.layoutInfo.container.querySelector('.an-asr-banner');
    expect(banner.querySelector('.an-asr-btn-restore')).not.toBeNull();
    expect(banner.querySelector('.an-asr-btn-discard')).not.toBeNull();
  });

  it('restore button calls setHTML, clearHistory, and removes banner', () => {
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: Date.now() }));
    const ctx = makeContext();
    new AutoSaveRestore(ctx).initialize();
    const restoreBtn = ctx.layoutInfo.container.querySelector('.an-asr-btn-restore');
    restoreBtn.click();
    expect(ctx.setHTML).toHaveBeenCalledWith(DRAFT_HTML);
    expect(ctx.clearHistory).toHaveBeenCalled();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).toBeNull();
  });

  it('discard button removes localStorage keys and banner', () => {
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: Date.now() }));
    const ctx = makeContext();
    new AutoSaveRestore(ctx).initialize();
    const discardBtn = ctx.layoutInfo.container.querySelector('.an-asr-btn-discard');
    discardBtn.click();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(localStorage.getItem(META_KEY)).toBeNull();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).toBeNull();
  });

  it('destroy removes banner from DOM', () => {
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: Date.now() }));
    const ctx = makeContext();
    const asr = new AutoSaveRestore(ctx);
    asr.initialize();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).not.toBeNull();
    asr.destroy();
    expect(ctx.layoutInfo.container.querySelector('.an-asr-banner')).toBeNull();
  });

  it('destroy is safe when no banner exists', () => {
    const ctx = makeContext();
    const asr = new AutoSaveRestore(ctx);
    asr.initialize();
    expect(() => asr.destroy()).not.toThrow();
  });

  it('onAutoSaveRestore callback is called on restore', () => {
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: Date.now() }));
    const onAutoSaveRestore = vi.fn();
    const ctx = makeContext({ onAutoSaveRestore });
    new AutoSaveRestore(ctx).initialize();
    ctx.layoutInfo.container.querySelector('.an-asr-btn-restore').click();
    expect(onAutoSaveRestore).toHaveBeenCalledWith(DRAFT_HTML, ctx);
  });

  it('handles corrupted localStorage JSON gracefully', () => {
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    localStorage.setItem(META_KEY, 'NOT_VALID_JSON{{{');
    const ctx = makeContext();
    // JSON.parse of bad meta defaults to {} — should still show banner
    expect(() => new AutoSaveRestore(ctx).initialize()).not.toThrow();
  });

  it('shows banner with generic label when meta has no savedAt timestamp', () => {
    localStorage.setItem(DRAFT_KEY, DRAFT_HTML);
    // Meta with no savedAt — uses fallback label text (line 77)
    // Use autoSaveRestoreTimeout:0 to skip age check (savedAt=0 would fail 7-day check)
    localStorage.setItem(META_KEY, JSON.stringify({ version: '1.0' }));
    const ctx = makeContext({ autoSaveRestoreTimeout: 0 });
    new AutoSaveRestore(ctx).initialize();
    const banner = ctx.layoutInfo.container.querySelector('.an-asr-banner');
    expect(banner).not.toBeNull();
    const msg = banner.querySelector('.an-asr-msg');
    expect(msg.textContent.length).toBeGreaterThan(0);
  });
});
