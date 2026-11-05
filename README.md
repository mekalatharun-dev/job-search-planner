# 30-Day Job Search Plan

A daily planner for a 30-day search for a paid IT internship or entry-level role.

- **Plan days:** 6 Nov – 5 Dec 2026 (30 days)
- **Offer deadline:** 6 Dec 2026

## What it does

- 30-day calendar grouped into weeks, with today highlighted
- 7 daily targets every day:
  apply to 8–10 jobs, contact 5 recruiters, request 2 referrals,
  1 hour each of Python, SQL, interview prep and project work
- Tick tasks off yourself — nothing is ever ticked automatically
- Tasks can only be ticked on or after their own day
- Add and delete your own custom tasks on any day
- Daily completion percentage
- Missed tasks (unticked tasks on past days), which you can still tick if you forgot
- Weekly progress chart and table, overall progress and streak
- Light and dark theme, works on phones
- Progress is saved in your browser and survives refreshes and restarts
- Export / import a backup file (to keep a copy or move to another device)

## Run it

You need Node.js 20 or newer (`node -v` to check). In the VS Code terminal:

```bash
git clone https://github.com/mekalatharun-dev/job-search-planner.git
cd job-search-planner
npm install
npm run dev
```

Then open http://localhost:5173.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app for development |
| `npm test` | Run the automated tests |
| `npm run typecheck` | Check TypeScript types |
| `npm run build` | Build the production version into `dist/` |
| `npm run preview` | Serve the production build locally |

## Changing the plan

Edit `src/config/plan.ts` to change the start date, number of days, deadline or the daily targets.
Don't change a target's `key` after you've started ticking, or that target's saved ticks won't show.

## Where your progress is stored

In this browser's local storage. Clearing site data or using a different browser/device starts empty —
use **Export backup** regularly and **Import backup** to restore.

## Folder structure

```
src/
  config/plan.ts         Dates and daily targets
  lib/dates.ts           Date helpers
  lib/planner.ts         Planner rules (progress, missed tasks, weeks, streak)
  lib/storage.ts         Saving and loading progress
  hooks/                 usePlanner (state + saving), useToday (date rollover)
  components/planner/    Calendar, day panel, stats, weekly chart, missed tasks, backup
  components/ui/         Buttons, cards, badges, progress bar, empty states
  __tests__/             Automated tests
```
