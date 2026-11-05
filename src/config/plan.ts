/**
 * Plan settings. Change these if your dates or daily targets change.
 * Dates are local calendar dates in YYYY-MM-DD format.
 */
export const PLAN = {
  startDate: '2026-11-06',
  totalDays: 30,
  /** The date you want a paid offer by. The 30 plan days end the day before. */
  deadline: '2026-12-06',
} as const;

/** The 7 tasks every day starts with. `key` must never change once you have saved progress. */
export const DAILY_TARGETS = [
  { key: 'apply', title: 'Apply to 8–10 jobs' },
  { key: 'recruiters', title: 'Contact 5 recruiters' },
  { key: 'referrals', title: 'Request 2 referrals' },
  { key: 'python', title: 'Practise Python for 1 hour' },
  { key: 'sql', title: 'Practise SQL for 1 hour' },
  { key: 'interview', title: 'Interview preparation for 1 hour' },
  { key: 'projects', title: 'Improve projects for 1 hour' },
] as const;
