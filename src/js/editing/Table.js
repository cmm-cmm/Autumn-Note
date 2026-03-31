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
 * @param {{ headerRow?: boolean }} [opts]
 * @returns {HTMLTableElement}
 */
export function createTable(cols, rows, opts = {}) {
  const { headerRow = false } = opts;
  const table = createElement('table', { class: 'an-table' });

  if (headerRow && rows > 0) {
    const thead = createElement('thead');
    const tr = createElement('tr');
    for (let c = 0; c < cols; c++) {
      const th = createElement('th', {}, ['\u00a0']);
      tr.appendChild(th);
    }
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  const bodyRows = headerRow ? Math.max(rows - 1, 1) : rows;
  const tbody = createElement('tbody');
  table.appendChild(tbody);

  for (let r = 0; r < bodyRows; r++) {
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
 * @param {{ headerRow?: boolean }} [opts]
 */
export function insertTable(cols, rows, opts = {}) {
  const table = createTable(cols, rows, opts);
  execCommand('insertHTML', table.outerHTML);
}
