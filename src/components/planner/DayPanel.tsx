import { useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PLAN } from '@/config/plan';
import { addDays, formatFullDate, formatShortDate, planDayNumber } from '@/lib/dates';
import { MAX_TASK_TITLE, dayTiming, getDayTasks, summarize, type PlanTask, type PlannerState } from '@/lib/planner';
import { TaskItem } from './TaskItem';

export function DayPanel({
  state,
  today,
  date,
  onSelect,
  onToggle,
  onAdd,
  onRemove,
}: {
  state: PlannerState;
  today: string;
  date: string;
  onSelect: (date: string) => void;
  onToggle: (date: string, id: string) => void;
  onAdd: (date: string, title: string) => void;
  onRemove: (date: string, id: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const tasks = getDayTasks(state, date);
  const summary = summarize(tasks);
  const timing = dayTiming(date, today);
  const dayNo = planDayNumber(date)!;
  const locked = timing === 'future';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAdd(date, draft);
    setDraft('');
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Day {dayNo} of {PLAN.totalDays}
            </h2>
            <Badge tone={timing === 'today' ? 'indigo' : timing === 'past' ? 'neutral' : 'blue'}>
              {timing === 'today' ? 'Today' : timing === 'past' ? 'Past' : 'Upcoming'}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{formatFullDate(date)}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" aria-label="Previous day" disabled={dayNo === 1} onClick={() => onSelect(addDays(date, -1))} className="px-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Next day" disabled={dayNo === PLAN.totalDays} onClick={() => onSelect(addDays(date, 1))} className="px-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardBody className="space-y-4">
        <div>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {summary.done} of {summary.total} done
            </span>
            <span className="text-slate-500 dark:text-slate-400">{summary.percent}%</span>
          </div>
          <ProgressBar value={summary.percent} label={`Day ${dayNo} completion`} />
        </div>

        {locked && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
            You can tick these off from {formatShortDate(date)}. You can add custom tasks now.
          </p>
        )}
        {timing === 'past' && summary.percent < 100 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Unticked tasks on this day count as missed. If you did them and forgot to tick, you can tick them now.
          </p>
        )}

        <ul className="-mx-2" aria-label={`Tasks for day ${dayNo}`}>
          {tasks.map((t) => (
            <TaskItemRow
              key={t.id}
              date={date}
              task={t}
              locked={locked}
              onToggle={onToggle}
              onRemove={onRemove}
            />
          ))}
        </ul>

        <form onSubmit={submit} className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <label htmlFor="new-task" className="sr-only">
            New custom task for day {dayNo}
          </label>
          <input
            id="new-task"
            value={draft}
            maxLength={MAX_TASK_TITLE}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a custom task…"
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <Button type="submit" size="sm" className="h-9" disabled={!draft.trim()}>
            <Plus className="h-4 w-4" aria-hidden />
            Add
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function TaskItemRow({
  date,
  task,
  locked,
  onToggle,
  onRemove,
}: {
  date: string;
  task: PlanTask;
  locked: boolean;
  onToggle: (date: string, id: string) => void;
  onRemove: (date: string, id: string) => void;
}) {
  return (
    <TaskItem
      task={task}
      inputId={`task-${date}-${task.id}`}
      disabled={locked}
      onToggle={() => onToggle(date, task.id)}
      onRemove={task.isCustom ? () => onRemove(date, task.id) : undefined}
    />
  );
}
