import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.jsx',
      name: 'AutumnNoteReact',
      formats: ['es', 'cjs'],
      fileName: (fmt) => fmt === 'es' ? 'index.js' : 'index.cjs',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'autumnnote'],
      output: {
        exports: 'named',
        globals: { react: 'React', autumnnote: 'AutumnNote' },
      },
    },
  },
});
