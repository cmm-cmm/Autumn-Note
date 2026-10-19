/**
 * table-icons.js - Inline SVG glyphs for the table tooltip's action bar.
 *
 * Kept out of TableTooltip.js because the markup is ~9 KB of static data that
 * obscures the module's actual logic; nothing here has behaviour.
 */

import { svgIcon } from '../core/dom.js';
import { PATHS } from '../core/icon-paths.js';

export const ICONS = {
  rowAbove:    svgIcon(`<rect x="3" y="3" width="18" height="18"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3v7"/><path d="M9 7l3-4 3 4"/>`),
  rowBelow:    svgIcon(`<rect x="3" y="3" width="18" height="18"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 12v7"/><path d="M9 17l3 4 3-4"/>`),
  deleteRow:   svgIcon(`<rect x="3" y="3" width="18" height="18"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="21" y1="15" x2="15" y2="21"/>`),
  colLeft:     svgIcon(`<rect x="3" y="3" width="18" height="18"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 12h7"/><path d="M7 8l-4 4 4 4"/>`),
  colRight:    svgIcon(`<rect x="3" y="3" width="18" height="18"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M12 12h9"/><path d="M17 8l4 4-4 4"/>`),
  deleteCol:   svgIcon(`<rect x="3" y="3" width="18" height="18"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="15" y1="6" x2="21" y2="12"/><line x1="21" y1="6" x2="15" y2="12"/>`),
  mergeCells:   svgIcon(`<rect x="2" y="7" width="8" height="10"/><rect x="14" y="7" width="8" height="10"/><path d="M10 12h4"/><path d="M12 10l2 2-2 2"/>`),
  unmergeCells: svgIcon(`<rect x="2" y="5" width="20" height="14"/><line x1="12" y1="5" x2="12" y2="19" stroke-dasharray="2.5 2"/><line x1="2" y1="12" x2="22" y2="12" stroke-dasharray="2.5 2"/><path d="M9 9 L6 12 L9 15"/><path d="M15 9 L18 12 L15 15"/>`),
  colWidth:    svgIcon(`<line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="7" y1="12" x2="17" y2="12"/><path d="M10 9l-3 3 3 3"/><path d="M14 9l3 3-3 3"/>`),
  rowHeight:   svgIcon(`<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><line x1="12" y1="7" x2="12" y2="17"/><path d="M9 10l3-3 3 3"/><path d="M9 14l3 3 3-3"/>`),
  tableBorder: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="square"><line x1="3" y1="6" x2="21" y2="6" stroke-width="1"/><line x1="3" y1="13" x2="21" y2="13" stroke-width="2"/><line x1="3" y1="20" x2="21" y2="20" stroke-width="3"/></svg>`,
  deleteTable: svgIcon(`<rect x="3" y="3" width="18" height="18"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="16" y1="16" x2="22" y2="22" stroke="#ef4444"/><line x1="22" y1="16" x2="16" y2="22" stroke="#ef4444"/>`),
  selectCells: svgIcon(`<path d="M4 4 L4 20 L9 15 L12 21 L14 20 L11 14 L17 14 Z" fill="currentColor" opacity="0.15"/><path d="M4 4 L4 20 L9 15 L12 21 L14 20 L11 14 L17 14 Z"/>`, 13, 1.8),
  cellShade:   svgIcon(`<path d="M19 11L8.93 3.36a1 1 0 0 0-1.29.08L3.22 7.8a1 1 0 0 0-.07 1.29L11 20"/><path d="m5 14 5-5"/><path d="M22 22l-2 2h-3l-2-2c0-1.5 2.5-5 3.5-5s3.5 3.5 3.5 5z"/>`),
  borderColor: svgIcon(`<rect x="3" y="3" width="18" height="14"/><line x1="3" y1="10" x2="21" y2="10" stroke-width="1.5"/><line x1="12" y1="3" x2="12" y2="17" stroke-width="1.5"/><path d="M3 21h18" stroke-width="3"/>`),
  alignLeft:    svgIcon(PATHS.alignLeft),
  alignCenter:  svgIcon(`<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>`),
  alignRight:   svgIcon(PATHS.alignRight),
  alignJustify: svgIcon(PATHS.alignJustify),
  headerRow:    svgIcon(`<rect x="3" y="3" width="18" height="18"/><rect x="3" y="3" width="18" height="8" fill="currentColor" opacity="0.2"/><line x1="3" y1="11" x2="21" y2="11"/><line x1="3" y1="16" x2="21" y2="16"/><line x1="9" y1="11" x2="9" y2="21"/><line x1="15" y1="11" x2="15" y2="21"/>`),
  sortAsc:     svgIcon(`<line x1="4" y1="6" x2="11" y2="6"/><line x1="4" y1="12" x2="11" y2="12"/><line x1="4" y1="18" x2="13" y2="18"/><path d="M15 9l3-3 3 3"/><line x1="18" y1="6" x2="18" y2="18"/>`),
  sortDesc:    svgIcon(`<line x1="4" y1="6" x2="13" y2="6"/><line x1="4" y1="12" x2="11" y2="12"/><line x1="4" y1="18" x2="11" y2="18"/><path d="M15 15l3 3 3-3"/><line x1="18" y1="6" x2="18" y2="18"/>`),
  exportCSV:   svgIcon(`<path d="M21 15v4l-2 2H5l-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`),
  cellPadding: svgIcon(`<rect x="3" y="3" width="18" height="18"/><rect x="7" y="7" width="10" height="10" stroke-dasharray="2 1.5"/>`),
};
