/**
 * test/core/markdown.test.js
 * Unit tests for src/js/core/markdown.js
 */
import { describe, it, expect } from 'vitest';
import { isMarkdown, markdownToHTML, htmlToMarkdown } from '../../src/js/core/markdown.js';

// ---------------------------------------------------------------------------
// isMarkdown
// ---------------------------------------------------------------------------

describe('isMarkdown', () => {
  it('detects ATX headings (# Heading)', () => expect(isMarkdown('# Hello')).toBe(true));
  it('detects H2 headings (## Heading)', () => expect(isMarkdown('## Section')).toBe(true));
  it('detects bold (**text**)', () => expect(isMarkdown('**bold**')).toBe(true));
  it('detects unordered list (- item)', () => expect(isMarkdown('- item')).toBe(true));
  it('detects unordered list (* item)', () => expect(isMarkdown('* item')).toBe(true));
  it('detects ordered list (1. item)', () => expect(isMarkdown('1. item')).toBe(true));
  it('detects blockquote (> text)', () => expect(isMarkdown('> quote')).toBe(true));
  it('detects fenced code block (```)', () => expect(isMarkdown('```\ncode\n```')).toBe(true));
  it('returns false for plain prose', () => expect(isMarkdown('Hello world, this is plain text.')).toBe(false));
  it('returns false for empty string', () => expect(isMarkdown('')).toBe(false));
});

// ---------------------------------------------------------------------------
// markdownToHTML
// ---------------------------------------------------------------------------

describe('markdownToHTML', () => {
  it('converts H1', () => expect(markdownToHTML('# Heading 1')).toBe('<h1>Heading 1</h1>'));
  it('converts H2', () => expect(markdownToHTML('## Heading 2')).toBe('<h2>Heading 2</h2>'));
  it('converts H3', () => expect(markdownToHTML('### Heading 3')).toBe('<h3>Heading 3</h3>'));
  it('converts H6', () => expect(markdownToHTML('###### H6')).toBe('<h6>H6</h6>'));

  it('converts bold (**text**)', () => {
    expect(markdownToHTML('**bold**')).toBe('<p><strong>bold</strong></p>');
  });

  it('converts italic (*text*)', () => {
    expect(markdownToHTML('*italic*')).toBe('<p><em>italic</em></p>');
  });

  it('converts strikethrough (~~text~~)', () => {
    expect(markdownToHTML('~~strike~~')).toBe('<p><del>strike</del></p>');
  });

  it('converts inline code (`code`)', () => {
    expect(markdownToHTML('`code`')).toBe('<p><code>code</code></p>');
  });

  it('converts an unordered list', () => {
    const md = '- Alpha\n- Beta\n- Gamma';
    const html = markdownToHTML(md);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Alpha</li>');
    expect(html).toContain('<li>Beta</li>');
    expect(html).toContain('<li>Gamma</li>');
    expect(html).toContain('</ul>');
  });

  it('converts an ordered list', () => {
    const md = '1. First\n2. Second';
    const html = markdownToHTML(md);
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>First</li>');
    expect(html).toContain('<li>Second</li>');
    expect(html).toContain('</ol>');
  });

  it('converts a blockquote', () => {
    const html = markdownToHTML('> A quote');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('A quote');
  });

  it('converts a fenced code block with language', () => {
    const md = '```js\nconsole.log("hi");\n```';
    const html = markdownToHTML(md);
    expect(html).toContain('<pre>');
    expect(html).toContain('<code class="language-js">');
    expect(html).toContain('console.log');
  });

  it('converts a fenced code block without language', () => {
    const md = '```\nraw code\n```';
    const html = markdownToHTML(md);
    expect(html).toContain('<pre>');
    expect(html).toContain('<code>');
    expect(html).toContain('raw code');
  });

  it('converts a horizontal rule (---)', () => {
    expect(markdownToHTML('---')).toBe('<hr>');
  });

  it('converts a horizontal rule (***)', () => {
    expect(markdownToHTML('***')).toBe('<hr>');
  });

  it('converts an inline link [text](url)', () => {
    const html = markdownToHTML('[Click](https://example.com)');
    expect(html).toContain('<a href="https://example.com">Click</a>');
  });

  it('converts a plain paragraph', () => {
    const html = markdownToHTML('Just a paragraph.');
    expect(html).toBe('<p>Just a paragraph.</p>');
  });

  it('converts a GFM table', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const html = markdownToHTML(md);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<th>B</th>');
    expect(html).toContain('<td>1</td>');
    expect(html).toContain('<td>2</td>');
  });

  it('ignores blank lines', () => {
    const html = markdownToHTML('\n\n# Title\n\n');
    // Blank lines are skipped; only the heading should appear
    expect(html).toBe('<h1>Title</h1>');
  });
});

// ---------------------------------------------------------------------------
// htmlToMarkdown
// ---------------------------------------------------------------------------

describe('htmlToMarkdown', () => {
  it('converts <h1> to # Heading', () => {
    expect(htmlToMarkdown('<h1>Title</h1>')).toBe('# Title');
  });

  it('converts <h2> to ## Heading', () => {
    expect(htmlToMarkdown('<h2>Section</h2>')).toBe('## Section');
  });

  it('converts <strong> to **text**', () => {
    expect(htmlToMarkdown('<strong>bold</strong>')).toBe('**bold**');
  });

  it('converts <b> to **text**', () => {
    expect(htmlToMarkdown('<b>bold</b>')).toBe('**bold**');
  });

  it('converts <em> to *text*', () => {
    expect(htmlToMarkdown('<em>italic</em>')).toBe('*italic*');
  });

  it('converts <i> to *text*', () => {
    expect(htmlToMarkdown('<i>italic</i>')).toBe('*italic*');
  });

  it('converts <del> to ~~text~~', () => {
    expect(htmlToMarkdown('<del>strike</del>')).toBe('~~strike~~');
  });

  it('converts <s> to ~~text~~', () => {
    expect(htmlToMarkdown('<s>strike</s>')).toBe('~~strike~~');
  });

  it('converts inline <code> to `code`', () => {
    expect(htmlToMarkdown('<code>fn()</code>')).toBe('`fn()`');
  });

  it('converts <ul><li> to - item', () => {
    const html = '<ul><li>Alpha</li><li>Beta</li></ul>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('- Alpha');
    expect(md).toContain('- Beta');
  });

  it('converts <ol><li> to numbered list', () => {
    const html = '<ol><li>First</li><li>Second</li></ol>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('1. First');
    expect(md).toContain('2. Second');
  });

  it('converts <pre><code> to fenced code block', () => {
    const html = '<pre><code class="language-js">const x = 1;</code></pre>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('```js');
    expect(md).toContain('const x = 1;');
    expect(md).toContain('```');
  });

  it('converts <a href> to [text](url)', () => {
    const md = htmlToMarkdown('<a href="https://example.com">Link</a>');
    expect(md).toBe('[Link](https://example.com)');
  });

  it('converts <img> to ![alt](src)', () => {
    const md = htmlToMarkdown('<img src="img.png" alt="Alt text">');
    expect(md).toBe('![Alt text](img.png)');
  });

  it('converts <hr> to ---', () => {
    expect(htmlToMarkdown('<hr>')).toBe('---');
  });

  it('converts <blockquote> to > quote', () => {
    const md = htmlToMarkdown('<blockquote>Quote text</blockquote>');
    expect(md).toContain('> Quote text');
  });

  it('returns empty string for empty input', () => {
    expect(htmlToMarkdown('')).toBe('');
  });
});
