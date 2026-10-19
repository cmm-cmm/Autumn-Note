import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const I18N_DIR = resolve(import.meta.dirname, '../src/js/i18n');

/**
 * Codes of the locales that ship as files next to en.js (vi, ja, id, …).
 * English is built into every bundle, and index.js / all.js are not locales,
 * so all three are left out. Read from the directory so adding a locale file
 * is the only step needed for it to be built and size-checked.
 * @returns {string[]}
 */
export function bundledLocaleCodes() {
  return readdirSync(I18N_DIR)
    .filter((f) => /^[a-z]{2,3}(?:-[A-Za-z0-9]+)?\.js$/.test(f))
    .map((f) => f.slice(0, -3))
    .filter((code) => !['en', 'all', 'index'].includes(code))
    .sort();
}
