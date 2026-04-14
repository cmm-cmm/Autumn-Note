/**
 * i18n.test.js — Unit tests for resolveLocale and locale integrity.
 */

import { describe, it, expect } from 'vitest';
import { resolveLocale, locales } from '../../src/js/i18n/index.js';
import { en } from '../../src/js/i18n/en.js';

describe('resolveLocale', () => {
  it('returns English locale for falsy input', () => {
    expect(resolveLocale(null)).toBe(en);
    expect(resolveLocale(undefined)).toBe(en);
    expect(resolveLocale('')).toBe(en);
  });

  it('returns English locale for lang=en', () => {
    expect(resolveLocale('en')).toBe(en);
  });

  it('returns a full locale for known language codes', () => {
    for (const code of ['vi', 'ja', 'zh', 'fr']) {
      const locale = resolveLocale(code);
      expect(locale).toBeTruthy();
      // Must contain all top-level keys from the English canonical locale
      for (const key of Object.keys(en)) {
        expect(locale).toHaveProperty(key);
      }
    }
  });

  it('falls back to English for unknown language codes', () => {
    const locale = resolveLocale('xx');
    expect(locale).toEqual(en);
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
    const locale = resolveLocale('vi');
    expect(typeof locale.statusbar.words).toBe('function');
    expect(typeof locale.statusbar.wordsLimit).toBe('function');
    expect(typeof locale.videoDialog.detected).toBe('function');
    expect(typeof locale.errors.imageFormat).toBe('function');
    expect(typeof locale.errors.imageSize).toBe('function');
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
  it('exports all built-in locales', () => {
    expect(locales).toHaveProperty('en');
    expect(locales).toHaveProperty('vi');
    expect(locales).toHaveProperty('ja');
    expect(locales).toHaveProperty('zh');
    expect(locales).toHaveProperty('fr');
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
