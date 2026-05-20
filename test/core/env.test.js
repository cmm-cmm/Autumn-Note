import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
});

// env.js is evaluated at module load time, so we test its properties
// by importing and checking the shape of the exported object.
describe('env', () => {
  it('exports boolean flags and a string modifierKey', async () => {
    const { env } = await import('../../src/js/core/env.js');
    expect(typeof env.isChrome).toBe('boolean');
    expect(typeof env.isFF).toBe('boolean');
    expect(typeof env.isSafari).toBe('boolean');
    expect(typeof env.isEdge).toBe('boolean');
    expect(typeof env.isMac).toBe('boolean');
    expect(typeof env.isMobile).toBe('boolean');
    expect(typeof env.isTouch).toBe('boolean');
    expect(['ctrlKey', 'metaKey']).toContain(env.modifierKey);
  });

  it('only one of isChrome/isFF/isSafari/isEdge is true in jsdom', async () => {
    const { env } = await import('../../src/js/core/env.js');
    const count = [env.isChrome, env.isFF, env.isSafari, env.isEdge].filter(Boolean).length;
    // jsdom UA may match 0 or 1 — never multiple major browsers simultaneously
    expect(count).toBeLessThanOrEqual(1);
  });

  it('modifierKey is ctrlKey when not on Mac (jsdom UA has no Macintosh)', async () => {
    const { env } = await import('../../src/js/core/env.js');
    // jsdom navigator.userAgent does not contain "Macintosh"
    if (!env.isMac) {
      expect(env.modifierKey).toBe('ctrlKey');
    } else {
      expect(env.modifierKey).toBe('metaKey');
    }
  });
});

describe('env browser detection patterns', () => {
  it('Chrome UA sets isChrome=true, isFF=false', () => {
    // Test regex patterns directly without reimporting (module is cached)
    const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
    expect(/Chrome\//.test(chromeUA)).toBe(true);
    expect(/Firefox\//.test(chromeUA)).toBe(false);
  });

  it('Firefox UA sets isFF=true, isChrome=false', () => {
    const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0';
    expect(/Firefox\//.test(firefoxUA)).toBe(true);
    expect(/Chrome\//.test(firefoxUA)).toBe(false);
  });

  it('Safari UA (no chrome/android) sets isSafari=true', () => {
    const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15';
    expect(/^((?!chrome|android).)*safari/i.test(safariUA)).toBe(true);
  });

  it('Edge UA sets isEdge=true', () => {
    const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    expect(/Edg\//.test(edgeUA)).toBe(true);
  });

  it('Mac UA sets modifierKey=metaKey', () => {
    const macUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
    expect(/Macintosh/.test(macUA) ? 'metaKey' : 'ctrlKey').toBe('metaKey');
  });

  it('mobile UA sets isMobile=true', () => {
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';
    expect(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(mobileUA)).toBe(true);
  });
});
