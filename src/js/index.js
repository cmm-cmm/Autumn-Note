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

// @ts-ignore
import '../styles/autumnnote.scss';
import { Context, _customModules, _globalPlugins } from './Context.js';
import { registerButton } from './module/Buttons.js';
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
      const ctx = new Context(/** @type {HTMLElement} */ (el), options);
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

  /**
   * Installs a plugin globally — applied to every future editor instance.
   * Plugin `buttons` are registered to the global button registry immediately
   * so they are available when Toolbar initialises inside create().
   * Plugin `install()` is called after all built-in modules have initialised.
   * @param {object} plugin - { name, version?, buttons?, install?, uninstall? }
   * @param {object} [options] - Forwarded to plugin.install(context, options)
   * @returns {typeof AutumnNote}
   */
  use(plugin, options = {}) {
    if (!plugin || typeof plugin.name !== 'string') {
      throw new TypeError('[AutumnNote] AutumnNote.use: plugin must have a string `name` property.');
    }
    if (_globalPlugins.has(plugin.name)) {
      console.warn(`[AutumnNote] Plugin "${plugin.name}" already registered globally. Skipping.`);
      return this;
    }
    if (Array.isArray(plugin.buttons)) {
      plugin.buttons.forEach((b) => registerButton(b));
    }
    _globalPlugins.set(plugin.name, { plugin, options });
    return this;
  },

  /**
   * Returns true if a plugin with the given name has been registered globally.
   * @param {string} name
   * @returns {boolean}
   */
  hasPlugin(name) { return _globalPlugins.has(name); },

  /**
   * Registers a single button definition in the global button registry.
   * After create(), call ctx.invoke('toolbar.rebuild') to render new buttons.
   * @param {object} btnDef - ButtonDef-compatible object with a `name` string
   * @returns {typeof AutumnNote}
   */
  registerButton(btnDef) { registerButton(btnDef); return this; },

  /** Library version */
  version: '1.6.5',
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
    return /** @type {Element[]} */ (Array.from(selector));
  }
  return [];
}

export default AutumnNote;
