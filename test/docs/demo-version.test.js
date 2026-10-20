// The site's version, sizes and release notes are filled in from the
// repository at build time (scripts/vite-plugin-demo-version.mjs). These
// checks keep hand-written copies from creeping back into the pages.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { releaseNotesHtml } from '../../scripts/vite-plugin-demo-version.mjs';

const root = resolve(import.meta.dirname, '../..');
const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const pages = readdirSync(resolve(root, 'demo')).filter((f) => f.endsWith('.html'));

describe('demo site version', () => {
  it.each(pages)('%s does not spell out the current version', (page) => {
    const html = readFileSync(resolve(root, 'demo', page), 'utf8');
    expect(html.includes(version)).toBe(false);
  });

  it.each(pages)('%s writes bundle sizes as placeholders', (page) => {
    const html = readFileSync(resolve(root, 'demo', page), 'utf8');
    // A literal like "93.9 KiB" goes stale with the next build.
    expect(html.match(/\b\d{2,3}\.\d KiB\b(?! gzip in 3\.1\.0)/g) ?? []).toEqual([]);
  });

  it('renders the current CHANGELOG entry as docs HTML', () => {
    const html = releaseNotesHtml(version);
    expect(html).toContain('<h3 class="sub-h">');
    expect(html).toContain('<ul class="docs-list">');
    expect(html).not.toContain('**');
  });

  it('escapes HTML in the changelog text', () => {
    const html = releaseNotesHtml(version);
    // The 4.1.0 entry mentions `<code class="language-…">` and `<script>`.
    expect(html).not.toMatch(/<script>/);
    expect(html).not.toMatch(/<pre>(?!<code)/);
  });

  it('throws for a version the changelog does not have', () => {
    expect(() => releaseNotesHtml('0.0.0-nope')).toThrow(/no "## \[0\.0\.0-nope\]"/);
  });
});
