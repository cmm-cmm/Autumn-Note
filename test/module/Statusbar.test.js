import { describe, it, expect, afterEach } from 'vitest';
import { Statusbar } from '../../src/js/module/Statusbar.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
});

const makeContext = (options = {}) => {
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
};

describe('Statusbar', () => {
  it('updates word/char counters and applies warning/exceeded classes', () => {
    const context = makeContext({ maxWords: 3, maxChars: 10 });
    const status = new Statusbar(context);
    status.initialize();

    // update() reads textContent; use textContent setter (jsdom innerText setter
    // does not update textContent — confirmed jsdom limitation).
    context.layoutInfo.editable.textContent = 'one two three';
    status.update();

    expect(status._wordCountEl.textContent).toBe('Words: 3/3');
    expect(status._charCountEl.textContent).toContain('Chars:');
    expect(status._wordCountEl.classList.contains('an-count-warn')).toBe(true);

    context.layoutInfo.editable.textContent = 'one two three four';
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

  it('initialize creates .an-statusbar element', () => {
    const context = makeContext();
    const status = new Statusbar(context);
    status.initialize();
    expect(status.el).not.toBeNull();
    expect(status.el.classList.contains('an-statusbar')).toBe(true);
    status.destroy();
  });

  it('initialize with resizable=true adds resize handle', () => {
    const context = makeContext({ resizable: true });
    const status = new Statusbar(context);
    status.initialize();
    expect(status.el.querySelector('.an-resize-handle')).not.toBeNull();
    status.destroy();
  });

  it('initialize with resizable=false has no resize handle', () => {
    const context = makeContext({ resizable: false });
    const status = new Statusbar(context);
    status.initialize();
    expect(status.el.querySelector('.an-resize-handle')).toBeNull();
    status.destroy();
  });

  it('destroy removes statusbar element and clears disposers', () => {
    const context = makeContext();
    const status = new Statusbar(context);
    status.initialize();
    const el = status.el;
    document.body.appendChild(el);
    status.destroy();
    expect(status.el).toBeNull();
    expect(status._disposers.length).toBe(0);
  });

  it('update with no limits shows count without slash', () => {
    const context = makeContext({ maxWords: 0, maxChars: 0 });
    const status = new Statusbar(context);
    status.initialize();
    context.layoutInfo.editable.textContent = 'hello world';
    status.update();
    expect(status._wordCountEl.textContent).not.toContain('/');
    status.destroy();
  });

  it('touch drag resizes container', () => {
    const context = makeContext({ resizable: true });
    const container = context.layoutInfo.container;
    Object.defineProperty(container, 'offsetHeight', { value: 300, configurable: true });
    const status = new Statusbar(context);
    status.initialize();
    const handle = status.el.querySelector('.an-resize-handle');

    const touch = { clientY: 0, identifier: 1 };
    handle.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], bubbles: true }));
    document.dispatchEvent(new TouchEvent('touchmove', { touches: [{ ...touch, clientY: 60 }], bubbles: true }));
    expect(Number.parseFloat(container.style.height)).toBeGreaterThan(300);
    document.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
    status.destroy();
  });

  it('touchend cleans up drag disposers', () => {
    const context = makeContext({ resizable: true });
    const status = new Statusbar(context);
    status.initialize();
    const handle = status.el.querySelector('.an-resize-handle');
    const touch = { clientY: 0, identifier: 1 };
    handle.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], bubbles: true }));
    document.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
    expect(status._dragDisposers).toBeNull();
    status.destroy();
  });

  it('mouseup cleans up drag disposers', () => {
    const context = makeContext({ resizable: true });
    const status = new Statusbar(context);
    status.initialize();
    const handle = status.el.querySelector('.an-resize-handle');
    handle.dispatchEvent(new MouseEvent('mousedown', { clientY: 100, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    expect(status._dragDisposers).toBeNull();
    status.destroy();
  });

  it('destroy during mouse drag calls disposers and removes listeners', () => {
    const context = makeContext({ resizable: true });
    const status = new Statusbar(context);
    status.initialize();
    const handle = status.el.querySelector('.an-resize-handle');
    handle.dispatchEvent(new MouseEvent('mousedown', { clientY: 100, bubbles: true }));
    // _dragDisposers should be set now — destroy() calls them
    expect(status._dragDisposers).not.toBeNull();
    status.destroy(); // calls disposers (lines 165-166)
    expect(status.el).toBeNull();
  });

  it('destroy during touch drag calls touch disposers', () => {
    const context = makeContext({ resizable: true });
    const status = new Statusbar(context);
    status.initialize();
    const handle = status.el.querySelector('.an-resize-handle');
    const touch = { clientY: 100, identifier: 1 };
    handle.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], bubbles: true }));
    expect(status._dragDisposers).not.toBeNull();
    status.destroy(); // calls touch disposers (lines 193-194)
    expect(status.el).toBeNull();
  });

  it('resize handle mousedown triggers container height resize', () => {
    const context = makeContext({ resizable: true });
    const container = context.layoutInfo.container;
    container.style.height = '300px';
    // jsdom does not have layout, so offsetHeight = 0 by default
    // Simulate via Object.defineProperty
    Object.defineProperty(container, 'offsetHeight', { value: 300, configurable: true });
    const status = new Statusbar(context);
    status.initialize();
    const handle = status.el.querySelector('.an-resize-handle');
    handle.dispatchEvent(new MouseEvent('mousedown', { clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 50, bubbles: true }));
    // Container height should increase by 50px
    expect(Number.parseFloat(container.style.height)).toBeGreaterThan(300);
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    status.destroy();
  });
});
