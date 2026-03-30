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
