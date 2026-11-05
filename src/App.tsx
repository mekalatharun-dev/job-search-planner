import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Moon, Sun, Target, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { usePlanner } from '@/hooks/usePlanner';
import { useToday } from '@/hooks/useToday';
import { PLAN } from '@/config/plan';
import { PLAN_END_DATE, formatDate, formatFullDate, formatShortDate, planDayNumber } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { StatsRow } from '@/components/planner/StatsRow';
import { CalendarGrid } from '@/components/planner/CalendarGrid';
import { DayPanel } from '@/components/planner/DayPanel';
import { WeeklyProgress } from '@/components/planner/WeeklyProgress';
import { MissedTasks } from '@/components/planner/MissedTasks';
import { BackupControls } from '@/components/planner/BackupControls';

/** The day to show first: today during the plan, otherwise the first or last plan day. */
function defaultSelection(today: string): string {
  if (planDayNumber(today) !== null) return today;
  return today < PLAN.startDate ? PLAN.startDate : PLAN_END_DATE;
}

function Notice({ tone, children, onClose }: { tone: 'info' | 'success' | 'error'; children: React.ReactNode; onClose?: () => void }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
    error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
  }[tone];
  const Icon = tone === 'error' ? AlertTriangle : CheckCircle2;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', styles)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss message" className="rounded p-0.5 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function App() {
  const today = useToday();
  const { theme, toggleTheme } = useTheme();
  const planner = usePlanner();
  const [selected, setSelected] = useState(() => defaultSelection(today));
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  // When the date rolls over into a new plan day, jump to it.
  useEffect(() => {
    if (planDayNumber(today) !== null) setSelected(today);
  }, [today]);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(t);
  }, [message]);

  const beforeStart = today < PLAN.startDate;
  const afterEnd = today > PLAN_END_DATE;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Target className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base dark:text-white">30-Day Job Search Plan</h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {formatShortDate(PLAN.startDate)} – {formatDate(PLAN_END_DATE)} · Offer by {formatDate(PLAN.deadline)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <BackupControls state={planner.state} onImport={planner.replaceAll} onMessage={setMessage} />
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {planner.loadWarning && (
          <Notice tone="error" onClose={planner.dismissLoadWarning}>
            {planner.loadWarning}
          </Notice>
        )}
        {planner.saveError && <Notice tone="error">{planner.saveError}</Notice>}
        {message && (
          <Notice tone={message.tone} onClose={() => setMessage(null)}>
            {message.text}
          </Notice>
        )}
        {beforeStart && (
          <Notice tone="info">
            Your plan starts on <strong>{formatFullDate(PLAN.startDate)}</strong>. You can look through each day and add custom tasks now; tasks can be ticked off from their own day.
          </Notice>
        )}
        {afterEnd && (
          <Notice tone="info">
            The 30 plan days are over. Your progress is still saved — review it below, and you can still tick off missed tasks you actually did.
          </Notice>
        )}

        <StatsRow state={planner.state} today={today} />

        <div className="grid items-start gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CalendarGrid state={planner.state} today={today} selected={selected} onSelect={setSelected} />
          </div>
          <div className="lg:sticky lg:top-24 lg:col-span-2">
            <DayPanel
              state={planner.state}
              today={today}
              date={selected}
              onSelect={setSelected}
              onToggle={planner.toggle}
              onAdd={planner.addTask}
              onRemove={planner.removeTask}
            />
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <WeeklyProgress state={planner.state} today={today} />
          <MissedTasks state={planner.state} today={today} onToggle={planner.toggle} onSelect={setSelected} />
        </div>

        <p className="pb-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Progress is saved in this browser. Use “Export backup” to keep a copy or move it to another device.
        </p>
      </main>
    </div>
  );
}
