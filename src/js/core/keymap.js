/**
 * keymap.js - Keyboard shortcut table.
 *
 * A shortcut is a combo string such as `Mod+B`, `Mod+Shift+Z` or `Ctrl+Alt+1`.
 * `Mod` is Ctrl or Cmd (either counts); `Ctrl`, `Meta`, `Alt` and `Shift`
 * must match exactly, so AltGr (Ctrl+Alt on Windows) typing a character is
 * not mistaken for a Ctrl shortcut.
 *
 * The editor's `keyMap` option is merged over DEFAULT_KEYMAP. A value can be:
 *   - false / null      — disable the default for that combo
 *   - a command name    — see Editor's built-in commands, or any toolbar button name
 *   - a function        — (context, event) => void | false; return false to let
 *                         the key through (no preventDefault)
 *   - { run, description } — a function plus the label the shortcuts dialog shows
 */

/** Built-in shortcuts. Values are command names resolved by the Editor module. */
export const DEFAULT_KEYMAP = Object.freeze({
  'Mod+Z': 'undo',
  'Mod+Shift+Z': 'redo',
  'Mod+Y': 'redo',
  'Mod+B': 'bold',
  'Mod+I': 'italic',
  'Mod+U': 'underline',
  'Mod+K': 'link',
  'Mod+Shift+V': 'pastePlainText',
  'Mod+F': 'find',
  'Mod+H': 'findReplace',
  'Mod+`': 'inlineCode',
  'Ctrl+Shift+/': 'shortcuts',
});

/** KeyboardEvent.code → the character it types without modifiers (US layout). */
const CODE_KEYS = {
  Slash: '/', Backslash: '\\', Backquote: '`', Minus: '-', Equal: '=',
  BracketLeft: '[', BracketRight: ']', Semicolon: ';', Quote: "'",
  Comma: ',', Period: '.', Space: ' ',
};

/**
 * @typedef {object} ParsedCombo
 * @property {boolean} mod
 * @property {boolean} ctrl
 * @property {boolean} meta
 * @property {boolean} alt
 * @property {boolean} shift
 * @property {string}  key   lower-cased key, e.g. 'b', '/', 'enter'
 */

/**
 * Parses a combo string. Returns null for an empty or malformed combo.
 * @param {string} combo
 * @returns {ParsedCombo|null}
 */
export function parseCombo(combo) {
  if (typeof combo !== 'string') return null;
  // Split on '+' but keep a literal '+' key ("Mod++")
  const parts = combo.trim().split(/\+(?!$)/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  const parsed = { mod: false, ctrl: false, meta: false, alt: false, shift: false, key: '' };
  for (const [i, part] of parts.entries()) {
    const lower = part.toLowerCase();
    const isLast = i === parts.length - 1;
    if (!isLast && (lower === 'mod' || lower === 'cmdorctrl')) parsed.mod = true;
    else if (!isLast && (lower === 'ctrl' || lower === 'control')) parsed.ctrl = true;
    else if (!isLast && (lower === 'meta' || lower === 'cmd' || lower === 'command')) parsed.meta = true;
    else if (!isLast && (lower === 'alt' || lower === 'option')) parsed.alt = true;
    else if (!isLast && lower === 'shift') parsed.shift = true;
    else if (isLast) parsed.key = lower;
    else return null;
  }
  return parsed.key ? parsed : null;
}

/**
 * Whether a keyboard event matches a parsed combo.
 * @param {KeyboardEvent} event
 * @param {ParsedCombo} combo
 * @returns {boolean}
 */
export function matchesCombo(event, combo) {
  if (combo.mod) {
    if (!event.ctrlKey && !event.metaKey) return false;
  } else if (event.ctrlKey !== combo.ctrl || event.metaKey !== combo.meta) {
    return false;
  }
  if (event.altKey !== combo.alt || event.shiftKey !== combo.shift) return false;

  const key = (event.key || '').toLowerCase();
  if (key === combo.key) return true;
  // Shift changes event.key ('/' → '?'); fall back to the physical key.
  const code = event.code || '';
  let fromCode = CODE_KEYS[code];
  if (!fromCode && /^Key[A-Z]$/.test(code)) fromCode = code.slice(3).toLowerCase();
  else if (!fromCode && /^Digit\d$/.test(code)) fromCode = code.slice(5);
  return fromCode === combo.key;
}

/**
 * @typedef {object} KeyBinding
 * @property {string} combo           the combo as written
 * @property {ParsedCombo} parsed
 * @property {string|Function} command
 * @property {string} [description]
 */

/**
 * Merges a user keyMap over the defaults into a list of active bindings.
 * Combos are compared after parsing, so 'mod+b' overrides 'Mod+B'.
 * @param {Record<string, *>|null|undefined} userMap
 * @returns {KeyBinding[]}
 */
export function resolveKeyMap(userMap) {
  /** @type {Map<string, KeyBinding|null>} */
  const byCombo = new Map();
  const add = (combo, value) => {
    const parsed = parseCombo(combo);
    if (!parsed) {
      console.warn(`[AutumnNote] keyMap: cannot parse shortcut "${combo}".`);
      return;
    }
    const id = comboId(parsed);
    if (value === false || value === null) { byCombo.set(id, null); return; }
    let command = value;
    let description;
    if (value && typeof value === 'object' && typeof value.run === 'function') {
      command = value.run;
      description = typeof value.description === 'string' ? value.description : undefined;
    }
    if (typeof command !== 'string' && typeof command !== 'function') {
      console.warn(`[AutumnNote] keyMap: "${combo}" must map to a command name, a function or false.`);
      return;
    }
    byCombo.set(id, { combo, parsed, command, description });
  };
  for (const [combo, command] of Object.entries(DEFAULT_KEYMAP)) add(combo, command);
  if (userMap && typeof userMap === 'object') {
    for (const [combo, value] of Object.entries(userMap)) add(combo, value);
  }
  return [...byCombo.values()].filter(Boolean);
}

/**
 * A canonical id for a parsed combo, used to detect overrides.
 * @param {ParsedCombo} p
 * @returns {string}
 */
export function comboId(p) {
  return [p.mod && 'mod', p.ctrl && 'ctrl', p.meta && 'meta', p.alt && 'alt', p.shift && 'shift', p.key]
    .filter(Boolean).join('+');
}

/**
 * Human-readable combo for the shortcuts dialog: `Mod+Shift+Z` → `Ctrl + Shift + Z`.
 * @param {ParsedCombo} p
 * @returns {string}
 */
export function formatCombo(p) {
  const parts = [];
  if (p.mod || p.ctrl) parts.push('Ctrl');
  if (p.meta) parts.push('Cmd');
  if (p.alt) parts.push('Alt');
  if (p.shift) parts.push('Shift');
  parts.push(p.key.length === 1 ? p.key.toUpperCase() : p.key.charAt(0).toUpperCase() + p.key.slice(1));
  return parts.join(' + ');
}
