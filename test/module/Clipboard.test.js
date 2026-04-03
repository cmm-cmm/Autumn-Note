import { describe, it, expect, afterEach } from 'vitest';
import { Clipboard } from '../../src/js/module/Clipboard.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext() {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    invoke: () => {},
    triggerEvent: () => {},
  };
}

describe('Clipboard', () => {
  it('setForcePlain toggles one-shot plain paste flag', () => {
    const c = new Clipboard(makeContext());
    c.setForcePlain(true);
    expect(c._forcePlain).toBe(true);
    c.setForcePlain(false);
    expect(c._forcePlain).toBe(false);
  });

  it('resolveImages replaces known blob URLs with data URLs', () => {
    const c = new Clipboard(makeContext());
    c._blobRegistry = new Map([
      ['blob:abc', 'data:image/png;base64,AAA'],
    ]);
    const html = '<p><img src="blob:abc"></p>';
    expect(c.resolveImages(html)).toContain('data:image/png;base64,AAA');
  });
});
