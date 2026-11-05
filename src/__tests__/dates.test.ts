import { PLAN_END_DATE, addDays, diffInDays, getPlanDates, getPlanStatus, parseISODate, planDayNumber, toISODate } from '@/lib/dates';

describe('date helpers', () => {
  it('round-trips local dates without timezone shift', () => {
    expect(toISODate(parseISODate('2026-11-06'))).toBe('2026-11-06');
  });
  it('adds days across month boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
  });
  it('counts days between dates', () => {
    expect(diffInDays('2026-11-06', '2026-12-06')).toBe(30);
  });
});

describe('plan dates', () => {
  it('has exactly 30 days from 6 Nov to 5 Dec', () => {
    const dates = getPlanDates();
    expect(dates).toHaveLength(30);
    expect(dates[0]).toBe('2026-11-06');
    expect(dates.at(-1)).toBe('2026-12-05');
    expect(PLAN_END_DATE).toBe('2026-12-05');
    expect(new Set(dates).size).toBe(30);
  });
  it('numbers plan days', () => {
    expect(planDayNumber('2026-11-06')).toBe(1);
    expect(planDayNumber('2026-12-05')).toBe(30);
    expect(planDayNumber('2026-11-05')).toBeNull();
    expect(planDayNumber('2026-12-06')).toBeNull();
  });
});

describe('getPlanStatus', () => {
  it('before the start', () => {
    expect(getPlanStatus('2026-11-05')).toMatchObject({ phase: 'not-started', daysUntilStart: 1, daysUntilDeadline: 31 });
  });
  it('on day 1', () => {
    expect(getPlanStatus('2026-11-06')).toMatchObject({ phase: 'active', dayNumber: 1, daysRemaining: 29 });
  });
  it('on day 30', () => {
    expect(getPlanStatus('2026-12-05')).toMatchObject({ phase: 'active', dayNumber: 30, daysRemaining: 0, daysUntilDeadline: 1 });
  });
  it('on the deadline', () => {
    expect(getPlanStatus('2026-12-06')).toMatchObject({ phase: 'ended', daysUntilDeadline: 0 });
  });
});
