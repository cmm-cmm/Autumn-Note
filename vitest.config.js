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
      // Thresholds sit ~1-2 points under the measured figures. Kept close on
      // purpose: a floor with six points of slack cannot fail, so it stops
      // being a regression guard and becomes decoration. Re-tighten these
      // whenever coverage climbs meaningfully above them.
      thresholds: {
        lines: 92,        // actual 93.2
        statements: 88,   // actual 89.3
        functions: 84,    // actual 85.9
        branches: 75,     // actual 76.5
        // Files with heavy pointer/canvas interaction that jsdom cannot drive
        // fully. Vitest excludes glob-matched files from the global figures,
        // so these are their own complete budget — not an exemption.
        'src/js/module/ImageCropOverlay.js': {
          lines: 95,      // actual 97.0
          functions: 90,  // actual 93.2
          branches: 66,   // actual 68.7
        },
        'src/js/module/IconDialog.js': {
          lines: 98,      // actual 99.0
          functions: 85,  // actual 86.7
          branches: 71,   // actual 73.3
        },
        'src/js/module/TableTooltip.js': {
          lines: 92,      // actual 93.5
          functions: 78,  // actual 80.1
          branches: 65,   // actual 67.1
        },
      },
    },
  },
});
