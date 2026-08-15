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
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

const raw = execFileSync(
  'npm',
  ['pack', '--dry-run', '--ignore-scripts', '--json'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
);

/** @type {string[]} POSIX-style paths, relative to the package root. */
const shipped = JSON.parse(raw)[0].files.map((f) => f.path);
const shippedSet = new Set(shipped);

// Only source files can carry unresolvable relative imports; dist bundles are
// self-contained by construction and their chunk graph is Vite's problem.
const sources = shipped.filter((f) => f.startsWith('src/') && f.endsWith('.js'));

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
 */
const stripComments = (code) => code
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

let failed = false;
for (const file of sources) {
  const code = stripComments(readFileSync(file, 'utf8'));
  for (const [, specifier] of code.matchAll(IMPORT_RE)) {
    const target = normalize(join(dirname(file), specifier)).replaceAll('\\', '/');
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
