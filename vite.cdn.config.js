import { resolve } from 'path';
import { defineConfig } from 'vite';

// CDN build: minified UMD for direct <script> tag usage
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/js/index.umd.js'),
      name: 'AutumnNote',
      formats: ['umd'],
      fileName: () => 'autumnnote.min.js',
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
