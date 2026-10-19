import { createRequire } from 'node:module';
import { builtinEnvironments } from 'vitest/runtime';

const require = createRequire(import.meta.url);
const jsdom = require('jsdom');

if (typeof Bun !== 'undefined' || typeof Deno !== 'undefined') {
  const OrigJSDOM = jsdom.JSDOM;
  class PortableJSDOM extends OrigJSDOM {
    constructor(html, options = {}) {
      if (options && options.runScripts === 'dangerously') {
        delete options.runScripts;
      }
      super(html, options);
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
    if (global.URL) {
      const origCreate = global.URL.createObjectURL;
      global.URL.createObjectURL = (blob) => {
        try {
          return origCreate(blob);
        } catch {
          return `blob:autumnnote/${Math.random().toString(36).slice(2)}`;
        }
      };
      if (!global.URL.revokeObjectURL) {
        global.URL.revokeObjectURL = () => {};
      }
    }
    return res;
  },
};
