import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * Builds `autumnnote/core` — the minimal preset.
 *
 * A separate config rather than a second `lib.entry` on the main one: sharing a
 * build would let Rollup hoist the two entries' common code into shared chunks,
 * and the whole point here is that this output never contains the modules the
 * full entry pulls in. Emitting it on its own keeps the comparison honest and
 * the file self-contained.
 *
 * `core.js` does not import the stylesheet, so none is emitted here; consumers
 * load `autumnnote/dist/autumnnote.css`, exactly as they do with the full
 * build, which emits it.
 */
export default defineConfig({
  root: resolve(__dirname, 'demo'),
  publicDir: false,
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/js/core.js'),
      formats: ['es'],
      fileName: () => 'autumnnote.core.es.js',
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
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
