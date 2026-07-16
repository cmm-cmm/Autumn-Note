import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

const browser = process.env.BROWSER || 'chromium';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/browser/**/*.browser.test.js'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser }],
    },
  },
});
