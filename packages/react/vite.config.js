import { defineConfig } from 'vite';

export default defineConfig({
  // Vite compiles JSX itself; the automatic runtime imports react/jsx-runtime.
  oxc: { jsx: { runtime: 'automatic' } },
  build: {
    lib: {
      entry: 'src/index.jsx',
      name: 'AutumnNoteReact',
      formats: ['es', 'cjs'],
      fileName: (fmt) => fmt === 'es' ? 'index.js' : 'index.cjs',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'autumnnote-plus'],
      output: {
        exports: 'named',
        globals: { react: 'React', autumnnote: 'AutumnNote' },
      },
    },
  },
});
