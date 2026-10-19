/**
 * icon-paths.js - Inner markup of the stroked 24×24 icons that several
 * modules draw (toolbar, bubble toolbar, context menu, tooltips, dialogs).
 * Kept once here so the CDN bundle does not carry each glyph two or three
 * times; each module still wraps it at its own size via svgIcon() or its
 * local wrapper.
 *
 * The set is drawn for square line caps and mitred joins (see ICON_STROKE in
 * dom.js): frames are sharp, and where a glyph needs a corner softened it is
 * cut at 45° rather than rounded.
 */

export const PATHS = {
  alignJustify: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  alignLeft: '<path d="M4 6h16M4 12h10M4 18h13"/>',
  alignCenter: '<path d="M4 6h16M7 12h10M5.5 18h13"/>',
  alignRight: '<path d="M4 6h16M10 12h10M7 18h13"/>',
  backColor: '<path d="M4 20v-3.5l9-9 3.5 3.5-9 9zM11 9.5l3.5 3.5"/>',
  bold: '<path d="M7 4h6l3 3v1.5l-3 3H7zM7 11.5h7.5l3 3V17l-3 3H7z"/>',
  caption: '<path d="M3 3h18v11H3zM6 18h12M9 21h6"/>',
  code: '<path d="M9 4H7.5L6 5.5v5L4.5 12 6 13.5v5L7.5 20H9M15 4h1.5L18 5.5v5l1.5 1.5-1.5 1.5v5L16.5 20H15"/>',
  copy: '<path d="M9 9h11v11H9zM15 9V4H4v11h5"/>',
  edit: '<path d="M11 4H4v16h16v-7M17 3l4 4-9 9H8v-4z"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
  floatLeft: '<path d="M3 4h7v7H3zM13 5h8M13 8h8M13 11h8M3 15h18M3 19h14"/>',
  floatNone: '<path d="M3 4h7v7H3zM3 15h18M3 19h14"/>',
  floatRight: '<path d="M14 4h7v7h-7zM3 5h8M3 8h8M3 11h8M3 15h18M3 19h14"/>',
  foreColor: '<path d="M5 19 12 4l7 15M8 13h8"/>',
  highlight: '<path d="M4 18v-3.5l9-9L16.5 9l-9 9zM11 7.5l3.5 3.5M3 21h18"/>',
  image: '<path d="M3 4h18v16H3z"/><path d="M7 7.5h3v3H7z" fill="currentColor" stroke="none"/><path d="M3 18l5-5 4 4 3-3 6 6"/>',
  italic: '<path d="M10 4h8M6 20h8M14.5 4l-5 16"/>',
  link: '<path d="M13 6.5 15.5 4H20v4.5L16.5 12M11 17.5 8.5 20H4v-4.5L7.5 12M9.5 14.5l5-5"/>',
  redo: '<path d="M4 20v-7l4-4h12M16 5l4 4-4 4"/>',
  removeFormat: '<path d="M9.5 20 4 14.5 13.5 5l6.5 6.5-8.5 8.5zM8.5 10l6.5 6.5M14 20h7"/>',
  strike: '<path d="M4 12h16M16.5 7 15 5.5H9.5L7.5 7.5v1.5L9 10.5M14.5 14l1.5 1.5v2L14 19.5H8.5L7 18"/>',
  table: '<path d="M3 4h18v16H3zM3 9.5h18M3 15h18M9 9.5V20M15 9.5V20"/>',
  trash: '<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  underline: '<path d="M7 4v8l3 3h4l3-3V4M5 20h14"/>',
  undo: '<path d="M20 20v-7l-4-4H4M8 5 4 9l4 4"/>',
  video: '<path d="M3 6h12v12H3zM15 10.5 21 7v10l-6-3.5"/>',
};
