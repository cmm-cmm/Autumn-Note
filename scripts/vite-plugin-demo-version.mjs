import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const PLACEHOLDER = /__ASN_VERSION__/g;
const SITE_PLACEHOLDER = /__SITE_URL__/g;

/**
 * Where the demo site is published, for canonical links and Open Graph URLs.
 * DEMO_SITE_URL overrides it (no trailing slash).
 */
export const SITE_URL = (process.env.DEMO_SITE_URL || 'https://autumnnote.habibiahmada.dev').replace(/\/+$/, '');

/**
 * Substitutes `__ASN_VERSION__` in the demo pages with the version in
 * package.json, and `__SITE_URL__` with {@link SITE_URL}, at serve time and at
 * build time alike.
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
      handler: (html) => html.replace(PLACEHOLDER, version).replace(SITE_PLACEHOLDER, SITE_URL),
    },
  };
}
