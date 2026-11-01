/**
 * Writes the two files that share the UMD bundle's code.
 *
 * - `dist/autumnnote.cjs` is the `require` entry. It has to be a `.cjs` file:
 *   the package is `"type": "module"`, so Node would load a `.js` file as ESM,
 *   where `module` and `exports` are undefined and the UMD wrapper would fall
 *   back to assigning a global instead of exporting.
 * - `dist/autumnnote.min.js` is the legacy CDN filename. It used to come from
 *   a third Vite build (`vite.cdn.config.js`) that compiled the same entry with
 *   the same minifier and produced the same bytes. It is now copied from the
 *   UMD build instead, and is deprecated in favour of `autumnnote.umd.js`.
 *
 * Both copies drop the `sourceMappingURL` comment: neither ships its own map,
 * and pointing at `autumnnote.umd.js.map` from a different filename would only
 * confuse devtools.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const UMD_FILE = 'dist/autumnnote.umd.js';
export const UMD_ALIASES = ['dist/autumnnote.cjs', 'dist/autumnnote.min.js'];

/**
 * The UMD source as its aliases contain it.
 * @param {string} umd
 * @returns {string}
 */
export function aliasBody(umd) {
  return umd.replace(/\n?\/\/# sourceMappingURL=autumnnote\.umd\.js\.map\s*$/, '');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const source = aliasBody(readFileSync(UMD_FILE, 'utf8'));
  for (const file of UMD_ALIASES) writeFileSync(file, source);
}
