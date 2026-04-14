import { describe, it, expect, afterEach } from 'vitest';
import { CodeTooltip } from '../../src/js/module/CodeTooltip.js';
import { ImageTooltip } from '../../src/js/module/ImageTooltip.js';
import { en } from '../../src/js/i18n/en.js';

function makeContext(options = {}) {
  const editable = document.createElement('div');
  document.body.appendChild(editable);
  return {
    layoutInfo: { editable },
    options: { codeHighlight: false, ...options },
    locale: en,
    invoke: () => {},
  };
}

afterEach(() => {
  document.body.innerHTML = '';
  // Keep deterministic globals between tests
  delete window.Prism;
});

describe('CodeTooltip', () => {
  it('positions with viewport coordinates for fixed tooltip', () => {
    const context = makeContext({ codeHighlight: false });
    const tooltip = new CodeTooltip(context);
    tooltip.initialize();

    const pre = document.createElement('pre');
    context.layoutInfo.editable.appendChild(pre);
    pre.getBoundingClientRect = () => ({
      top: 100,
      bottom: 140,
      left: 80,
      width: 200,
      height: 40,
      right: 280,
      x: 80,
      y: 100,
      toJSON: () => ({}),
    });

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 120, configurable: true });

    tooltip._show(pre);

    // For position:fixed tooltips, style coordinates must not include window scroll offsets.
    expect(tooltip._el.style.top).toBe('62px');
    expect(tooltip._el.style.left).toBe('50px');

    tooltip.destroy();
  });

  it('does not inject duplicate Prism assets across instances', () => {
    const ctx1 = makeContext({ codeHighlight: true });
    const ctx2 = makeContext({ codeHighlight: true });

    const t1 = new CodeTooltip(ctx1);
    t1.initialize();
    const t2 = new CodeTooltip(ctx2);
    t2.initialize();

    const links = document.head.querySelectorAll('link[href*="prism-tomorrow.min.css"]');
    const scripts = document.head.querySelectorAll('script[src*="/prism.min.js"]');

    expect(links.length).toBe(1);
    expect(scripts.length).toBe(1);

    t1.destroy();
    t2.destroy();
  });
});

describe('ImageTooltip', () => {
  it('deletes parent figure wrapper when active image is inside figure', () => {
    let afterCommandCalls = 0;
    let deselectCalls = 0;
    const context = makeContext();
    context.invoke = (path) => {
      if (path === 'editor.afterCommand') afterCommandCalls += 1;
      if (path === 'imageResizer.deselect') deselectCalls += 1;
    };

    const tooltip = new ImageTooltip(context);
    tooltip.initialize();

    const figure = document.createElement('figure');
    figure.className = 'an-figure';
    const img = document.createElement('img');
    const cap = document.createElement('figcaption');
    cap.className = 'an-figcaption';
    cap.textContent = 'Caption';
    figure.appendChild(img);
    figure.appendChild(cap);
    context.layoutInfo.editable.appendChild(figure);

    tooltip._activeImg = img;
    tooltip._delete();

    expect(context.layoutInfo.editable.querySelector('figure.an-figure')).toBeNull();
    expect(afterCommandCalls).toBe(1);
    expect(deselectCalls).toBe(1);

    tooltip.destroy();
  });
});

// ---------------------------------------------------------------------------
// C1 / C3: ImageTooltip _setCenter uses fit-content on figure target
// ---------------------------------------------------------------------------

describe('ImageTooltip — _setCenter / _setFloat alignment', () => {
  it('_setCenter sets width:fit-content on a figure.an-figure target', () => {
    let invokedPaths = [];
    const context = makeContext();
    context.invoke = (path) => { invokedPaths.push(path); };

    const tooltip = new ImageTooltip(context);
    tooltip.initialize();

    const figure = document.createElement('figure');
    figure.className = 'an-figure';
    const img = document.createElement('img');
    figure.appendChild(img);
    context.layoutInfo.editable.appendChild(figure);

    tooltip._activeImg = img;
    tooltip._setCenter();

    expect(figure.style.display).toBe('block');
    expect(figure.style.marginLeft).toBe('auto');
    expect(figure.style.marginRight).toBe('auto');
    // C1/C3: fit-content makes the block figure match the image width so
    // margin:auto actually centres it visually.
    expect(figure.style.width).toBe('fit-content');
    expect(invokedPaths).toContain('editor.afterCommand');

    // Null out _activeImg before destroy so the pending requestAnimationFrame
    // guard `if (this._activeImg)` prevents _positionNear from firing on a
    // nulled tooltip element.
    tooltip._activeImg = null;
    tooltip.destroy();
  });

  it('_setCenter does NOT set width on a bare <img> (not wrapped in figure)', () => {
    const context = makeContext();
    context.invoke = () => {};

    const tooltip = new ImageTooltip(context);
    tooltip.initialize();

    const img = document.createElement('img');
    context.layoutInfo.editable.appendChild(img);

    tooltip._activeImg = img;
    tooltip._setCenter();

    // When target === img, width should not be set (to avoid stretching the image)
    expect(img.style.width).toBe('');

    tooltip._activeImg = null;
    tooltip.destroy();
  });

  it('_setFloat clears figure width so it can shrink-wrap while floating', () => {
    const context = makeContext();
    context.invoke = () => {};

    const tooltip = new ImageTooltip(context);
    tooltip.initialize();

    const figure = document.createElement('figure');
    figure.className = 'an-figure';
    figure.style.width = 'fit-content'; // previously centred
    const img = document.createElement('img');
    figure.appendChild(img);
    context.layoutInfo.editable.appendChild(figure);

    tooltip._activeImg = img;
    tooltip._setFloat('left');

    expect(figure.style.width).toBe('');
    expect(figure.style.float).toBe('left');

    tooltip._activeImg = null;
    tooltip.destroy();
  });

  it('_setFloat("") removes float and sets no width', () => {
    const context = makeContext();
    context.invoke = () => {};

    const tooltip = new ImageTooltip(context);
    tooltip.initialize();

    const figure = document.createElement('figure');
    figure.className = 'an-figure';
    figure.style.float = 'right';
    figure.style.width = 'fit-content';
    const img = document.createElement('img');
    figure.appendChild(img);
    context.layoutInfo.editable.appendChild(figure);

    tooltip._activeImg = img;
    tooltip._setFloat('');

    expect(figure.style.float).toBe('');
    expect(figure.style.width).toBe('');

    tooltip._activeImg = null;
    tooltip.destroy();
  });
});
