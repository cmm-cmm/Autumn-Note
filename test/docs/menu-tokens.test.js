import { compile } from 'sass';
import { resolve } from 'node:path';

// Every floating surface — menus, popovers, tooltips, dialogs — must read its
// background, border, shadow and backdrop from the --an-menu-* tokens, so a
// single themeVars setting makes all of them transparent or frosted at once.
// A new surface that hardcodes `var(--an-bg)` would silently stay opaque.
const SURFACES = [
  'an-table-picker-popup', 'an-color-popup', 'an-link-tooltip', 'an-size-popover',
  'an-cell-shade-popover', 'an-dialog-box', 'an-contextmenu', 'an-bubble-toolbar',
  'an-bubble-color-picker', 'an-mention-dropdown', 'an-slash-menu',
];

const css = compile(resolve(__dirname, '..', '..', 'src/styles/autumnnote.scss')).css;

/** The declarations of the top-level `.cls {…}` rule. */
function rule(cls) {
  const m = css.match(new RegExp(String.raw`(?:^|\n)\.${cls} \{([^}]*)\}`));
  return m ? m[1] : null;
}

describe('menu surface tokens', () => {
  it.each(SURFACES)('.%s reads background, border, shadow and backdrop from --an-menu-*', (cls) => {
    const body = rule(cls);
    expect(body, `.${cls} rule not found`).not.toBeNull();
    expect(body).toMatch(/background: var\(--an-menu-bg,/);
    expect(body).toMatch(/border: 1px solid var\(--an-menu-border,/);
    expect(body).toMatch(/box-shadow: var\(--an-menu-shadow,/);
    expect(body).toMatch(/backdrop-filter: var\(--an-menu-backdrop, none\)/);
  });

  it('dark-theme surface colours stay overridable by --an-menu-bg', () => {
    // A bare #24273a background on a surface would ignore the token in dark mode.
    const bare = css.match(/\.an-theme-dark [^{]*\{[^}]*background(?:-color)?: #24273a;[^}]*\}/g) ?? [];
    const offenders = bare.filter((r) => SURFACES.some((s) => r.includes(`.${s}`)));
    expect(offenders).toEqual([]);
  });
});
