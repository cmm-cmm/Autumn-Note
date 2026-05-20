import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'AutumnNoteVue',
      formats: ['es', 'cjs'],
      fileName: (fmt) => fmt === 'es' ? 'index.js' : 'index.cjs',
    },
    rollupOptions: {
      external: ['vue', 'autumnnote'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue', autumnnote: 'AutumnNote' },
      },
    },
  },
});
