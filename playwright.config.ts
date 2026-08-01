import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Some sandboxed environments preinstall a Chromium that predates the revision this
 * Playwright version pins, and cannot download another. Use it when it is there; in CI
 * `npx playwright install chromium` provides the matching build and this is a no-op.
 */
const PREINSTALLED_CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const launchOptions = existsSync(PREINSTALLED_CHROMIUM)
  ? { executablePath: PREINSTALLED_CHROMIUM }
  : {};

/**
 * E2E runs against the real production build, not the dev server — the dev server does not
 * emit the CSP meta tag, does not hash inline scripts, and does not exercise the static
 * output that actually ships. Testing anything else would test a different artifact.
 */
const PORT = 4321;
const BASE_PATH = process.env['BASE_PATH'] ?? '/ksmpage';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  // Spread rather than `undefined`: under exactOptionalPropertyTypes an explicit undefined
  // is not the same as an absent key, and Playwright's default worker count is what we want
  // locally.
  ...(process.env['CI'] ? { workers: 2 } : {}),
  reporter: process.env['CI'] ? [['html', { open: 'never' }], ['list']] : 'list',
  timeout: 30_000,

  use: {
    /**
     * Trailing slash is load-bearing. `new URL('/', 'http://host/ksmpage')` resolves to
     * `http://host/` — the base path is discarded — so specs address routes with RELATIVE
     * paths ('', 'colophon') and this URL keeps its trailing slash to preserve them.
     */
    baseURL: `http://localhost:${PORT}${BASE_PATH.replace(/\/$/u, '')}/`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions } },
  ],

  webServer: {
    command: 'npm run build && npm run preview -- --port 4321 --host',
    url: `http://localhost:${PORT}${BASE_PATH}/`,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
