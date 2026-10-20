import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from './vite-plugin-demo-version.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'https://github.com/habibiahmada/autumnnote-plus/blob/main/';

/**
 * Cuts `## from` up to (not including) `## to` out of the README.
 * @param {string} md
 * @param {string} from
 * @param {string} to
 */
function section(md, from, to) {
  const start = md.indexOf(`\n## ${from}\n`);
  const end = md.indexOf(`\n## ${to}\n`, start + 1);
  if (start < 0 || end < 0) throw new Error(`llms-full.txt: README has no "## ${from}" … "## ${to}" range`);
  return md.slice(start + 1, end).trim();
}

/**
 * Cuts the `### heading` subsection out of the README, up to the next heading
 * of level 2 or 3.
 * @param {string} md
 * @param {string} heading
 */
function subsection(md, heading) {
  const start = md.indexOf(`\n### ${heading}\n`);
  if (start < 0) throw new Error(`llms-full.txt: README has no "### ${heading}"`);
  const rest = md.slice(start + 1);
  const end = rest.slice(4).search(/\n#{2,3} /);
  return (end < 0 ? rest : rest.slice(0, end + 4)).trim();
}

/**
 * Builds `/llms.txt` (demo/llms.txt with the version and site URL filled in)
 * and `/llms-full.txt` (llms.txt plus the README's user-facing reference).
 *
 * The full file is cut from the README on every build rather than kept as a
 * copy, so the options, methods and events an LLM reads are the ones the
 * README documents — and test/docs/options-documented.test.js already keeps
 * those in step with settings.js and the types.
 * @returns {{ llms: string, full: string }}
 */
export function buildLlmsFiles() {
  const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  const llms = readFileSync(resolve(root, 'demo/llms.txt'), 'utf8')
    .replace(/__ASN_VERSION__/g, version)
    .replace(/__SITE_URL__/g, SITE_URL);

  const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
  const reference = [
    section(readme, 'Features', 'Project Structure'),
    // Lives under "Project Structure", which is otherwise contributor detail.
    subsection(readme, 'Languages').replace(/^### /, '## '),
    section(readme, 'Comparison', 'Contributing'),
  ].map((part) => part.replace(/\n-{3,}\s*$/, '').trim())
    .join('\n\n---\n\n')
    // Images mean nothing in plain text.
    .replace(/^\s*<p align="center">[\s\S]*?<\/p>\s*$/gm, '')
    // Repo-relative links would resolve against the site; point them at GitHub.
    .replace(/\]\((?!https?:|#|mailto:)([^)]+)\)/g, (_, path) => `](${REPO}${path.replace(/^\.\//, '')})`)
    .replace(/\n{3,}/g, '\n\n');

  const full = `${llms.trimEnd()}\n\n---\n\n# Full reference (autumnnote-plus ${version})\n\n${reference}\n`;
  return { llms, full };
}

/**
 * Serves both files in `vite dev` and emits them into the site build.
 * @returns {import('vite').Plugin}
 */
export function llmsTxt() {
  return {
    name: 'autumnnote-llms-txt',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0];
        if (path !== '/llms.txt' && path !== '/llms-full.txt') return next();
        const files = buildLlmsFiles();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(path === '/llms.txt' ? files.llms : files.full);
      });
    },
    generateBundle() {
      const files = buildLlmsFiles();
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: files.llms });
      this.emitFile({ type: 'asset', fileName: 'llms-full.txt', source: files.full });
    },
  };
}
