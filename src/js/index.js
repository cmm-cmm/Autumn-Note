/**
 * index.js - Public entry point for AutumnNote
 *
 * Usage (module):
 *   import AutumnNote from 'autumnnote';
 *   const editor = AutumnNote.create('#my-editor', { placeholder: 'Start typing…' });
 *
 * Usage (UMD / script tag):
 *   const editor = AutumnNote.create('#my-editor');
 */

import '../styles/autumnnote.scss';
import { Context, _customModules } from './Context.js';
import { defaultOptions } from './settings.js';

// Snapshot of factory defaults taken at module-load time (before any setDefaults() calls)
const _originalDefaults = { ...defaultOptions };

// Re-export for tree-shaking / module consumers
export { Context } from './Context.js';
export { defaultOptions } from './settings.js';
export * from './core/dom.js';
export * from './core/range.js';
export * from './core/func.js';
export * from './core/key.js';
export * from './core/lists.js';
export * from './core/env.js';
export * from './core/sanitise.js';
export * from './module/Buttons.js';
export { locales, resolveLocale } from './i18n/index.js';

// ---------------------------------------------------------------------------
// Main factory
// ---------------------------------------------------------------------------

/** @type {WeakMap<Element, Context>} */
const instances = new WeakMap();

const AutumnNote = {
  /**
   * Creates (or returns existing) editor instance on one or more elements.
   *
   * @param {string|Element|NodeList|Element[]} selector
   * @param {import('./settings.js').AsnOptions} [options]
   * @returns {Context|Context[]} single Context or array of Contexts
   */
  create(selector, options = {}) {
    const elements = resolveElements(selector);
    const ctxs = elements.map((el) => {
      if (instances.has(el)) return instances.get(el);
      const ctx = new Context(el, options);
      ctx.initialize();
      instances.set(el, ctx);
      return ctx;
    });
    return ctxs.length === 1 ? ctxs[0] : ctxs;
  },

  /**
   * Destroys the editor(s) on the given selector.
   * @param {string|Element|NodeList|Element[]} selector
   */
  destroy(selector) {
    resolveElements(selector).forEach((el) => {
      const ctx = instances.get(el);
      if (ctx) {
        ctx.destroy();
        instances.delete(el);
      }
    });
  },

  /**
   * Returns the Context instance for a given element (or null).
   * @param {string|Element} selector
   * @returns {Context|null}
   */
  getInstance(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    return el ? instances.get(el) || null : null;
  },

  /** Returns a shallow copy of the default options (read-only snapshot). */
  get defaults() { return { ...defaultOptions }; },

  /** Merges properties into the global defaults, applied to all future instances. */
  setDefaults(overrides) { Object.assign(defaultOptions, overrides); },

  /** Restores global defaults to their original factory values. */
  resetDefaults() {
    Object.keys(defaultOptions).forEach((k) => delete defaultOptions[k]);
    Object.assign(defaultOptions, _originalDefaults);
  },

  /**
   * Registers a custom module to be included in every new editor instance.
   * @param {string} name - unique module key used for ctx.invoke() calls
   * @param {Function} ModuleClass - class with initialize() and optional destroy()
   */
  registerModule(name, ModuleClass) { _customModules.set(name, ModuleClass); },

  /** Library version */
  version: '1.0.4',
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * @param {string|Element|NodeList|Element[]} selector
 * @returns {Element[]}
 */
function resolveElements(selector) {
  if (typeof selector === 'string') {
    return Array.from(document.querySelectorAll(selector));
  }
  if (selector instanceof Element) {
    return [selector];
  }
  if (selector instanceof NodeList || Array.isArray(selector)) {
    return Array.from(selector);
  }
  return [];
}

export default AutumnNote;
