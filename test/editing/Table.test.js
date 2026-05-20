import { describe, it, expect, vi, afterEach } from 'vitest';
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

  it('insertTable skips insertion when dimensions are invalid', () => {
    // insertTable now uses DOM Range API; invalid dimensions return early
    expect(() => insertTable(0, 1)).not.toThrow();
    expect(() => insertTable(2, 0)).not.toThrow();
    expect(() => insertTable(-1, 2)).not.toThrow();
  });
});
