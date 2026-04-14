import { describe, it, expect, vi } from 'vitest';
import {
  clamp,
  debounce,
  throttle,
  compose,
  identity,
  isNil,
  isString,
  isFunction,
  mergeDeep,
  isPlainObject,
  rect2bnd,
} from '../../src/js/core/func.js';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
  it('works when val equals min or max', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('debounce', () => {
  it('delays function execution', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('calls function at most once per limit', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('compose', () => {
  it('composes functions right-to-left', () => {
    const add1 = (x) => x + 1;
    const double = (x) => x * 2;
    const composed = compose(add1, double);
    expect(composed(3)).toBe(7); // double(3)=6, add1(6)=7
  });
  it('works with a single function', () => {
    const add1 = (x) => x + 1;
    expect(compose(add1)(5)).toBe(6);
  });
});

describe('identity', () => {
  it('returns the same value', () => {
    expect(identity(42)).toBe(42);
    expect(identity('hello')).toBe('hello');
    expect(identity(null)).toBeNull();
  });
});

describe('isNil', () => {
  it('returns true for null and undefined', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
  });
  it('returns false for other values', () => {
    expect(isNil(0)).toBe(false);
    expect(isNil('')).toBe(false);
    expect(isNil(false)).toBe(false);
  });
});

describe('isString', () => {
  it('returns true for strings', () => {
    expect(isString('')).toBe(true);
    expect(isString('hello')).toBe(true);
  });
  it('returns false for non-strings', () => {
    expect(isString(1)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString([])).toBe(false);
  });
});

describe('isFunction', () => {
  it('returns true for functions', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function () {})).toBe(true);
  });
  it('returns false for non-functions', () => {
    expect(isFunction(1)).toBe(false);
    expect(isFunction('fn')).toBe(false);
  });
});

describe('isPlainObject', () => {
  it('returns true for plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
  });
  it('returns false for arrays, null, primitives', () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject('str')).toBe(false);
    expect(isPlainObject(42)).toBe(false);
  });
});

describe('mergeDeep', () => {
  it('merges source properties into target', () => {
    const result = mergeDeep({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('source overrides target flat values', () => {
    const result = mergeDeep({ a: 1, b: 2 }, { b: 99 });
    expect(result.b).toBe(99);
    expect(result.a).toBe(1);
  });

  it('merges nested objects', () => {
    const result = mergeDeep({ a: { x: 1 } }, { a: { y: 2 } });
    expect(result.a).toEqual({ x: 1, y: 2 });
  });

  it('does not mutate target or source', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    mergeDeep(target, source);
    expect(target).toEqual({ a: 1 });
    expect(source).toEqual({ b: 2 });
  });

  it('clones arrays so mutations do not bleed back to source', () => {
    const defaults = { fonts: ['Arial', 'Georgia'] };
    const result = mergeDeep(defaults, {});
    result.fonts.push('Roboto');
    expect(defaults.fonts).toHaveLength(2);
  });

  it('source array replaces target array (not concatenation)', () => {
    const result = mergeDeep({ a: [1, 2] }, { a: [3] });
    expect(result.a).toEqual([3]);
  });

  it('deep-clones nested source object when key is absent in target', () => {
    const source = { nested: { a: 1 } };
    const result = mergeDeep({}, source);
    result.nested.a = 99;
    expect(source.nested.a).toBe(1);
  });
});

describe('rect2bnd', () => {
  it('returns null for null input', () => {
    expect(rect2bnd(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(rect2bnd(undefined)).toBeNull();
  });

  it('returns null for falsy zero', () => {
    expect(rect2bnd(0)).toBeNull();
  });

  it('rounds and maps all DOMRect properties', () => {
    const result = rect2bnd({ top: 1.4, left: 2.6, width: 10.1, height: 5.5, bottom: 6.9, right: 12.4 });
    expect(result).toEqual({
      top: 1,
      left: 3,
      width: 10,
      height: 6,
      bottom: 7,
      right: 12,
    });
  });

  it('handles integer values (no rounding change)', () => {
    const result = rect2bnd({ top: 10, left: 20, width: 100, height: 50, bottom: 60, right: 120 });
    expect(result).toEqual({ top: 10, left: 20, width: 100, height: 50, bottom: 60, right: 120 });
  });

  it('rounds negative values correctly', () => {
    const result = rect2bnd({ top: -1.6, left: -2.4, width: 5, height: 5, bottom: 3.4, right: 2.6 });
    expect(result.top).toBe(-2);
    expect(result.left).toBe(-2);
  });
});
