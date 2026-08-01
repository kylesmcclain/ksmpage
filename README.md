# ksmpage

Infrastructure and security engineering portfolio for Kyle McClain.

The site is the portfolio's second argument. The first is the case studies; the second is
that the thing you are reading was built the way infrastructure should be built — with a
threat model, enforced invariants, and tests that fail the build when a claim stops being
true.

**Live:** https://kylesmcclain.github.io/ksmpage/

---

## What it does

- **Zero third-party requests.** No CDN, no analytics, no embedded fonts, no tag manager.
  Typefaces are resolved and downloaded at build time and served from this origin.
- **Hash-based Content-Security-Policy** on every page — `default-src 'none'` with SHA-384
  hashes for every inline script and style. No `unsafe-inline` anywhere, including for the
  pre-paint theme script.
- **No personal or client data**, enforced by a pattern-rule test suite rather than by
  remembering. Engagements are described by vertical and scale only.
- **WCAG 2.2 AA**, verified with axe-core against every route in both themes.
- **Contrast computed, not eyeballed.** Every colour pair in the token file was checked by
  converting OKLCH → sRGB → relative luminance.

## Stack

| Layer     | Choice                    | Why                                                  |
| --------- | ------------------------- | ---------------------------------------------------- |
| Framework | Astro 7, static output    | Zero client JS by default; this is a content site    |
| Language  | TypeScript, `strictest`   | Including `noUncheckedIndexedAccess`                 |
| Styling   | Tailwind CSS 4            | CSS-first `@theme` tokens in OKLCH, no config file   |
| Content   | Content collections + Zod | Every content file is schema-validated at build time |
| Unit      | Vitest                    | Content safety and formatting logic                  |
| E2E       | Playwright + axe-core     | Per-route accessibility, security, and navigation    |
| CI/CD     | GitHub Actions            | Lint, typecheck, test, build, SBOM, deploy to Pages  |

Runtime JavaScript shipped to the browser: the theme toggle. That is all.

## Getting started

```bash
nvm use              # Node 22.12+ required by Astro 7
npm ci
npm run dev          # http://localhost:4321/ksmpage
```

### Commands

| Command             | Does                                                           |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Dev server with HMR                                            |
| `npm run build`     | Production build to `dist/`                                    |
| `npm run preview`   | Serve the production build locally                             |
| `npm run verify`    | Everything CI runs: format, lint, typecheck, unit tests, build |
| `npm test`          | Unit tests                                                     |
| `npm run test:e2e`  | Playwright suite (builds first)                                |
| `npm run test:a11y` | Accessibility suite only                                       |
| `npm run sbom`      | CycloneDX SBOM into `dist/sbom.json`                           |

### Design review

The visual revision loop is scripted, because reviewing every route across three viewports
and two themes by hand is how regressions get missed:

```bash
npm run build
bash scripts/review.sh shots dark
```

This serves the production build, captures every route at desktop/tablet/mobile in both
themes, fails on any console error or unexpected HTTP status, and tears the server down. The
server's lifetime is scoped to the script deliberately — a preview server left running
between invocations will happily serve a stale `dist/`.

## Layout

```
src/
  content/            Case studies (MDX) and structured data (JSON), all schema-validated
  content.config.ts   Zod schemas — the contract for everything in content/
  components/         layout/ ui/ sections/
  layouts/            BaseLayout: head, JSON-LD, CSP-hashed theme bootstrap
  lib/                site config, formatting, the inlined theme script
  pages/              Routes
  styles/             tokens.css (design tokens) + global.css (Tailwind theme, base, utilities)
infra/                Working samples of the infrastructure the case studies describe
scripts/              Build verification and design-review harnesses
tests/                unit/ (Vitest) e2e/ (Playwright)
docs/adr/             Architecture decision records
```

## Content safety

This site describes work done for employers and their clients. Nothing that identifies a
client, locates a facility, or describes a real internal network may ship.

`tests/unit/content-safety.test.ts` enforces that mechanically: it walks every content file
and fails on IP addresses, CIDR blocks, street addresses, email addresses, phone numbers,
SSID references, credential-shaped tokens, and an explicit denylist of identifiers that
appeared in earlier drafts. It runs on pre-commit and in CI.

If you are editing content, assume the test is the specification.

## Adding a case study

1. Create `src/content/projects/<slug>.mdx`.
2. Fill the frontmatter — `src/content.config.ts` defines every required field, and the
   build fails on anything missing or malformed.
3. Describe the client by vertical and scale, never by name.
4. `npm run verify`.

## Deployment

Pushes to `main` build and deploy to GitHub Pages. The workflow reads the site URL and base
path from `actions/configure-pages`, so moving to a custom domain needs no code change —
`SITE_URL` and `BASE_PATH` drive `astro.config.mjs`.

For a host that supports response headers (Cloudflare Pages, Netlify), `public/_headers`
already contains the full set including HSTS and `frame-ancestors`. See
[SECURITY.md](SECURITY.md) for what GitHub Pages cannot deliver and why.

## Documentation

- [SECURITY.md](SECURITY.md) — threat model, guarantees, known limitations
- [docs/adr/](docs/adr/) — why the significant decisions were made
- `/colophon` on the live site — the same claims, written for a non-engineer
