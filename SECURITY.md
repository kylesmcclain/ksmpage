# Security

This repository builds a public, static personal site. There is no backend, no database, no
authentication, and no user data. The realistic threat model is therefore narrow — but the
site makes explicit security claims about itself, so those claims are tested rather than
asserted.

## Reporting a vulnerability

Open a [private security advisory](https://github.com/kylesmcclain/ksmpage/security/advisories/new)
rather than a public issue. Expect an acknowledgement within a week.

If you have found sensitive information that should not be published — a client name, an
address, an internal hostname, a network detail — please report it privately and it will be
removed promptly. The content-safety test suite exists to prevent exactly this, but a
pattern-based check cannot catch everything.

## What this site guarantees

| Property                     | How it is enforced                                                         | How to verify                                |
| ---------------------------- | -------------------------------------------------------------------------- | -------------------------------------------- |
| No third-party requests      | Fonts resolved and self-hosted at build time; no CDN, analytics, or embeds | `scripts/verify-build-output.mjs`, run in CI |
| Hash-based CSP on every page | `security.csp` in `astro.config.mjs`, SHA-384, no `unsafe-*`               | `tests/e2e/security.spec.ts`                 |
| No personal contact data     | Pattern rules over all content files                                       | `tests/unit/content-safety.test.ts`          |
| No client-identifying data   | Pattern rules plus an explicit denylist                                    | `tests/unit/content-safety.test.ts`          |
| WCAG 2.2 AA                  | axe-core against every route in both themes                                | `tests/e2e/accessibility.spec.ts`            |
| Outbound links hardened      | `rel="noopener noreferrer"` asserted on every `target="_blank"`            | `tests/e2e/security.spec.ts`                 |

## The inline script exception

One script must run before first paint: the theme bootstrap, which prevents a flash of the
wrong colour scheme. Astro only hashes the scripts it compiles, so an `is:inline` script
would be blocked by our own policy.

Rather than weaken the policy with `unsafe-inline`, the script body lives in
`src/lib/theme-init.mjs` as a single exported string. `BaseLayout.astro` inlines exactly
those bytes; `astro.config.mjs` hashes exactly those bytes into
`security.csp.scriptDirective.hashes`. Because both derive from one module, the hash cannot
drift from the source — and if anyone edits the script, the build produces a matching hash
automatically.

## Known limitations

**GitHub Pages cannot serve custom response headers.** `Strict-Transport-Security`,
`frame-ancestors`, and `Permissions-Policy` cannot be delivered from a `<meta>` tag; browsers
ignore the latter two in meta form and the first is header-only. A complete `public/_headers`
file ships with the build so the full header set applies the moment the site moves to a host
that reads it (Cloudflare Pages, Netlify). This gap is documented on the site's own colophon
rather than quietly omitted.

**Three GitHub Actions remain on version tags.** A mutable tag can be repointed at arbitrary
code by whoever controls the action's repository, so every action here is pinned to an
immutable commit SHA instead — and each SHA was taken from this repository's own runner
logs (`Download action repository '<action>' (SHA:...)`), meaning GitHub resolved it, not a
human guessing.

The exceptions are `actions/configure-pages`, `actions/upload-pages-artifact`, and
`actions/deploy-pages` in `deploy.yml`. That workflow has never run — GitHub Pages is not
enabled yet — so no digest has been observed for them. They will be pinned from the first
deploy run's logs. A guessed SHA would be worse than an honest tag.

## Dependency posture

- `npm ci` against a committed lockfile — no floating resolution at build time.
- Dependabot for npm and GitHub Actions, grouped so majors stay reviewable.
- CodeQL on push, pull request, and weekly.
- A CycloneDX SBOM is generated on every build and published with the site at `/sbom.json`.
- Runtime dependencies are deliberately few. The site ships no client-side framework code:
  React is present for future interactive islands but no island is currently hydrated.
