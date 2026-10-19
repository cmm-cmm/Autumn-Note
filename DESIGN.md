# DESIGN.md: autumnnote-plus site

Direction supplied by the owner (Habibi Ahmad Aziz): the site follows the visual language of the owner's portfolio, habibiahmada.dev. This file records that language and the decisions taken with the owner on 2026-10-19. It applies to the demo site (`demo/`) and to the editor's built-in icons.

Dial: ENERGY 3 / RHYTHM 3 / MOTION 2

## Identity

- Product: `autumnnote-plus`, an unofficial fork of Autumn Note, a WYSIWYG editor in vanilla JavaScript.
- Personality: an engineer's tool presented with a designer's confidence. Large, heavy headlines; quiet, exact supporting text; real commands and real output instead of decoration.
- Voice: plain and specific. Say what the editor does and how to install it. No marketing adjectives.

## Logo

- Wordmark: `autumnnote` in the display face, followed by a `+` in the accent colour (after the portfolio's `habibiahmada.` with its coloured period).
- Favicon: an accent `+` on a dark square.

## Palette

Neutral base plus one accent. Light and dark themes both ship, with a toggle; the default follows the system setting.

| Token | Dark | Light |
|---|---|---|
| Background | `#050505` | `#fafafa` |
| Surface | `#0c0c0d` | `#ffffff` |
| Surface 2 | `#141416` | `#f4f4f5` |
| Line (decorative) | `#232326` | `#e4e4e7` |
| Control border (3:1) | `#71717a` | `#8a8a93` |
| Text | `#fafafa` | `#09090b` |
| Muted text | `#a1a1aa` | `#52525b` |
| Faint text | `#86868f` | `#66666e` |
| Accent | `#f87171` | `#b91c1c` |

The accent marks one word in a headline, the `+` of the logo, active states and focus. It is not used for backgrounds or decoration.

## Typography

- Display: Space Grotesk 700, tight negative tracking. Used for headlines and the wordmark, as on the portfolio.
- Body: Geist 400/500.
- Labels, code, commands: Geist Mono. Small labels are UPPERCASE with wide tracking. This repeats a portfolio signature and was kept by the owner over antislop R-06.

## Shape and depth

- Radius never exceeds 12px (owner direction): panels and code blocks 12px, buttons and inputs 8px, small marks 6px. Buttons: primary solid, secondary outlined. Badges: none above headlines (dropped by the owner).
- Dropdowns: a styled list (site: `demo/assets/select.js`; editor: customizable `<select>` where supported) with a coral `+` on the chosen option.
- No shadows except on floating UI (editor UI and the open dropdown list). Depth comes from surface steps and 1px lines.

## Motion

- Lenis smooth scrolling on every page, off when the visitor prefers reduced motion.
- Sections fade and rise once as they enter the viewport; nothing loops.
- View Transitions: the theme toggle grows the new theme as a circle from the click, and moving between pages keeps the header still while the old page fades out and the new one rises in (as on habibiahmada.dev). Both are skipped under reduced motion or without the API.

## Icons

- One drawn set for both the site and the editor toolbar: 24px grid, 1.75px stroke, square line caps and mitred joins. Frames are sharp; where a corner needs softening it is cut at 45° rather than rounded, and list bullets are squares. It replaces the previous rounded, Lucide-style glyphs so the icons read as part of this product.
- The demo editors take the site's surfaces, lines and text through `themeVars`, but keep the editor's default accent, so the demos show the colours a project gets out of the box.

## Language

- The site is English only. The editor keeps its nine locales, and the demos let visitors switch the editor's language.
