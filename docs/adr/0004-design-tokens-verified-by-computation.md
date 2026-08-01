# ADR 0004 — Contrast verified by computation, not by eye

- **Status:** Accepted
- **Date:** 2026-08-01

## Context

The palette was designed dark-first in OKLCH, with neutrals anchored to a single hue at low
chroma. The obvious pairs were checked and passed. The pairs that were not checked failed,
and two failed badly enough to be shipping bugs:

- `--accent` and `--success` were both pinned at L=0.720. Measured contrast **between them**
  was 1.01:1, and 1.02:1 under deuteranopia simulation. Roughly 8% of male viewers could not
  have distinguished the interactive colour from the healthy colour — and both appeared in
  the same regions of the page.
- The light palette was tuned against `#ffffff` only. On its own card surfaces it failed:
  `--warn` measured 4.31:1 on `--surface-2`, the surface badges actually sit on.

Separately, `--accent` at L=0.72 gives white text 2.36:1. Any implementer's default instinct
is white-on-accent, and nothing in the system prevented it.

## Decision

Verify every token pair by converting OKLCH → sRGB → relative luminance and computing the
WCAG ratio, rather than trusting the design tool.

Resulting changes:

- `--success` moved to L=0.82 (accent/success separation 1.01 → 1.43).
- All four light-mode semantic tokens dropped to L=0.45, which clears 4.5:1 on every surface
  level rather than only on white.
- `--text-faint` raised to L=0.615 dark / 0.545 light so it clears AA wherever it is reused,
  instead of being a token with a usage caveat nobody will remember.
- Added `--on-accent`, documented as the only legal foreground for an accent fill.
- Added `--border-control` at 40% alpha (3.5:1) for anything bounding a control. The 7/11/18%
  hairlines remain, restricted to decorative dividers, which WCAG 1.4.11 exempts.

The focus ring was also rewritten from a `box-shadow` double-ring to `outline` +
`outline-offset`: the blanket box-shadow overwrote the inset hairline that gave cards their
only boundary, so a card lost its edge at the moment it gained focus.

## Consequences

**Good.** The palette is defensible with numbers rather than opinion. axe-core reports zero
violations across every route in both themes. Status is never encoded by colour alone.

**Bad.** Dark-mode `--success` at L=0.82 is brighter than a purely aesthetic choice would be.
That is the correct trade — the alternative was a colour 8% of viewers cannot distinguish
from the accent.

**Process.** The verification script is small enough to rerun on any token change, and doing
so is cheaper than discovering the problem in an accessibility audit.
