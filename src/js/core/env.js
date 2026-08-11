/**
 * env.js - Environment / browser detection
 * Inspired by Summernote's env.js
 *
 * Every field is a lazy getter rather than a value computed at module load.
 * This module is re-exported from the package entry point, so reading
 * `navigator` eagerly meant that merely `import`ing autumnnote threw
 * `ReferenceError: navigator is not defined` under SSR on any runtime without
 * a global `navigator` — including Node 20, which package.json still supports.
 * Nothing inside the library reads these fields, so the crash happened before
 * an editor was ever created.
 */

/** @returns {string} the current user agent, or '' when there is no navigator (SSR). */
function ua() {
  return globalThis.navigator?.userAgent ?? '';
}

export const env = {
  /** True if browser is Chrome (excludes Edge, whose UA also contains "Chrome/") */
  get isChrome() { return /Chrome\//.test(ua()) && !/Edg\//.test(ua()); },
  /** True if browser is Firefox */
  get isFF() { return /Firefox\//.test(ua()); },
  /** True if browser is Safari (not Chrome) */
  get isSafari() { return /^((?!chrome|android).)*safari/i.test(ua()); },
  /** True if browser is Edge (Chromium) */
  get isEdge() { return /Edg\//.test(ua()); },
  /** True if running on macOS */
  get isMac() { return /Macintosh/.test(ua()); },
  /** True if running on mobile */
  get isMobile() { return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua()); },
  /** True if touch is supported */
  get isTouch() {
    return 'ontouchstart' in globalThis || (globalThis.navigator?.maxTouchPoints ?? 0) > 0;
  },
  /** Modifier key name depending on platform */
  get modifierKey() { return /Macintosh/.test(ua()) ? 'metaKey' : 'ctrlKey'; },
};
