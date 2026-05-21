import { describe, it, expect, vi, afterEach } from 'vitest';
import { TableTooltip } from '../../src/js/module/TableTooltip.js';
import { en } from '../../src/js/i18n/en.js';

vi.stubGlobal('requestAnimationFrame', (cb) => { cb(); return 0; });
vi.stubGlobal('cancelAnimationFrame', () => {});

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection().removeAllRanges();
  vi.useRealTimers();
  vi.clearAllMocks();
});

const TABLE_HTML = `
<table class="an-table">
  <tbody>
    <tr><td>A1</td><td>B1</td><td>C1</td></tr>
    <tr><td>A2</td><td>B2</td><td>C2</td></tr>
    <tr><td>A3</td><td>B3</td><td>C3</td></tr>
  </tbody>
</table>`;

function makeContext(html = TABLE_HTML) {
  const container = document.createElement('div');
  const editable  = document.createElement('div');
  editable.contentEditable = 'true';
  editable.innerHTML = html;
  container.appendChild(editable);
  document.body.appendChild(container);
  return {
    locale: en,
    layoutInfo: { container, editable },
    invoke: vi.fn(),
    triggerEvent: vi.fn(),
  };
}

function makeTooltip(html) {
  const ctx = makeContext(html);
  const tt = new TableTooltip(ctx);
  tt.initialize();
  return { ctx, tt };
}

function activateTable(tt, ctx) {
  const table = ctx.layoutInfo.editable.querySelector('table');
  table.getBoundingClientRect = () => ({ top: 100, bottom: 300, left: 50, right: 400, width: 350, height: 200 });
  tt._activeTable = table;
  tt._show();
  return table;
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

describe('TableTooltip lifecycle', () => {
  it('creates .an-table-tooltip in body', () => {
    makeTooltip();
    expect(document.querySelector('.an-table-tooltip')).not.toBeNull();
  });

  it('tooltip is initially hidden', () => {
    const { tt } = makeTooltip();
    expect(tt._el.style.display).toBe('none');
  });

  it('destroy removes tooltip from DOM', () => {
    const { tt } = makeTooltip();
    tt.destroy();
    expect(document.querySelector('.an-table-tooltip')).toBeNull();
  });

  it('destroy clears disposers', () => {
    const { tt } = makeTooltip();
    tt.destroy();
    expect(tt._disposers.length).toBe(0);
    expect(tt._el).toBeNull();
  });
});

// ── _show / _hide ─────────────────────────────────────────────────────────────

describe('TableTooltip._show', () => {
  it('sets display to flex when activeTable is set', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    expect(tt._el.style.display).toBe('flex');
  });

  it('does nothing without activeTable', () => {
    const { tt } = makeTooltip();
    tt._activeTable = null;
    tt._show();
    expect(tt._el.style.display).toBe('none');
  });
});

describe('TableTooltip._hide', () => {
  it('hides tooltip and clears activeTable', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._hide();
    expect(tt._el.style.display).toBe('none');
    expect(tt._activeTable).toBeNull();
  });

  it('clears activeCell on hide', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._activeCell = ctx.layoutInfo.editable.querySelector('td');
    tt._hide();
    expect(tt._activeCell).toBeNull();
  });

  it('resets selectMode on hide', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._selectMode = true;
    tt._hide();
    expect(tt._selectMode).toBe(false);
  });
});

// ── Timers ────────────────────────────────────────────────────────────────────

describe('TableTooltip._clearTimers', () => {
  it('clears showTimer and hideTimer', () => {
    vi.useFakeTimers();
    const { tt } = makeTooltip();
    tt._showTimer = setTimeout(() => {}, 500);
    tt._hideTimer = setTimeout(() => {}, 500);
    tt._clearTimers();
    expect(tt._showTimer).toBeNull();
    expect(tt._hideTimer).toBeNull();
  });
});

describe('TableTooltip._scheduleShow', () => {
  it('shows after SHOW_DELAY (120ms)', () => {
    vi.useFakeTimers();
    const { tt, ctx } = makeTooltip();
    const table = ctx.layoutInfo.editable.querySelector('table');
    table.getBoundingClientRect = () => ({ top: 100, bottom: 300, left: 50, right: 400, width: 350, height: 200 });
    tt._scheduleShow(table);
    expect(tt._el.style.display).toBe('none');
    vi.advanceTimersByTime(120);
    expect(tt._el.style.display).toBe('flex');
  });

  it('skips if same table already visible', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    vi.spyOn(tt, '_show');
    tt._scheduleShow(table);
    expect(tt._show).not.toHaveBeenCalled();
  });
});

describe('TableTooltip._scheduleHide', () => {
  it('hides after HIDE_DELAY (200ms)', () => {
    vi.useFakeTimers();
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._scheduleHide();
    vi.advanceTimersByTime(200);
    expect(tt._el.style.display).toBe('none');
  });
});

// ── _getCell ──────────────────────────────────────────────────────────────────

describe('TableTooltip._getCell', () => {
  it('returns first td when no selection and no activeCell', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const firstCell = tt._getCell();
    expect(firstCell).not.toBeNull();
    expect(firstCell.tagName).toBe('TD');
  });

  it('returns activeCell when set', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const cells = ctx.layoutInfo.editable.querySelectorAll('td');
    tt._activeCell = cells[4]; // B2
    expect(tt._getCell()).toBe(cells[4]);
  });

  it('returns cell from selection when cursor is inside table', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const cell = ctx.layoutInfo.editable.querySelectorAll('td')[2]; // C1
    const tn = cell.firstChild;
    const r = document.createRange();
    r.setStart(tn, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    expect(tt._getCell()).toBe(cell);
  });
});

// ── Select mode ───────────────────────────────────────────────────────────────

describe('TableTooltip._toggleSelectMode', () => {
  it('toggles selectMode flag', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    expect(tt._selectMode).toBe(false);
    tt._toggleSelectMode();
    expect(tt._selectMode).toBe(true);
    tt._toggleSelectMode();
    expect(tt._selectMode).toBe(false);
  });

  it('toggles active class on selectBtn', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._toggleSelectMode();
    expect(tt._selectBtn.classList.contains('an-link-tooltip-btn--active')).toBe(true);
    tt._toggleSelectMode();
    expect(tt._selectBtn.classList.contains('an-link-tooltip-btn--active')).toBe(false);
  });

  it('clears selection when turning off', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const cells = Array.from(ctx.layoutInfo.editable.querySelectorAll('td')).slice(0, 2);
    tt._setSelection(cells);
    tt._selectMode = true;
    tt._toggleSelectMode(); // turn off
    expect(tt._selectedCells.length).toBe(0);
  });
});

// ── Selection helpers ─────────────────────────────────────────────────────────

describe('TableTooltip._setSelection / _clearSelection', () => {
  it('_setSelection adds an-cell-selected class to cells', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const cells = Array.from(ctx.layoutInfo.editable.querySelectorAll('td')).slice(0, 3);
    tt._setSelection(cells);
    cells.forEach((c) => expect(c.classList.contains('an-cell-selected')).toBe(true));
    expect(tt._selectedCells).toEqual(cells);
  });

  it('_setSelection removes class from previously selected cells', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const all = Array.from(ctx.layoutInfo.editable.querySelectorAll('td'));
    tt._setSelection(all.slice(0, 3));
    tt._setSelection(all.slice(3, 6)); // new selection
    all.slice(0, 3).forEach((c) => expect(c.classList.contains('an-cell-selected')).toBe(false));
    all.slice(3, 6).forEach((c) => expect(c.classList.contains('an-cell-selected')).toBe(true));
  });

  it('_clearSelection removes all selected cells', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const cells = Array.from(ctx.layoutInfo.editable.querySelectorAll('td')).slice(0, 3);
    tt._setSelection(cells);
    tt._clearSelection();
    expect(tt._selectedCells.length).toBe(0);
    cells.forEach((c) => expect(c.classList.contains('an-cell-selected')).toBe(false));
  });
});

// ── _getRectCells ────────────────────────────────────────────────────────────

describe('TableTooltip._getRectCells', () => {
  it('returns single cell when start = end', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const cell = ctx.layoutInfo.editable.querySelector('td');
    expect(tt._getRectCells(cell, cell)).toEqual([cell]);
  });

  it('returns empty when startCell is null', () => {
    const { tt } = makeTooltip();
    expect(tt._getRectCells(null, null)).toEqual([]);
  });

  it('returns rectangular region between start and end cell', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const tds = ctx.layoutInfo.editable.querySelectorAll('td');
    const start = tds[0]; // A1
    const end   = tds[4]; // B2 (row2, col2)
    const rect  = tt._getRectCells(start, end);
    // Should cover A1, B1, A2, B2 (2x2 rectangle)
    expect(rect.length).toBe(4);
    expect(rect).toContain(tds[0]); // A1
    expect(rect).toContain(tds[1]); // B1
    expect(rect).toContain(tds[3]); // A2
    expect(rect).toContain(tds[4]); // B2
  });

  it('returns [startCell] when endCell is in different table', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const cell = ctx.layoutInfo.editable.querySelector('td');
    const other = document.createElement('td');
    expect(tt._getRectCells(cell, other)).toEqual([cell]);
  });
});

// ── Row operations ────────────────────────────────────────────────────────────

describe('TableTooltip._addRow', () => {
  it('adds a row above the current row', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const before = table.querySelectorAll('tr').length;
    // Put cursor in first row
    const firstCell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(firstCell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._addRow('above');
    expect(table.querySelectorAll('tr').length).toBe(before + 1);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('adds a row below the current row', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const before = table.querySelectorAll('tr').length;
    const lastRow = table.querySelectorAll('tr')[before - 1];
    const lastCell = lastRow.querySelector('td');
    const r = document.createRange();
    r.setStart(lastCell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._addRow('below');
    expect(table.querySelectorAll('tr').length).toBe(before + 1);
  });

  it('new row has same column count as reference row', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._addRow('below');
    const rows = table.querySelectorAll('tr');
    const newRow = rows[1]; // inserted after first row
    expect(newRow.cells.length).toBe(3); // same as other rows
  });
});

// ── Column operations ─────────────────────────────────────────────────────────

describe('TableTooltip._addColumn', () => {
  it('adds a column to the left', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const firstRow = table.querySelector('tr');
    const before = firstRow.cells.length;
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._addColumn('left');
    expect(firstRow.cells.length).toBe(before + 1);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('adds a column to the right', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const firstRow = table.querySelector('tr');
    const before = firstRow.cells.length;
    const cell = table.querySelectorAll('td')[2]; // last col (C1)
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._addColumn('right');
    expect(firstRow.cells.length).toBe(before + 1);
  });
});

// ── _deleteTable ──────────────────────────────────────────────────────────────

describe('TableTooltip._deleteTable', () => {
  it('removes the active table from DOM', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    expect(ctx.layoutInfo.editable.contains(table)).toBe(true);
    tt._deleteTable();
    expect(ctx.layoutInfo.editable.contains(table)).toBe(false);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });
});

// ── _deleteRow ────────────────────────────────────────────────────────────────

describe('TableTooltip._deleteRow', () => {
  it('deletes the row containing the cursor', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const before = table.querySelectorAll('tr').length;
    const cell = table.querySelectorAll('tr')[1].querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._deleteRow();
    expect(table.querySelectorAll('tr').length).toBe(before - 1);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('guards against deleting the only body row', () => {
    const { tt, ctx } = makeTooltip('<table><tbody><tr><td>Only</td></tr></tbody></table>');
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._deleteRow();
    expect(table.querySelectorAll('tr').length).toBe(1); // unchanged
  });
});

// ── _deleteColumn ─────────────────────────────────────────────────────────────

describe('TableTooltip._deleteColumn', () => {
  it('deletes the column containing the cursor', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const firstRow = table.querySelector('tr');
    const before = firstRow.cells.length;
    const cell = firstRow.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._deleteColumn();
    expect(firstRow.cells.length).toBe(before - 1);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('guards against deleting the only column', () => {
    const { tt, ctx } = makeTooltip('<table><tbody><tr><td>Only</td></tr></tbody></table>');
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._deleteColumn();
    expect(table.querySelector('tr').cells.length).toBe(1); // unchanged
  });
});

// ── _mergeCells ───────────────────────────────────────────────────────────────

describe('TableTooltip._mergeCells', () => {
  it('merges two panel-selected cells into one', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const tds = Array.from(table.querySelectorAll('td'));
    const A1 = tds[0], B1 = tds[1];
    tt._setSelection([A1, B1]);
    tt._mergeCells();
    // A1 should have colspan=2
    expect(A1.colSpan).toBe(2);
    // B1 should be removed
    expect(table.contains(B1)).toBe(false);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when fewer than 2 cells selected', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const before = table.querySelectorAll('td').length;
    tt._setSelection([table.querySelector('td')]);
    tt._mergeCells();
    expect(table.querySelectorAll('td').length).toBe(before);
  });
});

// ── _unmergeCells ─────────────────────────────────────────────────────────────

describe('TableTooltip._unmergeCells', () => {
  it('unmerges a colspan=2 cell into 2 cells', () => {
    const tableHtml = '<table><tbody><tr><td colspan="2">Merged</td><td>C1</td></tr><tr><td>A2</td><td>B2</td><td>C2</td></tr></tbody></table>';
    const { tt, ctx } = makeTooltip(tableHtml);
    const table = activateTable(tt, ctx);
    const merged = table.querySelector('td[colspan="2"]');
    tt._setSelection([merged]);
    const before = table.querySelector('tr').cells.length;
    tt._unmergeCells();
    expect(table.querySelector('tr').cells.length).toBe(before + 1);
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('does nothing when no merged cells selected', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    tt._setSelection([cell]);
    const before = table.querySelectorAll('td').length;
    tt._unmergeCells();
    expect(table.querySelectorAll('td').length).toBe(before); // unchanged
  });
});

// ── _getSelectedCells ─────────────────────────────────────────────────────────

describe('TableTooltip._getSelectedCells', () => {
  it('returns _selectedCells when populated', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const cells = Array.from(ctx.layoutInfo.editable.querySelectorAll('td')).slice(0, 2);
    tt._setSelection(cells);
    expect(tt._getSelectedCells()).toEqual(cells);
  });

  it('falls back to [_getCell()] when no selected cells', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    const result = tt._getSelectedCells();
    expect(result.length).toBe(1);
    expect(result[0].tagName).toBe('TD');
  });
});

// ── _openSizePopover / _hideSizePopover ───────────────────────────────────────

describe('TableTooltip sizePopover', () => {
  it('_buildSizePopover creates .an-size-popover element', () => {
    makeTooltip();
    expect(document.querySelector('.an-size-popover')).not.toBeNull();
  });

  it('_openSizePopover("col") shows popover and sets title', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._openSizePopover('col');
    expect(tt._sizePopover.style.display).toBe('block');
    expect(tt._sizeTitleEl.textContent).toContain('px');
  });

  it('_openSizePopover("row") shows popover', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._openSizePopover('row');
    expect(tt._sizePopover.style.display).toBe('block');
  });

  it('_openSizePopover("border") shows popover', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._openSizePopover('border');
    expect(tt._sizePopover.style.display).toBe('block');
  });

  it('_hideSizePopover hides the popover', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._openSizePopover('border');
    tt._hideSizePopover();
    expect(tt._sizePopover.style.display).toBe('none');
  });

  it('clicking apply button in popover calls _sizeApply', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._openSizePopover('border');
    const sizeApply = vi.fn();
    tt._sizeApply = sizeApply;
    tt._sizeInputEl.value = '2';
    const applyBtn = tt._sizePopover.querySelector('.an-btn-primary');
    applyBtn.click();
    expect(sizeApply).toHaveBeenCalledWith(2);
    expect(tt._sizePopover.style.display).toBe('none');
  });

  it('clicking cancel button hides popover', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._openSizePopover('border');
    const cancelBtn = tt._sizePopover.querySelector('.an-btn:not(.an-btn-primary)');
    cancelBtn.click();
    expect(tt._sizePopover.style.display).toBe('none');
  });

  it('_openSizePopover does nothing when no cell', () => {
    const { tt } = makeTooltip();
    // No activeTable — _getCell returns null
    expect(() => tt._openSizePopover('col')).not.toThrow();
    expect(tt._sizePopover.style.display).toBe('none');
  });

  it('real border _sizeApply sets borderWidth and borderStyle on all cells', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._openSizePopover('border');
    tt._sizeInputEl.value = '2';
    // Click apply — uses real _sizeApply (not mocked)
    const applyBtn = tt._sizePopover.querySelector('.an-btn-primary');
    applyBtn.click();
    const firstCell = table.querySelector('td');
    expect(firstCell.style.borderWidth).toBe('2px');
    expect(firstCell.style.borderStyle).toBe('solid');
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('real col _sizeApply sets width on cells in column', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._openSizePopover('col');
    tt._sizeInputEl.value = '120';
    const applyBtn = tt._sizePopover.querySelector('.an-btn-primary');
    applyBtn.click();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('real row _sizeApply sets height on cells in row', () => {
    const { tt, ctx } = makeTooltip();
    const table = activateTable(tt, ctx);
    const cell = table.querySelector('td');
    const r = document.createRange();
    r.setStart(cell.firstChild, 0);
    r.collapse(true);
    window.getSelection().addRange(r);
    tt._openSizePopover('row');
    tt._sizeInputEl.value = '50';
    const applyBtn = tt._sizePopover.querySelector('.an-btn-primary');
    applyBtn.click();
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });

  it('Enter key in size input triggers apply', () => {
    const { tt, ctx } = makeTooltip();
    activateTable(tt, ctx);
    tt._openSizePopover('border');
    tt._sizeInputEl.value = '3';
    tt._sizeInputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(ctx.invoke).toHaveBeenCalledWith('editor.afterCommand');
  });
});
