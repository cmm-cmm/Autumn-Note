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
      reporter: ['text', 'html', 'clover', 'json', 'lcov'],
      include: ['src/js/**'],
      exclude: ['src/js/i18n/**'],
      thresholds: {
        lines: 87,
        statements: 83,
        functions: 80,
        branches: 70,
        'src/js/module/ImageCropOverlay.js': {
          lines: 80,
          functions: 75,
          branches: 55,
        },
        'src/js/module/IconDialog.js': {
          lines: 95,
          functions: 80,
          branches: 65,
        },
        'src/js/module/TableTooltip.js': {
          lines: 85,
          functions: 75,
          branches: 60,
        },
      },
    },
  },
});
