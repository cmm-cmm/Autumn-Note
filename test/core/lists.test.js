import { describe, it, expect } from 'vitest';
import { last, first, initial, tail, flatten, unique, chunk, groupBy, all, any } from '../../src/js/core/lists.js';

describe('last', () => {
  it('returns last element', () => expect(last([1, 2, 3])).toBe(3));
  it('returns undefined for empty array', () => expect(last([])).toBeUndefined());
  it('returns only element of single-item array', () => expect(last(['x'])).toBe('x'));
});

describe('first', () => {
  it('returns first element', () => expect(first([1, 2, 3])).toBe(1));
  it('returns undefined for empty array', () => expect(first([])).toBeUndefined());
  it('returns only element of single-item array', () => expect(first(['x'])).toBe('x'));
});

describe('initial', () => {
  it('drops last 1 element by default', () => expect(initial([1, 2, 3])).toEqual([1, 2]));
  it('drops last n elements', () => expect(initial([1, 2, 3, 4], 2)).toEqual([1, 2]));
  it('returns empty for single-item array', () => expect(initial([1])).toEqual([]));
  it('returns empty when n = length', () => expect(initial([1, 2], 2)).toEqual([]));
  it('returns empty when n > length (slice clamps)', () => expect(initial([1], 5)).toEqual([]));
});

describe('tail', () => {
  it('drops first 1 element by default', () => expect(tail([1, 2, 3])).toEqual([2, 3]));
  it('drops first n elements', () => expect(tail([1, 2, 3, 4], 2)).toEqual([3, 4]));
  it('returns empty for single-item array', () => expect(tail([1])).toEqual([]));
  it('does not mutate original', () => {
    const arr = [1, 2, 3];
    tail(arr);
    expect(arr).toEqual([1, 2, 3]);
  });
});

describe('flatten', () => {
  it('flattens one level', () => expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]));
  it('handles empty sub-arrays', () => expect(flatten([[], [1], []])).toEqual([1]));
  it('handles empty outer array', () => expect(flatten([])).toEqual([]));
  it('does not flatten deeply', () => expect(flatten([[1, [2, 3]]])).toEqual([1, [2, 3]]));
});

describe('unique', () => {
  it('removes duplicates', () => expect(unique([1, 2, 1, 3, 2])).toEqual([1, 2, 3]));
  it('preserves insertion order', () => expect(unique([3, 1, 2, 1])).toEqual([3, 1, 2]));
  it('handles empty array', () => expect(unique([])).toEqual([]));
  it('works with strings', () => expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']));
});

describe('chunk', () => {
  it('splits array into chunks of n', () => expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]));
  it('last chunk may be smaller', () => expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]));
  it('chunk size 1 wraps each element', () => expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]));
  it('chunk larger than array returns single chunk', () => expect(chunk([1, 2], 5)).toEqual([[1, 2]]));
  it('empty array returns empty', () => expect(chunk([], 2)).toEqual([]));
});

describe('groupBy', () => {
  it('groups by key function', () => {
    const result = groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'even' : 'odd'));
    expect(result).toEqual({ odd: [1, 3], even: [2, 4] });
  });
  it('handles empty array', () => expect(groupBy([], (x) => x)).toEqual({}));
  it('groups strings by first letter', () => {
    const result = groupBy(['apple', 'avocado', 'banana'], (s) => s[0]);
    expect(result.a).toEqual(['apple', 'avocado']);
    expect(result.b).toEqual(['banana']);
  });
});

describe('all', () => {
  it('returns true when all elements match predicate', () => expect(all([2, 4, 6], (n) => n % 2 === 0)).toBe(true));
  it('returns false when some element fails', () => expect(all([2, 3, 6], (n) => n % 2 === 0)).toBe(false));
  it('returns true for empty array', () => expect(all([], () => false)).toBe(true));
});

describe('any', () => {
  it('returns true when at least one element matches', () => expect(any([1, 2, 3], (n) => n === 2)).toBe(true));
  it('returns false when no element matches', () => expect(any([1, 3, 5], (n) => n % 2 === 0)).toBe(false));
  it('returns false for empty array', () => expect(any([], () => true)).toBe(false));
});
