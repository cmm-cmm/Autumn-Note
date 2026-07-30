/**
 * i18n/index.js — Locale registry and resolver for autumn-note-ce.
 *
 * Only English ships in the ESM bundle. Bundling all eight locales cost every
 * consumer ~15 KB gzip even when they only ever rendered English, so the other
 * locales are opt-in via subpath imports:
 *
 *   import AutumnNote from 'autumnnote';
 *   import { vi } from 'autumnnote/i18n/vi';
 *
 *   AutumnNote.registerLocale('vi', vi);
 *   AutumnNote.create('#editor', { lang: 'vi' });
 *
 * The UMD/CDN build cannot tree-shake, so it pre-registers every locale and
 * `lang: 'vi'` keeps working there with no extra imports.
 *
 * Usage:
 *   lang: 'en'          → built-in English (always available)
 *   lang: '<code>'      → a locale previously passed to registerLocale()
 *   lang: { ... }       → custom locale object, deep-merged over English
 */

import { mergeDeep } from '../core/func.js';
import { en } from './en.js';

/**
 * Locales available to `lang: '<code>'`. Starts with English only; other codes
 * are added through {@link registerLocale}.
 * @type {Record<string, Partial<AsnLocale>>}
 */
export const locales = { en };

/**
 * Registers a locale so it can be selected by code.
 *
 * @param {string} code - Language code, e.g. 'vi'.
 * @param {Partial<AsnLocale>} locale - Locale object; missing keys fall back to English.
 * @returns {void}
 */
export function registerLocale(code, locale) {
  if (typeof code !== 'string' || !code) {
    throw new TypeError('[AutumnNote] registerLocale: code must be a non-empty string.');
  }
  if (!locale || typeof locale !== 'object') {
    throw new TypeError(`[AutumnNote] registerLocale: locale for "${code}" must be an object.`);
  }
  locales[code] = locale;
}

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
    if (!partial) {
      // Unregistered code → English, but say why: silently rendering English
      // after asking for another language is confusing to debug.
      console.warn(
        `[AutumnNote] Locale "${lang}" is not registered, falling back to English. ` +
        `Import it first: import { ${lang} } from 'autumnnote/i18n/${lang}'; ` +
        `AutumnNote.registerLocale('${lang}', ${lang});`,
      );
      return en;
    }
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
