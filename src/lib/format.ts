/** Presentation helpers shared across components. Pure, and unit-tested. */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** `2022-02` → `Feb 2022`; `present` → `Present`. */
export function formatMonth(value: string): string {
  if (value === 'present') return 'Present';
  const [year, month] = value.split('-');
  const index = Number(month) - 1;
  const name = MONTHS[index];
  if (!year || name === undefined) return value;
  return `${name} ${year}`;
}

/** `2022-02` + `2025-10` → `Feb 2022 — Oct 2025`. */
export function formatRange(start: string, end: string): string {
  return `${formatMonth(start)} — ${formatMonth(end)}`;
}

/**
 * Whole years between two `YYYY-MM` markers, rounded to one decimal and expressed as a
 * human duration. Used for the tenure badge on the experience timeline.
 */
export function tenure(start: string, end: string, now: Date = new Date()): string {
  const parse = (v: string): [number, number] => {
    if (v === 'present') return [now.getFullYear(), now.getMonth() + 1];
    const [y, m] = v.split('-').map(Number);
    return [y ?? 0, m ?? 1];
  };
  const [sy, sm] = parse(start);
  const [ey, em] = parse(end);
  const months = Math.max(0, (ey - sy) * 12 + (em - sm));
  const years = Math.floor(months / 12);
  const remainder = months % 12;

  if (years === 0) return `${remainder} mo`;
  if (remainder === 0) return `${years} yr`;
  return `${years} yr ${remainder} mo`;
}

/** Two-digit section numeral: 1 → `01`. */
export function numeral(n: number): string {
  return String(n).padStart(2, '0');
}

/** Depth level → its position on a 3-step scale, for the capability meter. */
export function depthRank(depth: 'primary' | 'working' | 'familiar'): number {
  return { primary: 3, working: 2, familiar: 1 }[depth];
}

export function depthLabel(depth: 'primary' | 'working' | 'familiar'): string {
  return { primary: 'Primary', working: 'Working', familiar: 'Familiar' }[depth];
}
