import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Must match the GitHub Pages repo sub-path
  base: '/Autumn-Note/',
  build: {
    outDir: '_site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        docs:       resolve(__dirname, 'docs.html'),
        playground: resolve(__dirname, 'playground.html'),
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
