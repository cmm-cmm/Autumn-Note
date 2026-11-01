/**
 * Gzip size budgets for the published bundles.
 *
 * Each bundle gets its own ceiling because they do not carry the same payload:
 *
 * - `autumnnote.es.js` is the code itself. Locales are opt-in imports and the
 *   emoji/icon catalogues are lazy chunks, so this is the number that tracks
 *   how much editor the package ships. Its ceiling is the real growth guard.
 * - `autumnnote.umd.js` is the same code plus everything a `<script>` tag
 *   cannot load on demand: all eight locales (~17 KiB gzip) and the inlined
 *   emoji/icon data. It sat under the same 110 KiB ceiling as the ES build
 *   until the locales alone left it less than 2 KiB of room, so a single new
 *   feature's translations would have failed CI. Its ceiling now carries that
 *   fixed overhead on top of the ES ceiling instead.
 * - `autumnnote.core.es.js` is the minimal preset. If it ever drifts up to the
 *   full build's size, `autumnnote/core` has quietly stopped being worth
 *   importing.
 *
 * `autumnnote.cjs` and `autumnnote.min.js` are copies of the UMD bundle
 * (see `create-umd-aliases.mjs`), so they are checked for being identical to it
 * rather than measured a second and third time.
 *
 * The lower bound catches a broken build, such as a failed transform silently
 * producing a near-empty file that would otherwise pass the upper-bound check.
 *
 * The pure helpers are exported for `test/scripts/check-bundle-size.test.js`;
 * the checks only run when this file is executed directly.
 */
import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { UMD_FILE, UMD_ALIASES, aliasBody } from './create-umd-aliases.mjs';

const KIB = 1024;

export const BUDGETS = new Map([
  ['dist/autumnnote.es.js', { min: 50 * KIB, max: 110 * KIB }],
  ['dist/autumnnote.umd.js', { min: 60 * KIB, max: 125 * KIB }],
  ['dist/autumnnote.core.es.js', { min: 20 * KIB, max: 60 * KIB }],
]);

/** Below this much room a passing bundle still gets a CI warning. */
export const WARN_HEADROOM = 0.05;

/**
 * @param {number} bytes - gzip size
 * @param {{ min: number, max: number }} budget
 * @returns {'over' | 'under' | 'tight' | 'ok'}
 */
export function classify(bytes, { min, max }) {
  if (bytes > max) return 'over';
  if (bytes < min) return 'under';
  if (max - bytes < max * WARN_HEADROOM) return 'tight';
  return 'ok';
}

function main() {
  let failed = false;
  const fmt = (n) => (n / KIB).toFixed(1);

  for (const [file, budget] of BUDGETS) {
    if (!existsSync(file)) {
      console.error(`::error::${file} does not exist. Run \`pnpm build\` before \`pnpm check:bundle\`.`);
      failed = true;
      continue;
    }

    const bytes = gzipSync(readFileSync(file)).byteLength;
    const range = `${fmt(budget.min)}-${fmt(budget.max)} KiB`;
    console.log(`${file}: ${fmt(bytes)} KiB gzip (budget ${range}, ${fmt(budget.max - bytes)} KiB headroom)`);

    switch (classify(bytes, budget)) {
      case 'over':
        console.error(`::error::${file} exceeds the ${fmt(budget.max)} KiB gzip budget. Inspect intentional growth with \`pnpm analyze\`.`);
        failed = true;
        break;
      case 'under':
        console.error(`::error::${file} is only ${fmt(bytes)} KiB gzip, below the ${fmt(budget.min)} KiB sanity floor — the build may be broken or truncated.`);
        failed = true;
        break;
      case 'tight':
        console.warn(`::warning::${file} has less than ${WARN_HEADROOM * 100}% of its gzip budget left.`);
        break;
    }
  }

  if (existsSync(UMD_FILE)) {
    const expected = aliasBody(readFileSync(UMD_FILE, 'utf8'));
    for (const file of UMD_ALIASES) {
      if (!existsSync(file) || readFileSync(file, 'utf8') !== expected) {
        console.error(`::error::${file} is missing or differs from ${UMD_FILE}. It must be written by scripts/create-umd-aliases.mjs.`);
        failed = true;
      } else {
        console.log(`${file}: identical to ${UMD_FILE}`);
      }
    }
  }

  if (failed) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
