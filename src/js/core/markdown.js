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

    // ---- Paragraph: collect consecutive non-block lines ---------------------
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6} |> |[-*+] |\d+\. |```|---|\*\*\*|___)/.test(lines[i])
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

function _inline(text) {
  // Images before links (they share [] syntax)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
    `<img src="${_escAttr(src)}" alt="${_escAttr(alt)}" class="an-image">`);
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) =>
    `<a href="${_escAttr(href)}">${_esc(label)}</a>`);
  // Bold + italic  ***text***
  text = text.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
  text = text.replace(/_{3}(.+?)_{3}/g,   '<strong><em>$1</em></strong>');
  // Bold  **text**
  text = text.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
  text = text.replace(/_{2}(.+?)_{2}/g,   '<strong>$1</strong>');
  // Italic  *text*  _text_
  text = text.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  text = text.replace(/_([^_\n]+?)_/g,   '<em>$1</em>');
  // Strikethrough  ~~text~~
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // Inline code  `code`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
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
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
