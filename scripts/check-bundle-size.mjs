import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync } from 'node:fs';

// Lower bound catches a broken/empty build (e.g. a failed transform silently
// producing a near-empty file) that would otherwise pass the upper-bound check.
const budgets = new Map([
  ['dist/autumnnote.es.js', { min: 50 * 1024, max: 110 * 1024 }],
  ['dist/autumnnote.umd.js', { min: 50 * 1024, max: 110 * 1024 }],
  ['dist/autumnnote.cjs', { min: 50 * 1024, max: 110 * 1024 }],
  ['dist/autumnnote.min.js', { min: 50 * 1024, max: 110 * 1024 }],
]);

let failed = false;
for (const [file, { min, max }] of budgets) {
  if (!existsSync(file)) {
    console.error(`::error::${file} does not exist. Run \`pnpm build\` before \`pnpm check:bundle\`.`);
    failed = true;
    continue;
  }

  const bytes = gzipSync(readFileSync(file)).byteLength;
  const kib = (bytes / 1024).toFixed(1);
  const minKib = (min / 1024).toFixed(0);
  const maxKib = (max / 1024).toFixed(0);
  console.log(`${file}: ${kib} KiB gzip (budget ${minKib}-${maxKib} KiB)`);

  if (bytes > max) {
    console.error(`::error::${file} exceeds the ${maxKib} KiB gzip budget. Inspect intentional growth with \`pnpm analyze\`.`);
    failed = true;
  } else if (bytes < min) {
    console.error(`::error::${file} is only ${kib} KiB gzip, below the ${minKib} KiB sanity floor — the build may be broken or truncated.`);
    failed = true;
  }
}

if (failed) process.exitCode = 1;
