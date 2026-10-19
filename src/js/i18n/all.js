/**
 * i18n/all.js — Registers every bundled locale.
 *
 * Used by the demo site, which offers every language in its picker. Library
 * consumers should import only the locales they need from
 * `autumnnote-plus/i18n/<code>` (ESM) or load `dist/i18n/<code>.umd.js` (CDN).
 */

import { registerLocale } from './index.js';
import { vi } from './vi.js';
import { ja } from './ja.js';
import { zh } from './zh.js';
import { fr } from './fr.js';
import { de } from './de.js';
import { es } from './es.js';
import { ko } from './ko.js';
import { id } from './id.js';

registerLocale('vi', vi);
registerLocale('ja', ja);
registerLocale('zh', zh);
registerLocale('fr', fr);
registerLocale('de', de);
registerLocale('es', es);
registerLocale('ko', ko);
registerLocale('id', id);

export { vi, ja, zh, fr, de, es, ko, id };
