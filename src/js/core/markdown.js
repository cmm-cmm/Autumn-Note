/**
 * markdown.js - Lightweight Markdown → HTML converter for paste handling.
 *
 * Handles: headings H1–H6, bold/italic/strikethrough/inline-code, fenced code
 * blocks (with language), blockquotes, unordered/ordered lists, horizontal
 * rules, links, images, and plain paragraphs.
 *
 * The HTML output MUST be passed through sanitiseHTML() before insertion.
 */

/**
 * Converts an HTML string to Markdown.
 * Handles: headings, paragraphs, bold/italic/del/code, links, images,
 * unordered/ordered lists, blockquote, pre/code blocks, tables, hr.
 * @param {string} html
 * @returns {string}
 */
export function htmlToMarkdown(html) {
  const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');
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
function _domToMd(node, depth = 0) {
  if (node.nodeType === 3) {
    return node.textContent.replace(/\s+/g, ' ');
  }
  if (node.nodeType !== 1) return '';

  const el = /** @type {Element} */ (node);
  const tag = el.nodeName.toLowerCase();
  const inner = () => Array.from(el.childNodes).map(n => _domToMd(n, depth)).join('');

  switch (tag) {
    case 'p':
    case 'div':      return `\n\n${inner()}\n\n`;
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
    case 'code': {
      // Inside <pre> we emit raw text; outside we wrap in backticks
      if (el.closest('pre')) return inner();
      return `\`${inner()}\``;
    }
    case 'pre': {
      const codeEl = el.querySelector('code');
      const langMatch = /language-(\S+)/.exec(codeEl?.className || '');
      const lang = langMatch ? langMatch[1] : '';
      const content = (codeEl || el).textContent || '';
      return `\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    }
    case 'blockquote': {
      const lines = inner().trim().split('\n');
      return `\n\n${lines.map((l) => `> ${l}`).join('\n')}\n\n`;
    }
    case 'a': {
      const href = el.getAttribute('href') || '';
      return `[${inner()}](${href})`;
    }
    case 'img': {
      const src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    }
    case 'ul': {
      const items = Array.from(el.querySelectorAll(':scope > li'));
      if (!items.length) return inner();
      const indent = '  '.repeat(depth);
      const isChecklist = el.classList.contains('an-checklist');
      const lines = items.map((li) => {
        let prefix = '- ';
        if (isChecklist) {
          const cb = /** @type {HTMLInputElement | null} */ (li.querySelector('input[type="checkbox"]'));
          const checked = cb ? cb.checked : false;
          prefix = checked ? '- [x] ' : '- [ ] ';
        }
        return `${indent}${prefix}${_domToMd(li, depth + 1).trim()}`;
      }).join('\n');
      return depth === 0 ? `\n\n${lines}\n\n` : `\n${lines}`;
    }
    case 'ol': {
      const items = Array.from(el.querySelectorAll(':scope > li'));
      if (!items.length) return inner();
      const indent = '  '.repeat(depth);
      const lines = items.map((li, i) => `${indent}${i + 1}. ${_domToMd(li, depth + 1).trim()}`).join('\n');
      return depth === 0 ? `\n\n${lines}\n\n` : `\n${lines}`;
    }
    case 'li':  return inner();
    case 'hr':  return '\n\n---\n\n';
    case 'table': {
      const rows = Array.from(el.querySelectorAll('tr'));
      if (!rows.length) return inner();
      const cellTexts = rows.map((tr) =>
        Array.from(tr.querySelectorAll('th, td')).map((c) => c.textContent.trim().replaceAll('|', String.raw`\|`)),
      );
      const cols = Math.max(...cellTexts.map((r) => r.length));
      const padRow = (row) => { const r = [...row]; while (r.length < cols) r.push(''); return r; };
      let md = '\n\n';
      md += `| ${padRow(cellTexts[0]).join(' | ')} |\n`;
      md += `| ${new Array(cols).fill('---').join(' | ')} |\n`;
      for (let r = 1; r < cellTexts.length; r++) {
        md += `| ${padRow(cellTexts[r]).join(' | ')} |\n`;
      }
      return md + '\n';
    }
    default: return inner();
  }
}

/**
 * Detects whether a string likely contains Markdown syntax.
 *
 * Checks for common Markdown constructs such as ATX headings, unordered or
 * ordered list items, blockquotes, fenced code blocks, and bold emphasis.
 * @param {string} text - Input text to inspect for Markdown patterns.
 * @returns {boolean} `true` if any Markdown-like pattern is present, `false` otherwise.
 */
export function isMarkdown(text) {
  return /^#{1,6} \S|^\s*[-*+] \S|^\s*\d+\. \S|^> \S|^```|^\*{2}.+?\*{2}/m.test(text);
}

/**
 * Converts a Markdown string to an HTML string.
 * @param {string} text
 * @returns {string}
 */
export function markdownToHTML(text) {
  const lines = text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ---- Fenced code block ``` lang ... ``` -----------------------------------
    const fenceMatch = /^```(\S*)$/.exec(line);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(_esc(lines[i]));
        i++;
      }
      const langAttr = lang ? ` class="language-${_escAttr(lang)}"` : '';
      out.push(`<pre><code${langAttr}>${codeLines.join('\n')}</code></pre>`);
      i++; // skip closing ```
      continue;
    }

    // ---- Horizontal rule --- / *** / _________________________________________
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // ---- ATX Headings # – ######  -------------------------------------------
    const hMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (hMatch) {
      const level = hMatch[1].length;
      out.push(`<h${level}>${_inline(hMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // ---- Blockquote  > text --------------------------------------------------
    if (line.startsWith('> ')) {
      const bqLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      out.push(`<blockquote>${bqLines.map(_inline).join('<br>')}</blockquote>`);
      continue;
    }

    // ---- Checklist or Unordered list  - / * / + item  ----------------------
    if (/^[-*+] /.test(line)) {
      const items = [];
      const isChecklist = /^[-*+]\s+\[[ xX]\]\s+/.test(line);
      const listTag = isChecklist ? 'ul class="an-checklist"' : 'ul';
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        const itemLine = lines[i];
        const content = itemLine.slice(2);
        if (isChecklist) {
          const cbMatch = /^\[([ xX])\]\s+(.*)$/.exec(content);
          const checked = cbMatch?.[1]?.toLowerCase() === 'x';
          const checkedAttr = checked ? ' checked' : '';
          const cbHtml = `<input type="checkbox" contenteditable="false"${checkedAttr}>`;
          const textContent = cbMatch ? cbMatch[2] : content;
          items.push(`<li>${cbHtml}${_inline(textContent)}</li>`);
        } else {
          items.push(`<li>${_inline(content)}</li>`);
        }
        i++;
      }
      out.push(`<${listTag}>${items.join('')}</${listTag.split(' ')[0]}>`);
      continue;
    }

    // ---- Ordered list  1. item  ----------------------------------------------
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${_inline(lines[i].replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // ---- Blank line ----------------------------------------------------------
    if (line.trim() === '') {
      i++;
      continue;
    }

    // ---- GFM Table  | col | col | -------------------------------------------
    // A table starts with a pipe-prefixed or pipe-containing line followed by
    // a separator row (| --- | --- |). We detect and collect all rows.
    if (/^\|.+\|/.test(line) && i + 1 < lines.length && /^\|[\s|:-]+\|/.test(lines[i + 1])) {
      const headerCells = _parseTableRow(line);
      i += 2; // skip header + separator
      const bodyRows = [];
      while (i < lines.length && /^\|.+\|/.test(lines[i])) {
        bodyRows.push(_parseTableRow(lines[i]));
        i++;
      }
      const thCells = headerCells.map((c) => `<th>${_inline(c)}</th>`).join('');
      const thead = `<thead><tr>${thCells}</tr></thead>`;
      const renderRow = (row) => `<tr>${row.map((c) => `<td>${_inline(c)}</td>`).join('')}</tr>`;
      const tbody = bodyRows.length ? `<tbody>${bodyRows.map(renderRow).join('')}</tbody>` : '';
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // ---- Paragraph: collect consecutive non-block lines ---------------------
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6} |> |[-*+] |\d+\. |```|---\s*$|\*{3}\s*$|_{3}\s*$)/.test(lines[i]) &&
      !/^\|.+\|/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      out.push(`<p>${_inline(paraLines.join(' '))}</p>`);
    }
  }

  return out.join('');
}

// ---------------------------------------------------------------------------
// Inline formatting
// ---------------------------------------------------------------------------

/**
 * Splits a GFM table row string into trimmed cell strings.
 * '| a | b | c |' → ['a', 'b', 'c']
 * @param {string} row
 * @returns {string[]}
 */
function _parseTableRow(row) {
  return row
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function _inline(text) {
  // Images before links (they share [] syntax)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
    `<img src="${_escAttr(src)}" alt="${_escAttr(alt)}" class="an-image">`);
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) =>
    `<a href="${_escAttr(href)}">${_esc(label)}</a>`);
  // Bold + italic  ***text***
  text = text.replace(/\*{3}([^*\n]+?)\*{3}/g, (_, c) => `<strong><em>${_esc(c)}</em></strong>`);
  text = text.replace(/_{3}([^_\n]+?)_{3}/g,   (_, c) => `<strong><em>${_esc(c)}</em></strong>`);
  // Bold  **text**
  text = text.replace(/\*{2}([^*\n]+?)\*{2}/g, (_, c) => `<strong>${_esc(c)}</strong>`);
  text = text.replace(/_{2}([^_\n]+?)_{2}/g,   (_, c) => `<strong>${_esc(c)}</strong>`);
  // Italic  *text*  _text_
  text = text.replace(/\*([^*\n]+?)\*/g, (_, c) => `<em>${_esc(c)}</em>`);
  text = text.replace(/_([^_\n]+?)_/g,   (_, c) => `<em>${_esc(c)}</em>`);
  // Strikethrough  ~~text~~
  text = text.replace(/~~([^\n]+?)~~/g, (_, c) => `<del>${_esc(c)}</del>`);
  // Inline code  `code`
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${_esc(c)}</code>`);
  return text;
}

function _esc(v) {
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
