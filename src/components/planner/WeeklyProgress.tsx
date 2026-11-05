import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatShortDate } from '@/lib/dates';
import { getWeeklyProgress, type PlannerState, type WeekProgress } from '@/lib/planner';

interface Row {
  label: string;
  percent: number;
  week: WeekProgress;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) {
  if (!active || !payload?.length) return null;
  const { week } = payload[0].payload as Row;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium text-slate-900 dark:text-white">
        {week.label} · {formatShortDate(week.dates[0])} – {formatShortDate(week.dates.at(-1)!)}
      </p>
      <p className="mt-1 text-slate-600 dark:text-slate-300">
        {week.daysElapsed === 0
          ? 'Not started yet'
          : `${week.soFar.percent}% · ${week.soFar.done} of ${week.soFar.total} tasks due so far`}
      </p>
    </div>
  );
}

export function WeeklyProgress({ state, today }: { state: PlannerState; today: string }) {
  const weeks = getWeeklyProgress(state, today);
  const data: Row[] = weeks.map((w) => ({ label: w.label, percent: w.soFar.percent, week: w }));

  return (
    <Card>
      <CardHeader title="Weekly progress" description="Share of tasks ticked off on days up to today." />
      <CardBody className="space-y-5">
        <div className="h-52" role="img" aria-label="Bar chart of weekly completion percentage. The same numbers are in the table below.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -16 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v: number) => `${v}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
              />
              <Tooltip content={(p) => <ChartTooltip active={p.active} payload={p.payload} />} cursor={{ fill: 'var(--chart-cursor)' }} />
              <Bar dataKey="percent" fill="var(--chart-bar)" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th scope="col" className="py-2 pr-3 font-medium">Week</th>
                <th scope="col" className="py-2 pr-3 font-medium">Dates</th>
                <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">Done so far</th>
                <th scope="col" className="py-2 text-right font-medium">Completion</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.week} className="border-b border-slate-50 last:border-0 dark:border-slate-800/60">
                  <td className="whitespace-nowrap py-2 pr-3 font-medium text-slate-900 dark:text-white">{w.label}</td>
                  <td className="whitespace-nowrap py-2 pr-3 text-slate-600 dark:text-slate-300">
                    {formatShortDate(w.dates[0])} – {formatShortDate(w.dates.at(-1)!)}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                    {w.daysElapsed ? `${w.soFar.done} / ${w.soFar.total}` : '—'}
                  </td>
                  <td className="whitespace-nowrap py-2 text-right tabular-nums text-slate-900 dark:text-white">
                    {w.daysElapsed ? `${w.soFar.percent}%` : 'Not started'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
