import { compile } from 'sass';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

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

/**
 * The declarations of every top-level `.cls {…}` block, joined: Sass splits a
 * rule into several blocks around the nested @supports of `an-menu-bg`.
 */
function rule(cls) {
  const blocks = [...css.matchAll(new RegExp(String.raw`(?:^|\n)\.${cls} \{([^}]*)\}`, 'g'))];
  return blocks.length ? blocks.map((m) => m[1]).join('\n') : null;
}

/** The declarations of `.cls {…}` inside the color-mix @supports block. */
function supportsRule(cls) {
  const re = new RegExp(String.raw`@supports \(color: color-mix\(in srgb, red 50%, transparent\)\) \{\s*\.${cls} \{([^}]*)\}`);
  return css.match(re)?.[1] ?? null;
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

  it.each(SURFACES)('.%s mixes its background with --an-menu-opacity where color-mix() exists', (cls) => {
    const body = supportsRule(cls);
    expect(body, `.${cls} has no @supports color-mix block`).not.toBeNull();
    expect(body).toMatch(/background: var\(--an-menu-bg, color-mix\(in srgb, .+ var\(--an-menu-opacity, 100%\), transparent\)\)/);
  });

  it('the toolbar reads --an-toolbar-opacity and --an-toolbar-backdrop', () => {
    expect(rule('an-toolbar')).toMatch(/backdrop-filter: var\(--an-toolbar-backdrop, none\)/);
    expect(supportsRule('an-toolbar')).toMatch(
      /background: color-mix\(in srgb, var\(--an-bg-toolbar, #f9fafb\) var\(--an-toolbar-opacity, 100%\), transparent\)/,
    );
    // Dark theme too, or the token would only work in light mode.
    expect(css).toMatch(/\.an-theme-dark \.an-toolbar \{\s*background: color-mix\(in srgb, var\(--an-bg-toolbar\) var\(--an-toolbar-opacity, 100%\), transparent\)/);
  });

  it('leaves the -webkit- prefix to the build', () => {
    // Writing both backdrop-filter and -webkit-backdrop-filter with var()
    // values made the CSS minifier drop the unprefixed one, so Chromium and
    // Firefox never blurred. The build adds the prefix itself.
    const scss = readFileSync(resolve(__dirname, '..', '..', 'src/styles/autumnnote.scss'), 'utf8');
    expect(scss).not.toMatch(/-webkit-backdrop-filter/);
  });

  it('dark-theme surface colours stay overridable by --an-menu-bg', () => {
    // A bare #24273a background on a surface would ignore the token in dark mode.
    const bare = css.match(/\.an-theme-dark [^{]*\{[^}]*background(?:-color)?: #24273a;[^}]*\}/g) ?? [];
    const offenders = bare.filter((r) => SURFACES.some((s) => r.includes(`.${s}`)));
    expect(offenders).toEqual([]);
  });
});
