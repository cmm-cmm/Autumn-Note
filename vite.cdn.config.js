import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// CDN build: minified UMD for direct <script> tag usage
export default defineConfig({
  // CDN library builds must not copy demo-site assets into the npm package.
  publicDir: false,
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/js/index.umd.js'),
      name: 'AutumnNote',
      formats: ['umd'],
      fileName: () => 'autumnnote.min.js',
      // Vite names library CSS after the package; the published file stays autumnnote.css.
      cssFileName: 'autumnnote',
    },
    rollupOptions: {
      output: {
        exports: 'default',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name;
          if (name === 'style.css') return 'autumnnote.min.css';
          return name ?? '[name][extname]';
        },
      },
    },
    emptyOutDir: false,
    sourcemap: false,
    minify: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
