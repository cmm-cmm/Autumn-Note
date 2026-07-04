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

  it('converts a checklist with unchecked and checked items', () => {
    const md = '- [ ] Todo\n- [x] Done';
    const html = markdownToHTML(md);
    expect(html).toContain('<ul class="an-checklist">');
    expect(html).toContain('<input type="checkbox" contenteditable="false">Todo</li>');
    expect(html).toContain('<input type="checkbox" contenteditable="false" checked>Done</li>');
  });

  it('converts a checklist with uppercase X as checked', () => {
    const md = '- [X] Done';
    const html = markdownToHTML(md);
    expect(html).toContain('checked');
  });

  it('stops a checklist block when a plain list item follows', () => {
    const md = '- [ ] Todo\n- Plain item';
    const html = markdownToHTML(md);
    expect(html).toContain('<ul class="an-checklist"><li><input type="checkbox" contenteditable="false">Todo</li></ul>');
    expect(html).toContain('<ul><li>Plain item</li></ul>');
  });

  it('stops a plain list block when a checklist item follows', () => {
    const md = '- Plain item\n- [ ] Todo';
    const html = markdownToHTML(md);
    expect(html).toContain('<ul><li>Plain item</li></ul>');
    expect(html).toContain('<ul class="an-checklist"><li><input type="checkbox" contenteditable="false">Todo</li></ul>');
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

  // ---- Setext headings -------------------------------------------------------

  it('converts setext H1 (underline with ===)', () => {
    expect(markdownToHTML('Title\n=====')).toBe('<h1>Title</h1>');
  });

  it('converts setext H2 (underline with ---)', () => {
    expect(markdownToHTML('Section\n-------')).toBe('<h2>Section</h2>');
  });

  it('setext H2 with minimal dashes (--)', () => {
    expect(markdownToHTML('Sub\n--')).toBe('<h2>Sub</h2>');
  });

  it('standalone --- is still a horizontal rule, not setext', () => {
    expect(markdownToHTML('---')).toBe('<hr>');
  });

  // ---- Nested lists ----------------------------------------------------------

  it('converts a 2-level nested UL', () => {
    const md = '- Item 1\n  - Nested\n- Item 2';
    const html = markdownToHTML(md);
    expect(html).toBe('<ul><li>Item 1<ul><li>Nested</li></ul></li><li>Item 2</li></ul>');
  });

  it('converts a 2-level nested OL', () => {
    const md = '1. First\n   1. Nested\n2. Second';
    const html = markdownToHTML(md);
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>First<ol><li>Nested</li></ol></li>');
    expect(html).toContain('<li>Second</li>');
  });

  it('converts UL with nested OL', () => {
    const md = '- Item\n  1. Sub one\n  2. Sub two';
    const html = markdownToHTML(md);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Item<ol><li>Sub one</li><li>Sub two</li></ol></li>');
  });

  it('converts 3-level deeply nested UL', () => {
    const md = '- A\n  - B\n    - C';
    const html = markdownToHTML(md);
    expect(html).toBe('<ul><li>A<ul><li>B<ul><li>C</li></ul></li></ul></li></ul>');
  });

  it('checklist with nested plain UL', () => {
    const md = '- [x] Done\n  - Note';
    const html = markdownToHTML(md);
    expect(html).toContain('<ul class="an-checklist">');
    expect(html).toContain('<ul><li>Note</li></ul>');
  });

  // ---- Table alignment -------------------------------------------------------

  it('converts GFM table with alignment markers', () => {
    const md = '| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |';
    const html = markdownToHTML(md);
    expect(html).toContain('<th style="text-align:left">Left</th>');
    expect(html).toContain('<th style="text-align:center">Center</th>');
    expect(html).toContain('<th style="text-align:right">Right</th>');
    expect(html).toContain('<td style="text-align:left">a</td>');
    expect(html).toContain('<td style="text-align:center">b</td>');
    expect(html).toContain('<td style="text-align:right">c</td>');
  });

  it('table without alignment markers renders plain th/td', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    const html = markdownToHTML(md);
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
    expect(html).not.toContain('text-align');
  });

  it('handles a ragged table where separator has fewer columns than the header', () => {
    const md = '| A | B | C |\n| :--- | :--- |\n| 1 | 2 | 3 |';
    expect(() => markdownToHTML(md)).not.toThrow();
    const html = markdownToHTML(md);
    expect(html).toContain('<th style="text-align:left">A</th>');
    expect(html).toContain('<th style="text-align:left">B</th>');
    expect(html).toContain('<th>C</th>');
    expect(html).toContain('<td>3</td>');
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

  it('converts a checklist with checked and unchecked items', () => {
    const html = '<ul class="an-checklist">'
      + '<li><input type="checkbox" contenteditable="false">Todo</li>'
      + '<li><input type="checkbox" contenteditable="false" checked>Done</li>'
      + '</ul>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('- [ ] Todo');
    expect(md).toContain('- [x] Done');
  });

  it('treats a checklist item without a checkbox input as unchecked', () => {
    const html = '<ul class="an-checklist"><li>No checkbox</li></ul>';
    const md = htmlToMarkdown(html);
    expect(md).toContain('- [ ] No checkbox');
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

  it('indents nested <ul> lists correctly, without duplicating the nested item at the top level', () => {
    const html = '<ul><li>parent<ul><li>child</li></ul></li></ul>';
    const md = htmlToMarkdown(html);
    expect(md).toBe('- parent\n  - child');
  });

  it('indents deeply nested lists (3 levels), without duplicating nested items', () => {
    const html = '<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li></ul>';
    const md = htmlToMarkdown(html);
    expect(md).toBe('- a\n  - b\n    - c');
  });

  it('indents nested <ol> lists correctly, without duplicating the nested item at the top level', () => {
    const html = '<ol><li>first<ol><li>nested</li></ol></li></ol>';
    const md = htmlToMarkdown(html);
    expect(md).toBe('1. first\n  1. nested');
  });
});

// ---------------------------------------------------------------------------
// htmlToMarkdown — underline and styled span export
// ---------------------------------------------------------------------------

describe('htmlToMarkdown — underline and styled span', () => {
  it('exports <u> as raw HTML passthrough', () => {
    expect(htmlToMarkdown('<u>text</u>')).toBe('<u>text</u>');
  });

  it('exports a color-styled span as raw HTML passthrough', () => {
    expect(htmlToMarkdown('<span style="color:red">x</span>')).toBe('<span style="color:red">x</span>');
  });

  it('exports a font-size-styled span as raw HTML passthrough', () => {
    expect(htmlToMarkdown('<span style="font-size:18px">big</span>')).toBe('<span style="font-size:18px">big</span>');
  });

  it('unwraps a plain span with no style to plain text', () => {
    expect(htmlToMarkdown('<span>plain</span>')).toBe('plain');
  });

  it('unwraps a span with an unrelated style to plain text', () => {
    expect(htmlToMarkdown('<span style="cursor:pointer">x</span>')).toBe('x');
  });
});

// ---------------------------------------------------------------------------
// htmlToMarkdown — headerless table export
// ---------------------------------------------------------------------------

describe('htmlToMarkdown — headerless table', () => {
  it('emits an empty header row for a tbody-only table with no <th> row', () => {
    const html = '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>1</td><td>2</td></tr></tbody></table>';
    expect(htmlToMarkdown(html)).toBe('|  |  |\n| --- | --- |\n| a | b |\n| 1 | 2 |');
  });

  it('still treats a table with a real <thead> as having a header (regression)', () => {
    const html = '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>';
    expect(htmlToMarkdown(html)).toBe('| A | B |\n| --- | --- |\n| 1 | 2 |');
  });

  it('treats a table with an all-<th> first row as headered even without a <thead> wrapper', () => {
    const html = '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>';
    expect(htmlToMarkdown(html)).toBe('| A | B |\n| --- | --- |\n| 1 | 2 |');
  });
});

// ---------------------------------------------------------------------------
// htmlToMarkdown — checkbox export without an-checklist class
// ---------------------------------------------------------------------------

describe('htmlToMarkdown — stray checkbox export', () => {
  it('exports a checked checkbox even when the ul lacks the an-checklist class', () => {
    const html = '<ul><li><input type="checkbox" checked>Done</li></ul>';
    expect(htmlToMarkdown(html)).toBe('- [x] Done');
  });

  it('exports an unchecked checkbox even when the ul lacks the an-checklist class', () => {
    const html = '<ul><li><input type="checkbox">Todo</li></ul>';
    expect(htmlToMarkdown(html)).toBe('- [ ] Todo');
  });

  it('does not misattribute a nested sublist checkbox to its ancestor <li>', () => {
    const html = '<ul><li>Parent<ul><li><input type="checkbox" checked>Nested</li></ul></li></ul>';
    expect(htmlToMarkdown(html)).toBe('- Parent\n  - [x] Nested');
  });
});

// ---------------------------------------------------------------------------
// htmlToMarkdown — blockquote blank-line collapsing
// ---------------------------------------------------------------------------

describe('htmlToMarkdown — blockquote blank-line collapsing', () => {
  it('collapses multiple blank lines between blockquote paragraphs into one', () => {
    const html = '<blockquote><p>Para one</p><p>Para two</p></blockquote>';
    expect(htmlToMarkdown(html)).toBe('> Para one\n>\n> Para two');
  });

  it('still converts a simple single-line blockquote (regression)', () => {
    expect(htmlToMarkdown('<blockquote>Quote text</blockquote>')).toBe('> Quote text');
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

  it('detects setext H1 heading (===)', () => {
    expect(isMarkdown('Title\n=====')).toBe(true);
  });

  it('detects setext H2 heading (---)', () => {
    expect(isMarkdown('Section\n---')).toBe(true);
  });

  it('detects indented list item', () => {
    expect(isMarkdown('  - nested item')).toBe(true);
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

// ---------------------------------------------------------------------------
// isMarkdown — frontmatter and bare tables
// ---------------------------------------------------------------------------

describe('isMarkdown — frontmatter and tables', () => {
  it('detects a doc with YAML frontmatter and no other markdown', () => {
    expect(isMarkdown('---\ntitle: x\n---\n\nJust plain prose.')).toBe(true);
  });

  it('does not treat an unclosed --- block as frontmatter', () => {
    expect(isMarkdown('---\nnot closed\nmore text')).toBe(false);
  });

  it('detects a bare GFM table with no other markdown markers', () => {
    expect(isMarkdown('| A | B |\n| --- | --- |\n| 1 | 2 |')).toBe(true);
  });

  it('does not false-positive on a line merely containing pipe characters', () => {
    expect(isMarkdown('Some text with a | pipe | character but not a table')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — YAML frontmatter
// ---------------------------------------------------------------------------

describe('markdownToHTML — frontmatter', () => {
  it('strips frontmatter, leaving only the body', () => {
    const md = '---\ntitle: My Post\nauthor: Jane\n---\n\n# Heading';
    expect(markdownToHTML(md)).toBe('<h1>Heading</h1>');
  });

  it('renders empty frontmatter with no body as an empty string', () => {
    expect(markdownToHTML('---\n---')).toBe('');
  });

  it('does not strip a real horizontal rule followed by non-YAML prose', () => {
    const md = '---\nSome prose paragraph here.\nMore prose.\n---\n\n# Heading';
    const html = markdownToHTML(md);
    expect(html).toContain('<hr>');
    expect(html).toContain('Some prose paragraph here.');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — reference-style links and footnotes
// ---------------------------------------------------------------------------

describe('markdownToHTML — reference links and footnotes', () => {
  it('resolves a full reference link [text][ref]', () => {
    const md = '[Google][1]\n\n[1]: https://google.com';
    expect(markdownToHTML(md)).toBe('<p><a href="https://google.com">Google</a></p>');
  });

  it('resolves a shortcut reference link [text][]', () => {
    const md = '[Google][]\n\n[Google]: https://google.com';
    expect(markdownToHTML(md)).toBe('<p><a href="https://google.com">Google</a></p>');
  });

  it('resolves a bare/implicit reference link [text]', () => {
    const md = '[Google]\n\n[Google]: https://google.com';
    expect(markdownToHTML(md)).toBe('<p><a href="https://google.com">Google</a></p>');
  });

  it('includes an optional title on a reference link definition', () => {
    const md = '[1]: https://google.com "Search engine"\n\n[Google][1]';
    const html = markdownToHTML(md);
    expect(html).toContain('title="Search engine"');
    expect(html).toContain('href="https://google.com"');
  });

  it('renders a footnote marker as superscript and drops the definition line', () => {
    const md = 'Some text[^1].\n\n[^1]: A footnote.';
    const html = markdownToHTML(md);
    expect(html).toBe('<p>Some text<sup>[1]</sup>.</p>');
    expect(html).not.toContain('A footnote');
  });

  it('leaves plain bracketed text unchanged when no definition exists', () => {
    const md = 'See [note] for details, no definition anywhere.';
    expect(markdownToHTML(md)).toBe('<p>See [note] for details, no definition anywhere.</p>');
  });

  it('does not strip a reference-definition-like line inside a fenced code block', () => {
    const md = '```\n[foo]: bar\n```';
    const html = markdownToHTML(md);
    expect(html).toContain('<pre>');
    expect(html).toContain('[foo]: bar');
  });

  it('resolves a reference link alongside an existing inline link in the same paragraph', () => {
    const md = '[Click](https://example.com) and [ref][1]\n\n[1]: https://example.com/ref';
    const html = markdownToHTML(md);
    expect(html).toContain('<a href="https://example.com">Click</a>');
    expect(html).toContain('<a href="https://example.com/ref">ref</a>');
  });
});

// ---------------------------------------------------------------------------
// isMarkdown — blockquote without a space after '>'
// ---------------------------------------------------------------------------

describe('isMarkdown — blockquote no-space', () => {
  it('detects a blockquote with no space after >', () => {
    expect(isMarkdown('>Hello')).toBe(true);
  });

  it('does not false-positive on a bare > with nothing after it', () => {
    expect(isMarkdown('>')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — blockquotes: no-space, nesting, block content, multi-line
// ---------------------------------------------------------------------------

describe('markdownToHTML — blockquote enhancements', () => {
  it('recognizes a blockquote with no space after >', () => {
    const html = markdownToHTML('>Hello');
    expect(html).toBe('<blockquote><p>Hello</p></blockquote>');
  });

  it('supports nested blockquotes', () => {
    const html = markdownToHTML('> > nested quote');
    expect(html).toBe('<blockquote><blockquote><p>nested quote</p></blockquote></blockquote>');
  });

  it('supports a heading inside a blockquote', () => {
    const html = markdownToHTML('> # Heading\n> more text');
    expect(html).toBe('<blockquote><h1>Heading</h1><p>more text</p></blockquote>');
  });

  it('supports a list inside a blockquote', () => {
    const html = markdownToHTML('> - item1\n> - item2');
    expect(html).toBe('<blockquote><ul><li>item1</li><li>item2</li></ul></blockquote>');
  });

  it('joins consecutive quoted lines into one paragraph', () => {
    const html = markdownToHTML('> Line one\n> Line two');
    expect(html).toBe('<blockquote><p>Line one Line two</p></blockquote>');
  });

  it('still converts a simple single-line blockquote', () => {
    const html = markdownToHTML('> A quote');
    expect(html).toBe('<blockquote><p>A quote</p></blockquote>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — horizontal rule spaced forms
// ---------------------------------------------------------------------------

describe('markdownToHTML — horizontal rule spaced forms', () => {
  it('converts spaced dashes (- - -) to <hr>', () => {
    expect(markdownToHTML('- - -')).toBe('<hr>');
  });

  it('converts spaced asterisks (* * *) to <hr>', () => {
    expect(markdownToHTML('* * *')).toBe('<hr>');
  });

  it('converts spaced underscores (_ _ _) to <hr>', () => {
    expect(markdownToHTML('_ _ _')).toBe('<hr>');
  });

  it('still converts unspaced --- to <hr>', () => {
    expect(markdownToHTML('---')).toBe('<hr>');
  });

  it('does not mistake a real list item "- a" for a horizontal rule', () => {
    const html = markdownToHTML('- a');
    expect(html).toBe('<ul><li>a</li></ul>');
  });

  it('does not mistake a list item with literal text "-" for a horizontal rule', () => {
    const html = markdownToHTML('- -');
    expect(html).toBe('<ul><li>-</li></ul>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — loose vs. tight lists, multi-paragraph items
// ---------------------------------------------------------------------------

describe('markdownToHTML — loose and multi-paragraph lists', () => {
  it('renders a tight list without <p> wrapping (regression)', () => {
    const html = markdownToHTML('- Alpha\n- Beta');
    expect(html).toBe('<ul><li>Alpha</li><li>Beta</li></ul>');
  });

  it('renders a loose list (blank line between items) with <p>-wrapped items', () => {
    const html = markdownToHTML('- Alpha\n\n- Beta');
    expect(html).toBe('<ul><li><p>Alpha</p></li><li><p>Beta</p></li></ul>');
  });

  it('supports a multi-paragraph list item', () => {
    const html = markdownToHTML('- Item\n\n  more text\n\n- Item2');
    expect(html).toBe('<ul><li><p>Item</p><p>more text</p></li><li><p>Item2</p></li></ul>');
  });

  it('still terminates the list before an unrelated trailing paragraph', () => {
    const html = markdownToHTML('- Item 1\n\nSome unrelated paragraph.');
    expect(html).toBe('<ul><li>Item 1</li></ul><p>Some unrelated paragraph.</p>');
  });

  it('keeps a checkbox on the first paragraph of a loose checklist item', () => {
    const html = markdownToHTML('- [x] Done\n\n  extra detail');
    expect(html).toContain('<input type="checkbox" contenteditable="false" checked>');
    expect(html).toContain('<p>extra detail</p>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — table cell escaped pipe
// ---------------------------------------------------------------------------

describe('markdownToHTML — table escaped pipe', () => {
  it('treats an escaped pipe in a cell as a literal character, not a separator', () => {
    const md = '| a\\|b | c |\n| --- | --- |\n| 1 | 2 |';
    const html = markdownToHTML(md);
    expect(html).toContain('<th>a|b</th>');
    expect(html).toContain('<th>c</th>');
  });

  it('still splits a plain table row correctly (regression)', () => {
    const md = '| a | b |\n| --- | --- |\n| 1 | 2 |';
    const html = markdownToHTML(md);
    expect(html).toContain('<th>a</th>');
    expect(html).toContain('<th>b</th>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — underscore emphasis word-boundary
// ---------------------------------------------------------------------------

describe('markdownToHTML — underscore emphasis word boundary', () => {
  it('does not emphasize underscores inside an identifier', () => {
    expect(markdownToHTML('snake_case_word')).toBe('<p>snake_case_word</p>');
  });

  it('does not bold underscores inside an identifier', () => {
    expect(markdownToHTML('snake__case__word')).toBe('<p>snake__case__word</p>');
  });

  it('emphasizes a leading _word_ at sentence start', () => {
    expect(markdownToHTML('_word_ rest of sentence')).toBe('<p><em>word</em> rest of sentence</p>');
  });

  it('emphasizes _word_ surrounded by spaces', () => {
    expect(markdownToHTML('foo _bar_ baz')).toBe('<p>foo <em>bar</em> baz</p>');
  });

  it('bolds __word__ surrounded by spaces', () => {
    expect(markdownToHTML('foo __bar__ baz')).toBe('<p>foo <strong>bar</strong> baz</p>');
  });

  it('still allows intraword asterisk emphasis (regression)', () => {
    expect(markdownToHTML('foo*bar*baz')).toBe('<p>foo<em>bar</em>baz</p>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — hard line breaks
// ---------------------------------------------------------------------------

describe('markdownToHTML — hard line breaks', () => {
  it('converts a trailing two-space line break to <br>', () => {
    expect(markdownToHTML('Line one  \nLine two')).toBe('<p>Line one<br>Line two</p>');
  });

  it('converts a trailing backslash line break to <br>', () => {
    expect(markdownToHTML('Line one\\\nLine two')).toBe('<p>Line one<br>Line two</p>');
  });

  it('joins lines with a plain space when there is no hard-break marker (regression)', () => {
    expect(markdownToHTML('Line one\nLine two')).toBe('<p>Line one Line two</p>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — backslash escapes
// ---------------------------------------------------------------------------

describe('markdownToHTML — backslash escapes', () => {
  it('escapes asterisks so they are not treated as emphasis', () => {
    expect(markdownToHTML('\\*not bold\\*')).toBe('<p>*not bold*</p>');
  });

  it('escapes underscores so they are not treated as emphasis', () => {
    expect(markdownToHTML('\\_not italic\\_')).toBe('<p>_not italic_</p>');
  });

  it('escapes a backtick so it is not treated as inline code', () => {
    expect(markdownToHTML('\\`not code\\`')).toBe('<p>`not code`</p>');
  });

  it('escapes brackets so they are not treated as a link', () => {
    expect(markdownToHTML('\\[not a link\\]')).toBe('<p>[not a link]</p>');
  });

  it('escapes a hash inside prose', () => {
    expect(markdownToHTML('See \\#hashtag here')).toBe('<p>See #hashtag here</p>');
  });

  it('escapes a pipe outside of a table', () => {
    expect(markdownToHTML('a \\| b')).toBe('<p>a | b</p>');
  });

  it('resolves a double backslash to a single literal backslash', () => {
    expect(markdownToHTML('literal \\\\ backslash')).toBe('<p>literal \\ backslash</p>');
  });

  it('leaves a fenced code block unaffected by escape sequences', () => {
    const html = markdownToHTML('```\n\\*text\\*\n```');
    expect(html).toContain('\\*text\\*');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — whole-string HTML escaping of raw <, >, &
// ---------------------------------------------------------------------------

describe('markdownToHTML — raw HTML character escaping', () => {
  it('escapes a raw script-like tag in prose instead of passing it through', () => {
    const html = markdownToHTML('Use <script>alert(1)</script> here');
    expect(html).toBe('<p>Use &lt;script&gt;alert(1)&lt;/script&gt; here</p>');
  });

  it('does not double-escape an ampersand inside bold text', () => {
    const html = markdownToHTML('**A & B** and <em>fake</em>');
    expect(html).toBe('<p><strong>A &amp; B</strong> and &lt;em&gt;fake&lt;/em&gt;</p>');
  });

  it('does not double-escape an ampersand inside a link URL', () => {
    const html = markdownToHTML('[A & B](http://x.com?a=1&b=2)');
    expect(html).toBe('<p><a href="http://x.com?a=1&amp;b=2">A &amp; B</a></p>');
  });

  it('escapes a raw angle bracket inside a code span', () => {
    const html = markdownToHTML('`if x < 5`');
    expect(html).toBe('<p><code>if x &lt; 5</code></p>');
  });

  it('resolves a reference link whose label contains an ampersand', () => {
    const html = markdownToHTML('[A & B][]\n\n[A & B]: https://example.com');
    expect(html).toBe('<p><a href="https://example.com">A &amp; B</a></p>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — autolinks
// ---------------------------------------------------------------------------

describe('markdownToHTML — autolinks', () => {
  it('converts a bare URL in prose to a link', () => {
    const html = markdownToHTML('Visit https://example.com today');
    expect(html).toBe('<p>Visit <a href="https://example.com">https://example.com</a> today</p>');
  });

  it('converts an angle-bracket autolink to a link', () => {
    const html = markdownToHTML('See <https://example.com> for details');
    expect(html).toBe('<p>See <a href="https://example.com">https://example.com</a> for details</p>');
  });

  it('trims trailing sentence punctuation from a bare URL', () => {
    const html = markdownToHTML('Visit https://x.com.');
    expect(html).toBe('<p>Visit <a href="https://x.com">https://x.com</a>.</p>');
  });

  it('does not double-process a URL already inside an explicit link', () => {
    const html = markdownToHTML('[Already](https://example.com) plus bare https://other.com');
    expect(html).toContain('<a href="https://example.com">Already</a>');
    expect(html).toContain('<a href="https://other.com">https://other.com</a>');
    expect(html).not.toContain('href="https://example.com">https://example.com<');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — ordered list start number
// ---------------------------------------------------------------------------

describe('markdownToHTML — ordered list start number', () => {
  it('emits an ol start attribute when the list does not start at 1', () => {
    const html = markdownToHTML('3. Third\n4. Fourth');
    expect(html).toBe('<ol start="3"><li>Third</li><li>Fourth</li></ol>');
  });

  it('omits the start attribute when the list starts at 1 (regression)', () => {
    const html = markdownToHTML('1. First\n2. Second');
    expect(html).toBe('<ol><li>First</li><li>Second</li></ol>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — checklist syntax is intentionally UL-only
// ---------------------------------------------------------------------------

describe('markdownToHTML — no ordered-list checklist support (intentional)', () => {
  it('leaves "1. [ ] item" as plain text, not a checkbox', () => {
    const html = markdownToHTML('1. [ ] item');
    expect(html).toBe('<ol><li>[ ] item</li></ol>');
    expect(html).not.toContain('input type="checkbox"');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — double-backtick code spans
// ---------------------------------------------------------------------------

describe('markdownToHTML — double-backtick code spans', () => {
  it('tolerates a single literal backtick inside a double-backtick span', () => {
    const html = markdownToHTML('``code with ` inside``');
    expect(html).toBe('<p><code>code with ` inside</code></p>');
  });

  it('still converts a single-backtick code span (regression)', () => {
    expect(markdownToHTML('`code`')).toBe('<p><code>code</code></p>');
  });

  it('converts two separate double-backtick spans independently', () => {
    const html = markdownToHTML('``a`` and ``b``');
    expect(html).toBe('<p><code>a</code> and <code>b</code></p>');
  });
});

// ---------------------------------------------------------------------------
// markdownToHTML — ATX heading trailing # stripping
// ---------------------------------------------------------------------------

describe('markdownToHTML — ATX heading trailing hash stripping', () => {
  it('strips a trailing #-run preceded by whitespace', () => {
    expect(markdownToHTML('## Heading ##')).toBe('<h2>Heading</h2>');
  });

  it('does not strip a trailing # with no preceding space (regression)', () => {
    expect(markdownToHTML('# Heading#')).toBe('<h1>Heading#</h1>');
  });

  it('produces an empty heading for a fully degenerate trailing-hash line', () => {
    expect(markdownToHTML('# ###')).toBe('<h1></h1>');
  });

  it('preserves a mid-string hash run that is not at the end of the line', () => {
    expect(markdownToHTML('### C## Programming')).toBe('<h3>C## Programming</h3>');
  });
});
