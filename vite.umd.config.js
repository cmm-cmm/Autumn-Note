import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Library bundles must not copy demo-site assets into the npm package.
  publicDir: false,
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/js/index.umd.js'),
      name: 'AutumnNote',
      formats: ['umd'],
      fileName: () => 'autumnnote.umd.js',
      // Vite names library CSS after the package; the published file stays autumnnote.css.
      cssFileName: 'autumnnote',
    },
    rollupOptions: {
      output: {
        exports: 'default',
        assetFileNames: (assetInfo) => {
          // Vite 8 (rolldown) uses assetInfo.names[], Vite 5 used assetInfo.name
          const name = assetInfo.names?.[0] ?? assetInfo.name;
          if (name === 'style.css') return 'autumnnote.css';
          return name ?? '[name][extname]';
        },
      },
    },
    emptyOutDir: false,
    sourcemap: true,
    minify: 'oxc',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
