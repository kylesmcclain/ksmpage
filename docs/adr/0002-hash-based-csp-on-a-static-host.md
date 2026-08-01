# ADR 0002 — Hash-based CSP delivered by meta tag

- **Status:** Accepted
- **Date:** 2026-08-01

## Context

GitHub Pages serves no custom response headers. The usual advice — "set a
Content-Security-Policy header" — is simply unavailable, and much of the writing on this
subject either ignores that or recommends `unsafe-inline`, which makes the policy decorative.

Astro 7 ships CSP support that hashes every inline script and style it compiles and emits a
`<meta http-equiv="content-security-policy">` element. That covers `script-src` and
`style-src`, which is where the actual risk is.

One complication: the theme bootstrap must run synchronously in `<head>` before first paint,
or the page flashes the wrong colour scheme. A bundled script is deferred. An `is:inline`
script is passed through untouched by Astro and therefore never hashed — it would be blocked
by our own policy. This was verified empirically: adding an `is:inline` script produced no
new hash in the emitted CSP.

## Decision

Enable `security.csp` with `default-src 'none'` and an explicit allowlist.

Own the theme script's hash directly. The script body lives in `src/lib/theme-init.mjs` as a
single exported string. `BaseLayout.astro` inlines exactly those bytes via `set:html`;
`astro.config.mjs` imports the same constant, computes its SHA-384 at config time, and passes
it to `security.csp.scriptDirective.hashes`.

Ship a complete `public/_headers` for hosts that read it, and document the gap on the site
itself.

## Consequences

**Good.** A genuinely strict policy on a static host, with no `unsafe-*` directive anywhere.
Because both the layout and the config derive from one module, the hash cannot drift from the
source — editing the script regenerates a matching hash automatically. The policy caught two
real bugs during development: inline `style` attributes on the grain overlay and the hero
glow, which CSP hashes cannot cover and which are now stylesheet rules.

**Bad.** `frame-ancestors`, `Strict-Transport-Security`, and `Permissions-Policy` cannot be
delivered by meta tag. On GitHub Pages this site is clickjackable. `public/_headers` closes
the gap the moment it moves to Cloudflare Pages or Netlify. Stating this is more useful than
implying complete coverage.

**Also.** Shiki syntax highlighting is incompatible with a hash-based CSP — it emits inline
`style` on every token. Markdown highlighting uses Prism, which emits class names against a
stylesheet.
