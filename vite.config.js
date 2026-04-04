import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/js/index.js'),
      formats: ['es'],
      fileName: () => 'autumnnote.es.js',
    },
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'autumnnote.css';
          return assetInfo.name;
        },
      },
    },
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
