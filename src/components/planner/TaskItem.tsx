import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PlanTask } from '@/lib/planner';

export function TaskItem({
  task,
  inputId,
  disabled,
  onToggle,
  onRemove,
}: {
  task: PlanTask;
  inputId: string;
  disabled?: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <input
        id={inputId}
        type="checkbox"
        checked={task.completed}
        disabled={disabled}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-brand-600 disabled:cursor-not-allowed dark:border-slate-600"
      />
      <label
        htmlFor={inputId}
        className={cn(
          'min-w-0 flex-1 cursor-pointer text-sm break-words',
          task.completed ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-200',
          disabled && 'cursor-not-allowed',
        )}
      >
        {task.title}
      </label>
      {task.isCustom && (
        <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline dark:bg-slate-800 dark:text-slate-400">
          Custom
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          aria-label={`Delete custom task "${task.title}"`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}
