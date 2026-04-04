import { describe, it, expect, vi, afterEach } from 'vitest';
import * as Style from '../../src/js/editing/Style.js';
import { createTable, insertTable } from '../../src/js/editing/Table.js';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Table helpers', () => {
  it('createTable builds tbody-only table by default', () => {
    const table = createTable(3, 2);
    expect(table.classList.contains('an-table')).toBe(true);
    expect(table.querySelectorAll('tbody tr').length).toBe(2);
    expect(table.querySelectorAll('tbody td').length).toBe(6);
    expect(table.querySelector('thead')).toBeNull();
  });

  it('createTable builds header row when headerRow=true', () => {
    const table = createTable(2, 2, { headerRow: true });
    expect(table.querySelectorAll('thead th').length).toBe(2);
    expect(table.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('insertTable delegates HTML insertion through execCommand', () => {
    const spy = vi.spyOn(Style, 'execCommand').mockReturnValue(true);
    insertTable(2, 1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe('insertHTML');
    expect(String(spy.mock.calls[0][1])).toContain('<table');
  });
});
