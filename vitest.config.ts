import { defineConfig } from 'vitest/config';

/**
 * A plain Vitest config rather than Astro's `getViteConfig`.
 *
 * Vitest 4 removed the `vite` module augmentation that used to type a `test` block inside a
 * Vite config, so routing through `getViteConfig` costs the type safety on every option
 * below. These suites only exercise plain modules (`src/lib/*`) and the filesystem — nothing
 * imports `astro:content` — so Astro's resolution is not needed.
 *
 * If a future test does need Astro virtual modules, move it to the Playwright suite, which
 * runs against the real build and is a better place to assert on rendered content anyway.
 */
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
