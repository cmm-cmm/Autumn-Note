/**
 * Table.js - Table creation and manipulation utilities
 * Inspired by Summernote's table handling
 */

import { createElement } from '../core/dom.js';
import { execCommand } from './Style.js';

// ---------------------------------------------------------------------------
// Table creation
// ---------------------------------------------------------------------------

/**
 * Creates a table element with the specified dimensions.
 * @param {number} cols
 * @param {number} rows
 * @returns {HTMLTableElement}
 */
export function createTable(cols, rows) {
  const table = createElement('table', { class: 'an-table' });
  const tbody = createElement('tbody');
  table.appendChild(tbody);

  for (let r = 0; r < rows; r++) {
    const tr = createElement('tr');
    for (let c = 0; c < cols; c++) {
      const td = createElement('td', {}, ['\u00a0']); // &nbsp;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  return table;
}

/**
 * Inserts a table at the current cursor position.
 * @param {number} cols
 * @param {number} rows
 */
export function insertTable(cols, rows) {
  const table = createTable(cols, rows);
  execCommand('insertHTML', table.outerHTML);
}

// ---------------------------------------------------------------------------
// Table navigation
// ---------------------------------------------------------------------------

/**
 * Returns the table cell (td or th) that contains node.
 * @param {Node} node
 * @returns {HTMLTableCellElement|null}
 */
export function closestCell(node) {
  let el = node.nodeType === 1 ? node : node.parentElement;
  while (el) {
    if (/^(TD|TH)$/i.test(el.nodeName)) return el;
    el = el.parentElement;
  }
  return null;
}

/**
 * Returns all cells in the table.
 * @param {HTMLTableElement} table
 * @returns {HTMLTableCellElement[]}
 */
export function getCells(table) {
  return Array.from(table.querySelectorAll('td, th'));
}

/**
 * Adds a row after the current row.
 * @param {HTMLTableCellElement} cell
 */
export function addRowAfter(cell) {
  const row = cell.closest('tr');
  if (!row) return;
  const colCount = row.cells.length;
  const newRow = createElement('tr');
  for (let i = 0; i < colCount; i++) {
    newRow.appendChild(createElement('td', {}, ['\u00a0']));
  }
  row.insertAdjacentElement('afterend', newRow);
}

/**
 * Adds a row before the current row.
 * @param {HTMLTableCellElement} cell
 */
export function addRowBefore(cell) {
  const row = cell.closest('tr');
  if (!row) return;
  const colCount = row.cells.length;
  const newRow = createElement('tr');
  for (let i = 0; i < colCount; i++) {
    newRow.appendChild(createElement('td', {}, ['\u00a0']));
  }
  row.insertAdjacentElement('beforebegin', newRow);
}

/**
 * Adds a column after the current cell's column.
 * @param {HTMLTableCellElement} cell
 */
export function addColAfter(cell) {
  const colIndex = cell.cellIndex;
  const table = cell.closest('table');
  if (!table) return;
  Array.from(table.rows).forEach((row) => {
    const newCell = createElement('td', {}, ['\u00a0']);
    const ref = row.cells[colIndex + 1];
    if (ref) {
      row.insertBefore(newCell, ref);
    } else {
      row.appendChild(newCell);
    }
  });
}

/**
 * Adds a column before the current cell's column.
 * @param {HTMLTableCellElement} cell
 */
export function addColBefore(cell) {
  const colIndex = cell.cellIndex;
  const table = cell.closest('table');
  if (!table) return;
  Array.from(table.rows).forEach((row) => {
    const newCell = createElement('td', {}, ['\u00a0']);
    const ref = row.cells[colIndex];
    if (ref) {
      row.insertBefore(newCell, ref);
    } else {
      row.appendChild(newCell);
    }
  });
}

/**
 * Deletes the row containing the given cell.
 * @param {HTMLTableCellElement} cell
 */
export function deleteRow(cell) {
  const row = cell.closest('tr');
  if (row) row.parentNode.removeChild(row);
}

/**
 * Deletes the column containing the given cell.
 * @param {HTMLTableCellElement} cell
 */
export function deleteCol(cell) {
  const colIndex = cell.cellIndex;
  const table = cell.closest('table');
  if (!table) return;
  Array.from(table.rows).forEach((row) => {
    if (row.cells[colIndex]) {
      row.deleteCell(colIndex);
    }
  });
}

/**
 * Deletes the table containing the given cell.
 * @param {HTMLTableCellElement} cell
 */
export function deleteTable(cell) {
  const table = cell.closest('table');
  if (table) table.parentNode.removeChild(table);
}
