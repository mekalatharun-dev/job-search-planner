import { PLAN } from '@/config/plan';

/**
 * Dates are kept as local calendar dates ("YYYY-MM-DD"), so "today" is today
 * where you are and never shifts because of UTC conversion.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function addDays(value: string, days: number): string {
  const date = parseISODate(value);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function diffInDays(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / MS_PER_DAY);
}

/** The 30 plan dates, in order. */
export function getPlanDates(): string[] {
  return Array.from({ length: PLAN.totalDays }, (_, i) => addDays(PLAN.startDate, i));
}

export const PLAN_END_DATE = addDays(PLAN.startDate, PLAN.totalDays - 1);

export type PlanPhase = 'not-started' | 'active' | 'ended';

export interface PlanStatus {
  phase: PlanPhase;
  /** 1-based day number while active; 0 before start; totalDays after end. */
  dayNumber: number;
  /** Plan days still to come after today. */
  daysRemaining: number;
  daysUntilStart: number;
  /** Days left until the offer deadline (0 on or after it). */
  daysUntilDeadline: number;
}

export function getPlanStatus(today: string): PlanStatus {
  const sinceStart = diffInDays(PLAN.startDate, today);
  const daysUntilDeadline = Math.max(0, diffInDays(today, PLAN.deadline));
  if (sinceStart < 0) {
    return { phase: 'not-started', dayNumber: 0, daysRemaining: PLAN.totalDays, daysUntilStart: -sinceStart, daysUntilDeadline };
  }
  if (sinceStart >= PLAN.totalDays) {
    return { phase: 'ended', dayNumber: PLAN.totalDays, daysRemaining: 0, daysUntilStart: 0, daysUntilDeadline };
  }
  const dayNumber = sinceStart + 1;
  return { phase: 'active', dayNumber, daysRemaining: PLAN.totalDays - dayNumber, daysUntilStart: 0, daysUntilDeadline };
}

/** 1-based plan day number for a date, or null if outside the plan. */
export function planDayNumber(date: string): number | null {
  const n = diffInDays(PLAN.startDate, date) + 1;
  return n >= 1 && n <= PLAN.totalDays ? n : null;
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', opts);
const longF = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
const shortF = fmt({ day: 'numeric', month: 'short' });
const weekdayShortF = fmt({ weekday: 'short' });
const fullF = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatDate = (v: string) => longF.format(parseISODate(v));
export const formatShortDate = (v: string) => shortF.format(parseISODate(v));
export const formatWeekdayShort = (v: string) => weekdayShortF.format(parseISODate(v));
export const formatFullDate = (v: string) => fullF.format(parseISODate(v));
