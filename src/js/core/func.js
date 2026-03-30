/**
 * func.js - General utility / functional helpers
 * Inspired by Summernote's func.js
 */

/**
 * Clamp a value between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay - milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle a function call.
 * @param {Function} fn
 * @param {number} limit - milliseconds
 * @returns {Function}
 */
export function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * Compose multiple functions right-to-left.
 * @param {...Function} fns
 * @returns {Function}
 */
export function compose(...fns) {
  return (x) => fns.reduceRight((v, f) => f(v), x);
}

/**
 * Identity function.
 * @template T
 * @param {T} x
 * @returns {T}
 */
export function identity(x) {
  return x;
}

/**
 * Determines if a value is null or undefined.
 * @param {*} val
 * @returns {boolean}
 */
export function isNil(val) {
  return val === null || val === undefined;
}

/**
 * Determines if a value is a string.
 * @param {*} val
 * @returns {boolean}
 */
export function isString(val) {
  return typeof val === 'string';
}

/**
 * Determines if a value is a function.
 * @param {*} val
 * @returns {boolean}
 */
export function isFunction(val) {
  return typeof val === 'function';
}

/**
 * Deep-merge two plain objects. Returns a new object.
 * Arrays are cloned (shallow copy) rather than shared by reference so that
 * mutations to the merged result do not bleed back into the source object
 * (e.g. mutating `instance.options.fontFamilies` should not affect
 * `AutumnNote.defaults.fontFamilies`).
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
export function mergeDeep(target, source) {
  // Start with a shallow copy of target; clone any arrays to avoid shared refs
  const output = {};
  for (const key of Object.keys(target)) {
    output[key] = Array.isArray(target[key]) ? [...target[key]] : target[key];
  }
  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key of Object.keys(source)) {
      if (isPlainObject(source[key])) {
        if (!(key in target)) {
          output[key] = mergeDeep({}, source[key]);
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        output[key] = [...source[key]];
      } else {
        output[key] = source[key];
      }
    }
  }
  return output;
}

/**
 * Checks if value is a plain object.
 * @param {*} val
 * @returns {boolean}
 */
export function isPlainObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Convert a DOMRect (or similar bounding object) to a plain object bounding box.
 * Guards against missing/null rect (e.g. in AirMode).
 * @param {DOMRect|null|undefined} rect
 * @returns {{ top: number, left: number, width: number, height: number, bottom: number, right: number }|null}
 */
export function rect2bnd(rect) {
  if (!rect) return null;
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    bottom: Math.round(rect.bottom),
    right: Math.round(rect.right),
  };
}
