import { describe, it, expect, vi, afterEach } from 'vitest';
import { Context } from '../../src/js/Context.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext(userOptions = {}) {
  const target = document.createElement('textarea');
  document.body.appendChild(target);
  return new Context(target, userOptions);
}

describe('Context event system', () => {
  it('calls both subscribed handlers and option callback via triggerEvent', () => {
    const onChange = vi.fn();
    const ctx = makeContext({ onChange });
    const handler = vi.fn();

    const unsubscribe = ctx.on('change', handler);
    ctx.triggerEvent('change', '<p>a</p>');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('<p>a</p>');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('<p>a</p>');

    unsubscribe();
    ctx.triggerEvent('change', '<p>b</p>');

    // Handler was removed; options callback still receives events.
    expect(handler).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('<p>b</p>');
  });
});

describe('Context utilities', () => {
  it('toggles readonly state through setDisabled', () => {
    const ctx = makeContext();
    const editable = document.createElement('div');
    const container = document.createElement('div');
    ctx.layoutInfo.editable = editable;
    ctx.layoutInfo.container = container;

    ctx.setDisabled(true);
    expect(editable.getAttribute('contenteditable')).toBe('false');
    expect(container.classList.contains('an-disabled')).toBe(true);

    ctx.setDisabled(false);
    expect(editable.getAttribute('contenteditable')).toBe('true');
    expect(container.classList.contains('an-disabled')).toBe(false);
  });

  it('syncs HTML back to textarea target', () => {
    const ctx = makeContext();
    ctx.getHTML = () => '<p>fresh</p>';

    ctx._syncToTarget();
    expect(ctx.targetEl.value).toBe('<p>fresh</p>');
  });
});
