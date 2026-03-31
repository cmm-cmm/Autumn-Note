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

function _domToMd(node) {
  if (node.nodeType === 3) {
    return node.textContent.replace(/\s+/g, ' ');
  }
  if (node.nodeType !== 1) return '';

  const tag = node.nodeName.toLowerCase();
  const inner = () => Array.from(node.childNodes).map(_domToMd).join('');

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
    case 'sup':      return `^${inner()}`;
    case 'sub':      return `~${inner()}`;
    case 'code': {
      // Inside <pre> we emit raw text; outside we wrap in backticks
      if (node.closest('pre')) return inner();
      return `\`${inner()}\``;
    }
    case 'pre': {
      const codeEl = node.querySelector('code');
      const langMatch = ((codeEl && codeEl.className) || '').match(/language-(\S+)/);
      const lang = langMatch ? langMatch[1] : '';
      const content = (codeEl || node).textContent || '';
      return `\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    }
    case 'blockquote': {
      const lines = inner().trim().split('\n');
      return `\n\n${lines.map((l) => `> ${l}`).join('\n')}\n\n`;
    }
    case 'a': {
      const href = node.getAttribute('href') || '';
      return `[${inner()}](${href})`;
    }
    case 'img': {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    }
    case 'ul': {
      const items = Array.from(node.querySelectorAll(':scope > li'));
      if (!items.length) return inner();
      return `\n\n${items.map((li) => `- ${_domToMd(li).trim()}`).join('\n')}\n\n`;
    }
    case 'ol': {
      const items = Array.from(node.querySelectorAll(':scope > li'));
      if (!items.length) return inner();
      return `\n\n${items.map((li, i) => `${i + 1}. ${_domToMd(li).trim()}`).join('\n')}\n\n`;
    }
    case 'li':  return inner();
    case 'hr':  return '\n\n---\n\n';
    case 'table': {
      const rows = Array.from(node.querySelectorAll('tr'));
      if (!rows.length) return inner();
      const cellTexts = rows.map((tr) =>
        Array.from(tr.querySelectorAll('th, td')).map((c) => c.textContent.trim().replace(/\|/g, '\\|')),
      );
      const cols = Math.max(...cellTexts.map((r) => r.length));
      const padRow = (row) => { const r = [...row]; while (r.length < cols) r.push(''); return r; };
      let md = '\n\n';
      md += `| ${padRow(cellTexts[0]).join(' | ')} |\n`;
      md += `| ${Array(cols).fill('---').join(' | ')} |\n`;
      for (let r = 1; r < cellTexts.length; r++) {
        md += `| ${padRow(cellTexts[r]).join(' | ')} |\n`;
      }
      return md + '\n';
    }
    default: return inner();
  }
}

/**
 * Returns true if the text contains recognisable Markdown patterns.
 * @param {string} text
 * @returns {boolean}
 */
export function isMarkdown(text) {
  return /^#{1,6} \S|^\s*[-*+] \S|^\s*\d+\. \S|^> \S|\*{2}.+?\*{2}|^```/m.test(text);
}

/**
 * Converts a Markdown string to an HTML string.
 * @param {string} text
 * @returns {string}
 */
export function markdownToHTML(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ---- Fenced code block ``` lang ... ``` -----------------------------------
    const fenceMatch = line.match(/^```(\S*)$/);
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
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
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

    // ---- Unordered list  - / * / + item  ------------------------------------
    if (/^[-*+] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push(`<li>${_inline(lines[i].slice(2))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
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
      const thead = `<thead><tr>${headerCells.map((c) => `<th>${_inline(c)}</th>`).join('')}</tr></thead>`;
      const tbody = bodyRows.length
        ? `<tbody>${bodyRows.map((row) => `<tr>${row.map((c) => `<td>${_inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
        : '';
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
  text = text.replace(/\*{3}(.+?)\*{3}/g, (_, c) => `<strong><em>${_esc(c)}</em></strong>`);
  text = text.replace(/_{3}(.+?)_{3}/g,   (_, c) => `<strong><em>${_esc(c)}</em></strong>`);
  // Bold  **text**
  text = text.replace(/\*{2}(.+?)\*{2}/g, (_, c) => `<strong>${_esc(c)}</strong>`);
  text = text.replace(/_{2}(.+?)_{2}/g,   (_, c) => `<strong>${_esc(c)}</strong>`);
  // Italic  *text*  _text_
  text = text.replace(/\*([^*\n]+?)\*/g, (_, c) => `<em>${_esc(c)}</em>`);
  text = text.replace(/_([^_\n]+?)_/g,   (_, c) => `<em>${_esc(c)}</em>`);
  // Strikethrough  ~~text~~
  text = text.replace(/~~(.+?)~~/g, (_, c) => `<del>${_esc(c)}</del>`);
  // Inline code  `code`
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${_esc(c)}</code>`);
  return text;
}

function _esc(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function _escAttr(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
