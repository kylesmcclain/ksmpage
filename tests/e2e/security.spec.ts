import { expect, test } from '@playwright/test';

/**
 * The security posture is a claim this site makes about itself on /colophon. These tests are
 * what make it a verified claim rather than a marketing line.
 */
const ROUTES = ['', 'work/lis-cloud-migration', 'colophon'] as const;

test.describe('content security policy', () => {
  for (const route of ROUTES) {
    test(`${route} ships a hash-based CSP with no unsafe directives`, async ({ page }) => {
      await page.goto(route);

      const csp = await page
        .locator('meta[http-equiv="content-security-policy"]')
        .getAttribute('content');

      expect(csp, 'CSP meta tag must be present').toBeTruthy();
      expect(csp).toContain("default-src 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'none'");
      expect(csp).toMatch(/script-src[^;]*'sha384-/u);
      expect(csp).toMatch(/style-src[^;]*'sha384-/u);

      // The entire point of hashing is to avoid these.
      expect(csp).not.toContain('unsafe-inline');
      expect(csp).not.toContain('unsafe-eval');
      expect(csp).not.toContain('unsafe-hashes');
    });
  }
});

test('no request leaves the origin', async ({ page }) => {
  const offOrigin: string[] = [];

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== 'localhost' && url.protocol !== 'data:') {
      offOrigin.push(request.url());
    }
  });

  await page.goto('', { waitUntil: 'networkidle' });

  expect(offOrigin, `Third-party requests: ${offOrigin.join(', ')}`).toEqual([]);
});

test('the page renders with zero CSP violations reported', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && /content security policy/iu.test(msg.text())) {
      violations.push(msg.text());
    }
  });

  await page.goto('', { waitUntil: 'networkidle' });
  await page.goto('colophon', { waitUntil: 'networkidle' });

  expect(violations).toEqual([]);
});

test('outbound links are hardened against reverse tabnabbing', async ({ page }) => {
  await page.goto('');

  const externalLinks = page.locator('a[target="_blank"]');
  const count = await externalLinks.count();

  for (let i = 0; i < count; i += 1) {
    const rel = (await externalLinks.nth(i).getAttribute('rel')) ?? '';
    expect(rel, `link ${i} must carry noopener`).toContain('noopener');
    expect(rel, `link ${i} must carry noreferrer`).toContain('noreferrer');
  }
});

test('no personal contact details are exposed in the DOM', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const text = await page.locator('body').innerText();

    expect(text, `${route} must not contain an email address`).not.toMatch(
      /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/u,
    );
    expect(text, `${route} must not contain a phone number`).not.toMatch(
      /\b(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/u,
    );
  }
});
