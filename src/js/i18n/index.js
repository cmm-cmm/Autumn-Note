/**
 * i18n/index.js — Locale registry and resolver for autumn-note-ce.
 *
 * Usage:
 *   lang: 'en'          → built-in English (default)
 *   lang: 'vi'          → built-in Vietnamese
 *   lang: 'ja'          → built-in Japanese
 *   lang: 'zh'          → built-in Simplified Chinese
 *   lang: 'fr'          → built-in French
 *   lang: 'de'          → built-in German
 *   lang: 'es'          → built-in Spanish
 *   lang: 'ko'          → built-in Korean
 *   lang: { ... }       → custom locale object, deep-merged over English
 */

import { mergeDeep } from '../core/func.js';
import { en } from './en.js';
import { vi } from './vi.js';
import { ja } from './ja.js';
import { zh } from './zh.js';
import { fr } from './fr.js';
import { de } from './de.js';
import { es } from './es.js';
import { ko } from './ko.js';

/**
 * All built-in locales keyed by their language code.
 * @type {Record<string, Partial<AsnLocale>>}
 */
export const locales = { en, vi, ja, zh, fr, de, es, ko };

/**
 * Resolve a locale object from a lang option value.
 *
 * @param {string | Partial<AsnLocale> | null | undefined} lang
 * @returns {AsnLocale} A fully-populated locale (always contains every key from en.js).
 */
export function resolveLocale(lang) {
  // Default / English shortcut (no merge needed)
  if (!lang || lang === 'en') return en;

  if (typeof lang === 'string') {
    const partial = locales[lang];
    // Unknown language code → fall back to English
    if (!partial) return en;
    return mergeDeep(mergeDeep({}, en), partial);
  }

  if (typeof lang === 'object') {
    // Custom locale object supplied directly by the user
    return mergeDeep(mergeDeep({}, en), lang);
  }

  return en;
}

/**
 * @typedef {Object} AsnLocale  (see types/index.d.ts for the full definition)
 */
