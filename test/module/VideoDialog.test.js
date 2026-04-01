import { describe, it, expect } from 'vitest';
import { VideoDialog } from '../../src/js/module/VideoDialog.js';

function makeDialog() {
  // Minimal context for constructor; tests call pure URL/HTML builders only.
  return new VideoDialog({ options: {} });
}

describe('VideoDialog', () => {
  it('builds valid YouTube iframe HTML without NaN artifacts', () => {
    const dialog = makeDialog();
    const html = dialog._buildEmbedHtml('https://www.youtube.com/watch?v=abcdefghijk', 560);

    expect(html).toContain('<iframe');
    expect(html).toContain('src="https://www.youtube.com/embed/abcdefghijk"');
    expect(html).toContain('width="560"');
    expect(html).toContain('height="315"');
    expect(html).not.toContain('NaN');
  });

  it('rejects javascript protocol URLs', () => {
    const dialog = makeDialog();
    const html = dialog._buildEmbedHtml('javascript:alert(1)', 560);
    expect(html).toBeNull();
  });
});
