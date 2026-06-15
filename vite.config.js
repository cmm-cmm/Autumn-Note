import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const plugins = [];
  if (process.env.ANALYZE) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true }));
  }

  return {
    // Dev server entry now lives in demo/ (landing page used for `npm run dev`)
    root: resolve(__dirname, 'demo'),
    publicDir: resolve(__dirname, 'public'),
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      copyPublicDir: false,
      lib: {
        entry: resolve(__dirname, 'src/js/index.js'),
        formats: ['es'],
        fileName: () => 'autumnnote.es.js',
      },
      rollupOptions: {
        output: {
          exports: 'named',
          assetFileNames: (assetInfo) => {
            // Vite 8 (rolldown) uses assetInfo.names[], Vite 5 used assetInfo.name
            const name = assetInfo.names?.[0] ?? assetInfo.name;
            if (name === 'style.css') return 'autumnnote.css';
            return name ?? '[name][extname]';
          },
        },
      },
      sourcemap: true,
      minify: false,
    },
    plugins,
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});
