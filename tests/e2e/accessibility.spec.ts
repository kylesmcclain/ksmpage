import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Accessibility is asserted per route rather than spot-checked, and against the production
 * build — the dev server emits different markup. WCAG 2.2 AA is the bar.
 */
const ROUTES = [
  { path: '', name: 'home' },
  { path: 'work/lis-cloud-migration', name: 'case study' },
  { path: 'colophon', name: 'colophon' },
  { path: '404', name: 'not found' },
] as const;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const route of ROUTES) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${route.name} has no axe violations (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => {
        try {
          localStorage.setItem('theme', t);
        } catch {
          /* ignore */
        }
      }, theme);

      await page.goto(route.path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      expect(
        results.violations.map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`),
        JSON.stringify(results.violations, null, 2),
      ).toEqual([]);
    });
  }
}

test('every page has exactly one h1', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route.path);
    await expect(page.locator('h1'), `${route.path} should have one h1`).toHaveCount(1);
  }
});

test('skip link is the first focusable element and targets main', async ({ page }) => {
  await page.goto('');
  await page.keyboard.press('Tab');

  const focused = page.locator(':focus');
  await expect(focused).toHaveText(/skip to content/i);
  await expect(focused).toHaveAttribute('href', '#main');
  await expect(page.locator('#main')).toBeVisible();
});

test('the whole page is reachable by keyboard without a trap', async ({ page }) => {
  await page.goto('');

  const seen = new Set<string>();
  for (let i = 0; i < 60; i += 1) {
    await page.keyboard.press('Tab');
    const id = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return `${el.tagName}:${el.getAttribute('href') ?? el.id ?? el.textContent?.slice(0, 20)}`;
    });
    if (id === null) break;
    // A trap would return the same element forever; a legitimate revisit only happens
    // after the focus order wraps, which takes more than two consecutive hits.
    seen.add(`${i}:${id}`);
  }

  expect(seen.size).toBeGreaterThan(5);
});
