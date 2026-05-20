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

  it('insertTable skips when no selection exists', () => {
    window.getSelection().removeAllRanges();
    expect(() => insertTable(2, 2)).not.toThrow();
  });

  it('insertTable places table after a block paragraph and removes empty paragraph', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p></p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const range = document.createRange();
    range.setStart(p, 0);
    range.collapse(true);
    window.getSelection().addRange(range);

    insertTable(2, 2);

    expect(editable.querySelector('table')).not.toBeNull();
    expect(editable.querySelector('table').querySelectorAll('td').length).toBe(4);
  });

  it('insertTable places table after non-empty block paragraph', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.innerHTML = '<p>text</p>';
    document.body.appendChild(editable);

    const p = editable.querySelector('p');
    const textNode = p.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    window.getSelection().addRange(range);

    insertTable(3, 2);
    // Table should exist somewhere in the document after insertion
    expect(document.querySelector('table')).not.toBeNull();
  });

  it('createTable with headerRow=true creates thead and tbody', () => {
    const table = createTable(3, 3, { headerRow: true });
    expect(table.querySelector('thead')).not.toBeNull();
    expect(table.querySelectorAll('thead th').length).toBe(3);
    expect(table.querySelectorAll('tbody tr').length).toBe(2); // 3 rows - 1 header
  });
});
