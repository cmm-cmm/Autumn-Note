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
        lines: 75,
        statements: 70,
        functions: 62,
        branches: 57,
      },
    },
  },
});
