import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/js/index.umd.js'),
      name: 'AutumnNote',
      formats: ['umd'],
      fileName: () => 'autumnnote.umd.js',
    },
    rollupOptions: {
      output: {
        exports: 'default',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'autumnnote.css';
          return assetInfo.name;
        },
      },
    },
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
