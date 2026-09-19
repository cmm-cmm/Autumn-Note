import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..', '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

/** Top-level keys of the `defaultOptions` object literal in settings.js. */
function defaultOptionKeys() {
  const src = read('src/js/settings.js');
  const block = src.slice(src.indexOf('export const defaultOptions'));
  return [...block.matchAll(/^ {2}([a-zA-Z][a-zA-Z0-9]*):/gm)].map((m) => m[1]);
}

describe('option documentation', () => {
  it('finds the option list at all', () => {
    // Guards the two assertions below: a rename that broke the scrape would
    // otherwise leave them passing over an empty list forever.
    expect(defaultOptionKeys().length).toBeGreaterThan(50);
  });

  // Six options had shipped without ever reaching the README — the table is
  // hand-maintained, so an option added to settings.js is documented only if
  // someone remembers to add a row. This is the reminder.
  it('gives every default option a row in the README table', () => {
    const readme = read('README.md');
    const undocumented = defaultOptionKeys().filter((k) => !readme.includes(`\`${k}\``));
    expect(undocumented).toEqual([]);
  });

  // A mention anywhere in the README is not documentation — the options table
  // is where people look up a name, type and default.
  it('gives every default option its own row in the README options table', () => {
    const readme = read('README.md');
    const rows = new Set([...readme.matchAll(/^\| `([a-zA-Z][a-zA-Z0-9]*)` \|/gm)].map((m) => m[1]));
    const missing = defaultOptionKeys().filter((k) => !rows.has(k));
    expect(missing).toEqual([]);
  });

  // The AsnOptions typedef drives editor hints for JS users of settings.js.
  it('describes every default option in the settings.js JSDoc typedef', () => {
    const src = read('src/js/settings.js');
    const typedef = src.slice(0, src.indexOf('export const defaultOptions'));
    const described = new Set([...typedef.matchAll(/@property \{.*?\}\s+\[([a-zA-Z0-9]+)\]/g)].map((m) => m[1]));
    const missing = defaultOptionKeys().filter((k) => !described.has(k));
    expect(missing).toEqual([]);
  });

  it('declares every default option in the published type definitions', () => {
    const types = read('types/index.d.ts');
    const untyped = defaultOptionKeys().filter((k) => !types.includes(`${k}?:`));
    expect(untyped).toEqual([]);
  });
});
