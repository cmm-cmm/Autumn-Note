import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  DEFAULT_KEYMAP,
  parseCombo,
  matchesCombo,
  resolveKeyMap,
  comboId,
  formatCombo,
} from '../../src/js/core/keymap.js';

afterEach(() => vi.restoreAllMocks());

/** @param {Partial<KeyboardEvent>} init */
const keyEvent = (init) => ({
  key: '', code: '', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...init,
});

describe('parseCombo', () => {
  it('parses modifiers case-insensitively', () => {
    expect(parseCombo('Mod+Shift+Z')).toEqual({ mod: true, ctrl: false, meta: false, alt: false, shift: true, key: 'z' });
    expect(parseCombo('ctrl+alt+1')).toMatchObject({ ctrl: true, alt: true, key: '1' });
    expect(parseCombo('Cmd+K')).toMatchObject({ meta: true, key: 'k' });
  });

  it('keeps a literal + key', () => {
    expect(parseCombo('Mod++')).toMatchObject({ mod: true, key: '+' });
  });

  it('rejects empty or malformed combos', () => {
    expect(parseCombo('')).toBeNull();
    expect(parseCombo('Mod+Banana+K')).toBeNull();
    expect(parseCombo(/** @type {any} */ (42))).toBeNull();
  });
});

describe('matchesCombo', () => {
  const modB = parseCombo('Mod+B');

  it('matches Mod with either Ctrl or Cmd', () => {
    expect(matchesCombo(keyEvent({ key: 'b', ctrlKey: true }), modB)).toBe(true);
    expect(matchesCombo(keyEvent({ key: 'B', metaKey: true }), modB)).toBe(true);
  });

  it('requires Shift and Alt to match exactly', () => {
    expect(matchesCombo(keyEvent({ key: 'B', ctrlKey: true, shiftKey: true }), modB)).toBe(false);
    // AltGr on Windows reports Ctrl+Alt — typing a character, not a shortcut
    expect(matchesCombo(keyEvent({ key: 'z', ctrlKey: true, altKey: true }), parseCombo('Mod+Z'))).toBe(false);
  });

  it('falls back to the physical key when Shift changes event.key', () => {
    const combo = parseCombo('Ctrl+Shift+/');
    expect(matchesCombo(keyEvent({ key: '?', code: 'Slash', ctrlKey: true, shiftKey: true }), combo)).toBe(true);
  });

  it('treats explicit Ctrl as Ctrl only', () => {
    const combo = parseCombo('Ctrl+Shift+/');
    expect(matchesCombo(keyEvent({ key: '/', code: 'Slash', metaKey: true, shiftKey: true }), combo)).toBe(false);
  });
});

describe('resolveKeyMap', () => {
  it('returns the defaults when there is no user map', () => {
    expect(resolveKeyMap(null)).toHaveLength(Object.keys(DEFAULT_KEYMAP).length);
  });

  it('disables with false, overrides regardless of case, and adds new combos', () => {
    const run = () => {};
    const bindings = resolveKeyMap({
      'mod+f': false,
      'Mod+B': 'strikethrough',
      'Mod+Alt+1': { run, description: 'Heading 1' },
    });
    const ids = new Map(bindings.map((b) => [comboId(b.parsed), b]));
    expect(ids.has('mod+f')).toBe(false);
    expect(ids.get('mod+b').command).toBe('strikethrough');
    expect(ids.get('mod+alt+1')).toMatchObject({ command: run, description: 'Heading 1' });
  });

  it('warns about and skips invalid entries', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bindings = resolveKeyMap({ 'Mod+Nope+X': 'bold', 'Mod+J': 42 });
    expect(bindings).toHaveLength(Object.keys(DEFAULT_KEYMAP).length);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});

describe('formatCombo', () => {
  it('renders a readable label', () => {
    expect(formatCombo(parseCombo('Mod+Shift+z'))).toBe('Ctrl + Shift + Z');
    expect(formatCombo(parseCombo('Cmd+Alt+enter'))).toBe('Cmd + Alt + Enter');
  });
});
