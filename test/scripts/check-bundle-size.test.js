import { BUDGETS, WARN_HEADROOM, classify } from '../../scripts/check-bundle-size.mjs';
import { UMD_ALIASES, aliasBody } from '../../scripts/create-umd-aliases.mjs';

const budget = { min: 50 * 1024, max: 100 * 1024 };

describe('classify', () => {
  it('fails a bundle over its ceiling', () => {
    expect(classify(budget.max + 1, budget)).toBe('over');
  });

  it('fails a bundle under its sanity floor', () => {
    expect(classify(budget.min - 1, budget)).toBe('under');
  });

  it('warns when less than WARN_HEADROOM of the budget is left', () => {
    expect(classify(budget.max - budget.max * WARN_HEADROOM + 1, budget)).toBe('tight');
    expect(classify(budget.max, budget)).toBe('tight');
  });

  it('passes a bundle with room to spare', () => {
    expect(classify(budget.max - budget.max * WARN_HEADROOM, budget)).toBe('ok');
    expect(classify(budget.min, budget)).toBe('ok');
  });
});

describe('budgets', () => {
  it('measures only bundles with their own content, not the UMD copies', () => {
    for (const alias of UMD_ALIASES) expect(BUDGETS.has(alias)).toBe(false);
  });

  it('gives the UMD build more room than the ES build for the locales it inlines', () => {
    expect(BUDGETS.get('dist/autumnnote.umd.js').max)
      .toBeGreaterThan(BUDGETS.get('dist/autumnnote.es.js').max);
  });
});

describe('aliasBody', () => {
  it('drops the trailing sourceMappingURL comment', () => {
    expect(aliasBody('code();\n//# sourceMappingURL=autumnnote.umd.js.map\n')).toBe('code();');
  });

  it('leaves a source without the comment unchanged', () => {
    expect(aliasBody('code();')).toBe('code();');
  });
});
