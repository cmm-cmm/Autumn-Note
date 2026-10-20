import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite compiles JSX itself; the automatic runtime imports react/jsx-runtime.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.jsx'],
  },
});
