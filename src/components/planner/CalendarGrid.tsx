import { Check } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { formatShortDate, formatWeekdayShort, parseISODate, planDayNumber } from '@/lib/dates';
import { dayTiming, daySummary, getWeeklyProgress, type PlannerState } from '@/lib/planner';

export function CalendarGrid({
  state,
  today,
  selected,
  onSelect,
}: {
  state: PlannerState;
  today: string;
  selected: string;
  onSelect: (date: string) => void;
}) {
  const weeks = getWeeklyProgress(state, today);

  return (
    <Card>
      <CardHeader title="30-day calendar" description="Pick a day to see and tick off its tasks." />
      <CardBody className="space-y-5">
        {weeks.map((w) => (
          <section key={w.week} aria-label={`${w.label}, ${formatShortDate(w.dates[0])} to ${formatShortDate(w.dates.at(-1)!)}`}>
            <div className="mb-2 flex items-baseline justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">{w.label}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {formatShortDate(w.dates[0])} – {formatShortDate(w.dates.at(-1)!)}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {w.dates.map((date) => {
                const s = daySummary(state, date);
                const timing = dayTiming(date, today);
                const isSelected = date === selected;
                const complete = s.percent === 100;
                const missed = timing === 'past' && !complete;
                const dayNo = planDayNumber(date);
                const label = [
                  `Day ${dayNo}`,
                  formatWeekdayShort(date),
                  formatShortDate(date),
                  timing === 'today' ? 'today' : null,
                  `${s.done} of ${s.total} tasks done`,
                  missed ? 'has missed tasks' : null,
                ]
                  .filter(Boolean)
                  .join(', ');
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => onSelect(date)}
                    aria-pressed={isSelected}
                    aria-label={label}
                    title={label}
                    className={cn(
                      'group relative flex min-h-16 flex-col items-center justify-between rounded-lg border px-1 pb-1.5 pt-1.5 text-center transition-colors',
                      'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60',
                      timing === 'today' && 'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10',
                      timing === 'future' && 'text-slate-400 dark:text-slate-500',
                      isSelected && 'ring-2 ring-brand-600 ring-offset-1 ring-offset-white dark:ring-brand-500 dark:ring-offset-slate-900',
                    )}
                  >
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{formatWeekdayShort(date)}</span>
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        timing === 'future' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white',
                      )}
                    >
                      {parseISODate(date).getDate()}
                    </span>
                    <span className="flex h-3 w-full items-center justify-center">
                      {complete ? (
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden />
                      ) : (
                        <span className="h-1 w-full max-w-8 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <span className="block h-full rounded-full bg-brand-600 dark:bg-brand-500" style={{ width: `${s.percent}%` }} />
                        </span>
                      )}
                    </span>
                    {missed && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <ul className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-brand-500 bg-brand-50 dark:bg-brand-500/10" aria-hidden /> Today
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded ring-2 ring-brand-600 dark:ring-brand-500" aria-hidden /> Selected
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden /> All tasks done
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden /> Past day with missed tasks
          </li>
        </ul>
      </CardBody>
    </Card>
  );
}
