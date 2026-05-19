/**
 * Table.js - Table creation and manipulation utilities
 * Inspired by Summernote's table handling
 */

import { createElement } from '../core/dom.js';

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
      const th = createElement('th', {}, [document.createElement('br')]);
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
      const td = createElement('td', {}, [document.createElement('br')]);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  return table;
}

/**
 * Inserts a table at the current cursor position using DOM Range API.
 * @param {number} cols
 * @param {number} rows
 * @param {{ headerRow?: boolean }} [opts]
 */
export function insertTable(cols, rows, opts = {}) {
  if (cols <= 0 || rows <= 0) return;
  const table = createTable(cols, rows, opts);

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();

  // Walk up to find the nearest block-level ancestor to insert after
  const BLOCK = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'PRE']);
  let anchor = range.startContainer;
  if (anchor.nodeType === 3) anchor = anchor.parentElement;
  while (anchor && !BLOCK.has(anchor.tagName?.toUpperCase()) && anchor.parentElement) {
    anchor = anchor.parentElement;
  }

  if (anchor && BLOCK.has(anchor.tagName?.toUpperCase()) && anchor.parentNode) {
    anchor.after(table);
    // Ensure there's a paragraph after the table for cursor landing
    if (!table.nextElementSibling) {
      const p = document.createElement('p');
      p.appendChild(document.createElement('br'));
      table.after(p);
    }
    // Remove the anchor block if it was empty (common case: cursor in blank paragraph)
    if (!anchor.textContent.trim() && !anchor.querySelector('img, video, table')) {
      anchor.remove();
    }
  } else {
    range.insertNode(table);
  }

  // Place cursor in the first cell
  const firstCell = table.querySelector('td, th');
  if (firstCell) {
    const nr = document.createRange();
    nr.setStart(firstCell, 0);
    nr.collapse(true);
    sel.removeAllRanges();
    sel.addRange(nr);
  }
}
