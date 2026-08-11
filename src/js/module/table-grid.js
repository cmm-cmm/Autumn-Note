/**
 * table-grid.js - Geometry helpers for tables inside the editor.
 *
 * A table's DOM order is not its visual order once colspan/rowspan are in play,
 * so every structural operation (insert, delete, merge, sort) needs to reason
 * about the *visual* grid rather than about `row.cells` indices. These helpers
 * are pure functions of the table element, which keeps them independently
 * testable and free of any tooltip state.
 */

/**
 * Returns the visual (logical) column index of a cell, taking colspan into
 * account for all preceding cells in the same row.
 * @param {HTMLTableCellElement} cell
 * @returns {number} 0-based visual column index, or -1 on failure
 */
function getVisualColIndex(cell) {
  const row = cell.closest('tr');
  if (!row) return -1;
  let visualIdx = 0;
  for (const c of row.cells) {
    if (c === cell) return visualIdx;
    visualIdx += c.colSpan || 1;
  }
  return -1;
}

/**
 * Finds the first cell in a row whose visual start column equals visualIdx.
 * Returns null if no exact match (e.g. the column is spanned by a merged cell).
 * @param {HTMLTableRowElement} row
 * @param {number} visualIdx
 * @returns {HTMLTableCellElement|null}
 */
function getCellAtVisualCol(row, visualIdx) {
  let vIdx = 0;
  for (const c of row.cells) {
    if (vIdx === visualIdx) return c;
    if (vIdx > visualIdx) break;
    vIdx += c.colSpan || 1;
  }
  return null;
}

/**
 * Finds the first cell whose visual range ends after visualIdx
 * (used for inserting a new column to the right of visualIdx).
 * @param {HTMLTableRowElement} row
 * @param {number} visualIdx
 * @returns {HTMLTableCellElement|null} reference cell for insertBefore, or null = append
 */
function getCellAfterVisualCol(row, visualIdx) {
  let vIdx = 0;
  for (const c of row.cells) {
    vIdx += c.colSpan || 1;
    if (vIdx > visualIdx) {
      // next cell after the one that starts at / spans visualIdx
      const next = c.nextElementSibling;
      return (next?.tagName === 'TD' || next?.tagName === 'TH') ? /** @type {HTMLTableCellElement} */ (next) : null;
    }
  }
  return null;
}

/**
 * Build a 2D grid map of the table, accounting for both rowspan and colspan.
 *
 * gridMap[r][c] = the DOM cell occupying visual grid position (r, c).
 * cellPos       = WeakMap: cell → { r, c, rs, cs }  (top-left grid origin + span).
 *
 * Uses HTMLTableElement.rows which is scoped to the table itself and never
 * includes rows from nested tables.
 *
 * @param {HTMLTableElement} table
 * @returns {{ gridMap: Object, cellPos: WeakMap }}
 */
function buildGridMap(table) {
  const rows = Array.from(table.rows);
  const gridMap = {};
  const cellPos = new WeakMap();
  rows.forEach((row, r) => {
    if (!gridMap[r]) gridMap[r] = {};
    let c = 0;
    for (const cell of row.cells) {
      // Skip positions already occupied by a rowspan from a previous row
      while (gridMap[r][c]) c++;
      const rs = cell.rowSpan || 1;
      const cs = cell.colSpan || 1;
      cellPos.set(cell, { r, c, rs, cs });
      for (let dr = 0; dr < rs; dr++) {
        if (!gridMap[r + dr]) gridMap[r + dr] = {};
        for (let dc = 0; dc < cs; dc++) {
          gridMap[r + dr][c + dc] = cell;
        }
      }
      c += cs;
    }
  });
  return { gridMap, cellPos };
}

export { getVisualColIndex, getCellAtVisualCol, getCellAfterVisualCol, buildGridMap };
