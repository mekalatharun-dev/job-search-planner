import { createEmptyState, parseState, type PlannerState } from './planner';

/**
 * Saves planner progress in this browser (localStorage).
 * Progress stays after refreshing or closing the browser, but only on this
 * browser and device — use "Export backup" to keep a copy.
 */

export const STORAGE_KEY = 'jst-planner-v1';
const CORRUPT_KEY = 'jst-planner-v1-unreadable';

export interface LoadResult {
  state: PlannerState;
  warning: string | null;
}

export function loadPlanner(): LoadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: createEmptyState(), warning: 'This browser is blocking storage, so progress cannot be saved. Check that cookies/site data are allowed.' };
  }
  if (!raw) return { state: createEmptyState(), warning: null };

  let parsed: PlannerState | null = null;
  try {
    parsed = parseState(JSON.parse(raw));
  } catch {
    parsed = null;
  }
  if (parsed) return { state: parsed, warning: null };

  // Keep the unreadable data instead of silently overwriting it.
  try {
    localStorage.setItem(CORRUPT_KEY, raw);
  } catch {
    /* ignore */
  }
  return { state: createEmptyState(), warning: `Saved progress could not be read, so the planner started empty. The old data was kept under "${CORRUPT_KEY}".` };
}

/** Returns an error message, or null on success. */
export function savePlanner(state: PlannerState): string | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return null;
  } catch {
    return 'Your latest change could not be saved in this browser (storage is full or blocked).';
  }
}
