import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.js'],
    pool: 'forks',
    coverage: {
      provider: 'v8',
      include: ['src/js/**'],
      exclude: ['src/js/i18n/**'],
      thresholds: {
        lines: 87,
        statements: 83,
        functions: 80,
        branches: 70,
        perFile: true,
        // Per-file floor — lower than aggregate so coverage-sparse files are tracked
        // without failing the build while still catching complete regressions.
        '**/*': { lines: 30, statements: 30, functions: 25, branches: 20 },
      },
    },
  },
});
