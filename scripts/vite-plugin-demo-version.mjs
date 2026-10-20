import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { bundledLocaleCodes } from './locales.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const REPO = 'https://github.com/habibiahmada/autumnnote-plus';

/**
 * Where the demo site is published, for canonical links and Open Graph URLs.
 * DEMO_SITE_URL overrides it (no trailing slash).
 */
export const SITE_URL = (process.env.DEMO_SITE_URL || 'https://autumnnote.habibiahmada.dev').replace(/\/+$/, '');

/** gzip size of a dist file in KiB, measured as `check:bundle` measures it. */
function gzipKib(file) {
  const path = resolve(root, file);
  if (!existsSync(path)) return null;
  return gzipSync(readFileSync(path)).byteLength / 1024;
}

/**
 * Bundle sizes for the pages, from `dist/`. In a build they must exist (the
 * build:demo script builds the library first); the dev server shows a dash
 * when `dist/` has not been built.
 * @param {boolean} required
 */
function bundleSizes(required) {
  const fmt = (kib) => (kib == null ? '–' : kib.toFixed(1));
  const files = {
    ES: 'dist/autumnnote.es.js',
    UMD: 'dist/autumnnote.umd.js',
    CORE: 'dist/autumnnote.core.es.js',
  };
  const sizes = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, gzipKib(f)]));
  const locales = bundledLocaleCodes().map((c) => gzipKib(`dist/i18n/${c}.umd.js`)).filter((v) => v != null);
  const missing = Object.entries(sizes).filter(([, v]) => v == null).map(([k]) => files[k]);
  if (required && (missing.length || !locales.length)) {
    throw new Error(`demo site: ${missing.join(', ') || 'dist/i18n'} missing. Run \`pnpm build\` before building the site.`);
  }
  return {
    __ASN_SIZE_ES__: fmt(sizes.ES),
    __ASN_SIZE_UMD__: fmt(sizes.UMD),
    __ASN_SIZE_CORE__: fmt(sizes.CORE),
    __ASN_SIZE_LOCALE_MIN__: fmt(locales.length ? Math.min(...locales) : null),
    __ASN_SIZE_LOCALE_MAX__: fmt(locales.length ? Math.max(...locales) : null),
  };
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline Markdown of a changelog line: `code`, **bold** and [links](url). */
function inline(text) {
  // Code spans first, swapped out for tokens, so bold and links can wrap them
  // ("**Typing `## ` …**") without the code's own text being formatted.
  const codes = [];
  const tokened = text.replace(/`([^`]+)`/g, (_, code) => `\u0000${codes.push(code) - 1}\u0000`);
  return escapeHtml(tokened)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => (
      /^https?:\/\//.test(href) ? `<a href="${href}" rel="noopener noreferrer">${label}</a>` : label
    ))
    .replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${escapeHtml(codes[Number(i)])}</code>`);
}

/**
 * The CHANGELOG entry for `version` as docs HTML: its intro paragraphs,
 * `###` headings and bullet lists (the subset the changelog is written in).
 * @param {string} version
 */
export function releaseNotesHtml(version) {
  const md = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
  const head = `\n## [${version}]`;
  const start = md.indexOf(head);
  if (start < 0) throw new Error(`demo site: CHANGELOG.md has no "## [${version}]" entry`);
  const bodyStart = md.indexOf('\n', start + 1) + 1;
  const end = md.indexOf('\n## [', bodyStart);
  const body = md.slice(bodyStart, end < 0 ? undefined : end).trim();

  const out = [];
  let list = null;
  let code = null;
  const closeList = () => { if (list) { out.push(`<ul class="docs-list">${list.join('')}</ul>`); list = null; } };
  for (const line of body.split('\n')) {
    if (code) {
      if (line.startsWith('```')) {
        out.push(`<div class="code-wrap"><pre><code class="language-${code.lang}">${escapeHtml(code.lines.join('\n'))}</code></pre></div>`);
        code = null;
      } else code.lines.push(line);
      continue;
    }
    if (line.startsWith('```')) { closeList(); code = { lang: line.slice(3).trim() || 'none', lines: [] }; continue; }
    if (!line.trim()) { closeList(); continue; }
    if (line.startsWith('### ')) { closeList(); out.push(`<h3 class="sub-h">${inline(line.slice(4))}</h3>`); continue; }
    const item = /^\s*[-*] (.*)$/.exec(line);
    if (item) { (list ??= []).push(`<li>${inline(item[1])}</li>`); continue; }
    if (list) { list[list.length - 1] = list[list.length - 1].replace(/<\/li>$/, ` ${inline(line.trim())}</li>`); continue; }
    out.push(`<p class="docs-p">${inline(line)}</p>`);
  }
  closeList();
  return out.join('\n      ');
}

/**
 * Fills the demo pages from the repository instead of hand-written values,
 * at serve time and at build time alike:
 *
 * - `__ASN_VERSION__`: the version in package.json
 * - `__ASN_RELEASE_URL__`: that version's GitHub release
 * - `__SITE_URL__`: {@link SITE_URL}
 * - `__ASN_SIZE_*__`: gzip sizes of the dist builds
 * - `<!-- asn:release-notes -->`: the version's CHANGELOG entry
 *
 * The demo used to spell the version out in fourteen places across seven
 * pages, so every release left the site advertising an older version than npm
 * was serving — it sat at 2.5.0 while 2.7.0 was published. One source of truth
 * is the only arrangement that cannot drift.
 * @returns {import('vite').Plugin}
 */
export function demoVersion() {
  const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  let isBuild = false;
  return {
    name: 'autumnnote-demo-version',
    configResolved(config) { isBuild = config.command === 'build'; },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const values = {
          __ASN_VERSION__: version,
          __ASN_RELEASE_URL__: `${REPO}/releases/tag/v${version}`,
          __SITE_URL__: SITE_URL,
          ...(/__ASN_SIZE_/.test(html) ? bundleSizes(isBuild) : {}),
        };
        let out = html.replace(/__(?:ASN_[A-Z_]+|SITE_URL)__/g, (key) => {
          if (!(key in values)) throw new Error(`demo site: unknown placeholder ${key}`);
          return values[key];
        });
        if (out.includes('<!-- asn:release-notes -->')) {
          out = out.replace('<!-- asn:release-notes -->', releaseNotesHtml(version));
        }
        return out;
      },
    },
  };
}
