/**
 * i18n/all.js — Registers every bundled locale.
 *
 * Imported by the UMD/CDN entry point, where script-tag consumers have no
 * bundler to tree-shake with and therefore expect `lang: 'vi'` to work out of
 * the box. ESM consumers should import only the locales they need from
 * `autumnnote/i18n/<code>` instead of pulling this in.
 */

import { registerLocale } from './index.js';
import { vi } from './vi.js';
import { ja } from './ja.js';
import { zh } from './zh.js';
import { fr } from './fr.js';
import { de } from './de.js';
import { es } from './es.js';
import { ko } from './ko.js';

registerLocale('vi', vi);
registerLocale('ja', ja);
registerLocale('zh', zh);
registerLocale('fr', fr);
registerLocale('de', de);
registerLocale('es', es);
registerLocale('ko', ko);

export { vi, ja, zh, fr, de, es, ko };
