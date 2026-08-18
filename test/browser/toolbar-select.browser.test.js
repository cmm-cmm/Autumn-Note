import AutumnNote from '../../src/js/index.js';
import * as locales from '../../src/js/i18n/all.js';

/**
 * The toolbar selects used to carry px width caps tuned for English, so
 * "Bình thường" rendered as "Bình thườ" and "Times New Roman" lost 45px in
 * every locale at the narrow breakpoint. A select's whole job is to show the
 * current value, so this asserts the value actually fits — for every option, in
 * every shipped locale, rather than for the one label that happened to be
 * measured by hand.
 */
describe('toolbar selects fit their labels in every locale', () => {
  let target;
  let editor;

  beforeAll(() => {
    for (const [code, locale] of Object.entries(locales)) {
      if (locale && typeof locale === 'object' && locale.toolbar) AutumnNote.registerLocale(code, locale);
    }
  });

  afterEach(() => {
    editor?.destroy();
    target?.remove();
    editor = null;
    target = null;
  });

  const LANGS = ['en', 'vi', 'ja', 'de', 'es', 'fr', 'ko', 'zh'];

  /** Widths of every option label, measured in the select's own rendered font. */
  function overflows(select) {
    const cs = getComputedStyle(select);
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const chrome = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    const content = select.getBoundingClientRect().width - chrome;
    return [...select.options]
      .map((opt) => ({ label: opt.textContent, over: ctx.measureText(opt.textContent).width - content }))
      // Sub-pixel rounding in the intrinsic width calculation is not clipping.
      .filter((r) => r.over > 1);
  }

  function mount(lang) {
    const b = AutumnNote.buttons;
    target = document.createElement('textarea');
    document.body.appendChild(target);
    editor = AutumnNote.create(target, {
      lang,
      toolbar: [[b.paragraphStyleBtn, b.fontFamilyBtn, b.fontSizeBtn, b.lineHeightBtn]],
    });
    return [...document.querySelectorAll('select[data-btn]')];
  }

  for (const lang of LANGS) {
    it(`shows every option in full for lang=${lang}`, () => {
      const selects = mount(lang);
      expect(selects).toHaveLength(4);

      const clipped = selects.flatMap((sel) =>
        overflows(sel).map((r) => `${sel.dataset.btn}: "${r.label}" clipped by ${r.over.toFixed(1)}px`)
      );
      expect(clipped).toEqual([]);
    });
  }

  it('ends an over-long custom font name with an ellipsis instead of slicing it', () => {
    const b = AutumnNote.buttons;
    target = document.createElement('textarea');
    document.body.appendChild(target);
    editor = AutumnNote.create(target, {
      fontFamilies: ['Arial', 'Helvetica Neue Condensed Extra Black Display'],
      toolbar: [[b.fontFamilyBtn]],
    });

    const sel = document.querySelector('select[data-btn="fontFamily"]');
    const cs = getComputedStyle(sel);
    // The cap is a guard, not a layout target: it has to bite here…
    expect(overflows(sel).length).toBeGreaterThan(0);
    // …and when it does, the label ends rather than losing half a glyph.
    expect(cs.textOverflow).toBe('ellipsis');
  });

  it('runs the checks above at the narrow breakpoint, where the caps used to bite hardest', () => {
    // Not a behaviour assertion — it pins the premise. The px caps this suite
    // guards against were tightest under 640px, so if the harness viewport ever
    // widens past it these tests quietly stop covering the case they exist for.
    expect(window.innerWidth).toBeLessThanOrEqual(640);
  });
});
