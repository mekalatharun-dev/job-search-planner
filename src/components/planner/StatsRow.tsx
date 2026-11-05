import type { ReactNode } from 'react';
import { CalendarDays, CheckCircle2, CircleAlert, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PLAN } from '@/config/plan';
import { formatShortDate, getPlanStatus, planDayNumber } from '@/lib/dates';
import { daySummary, getMissedTasks, getOverallProgress, getStreak, type PlannerState } from '@/lib/planner';

function Stat({ icon: Icon, label, value, sub, children }: { icon: LucideIcon; label: string; value: ReactNode; sub: ReactNode; children?: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
      {children}
    </Card>
  );
}

export function StatsRow({ state, today }: { state: PlannerState; today: string }) {
  const status = getPlanStatus(today);
  const isPlanDay = planDayNumber(today) !== null;
  const todaySum = daySummary(state, today);
  const overall = getOverallProgress(state, today);
  const missed = getMissedTasks(state, today);
  const missedCount = missed.reduce((n, m) => n + m.tasks.length, 0);
  const streak = getStreak(state, today);

  const dayValue =
    status.phase === 'not-started'
      ? `Starts in ${status.daysUntilStart} day${status.daysUntilStart === 1 ? '' : 's'}`
      : status.phase === 'ended'
        ? 'Plan finished'
        : `Day ${status.dayNumber} of ${PLAN.totalDays}`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <Stat
        icon={CalendarDays}
        label="Plan day"
        value={dayValue}
        sub={`${status.daysUntilDeadline} day${status.daysUntilDeadline === 1 ? '' : 's'} to the ${formatShortDate(PLAN.deadline)} offer deadline`}
      />
      <Stat
        icon={CheckCircle2}
        label="Today"
        value={isPlanDay ? `${todaySum.done} / ${todaySum.total}` : '—'}
        sub={isPlanDay ? `${todaySum.percent}% of today's tasks done` : 'Today is not a plan day'}
      >
        {isPlanDay && <ProgressBar value={todaySum.percent} label="Today's completion" className="mt-3" />}
      </Stat>
      <Stat
        icon={TrendingUp}
        label="Overall so far"
        value={overall.soFar.total ? `${overall.soFar.percent}%` : '—'}
        sub={
          overall.soFar.total
            ? `${overall.soFar.done} of ${overall.soFar.total} tasks due so far · streak ${streak} full day${streak === 1 ? '' : 's'}`
            : `${overall.plan.total} tasks planned across ${PLAN.totalDays} days`
        }
      />
      <Stat
        icon={CircleAlert}
        label="Missed tasks"
        value={missedCount}
        sub={missedCount ? `Across ${missed.length} past day${missed.length === 1 ? '' : 's'}` : 'Nothing missed'}
      />
    </div>
  );
}
