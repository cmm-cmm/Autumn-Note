/**
 * env.js - Environment / browser detection
 * Inspired by Summernote's env.js
 */

const userAgent = navigator.userAgent;

export const env = {
  /** True if browser is Chrome */
  isChrome: /Chrome\//.test(userAgent),
  /** True if browser is Firefox */
  isFF: /Firefox\//.test(userAgent),
  /** True if browser is Safari (not Chrome) */
  isSafari: /^((?!chrome|android).)*safari/i.test(userAgent),
  /** True if browser is Edge (Chromium) */
  isEdge: /Edg\//.test(userAgent),
  /** True if running on macOS */
  isMac: /Macintosh/.test(userAgent),
  /** True if running on mobile */
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
  /** True if touch is supported */
  isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  /** Modifier key name depending on platform */
  modifierKey: /Macintosh/.test(userAgent) ? 'metaKey' : 'ctrlKey',
};
