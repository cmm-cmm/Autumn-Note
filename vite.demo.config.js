import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// DEMO_BASE_PATH / DEMO_OUT_DIR let this same config target either GitHub
// Pages (default, served at /Autumn-Note/) or a /demo/ subpath on another
// host (e.g. Cloudflare Pages), where the build output must physically live
// under a `demo/` folder matching the `base` prefix.
const base = process.env.DEMO_BASE_PATH || '/Autumn-Note/';
const outDir = process.env.DEMO_OUT_DIR
  ? resolve(__dirname, process.env.DEMO_OUT_DIR)
  : resolve(__dirname, '_site');

export default defineConfig({
  base,
  // Demo site source lives in demo/ — keep build output flat at _site/
  // so published URLs (/, /docs.html, /playground.html) stay unchanged.
  root: resolve(__dirname, 'demo'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'demo/index.html'),
        docs:       resolve(__dirname, 'demo/docs.html'),
        playground: resolve(__dirname, 'demo/playground.html'),
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
