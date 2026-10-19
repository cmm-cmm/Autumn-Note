/**
 * Builds one script-tag file per locale: dist/i18n/<code>.umd.js.
 *
 * The UMD/CDN bundle carries English only. Each file here registers its locale
 * on the global AutumnNote when loaded after the main script, and returns the
 * locale object to CommonJS/AMD loaders (which register it themselves):
 *
 *   <script src=".../autumnnote.min.js"></script>
 *   <script src=".../i18n/id.umd.js"></script>
 *   <script>AutumnNote.create('#editor', { lang: 'id' });</script>
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';
import { bundledLocaleCodes } from './locales.mjs';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'dist/i18n');
// Entry stubs live in the dependency cache: generated, never committed.
const tmpDir = resolve(root, 'node_modules/.cache/autumnnote-locale-umd');

mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

for (const code of bundledLocaleCodes()) {
  const entry = resolve(tmpDir, `${code}.js`);
  const source = resolve(root, `src/js/i18n/${code}.js`).replaceAll('\\', '/');
  writeFileSync(entry, [
    `import { ${code} as locale } from ${JSON.stringify(source)};`,
    'const host = typeof globalThis === \'undefined\' ? undefined : globalThis.AutumnNote;',
    'if (host && typeof host.registerLocale === \'function\') {',
    `  host.registerLocale(${JSON.stringify(code)}, locale);`,
    '} else if (typeof module === \'undefined\' && typeof define === \'undefined\') {',
    `  console.warn('[AutumnNote] Load autumnnote before i18n/${code}.umd.js so the locale can register.');`,
    '}',
    'export default locale;',
    '',
  ].join('\n'));

  await build({
    configFile: false,
    publicDir: false,
    logLevel: 'warn',
    build: {
      outDir,
      emptyOutDir: false,
      sourcemap: false,
      minify: true,
      lib: {
        entry,
        name: `AutumnNoteLocale_${code.replace(/\W/g, '_')}`,
        formats: ['umd'],
        fileName: () => `${code}.umd.js`,
      },
      rollupOptions: { output: { exports: 'default' } },
    },
  });
  console.log(`dist/i18n/${code}.umd.js`);
}

rmSync(tmpDir, { recursive: true, force: true });
