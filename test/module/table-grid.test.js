import { describe, it, expect } from 'vitest';
import {
  getVisualColIndex,
  getCellAtVisualCol,
  getCellAfterVisualCol,
  buildGridMap,
} from '../../src/js/module/table-grid.js';

/**
 * @param {string} html - the innerHTML of a <table>
 * @returns {HTMLTableElement}
 */
function makeTable(html) {
  const table = document.createElement('table');
  table.innerHTML = html;
  document.body.appendChild(table);
  return /** @type {HTMLTableElement} */ (table);
}

const PLAIN_3x2 = `
  <tr><td id="a1">a1</td><td id="b1">b1</td><td id="c1">c1</td></tr>
  <tr><td id="a2">a2</td><td id="b2">b2</td><td id="c2">c2</td></tr>`;

// A merged first cell spanning two columns:
//   row1: [ span2      ][ c1 ]
//   row2: [ a2 ][ b2   ][ c2 ]
const COLSPAN = `
  <tr><td id="span2" colspan="2">span</td><td id="c1">c1</td></tr>
  <tr><td id="a2">a2</td><td id="b2">b2</td><td id="c2">c2</td></tr>`;

describe('getVisualColIndex', () => {
  it('returns the DOM index when no cell is merged', () => {
    const t = makeTable(PLAIN_3x2);
    expect(getVisualColIndex(t.querySelector('#a1'))).toBe(0);
    expect(getVisualColIndex(t.querySelector('#b1'))).toBe(1);
    expect(getVisualColIndex(t.querySelector('#c1'))).toBe(2);
  });

  it('skips over the columns a preceding colspan occupies', () => {
    const t = makeTable(COLSPAN);
    // #c1 is the second DOM cell but visually starts at column 2
    expect(getVisualColIndex(t.querySelector('#c1'))).toBe(2);
  });

  it('returns -1 for a cell that is not inside a row', () => {
    const orphan = document.createElement('td');
    expect(getVisualColIndex(orphan)).toBe(-1);
  });

  it('returns -1 when the resolved row does not contain the cell', () => {
    // Well-formed markup cannot reach the trailing `return -1` — a cell is
    // always among the cells of the row it closest()-resolves to. Faking that
    // mismatch is the only way to pin the guard, which matters because callers
    // branch on the -1 sentinel.
    const t = makeTable(PLAIN_3x2);
    const foreign = document.createElement('td');
    Object.defineProperty(foreign, 'closest', { value: () => t.rows[0] });
    expect(getVisualColIndex(foreign)).toBe(-1);
  });
});

describe('getCellAtVisualCol', () => {
  it('finds the cell starting at the requested visual column', () => {
    const t = makeTable(PLAIN_3x2);
    expect(getCellAtVisualCol(t.rows[0], 1)?.id).toBe('b1');
  });

  it('returns null when the column is covered by a merged cell rather than starting one', () => {
    const t = makeTable(COLSPAN);
    // column 1 is *inside* #span2, no cell starts there
    expect(getCellAtVisualCol(t.rows[0], 1)).toBeNull();
  });

  it('returns null when the requested column is past the end of the row', () => {
    const t = makeTable(PLAIN_3x2);
    expect(getCellAtVisualCol(t.rows[0], 9)).toBeNull();
  });
});

describe('getCellAfterVisualCol', () => {
  it('returns the cell following the one occupying the column', () => {
    const t = makeTable(PLAIN_3x2);
    expect(getCellAfterVisualCol(t.rows[0], 0)?.id).toBe('b1');
  });

  it('returns null when the occupying cell is last in the row (append instead)', () => {
    const t = makeTable(PLAIN_3x2);
    expect(getCellAfterVisualCol(t.rows[0], 2)).toBeNull();
  });

  it('steps past a merged cell to its following sibling', () => {
    const t = makeTable(COLSPAN);
    expect(getCellAfterVisualCol(t.rows[0], 0)?.id).toBe('c1');
    expect(getCellAfterVisualCol(t.rows[0], 1)?.id).toBe('c1');
  });

  it('returns null when the requested column is past the end of the row', () => {
    const t = makeTable(PLAIN_3x2);
    expect(getCellAfterVisualCol(t.rows[0], 9)).toBeNull();
  });
});

describe('buildGridMap', () => {
  it('maps every position of a plain grid to its own cell', () => {
    const t = makeTable(PLAIN_3x2);
    const { gridMap, cellPos } = buildGridMap(t);
    expect(gridMap[0][0].id).toBe('a1');
    expect(gridMap[1][2].id).toBe('c2');
    expect(cellPos.get(t.querySelector('#b2'))).toEqual({ r: 1, c: 1, rs: 1, cs: 1 });
  });

  it('repeats a colspan cell across every column it covers', () => {
    const t = makeTable(COLSPAN);
    const { gridMap, cellPos } = buildGridMap(t);
    expect(gridMap[0][0].id).toBe('span2');
    expect(gridMap[0][1].id).toBe('span2');
    expect(gridMap[0][2].id).toBe('c1');
    expect(cellPos.get(t.querySelector('#span2'))).toEqual({ r: 0, c: 0, rs: 1, cs: 2 });
  });

  it('pushes later rows past positions a rowspan already claimed', () => {
    //   row1: [ tall ][ b1 ]
    //   row2: [ tall ][ b2 ]   <- b2 is the first DOM cell of row 2
    const t = makeTable(`
      <tr><td id="tall" rowspan="2">tall</td><td id="b1">b1</td></tr>
      <tr><td id="b2">b2</td></tr>`);
    const { gridMap, cellPos } = buildGridMap(t);
    expect(gridMap[1][0].id).toBe('tall');
    expect(gridMap[1][1].id).toBe('b2');
    expect(cellPos.get(t.querySelector('#tall'))).toEqual({ r: 0, c: 0, rs: 2, cs: 1 });
  });

  it('handles a cell spanning both directions', () => {
    const t = makeTable(`
      <tr><td id="big" rowspan="2" colspan="2">big</td><td id="c1">c1</td></tr>
      <tr><td id="c2">c2</td></tr>`);
    const { gridMap } = buildGridMap(t);
    expect(gridMap[0][0].id).toBe('big');
    expect(gridMap[0][1].id).toBe('big');
    expect(gridMap[1][0].id).toBe('big');
    expect(gridMap[1][1].id).toBe('big');
    expect(gridMap[1][2].id).toBe('c2');
  });

  it('returns empty maps for a table with no rows', () => {
    const t = makeTable('');
    expect(buildGridMap(t).gridMap).toEqual({});
  });
});
