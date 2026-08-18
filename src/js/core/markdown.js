/**
 * markdown.js - Lightweight Markdown → HTML converter for paste handling.
 *
 * Handles: headings H1–H6, bold/italic/strikethrough/inline-code, fenced code
 * blocks (with language), blockquotes, unordered/ordered lists, horizontal
 * rules, links, images, and plain paragraphs.
 *
 * The HTML output MUST be passed through sanitiseHTML() before insertion.
 */

import { repairListNesting } from './dom.js';

/**
 * Converts an HTML string to Markdown.
 * Handles: headings, paragraphs, bold/italic/del/code, links, images,
 * unordered/ordered lists, blockquote, pre/code blocks, tables, hr.
 * @param {string} html
 * @returns {string}
 */
export function htmlToMarkdown(html) {
  const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');
  // Content can arrive with a sublist parked next to its item rather than
  // inside it — that is what execCommand('indent') produces, and paste carries
  // it in from other editors. A sublist in that position belongs to no item, so
  // without this the indented items are silently dropped from the output.
  repairListNesting(doc.body);
  return _domToMd(doc.body).replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Convert a DOM node subtree into Markdown.
 *
 * Recursively produces a Markdown string representing the given DOM node and its descendants,
 * handling common HTML constructs such as paragraphs, headings, lists (with nested indentation),
 * blockquotes, fenced and inline code, links, images, tables, horizontal rules, and basic inline emphasis.
 *
 * @param {Node} node - The DOM node to convert.
 * @param {number} [depth=0] - Current nesting depth used to indent nested list items.
 * @returns {string} The Markdown representation of the node subtree.
 */
/**
 * Direct child elements matching a tag name. Used instead of the CSS
 * `:scope > tag` combinator, which this project's jsdom version resolves
 * incorrectly (matches descendants at any depth, not just direct children).
 * @param {Element} el
 * @param {string} tagName
 * @returns {Element[]}
 */
function _directChildren(el, tagName) {
  return Array.from(el.children).filter((c) => c.tagName === tagName.toUpperCase());
}

/**
 * Text of a code element with line breaks preserved.
 *
 * `textContent` drops `<br>` entirely, and contenteditable stores every line
 * break inside a `<pre>` as one — so a code block typed in the editor came out
 * of getMarkdown() as a single run-together line. Block-level children (some
 * browsers wrap lines in `<div>`) end a line too.
 * @param {Element} el
 * @returns {string}
 */
function _codeText(el) {
  let out = '';
  for (const node of el.childNodes) {
    if (node.nodeType === 3) { out += node.textContent; continue; }
    if (node.nodeType !== 1) continue;
    const tag = node.nodeName.toLowerCase();
    if (tag === 'br') { out += '\n'; continue; }
    if (tag === 'div' || tag === 'p') {
      if (out && !out.endsWith('\n')) out += '\n';
      out += _codeText(/** @type {Element} */ (node));
      out += '\n';
      continue;
    }
    out += _codeText(/** @type {Element} */ (node));
  }
  return out;
}

/**
 * Backslash-escapes the inline Markdown syntax characters in a run of plain
 * text, so prose survives a round-trip instead of being re-read as formatting.
 *
 * Deliberately narrow: `_` is only escaped at a word boundary (intra-word
 * underscores are not emphasis, and escaping `snake_case_name` makes the
 * Markdown unreadable), and `~` only as part of a `~~` pair.
 * @param {string} text
 * @returns {string}
 */
function _escapeInlineMd(text) {
  return text
    .replaceAll('\\', '\\\\')
    // An `&` that would read as a character reference has to become one itself,
    // otherwise the literal text "&copy;" comes back as ©.
    .replace(/&(?=#\d+;|#[xX][0-9a-fA-F]+;|[a-zA-Z][a-zA-Z0-9]*;)/g, '&amp;')
    .replace(/!(?=\[)/g, String.raw`\!`)
    .replace(/([`*[\]])/g, String.raw`\$1`)
    .replace(/(?<!\w)_|_(?!\w)/g, String.raw`\_`)
    .replace(/~(?=~)|(?<=~)~/g, String.raw`\~`);
}

/**
 * Escapes a leading block marker so a line of prose is not re-read as a
 * heading, quote, list item, thematic break or setext underline.
 * @param {string} line
 * @returns {string}
 */
function _escapeLineStart(line) {
  if (/^\s*(?:-{2,}|={2,}|\*{3,}|_{3,}|(?:[-*_] +){2,}[-*_])\s*$/.test(line)) {
    return line.replace(/[-=*_]/, (c) => `\\${c}`);
  }
  return line
    .replace(/^(\s*)(#{1,6})(?=\s|$)/, (_, ws, h) => `${ws}\\${h}`)
    .replace(/^(\s*)>/, (_, ws) => `${ws}\\>`)
    .replace(/^(\s*)([-*+])(?=\s)/, (_, ws, c) => `${ws}\\${c}`)
    .replace(/^(\s*)(\d+)([.)])(?=\s)/, (_, ws, n, d) => `${ws}${n}\\${d}`);
}

/** Applies _escapeLineStart() to every line of a multi-line block body. */
function _escapeBlockStarts(text) {
  return text.split('\n').map(_escapeLineStart).join('\n');
}

/**
 * Renders an `<a href>` / `<img src>` as a Markdown link destination, with the
 * element's `title` when it has one.
 *
 * A URL containing spaces or parentheses is wrapped in angle brackets, which is
 * the only form that survives re-parsing — `[x](http://e.com/a(b))` otherwise
 * closes at the inner `)`.
 * @param {Element} el
 * @param {'href'|'src'} attr
 * @returns {string}
 */
/**
 * Renders one `<li>`'s content for a list at `depth`.
 *
 * A list item holding more than one paragraph produced a second paragraph at
 * column 0, which re-parsed as a sibling paragraph that ended the list. Any
 * continuation line is therefore indented to the child column — nested lists
 * already carry that indent from their own `depth`, so they are left as they
 * are rather than shifted twice.
 * @param {Element} li
 * @param {number} depth
 * @returns {string}
 */
function _itemBody(li, depth) {
  const childIndent = '  '.repeat(depth + 1);
  return _domToMd(li, depth + 1).trim().split('\n')
    .map((line, idx) => {
      if (idx === 0 || line.trim() === '') return line;
      return line.startsWith(childIndent) ? line : childIndent + line;
    })
    .join('\n');
}

function _destination(el, attr) {
  const url = el.getAttribute(attr) || '';
  const wrapped = /[\s()]/.test(url) ? `<${url}>` : url;
  const title = el.getAttribute('title');
  return title ? `${wrapped} "${title.replaceAll('"', String.raw`\"`)}"` : wrapped;
}

function _domToMd(node, depth = 0) {
  if (node.nodeType === 3) {
    const text = node.textContent.replace(/\s+/g, ' ');
    // Text inside <code>/<pre> is already literal in Markdown; everywhere else
    // it has to be escaped or the user's own prose turns into formatting on the
    // way back — "2 * 3 * 4" came back as "2 <em> 3 </em> 4".
    return node.parentElement?.closest('pre, code') ? text : _escapeInlineMd(text);
  }
  if (node.nodeType !== 1) return '';

  const el = /** @type {Element} */ (node);
  const tag = el.nodeName.toLowerCase();
  const inner = () => Array.from(el.childNodes).map(n => _domToMd(n, depth)).join('');

  switch (tag) {
    case 'p':
    case 'div':      return `\n\n${_escapeBlockStarts(inner())}\n\n`;
    case 'br':       return '  \n';
    case 'h1':       return `\n\n# ${inner()}\n\n`;
    case 'h2':       return `\n\n## ${inner()}\n\n`;
    case 'h3':       return `\n\n### ${inner()}\n\n`;
    case 'h4':       return `\n\n#### ${inner()}\n\n`;
    case 'h5':       return `\n\n##### ${inner()}\n\n`;
    case 'h6':       return `\n\n###### ${inner()}\n\n`;
    case 'strong':
    case 'b':        return `**${inner()}**`;
    case 'em':
    case 'i':        return `*${inner()}*`;
    case 'del':
    case 's':
    case 'strike':   return `~~${inner()}~~`;
    case 'sup':      return `^${inner()}^`;
    case 'sub':      return `~${inner()}~`;
    case 'u':        return `<u>${inner()}</u>`;
    case 'span': {
      // Markdown has no native underline/color/size syntax; pass through as
      // raw inline HTML for the specific styles the editor's own toolbar
      // creates (foreColor/backColor/fontSize) — other noise spans (e.g. from
      // pasted content) are unwrapped to plain text as before.
      const style = el.getAttribute('style') || '';
      if (/\b(color|background-color|font-size)\s*:/.test(style)) {
        return `<span style="${_escAttr(style)}">${inner()}</span>`;
      }
      return inner();
    }
    case 'code': {
      // Inside <pre> we emit raw text; outside we wrap in backticks
      if (el.closest('pre')) return inner();
      const content = inner();
      // A code span has to be fenced by more backticks than the longest run it
      // contains, and padded with spaces when it starts or ends with one —
      // otherwise `a ` b` closes at the wrong backtick and mangles the text.
      const longestRun = Math.max(0, ...Array.from(content.matchAll(/`+/g), (m) => m[0].length));
      const fence = '`'.repeat(longestRun + 1);
      const pad = /^`|`$/.test(content) ? ' ' : '';
      return `${fence}${pad}${content}${pad}${fence}`;
    }
    case 'pre': {
      const codeEl = el.querySelector('code');
      const langMatch = /language-(\S+)/.exec(codeEl?.className || '');
      const lang = langMatch ? langMatch[1] : '';
      const content = _codeText(codeEl || el);
      // A block whose text already ends in a newline would otherwise gain a
      // blank line from the one added before the closing fence.
      return `\n\n\`\`\`${lang}\n${content.replace(/\n$/, '')}\n\`\`\`\n\n`;
    }
    case 'blockquote': {
      const rawLines = inner().trim().split('\n');
      // Collapse consecutive blank lines (from adjacent <p> blocks) into one.
      const lines = rawLines.filter((l, idx) => l.trim() !== '' || (rawLines[idx - 1] ?? '').trim() !== '');
      return `\n\n${lines.map((l) => (l.trim() === '' ? '>' : `> ${l}`)).join('\n')}\n\n`;
    }
    case 'a':  return `[${inner()}](${_destination(el, 'href')})`;
    case 'img': {
      const alt = _escapeInlineMd(el.getAttribute('alt') || '');
      return `![${alt}](${_destination(el, 'src')})`;
    }
    case 'ul': {
      const items = _directChildren(el, 'li');
      if (!items.length) return inner();
      const indent = '  '.repeat(depth);
      const isChecklist = el.classList.contains('an-checklist');
      const lines = items.map((li) => {
        const cb = /** @type {HTMLInputElement | undefined} */ (
          _directChildren(li, 'input').find((c) => c.getAttribute('type') === 'checkbox')
        );
        let prefix = '- ';
        if (isChecklist || cb) {
          const checked = cb ? cb.checked : false;
          prefix = checked ? '- [x] ' : '- [ ] ';
        }
        return `${indent}${prefix}${_itemBody(li, depth)}`;
      }).join('\n');
      return depth === 0 ? `\n\n${lines}\n\n` : `\n${lines}`;
    }
    case 'ol': {
      const items = _directChildren(el, 'li');
      if (!items.length) return inner();
      const indent = '  '.repeat(depth);
      // Preserve an explicit start; markdownToHTML already emits `start` for a
      // list that does not begin at 1, so dropping it here broke the round-trip.
      const start = Number.parseInt(el.getAttribute('start') || '1', 10);
      const first = Number.isFinite(start) ? start : 1;
      const lines = items.map((li, i) => `${indent}${first + i}. ${_itemBody(li, depth)}`).join('\n');
      return depth === 0 ? `\n\n${lines}\n\n` : `\n${lines}`;
    }
    case 'li':  return inner();
    case 'hr':  return '\n\n---\n\n';
    case 'table': {
      const allRows = Array.from(el.querySelectorAll('tr'));
      if (!allRows.length) return inner();
      const theadEl = _directChildren(el, 'thead')[0];
      const firstRowIsHeader = !!theadEl || (
        allRows[0].children.length > 0 &&
        Array.from(allRows[0].children).every((c) => c.tagName === 'TH')
      );
      const cellTexts = allRows.map((tr) =>
        Array.from(tr.querySelectorAll('th, td')).map((c) =>
          _escapeInlineMd(c.textContent.trim()).replaceAll('|', String.raw`\|`)),
      );
      const cols = Math.max(...cellTexts.map((r) => r.length));
      const padRow = (row) => { const r = [...row]; while (r.length < cols) r.push(''); return r; };
      const bodyStart = firstRowIsHeader ? 1 : 0;
      const headerCells = firstRowIsHeader ? padRow(cellTexts[0]) : new Array(cols).fill('');
      // Carry per-column alignment back into the delimiter row. markdownToHTML
      // writes it out as `text-align`, so without this a round-trip through
      // Markdown silently left every column default-aligned.
      const alignRow = Array.from({ length: cols }, (_unused, c) => {
        const cell = allRows[0]?.children[c];
        const align = /text-align:\s*(left|center|right)/.exec(cell?.getAttribute('style') || '')?.[1];
        if (align === 'center') return ':---:';
        if (align === 'right') return '---:';
        if (align === 'left') return ':---';
        return '---';
      });
      let md = '\n\n';
      md += `| ${headerCells.join(' | ')} |\n`;
      md += `| ${alignRow.join(' | ')} |\n`;
      for (let r = bodyStart; r < cellTexts.length; r++) {
        md += `| ${padRow(cellTexts[r]).join(' | ')} |\n`;
      }
      return md + '\n';
    }
    default: return inner();
  }
}

/**
 * Removes a leading UTF-8 byte-order mark.
 *
 * `FileReader.readAsText` keeps the BOM, and editors on Windows write one by
 * default, so a dropped `.md` file arrived with U+FEFF glued to its first
 * character: the opening heading parsed as a paragraph and isMarkdown()
 * rejected the file outright.
 * @param {string} text
 * @returns {string}
 */
function _stripBOM(text) {
  return String(text ?? '').replace(/^\ufeff/, '');
}

/**
 * Detects whether a string likely contains Markdown syntax.
 *
 * Checks for common Markdown constructs such as ATX headings, unordered or
 * ordered list items, blockquotes, fenced code blocks, and bold emphasis.
 * @param {string} rawText - Input text to inspect for Markdown patterns.
 * @returns {boolean} `true` if any Markdown-like pattern is present, `false` otherwise.
 */
export function isMarkdown(rawText) {
  const text = _stripBOM(rawText);
  return /^#{1,6} [^\s]|^[ \t]*[-*+] [^\s]|^[ \t]*\d+[.)] [^\s]|^> ?[^\s]|^ {0,3}(?:`{3,}|~{3,})|^\*{2}[^*\n]+\*{2}/m.test(text)
    || /^.+\n=+\s*$/m.test(text)
    || /^.+\n-{2,}\s*$/m.test(text)
    || /^---[ \t]*\n(?:[\s\S]*?\n)?(?:---|\.\.\.)[ \t]*(?:\n|$)/.test(text)
    || /^\|.+\|[ \t]*\n\|[ \t:|-]+\|/m.test(text)
    // Pipe table without outer pipes: `a | b` over `--- | ---`.
    || /^[^\n|]*\|[^\n]*\n[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)+$/m.test(text)
    // A link or image plus at least one other inline marker — either alone is
    // too weak a signal (bare URLs and "(see note)" are ordinary prose), but
    // together they reliably indicate Markdown rather than a plain-text body.
    || (/!?\[[^\]\n]*\]\([^)\n]*\)/.test(text) && /`[^`\n]+`|\*\*[^*\n]+\*\*|^#{1,6} |^[-*+] /m.test(text));
}

// Blockquote line: optional up-to-3 leading spaces, '>', optional single space, rest of line.
const BQ_RE = /^ {0,3}>( ?)(.*)$/;
// Indented code block: 4+ spaces or a leading tab, with actual content after it.
const INDENTED_CODE_RE = /^(?: {4}|\t)\s*\S/;
// Opening fence: up to 3 spaces, then 3+ backticks or 3+ tildes, then an info string.
const FENCE_RE = /^( {0,3})(`{3,}|~{3,})[ \t]*([^\s`~][^\n]*)?$/;

/**
 * Parses `line` as an opening code fence, or returns null.
 *
 * A backtick fence's info string may not contain a backtick (CommonMark) —
 * without that rule ```` ```` `` wrongly reads as a fence whose language is a
 * backtick, and a line like "``a ` b``" reads as a fence instead of a code span.
 * @param {string} line
 * @returns {{ marker: string, length: number, indent: number, lang: string }|null}
 */
function _openingFence(line) {
  const m = FENCE_RE.exec(line);
  if (!m) return null;
  // The info-string group is optional, so it is undefined on a bare fence.
  const [, indent, fence, info = ''] = m;
  if (fence[0] === '`' && info.includes('`')) return null;
  return {
    marker: fence[0],
    length: fence.length,
    indent: indent.length,
    // Only the first word of the info string is the language.
    lang: info.trim().split(/\s+/)[0] || '',
  };
}

/**
 * Removes up to `count` leading space-equivalents, expanding a leading tab to
 * the next 4-column stop the way CommonMark does.
 * @param {string} line
 * @param {number} count
 * @returns {string}
 */
function _stripIndent(line, count) {
  let removed = 0;
  let idx = 0;
  while (idx < line.length && removed < count) {
    if (line[idx] === ' ') { removed += 1; idx += 1; continue; }
    if (line[idx] === '\t') {
      const width = 4 - (removed % 4);
      if (removed + width > count) break;
      removed += width;
      idx += 1;
      continue;
    }
    break;
  }
  return line.slice(idx);
}
// Horizontal rule: 3+ of the same character (-, * or _), optionally space-separated.
const HR_RE = /^ {0,3}([-*_])( *\1){2,}\s*$/;
// Hard-break marker — placed between paragraph lines that end in a
// CommonMark hard-break (trailing 2+ spaces or a trailing backslash),
// restored to <br> after _inline() runs. Distinct from _inline()'s own MARK.
const HARD_BREAK = String.fromCharCode(1);

/**
 * Converts a Markdown string to an HTML string.
 * @param {string} text
 * @returns {string}
 */
export function markdownToHTML(text) {
  let lines = _stripBOM(text).replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
  lines = _stripFrontmatter(lines);
  const refs = _extractReferenceDefinitions(lines);
  lines = refs.clean;
  _linkDefs = refs.linkDefs;
  _footnoteIds = refs.footnoteIds;
  return _parseBlocks(lines);
}

/**
 * Parses a line array into block-level HTML. Called recursively for content
 * nested inside a blockquote so nested quotes and block content (lists,
 * headings, etc.) inside `>` are parsed the same as top-level content.
 * @param {string[]} lines
 * @returns {string}
 */
function _parseBlocks(lines) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ---- Fenced code block  ```lang / ~~~lang ... ----------------------------
    const fence = _openingFence(line);
    if (fence) {
      const closeRe = new RegExp(`^ {0,3}\\${fence.marker}{${fence.length},}[ \t]*$`);
      const codeLines = [];
      i++;
      while (i < lines.length && !closeRe.test(lines[i])) {
        // CommonMark strips up to as many leading spaces as the opening fence
        // was indented by, so an indented fence keeps its code left-aligned.
        codeLines.push(_escCode(_stripIndent(lines[i], fence.indent)));
        i++;
      }
      const langAttr = fence.lang ? ` class="language-${_escAttr(fence.lang)}"` : '';
      out.push(`<pre><code${langAttr}>${codeLines.join('\n')}</code></pre>`);
      i++; // skip closing fence (no-op at EOF — an unclosed fence runs to the end)
      continue;
    }

    // ---- Indented code block (4 spaces or a tab) -----------------------------
    // Only reachable at a block boundary: an indented line following a
    // paragraph is consumed as a lazy continuation before it gets here, which
    // matches CommonMark's rule that indented code cannot interrupt a paragraph.
    if (INDENTED_CODE_RE.test(line)) {
      const codeLines = [];
      while (i < lines.length && (INDENTED_CODE_RE.test(lines[i]) || lines[i].trim() === '')) {
        // A trailing run of blank lines belongs to whatever follows, not to the
        // code block, so only keep blanks that have more code after them.
        if (lines[i].trim() === '') {
          let j = i;
          while (j < lines.length && lines[j].trim() === '') j++;
          if (j >= lines.length || !INDENTED_CODE_RE.test(lines[j])) break;
          for (; i < j; i++) codeLines.push('');
          continue;
        }
        codeLines.push(_escCode(_stripIndent(lines[i], 4)));
        i++;
      }
      out.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
      continue;
    }

    // ---- Setext headings (Title\n=== or Title\n---) -------------------------
    if (line.trim() && !HR_RE.test(line) && !/^#{1,6} /.test(line) && i + 1 < lines.length) {
      if (/^=+\s*$/.test(lines[i + 1])) {
        out.push(`<h1>${_inline(line.trim())}</h1>`);
        i += 2;
        continue;
      }
      if (/^-{2,}\s*$/.test(lines[i + 1])) {
        out.push(`<h2>${_inline(line.trim())}</h2>`);
        i += 2;
        continue;
      }
    }

    // ---- Horizontal rule --- / *** / ___ / - - - / * * * ----------------------
    if (HR_RE.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // ---- ATX Headings # – ######  -------------------------------------------
    // The title may be empty: "# " on its own is a valid empty heading. It also
    // has to match here, because the paragraph collector below refuses any line
    // starting with a heading marker — a line this regex rejected but that one
    // also skipped consumed nothing, and the block loop spun forever.
    const hMatch = /^(#{1,6})[ \t]+(.*)$/.exec(line);
    if (hMatch) {
      const level = hMatch[1].length;
      // Strip an optional closing sequence of #'s (e.g. "## Heading ##"),
      // only when preceded by whitespace — "Heading#" (no space) is untouched.
      const content = hMatch[2].replace(/(?:^|\s)#+\s*$/, '');
      out.push(`<h${level}>${_inline(content)}</h${level}>`);
      i++;
      continue;
    }

    // ---- Blockquote  > text --------------------------------------------------
    if (BQ_RE.test(line)) {
      const bqLines = [];
      while (i < lines.length && BQ_RE.test(lines[i])) {
        bqLines.push(BQ_RE.exec(lines[i])[2]);
        i++;
      }
      out.push(`<blockquote>${_parseBlocks(bqLines)}</blockquote>`);
      continue;
    }

    // ---- Checklist or Unordered list  - / * / + item  ----------------------
    if (/^[-*+] /.test(line)) {
      const { html: listHtml, endIdx } = _parseListBlock(lines, i);
      out.push(listHtml); i = endIdx; continue;
    }

    // ---- Ordered list  1. item  ----------------------------------------------
    if (/^\d+[.)] /.test(line)) {
      const { html: listHtml, endIdx } = _parseListBlock(lines, i);
      out.push(listHtml); i = endIdx; continue;
    }

    // ---- Blank line ----------------------------------------------------------
    if (line.trim() === '') {
      i++;
      continue;
    }

    // ---- GFM Table  | col | col | -------------------------------------------
    // A table starts with a pipe-prefixed or pipe-containing line followed by
    // a separator row (| --- | --- |). We detect and collect all rows.
    if (_isTableStart(lines, i)) {
      const headerCells = _parseTableRow(line);
      const alignments = _parseTableRow(lines[i + 1]).map((c) => {
        if (c.startsWith(':') && c.endsWith(':')) return 'center';
        if (c.endsWith(':')) return 'right';
        if (c.startsWith(':')) return 'left';
        return null;
      });
      i += 2; // skip header + separator
      const bodyRows = [];
      while (i < lines.length && lines[i].trim() !== '' && _countTableCells(lines[i]) > 1) {
        bodyRows.push(_parseTableRow(lines[i]));
        i++;
      }
      const _cell = (tag, content, align) => {
        const s = align ? ` style="text-align:${align}"` : '';
        return `<${tag}${s}>${_inline(content)}</${tag}>`;
      };
      const thCells = headerCells.map((c, idx) => _cell('th', c, alignments[idx])).join('');
      const thead = `<thead><tr>${thCells}</tr></thead>`;
      const renderRow = (row) => `<tr>${row.map((c, idx) => _cell('td', c, alignments[idx])).join('')}</tr>`;
      const tbody = bodyRows.length ? `<tbody>${bodyRows.map(renderRow).join('')}</tbody>` : '';
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // ---- Paragraph: collect consecutive non-block lines ---------------------
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6} |[-*+] |\d+[.)] )/.test(lines[i]) &&
      !_openingFence(lines[i]) &&
      !BQ_RE.test(lines[i]) &&
      !HR_RE.test(lines[i]) &&
      !_isTableStart(lines, i) &&
      !(i + 1 < lines.length && /^=+\s*$/.test(lines[i + 1])) &&
      !(i + 1 < lines.length && /^-{2,}\s*$/.test(lines[i + 1]))
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      out.push(`<p>${_inline(_joinParagraphLines(paraLines)).replaceAll(HARD_BREAK, '<br>')}</p>`);
    } else {
      // Nothing above consumed this line and the paragraph collector rejected
      // it too. That combination is a bug in one of the branches, but the loop
      // must still move: spinning here froze the page on input as ordinary as a
      // heading marker with nothing after it. Emit the line and move on.
      out.push(`<p>${_inline(line)}</p>`);
      i++;
    }
  }

  return out.join('');
}

// ---------------------------------------------------------------------------
// Inline formatting
// ---------------------------------------------------------------------------

/** Reference-link and footnote definitions collected per markdownToHTML() call. */
let _linkDefs = new Map();
let _footnoteIds = new Set();

/**
 * Strips a leading YAML frontmatter block (--- ... --- or --- ... ...) from
 * the line array, only when it is the very first line and the enclosed body
 * looks like YAML (key: value / list items / indented continuations) — this
 * disambiguates real frontmatter from a horizontal rule followed by prose.
 * @param {string[]} lines
 * @returns {string[]}
 */
function _stripFrontmatter(lines) {
  if ((lines[0] || '').trim() !== '---') return lines;
  let closeIdx = -1;
  for (let j = 1; j < lines.length; j++) {
    const t = lines[j].trim();
    if (t === '---' || t === '...') { closeIdx = j; break; }
  }
  if (closeIdx === -1) return lines;

  const body = lines.slice(1, closeIdx);
  const looksLikeYAML = body.every((l) =>
    l.trim() === '' ||
    /^[ \t]*[\w$.-]+\s*:(\s|$)/.test(l) ||
    /^[ \t]*-\s+\S/.test(l) ||
    /^[ \t]+\S/.test(l));
  if (!looksLikeYAML) return lines;

  let start = closeIdx + 1;
  if (lines[start] !== undefined && lines[start].trim() === '') start++;
  return lines.slice(start);
}

/**
 * Extracts GFM reference-link definitions (`[ref]: url "title"`) and footnote
 * definitions (`[^id]: text`) from the line array, skipping fenced code
 * regions. Returns the definition-free line array plus lookup maps.
 * @param {string[]} lines
 * @returns {{ clean: string[], linkDefs: Map<string, {href: string, title?: string}>, footnoteIds: Set<string> }}
 */
function _extractReferenceDefinitions(lines) {
  const linkDefs = new Map();
  const footnoteIds = new Set();
  const clean = [];
  let inFence = false;
  const linkDefRe = /^\[([^\]]+)\]:\s*(\S+)(?:\s+"([^"]*)")?\s*$/;
  const footnoteDefRe = /^\[\^([^\]]+)\]:[ \t]*(\S.*)$/;

  for (const line of lines) {
    // Definitions inside a fenced block are literal code, not definitions.
    if (inFence) {
      if (/^ {0,3}(?:`{3,}|~{3,})[ \t]*$/.test(line)) inFence = false;
      clean.push(line);
      continue;
    }
    if (_openingFence(line)) { inFence = true; clean.push(line); continue; }
    {
      const fm = footnoteDefRe.exec(line);
      if (fm) { footnoteIds.add(fm[1]); continue; }
      const lm = linkDefRe.exec(line);
      if (lm) { linkDefs.set(lm[1].trim().toLowerCase(), { href: lm[2], title: lm[3] }); continue; }
    }
    clean.push(line);
  }
  return { clean, linkDefs, footnoteIds };
}

/**
 * Joins a paragraph's source lines into one string, converting CommonMark
 * hard-break markers (a trailing backslash, or 2+ trailing spaces) on all
 * but the last line into a HARD_BREAK placeholder instead of a plain space.
 * @param {string[]} paraLines
 * @returns {string}
 */
function _joinParagraphLines(paraLines) {
  let joined = '';
  for (let idx = 0; idx < paraLines.length; idx++) {
    const isLast = idx === paraLines.length - 1;
    // Leading whitespace on a continuation line is not content — CommonMark
    // strips it before joining, so an indented lazy continuation does not carry
    // its indent into the paragraph text.
    const ln = paraLines[idx].replace(/^[ \t]+/, '');
    if (!isLast && /\\$/.test(ln)) { joined += ln.replace(/\\$/, '') + HARD_BREAK; continue; }
    if (!isLast && / {2,}$/.test(ln)) { joined += ln.replace(/ {2,}$/, '') + HARD_BREAK; continue; }
    joined += ln + (isLast ? '' : ' ');
  }
  return joined;
}

/**
 * Splits a GFM table row string into trimmed cell strings, treating an
 * escaped pipe (`\|`) as a literal character rather than a cell separator.
 * '| a | b | c |' → ['a', 'b', 'c']; '| a\|b | c |' → ['a|b', 'c']
 * @param {string} row
 * @returns {string[]}
 */
/** Number of cells a GFM table row would split into. */
function _countTableCells(line) {
  return _parseTableRow(line).length;
}

/**
 * True when `lines[i]` is a GFM table header followed by a delimiter row.
 *
 * Leading and trailing pipes are optional in GFM (`a | b` / `--- | ---` is a
 * valid table), so the delimiter row is identified by shape instead.
 *
 * The pipe-delimited form stays deliberately lenient — a ragged table whose
 * delimiter row is short still renders, columns past it just unaligned. The
 * bare form has to be stricter, matching header and delimiter cell counts:
 * without that, prose containing a pipe followed by a `---` line would be read
 * as a one-column table instead of the setext heading it is.
 * @param {string[]} lines
 * @param {number} i
 * @returns {boolean}
 */
function _isTableStart(lines, i) {
  const header = lines[i];
  const delim = lines[i + 1];
  if (delim === undefined || !header.includes('|')) return false;

  if (/^\|.+\|/.test(header)) return /^\|[\s|:-]+\|/.test(delim);

  const delimCells = _parseTableRow(delim);
  if (delimCells.length < 2 || !delimCells.every((c) => /^:?-+:?$/.test(c))) return false;
  return _countTableCells(header) === delimCells.length;
}

function _parseTableRow(row) {
  const trimmed = row.replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let cur = '';
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '\\' && trimmed[i + 1] === '|') { cur += '|'; i++; continue; }
    if (trimmed[i] === '|') { cells.push(cur); cur = ''; continue; }
    cur += trimmed[i];
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

function _parseListBlock(lines, startIdx) {
  const baseIndent = (lines[startIdx].match(/^(\s*)/)[1]).length;
  const isOL = /^\s*\d+[.)] /.test(lines[startIdx]);
  const items = [];
  let firstIsCB = null;
  let loose = false;
  let pendingBlank = false;
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      // A blank line only ends the list if what follows isn't a continuation
      // of it (another item at the same marker/indent, or indented text
      // belonging to the current item) — otherwise it marks a "loose" list.
      const next = lines[i + 1];
      const nextIndent = next !== undefined ? (next.match(/^(\s*)/)[1]).length : -1;
      const nextIsSameItem = next !== undefined &&
        /^\s*(?:[-*+]|\d+[.)]) /.test(next) &&
        (/^\s*\d+[.)] /.test(next) === isOL) &&
        nextIndent === baseIndent;
      const nextIsContinuation = next !== undefined && next.trim() !== '' && nextIndent > baseIndent;
      if (!items.length || (!nextIsSameItem && !nextIsContinuation)) break;
      loose = true;
      pendingBlank = true;
      i++;
      continue;
    }

    const indent = (line.match(/^(\s*)/)[1]).length;
    if (indent < baseIndent) break;

    if (indent === baseIndent) {
      if (!/^\s*(?:[-*+]|\d+[.)]) /.test(line)) break;
      if (/^\s*\d+[.)] /.test(line) !== isOL) break;
      const raw = isOL ? line.replace(/^\s*\d+[.)] /, '') : line.replace(/^\s*[-*+] /, '');
      // Checklists are intentionally UL-only: sanitise.js's checkbox guard,
      // the injected checklist CSS, and every checklist-toggle command are
      // all hardcoded to `ul.an-checklist` with no `ol` equivalent, so an
      // ordered-list checkbox would be stripped by the sanitiser and get no
      // styling even if parsed here — "1. [ ] item" intentionally stays plain.
      const isCB = !isOL && /^\[[ xX]\]\s+/.test(raw);
      if (firstIsCB === null) firstIsCB = isCB;
      if (isCB !== firstIsCB) break;
      const checked = isCB && raw[1].toLowerCase() === 'x';
      const text = isCB ? raw.replace(/^\[[ xX]\]\s+/, '') : raw;
      items.push({ paras: [text], isCB, checked, sub: '' });
      pendingBlank = false;
      i++;
    } else {
      if (!items.length) { i++; continue; }

      // A fenced block belonging to this item. Without this the fence lines
      // were folded into the item's paragraph text and the inline code-span
      // rule chewed them up — "- a\n\n  ```js\n  x\n  ```" came out as
      // <li><p>a</p><p><code><code>js x </code></code></p></li>, with the
      // snippet's line breaks gone.
      const dedent = (l) => _stripIndent(l, indent);
      const fence = _openingFence(dedent(line));
      if (fence) {
        const closeRe = new RegExp(`^ {0,3}\\${fence.marker}{${fence.length},}[ \t]*$`);
        const blockLines = [dedent(lines[i])];
        i++;
        while (i < lines.length && !closeRe.test(dedent(lines[i]))) {
          blockLines.push(dedent(lines[i]));
          i++;
        }
        if (i < lines.length) { blockLines.push(dedent(lines[i])); i++; }
        // Appended to `sub` so it keeps its position relative to a nested list.
        items[items.length - 1].sub += _parseBlocks(blockLines);
        pendingBlank = false;
        continue;
      }

      if (/^\s*(?:[-*+]|\d+[.)]) /.test(line)) {
        const nested = _parseListBlock(lines, i);
        items[items.length - 1].sub += nested.html;
        i = nested.endIdx;
        pendingBlank = false;
      } else if (pendingBlank) {
        items[items.length - 1].paras.push(line.trim());
        pendingBlank = false;
        i++;
      } else {
        const paras = items[items.length - 1].paras;
        paras[paras.length - 1] += ' ' + line.trim();
        i++;
      }
    }
  }

  const hasCB = !isOL && (firstIsCB === true);
  const startMatch = isOL ? /^\s*(\d+)[.)] /.exec(lines[startIdx]) : null;
  const startNum = startMatch ? Number.parseInt(startMatch[1], 10) : 1;
  const open = isOL
    ? (startNum !== 1 ? `<ol start="${startNum}">` : '<ol>')
    : (hasCB ? '<ul class="an-checklist">' : '<ul>');
  const close = isOL ? '</ol>' : '</ul>';
  const liHTML = items.map(({ paras, isCB, checked, sub }) => {
    const cbHTML = isCB
      ? `<input type="checkbox" contenteditable="false"${checked ? ' checked' : ''}>`
      : '';
    const body = loose
      ? paras.map((p, idx) => `<p>${idx === 0 ? cbHTML : ''}${_inline(p)}</p>`).join('')
      : `${cbHTML}${_inline(paras[0])}`;
    return `<li>${body}${sub}</li>`;
  }).join('');
  return { html: `${open}${liHTML}${close}`, endIdx: i };
}

// Backslash-escapable punctuation. This is CommonMark's full ASCII-punctuation
// set rather than just the characters this converter emits syntax for: the
// escaper on the htmlToMarkdown side has to be able to neutralise a leading
// "- ", "1. " or "---", and those only round-trip if the parser also unescapes
// them.
const ESCAPABLE_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
// Placeholder marker for escaped literals — a NUL character can't appear in
// real markdown text, so it's safe as a delimiter. Built at runtime (not
// written as a literal escape) to avoid embedding a raw NUL byte in this file.
const MARK = String.fromCharCode(0);

// Placeholder delimiter for extracted code spans. Distinct from MARK and
// HARD_BREAK; like them it survives _esc() untouched and matches no syntax rule.
const CODE_MARK = String.fromCharCode(2);
// A code span: a run of backticks, the shortest content that reaches a matching
// run, and that run again.
const CODE_SPAN_RE = /(`+)([^]*?)\1/g;

/**
 * Pulls code spans out before anything else looks at the text.
 *
 * Their content is literal: no emphasis, no links, no backslash escapes, and no
 * character references — `&amp;` inside backticks has to survive as those five
 * characters. Extracting first is the only way to tell an `&lt;` the author
 * typed from one _esc() produced out of a raw `<`.
 * @param {string} text
 * @returns {{ text: string, codes: string[] }}
 */
function _extractCodeSpans(text) {
  const codes = [];
  const replaced = text.replace(CODE_SPAN_RE, (whole, ticks, content) => {
    // An empty span (`` with nothing between) is literal text in CommonMark.
    if (content === '') return whole;
    codes.push(content);
    return `${CODE_MARK}${codes.length - 1}${CODE_MARK}`;
  });
  return { text: replaced, codes };
}

/**
 * Restores extracted code spans as `<code>` elements, escaping their content
 * as literal code.
 * @param {string} text
 * @param {string[]} codes
 * @param {string[]} literals - backslash-escaped characters, for spans containing them
 * @returns {string}
 */
function _restoreCodeSpans(text, codes, literals) {
  return text.replace(new RegExp(`${CODE_MARK}(\\d+)${CODE_MARK}`, 'g'), (_, idx) => {
    let c = codes[Number(idx)];
    // A backslash escape is not an escape inside a code span — put the
    // backslash back so `a\*b` shows as written.
    c = c.replace(new RegExp(`${MARK}(\\d+)${MARK}`, 'g'), (_m, i) => `\\${literals[Number(i)]}`);
    // CommonMark strips one leading and trailing space when both are present,
    // which is what lets a span hold a leading or trailing backtick.
    if (c.length > 2 && c.startsWith(' ') && c.endsWith(' ') && c.trim() !== '') c = c.slice(1, -1);
    return `<code>${_escCode(c)}</code>`;
  });
}

/**
 * Step 0 of _inline(): replaces backslash-escaped punctuation with inert
 * placeholders so later syntax regexes can't match them.
 * @param {string} text
 * @returns {{ text: string, literals: string[] }}
 */
function _extractBackslashEscapes(text) {
  const literals = [];
  const replaced = text.replace(ESCAPABLE_RE, (_, ch) => {
    literals.push(ch);
    return `${MARK}${literals.length - 1}${MARK}`;
  });
  return { text: replaced, literals };
}

/**
 * Restores placeholders from _extractBackslashEscapes(), HTML-escaping each
 * literal since it's inserted directly into the output.
 * @param {string} text
 * @param {string[]} literals
 * @returns {string}
 */
function _restoreBackslashEscapes(text, literals) {
  return text.replace(new RegExp(`${MARK}(\\d+)${MARK}`, 'g'), (_, idx) => _esc(literals[Number(idx)]));
}

// Inline link/image destination. The angle-bracket alternative comes first so a
// URL containing `)` — `[x](<http://e.com/a(b)>)` — is taken whole instead of
// being cut at the inner parenthesis. Matched against _esc()'d text, so the
// brackets appear as entities.
const DEST = String.raw`(&lt;.*?&gt;(?:\s+(?:"[^"]*"|'[^']*'))?|[^)]*)`;
const IMAGE_RE = new RegExp(String.raw`!\[([^\]]*)\]\(${DEST}\)`, 'g');
const LINK_RE = new RegExp(String.raw`\[([^\]]+)\]\(${DEST}\)`, 'g');

/**
 * Splits an inline link destination into its URL and optional title:
 * `url`, `url "title"`, `url 'title'`, `<url with spaces>`, `<url> "title"`.
 *
 * Without this the whole `url "title"` string landed in `href`, producing a
 * link that simply does not resolve — the title is extremely common in
 * generated Markdown, so this silently broke a lot of pasted content.
 *
 * Operates on _esc()'d text, hence the `&lt;`/`&gt;` comparisons.
 * @param {string} dest
 * @returns {{ href: string, title: string }}
 */
function _splitDestAndTitle(dest) {
  const s = dest.trim();

  // Angle-bracket destination: everything up to the closing bracket is the URL,
  // so it may contain spaces and parentheses.
  const angle = /^&lt;([\s\S]*?)&gt;(?:[ \t]*(?:"([^"]*)"|'([^']*)'))?[ \t]*$/.exec(s);
  if (angle) return { href: angle[1], title: angle[2] ?? angle[3] ?? '' };

  const withTitle = /^(\S+)\s+(?:"([^"]*)"|'([^']*)')\s*$/.exec(s);
  if (withTitle) return { href: withTitle[1], title: withTitle[2] ?? withTitle[3] ?? '' };

  return { href: s, title: '' };
}

/**
 * Resolves images, inline links, GFM reference-style links (explicit,
 * shortcut, and bare/implicit forms), and footnote markers. Must run on text
 * already passed through _esc() — see _inline()'s Step 1 comment.
 * @param {string} text
 * @returns {string}
 */
function _resolveLinksAndFootnotes(text) {
  text = text.replace(IMAGE_RE, (_, alt, dest) => {
    const { href, title } = _splitDestAndTitle(dest);
    const titleAttr = title ? ` title="${_escAttrQuotes(title)}"` : '';
    return `<img src="${_escAttrQuotes(href)}" alt="${_escAttrQuotes(alt)}"${titleAttr} class="an-image">`;
  });
  text = text.replace(LINK_RE, (_, label, dest) => {
    const { href, title } = _splitDestAndTitle(dest);
    const titleAttr = title ? ` title="${_escAttrQuotes(title)}"` : '';
    return `<a href="${_escAttrQuotes(href)}"${titleAttr}>${label}</a>`;
  });
  text = text.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (m, label, ref) => {
    const def = _linkDefs.get(_unescAmpLtGt(ref || label).trim().toLowerCase());
    if (!def) return m;
    const titleAttr = def.title ? ` title="${_escAttr(def.title)}"` : '';
    return `<a href="${_escAttr(def.href)}"${titleAttr}>${label}</a>`;
  });
  text = text.replace(/\[([^\]]+)\]/g, (m, label) => {
    const def = _linkDefs.get(_unescAmpLtGt(label).trim().toLowerCase());
    if (!def) return m;
    const titleAttr = def.title ? ` title="${_escAttr(def.title)}"` : '';
    return `<a href="${_escAttr(def.href)}"${titleAttr}>${label}</a>`;
  });
  text = text.replace(/\[\^([^\]]+)\]/g, (m, id) => (_footnoteIds.has(_unescAmpLtGt(id)) ? `<sup>[${id}]</sup>` : m));
  return text;
}

/**
 * Converts angle-bracket (`<https://...>`) and bare (`https://...`)
 * autolinks. Runs after _resolveLinksAndFootnotes() so an already-linked URL
 * isn't reprocessed, and on already-_esc()'d text (see _inline()).
 * @param {string} text
 * @returns {string}
 */
function _applyAutolinks(text) {
  text = text.replace(/&lt;(https?:\/\/[^\s&]+?)&gt;/g, (_, url) => `<a href="${_escAttrQuotes(url)}">${url}</a>`);
  // Email autolink — CommonMark's `<user@host>` form gets a mailto: href.
  text = text.replace(
    /&lt;([\w.!#$%&'*+/=?^`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+)&gt;/g,
    (_, addr) => `<a href="mailto:${_escAttrQuotes(addr)}">${addr}</a>`,
  );
  text = text.replace(/(^|[\s(])(https?:\/\/[^\s()]+)/g, (m, pre, rawUrl) => {
    const trail = /[.,;:!?)]+$/.exec(rawUrl);
    const url = trail ? rawUrl.slice(0, -trail[0].length) : rawUrl;
    if (!url) return m;
    const suffix = trail ? trail[0] : '';
    return `${pre}<a href="${_escAttrQuotes(url)}">${url}</a>${suffix}`;
  });
  return text;
}

/**
 * Applies bold/italic/bold-italic (asterisk and underscore forms — underscore
 * requires a non-word-character boundary per CommonMark), strikethrough, and
 * inline code.
 * @param {string} text
 * @returns {string}
 */
function _applyEmphasisAndCode(text) {
  text = text.replace(/\*{3}([^*\n]+?)\*{3}/g, (_, c) => `<strong><em>${c}</em></strong>`);
  text = text.replace(/(?<!\w)_{3}([^_\n]+?)_{3}(?!\w)/g, (_, c) => `<strong><em>${c}</em></strong>`);
  text = text.replace(/\*{2}([^*\n]+?)\*{2}/g, (_, c) => `<strong>${c}</strong>`);
  text = text.replace(/(?<!\w)_{2}([^_\n]+?)_{2}(?!\w)/g, (_, c) => `<strong>${c}</strong>`);
  text = text.replace(/\*([^*\n]+?)\*/g, (_, c) => `<em>${c}</em>`);
  text = text.replace(/(?<!\w)_([^_\n]+?)_(?!\w)/g, (_, c) => `<em>${c}</em>`);
  text = text.replace(/~~([^~\n]+?)~~/g, (_, c) => `<del>${c}</del>`);
  return text;
}

function _inline(text) {
  // Step 0: backslash escapes (\* \_ \` \# \[ \] \( \) \> \\ \~ \|) — replaced
  // with inert placeholders before any syntax regex below can match them, so
  // e.g. \*not bold\* never gets treated as emphasis. Restored at the end.
  // Backslash escapes first, so an escaped backtick cannot open a code span.
  // Code spans come out next: their content is literal, and must not be seen by
  // the entity, link or emphasis passes below.
  const { text: withoutEscapes, literals } = _extractBackslashEscapes(text);
  const { text: withoutCode, codes } = _extractCodeSpans(withoutEscapes);

  // Step 1: escape raw &/</> in the plain-text parts of the string exactly
  // once, up front — none of these are markdown-syntax characters used below,
  // so this doesn't interfere with matching. Capture-group content in the
  // steps below is therefore ALREADY escaped and must NOT be re-escaped;
  // attribute values captured from `text` only need quotes escaped
  // (_escAttrQuotes), since & < > are already entities. Values that come from
  // _linkDefs (sourced from the raw, unescaped line array) still need the
  // full _escAttr/_esc treatment.
  let result = _esc(withoutCode);

  result = _resolveLinksAndFootnotes(result);
  result = _applyAutolinks(result);
  result = _applyEmphasisAndCode(result);

  return _restoreCodeSpans(_restoreBackslashEscapes(result, literals), codes, literals);
}

// A complete named / decimal / hex character reference. An `&` that starts one
// is left alone so `&copy;` survives as a copyright sign instead of rendering
// as the literal text "&copy;". Everything the sanitiser cares about is decided
// after this, on the parsed DOM, so preserving references does not widen what
// can get through.
const ENTITY_RE = /&(?!#\d+;|#[xX][0-9a-fA-F]+;|[a-zA-Z][a-zA-Z0-9]*;)/g;

function _esc(v) {
  return String(v)
    .replace(ENTITY_RE, '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Escaper for code content. Unlike _esc() it escapes every `&`, because a
 * character reference is not recognised inside a code span or code block —
 * `&amp;` written in a fence has to survive as those five literal characters
 * rather than rendering as `&`.
 * @param {string} v
 * @returns {string}
 */
function _escCode(v) {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function _escAttr(v) {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** Escapes only quote characters — for attribute values already run through _esc(). */
function _escAttrQuotes(v) {
  return String(v).replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/** Reverses _esc()'s &amp;/&lt;/&gt; substitutions, for matching against un-escaped _linkDefs/_footnoteIds keys. */
function _unescAmpLtGt(v) {
  return String(v).replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}
