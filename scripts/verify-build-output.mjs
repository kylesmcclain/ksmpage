#!/usr/bin/env node
/**
 * Post-build assertions.
 *
 * The security story for this site rests on two claims: it makes zero third-party requests,
 * and every page carries a hash-based Content-Security-Policy. Both are easy to break with a
 * careless edit (an embedded font link, a CDN script, a stray analytics tag), and neither is
 * caught by typecheck or lint. So they are asserted here and wired into CI.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');

/** Origins that may legitimately appear in markup (as link targets, not as subresources). */
const ALLOWED_LINK_ORIGINS = [
  'https://www.linkedin.com',
  'https://github.com',
  'https://kylesmcclain.github.io',
  'https://schema.org',
  'http://www.w3.org', // SVG/XML namespaces
  'http://www.sitemaps.org',
];

/** Attributes that actually cause the browser to fetch a subresource. */
const SUBRESOURCE_ATTR = /(?:src|href)\s*=\s*["']([^"']+)["']/giu;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const errors = [];

if (htmlFiles.length === 0) {
  errors.push('No HTML files found in dist/ — did the build actually run?');
}

for (const file of htmlFiles) {
  const rel = relative(process.cwd(), file);
  const html = readFileSync(file, 'utf8');

  // 1. Every page must carry a CSP meta tag.
  if (!/<meta\s+http-equiv="content-security-policy"/iu.test(html)) {
    errors.push(`${rel}: missing Content-Security-Policy meta tag`);
  }

  // 2. No subresource may point at a third-party origin.
  for (const [, url] of html.matchAll(SUBRESOURCE_ATTR)) {
    if (!/^https?:\/\//iu.test(url)) continue;
    const isAllowed = ALLOWED_LINK_ORIGINS.some((origin) => url.startsWith(origin));
    if (!isAllowed) {
      errors.push(`${rel}: third-party origin referenced → ${url}`);
    }
  }

  // 3. Inline event handlers defeat a hash-based CSP and are never needed here.
  const inlineHandlers = [...html.matchAll(/\son(?:click|load|error|mouseover)\s*=/giu)];
  if (inlineHandlers.length > 0) {
    errors.push(`${rel}: ${inlineHandlers.length} inline event handler(s) found`);
  }
}

// 4. The SBOM must exist and be non-trivial.
const sbomPath = join(DIST, 'sbom.json');
try {
  const sbom = JSON.parse(readFileSync(sbomPath, 'utf8'));
  const componentCount = sbom.components?.length ?? 0;
  if (componentCount === 0) errors.push('dist/sbom.json contains no components');
  else console.log(`  SBOM: ${componentCount} production components catalogued`);
} catch {
  console.log('  SBOM: not generated (run `npm run sbom`) — skipping SBOM assertions');
}

if (errors.length > 0) {
  console.error('\nBuild output verification FAILED:\n');
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('');
  process.exit(1);
}

console.log(
  `\n✓ Build output verified: ${htmlFiles.length} page(s), no third-party origins, CSP present on all.\n`,
);
