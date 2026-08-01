#!/usr/bin/env node
/**
 * Design review harness.
 *
 * Captures every route at three widths in both themes so the layout can be reviewed as a
 * set rather than one page at a time. Not part of CI — this exists to drive the visual
 * revision loop during development.
 *
 * Usage: node scripts/shoot.mjs [outDir]
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';

/**
 * Some sandboxes ship a Chromium build that predates the pinned Playwright revision.
 * Prefer the preinstalled binary when it exists rather than downloading a second copy.
 */
const PREINSTALLED = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const launchOptions = existsSync(PREINSTALLED) ? { executablePath: PREINSTALLED } : {};

const BASE = process.env.SHOOT_BASE ?? 'http://localhost:4321/ksmpage';
const OUT = process.argv[2] ?? 'shots';

const ROUTES = [
  ['home', '/'],
  ['case-study', '/work/lis-cloud-migration'],
  ['colophon', '/colophon'],
  ['not-found', '/404'],
];

const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['tablet', 834, 1112],
  ['mobile', 390, 844],
];

const THEMES = ['dark', 'light'];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(launchOptions);
const failures = [];

for (const theme of THEMES) {
  for (const [vpName, width, height] of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      colorScheme: theme,
      reducedMotion: 'reduce',
    });

    // Pin the theme explicitly so the shot does not depend on system preference resolution.
    await context.addInitScript((t) => {
      try {
        localStorage.setItem('theme', t);
      } catch {
        /* ignore */
      }
    }, theme);

    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') failures.push(`[console] ${page.url()} :: ${msg.text()}`);
    });
    page.on('pageerror', (err) => failures.push(`[pageerror] ${page.url()} :: ${err.message}`));

    for (const [name, route] of ROUTES) {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      const status = response?.status();
      // The 404 route is served as a normal document by the preview server.
      if (status && status >= 400 && name !== 'not-found') {
        failures.push(`[http ${status}] ${route}`);
      }
      await page.waitForTimeout(180);
      await page.screenshot({
        path: `${OUT}/${name}-${vpName}-${theme}.png`,
        fullPage: true,
      });
    }

    await context.close();
  }
}

await browser.close();

if (failures.length > 0) {
  console.error('\nRuntime problems detected while shooting:\n');
  for (const f of new Set(failures)) console.error(`  ✗ ${f}`);
  process.exitCode = 1;
} else {
  console.log(`\n✓ Clean: no console errors, no page errors, no unexpected HTTP status.`);
}

console.log(`Screenshots → ${OUT}/ (${ROUTES.length * VIEWPORTS.length * THEMES.length} files)`);
