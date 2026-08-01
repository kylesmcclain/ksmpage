# ADR 0003 — Content safety enforced by tests, not by care

- **Status:** Accepted
- **Date:** 2026-08-01

## Context

This site describes work done for employers and their clients, in regulated industries. The
source material available when it was built contained a named third-party vendor topology
with port numbers, a facility street address, internal RFC1918 addressing for a specific
site, wireless SSIDs, and several named client systems.

None of that can be published. It is a confidentiality problem, a physical-security problem
for a real building, and — for a portfolio whose subject is trustworthiness with sensitive
systems — a self-defeating one.

Relying on the author to remember this on every future edit is not a control. It is an
intention, and intentions decay.

## Decision

Encode the rule as an executable specification. `tests/unit/content-safety.test.ts` walks
every file under `src/content/` and fails on:

- RFC1918 and public IPv4 addresses, and CIDR blocks
- US street addresses
- Email addresses and phone numbers
- SSID references
- Credential-shaped tokens (`api_key:`, `password=`, …)
- An explicit denylist of identifiers that appeared in earlier drafts

It runs on pre-commit via lefthook and in CI. A second layer in `tests/e2e/security.spec.ts`
asserts the rendered DOM contains no contact details, which catches anything introduced by a
component rather than by content.

## Consequences

**Good.** The constraint survives the author forgetting it, and survives a future
contributor who never knew it. The rule is legible: a reviewer can read the test and know
exactly what is prohibited. It also became a design constraint that improved the writing —
"a regional clinical diagnostics lab" is stronger copy than a client name would have been,
because it foregrounds the problem rather than the logo.

**Bad.** Pattern rules produce false positives. A version string like `1.2.3.4` trips the
IPv4 rule. The escape hatch is a per-rule `allow` list rather than deleting the rule.

**Accepted limitation.** This catches shapes, not meaning. It cannot detect a paraphrased
description that identifies a client to someone who knows the industry. Judgement is still
required; the test removes the mechanical failures so judgement can be spent on the rest.
