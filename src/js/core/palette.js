/**
 * palette.js - The colour swatches shown by the toolbar colour pickers, the
 * bubble toolbar and the context menu. One list, so the three agree.
 */

export const DEFAULT_COLOR_PALETTE = Object.freeze([
  // Grayscale
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#efefef', '#ffffff',
  // Saturated
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#9900ff', '#ff00ff',
  // Pastel
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#d9d2e9', '#ead1dc',
]);

/**
 * The swatches an editor shows: `colorSwatches` (brand colours) first, then
 * `colorPalette` — or the default palette when that is unset or empty.
 * Duplicates are dropped, keeping the first occurrence.
 * @param {{ colorPalette?: string[]|null, colorSwatches?: string[]|null }} [options]
 * @returns {string[]}
 */
export function resolvePalette(options) {
  const base = Array.isArray(options?.colorPalette) && options.colorPalette.length
    ? options.colorPalette
    : DEFAULT_COLOR_PALETTE;
  const extra = Array.isArray(options?.colorSwatches) ? options.colorSwatches : [];
  return [...new Set([...extra, ...base].filter((c) => typeof c === 'string' && c))];
}
