import { describe, it, expect } from 'vitest';
import { packedFiles, resolvedImports, stripComments } from '../../scripts/check-package-files.mjs';

describe('packedFiles', () => {
  const files = [{ path: 'dist/index.js' }, { path: 'src/js/i18n/vi.js' }];

  it('reads the array shape npm 10 emits', () => {
    expect(packedFiles(JSON.stringify([{ name: 'autumnnote', files }]))).toEqual(files);
  });

  it('reads the name-keyed object shape npm 12 emits', () => {
    // The publish job installs npm@latest for trusted publishing, so the two
    // shapes coexist in this repo's CI. Assuming the array shape once broke a
    // release partway through `pnpm check`.
    expect(packedFiles(JSON.stringify({ autumnnote: { name: 'autumnnote', files } }))).toEqual(files);
  });

  it.each([
    ['empty object', '{}'],
    ['empty array', '[]'],
    ['null', 'null'],
    ['entry without files', '{"autumnnote":{"name":"autumnnote"}}'],
    ['files not an array', '{"autumnnote":{"files":"nope"}}'],
  ])('throws a diagnosable error on %s rather than a TypeError', (_label, json) => {
    expect(() => packedFiles(json)).toThrow(/Unrecognised `npm pack --json` output/);
  });
});

describe('stripComments', () => {
  it('drops JSDoc type imports so they are not mistaken for runtime imports', () => {
    const code = "/** @type {import('../../types/index.js')} */\nexport const x = 1;";
    expect(stripComments(code)).not.toContain('types/index.js');
  });

  it('drops whole-line comments but leaves protocol slashes inside strings alone', () => {
    const code = "// import './ignored.js';\nconst url = 'https://example.com/a';";
    const out = stripComments(code);
    expect(out).not.toContain('ignored.js');
    expect(out).toContain('https://example.com/a');
  });
});

describe('resolvedImports', () => {
  it('resolves every import spelling against the importing file directory', () => {
    const code = [
      "import { a } from './a.js';",
      "import './b.js';",
      "import('./c.js');",
      "import( './d.js' );",
      "import   './e.js';",
      'export { f } from "../f.js";',
    ].join('\n');

    expect(resolvedImports('src/js/i18n/index.js', code).map((i) => i.target)).toEqual([
      'src/js/i18n/a.js',
      'src/js/i18n/b.js',
      'src/js/i18n/c.js',
      'src/js/i18n/d.js',
      'src/js/i18n/e.js',
      'src/js/f.js',
    ]);
  });

  it('ignores bare specifiers, which the package manager resolves', () => {
    expect(resolvedImports('src/js/a.js', "import x from 'lodash';")).toEqual([]);
  });

  it('reports the raw specifier alongside the resolved target', () => {
    expect(resolvedImports('src/js/i18n/index.js', "import { m } from '../core/func.js';")).toEqual([
      { specifier: '../core/func.js', target: 'src/js/core/func.js' },
    ]);
  });

  it('matches a long non-matching whitespace run without backtracking', () => {
    // Guards the CWE-1333 fix: two adjacent `\s*` used to make this super-linear.
    const evil = `import${' '.repeat(50_000)}x`;
    const start = performance.now();
    resolvedImports('src/js/a.js', evil);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});
