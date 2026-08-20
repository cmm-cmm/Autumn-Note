import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const PLACEHOLDER = /__ASN_VERSION__/g;

/**
 * Substitutes `__ASN_VERSION__` in the demo pages with the version in
 * package.json, at serve time and at build time alike.
 *
 * The demo used to spell the version out in fourteen places across seven
 * pages, so every release left the site advertising an older version than npm
 * was serving — it sat at 2.5.0 while 2.7.0 was published. One source of truth
 * is the only arrangement that cannot drift.
 * @returns {import('vite').Plugin}
 */
export function demoVersion() {
  const { version } = JSON.parse(
    readFileSync(resolve(here, '..', 'package.json'), 'utf8'),
  );
  return {
    name: 'autumnnote-demo-version',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(PLACEHOLDER, version),
    },
  };
}
