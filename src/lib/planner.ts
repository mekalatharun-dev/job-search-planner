import { DAILY_TARGETS, PLAN } from '@/config/plan';
import { getPlanDates } from './dates';

/**
 * Planner data and the pure functions that read and update it.
 * Nothing here marks a task complete on its own — only toggleTask does,
 * and only when you click.
 */

export interface CustomTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DayRecord {
  /** Keys of default daily targets you ticked. */
  done: string[];
  custom: CustomTask[];
}

export interface PlannerState {
  version: 1;
  days: Record<string, DayRecord>;
}

export interface PlanTask {
  id: string;
  title: string;
  completed: boolean;
  isCustom: boolean;
}

export interface Summary {
  done: number;
  total: number;
  percent: number;
}

export type DayTiming = 'past' | 'today' | 'future';

export const MAX_TASK_TITLE = 120;

export function createEmptyState(): PlannerState {
  return { version: 1, days: {} };
}

function getDay(state: PlannerState, date: string): DayRecord {
  return state.days[date] ?? { done: [], custom: [] };
}

function withDay(state: PlannerState, date: string, day: DayRecord): PlannerState {
  return { ...state, days: { ...state.days, [date]: day } };
}

export function dayTiming(date: string, today: string): DayTiming {
  if (date < today) return 'past';
  if (date > today) return 'future';
  return 'today';
}

export function getDayTasks(state: PlannerState, date: string): PlanTask[] {
  const day = getDay(state, date);
  return [
    ...DAILY_TARGETS.map((t) => ({ id: t.key, title: t.title, completed: day.done.includes(t.key), isCustom: false })),
    ...day.custom.map((c) => ({ id: c.id, title: c.title, completed: c.completed, isCustom: true })),
  ];
}

export function summarize(tasks: PlanTask[]): Summary {
  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

function combine(summaries: Summary[]): Summary {
  const done = summaries.reduce((n, s) => n + s.done, 0);
  const total = summaries.reduce((n, s) => n + s.total, 0);
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function daySummary(state: PlannerState, date: string): Summary {
  return summarize(getDayTasks(state, date));
}

export function toggleTask(state: PlannerState, date: string, taskId: string): PlannerState {
  const day = getDay(state, date);
  const isDefault = DAILY_TARGETS.some((t) => t.key === taskId);
  if (isDefault) {
    const done = day.done.includes(taskId) ? day.done.filter((k) => k !== taskId) : [...day.done, taskId];
    return withDay(state, date, { ...day, done });
  }
  if (!day.custom.some((c) => c.id === taskId)) return state;
  return withDay(state, date, {
    ...day,
    custom: day.custom.map((c) => (c.id === taskId ? { ...c, completed: !c.completed } : c)),
  });
}

export function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Adds a custom task. Returns the same state if the title is blank. */
export function addCustomTask(state: PlannerState, date: string, title: string, id: string = makeId()): PlannerState {
  const clean = title.trim().slice(0, MAX_TASK_TITLE);
  if (!clean) return state;
  const day = getDay(state, date);
  return withDay(state, date, { ...day, custom: [...day.custom, { id, title: clean, completed: false }] });
}

export function removeCustomTask(state: PlannerState, date: string, id: string): PlannerState {
  const day = getDay(state, date);
  return withDay(state, date, { ...day, custom: day.custom.filter((c) => c.id !== id) });
}

export interface MissedDay {
  date: string;
  tasks: PlanTask[];
}

/** Unticked tasks on plan days before today, oldest first. */
export function getMissedTasks(state: PlannerState, today: string): MissedDay[] {
  return getPlanDates()
    .filter((d) => d < today)
    .map((date) => ({ date, tasks: getDayTasks(state, date).filter((t) => !t.completed) }))
    .filter((m) => m.tasks.length > 0);
}

export interface WeekProgress {
  week: number;
  label: string;
  dates: string[];
  /** All tasks in the week, including days still to come. */
  summary: Summary;
  /** Only days up to and including today. */
  soFar: Summary;
  daysElapsed: number;
}

export function getWeeklyProgress(state: PlannerState, today: string): WeekProgress[] {
  const dates = getPlanDates();
  const weeks: WeekProgress[] = [];
  for (let i = 0; i < dates.length; i += 7) {
    const weekDates = dates.slice(i, i + 7);
    const elapsed = weekDates.filter((d) => d <= today);
    weeks.push({
      week: weeks.length + 1,
      label: `Week ${weeks.length + 1}`,
      dates: weekDates,
      summary: combine(weekDates.map((d) => daySummary(state, d))),
      soFar: combine(elapsed.map((d) => daySummary(state, d))),
      daysElapsed: elapsed.length,
    });
  }
  return weeks;
}

export function getOverallProgress(state: PlannerState, today: string): { soFar: Summary; plan: Summary } {
  const dates = getPlanDates();
  return {
    soFar: combine(dates.filter((d) => d <= today).map((d) => daySummary(state, d))),
    plan: combine(dates.map((d) => daySummary(state, d))),
  };
}

/** Consecutive fully completed plan days ending today (or yesterday, if today isn't finished yet). */
export function getStreak(state: PlannerState, today: string): number {
  const dates = getPlanDates().filter((d) => d <= today);
  if (dates.length && dates.at(-1) === today && daySummary(state, today).percent < 100) dates.pop();
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    if (daySummary(state, dates[i]).percent === 100) streak++;
    else break;
  }
  return streak;
}

/** Validates data loaded from storage or a backup file. Returns null if it isn't planner data. */
export function parseState(raw: unknown): PlannerState | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as { version?: unknown; days?: unknown };
  if (obj.version !== 1 || !obj.days || typeof obj.days !== 'object' || Array.isArray(obj.days)) return null;

  const validKeys = new Set<string>(DAILY_TARGETS.map((t) => t.key));
  const days: Record<string, DayRecord> = {};
  for (const [date, value] of Object.entries(obj.days as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !value || typeof value !== 'object') return null;
    const v = value as { done?: unknown; custom?: unknown };
    if (!Array.isArray(v.done) || !Array.isArray(v.custom)) return null;
    const done = v.done.filter((k): k is string => typeof k === 'string' && validKeys.has(k));
    const custom: CustomTask[] = [];
    for (const c of v.custom) {
      if (!c || typeof c !== 'object') return null;
      const t = c as Partial<CustomTask>;
      if (typeof t.id !== 'string' || typeof t.title !== 'string' || typeof t.completed !== 'boolean') return null;
      custom.push({ id: t.id, title: t.title.slice(0, MAX_TASK_TITLE), completed: t.completed });
    }
    days[date] = { done: [...new Set(done)], custom };
  }
  return { version: 1, days };
}

export const PLAN_DAYS = PLAN.totalDays;
