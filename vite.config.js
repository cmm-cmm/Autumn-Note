import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const plugins = [];
  if (process.env.ANALYZE) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true }));
  }

  return {
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
