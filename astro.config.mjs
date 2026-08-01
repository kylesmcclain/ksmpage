// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { createHash } from 'node:crypto';
import { THEME_INIT_SOURCE } from './src/lib/theme-init.mjs';

/**
 * SHA-384 of the exact bytes BaseLayout inlines. Computed at config time, never at render.
 * The annotation is required: Astro's CSP hash type is the template literal
 * `sha384-${string}`, which a plain string does not satisfy.
 *
 * @type {`sha384-${string}`}
 */
const THEME_INIT_HASH = `sha384-${createHash('sha384').update(THEME_INIT_SOURCE, 'utf8').digest('base64')}`;

/**
 * Deployment is environment-driven so the same build works for:
 *   - GitHub Pages project site  → SITE_URL=https://<user>.github.io  BASE_PATH=/ksmpage
 *   - Custom apex domain         → SITE_URL=https://example.com       BASE_PATH=/
 * Defaults target the GitHub Pages project site.
 */
const SITE_URL = process.env['SITE_URL'] ?? 'https://kylesmcclain.github.io';
const BASE_PATH = process.env['BASE_PATH'] ?? '/ksmpage';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  output: 'static',
  compressHTML: true,

  build: {
    // Emit `about/index.html` rather than `about.html` so URLs stay clean on static hosts.
    format: 'directory',
    inlineStylesheets: 'auto',
  },

  /**
   * Astro 7 ships hash-based CSP as a stable feature. For a static site this is the only
   * way to get a real Content-Security-Policy without a server in front: Astro hashes every
   * inline script/style it emits and writes a <meta http-equiv="content-security-policy">.
   *
   * Directives that browsers ignore in meta form (frame-ancestors, report-uri) are delivered
   * via `public/_headers` instead, for hosts that support it. See SECURITY.md.
   */
  security: {
    csp: {
      algorithm: 'SHA-384',
      directives: [
        "default-src 'none'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "base-uri 'none'",
        "form-action 'none'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        // The pre-paint theme bootstrap is inlined verbatim by BaseLayout. Astro does not
        // hash `is:inline` scripts, so we supply the hash from the same module the layout
        // reads its source from. See src/lib/theme-init.mjs.
        hashes: [THEME_INIT_HASH],
      },
    },
  },

  /**
   * Fonts are resolved and downloaded at build time, then served from our own origin.
   * That keeps `font-src 'self'` intact and removes a third-party request on first paint.
   */
  fonts: [
    {
      // Variable range rather than discrete weights: the type scale uses non-integer
      // weights (510 / 585 / 620), which only a continuous axis can render.
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.google(),
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
    },
    {
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      provider: fontProviders.google(),
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
    },
    {
      // Used in exactly two places sitewide (hero clause, pull quotes). Italic only —
      // anything more and the page starts reading as a personal blog.
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      provider: fontProviders.google(),
      weights: ['400'],
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['ui-serif', 'Georgia', 'serif'],
    },
  ],

  markdown: {
    // Shiki themes emit inline `style` attributes on every token, which a hash-based CSP
    // cannot cover. Prism emits class names against a stylesheet instead, so code samples
    // stay highlighted without weakening the policy with 'unsafe-inline'.
    syntaxHighlight: 'prism',
  },

  image: {
    responsiveStyles: true,
    layout: 'constrained',
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: 'lightningcss',
      sourcemap: false,
    },
  },
});
