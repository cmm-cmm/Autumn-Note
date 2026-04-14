import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmojiDialog } from '../../src/js/module/EmojiDialog.js';
import { ImageCropOverlay } from '../../src/js/module/ImageCropOverlay.js';
import { LinkTooltip } from '../../src/js/module/LinkTooltip.js';
import { TableTooltip } from '../../src/js/module/TableTooltip.js';
import { VideoTooltip } from '../../src/js/module/VideoTooltip.js';
import { en } from '../../src/js/i18n/en.js';

afterEach(() => {
  document.body.innerHTML = '';
});

if (typeof window.requestAnimationFrame !== 'function') {
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
}
if (typeof window.cancelAnimationFrame !== 'function') {
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

function makeEditableContext(html = '<p>x</p>') {
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  document.body.appendChild(editable);
  return {
    options: {},
    layoutInfo: { editable },
    locale: en,
    invoke: vi.fn(),
  };
}

describe('Remaining modules smoke', () => {
  it('EmojiDialog lazy-builds on show and destroys cleanly', () => {
    const context = makeEditableContext('<p>hello</p>');
    const em = new EmojiDialog(context);
    em.initialize();

    em.show();
    expect(document.querySelector('.an-emoji-box')).not.toBeNull();

    em.destroy();
    expect(document.querySelector('.an-emoji-box')).toBeNull();
  });

  it('ImageCropOverlay opens and closes overlay DOM', () => {
    const context = makeEditableContext('<p><img src="x"></p>');
    const crop = new ImageCropOverlay(context);
    crop.initialize();

    const img = context.layoutInfo.editable.querySelector('img');
    img.getBoundingClientRect = () => ({
      left: 10, top: 10, width: 120, height: 80, right: 130, bottom: 90,
      x: 10, y: 10, toJSON: () => ({}),
    });

    crop.open(img);
    expect(document.querySelector('.an-crop-scrim')).not.toBeNull();

    crop._close(false);
    expect(document.querySelector('.an-crop-scrim')).toBeNull();
  });

  it('Link/Table/Video tooltip modules initialize and destroy', () => {
    const context = makeEditableContext('<p><a href="https://e.com">e</a></p><table><tbody><tr><td>x</td></tr></tbody></table><div class="an-video-wrapper"><iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe><div class="an-video-shield"></div></div>');

    const link = new LinkTooltip(context);
    const table = new TableTooltip(context);
    const video = new VideoTooltip(context);

    link.initialize();
    table.initialize();
    video.initialize();

    expect(document.querySelector('.an-link-tooltip')).not.toBeNull();
    expect(document.querySelector('.an-table-tooltip')).not.toBeNull();
    expect(document.querySelector('.an-video-tooltip')).not.toBeNull();

    link.destroy();
    table.destroy();
    video.destroy();
  });
});
