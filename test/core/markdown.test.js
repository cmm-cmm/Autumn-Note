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

// ---------------------------------------------------------------------------
// Code blocks — fence variants and indented code
// ---------------------------------------------------------------------------

describe('markdownToHTML — code fences', () => {
  it('parses a tilde fence, which previously became strikethrough', () => {
    // `~~~js\ncode\n~~~` used to fall through to the inline rules and render as
    // <p>~<del>js code </del>~</p>, destroying the snippet.
    expect(markdownToHTML('~~~js\nconst a = 1;\n~~~'))
      .toBe('<pre><code class="language-js">const a = 1;</code></pre>');
  });

  it('lets a longer fence contain a shorter run of the same marker', () => {
    expect(markdownToHTML('````\na ``` b\n````')).toBe('<pre><code>a ``` b</code></pre>');
  });

  it('does not read a backtick code span as a fence', () => {
    expect(markdownToHTML('``a ` b``')).toBe('<p><code>a ` b</code></p>');
  });

  it('accepts up to three spaces of fence indent and strips them from the body', () => {
    expect(markdownToHTML('  ```\n  x\n  ```')).toBe('<pre><code>x</code></pre>');
  });

  it('closes an unterminated fence at the end of input', () => {
    expect(markdownToHTML('```js\nconst a = 1;'))
      .toBe('<pre><code class="language-js">const a = 1;</code></pre>');
  });

  it('takes only the first word of the info string as the language', () => {
    expect(markdownToHTML('```js title=x\ncode\n```'))
      .toBe('<pre><code class="language-js">code</code></pre>');
  });

  it('treats a fenced block as literal, not as reference definitions', () => {
    const html = markdownToHTML('```\n[ref]: http://e.com\n```');
    expect(html).toBe('<pre><code>[ref]: http://e.com</code></pre>');
  });
});

describe('markdownToHTML — indented code blocks', () => {
  it('parses a four-space indented block instead of collapsing it into a paragraph', () => {
    expect(markdownToHTML('    const x = 1;\n    const y = 2;'))
      .toBe('<pre><code>const x = 1;\nconst y = 2;</code></pre>');
  });

  it('parses a tab-indented block', () => {
    expect(markdownToHTML('\tconst x = 1;')).toBe('<pre><code>const x = 1;</code></pre>');
  });

  it('keeps an interior blank line but not a trailing one', () => {
    expect(markdownToHTML('    a\n\n    b')).toBe('<pre><code>a\n\nb</code></pre>');
    expect(markdownToHTML('    a\n\ntext')).toBe('<pre><code>a</code></pre><p>text</p>');
  });

  it('does not let indented code interrupt a paragraph', () => {
    expect(markdownToHTML('text\n    more')).toBe('<p>text more</p>');
  });

  it('preserves relative indentation beyond the first four columns', () => {
    expect(markdownToHTML('    if (x) {\n        y();\n    }'))
      .toBe('<pre><code>if (x) {\n    y();\n}</code></pre>');
  });
});

// ---------------------------------------------------------------------------
// Link and image titles
// ---------------------------------------------------------------------------

describe('markdownToHTML — link destinations and titles', () => {
  it('splits a quoted title off the destination instead of putting it in href', () => {
    // The whole `url "title"` string used to land in href, producing a link
    // that did not resolve at all.
    expect(markdownToHTML('[x](http://e.com "T")'))
      .toBe('<p><a href="http://e.com" title="T">x</a></p>');
  });

  it('accepts a single-quoted title', () => {
    expect(markdownToHTML("[x](http://e.com 'T')"))
      .toBe('<p><a href="http://e.com" title="T">x</a></p>');
  });

  it('applies the same split to images', () => {
    expect(markdownToHTML('![a](i.png "T")'))
      .toBe('<p><img src="i.png" alt="a" title="T" class="an-image"></p>');
  });

  it('reads an angle-bracket destination containing spaces', () => {
    expect(markdownToHTML('[x](<http://e.com/a b>)'))
      .toBe('<p><a href="http://e.com/a b">x</a></p>');
  });

  it('reads an angle-bracket destination containing a closing paren', () => {
    expect(markdownToHTML('[x](<http://e.com/a(b)>)'))
      .toBe('<p><a href="http://e.com/a(b)">x</a></p>');
  });

  it('leaves a destination with no title untouched', () => {
    expect(markdownToHTML('[x](http://e.com)')).toBe('<p><a href="http://e.com">x</a></p>');
  });
});

// ---------------------------------------------------------------------------
// Character references
// ---------------------------------------------------------------------------

describe('markdownToHTML — character references', () => {
  it('preserves a named reference rather than double-escaping it', () => {
    expect(markdownToHTML('&copy; 2024')).toBe('<p>&copy; 2024</p>');
  });

  it('preserves decimal and hex references', () => {
    expect(markdownToHTML('&#8212; &#x2014;')).toBe('<p>&#8212; &#x2014;</p>');
  });

  it('still escapes a bare ampersand', () => {
    expect(markdownToHTML('A & B')).toBe('<p>A &amp; B</p>');
  });

  it('still escapes an ampersand that only looks like a reference', () => {
    expect(markdownToHTML('A &notanentity B')).toBe('<p>A &amp;notanentity B</p>');
  });
});

// ---------------------------------------------------------------------------
// Ordered lists with ) and pipe-less tables
// ---------------------------------------------------------------------------

describe('markdownToHTML — ordered list delimiters', () => {
  it('accepts the ) delimiter', () => {
    expect(markdownToHTML('1) a\n2) b')).toBe('<ol><li>a</li><li>b</li></ol>');
  });

  it('keeps an explicit start with the ) delimiter', () => {
    expect(markdownToHTML('5) a\n6) b')).toBe('<ol start="5"><li>a</li><li>b</li></ol>');
  });
});

describe('markdownToHTML — tables without outer pipes', () => {
  it('parses a GFM table whose rows have no leading or trailing pipe', () => {
    expect(markdownToHTML('a | b\n--- | ---\n1 | 2'))
      .toBe('<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>');
  });

  it('reads alignment markers in the bare form', () => {
    const html = markdownToHTML('a | b\n:--- | ---:\n1 | 2');
    expect(html).toContain('<th style="text-align:left">a</th>');
    expect(html).toContain('<th style="text-align:right">b</th>');
  });

  it('does not mistake prose containing a pipe for a table', () => {
    // The delimiter row must have as many cells as the header, so this stays a
    // setext heading rather than becoming a one-column table.
    expect(markdownToHTML('a | b\n---')).toBe('<h2>a | b</h2>');
  });
});

describe('markdownToHTML — email autolinks', () => {
  it('links an angle-bracket email address through mailto:', () => {
    expect(markdownToHTML('<foo@example.com>'))
      .toBe('<p><a href="mailto:foo@example.com">foo@example.com</a></p>');
  });

  it('leaves a non-address in angle brackets alone', () => {
    expect(markdownToHTML('<notanemail>')).toBe('<p>&lt;notanemail&gt;</p>');
  });
});

// ---------------------------------------------------------------------------
// htmlToMarkdown — escaping prose so it survives a round-trip
// ---------------------------------------------------------------------------

describe('htmlToMarkdown — escapes Markdown syntax in text', () => {
  const roundTrips = (html) => markdownToHTML(htmlToMarkdown(html));

  it.each([
    ['asterisks used as multiplication', '<p>2 * 3 * 4</p>'],
    ['underscores around words', '<p>use _foo_ and _bar_ literally</p>',],
    ['a doubled tilde', '<p>a ~~b~~ literal tildes</p>'],
    ['backticks', '<p>a `code` literal</p>'],
    ['square brackets', '<p>see [not a link] here</p>'],
    ['an image-looking run', '<p>![not an image](x)</p>'],
    ['a leading hash', '<p># not a heading</p>'],
    ['a leading dash', '<p>- not a bullet</p>'],
    ['a leading number', '<p>1. not a list</p>'],
    ['a leading angle bracket', '<p>&gt; not a quote</p>'],
    ['a backslash', '<p>C:\\path\\to\\file</p>'],
  ])('round-trips %s unchanged', (_label, html) => {
    expect(roundTrips(html)).toBe(html);
  });

  it('leaves intra-word underscores unescaped so the Markdown stays readable', () => {
    // They are not emphasis to begin with, so escaping them would only add noise.
    expect(htmlToMarkdown('<p>snake_case_name</p>')).toBe('snake_case_name');
  });

  it('does not escape inside a code span or code block', () => {
    expect(htmlToMarkdown('<p><code>a * b</code></p>')).toBe('`a * b`');
    expect(htmlToMarkdown('<pre><code>a * b</code></pre>')).toBe('```\na * b\n```');
  });

  it('escapes an ampersand that would otherwise become a character reference', () => {
    expect(htmlToMarkdown('<p>literal &amp;copy; text</p>')).toBe(String.raw`literal &amp;copy; text`);
    expect(roundTrips('<p>literal &amp;copy; text</p>')).toBe('<p>literal &amp;copy; text</p>');
  });

  it('escapes a line that would read as a thematic break', () => {
    expect(roundTrips('<p>---</p>')).toBe('<p>---</p>');
  });

  it('escapes pipes inside table cells', () => {
    const html = '<table><tr><td>a | b</td><td>c</td></tr></table>';
    expect(htmlToMarkdown(html)).toContain(String.raw`a \| b`);
  });
});

describe('htmlToMarkdown — round-trip fidelity', () => {
  it('preserves an explicit ordered-list start', () => {
    expect(htmlToMarkdown('<ol start="5"><li>a</li><li>b</li></ol>')).toBe('5. a\n6. b');
    expect(markdownToHTML('5. a\n6. b')).toBe('<ol start="5"><li>a</li><li>b</li></ol>');
  });

  it('preserves table column alignment', () => {
    const html = '<table><thead><tr><th style="text-align:center">a</th>'
      + '<th style="text-align:right">b</th></tr></thead>'
      + '<tbody><tr><td>1</td><td>2</td></tr></tbody></table>';
    expect(htmlToMarkdown(html)).toBe('| a | b |\n| :---: | ---: |\n| 1 | 2 |');
  });

  it('preserves a link title', () => {
    expect(htmlToMarkdown('<p><a href="http://e.com" title="T">x</a></p>'))
      .toBe('[x](http://e.com "T")');
  });

  it('preserves an image title', () => {
    expect(htmlToMarkdown('<p><img src="i.png" alt="a" title="T"></p>'))
      .toBe('![a](i.png "T")');
  });

  it('wraps a destination containing parentheses so it re-parses whole', () => {
    const md = htmlToMarkdown('<p><a href="http://e.com/a(b)">x</a></p>');
    expect(md).toBe('[x](<http://e.com/a(b)>)');
    expect(markdownToHTML(md)).toBe('<p><a href="http://e.com/a(b)">x</a></p>');
  });

  it('fences a code span around an embedded backtick', () => {
    const md = htmlToMarkdown('<p><code>a ` b</code></p>');
    expect(md).toBe('``a ` b``');
    expect(markdownToHTML(md)).toBe('<p><code>a ` b</code></p>');
  });

  it('indents a list item continuation paragraph so it stays in the item', () => {
    const md = htmlToMarkdown('<ul><li><p>a</p><p>b</p></li><li>c</li></ul>');
    expect(md).toBe('- a\n\n  b\n- c');
    // Re-parsing keeps `b` inside the first item rather than ending the list.
    expect(markdownToHTML(md)).toBe('<ul><li><p>a</p><p>b</p></li><li><p>c</p></li></ul>');
  });
});

// ---------------------------------------------------------------------------
// isMarkdown — detection gaps that left content pasted as plain text
// ---------------------------------------------------------------------------

describe('isMarkdown — additional constructs', () => {
  it.each([
    ['a tilde fence', '~~~\ncode\n~~~'],
    ['a table without outer pipes', 'a | b\n--- | ---\n1 | 2'],
    ['a ) ordered list', '1) first\n2) second'],
    ['a link alongside inline code', 'see [docs](http://e.com) and `npm i`'],
  ])('detects %s', (_label, text) => expect(isMarkdown(text)).toBe(true));

  it.each([
    ['a bare URL', 'see https://example.com for info'],
    ['a parenthetical aside', 'the result (see note) was good'],
    ['an email signature', 'Best,\nJohn -- Sent from my phone'],
    ['prose with inline numbering', 'I have 1. apples 2. oranges'],
  ])('does not treat %s as Markdown', (_label, text) => expect(isMarkdown(text)).toBe(false));
});

// ---------------------------------------------------------------------------
// .md file handling — byte-order mark
// ---------------------------------------------------------------------------

describe('markdownToHTML — UTF-8 byte-order mark', () => {
  const BOM = '﻿';

  it('parses the first block of a file saved with a BOM', () => {
    // FileReader.readAsText keeps the BOM, so a dropped .md file written by a
    // Windows editor had U+FEFF glued to its opening character — the heading
    // came through as a paragraph.
    expect(markdownToHTML(`${BOM}# Title\n\ntext`)).toBe('<h1>Title</h1><p>text</p>');
  });

  it('detects a BOM-prefixed file as Markdown', () => {
    expect(isMarkdown(`${BOM}# Title`)).toBe(true);
  });

  it('only strips a BOM at the very start', () => {
    expect(markdownToHTML(`text ${BOM} more`)).toBe(`<p>text ${BOM} more</p>`);
  });

  it('handles a BOM in front of frontmatter', () => {
    expect(markdownToHTML(`${BOM}---\ntitle: x\n---\n\n# T`)).toBe('<h1>T</h1>');
  });

  it('tolerates null and undefined input', () => {
    expect(markdownToHTML(null)).toBe('');
    expect(markdownToHTML(undefined)).toBe('');
    expect(isMarkdown(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Code content — spans, fences, and code inside list items
// ---------------------------------------------------------------------------

describe('markdownToHTML — code spans are literal', () => {
  it('keeps a character reference as written instead of decoding it', () => {
    // Code is literal text: `&amp;` inside backticks has to survive as those
    // five characters, not render as "&". Preserving entities in _esc() for
    // ordinary prose had started decoding them here too.
    expect(markdownToHTML('use `&amp;` here')).toBe('<p>use <code>&amp;amp;</code> here</p>');
  });

  it('still escapes a raw angle bracket', () => {
    expect(markdownToHTML('`if x < 5`')).toBe('<p><code>if x &lt; 5</code></p>');
  });

  it('does not treat a backslash as an escape inside a span', () => {
    // CommonMark: backslash escapes are inert inside a code span.
    expect(markdownToHTML('`a\\*b`')).toBe('<p><code>a\\*b</code></p>');
  });

  it('leaves an escaped backtick out of span detection', () => {
    expect(markdownToHTML('a \\`not code\\` b')).toBe('<p>a `not code` b</p>');
  });

  it('lets a longer backtick run hold a shorter one', () => {
    expect(markdownToHTML('`` a ` b ``')).toBe('<p><code>a ` b</code></p>');
  });

  it('leaves an empty backtick pair as literal text', () => {
    expect(markdownToHTML('a `` b')).toBe('<p>a `` b</p>');
  });
});

describe('markdownToHTML — fenced content is literal', () => {
  it('keeps character references as written', () => {
    expect(markdownToHTML('```\n&amp; &lt;div&gt;\n```'))
      .toBe('<pre><code>&amp;amp; &amp;lt;div&amp;gt;</code></pre>');
  });

  it('round-trips a fence containing entities', () => {
    const src = '```html\n<div>&amp;</div>\n```';
    expect(htmlToMarkdown(markdownToHTML(src))).toBe(src);
  });
});

describe('markdownToHTML — code blocks inside list items', () => {
  it('parses a fenced block in a loose item instead of folding it into the text', () => {
    // The fence lines used to be joined into the item's paragraph, where the
    // inline code-span rule mangled them into <code><code>js x </code></code>
    // and every line break was lost.
    expect(markdownToHTML('- item\n\n  ```js\n  const a = 1;\n  ```\n\n- next'))
      .toBe('<ul><li><p>item</p><pre><code class="language-js">const a = 1;</code></pre></li>'
          + '<li><p>next</p></li></ul>');
  });

  it('parses a fenced block in a tight item', () => {
    expect(markdownToHTML('- item\n  ```js\n  const a = 1;\n  ```'))
      .toBe('<ul><li>item<pre><code class="language-js">const a = 1;</code></pre></li></ul>');
  });

  it('parses a fenced block in an ordered item', () => {
    expect(markdownToHTML('1. step\n\n   ```sh\n   npm i\n   ```'))
      .toBe('<ol><li><p>step</p><pre><code class="language-sh">npm i</code></pre></li></ol>');
  });

  it('preserves interior indentation of the snippet', () => {
    const html = markdownToHTML('- item\n\n  ```js\n  if (a) {\n    b();\n  }\n  ```');
    expect(html).toContain('if (a) {\n  b();\n}');
  });

  it('accepts a tilde fence', () => {
    expect(markdownToHTML('- item\n\n  ~~~js\n  x\n  ~~~'))
      .toContain('<pre><code class="language-js">x</code></pre>');
  });

  it('keeps a code block and a nested list in source order', () => {
    expect(markdownToHTML('- item\n\n  ```js\n  x\n  ```\n\n  - sub'))
      .toBe('<ul><li><p>item</p><pre><code class="language-js">x</code></pre>'
          + '<ul><li>sub</li></ul></li></ul>');
  });

  it('works inside a blockquote', () => {
    expect(markdownToHTML('> - item\n>   ```js\n>   x\n>   ```'))
      .toBe('<blockquote><ul><li>item<pre><code class="language-js">x</code></pre></li></ul></blockquote>');
  });

  it('round-trips', () => {
    const src = '- item\n\n  ```js\n  const a = 1;\n  ```';
    expect(htmlToMarkdown(markdownToHTML(src))).toBe(src);
  });
});

describe('htmlToMarkdown — code block line breaks', () => {
  it('reads <br> as a newline, which is how contenteditable stores them', () => {
    // textContent drops <br> outright, so a code block typed in the editor
    // came back as one run-together line.
    expect(htmlToMarkdown('<pre><code>line1<br>line2<br>line3</code></pre>'))
      .toBe('```\nline1\nline2\nline3\n```');
  });

  it('reads block-level children as line breaks too', () => {
    expect(htmlToMarkdown('<pre><code><div>l1</div><div>l2</div></code></pre>'))
      .toBe('```\nl1\nl2\n```');
  });

  it('does not add a blank line for a trailing newline', () => {
    expect(htmlToMarkdown('<pre><code>a\n</code></pre>')).toBe('```\na\n```');
  });

  it('strips Prism markup back to the underlying source', () => {
    const html = '<pre><code class="language-js"><span class="token keyword">const</span>'
      + ' a <span class="token operator">=</span> <span class="token number">1</span>;</code></pre>';
    expect(htmlToMarkdown(html)).toBe('```js\nconst a = 1;\n```');
  });
});


// ---------------------------------------------------------------------------
// Termination and cost — conversion runs on whatever the user pastes
// ---------------------------------------------------------------------------

describe('markdownToHTML — empty ATX headings', () => {
  it.each(['# ', '#   ', '## ', '###### '])(
    'terminates on %p, a heading marker with no title',
    (input) => {
      // The heading regex required a title, and the paragraph collector refuses
      // any line starting with a heading marker — so this line was consumed by
      // neither and the block loop spun forever, freezing the page. Shipped in
      // 2.3.0 and 2.4.0.
      const start = performance.now();
      const html = markdownToHTML(input);
      expect(performance.now() - start).toBeLessThan(500);
      expect(html).toMatch(/^<h[1-6]><\/h[1-6]>$/);
    },
  );

  it('still reads a heading with a title', () => {
    expect(markdownToHTML('# title')).toBe('<h1>title</h1>');
  });

  it('leaves a bare marker with no space as a paragraph', () => {
    expect(markdownToHTML('#')).toBe('<p>#</p>');
  });
});

describe('markdownToHTML — bounded cost', () => {
  it.each([
    ['an unterminated frontmatter marker', `---\n${'a\n'.repeat(20_000)}`],
    ['a long run of backticks', '`'.repeat(40_000)],
    ['a long run of tildes', '~'.repeat(40_000)],
    ['a heading marker with a long space run', `#${' '.repeat(40_000)}`],
    ['a footnote definition with a long space run', `[^a]:${' '.repeat(40_000)}`],
    ['an unclosed angle-bracket destination', `[x](<${'a'.repeat(40_000)}`],
    ['a long run of emphasis markers', '*'.repeat(20_000)],
    ['one very long line', 'x'.repeat(200_000)],
  ])('stays fast on %s', (_label, input) => {
    const start = performance.now();
    markdownToHTML(input);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});

// ---------------------------------------------------------------------------
// A sublist parked beside its item must not take the item down with it
// ---------------------------------------------------------------------------

describe('htmlToMarkdown — sublist nested as a sibling', () => {
  it('keeps the indented item instead of dropping it', () => {
    // execCommand('indent') produces exactly this, and paste carries it in from
    // other editors. The sublist is not inside any <li>, so the converter used
    // to walk past it and return "- a\n- c" — deleting "b" from the export.
    const md = htmlToMarkdown('<ul><li>a</li><ul><li>b</li></ul><li>c</li></ul>');
    expect(md).toBe('- a\n  - b\n- c');
  });

  it('keeps it for ordered lists too', () => {
    const md = htmlToMarkdown('<ol><li>a</li><ol><li>b</li></ol><li>c</li></ol>');
    expect(md).toBe('1. a\n  1. b\n2. c');
  });

  it('survives a full round trip without losing the item', () => {
    const damaged = '<ul><li>a</li><ul><li>b</li></ul><li>c</li></ul>';
    const once = htmlToMarkdown(damaged);
    const twice = htmlToMarkdown(markdownToHTML(once));
    expect(twice).toBe(once);
    expect(twice).toContain('b');
  });

  it('does not mutate the caller’s DOM while repairing its own copy', () => {
    const host = document.createElement('div');
    host.innerHTML = '<ul><li>a</li><ul><li>b</li></ul></ul>';
    const before = host.innerHTML;
    htmlToMarkdown(host.innerHTML);
    expect(host.innerHTML).toBe(before);
  });
});
