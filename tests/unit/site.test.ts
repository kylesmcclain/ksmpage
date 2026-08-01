import { describe, expect, it } from 'vitest';
import { NAV, SITE, SOCIALS, url, yearsOfExperience } from '../../src/lib/site';

/**
 * `url()` is small but it is the function that decides whether the deployed site's links
 * work at all. It has already been the source of one real bug: resolving a leading-slash
 * path against a base-containing URL silently discards the base, which 404'd every asset.
 * These cases pin the behaviour down.
 */
describe('url', () => {
  it('joins a path onto a project base path', () => {
    expect(url('/work', '/ksmpage')).toBe('/ksmpage/work');
    expect(url('/colophon', '/ksmpage')).toBe('/ksmpage/colophon');
  });

  it('tolerates a trailing slash on the base without doubling it', () => {
    expect(url('/work', '/ksmpage/')).toBe('/ksmpage/work');
  });

  it('tolerates a path with no leading slash', () => {
    expect(url('work', '/ksmpage')).toBe('/ksmpage/work');
  });

  it('produces a root-relative path when the site is served from the domain root', () => {
    expect(url('/work', '/')).toBe('/work');
    expect(url('work', '/')).toBe('/work');
  });

  it('never produces an empty href for the site root', () => {
    // '' would resolve against the current document rather than the site root.
    expect(url('/', '/')).toBe('/');
    expect(url('/', '/ksmpage')).toBe('/ksmpage/');
  });

  it('preserves hash fragments used for same-page navigation', () => {
    expect(url('/#work', '/ksmpage')).toBe('/ksmpage/#work');
    expect(url('/#work', '/')).toBe('/#work');
  });

  it('falls back to the configured base when none is passed', () => {
    // Exercises the default parameter rather than asserting a particular deployment.
    expect(url('/work')).toMatch(/\/work$/u);
  });
});

describe('yearsOfExperience', () => {
  it('counts from the first professional year against the supplied clock', () => {
    expect(yearsOfExperience(new Date('2026-08-01T00:00:00Z'))).toBe(2026 - SITE.since);
    expect(yearsOfExperience(new Date('2030-01-01T00:00:00Z'))).toBe(2030 - SITE.since);
  });

  it('is a positive figure for the current year', () => {
    expect(yearsOfExperience()).toBeGreaterThan(0);
  });
});

describe('site metadata', () => {
  it('exposes a title and description within search-result limits', () => {
    expect(SITE.title.length).toBeLessThanOrEqual(70);
    expect(SITE.description.length).toBeGreaterThan(80);
    expect(SITE.description.length).toBeLessThanOrEqual(165);
  });

  it('publishes no contact details in site config', () => {
    const serialised = JSON.stringify({ SITE, NAV, SOCIALS });
    expect(serialised).not.toMatch(/[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/u);
    expect(serialised).not.toMatch(/\b(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/u);
  });

  it('has navigation entries that all point somewhere', () => {
    expect(NAV.length).toBeGreaterThan(0);
    for (const item of NAV) {
      expect(item.href.startsWith('/')).toBe(true);
      expect(item.label.length).toBeGreaterThan(1);
    }
  });

  it('only lists profile links over https', () => {
    for (const social of SOCIALS) {
      expect(social.href.startsWith('https://')).toBe(true);
      expect(social.handle.length).toBeGreaterThan(0);
    }
  });
});
