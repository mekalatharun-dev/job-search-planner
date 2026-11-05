import { PartyPopper } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { PLAN } from '@/config/plan';
import { formatFullDate, formatShortDate, planDayNumber } from '@/lib/dates';
import { getMissedTasks, type PlannerState } from '@/lib/planner';
import { TaskItem } from './TaskItem';

export function MissedTasks({
  state,
  today,
  onToggle,
  onSelect,
}: {
  state: PlannerState;
  today: string;
  onToggle: (date: string, id: string) => void;
  onSelect: (date: string) => void;
}) {
  const missed = getMissedTasks(state, today);
  const count = missed.reduce((n, m) => n + m.tasks.length, 0);
  const started = today >= PLAN.startDate;

  return (
    <Card>
      <CardHeader title="Missed tasks" description={count ? `${count} unticked task${count === 1 ? '' : 's'} on past days` : 'Unticked tasks from past days show here.'} />
      {count === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title={started ? 'No missed tasks' : 'Nothing missed yet'}
          description={started ? 'Every task on past days is ticked off.' : `The plan starts on ${formatShortDate(PLAN.startDate)}.`}
        />
      ) : (
        <CardBody className="max-h-[28rem] space-y-4 overflow-y-auto">
          {missed.map((m) => (
            <section key={m.date}>
              <button
                type="button"
                onClick={() => onSelect(m.date)}
                className="mb-1 text-left text-xs font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500"
              >
                Day {planDayNumber(m.date)} · {formatFullDate(m.date)}
              </button>
              <ul className="-mx-2">
                {m.tasks.map((t) => (
                  <TaskItem key={t.id} task={t} inputId={`missed-${m.date}-${t.id}`} onToggle={() => onToggle(m.date, t.id)} />
                ))}
              </ul>
            </section>
          ))}
        </CardBody>
      )}
    </Card>
  );
}
