import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Content-safety guard.
 *
 * This site is public and describes work done for employers and their clients. Nothing that
 * identifies a client, locates a facility, or describes a real internal network may ship.
 * These rules are deliberately mechanical so a human editing content later cannot quietly
 * regress them — CI fails the build instead.
 */

const CONTENT_ROOT = join(process.cwd(), 'src', 'content');

interface Rule {
  readonly name: string;
  readonly pattern: RegExp;
  readonly rationale: string;
  /** Substrings that are legitimate despite matching the pattern. */
  readonly allow?: readonly string[];
}

const RULES: readonly Rule[] = [
  {
    name: 'RFC1918 IPv4 address',
    pattern: /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}(?:\.\d{1,3})?\b/gu,
    rationale: 'Internal addressing must never be published, even for a former environment.',
  },
  {
    name: 'Public IPv4 address',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/gu,
    rationale: 'Publishing a real host address is an unnecessary disclosure.',
  },
  {
    name: 'CIDR block',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}\b/gu,
    rationale: 'Subnet layout is client-confidential.',
  },
  {
    name: 'US street address',
    pattern:
      /\b\d{2,6}\s+(?:[A-Z][a-z]+\s+){1,3}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Parkway|Pkwy)\b/gu,
    rationale: 'Facility locations identify a client and are a physical-security disclosure.',
  },
  {
    name: 'Email address',
    pattern: /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gu,
    rationale:
      'Contact routing belongs in site config, not content, and must not be a personal address.',
  },
  {
    name: 'US phone number',
    pattern: /\b(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/gu,
    rationale: 'Personal contact information must not ship.',
  },
  {
    name: 'Wi-Fi SSID reference',
    pattern: /\bSSID\b|\b(?:PUBLIC|PRIVATE|GUEST)\s+(?:WiFi|Wi-Fi|WLAN)\b/giu,
    rationale: 'Named wireless networks map directly to a physical site.',
  },
  {
    name: 'Credential-shaped token',
    pattern: /\b(?:api[_-]?key|secret|password|passwd|bearer|private[_-]?key)\s*[:=]/giu,
    rationale: 'No credential-shaped material in content, even as an example.',
  },
];

/**
 * Client and facility identifiers that appeared in earlier drafts of this project and must
 * never reappear. Employer names in the author's own work history are allowed and are not
 * listed here.
 */
const FORBIDDEN_IDENTIFIERS: readonly string[] = [
  'Sonitrol',
  'Orchard Enterprise Labs',
  'PRSQRL',
  'Axeda',
  'cobas Infinity',
  'Heinz',
  'Seventh Street',
  'renegade.health',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(md|mdx|json|ya?ml)$/u.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const contentFiles = walk(CONTENT_ROOT);

describe('content safety', () => {
  it('has content to check', () => {
    expect(contentFiles.length).toBeGreaterThan(0);
  });

  describe.each(RULES)('rule: $name', (rule) => {
    it.each(contentFiles.map((f) => [relative(process.cwd(), f), f] as const))(
      'is clean in %s',
      (_label, file) => {
        const text = readFileSync(file, 'utf8');
        const matches = [...text.matchAll(rule.pattern)]
          .map((m) => m[0])
          .filter((m) => !(rule.allow ?? []).some((a) => m.includes(a)));

        expect(
          matches,
          `${rule.name} found in ${relative(process.cwd(), file)}: ${matches.join(', ')}\n${rule.rationale}`,
        ).toEqual([]);
      },
    );
  });

  it.each(contentFiles.map((f) => [relative(process.cwd(), f), f] as const))(
    'contains no forbidden client identifier in %s',
    (_label, file) => {
      const text = readFileSync(file, 'utf8').toLowerCase();
      const hits = FORBIDDEN_IDENTIFIERS.filter((id) => text.includes(id.toLowerCase()));
      expect(hits, `Forbidden client identifier(s) present: ${hits.join(', ')}`).toEqual([]);
    },
  );
});
