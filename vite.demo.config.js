import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Must match the GitHub Pages repo sub-path
  base: '/Autumn-Note/',
  // Demo site source lives in demo/ — keep build output flat at _site/
  // so published URLs (/, /docs.html, /playground.html) stay unchanged.
  root: resolve(__dirname, 'demo'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, '_site'),
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
