/**
 * Single source of truth for identity, navigation, and outbound links.
 *
 * Deliberately contains no email address, phone number, or physical location. A public page
 * is a scraping surface, and none of that information is needed to evaluate the work — contact
 * routes through LinkedIn instead. See `tests/unit/content-safety.test.ts`.
 */

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export interface SocialLink {
  readonly href: string;
  readonly label: string;
  readonly handle: string;
}

export const SITE = {
  name: 'Kyle McClain',
  role: 'Infrastructure & Security Systems Engineer',
  shortRole: 'Systems Administrator',
  title: 'Kyle McClain — Infrastructure & Security Systems Engineer',
  // Kept under 160 characters so search results do not truncate it mid-claim.
  description:
    'Infrastructure and security engineer across healthcare, finance, and public sector. 99.9% uptime, HIPAA-scoped cloud, zero-downtime cutovers.',
  tagline: 'Infrastructure that stays up when the stakes are clinical.',
  locale: 'en_US',
  /** Years of professional experience, computed from the first role's start date. */
  since: 2013,
} as const;

export const NAV: readonly NavItem[] = [
  { href: '/#work', label: 'Work' },
  { href: '/#approach', label: 'Approach' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#capabilities', label: 'Capabilities' },
  { href: '/colophon', label: 'Colophon' },
];

/**
 * Outbound profile links. `linkedin` is intentionally left unset until the real handle is
 * supplied — shipping a placeholder URL is worse than omitting the link, and the JSON-LD
 * `sameAs` array drops it rather than asserting a profile that does not exist.
 */
export const SOCIALS: readonly SocialLink[] = [
  {
    href: 'https://github.com/kylesmcclain',
    label: 'GitHub',
    handle: 'kylesmcclain',
  },
];

/** Total years of experience, recomputed at build time rather than hard-coded into copy. */
export function yearsOfExperience(now: Date = new Date()): number {
  return now.getFullYear() - SITE.since;
}

/**
 * Resolve a site-relative path against the configured `base`, without producing the
 * double slashes that `${base}${path}` yields when base is '/'.
 */
export function url(path: string, base: string = import.meta.env.BASE_URL): string {
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalisedPath}` || '/';
}
