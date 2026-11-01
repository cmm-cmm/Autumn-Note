import { isTransparentColor, paintSwatch, TRANSPARENT } from '../../src/js/core/palette.js';
import { sanitiseHTML } from '../../src/js/core/sanitise.js';

describe('isTransparentColor', () => {
  it.each([
    'transparent', 'TRANSPARENT', ' transparent ', 'rgba(0, 0, 0, 0)', 'rgba(255,255,255,0.0)',
    'hsla(0, 0%, 0%, 0)', 'rgb(0 0 0 / 0)', 'rgb(0 0 0 / 0%)',
  ])('treats %j as transparent', (c) => {
    expect(isTransparentColor(c)).toBe(true);
  });

  it.each(['', null, undefined, '#ffffff', 'rgba(0, 0, 0, 0.5)', 'rgb(0, 0, 0)', 'red'])(
    'does not treat %j as transparent', (c) => {
      expect(isTransparentColor(c)).toBe(false);
    },
  );
});

describe('paintSwatch', () => {
  it('draws the checkerboard class for a transparent colour', () => {
    const el = document.createElement('span');
    paintSwatch(el, TRANSPARENT);
    expect(el.classList.contains('an-swatch-transparent')).toBe(true);
    expect(el.style.background).toBe('');
  });

  it('fills a real colour and drops the checkerboard again', () => {
    const el = document.createElement('span');
    paintSwatch(el, TRANSPARENT);
    paintSwatch(el, '#ff0000');
    expect(el.classList.contains('an-swatch-transparent')).toBe(false);
    expect(el.style.background).toContain('rgb(255, 0, 0)');
  });

  it('leaves an unset colour empty rather than checkered', () => {
    const el = document.createElement('span');
    paintSwatch(el, '');
    expect(el.classList.contains('an-swatch-transparent')).toBe(false);
  });
});

describe('transparent colours survive sanitising', () => {
  it('keeps transparent background-color and border-color', () => {
    const out = sanitiseHTML(
      '<table><tbody><tr><td style="background-color: transparent; border-color: transparent">x</td></tr></tbody></table>'
      + '<p><span style="background-color: transparent">y</span></p>',
    );
    expect(out).toContain('background-color: transparent');
    expect(out).toContain('border-color: transparent');
  });
});
