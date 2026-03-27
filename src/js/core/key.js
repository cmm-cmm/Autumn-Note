/**
 * key.js - Keyboard key code constants
 * Inspired by Summernote's key.js
 */

export const key = {
  BACKSPACE: 'Backspace',
  TAB: 'Tab',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  END: 'End',
  HOME: 'Home',
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  DELETE: 'Delete',
  // Numbers
  NUM0: '0',
  NUM1: '1',
  NUM2: '2',
  NUM3: '3',
  NUM4: '4',
  NUM5: '5',
  NUM6: '6',
  NUM7: '7',
  NUM8: '8',
  // Letters
  B: 'b',
  E: 'e',
  I: 'i',
  J: 'j',
  K: 'k',
  L: 'l',
  R: 'r',
  S: 's',
  U: 'u',
  V: 'v',
  Y: 'y',
  Z: 'z',
  SLASH: '/',
  PERIOD: '.',
};

/**
 * Returns true if the event matches the given key
 * @param {KeyboardEvent} event
 * @param {string} keyName - one of key.*
 * @returns {boolean}
 */
export function isKey(event, keyName) {
  return event.key === keyName || event.key === keyName.toUpperCase();
}

/**
 * Returns true if the event is a modifier key press (Ctrl/Cmd + key)
 * @param {KeyboardEvent} event
 * @param {string} keyName
 * @returns {boolean}
 */
export function isModifier(event, keyName) {
  return (event.ctrlKey || event.metaKey) && isKey(event, keyName);
}
