import { describe, it, expect, vi, afterEach } from 'vitest';
import { Editor } from '../../src/js/module/Editor.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function makeContext(html = '<p>x</p>') {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    invoke: vi.fn((path, raw) => (path === 'clipboard.resolveImages' ? raw : undefined)),
    triggerEvent: vi.fn(),
  };
}

describe('Editor content helpers', () => {
  it('getHTML strips zero-width spaces before returning', () => {
    const context = makeContext('<p>a\u200Bb</p>');
    const editor = new Editor(context);
    const out = editor.getHTML();
    expect(out).toBe('<p>ab</p>');
    expect(context.invoke).toHaveBeenCalledWith('clipboard.resolveImages', '<p>ab</p>');
  });

  it('isEmpty treats media as non-empty content', () => {
    const context = makeContext('<p>\u00a0</p>');
    const editor = new Editor(context);
    expect(editor.isEmpty()).toBe(true);

    context.layoutInfo.editable.innerHTML = '<p></p><img src="x">';
    expect(editor.isEmpty()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// C4: _cleanOrphanedFigures — removes figure.an-figure elements without <img>
// ---------------------------------------------------------------------------

describe('Editor._cleanOrphanedFigures', () => {
  it('removes a figure.an-figure that contains only a figcaption (no img)', () => {
    const context = makeContext(
      '<p>Text before</p>' +
      '<figure class="an-figure"><figcaption class="an-figcaption">Caption</figcaption></figure>' +
      '<p>Text after</p>',
    );
    const editor = new Editor(context);

    editor._cleanOrphanedFigures();

    expect(context.layoutInfo.editable.querySelector('figure.an-figure')).toBeNull();
    // Surrounding paragraphs must be preserved
    const paras = context.layoutInfo.editable.querySelectorAll('p');
    expect(paras.length).toBe(2);
  });

  it('preserves a figure.an-figure that still contains an <img>', () => {
    const context = makeContext(
      '<figure class="an-figure">' +
        '<img src="photo.jpg" alt="photo">' +
        '<figcaption class="an-figcaption">A caption</figcaption>' +
      '</figure>',
    );
    const editor = new Editor(context);

    editor._cleanOrphanedFigures();

    expect(context.layoutInfo.editable.querySelector('figure.an-figure')).not.toBeNull();
    expect(context.layoutInfo.editable.querySelector('img')).not.toBeNull();
  });

  it('removes multiple orphaned figures in a single call', () => {
    const context = makeContext(
      '<figure class="an-figure"><figcaption>Cap 1</figcaption></figure>' +
      '<p>Middle</p>' +
      '<figure class="an-figure"><figcaption>Cap 2</figcaption></figure>',
    );
    const editor = new Editor(context);

    editor._cleanOrphanedFigures();

    expect(context.layoutInfo.editable.querySelectorAll('figure.an-figure').length).toBe(0);
  });

  it('is called by afterCommand so orphans are cleaned on every edit', () => {
    const context = makeContext(
      '<figure class="an-figure"><figcaption>Ghost</figcaption></figure>',
    );
    const editor = new Editor(context);

    editor.afterCommand();

    expect(context.layoutInfo.editable.querySelector('figure.an-figure')).toBeNull();
  });
});
