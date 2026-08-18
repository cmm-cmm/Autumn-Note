import { describe, it, expect } from 'vitest';
import { countWords, readText, TextCounter } from '../../src/js/core/count.js';

const host = (html) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
};

describe('countWords', () => {
  it('counts plain prose', () => {
    expect(countWords('one two three')).toBe(3);
    expect(countWords('  spaced   out  ')).toBe(2);
  });

  it('returns zero for empty and whitespace-only input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t ')).toBe(0);
  });

  it('counts scripts that do not space their words', () => {
    // The whole point of using Intl.Segmenter: a whitespace split reads this
    // as one word, which is what made maxWords unenforceable in Japanese.
    expect(countWords('私は学生です')).toBeGreaterThan(1);
    expect(countWords('这是一支笔')).toBeGreaterThan(1);
  });

  it('does not count punctuation as words', () => {
    expect(countWords('hello, world!')).toBe(2);
  });
});

describe('readText', () => {
  it('separates blocks with a newline and leaves the flat form alone', () => {
    const el = host('<p>hello</p><p>world</p>');
    const { lines, flat } = readText(el);
    expect(lines.replace(/\n+/g, '|')).toBe('|hello|world|');
    expect(flat).toBe('helloworld');
  });

  it('flat matches textContent exactly, so it works as a change key', () => {
    const el = host('<p>a<strong>b</strong></p><ul><li>c</li></ul><table><tr><td>d</td></tr></table>');
    expect(readText(el).flat).toBe(el.textContent);
  });

  it('handles a bare text node', () => {
    const node = document.createTextNode('loose');
    expect(readText(node)).toEqual({ lines: 'loose', flat: 'loose' });
  });
});

describe('TextCounter', () => {
  it('counts words across block boundaries rather than through them', () => {
    const el = host('<p>hello</p><p>world</p><p>again</p>');
    expect(new TextCounter().counts(el)).toEqual({ words: 3, chars: 15 });
  });

  it('separates list items and table cells', () => {
    const el = host('<ul><li>alpha</li><li>beta</li></ul><table><tr><td>gamma</td><td>delta</td></tr></table>');
    expect(new TextCounter().counts(el).words).toBe(4);
  });

  it('does not count the newlines it inserts as characters', () => {
    const el = host('<p>abc</p><p>de</p>');
    expect(new TextCounter().counts(el).chars).toBe(5);
  });

  it('does not count real newlines inside a <pre> either', () => {
    const el = host('<pre><code>a\nb</code></pre>');
    expect(new TextCounter().counts(el).chars).toBe(2);
  });

  it('follows an edit to one block while reusing the others', () => {
    const counter = new TextCounter();
    const el = host('<p>one two</p><p>three</p>');
    expect(counter.counts(el).words).toBe(3);

    el.lastElementChild.textContent = 'three four five';
    expect(counter.counts(el).words).toBe(5);

    el.lastElementChild.remove();
    expect(counter.counts(el).words).toBe(2);

    el.append(host('<p>six</p>').firstElementChild);
    expect(counter.counts(el).words).toBe(3);
  });

  it('agrees with itself whether the cache is cold or warm', () => {
    const markup = '<h1>Title</h1><p>Some prose here</p><ul><li>a b</li><li>c</li></ul><pre><code>x\ny</code></pre>';
    const cold = new TextCounter().counts(host(markup));

    const warm = new TextCounter();
    const el = host(markup);
    warm.counts(el);
    expect(warm.counts(el)).toEqual(cold);
  });

  it('is empty for an empty root', () => {
    expect(new TextCounter().counts(host(''))).toEqual({ words: 0, chars: 0 });
  });
});
