/**
 * Verifies the npm tarball is self-contained.
 *
 * `package.json#files` ships only a slice of `src/` (the i18n tree reachable
 * through the `./i18n/*` subpath export, plus what it imports). A relative
 * import inside that slice pointing at a file the tarball omits resolves fine
 * in the repo and throws `ERR_MODULE_NOT_FOUND` for consumers — the repo
 * checkout hides the breakage from every other check in `pnpm check`.
 *
 * So: list the tarball, then walk each shipped JS file's relative imports and
 * assert the target is shipped too.
 *
 * The pure helpers are exported for `test/scripts/check-package-files.test.js`;
 * the npm invocation only runs when this file is executed directly.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * `npm pack --json` has two shapes in the wild, and this repo hits both: CI runs
 * the npm bundled with Node 22 (v10, a top-level array), while the publish job
 * upgrades to npm@latest for trusted publishing (v12, an object keyed by package
 * name). Accept either, and fail with something readable if a future npm invents
 * a third — indexing `[0]` blindly died with "Cannot read properties of
 * undefined" partway through a release.
 * @param {string} json
 * @returns {{ path: string }[]}
 */
export function packedFiles(json) {
  const parsed = JSON.parse(json);
  const entry = Array.isArray(parsed) ? parsed[0] : Object.values(parsed ?? {})[0];
  if (!entry || !Array.isArray(entry.files)) {
    throw new Error(
      'Unrecognised `npm pack --json` output: expected an array of results or an '
      + `object keyed by package name, each carrying a "files" array. Got: ${json.slice(0, 200)}`,
    );
  }
  return entry.files;
}

// `from './x.js'` / `import './x.js'` / `import('./x.js')` — relative only.
//
// The optional group has to start with a literal `(` rather than being written
// as `\s*\(?\s*`: two adjacent unbounded `\s*` can split a run of whitespace
// many ways, so a near-match that ultimately fails backtracks through every
// split (super-linear, CWE-1333). Anchoring the group on `(` makes the match
// deterministic.
const IMPORT_RE = /(?:\bfrom|\bimport)\s*(?:\(\s*)?['"](\.[^'"]*)['"]/g;

/**
 * Drops comments so JSDoc type imports — `@type {import('../../types/index.js')}`
 * — are not mistaken for runtime imports. Type-only references resolve through
 * TypeScript's own `.js` -> `.d.ts` mapping and never hit the module loader.
 * Block comments go first; line comments only when the line is wholly a comment,
 * which leaves `https://` inside string literals alone.
 * @param {string} code
 * @returns {string}
 */
export const stripComments = (code) => code
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

/**
 * Relative import specifiers in `code`, resolved against `file`'s directory and
 * normalised to POSIX separators so they can be compared to tarball paths.
 * @param {string} file - repo-relative path of the file `code` came from
 * @param {string} code
 * @returns {{ specifier: string, target: string }[]}
 */
export function resolvedImports(file, code) {
  const out = [];
  for (const [, specifier] of stripComments(code).matchAll(IMPORT_RE)) {
    out.push({
      specifier,
      target: normalize(join(dirname(file), specifier)).replaceAll('\\', '/'),
    });
  }
  return out;
}

function main() {
  const raw = execFileSync(
    'npm',
    ['pack', '--dry-run', '--ignore-scripts', '--json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  );

  /** @type {string[]} POSIX-style paths, relative to the package root. */
  const shipped = packedFiles(raw).map((f) => f.path);
  const shippedSet = new Set(shipped);

  // Only source files can carry unresolvable relative imports; dist bundles are
  // self-contained by construction and their chunk graph is Vite's problem.
  const sources = shipped.filter((f) => f.startsWith('src/') && f.endsWith('.js'));

  let failed = false;
  for (const file of sources) {
    for (const { specifier, target } of resolvedImports(file, readFileSync(file, 'utf8'))) {
      if (shippedSet.has(target)) continue;
      console.error(
        `::error file=${file}::imports "${specifier}" -> "${target}", which package.json#files does not ship. `
        + 'Add it to "files" or drop the import.',
      );
      failed = true;
    }
  }

  if (failed) {
    process.exitCode = 1;
  } else {
    console.log(`Package is self-contained: ${sources.length} shipped source files, all relative imports resolve.`);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
