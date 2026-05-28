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

  it('indents nested <ul> lists correctly', () => {
    const html = '<ul><li>parent<ul><li>child</li></ul></li></ul>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('- parent');
    expect(md).toContain('  - child');
  });

  it('indents deeply nested lists (3 levels)', () => {
    const html = '<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li></ul>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('- a');
    expect(md).toContain('  - b');
    expect(md).toContain('    - c');
  });

  it('indents nested <ol> lists correctly', () => {
    const html = '<ol><li>first<ol><li>nested</li></ol></li></ol>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('1. first');
    expect(md).toContain('  1. nested');
  });
});

// ---------------------------------------------------------------------------
// isMarkdown — false positive prevention
// ---------------------------------------------------------------------------

describe('isMarkdown — edge cases', () => {
  it('does not false-positive on bold-like text in the middle of prose', () => {
    // Bold in the middle of a sentence is NOT a markdown indicator on its own
    const prose = 'The result was **significantly** better than expected in all cases.';
    expect(isMarkdown(prose)).toBe(false);
  });

  it('detects bold (**text**) at the start of a line', () => {
    expect(isMarkdown('**important note**')).toBe(true);
  });

  it('does not false-positive on email-style list items', () => {
    expect(isMarkdown('Re: your inquiry about pricing')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// htmlToMarkdown — uncovered element types (sub, table, image)
// ---------------------------------------------------------------------------

describe('htmlToMarkdown — additional elements', () => {
  it('converts <br> to double-space newline', () => {
    const md = htmlToMarkdown('<p>line1<br>line2</p>');
    expect(md).toContain('  \n');
  });

  it('converts <h3> to ### heading', () => {
    expect(htmlToMarkdown('<h3>Section</h3>')).toContain('###');
  });

  it('converts <h4> to #### heading', () => {
    expect(htmlToMarkdown('<h4>Section</h4>')).toContain('####');
  });

  it('converts <h5> to ##### heading', () => {
    expect(htmlToMarkdown('<h5>Section</h5>')).toContain('#####');
  });

  it('converts <h6> to ###### heading', () => {
    expect(htmlToMarkdown('<h6>Section</h6>')).toContain('######');
  });

  it('converts <sub> to ~text~', () => {
    expect(htmlToMarkdown('<sub>2</sub>')).toBe('~2~');
  });

  it('converts <sup> to ^text^', () => {
    expect(htmlToMarkdown('<sup>2</sup>')).toBe('^2^');
  });

  it('converts <strike> to ~~text~~', () => {
    expect(htmlToMarkdown('<strike>old</strike>')).toBe('~~old~~');
  });

  it('converts a simple HTML table to GFM markdown table', () => {
    const html = '<table><tr><th>Name</th><th>Age</th></tr><tr><td>Alice</td><td>30</td></tr></table>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('| Name | Age |');
    expect(md).toContain('| --- | --- |');
    expect(md).toContain('| Alice | 30 |');
  });

  it('converts table with pipe characters in cells (escaped)', () => {
    const html = '<table><tr><th>A|B</th></tr><tr><td>C</td></tr></table>';
    const md = htmlToMarkdown(html);
    expect(md).toContain(String.raw`\|`);
  });

  it('handles empty table gracefully', () => {
    const md = htmlToMarkdown('<table></table>');
    expect(typeof md).toBe('string');
  });

  it('converts markdown image syntax to HTML img tag', () => {
    const html = markdownToHTML('![alt text](https://example.com/img.png)');
    expect(html).toContain('<img');
    expect(html).toContain('alt="alt text"');
    expect(html).toContain('src="https://example.com/img.png"');
  });
});
