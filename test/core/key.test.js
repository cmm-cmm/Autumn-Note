/**
 * test/core/key.test.js
 * Unit tests for src/js/core/key.js
 */
import { describe, it, expect } from 'vitest';
import { key, isKey, isModifier } from '../../src/js/core/key.js';

// ---------------------------------------------------------------------------
// key constants object
// ---------------------------------------------------------------------------

describe('key constants', () => {
  it('has BACKSPACE = "Backspace"', () => expect(key.BACKSPACE).toBe('Backspace'));
  it('has TAB = "Tab"', () => expect(key.TAB).toBe('Tab'));
  it('has ENTER = "Enter"', () => expect(key.ENTER).toBe('Enter'));
  it('has ESCAPE = "Escape"', () => expect(key.ESCAPE).toBe('Escape'));
  it('has SPACE = " "', () => expect(key.SPACE).toBe(' '));
  it('has LEFT = "ArrowLeft"', () => expect(key.LEFT).toBe('ArrowLeft'));
  it('has RIGHT = "ArrowRight"', () => expect(key.RIGHT).toBe('ArrowRight'));
  it('has UP = "ArrowUp"', () => expect(key.UP).toBe('ArrowUp'));
  it('has DOWN = "ArrowDown"', () => expect(key.DOWN).toBe('ArrowDown'));
  it('has DELETE = "Delete"', () => expect(key.DELETE).toBe('Delete'));
  it('has HOME = "Home"', () => expect(key.HOME).toBe('Home'));
  it('has END = "End"', () => expect(key.END).toBe('End'));
  it('has PAGE_UP = "PageUp"', () => expect(key.PAGE_UP).toBe('PageUp'));
  it('has PAGE_DOWN = "PageDown"', () => expect(key.PAGE_DOWN).toBe('PageDown'));
  it('has B = "b"', () => expect(key.B).toBe('b'));
  it('has I = "i"', () => expect(key.I).toBe('i'));
  it('has Z = "z"', () => expect(key.Z).toBe('z'));
  it('has V = "v"', () => expect(key.V).toBe('v'));
  it('has SLASH = "/"', () => expect(key.SLASH).toBe('/'));
  it('has PERIOD = "."', () => expect(key.PERIOD).toBe('.'));
  it('all values are non-empty strings', () => {
    for (const [name, val] of Object.entries(key)) {
      expect(typeof val, `key.${name} should be a string`).toBe('string');
      expect(val.length, `key.${name} should be non-empty`).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// isKey
// ---------------------------------------------------------------------------

describe('isKey', () => {
  it('returns true when event.key exactly matches the keyName', () => {
    const event = { key: 'Enter' };
    expect(isKey(event, key.ENTER)).toBe(true);
  });

  it('returns true when event.key matches the uppercased version', () => {
    // isKey does event.key === keyName || event.key === keyName.toUpperCase()
    // key.B = 'b', so 'B' should also match
    const event = { key: 'B' };
    expect(isKey(event, key.B)).toBe(true);
  });

  it('returns false when the key does not match', () => {
    const event = { key: 'a' };
    expect(isKey(event, key.B)).toBe(false);
  });

  it('returns true for BACKSPACE', () => {
    expect(isKey({ key: 'Backspace' }, key.BACKSPACE)).toBe(true);
  });

  it('returns true for TAB', () => {
    expect(isKey({ key: 'Tab' }, key.TAB)).toBe(true);
  });

  it('returns true for ArrowLeft', () => {
    expect(isKey({ key: 'ArrowLeft' }, key.LEFT)).toBe(true);
  });

  it('returns false for a completely different key', () => {
    expect(isKey({ key: 'Escape' }, key.ENTER)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isModifier
// ---------------------------------------------------------------------------

describe('isModifier', () => {
  it('returns true when ctrlKey is pressed with the matching key', () => {
    const event = { key: 'b', ctrlKey: true, metaKey: false };
    expect(isModifier(event, key.B)).toBe(true);
  });

  it('returns true when metaKey (Cmd) is pressed with the matching key', () => {
    const event = { key: 'b', ctrlKey: false, metaKey: true };
    expect(isModifier(event, key.B)).toBe(true);
  });

  it('returns false when neither ctrlKey nor metaKey is pressed', () => {
    const event = { key: 'b', ctrlKey: false, metaKey: false };
    expect(isModifier(event, key.B)).toBe(false);
  });

  it('returns false when ctrlKey is pressed but the key does not match', () => {
    const event = { key: 'x', ctrlKey: true, metaKey: false };
    expect(isModifier(event, key.B)).toBe(false);
  });

  it('works for Ctrl+Z (undo)', () => {
    expect(isModifier({ key: 'z', ctrlKey: true, metaKey: false }, key.Z)).toBe(true);
  });

  it('works for Ctrl+S (save)', () => {
    expect(isModifier({ key: 's', ctrlKey: true, metaKey: false }, key.S)).toBe(true);
  });

  it('handles uppercase key event value (Mac Cmd+B fires key="B")', () => {
    const event = { key: 'B', ctrlKey: false, metaKey: true };
    expect(isModifier(event, key.B)).toBe(true);
  });
});
