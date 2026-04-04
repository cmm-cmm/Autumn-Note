import { describe, it, expect } from 'vitest';
import {
  tableBtn,
  foreColorBtn,
  backColorBtn,
  defaultToolbar,
  inlineCodeBtn,
  checklistBtn,
  printBtn,
} from '../../src/js/module/Buttons.js';

describe('Buttons contract', () => {
  it('exposes expected specialized button types', () => {
    expect(tableBtn.type).toBe('grid');
    expect(foreColorBtn.type).toBe('colorpicker');
    expect(backColorBtn.type).toBe('colorpicker');
  });

  it('default toolbar contains newly documented buttons', () => {
    const flat = defaultToolbar.flat();
    expect(flat.some((b) => b.name === inlineCodeBtn.name)).toBe(true);
    expect(flat.some((b) => b.name === checklistBtn.name)).toBe(true);
    expect(flat.some((b) => b.name === printBtn.name)).toBe(true);
  });
});
