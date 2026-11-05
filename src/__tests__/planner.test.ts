import {
  addCustomTask,
  createEmptyState,
  daySummary,
  getDayTasks,
  getMissedTasks,
  getOverallProgress,
  getStreak,
  getWeeklyProgress,
  parseState,
  removeCustomTask,
  toggleTask,
} from '@/lib/planner';
import { DAILY_TARGETS } from '@/config/plan';

const D1 = '2026-11-06';
const D2 = '2026-11-07';
const D3 = '2026-11-08';

function completeDay(state = createEmptyState(), date: string) {
  return DAILY_TARGETS.reduce((s, t) => toggleTask(s, date, t.key), state);
}

describe('daily tasks', () => {
  it('starts every day with the 7 default targets, none completed', () => {
    const tasks = getDayTasks(createEmptyState(), D1);
    expect(tasks.map((t) => t.title)).toEqual(DAILY_TARGETS.map((t) => t.title));
    expect(tasks.every((t) => !t.completed)).toBe(true);
    expect(daySummary(createEmptyState(), D1)).toEqual({ done: 0, total: 7, percent: 0 });
  });

  it('toggles a default task on and off for one day only', () => {
    let s = toggleTask(createEmptyState(), D1, 'python');
    expect(daySummary(s, D1)).toEqual({ done: 1, total: 7, percent: 14 });
    expect(daySummary(s, D2).done).toBe(0);
    s = toggleTask(s, D1, 'python');
    expect(daySummary(s, D1).done).toBe(0);
  });

  it('does not mutate the previous state', () => {
    const before = createEmptyState();
    toggleTask(before, D1, 'sql');
    expect(before.days).toEqual({});
  });

  it('adds, completes and removes custom tasks', () => {
    let s = addCustomTask(createEmptyState(), D1, '  Update resume  ', 'c1');
    expect(getDayTasks(s, D1).at(-1)).toEqual({ id: 'c1', title: 'Update resume', completed: false, isCustom: true });
    expect(daySummary(s, D1).total).toBe(8);
    s = toggleTask(s, D1, 'c1');
    expect(daySummary(s, D1).done).toBe(1);
    s = removeCustomTask(s, D1, 'c1');
    expect(daySummary(s, D1)).toEqual({ done: 0, total: 7, percent: 0 });
  });

  it('ignores blank custom tasks', () => {
    const s = createEmptyState();
    expect(addCustomTask(s, D1, '   ')).toBe(s);
  });
});

describe('progress', () => {
  it('lists missed tasks only for days before today', () => {
    let s = toggleTask(createEmptyState(), D1, 'apply');
    s = completeDay(s, D2);
    const missed = getMissedTasks(s, D3);
    expect(missed).toHaveLength(1);
    expect(missed[0].date).toBe(D1);
    expect(missed[0].tasks).toHaveLength(6);
    expect(getMissedTasks(s, D1)).toEqual([]);
  });

  it('groups 30 days into weeks of 7,7,7,7,2', () => {
    const weeks = getWeeklyProgress(createEmptyState(), D1);
    expect(weeks.map((w) => w.dates.length)).toEqual([7, 7, 7, 7, 2]);
    expect(weeks[0].daysElapsed).toBe(1);
    expect(weeks[1].daysElapsed).toBe(0);
  });

  it('calculates weekly and overall completion from ticked tasks', () => {
    const s = completeDay(createEmptyState(), D1);
    const week1 = getWeeklyProgress(s, D2)[0];
    expect(week1.soFar).toEqual({ done: 7, total: 14, percent: 50 });
    const overall = getOverallProgress(s, D2);
    expect(overall.soFar).toEqual({ done: 7, total: 14, percent: 50 });
    expect(overall.plan.total).toBe(210);
  });

  it('counts a streak of fully completed days', () => {
    let s = completeDay(createEmptyState(), D1);
    s = completeDay(s, D2);
    expect(getStreak(s, D3)).toBe(2); // today not finished yet: still counts up to yesterday
    s = completeDay(s, D3);
    expect(getStreak(s, D3)).toBe(3);
    expect(getStreak(toggleTask(s, D2, 'sql'), D3)).toBe(1);
  });
});

describe('parseState', () => {
  it('accepts valid data and drops unknown task keys', () => {
    const parsed = parseState({ version: 1, days: { [D1]: { done: ['apply', 'bogus', 'apply'], custom: [{ id: 'a', title: 'X', completed: true }] } } });
    expect(parsed?.days[D1].done).toEqual(['apply']);
    expect(parsed?.days[D1].custom).toHaveLength(1);
  });
  it('rejects anything that is not planner data', () => {
    expect(parseState(null)).toBeNull();
    expect(parseState({ hello: 'world' })).toBeNull();
    expect(parseState({ version: 1, days: { 'not-a-date': { done: [], custom: [] } } })).toBeNull();
    expect(parseState({ version: 1, days: { [D1]: { done: [], custom: [{ id: 1 }] } } })).toBeNull();
  });
});
