/**
 * The native formatting engine. Unlike the execCommand it replaces, it runs in
 * jsdom, so these tests check the resulting DOM and selection directly.
 *
 * Markup notation: `{` and `}` mark the selection's start and end inside text,
 * `|` a collapsed caret. `html()` writes them back where the selection ended
 * up, so each expectation also pins the selection. `~` stands for the
 * zero-width space that holds a caret placeholder open.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import * as F from '../../src/js/editing/format.js';
import * as Style from '../../src/js/editing/Style.js';

let host;

afterEach(() => {
  host?.remove();
  host = null;
  globalThis.getSelection().removeAllRanges();
});

const ZW = '\u200B';

/** Builds an editable from marked-up HTML and selects what the markers say. */
function setup(markup) {
  host = document.createElement('div');
  host.setAttribute('contenteditable', 'true');
  document.body.appendChild(host);
  host.innerHTML = markup.replaceAll('~', ZW);
  const points = {};
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  const texts = [];
  let n;
  while ((n = walker.nextNode())) texts.push(n);
  for (const text of texts) {
    for (const mark of ['{', '}', '|']) {
      const at = text.data.indexOf(mark);
      if (at === -1) continue;
      text.deleteData(at, 1);
      points[mark] = [text, at];
      // A later mark in the same node moved one to the left.
      for (const other of ['{', '}', '|']) {
        if (other !== mark && points[other]?.[0] === text && points[other][1] > at) points[other][1] -= 1;
      }
    }
  }
  const range = document.createRange();
  if (points['|']) {
    range.setStart(...points['|']);
    range.collapse(true);
  } else if (points['{']) {
    range.setStart(...points['{']);
    range.setEnd(...(points['}'] || points['{']));
  }
  const sel = globalThis.getSelection();
  sel.removeAllRanges();
  if (points['|'] || points['{']) sel.addRange(range);
  return host;
}

/** The editable's HTML with the selection marked back in. */
function html() {
  const sel = globalThis.getSelection();
  const clone = host.cloneNode(true);
  if (sel.rangeCount) {
    const r = sel.getRangeAt(0);
    const mark = (container, offset, ch) => {
      const path = [];
      for (let c = container; c && c !== host; c = c.parentNode) path.unshift([...c.parentNode.childNodes].indexOf(c));
      let target = clone;
      for (const i of path) target = target.childNodes[i];
      if (target.nodeType === 3) target.insertData(offset, ch);
      else target.insertBefore(document.createTextNode(ch), target.childNodes[offset] || null);
    };
    if (host.contains(r.startContainer)) {
      if (r.collapsed) mark(r.startContainer, r.startOffset, '|');
      else {
        mark(r.endContainer, r.endOffset, '}');
        mark(r.startContainer, r.startOffset, '{');
      }
    }
  }
  return clone.innerHTML.replaceAll(ZW, '~');
}

describe('inline formats', () => {
  it('bolds part of a text node', () => {
    setup('<p>he{llo} world</p>');
    F.setInline('bold');
    expect(html()).toBe('<p>he<b>{llo}</b> world</p>');
  });

  it('unbolds part of a bold run, keeping the rest bold', () => {
    setup('<p><b>he{ll}o</b></p>');
    F.setInline('bold');
    expect(html()).toBe('<p><b>he</b>{ll}<b>o</b></p>');
  });

  it('keeps the other formats when removing one', () => {
    setup('<p><b><i>a{b}c</i></b></p>');
    F.setInline('bold');
    expect(html()).toBe('<p><b><i>a</i></b><i>{b}</i><b><i>c</i></b></p>');
  });

  it('bolds a mixed selection entirely, as one element', () => {
    setup('<p>{a<b>b</b>c}</p>');
    F.setInline('bold');
    expect(html()).toBe('<p><b>{abc}</b></p>');
  });

  it('formats every block of a multi-block selection separately', () => {
    setup('<p>a{b</p><p>c}d</p>');
    F.setInline('italic');
    expect(html()).toBe('<p>a<i>{b</i></p><p><i>c}</i>d</p>');
  });

  it('recognises <strong> and inline font-weight as bold', () => {
    setup('<p><strong>{x}</strong> <span style="font-weight: bold;">y</span></p>');
    expect(F.isInlineActive('bold')).toBe(true);
    F.setInline('bold');
    expect(html()).toBe('<p>{x} <span style="font-weight: bold;">y</span></p>');
    setup('<p><span style="font-weight: bold; color: red;">{y}</span></p>');
    F.setInline('bold');
    expect(html()).toBe('<p><span style="color: red;">{y}</span></p>');
  });

  it('underline removal inside inline code works (execCommand misreported it there)', () => {
    setup('<p><code><u>{x}</u></code></p>');
    expect(F.isInlineActive('underline')).toBe(true);
    F.setInline('underline');
    expect(html()).toBe('<p><code>{x}</code></p>');
  });

  it('writes strikethrough as <s> and removes <strike>/<del> too', () => {
    setup('<p>{a}</p>');
    F.setInline('strikethrough');
    expect(html()).toBe('<p><s>{a}</s></p>');
    setup('<p><strike>{a}</strike><del>b</del></p>');
    F.setInline('strikethrough', false);
    expect(html()).toBe('<p>{a}<del>b</del></p>');
  });

  it('superscript replaces subscript, and the other way round', () => {
    setup('<p><sub>{x}</sub></p>');
    F.setInline('superscript');
    expect(html()).toBe('<p><sup>{x}</sup></p>');
  });

  it('reports state from the DOM: all selected text must carry the format', () => {
    setup('<p><b>{a</b>b}</p>');
    expect(F.isInlineActive('bold')).toBe(false);
    setup('<p><b>a|b</b></p>');
    expect(F.isInlineActive('bold')).toBe(true);
    setup('<p>a|b</p>');
    expect(F.isInlineActive('bold')).toBe(false);
  });

  it('does nothing without a selection in editable content', () => {
    setup('<p>abc</p>');
    const outside = document.createElement('p');
    outside.textContent = 'page text';
    document.body.appendChild(outside);
    const r = document.createRange();
    r.selectNodeContents(outside);
    globalThis.getSelection().removeAllRanges();
    globalThis.getSelection().addRange(r);
    expect(F.setInline('bold')).toBe(false);
    expect(outside.innerHTML).toBe('page text');
    outside.remove();
  });
});

describe('content elements are never treated as formatting', () => {
  it('keeps an icon when removing italic around it', () => {
    setup('<p><i>{ab</i><i class="fas fa-star"></i><i>cd}</i></p>');
    F.setInline('italic', false);
    expect(host.innerHTML).toBe('<p>ab<i class="fas fa-star"></i>cd</p>');
  });

  it('keeps an icon through removeFormat', () => {
    setup('<p>{ab<i class="fas fa-star"></i>cd}</p>');
    F.removeFormat();
    expect(host.innerHTML).toBe('<p>ab<i class="fas fa-star"></i>cd</p>');
  });

  it('keeps two identical icons side by side as two', () => {
    setup('<p>{ab<i class="fa x"></i><i class="fa x"></i>cd}</p>');
    F.setInline('bold');
    expect(host.innerHTML).toBe('<p><b>ab<i class="fa x"></i><i class="fa x"></i>cd</b></p>');
  });

  it('does not merge two identical mentions', () => {
    setup('<p>a{b<span class="an-mention" contenteditable="false">@x</span><span class="an-mention" contenteditable="false">@x</span>c}</p>');
    F.setInline('bold');
    expect(host.querySelectorAll('.an-mention')).toHaveLength(2);
  });

  it('formats both runs of a list item broken by a nested list', () => {
    setup('<ul><li>a{bc<ul><li>x</li></ul>de}f</li></ul>');
    F.setInline('bold');
    expect(host.innerHTML.replace(/[{}]/g, '')).toBe('<ul><li>a<b>bc</b><ul><li><b>x</b></li></ul><b>de</b>f</li></ul>');
  });
});

describe('collapsed selections format what is typed next', () => {
  it('opens a placeholder inside a new element', () => {
    setup('<p>ab|c</p>');
    F.setInline('bold');
    expect(html()).toBe('<p>ab<b>~|</b>c</p>');
    expect(F.isInlineActive('bold')).toBe(true);
  });

  it('reuses a placeholder instead of nesting a second one', () => {
    setup('<p>ab|c</p>');
    F.setInline('bold');
    F.setInline('italic');
    expect(html()).toBe('<p>ab<b><i>~|</i></b>c</p>');
  });

  it('steps out of a format at the caret, keeping other formats', () => {
    setup('<p><i><b>ab|c</b></i></p>');
    F.setInline('bold');
    expect(html()).toBe('<p><i><b>ab</b>~|<b>c</b></i></p>');
    expect(F.isInlineActive('bold')).toBe(false);
    expect(F.isInlineActive('italic')).toBe(true);
  });

  it('turning a fresh placeholder off again leaves no empty element', () => {
    setup('<p>ab|c</p>');
    F.setInline('bold');
    F.setInline('bold');
    expect(html()).toBe('<p>ab~|c</p>');
  });

  it('absorbs the zero-width space once text is typed next to it', () => {
    setup('<p>ab<b>~x|</b></p>');
    F.absorbPlaceholder();
    expect(html()).toBe('<p>ab<b>x|</b></p>');
  });
});

describe('style-valued formats', () => {
  it('wraps the selection in a styled span', () => {
    setup('<p>a{bc}d</p>');
    F.applyStyle('color', 'red');
    expect(html()).toBe('<p>a<span style="color: red;">{bc}</span>d</p>');
  });

  it('recolours an existing span instead of nesting', () => {
    setup('<p>a<span style="color: red;">{bc}</span>d</p>');
    F.applyStyle('color', 'blue');
    expect(html()).toBe('<p>a<span style="color: blue;">{bc}</span>d</p>');
  });

  it('overrides the property on everything inside the selection', () => {
    setup('<p>{a<span style="color: red; font-size: 20px;">b</span>}</p>');
    F.applyStyle('color', 'blue');
    expect(html()).toBe('<p><span style="color: blue;">{a<span style="font-size: 20px;">b}</span></span></p>');
  });

  it('maps legacy fontSize values 1–7 to pixel sizes', () => {
    setup('<p>{x}</p>');
    Style.execCommand('fontSize', '7');
    expect(html()).toBe('<p><span style="font-size: 48px;">{x}</span></p>');
  });

  it('writes the font family as a style, not a <font face>', () => {
    setup('<p>{x}</p>');
    Style.fontName('Georgia');
    expect(html()).toBe('<p><span style="font-family: Georgia;">{x}</span></p>');
  });

  it('removes a legacy <font> attribute it replaces', () => {
    setup('<p><font color="red">{x}</font></p>');
    Style.foreColor('blue');
    expect(html()).toBe('<p><span style="color: blue;">{x}</span></p>');
  });

  it('removeFormat strips inline formatting but keeps links', () => {
    setup('<p>{<b>a</b><span style="color: red;">b</span><a href="https://x.test/" style="color: red;">c</a>}</p>');
    F.removeFormat();
    expect(html()).toBe('<p>{ab<a href="https://x.test/">c}</a></p>');
  });
});

describe('links', () => {
  it('links the selection', () => {
    setup('<p>go {here} now</p>');
    const links = F.createLink('https://x.test/');
    expect(links).toHaveLength(1);
    expect(html()).toBe('<p>go <a href="https://x.test/">{here}</a> now</p>');
  });

  it('replaces links inside the selection', () => {
    setup('<p>{a<a href="https://old.test/">b</a>c}</p>');
    F.createLink('https://new.test/');
    expect(html()).toBe('<p><a href="https://new.test/">{abc}</a></p>');
  });

  it('unlink removes the whole link around the caret', () => {
    setup('<p><a href="https://x.test/">li|nk</a> text</p>');
    F.unlink();
    expect(html()).toBe('<p>li|nk text</p>');
  });
});

describe('blocks', () => {
  it('changes the block tag, keeping alignment', () => {
    setup('<p style="text-align: center;">ti|tle</p>');
    F.formatBlock('h2');
    expect(html()).toBe('<h2 style="text-align: center;">ti|tle</h2>');
  });

  it('accepts the <tag> form of the value', () => {
    setup('<p>x|</p>');
    Style.execCommand('formatBlock', '<blockquote>');
    expect(html()).toBe('<blockquote>x|</blockquote>');
  });

  it('wraps loose text in the host before formatting it', () => {
    setup('lo|ose');
    F.formatBlock('h1');
    expect(html()).toBe('<h1>lo|ose</h1>');
  });

  it('joins consecutive paragraphs into one code block', () => {
    setup('<p>{a</p><p>b}</p>');
    F.formatBlock('pre');
    expect(host.innerHTML).toBe('<pre>a\nb</pre>');
  });

  it('turns a code block back into lines', () => {
    setup('<pre>a|\nb</pre>');
    F.formatBlock('p');
    expect(html()).toBe('<p>a|<br>b</p>');
  });

  it('formats inside a list item instead of replacing it', () => {
    setup('<ul><li>it|em</li></ul>');
    F.formatBlock('h3');
    expect(html()).toBe('<ul><li><h3>it|em</h3></li></ul>');
    F.formatBlock('p');
    expect(html()).toBe('<ul><li>it|em</li></ul>');
  });

  it('aligns blocks; left clears the property', () => {
    setup('<p>{a</p><p>b}</p>');
    F.align('center');
    expect(host.innerHTML).toBe('<p style="text-align: center;">a</p><p style="text-align: center;">b</p>');
    F.align('left');
    expect(host.innerHTML).toBe('<p>a</p><p>b</p>');
  });

  it('reports the block tag at the caret', () => {
    setup('<h3>a|</h3>');
    expect(F.currentBlockTag()).toBe('h3');
    setup('<ul><li>a|</li></ul>');
    expect(F.currentBlockTag()).toBe('p');
  });
});

describe('lists', () => {
  it('makes one list from consecutive paragraphs', () => {
    setup('<p>{a</p><p>b}</p>');
    F.toggleList('ul');
    expect(html()).toBe('<ul><li>{a</li><li>b}</li></ul>');
  });

  it('turns selected items back into paragraphs, splitting the list', () => {
    setup('<ol><li>a</li><li>b|</li><li>c</li></ol>');
    F.toggleList('ol');
    expect(html()).toBe('<ol><li>a</li></ol><p>b|</p><ol><li>c</li></ol>');
  });

  it('switches the list type', () => {
    setup('<ol><li>a|</li></ol>');
    Style.insertUnorderedList();
    expect(html()).toBe('<ul><li>a|</li></ul>');
  });

  it('joins a new list to a plain list of the same kind above it', () => {
    setup('<ul><li>a</li></ul><p>b|</p>');
    F.toggleList('ul');
    expect(html()).toBe('<ul><li>a</li><li>b|</li></ul>');
  });

  it('gives an empty paragraph an item with a line break', () => {
    setup('<p><br></p>');
    const r = document.createRange();
    r.setStart(host.firstChild, 0);
    globalThis.getSelection().addRange(r);
    F.toggleList('ul');
    expect(host.innerHTML).toBe('<ul><li><br></li></ul>');
  });

  it('indents an item into a sublist of the one above, and back', () => {
    setup('<ul><li>a</li><li>b|</li></ul>');
    F.indent();
    expect(html()).toBe('<ul><li>a<ul><li>b|</li></ul></li></ul>');
    F.outdent();
    expect(html()).toBe('<ul><li>a</li><li>b|</li></ul>');
  });

  it('keeps the items below an outdented item nested under it', () => {
    setup('<ul><li>a<ul><li>b|</li><li>c</li></ul></li></ul>');
    F.outdent();
    expect(html()).toBe('<ul><li>a</li><li>b|<ul><li>c</li></ul></li></ul>');
  });

  it('cannot indent the first item', () => {
    setup('<ul><li>a|</li></ul>');
    F.indent();
    expect(html()).toBe('<ul><li>a|</li></ul>');
  });

  it('outdents a top-level item to a paragraph', () => {
    setup('<ul><li>a|</li></ul>');
    F.outdent();
    expect(html()).toBe('<p>a|</p>');
  });

  it('indents other blocks with a margin, and outdents them back', () => {
    setup('<p>a|</p>');
    F.indent();
    F.indent();
    expect(html()).toBe('<p style="margin-left: 80px;">a|</p>');
    F.outdent();
    F.outdent();
    expect(html()).toBe('<p>a|</p>');
  });

  it('unwraps the borderless blockquote older versions indented with', () => {
    setup('<blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><p>a|</p></blockquote>');
    F.outdent();
    expect(html()).toBe('<p>a|</p>');
  });
});

describe('Style.execCommand', () => {
  it('warns about and refuses unknown commands', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setup('<p>{x}</p>');
    expect(Style.execCommand('decreaseFontSize')).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('decreaseFontSize'));
    warn.mockRestore();
  });

  it('never reaches document.execCommand', () => {
    const native = vi.fn();
    Object.defineProperty(document, 'execCommand', { value: native, configurable: true, writable: true });
    setup('<p>{x}</p>');
    for (const cmd of ['bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript', 'removeFormat', 'justifyCenter', 'indent', 'outdent', 'insertUnorderedList', 'insertOrderedList', 'unlink']) {
      Style.execCommand(cmd);
    }
    Style.execCommand('foreColor', 'red');
    Style.execCommand('formatBlock', 'h2');
    Style.execCommand('createLink', 'https://x.test/');
    expect(native).not.toHaveBeenCalled();
    delete document.execCommand;
  });
});
