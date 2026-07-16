import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const budgets = new Map([
  ['dist/autumnnote.es.js', 140 * 1024],
  ['dist/autumnnote.umd.js', 140 * 1024],
  ['dist/autumnnote.cjs', 140 * 1024],
]);

let failed = false;
for (const [file, limit] of budgets) {
  const bytes = gzipSync(readFileSync(file)).byteLength;
  const kib = (bytes / 1024).toFixed(1);
  const limitKib = (limit / 1024).toFixed(0);
  console.log(`${file}: ${kib} KiB gzip (budget ${limitKib} KiB)`);
  if (bytes > limit) failed = true;
}

if (failed) {
  console.error('Bundle size budget exceeded. Inspect intentional growth with `pnpm analyze`.');
  process.exitCode = 1;
}
