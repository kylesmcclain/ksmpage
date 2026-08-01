import { expect, test } from '@playwright/test';

test('home renders the hero, all sections, and every case study card', async ({ page }) => {
  await page.goto('');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Infrastructure that stays up',
  );

  for (const id of ['work', 'approach', 'experience', 'capabilities', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }

  // Six case studies plus the satellite-office buildout.
  await expect(page.locator('#work article')).toHaveCount(7);
});

test('a case study card navigates to its detail page', async ({ page }) => {
  await page.goto('');

  const first = page.locator('#work article').first();
  const title = await first.getByRole('heading').innerText();
  await first.getByRole('link').first().click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(page.getByText('Business impact')).toBeVisible();
});

test('theme toggle switches themes and persists across navigation', async ({ page }) => {
  await page.goto('');

  const html = page.locator('html');
  const initial = await html.getAttribute('data-theme');
  const expected = initial === 'dark' ? 'light' : 'dark';

  await page.getByRole('button', { name: /switch between dark and light/i }).click();
  await expect(html).toHaveAttribute('data-theme', expected);

  await page.goto('colophon');
  await expect(html).toHaveAttribute('data-theme', expected);
});

test('the theme toggle exposes its state to assistive technology', async ({ page }) => {
  await page.goto('');

  const toggle = page.getByRole('button', { name: /switch between dark and light/i });
  const before = await toggle.getAttribute('aria-pressed');
  await toggle.click();
  await expect(toggle).not.toHaveAttribute('aria-pressed', before ?? '');
});

test('404 page renders for an unknown route', async ({ page }) => {
  const response = await page.goto('this-route-does-not-exist');
  expect(response?.status()).toBe(404);
});

test('every internal link resolves', async ({ page, baseURL }) => {
  await page.goto('');

  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((anchors) =>
      anchors
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => h.startsWith('/') && !h.startsWith('//')),
    );

  const unique = [...new Set(hrefs)];
  expect(unique.length).toBeGreaterThan(3);

  for (const href of unique) {
    const target = new URL(href, baseURL).toString();
    const response = await page.request.get(target);
    expect(response.status(), `${href} should resolve`).toBeLessThan(400);
  }
});
