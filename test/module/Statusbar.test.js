import { describe, it, expect, afterEach } from 'vitest';
import { Statusbar } from '../../src/js/module/Statusbar.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext(options = {}) {
  const container = document.createElement('div');
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    layoutInfo: { container, editable },
    locale: en,
    options: {
      resizable: false,
      maxWords: 0,
      maxChars: 0,
      ...options,
    },
  };
}

describe('Statusbar', () => {
  it('updates word/char counters and applies warning/exceeded classes', () => {
    const context = makeContext({ maxWords: 3, maxChars: 10 });
    const status = new Statusbar(context);
    status.initialize();

    context.layoutInfo.editable.innerText = 'one two three';
    status.update();

    expect(status._wordCountEl.textContent).toBe('Words: 3/3');
    expect(status._charCountEl.textContent).toContain('Chars:');
    expect(status._wordCountEl.classList.contains('an-count-warn')).toBe(true);

    context.layoutInfo.editable.innerText = 'one two three four';
    status.update();
    expect(status._wordCountEl.classList.contains('an-count-exceeded')).toBe(true);

    status.destroy();
  });

  it('returns numeric counts via public getters', () => {
    const context = makeContext();
    const status = new Statusbar(context);
    status.initialize();

    context.layoutInfo.editable.innerText = 'hello world';
    expect(status.getWordCount()).toBe(2);
    expect(status.getCharCount()).toBe('hello world'.length);

    status.destroy();
  });
});
