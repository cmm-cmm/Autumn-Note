/**
 * i18n.test.js — Unit tests for resolveLocale and locale integrity.
 */

import { describe, it, expect, vi as viMock, afterEach } from 'vitest';
import { resolveLocale, locales, registerLocale } from '../../src/js/i18n/index.js';
import { en } from '../../src/js/i18n/en.js';
import { vi } from '../../src/js/i18n/vi.js';

// Only `en` ships in the ESM bundle; other locales are opt-in. Tests that need
// another locale register it explicitly and clean up so registry state does not
// leak between test files.
const withLocale = (code, locale, fn) => {
  registerLocale(code, locale);
  try { return fn(); } finally { delete locales[code]; }
};

afterEach(() => { viMock.restoreAllMocks(); });

describe('resolveLocale', () => {
  it('returns English locale for falsy input', () => {
    expect(resolveLocale(null)).toBe(en);
    expect(resolveLocale(undefined)).toBe(en);
    expect(resolveLocale('')).toBe(en);
  });

  it('returns English locale for lang=en', () => {
    expect(resolveLocale('en')).toBe(en);
  });

  it('returns a full locale for a registered language code', () => {
    withLocale('vi', vi, () => {
      const locale = resolveLocale('vi');
      expect(locale).toBeTruthy();
      // Translated strings come through…
      expect(locale.toolbar.bold).toBe(vi.toolbar.bold);
      // …and every top-level key from the English canonical locale is present
      for (const key of Object.keys(en)) {
        expect(locale).toHaveProperty(key);
      }
    });
  });

  it('falls back to English for unknown language codes', () => {
    const warn = viMock.spyOn(console, 'warn').mockImplementation(() => {});
    const locale = resolveLocale('xx');
    expect(locale).toEqual(en);
    expect(warn).toHaveBeenCalled();
  });

  it('warns with import instructions when a locale is not registered', () => {
    const warn = viMock.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveLocale('vi')).toBe(en);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("autumnnote/i18n/vi"));
  });

  it('accepts a partial object and merges with English', () => {
    const custom = {
      linkDialog: { title: 'My Custom Title' },
    };
    const locale = resolveLocale(custom);
    expect(locale.linkDialog.title).toBe('My Custom Title');
    // English fallback keys still present
    expect(locale.linkDialog.insertBtn).toBe(en.linkDialog.insertBtn);
    // Other sections unaffected
    expect(locale.toolbar).toEqual(en.toolbar);
  });

  it('preserves template functions in merged locales', () => {
    withLocale('vi', vi, () => {
      const locale = resolveLocale('vi');
      expect(typeof locale.statusbar.words).toBe('function');
      expect(typeof locale.statusbar.wordsLimit).toBe('function');
      expect(typeof locale.videoDialog.detected).toBe('function');
      expect(typeof locale.errors.imageFormat).toBe('function');
      expect(typeof locale.errors.imageSize).toBe('function');
    });
  });

  it('template functions produce correct output', () => {
    const locale = resolveLocale('en');
    expect(locale.statusbar.words(5)).toBe('Words: 5');
    expect(locale.statusbar.wordsLimit(5, 100)).toBe('Words: 5/100');
    expect(locale.statusbar.chars(42)).toBe('Chars: 42');
    expect(locale.statusbar.charsLimit(42, 500)).toBe('Chars: 42/500');
    expect(locale.videoDialog.detected('YouTube')).toBe('Detected: YouTube');
    expect(locale.errors.imageFormat('image/bmp')).toContain('image/bmp');
    expect(locale.errors.imageSize(5)).toContain('5');
  });
});

describe('locales registry', () => {
  it('ships English only so consumers do not pay for unused locales', () => {
    expect(Object.keys(locales)).toEqual(['en']);
  });

  it('registerLocale makes a code selectable', () => {
    expect(locales).not.toHaveProperty('vi');
    withLocale('vi', vi, () => {
      expect(locales).toHaveProperty('vi');
      expect(resolveLocale('vi').toolbar.bold).toBe(vi.toolbar.bold);
    });
    expect(locales).not.toHaveProperty('vi');
  });

  it('registerLocale rejects invalid arguments', () => {
    expect(() => registerLocale('', {})).toThrow(TypeError);
    expect(() => registerLocale('xx', null)).toThrow(TypeError);
  });

  it('all locale values have the expected top-level keys', () => {
    const expectedKeys = Object.keys(en);
    for (const [code, locale] of Object.entries(locales)) {
      for (const key of expectedKeys) {
        expect(locale, `${code} missing key: ${key}`).toHaveProperty(key);
      }
    }
  });
});

describe('i18n/all.js — UMD/CDN bundle', () => {
  it('registers every bundled locale on import', async () => {
    await import('../../src/js/i18n/all.js');
    for (const code of ['vi', 'ja', 'zh', 'fr', 'de', 'es', 'ko']) {
      expect(locales, `missing locale: ${code}`).toHaveProperty(code);
    }
    // Registry is module-global; restore the ESM-only baseline for other files.
    for (const code of ['vi', 'ja', 'zh', 'fr', 'de', 'es', 'ko']) delete locales[code];
  });
});
