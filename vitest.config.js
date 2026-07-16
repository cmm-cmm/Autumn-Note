import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.js'],
    exclude: ['test/browser/**'],
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
      },
    },
  },
});
