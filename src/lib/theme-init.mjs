/**
 * Pre-paint theme bootstrap.
 *
 * This has to run synchronously in `<head>`, before the body renders — a bundled `<script>`
 * is deferred and produces a visible flash of the wrong theme. Astro only hashes scripts it
 * compiles, and an `is:inline` script is passed through untouched, so it would be blocked by
 * our own Content-Security-Policy unless we supply the hash ourselves.
 *
 * The solution is this single source of truth: `BaseLayout.astro` inlines exactly these bytes
 * via `set:html`, and `astro.config.mjs` hashes exactly these bytes into
 * `security.csp.scriptDirective.hashes`. The hash therefore cannot drift from the source.
 *
 * Kept as a plain string (not a file read) so it survives bundling into the prerender output,
 * and free of Node APIs so importing it from a `.astro` component costs nothing.
 *
 * Sets `data-theme` (not a class) to match the token file, and mirrors the choice into
 * `color-scheme` so native form controls, scrollbars, and the caret follow along.
 */
export const THEME_INIT_SOURCE = `(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.setAttribute("data-theme",d?"dark":"light");e.style.colorScheme=d?"dark":"light"}catch(_){}})();`;
