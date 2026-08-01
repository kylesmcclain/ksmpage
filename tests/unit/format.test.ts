import { describe, expect, it } from 'vitest';
import {
  depthLabel,
  depthRank,
  formatMonth,
  formatRange,
  numeral,
  tenure,
} from '../../src/lib/format';

describe('formatMonth', () => {
  it('renders a YYYY-MM marker as an abbreviated month and year', () => {
    expect(formatMonth('2022-02')).toBe('Feb 2022');
    expect(formatMonth('2013-06')).toBe('Jun 2013');
    expect(formatMonth('2025-12')).toBe('Dec 2025');
  });

  it('renders the present sentinel', () => {
    expect(formatMonth('present')).toBe('Present');
  });

  it('returns the input unchanged when the month is out of range', () => {
    expect(formatMonth('2022-13')).toBe('2022-13');
    expect(formatMonth('2022-00')).toBe('2022-00');
  });

  it('returns the input unchanged when the shape is unrecognised', () => {
    expect(formatMonth('nonsense')).toBe('nonsense');
  });
});

describe('formatRange', () => {
  it('joins both ends with an em dash', () => {
    expect(formatRange('2022-02', '2025-10')).toBe('Feb 2022 — Oct 2025');
  });

  it('handles an open-ended range', () => {
    expect(formatRange('2022-02', 'present')).toBe('Feb 2022 — Present');
  });
});

describe('tenure', () => {
  it('computes whole years and remaining months', () => {
    expect(tenure('2022-02', '2025-10')).toBe('3 yr 8 mo');
    expect(tenure('2017-10', '2022-02')).toBe('4 yr 4 mo');
  });

  it('omits the month component on an exact year boundary', () => {
    expect(tenure('2020-01', '2023-01')).toBe('3 yr');
  });

  it('renders sub-year spans in months only', () => {
    expect(tenure('2024-01', '2024-07')).toBe('6 mo');
  });

  it('measures an open range against the supplied clock, not the wall clock', () => {
    expect(tenure('2020-01', 'present', new Date('2026-01-15T00:00:00Z'))).toBe('6 yr');
  });

  it('never returns a negative span for an inverted range', () => {
    expect(tenure('2025-01', '2020-01')).toBe('0 mo');
  });
});

describe('numeral', () => {
  it('zero-pads to two digits', () => {
    expect(numeral(1)).toBe('01');
    expect(numeral(9)).toBe('09');
  });

  it('leaves wider numbers intact', () => {
    expect(numeral(10)).toBe('10');
    expect(numeral(100)).toBe('100');
  });
});

describe('depth', () => {
  it('ranks depth levels so they can be sorted', () => {
    expect(depthRank('primary')).toBeGreaterThan(depthRank('working'));
    expect(depthRank('working')).toBeGreaterThan(depthRank('familiar'));
  });

  it('labels each level for display', () => {
    expect(depthLabel('primary')).toBe('Primary');
    expect(depthLabel('working')).toBe('Working');
    expect(depthLabel('familiar')).toBe('Familiar');
  });
});
