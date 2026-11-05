import { useCallback, useEffect, useRef, useState } from 'react';
import { addCustomTask, removeCustomTask, toggleTask, type PlannerState } from '@/lib/planner';
import { STORAGE_KEY, loadPlanner, savePlanner } from '@/lib/storage';

export function usePlanner() {
  const [initial] = useState(loadPlanner);
  const [state, setState] = useState<PlannerState>(initial.state);
  const [loadWarning, setLoadWarning] = useState<string | null>(initial.warning);
  const [saveError, setSaveError] = useState<string | null>(null);
  const skipNextSave = useRef(true);

  // Save after every change (but not straight after loading).
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    setSaveError(savePlanner(state));
  }, [state]);

  // If the planner is open in two tabs, keep them in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = loadPlanner();
      skipNextSave.current = true;
      setState(next.state);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((date: string, id: string) => setState((s) => toggleTask(s, date, id)), []);
  const addTask = useCallback((date: string, title: string) => setState((s) => addCustomTask(s, date, title)), []);
  const removeTask = useCallback((date: string, id: string) => setState((s) => removeCustomTask(s, date, id)), []);
  const replaceAll = useCallback((next: PlannerState) => setState(next), []);

  return {
    state,
    toggle,
    addTask,
    removeTask,
    replaceAll,
    loadWarning,
    dismissLoadWarning: () => setLoadWarning(null),
    saveError,
  };
}
