import { describe, it, expect, vi, afterEach } from 'vitest';
import { env } from '../../src/js/core/env.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const CHROME  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
const EDGE    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0';
const SAFARI  = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15';
const IPHONE  = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';

/** @param {string} userAgent */
function withUA(userAgent, extra = {}) {
  vi.stubGlobal('navigator', { userAgent, ...extra });
}

describe('env', () => {
  it('exports boolean flags and a string modifierKey', () => {
    expect(typeof env.isChrome).toBe('boolean');
    expect(typeof env.isFF).toBe('boolean');
    expect(typeof env.isSafari).toBe('boolean');
    expect(typeof env.isEdge).toBe('boolean');
    expect(typeof env.isMac).toBe('boolean');
    expect(typeof env.isMobile).toBe('boolean');
    expect(typeof env.isTouch).toBe('boolean');
    expect(['ctrlKey', 'metaKey']).toContain(env.modifierKey);
  });
});

describe('env browser detection', () => {
  it('identifies Chrome', () => {
    withUA(CHROME);
    expect(env.isChrome).toBe(true);
    expect(env.isEdge).toBe(false);
    expect(env.isFF).toBe(false);
  });

  it('does not report Edge as Chrome, even though its UA contains "Chrome/"', () => {
    withUA(EDGE);
    expect(env.isEdge).toBe(true);
    expect(env.isChrome).toBe(false);
  });

  it('identifies Firefox', () => {
    withUA(FIREFOX);
    expect(env.isFF).toBe(true);
    expect(env.isChrome).toBe(false);
  });

  it('identifies Safari but not Chrome', () => {
    withUA(SAFARI);
    expect(env.isSafari).toBe(true);
    expect(env.isChrome).toBe(false);
  });

  it('never reports two major browsers at once', () => {
    for (const ua of [CHROME, EDGE, FIREFOX, SAFARI]) {
      withUA(ua);
      const count = [env.isChrome, env.isFF, env.isSafari, env.isEdge].filter(Boolean).length;
      expect(count).toBe(1);
    }
  });

  it('reports Mac and switches modifierKey to metaKey', () => {
    withUA(SAFARI); // Safari UA above contains "Macintosh"
    expect(env.isMac).toBe(true);
    expect(env.modifierKey).toBe('metaKey');
  });

  it('uses ctrlKey off Mac', () => {
    withUA(CHROME);
    expect(env.isMac).toBe(false);
    expect(env.modifierKey).toBe('ctrlKey');
  });

  it('identifies mobile', () => {
    withUA(IPHONE);
    expect(env.isMobile).toBe(true);
  });

  it('reports touch support from maxTouchPoints', () => {
    // jsdom declares `ontouchstart` on window, so the first half of the check
    // is unconditionally true here and only the navigator branch is testable.
    withUA(IPHONE, { maxTouchPoints: 5 });
    expect(env.isTouch).toBe(true);
    withUA(CHROME, { maxTouchPoints: 0 });
    expect(typeof env.isTouch).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// SSR safety
// ---------------------------------------------------------------------------
describe('env without a global navigator (SSR)', () => {
  it('imports without throwing on a runtime that has no navigator', async () => {
    // Reading navigator at module scope made `import 'autumnnote'` throw
    // ReferenceError under SSR on Node 20 — before any editor was created,
    // and for a module nothing inside the library even uses.
    vi.stubGlobal('navigator', undefined);
    vi.resetModules();
    await expect(import('../../src/js/core/env.js')).resolves.toBeDefined();
  });

  it('answers every field with a safe default instead of throwing', () => {
    vi.stubGlobal('navigator', undefined);
    expect(env.isChrome).toBe(false);
    expect(env.isFF).toBe(false);
    expect(env.isSafari).toBe(false);
    expect(env.isEdge).toBe(false);
    expect(env.isMac).toBe(false);
    expect(env.isMobile).toBe(false);
    // isTouch also consults `ontouchstart`, which jsdom provides — the point
    // here is that reading it with no navigator does not throw.
    expect(typeof env.isTouch).toBe('boolean');
    expect(env.modifierKey).toBe('ctrlKey');
  });
});
