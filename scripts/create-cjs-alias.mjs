import { readFileSync, writeFileSync } from 'node:fs';

const umdFile = 'dist/autumnnote.umd.js';
const cjsFile = 'dist/autumnnote.cjs';
const source = readFileSync(umdFile, 'utf8')
  .replace(/\n?\/\/# sourceMappingURL=autumnnote\.umd\.js\.map\s*$/, '');
writeFileSync(cjsFile, source);
