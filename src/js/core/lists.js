/**
 * lists.js - Array/list utility helpers
 * Inspired by Summernote's lists.js
 */

/**
 * Returns the last element of an array.
 * @template T
 * @param {T[]} arr
 * @returns {T|undefined}
 */
export function last(arr) {
  return arr[arr.length - 1];
}

/**
 * Returns the first element of an array.
 * @template T
 * @param {T[]} arr
 * @returns {T|undefined}
 */
export function first(arr) {
  return arr[0];
}

/**
 * Returns a new array without the last n items.
 * @template T
 * @param {T[]} arr
 * @param {number} [n=1]
 * @returns {T[]}
 */
export function initial(arr, n = 1) {
  return arr.slice(0, arr.length - n);
}

/**
 * Returns a new array without the first n items.
 * @template T
 * @param {T[]} arr
 * @param {number} [n=1]
 * @returns {T[]}
 */
export function tail(arr, n = 1) {
  return arr.slice(n);
}

/**
 * Returns a flattened (one level) array.
 * @template T
 * @param {T[][]} arr
 * @returns {T[]}
 */
export function flatten(arr) {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Returns unique elements of an array (using Set).
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function unique(arr) {
  return [...new Set(arr)];
}

/**
 * Splits an array into chunks of size n.
 * @template T
 * @param {T[]} arr
 * @param {number} n
 * @returns {T[][]}
 */
export function chunk(arr, n) {
  const result = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}

/**
 * Groups array elements by a key function.
 * @template T
 * @param {T[]} arr
 * @param {(item: T) => string} keyFn
 * @returns {Record<string, T[]>}
 */
export function groupBy(arr, keyFn) {
  return arr.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Returns true if all elements satisfy the predicate.
 * @template T
 * @param {T[]} arr
 * @param {(item: T) => boolean} predicate
 * @returns {boolean}
 */
export function all(arr, predicate) {
  return arr.every(predicate);
}

/**
 * Returns true if any element satisfies the predicate.
 * @template T
 * @param {T[]} arr
 * @param {(item: T) => boolean} predicate
 * @returns {boolean}
 */
export function any(arr, predicate) {
  return arr.some(predicate);
}
