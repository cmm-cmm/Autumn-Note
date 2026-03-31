import { defineConfig } from 'vite';

export default defineConfig({
  // Must match the GitHub Pages repo sub-path
  base: '/Autumn-Note/',
  build: {
    outDir: '_site',
    emptyOutDir: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
