import { createRequire } from 'node:module';
import { builtinEnvironments } from 'vitest/runtime';

const require = createRequire(import.meta.url);
const jsdom = require('jsdom');

// Bun and Deno cannot host jsdom's `runScripts: 'dangerously'` VM context, so
// there the window runs without script execution. Inline <script> and on*
// handlers never fire under those runtimes, which means a test asserting "the
// script did not run" proves nothing there; Node CI remains the authority for
// those. Everything else in the suite behaves the same on all three.
const isNodeRuntime = typeof Bun === 'undefined' && typeof Deno === 'undefined';

if (!isNodeRuntime) {
  const OrigJSDOM = jsdom.JSDOM;
  class PortableJSDOM extends OrigJSDOM {
    constructor(html, options = {}) {
      const opts = { ...options };
      if (opts.runScripts === 'dangerously') delete opts.runScripts;
      super(html, opts);
    }
  }
  Object.assign(PortableJSDOM, OrigJSDOM);
  jsdom.JSDOM = PortableJSDOM;
}

const baseEnv = builtinEnvironments.jsdom;

export default {
  ...baseEnv,
  name: 'jsdom-portable',
  async setup(global, options) {
    const res = await baseEnv.setup(global, options);
    // Bun and Deno leak their native URL into the window, whose
    // createObjectURL rejects jsdom's Blob. Under Node jsdom provides no
    // createObjectURL at all, and tests that need one mock it, so leave Node
    // untouched rather than hide a missing mock.
    if (!isNodeRuntime && global.URL && typeof global.URL.createObjectURL === 'function') {
      const origCreate = global.URL.createObjectURL;
      global.URL.createObjectURL = (blob) => {
        try {
          return origCreate.call(global.URL, blob);
        } catch {
          return `blob:autumnnote/${Math.random().toString(36).slice(2)}`;
        }
      };
      if (typeof global.URL.revokeObjectURL !== 'function') {
        global.URL.revokeObjectURL = () => {};
      }
    }
    return res;
  },
};
