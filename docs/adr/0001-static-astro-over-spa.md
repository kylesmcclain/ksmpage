# ADR 0001 — Static Astro rather than a client-rendered SPA

- **Status:** Accepted
- **Date:** 2026-08-01

## Context

The previous iteration of this project was a Vite + React single-page application generated
from an AI Studio prototype. It loaded React, ReactDOM, D3, Recharts, and Lucide from a CDN
via an import map, styled itself with the Tailwind CDN script, and read a Gemini API key from
`process.env.API_KEY` at build time.

Three problems, in ascending order of seriousness:

1. Roughly 400 KB of JavaScript to render what is fundamentally a document.
2. Every page load depended on a third-party CDN staying up and staying honest.
3. A static site cannot hold a secret. Any API key inlined at build time is readable by
   anyone who views source. For a portfolio whose central claim is security competence, that
   is not a detail.

## Decision

Rebuild as a statically generated Astro site with no client-side framework runtime.
Interactive behaviour is limited to a theme toggle, written as a plain script.

## Consequences

**Good.** No framework runtime reaches the browser. No third-party origin is contacted, which
makes a `default-src 'none'` CSP achievable. Content becomes schema-validated files rather
than a TypeScript constant. The output is plain HTML that any static host will serve, and
that degrades to readable text with JavaScript disabled.

**Bad.** Rich client-side interaction — a filterable project index, an animated network
graph — now costs an explicit decision to hydrate an island rather than coming for free.
That trade is accepted: the audience is hiring managers reading prose, not users operating
an application.

**Also.** The Gemini integration was removed rather than moved. It existed to generate text
at runtime, which a portfolio does not need, and any serverless replacement would introduce
the hosting dependency this decision exists to avoid.
