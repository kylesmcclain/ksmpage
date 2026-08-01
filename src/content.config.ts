import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
// `z` re-exported from 'astro:content' is deprecated in Astro 7; import zod directly.
import { z } from 'astro/zod';

/**
 * Content-safety invariant
 * -----------------------
 * Nothing in these collections may contain client names, facility addresses, internal IP
 * addresses or subnets, SSIDs, or vendor-confidential topology. Engagements are described by
 * vertical and scale only. This is enforced in CI by `tests/unit/content-safety.test.ts`.
 */

const depth = z.enum(['primary', 'working', 'familiar']);

const vertical = z.enum([
  'Clinical Diagnostics',
  'Healthcare',
  'Financial Services',
  'Public Sector',
  'Education',
  'Managed Services',
  'Multi-Vertical',
]);

/** Long-form case studies, authored as MDX. */
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(4).max(80),
    summary: z.string().min(40).max(320),
    vertical,
    discipline: z.enum(['Infrastructure', 'Cloud & DevOps', 'Security', 'Networking']),
    /** Sort key — lower renders first. */
    order: z.number().int().nonnegative(),
    featured: z.boolean().default(false),
    /** Approximate period, deliberately coarse. No exact dates tied to an engagement. */
    period: z.string().regex(/^\d{4}(–\d{4}|–Present)?$/u, 'Use "2022" or "2022–2025"'),
    situation: z.string().min(60),
    constraint: z.string().min(40),
    outcomes: z
      .array(
        z.object({
          label: z.string().min(3).max(48),
          value: z.string().min(1).max(24),
          note: z.string().min(8).max(160),
        }),
      )
      .min(1)
      .max(4),
    businessImpact: z.string().min(60).max(600),
    stack: z.array(z.string().min(1)).min(3).max(14),
    capabilities: z.array(z.string().min(1)).min(2).max(8),
  }),
});

/** Short statements of engineering judgment. */
const principles = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/principles' }),
  schema: z.object({
    title: z.string().min(4).max(60),
    order: z.number().int().nonnegative(),
    lede: z.string().min(40).max(240),
  }),
});

/** Employment history. */
const experience = defineCollection({
  loader: file('src/content/experience.json'),
  schema: z.object({
    id: z.string(),
    role: z.string().min(4),
    org: z.string().min(2),
    start: z.string().regex(/^\d{4}-\d{2}$/u, 'Use YYYY-MM'),
    end: z.union([z.string().regex(/^\d{4}-\d{2}$/u), z.literal('present')]),
    scope: z.string().min(20).max(200),
    order: z.number().int().nonnegative(),
    highlights: z.array(z.string().min(20)).min(2).max(6),
    stack: z.array(z.string().min(1)).min(3).max(14),
    /** Case studies produced during this engagement. */
    projects: z.array(reference('projects')).default([]),
  }),
});

/** Skills taxonomy, grouped by domain. */
const skills = defineCollection({
  loader: file('src/content/skills.json'),
  schema: z.object({
    id: z.string(),
    domain: z.string().min(3).max(40),
    blurb: z.string().min(20).max(200),
    order: z.number().int().nonnegative(),
    items: z
      .array(
        z.object({
          name: z.string().min(1).max(40),
          depth,
          years: z.number().int().positive().max(20).optional(),
        }),
      )
      .min(3),
  }),
});

/** Headline metrics rendered in the hero. Each must be traceable to a case study. */
const metrics = defineCollection({
  loader: file('src/content/metrics.json'),
  schema: z.object({
    id: z.string(),
    value: z.string().min(1).max(12),
    label: z.string().min(3).max(40),
    substantiation: z.string().min(20).max(200),
    order: z.number().int().nonnegative(),
  }),
});

/**
 * Certifications and formal training.
 *
 * Intentionally empty. No credential is asserted anywhere on this site unless the person it
 * belongs to added it here — inventing one would be a résumé falsification, and the
 * Credentials section simply does not render while this list is empty.
 */
const credentials = defineCollection({
  loader: file('src/content/credentials.json'),
  schema: z.object({
    id: z.string(),
    name: z.string().min(3),
    issuer: z.string().min(2),
    year: z.number().int().min(2000).max(2030).optional(),
    status: z.enum(['held', 'in-progress']).default('held'),
    order: z.number().int().nonnegative(),
  }),
});

export const collections = { projects, principles, experience, skills, metrics, credentials };
