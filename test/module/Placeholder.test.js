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

// ---------------------------------------------------------------------------
// A1 / D1: Placeholder hidden when editor contains non-text content
// ---------------------------------------------------------------------------

describe('Placeholder — non-text content detection', () => {
  it('does NOT show placeholder when the editable contains an <img>', () => {
    const context = makeContext();
    const module = new Placeholder(context);
    module.initialize();

    context.layoutInfo.editable.innerHTML = '<img src="photo.jpg">';
    module._update();

    expect(context.layoutInfo.editable.classList.contains('an-placeholder')).toBe(false);
    module.destroy();
  });

  it('does NOT show placeholder when the editable contains a <table>', () => {
    const context = makeContext();
    const module = new Placeholder(context);
    module.initialize();

    context.layoutInfo.editable.innerHTML = '<table><tr><td>cell</td></tr></table>';
    module._update();

    expect(context.layoutInfo.editable.classList.contains('an-placeholder')).toBe(false);
    module.destroy();
  });

  it('does NOT show placeholder when the editable contains only a .an-video-wrapper (no text)', () => {
    const context = makeContext();
    const module = new Placeholder(context);
    module.initialize();

    // Simulate an editor whose only content is an embedded video
    context.layoutInfo.editable.innerHTML =
      '<div class="an-video-wrapper"><iframe src="https://www.youtube.com/embed/x"></iframe>' +
      '<div class="an-video-shield"></div></div>';
    module._update();

    // The placeholder must NOT appear — the video IS content
    expect(context.layoutInfo.editable.classList.contains('an-placeholder')).toBe(false);
    module.destroy();
  });

  it('shows placeholder again after the video wrapper is removed', () => {
    const context = makeContext();
    const module = new Placeholder(context);
    module.initialize();

    context.layoutInfo.editable.innerHTML =
      '<div class="an-video-wrapper"><iframe src="https://example.com/v"></iframe></div>';
    module._update();
    expect(context.layoutInfo.editable.classList.contains('an-placeholder')).toBe(false);

    context.layoutInfo.editable.innerHTML = '';
    module._update();
    expect(context.layoutInfo.editable.classList.contains('an-placeholder')).toBe(true);

    module.destroy();
  });
});
