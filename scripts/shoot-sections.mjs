#!/usr/bin/env node
/**
 * Section-level design review.
 *
 * `shoot.mjs` captures whole pages, which is the right altitude for judging rhythm and
 * balance but too small to judge type, spacing, and hairline weight. This captures each
 * landmark at viewport scale instead.
 *
 * Usage: node scripts/shoot-sections.mjs <outDir> [dark|light]
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';

const PREINSTALLED = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const launchOptions = existsSync(PREINSTALLED) ? { executablePath: PREINSTALLED } : {};

const BASE = process.env.SHOOT_BASE ?? 'http://localhost:4321/ksmpage';
const OUT = process.argv[2] ?? 'shots-sections';
const theme = process.argv[3] ?? 'dark';

const SECTIONS = [
  ['work', '#work'],
  ['approach', '#approach'],
  ['experience', '#experience'],
  ['capabilities', '#capabilities'],
  ['contact', '#contact'],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: theme,
  reducedMotion: 'reduce',
});
await context.addInitScript((t) => {
  try {
    localStorage.setItem('theme', t);
  } catch {
    /* ignore */
  }
}, theme);

const page = await context.newPage();
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/00-hero-${theme}.png` });

for (const [name, selector] of SECTIONS) {
  const el = await page.$(selector);
  if (!el) {
    console.warn(`missing section: ${selector}`);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${name}-${theme}.png` });
}

// Case-study detail: the densest layout on the site.
await page.goto(`${BASE}/work/lis-cloud-migration`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/case-top-${theme}.png` });

await browser.close();
console.log(`Section shots → ${OUT}/`);
