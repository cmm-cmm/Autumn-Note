import { describe, it, expect, afterEach } from 'vitest';
import { Placeholder } from '../../src/js/module/Placeholder.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext(placeholder = 'Start typing...') {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
    options: { placeholder },
  };
}

describe('Placeholder', () => {
  it('sets placeholder dataset and toggles class by emptiness', () => {
    const context = makeContext();
    const module = new Placeholder(context);
    module.initialize();

    expect(context.layoutInfo.editable.dataset.placeholder).toBe('Start typing...');
    expect(context.layoutInfo.editable.classList.contains('an-placeholder')).toBe(true);

    context.layoutInfo.editable.textContent = 'Hello';
    module._update();
    expect(context.layoutInfo.editable.classList.contains('an-placeholder')).toBe(false);

    module.destroy();
  });
});
