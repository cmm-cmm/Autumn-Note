/**
 * dom.js - DOM manipulation utilities
 * Inspired by Summernote's dom.js — rewritten for vanilla JS without jQuery
 */

// ---------------------------------------------------------------------------
// Node type helpers
// ---------------------------------------------------------------------------

export const ELEMENT_NODE = 1;
export const TEXT_NODE = 3;

/** @param {Node} node */
export const isElement = (node) => node && node.nodeType === ELEMENT_NODE;
/** @param {Node} node */
export const isText = (node) => node && node.nodeType === TEXT_NODE;
/** @param {Node} node */
export const isVoid = (node) => isElement(node) && /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(node.nodeName);
/** @param {Node} node */
export const isPara = (node) => isElement(node) && /^(p|div|li|h[1-6]|blockquote|td|th|pre)$/i.test(node.nodeName);
/** @param {Node} node */
export const isLi = (node) => isElement(node) && /^(li)$/i.test(node.nodeName);
/** @param {Node} node */
export const isList = (node) => isElement(node) && /^(ul|ol)$/i.test(node.nodeName);
/** @param {Node} node */
export const isTable = (node) => isElement(node) && node.nodeName.toUpperCase() === 'TABLE';
/** @param {Node} node */
export const isInline = (node) =>
  isElement(node) &&
  /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|output|q|s|samp|select|small|span|strong|sub|sup|textarea|time|tt|u|var)$/i.test(node.nodeName);
/** @param {Node} node */
export const isEditable = (node) => isElement(node) && /** @type {HTMLElement} */ (node).isContentEditable;
/** @param {Node} node */
export const isAnchor = (node) => isElement(node) && node.nodeName.toUpperCase() === 'A';
/** @param {Node} node */
export const isImage = (node) => isElement(node) && node.nodeName.toUpperCase() === 'IMG';

// ---------------------------------------------------------------------------
// Tree traversal
// ---------------------------------------------------------------------------

/**
 * Walk up the DOM tree from node, returning the first element matching predicate (inclusive).
 * @param {Node} node
 * @param {(node: Node) => boolean} predicate
 * @param {Node} [stopAt] - stop traversal at this ancestor (exclusive)
 * @returns {Node|null}
 */
export function closest(node, predicate, stopAt) {
  let cur = node;
  while (cur && cur !== stopAt) {
    if (predicate(cur)) return cur;
    cur = cur.parentNode;
  }
  return null;
}

/**
 * Returns the nearest ancestor that is a paragraph-like block.
 * @param {Node} node
 * @param {Node} [editable]
 * @returns {Node|null}
 */
export function closestPara(node, editable) {
  return closest(node, isPara, editable);
}

/**
 * Returns all ancestors of node up to (but not including) stopAt.
 * @param {Node} node
 * @param {Node} [stopAt]
 * @returns {Node[]}
 */
export function ancestors(node, stopAt) {
  const result = [];
  let cur = node.parentNode;
  while (cur && cur !== stopAt) {
    result.push(cur);
    cur = cur.parentNode;
  }
  return result;
}

/**
 * Returns all children of node as an Array.
 * @param {Node} node
 * @returns {Node[]}
 */
export function children(node) {
  return Array.from(node.childNodes);
}

/**
 * Returns the previous sibling element (skipping text/comment nodes).
 * @param {Node} node
 * @returns {Element|null}
 */
export function prevElement(node) {
  let sibling = node.previousSibling;
  while (sibling && !isElement(sibling)) {
    sibling = sibling.previousSibling;
  }
  return /** @type {Element|null} */ (sibling);
}

/**
 * Returns the next sibling element.
 * @param {Node} node
 * @returns {Element|null}
 */
export function nextElement(node) {
  let sibling = node.nextSibling;
  while (sibling && !isElement(sibling)) {
    sibling = sibling.nextSibling;
  }
  return /** @type {Element|null} */ (sibling);
}

// ---------------------------------------------------------------------------
// DOM mutation helpers
// ---------------------------------------------------------------------------

/**
 * Creates an element with optional attributes and children.
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @param {(Node|string)[]} [childNodes]
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, childNodes = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  for (const child of childNodes) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }
  return el;
}

/**
 * Removes a node from its parent.
 * @param {Node} node
 */
export function remove(node) {
  if (node && node.parentNode) {
    /** @type {ChildNode} */ (node).remove();
  }
}

/**
 * Unwraps a node — replaces the node with its children.
 * @param {Node} node
 */
export function unwrap(node) {
  const parent = node.parentNode;
  if (!parent) return;
  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node);
  }
  /** @type {ChildNode} */ (node).remove();
}

/**
 * Wraps a node with a wrapper element.
 * @param {Node} node
 * @param {HTMLElement} wrapper
 * @returns {HTMLElement} the wrapper
 */
export function wrap(node, wrapper) {
  node.parentNode.insertBefore(wrapper, node);
  wrapper.appendChild(node);
  return wrapper;
}

/**
 * Insert node after reference node.
 * @param {Node} newNode
 * @param {Node} refNode
 */
export function insertAfter(newNode, refNode) {
  if (refNode.nextSibling) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  } else {
    refNode.parentNode.appendChild(newNode);
  }
}

// ---------------------------------------------------------------------------
// Content helpers
// ---------------------------------------------------------------------------

/**
 * Returns the text content of a node (safe).
 * @param {Node} node
 * @returns {string}
 */
export function nodeValue(node) {
  return isText(node) ? node.nodeValue : node.textContent || '';
}

/**
 * Determine whether a DOM node contains no visible content.
 *
 * Text nodes are considered empty when their `nodeValue` is empty. Void elements (e.g., `img`, `br`, `input`) are considered non-empty. An element with exactly one `<br>` child is treated as empty. For other elements, emptiness means trimmed `textContent` is empty and there are no descendant `img`, `video`, `hr`, or `table` elements.
 * @param {Node} node - Node to inspect for visible content.
 * @returns {boolean} `true` if the node has no visible content, `false` otherwise.
 */
export function isEmpty(node) {
  if (isText(node)) return !node.nodeValue;
  if (isVoid(node)) return false;
  if (node.childNodes.length === 1 && node.firstChild?.nodeName === 'BR') return true;
  return !node.textContent.trim() && !/** @type {Element} */ (node).querySelector('img, video, hr, table');
}

/**
 * Returns the outerHTML of an element.
 * @param {Element} el
 * @returns {string}
 */
export function outerHtml(el) {
  return el.outerHTML;
}

// ---------------------------------------------------------------------------
// Selection / editing helpers
// ---------------------------------------------------------------------------

/**
 * Places the caret at the end of a contenteditable element.
 * @param {HTMLElement} el
 */
export function placeCaret(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = globalThis.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

/**
 * Returns true if the node is inside a contenteditable root.
 * @param {Node} node
 * @returns {boolean}
 */
export function isInsideEditable(node) {
  return !!closest(node, isEditable);
}

// ---------------------------------------------------------------------------
// Event helpers
// ---------------------------------------------------------------------------

/**
 * Adds an event listener and returns a disposer function.
 * @param {EventTarget} target
 * @param {string} type
 * @param {EventListener} handler
 * @param {AddEventListenerOptions} [options]
 * @returns {() => void} disposer
 */
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/**
 * Installs a keyboard focus trap inside a dialog container.
 * - Tab / Shift+Tab cycles focus within the container's focusable children.
 * - Escape calls `onEscape` and removes the trap listener.
 *
 * Returns a disposer function that removes the listener (call on dialog close).
 *
 * @param {HTMLElement} container - the dialog element to trap focus inside
 * @param {() => void} onEscape  - called when Escape is pressed
 * @returns {() => void} disposer
 */
export function trapFocus(container, onEscape) {
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.closest('[style*="display: none"]') && !el.closest('[style*="display:none"]'),
  );

  const handler = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onEscape?.();
      return;
    }
    if (e.key !== 'Tab') return;
    const els = getFocusable();
    if (!els.length) return;
    const first = els[0];
    const last = els.at(-1);
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        /** @type {HTMLElement} */ (last).focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      /** @type {HTMLElement} */ (first).focus();
    }
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

/**
 * Makes a dialog box draggable by its handle element.
 * On first drag the box is pinned to its current viewport coordinates via
 * `position:fixed`, freeing it from the parent flex container's centering.
 * The position is clamped to the visible viewport.
 *
 * @param {HTMLElement} handle  Element the user grabs (title bar / header)
 * @param {HTMLElement} box     Element that actually moves
 * @returns {Function}          Cleanup function (removes the mousedown listener)
 */
export function makeDraggable(handle, box) {
  handle.style.cursor = 'grab';

  const onMousedown = (e) => {
    if (e.button !== 0) return;
    // Don't start drag when clicking on interactive children of the handle
    if (/** @type {Element} */ (e.target).closest('button, input, select, textarea, a')) return;

    e.preventDefault();

    // First drag: snapshot position and pin to viewport with position:fixed
    if (!box.dataset.anDragPinned) {
      const r = box.getBoundingClientRect();
      box.style.position = 'fixed';
      box.style.margin = '0';
      box.style.left = `${r.left}px`;
      box.style.top = `${r.top}px`;
      box.dataset.anDragPinned = '1';
    }

    const startX = e.clientX - Number.parseFloat(box.style.left);
    const startY = e.clientY - Number.parseFloat(box.style.top);

    handle.style.cursor = 'grabbing';

    const onMove = (ev) => {
      const bw = box.offsetWidth;
      const bh = box.offsetHeight;
      box.style.left = `${Math.max(0, Math.min(ev.clientX - startX, globalThis.innerWidth  - bw))}px`;
      box.style.top  = `${Math.max(0, Math.min(ev.clientY - startY, globalThis.innerHeight - bh))}px`;
    };

    const onUp = () => {
      handle.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  };

  handle.addEventListener('mousedown', onMousedown);
  return () => handle.removeEventListener('mousedown', onMousedown);
}
