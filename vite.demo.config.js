import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { demoVersion } from './scripts/vite-plugin-demo-version.mjs';

// DEMO_BASE_PATH / DEMO_OUT_DIR let this same config target either a root
// domain (default, served at /) or a /demo/ subpath on another host
// (e.g. Cloudflare Pages), where the build output must physically live
// under a `demo/` folder matching the `base` prefix.
const base = process.env.DEMO_BASE_PATH || '/';
const outDir = process.env.DEMO_OUT_DIR
  ? resolve(import.meta.dirname, process.env.DEMO_OUT_DIR)
  : resolve(import.meta.dirname, '_site');

export default defineConfig({
  base,
  plugins: [demoVersion()],
  // Demo site source lives in demo/ — keep build output flat at _site/
  // so published URLs (/, /docs.html, /playground.html) stay unchanged.
  root: resolve(import.meta.dirname, 'demo'),
  publicDir: resolve(import.meta.dirname, 'public'),
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:       resolve(import.meta.dirname, 'demo/index.html'),
        docs:       resolve(import.meta.dirname, 'demo/docs.html'),
        playground: resolve(import.meta.dirname, 'demo/playground.html'),
        notFound:   resolve(import.meta.dirname, 'demo/404.html'),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
