import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { todayISO } from '@/lib/dates';
import { parseState, type PlannerState } from '@/lib/planner';

export function BackupControls({
  state,
  onImport,
  onMessage,
}: {
  state: PlannerState;
  onImport: (state: PlannerState) => void;
  onMessage: (msg: { tone: 'success' | 'error'; text: string }) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-search-plan-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onMessage({ tone: 'success', text: 'Backup downloaded.' });
  };

  const importBackup = async (file: File) => {
    try {
      const parsed = parseState(JSON.parse(await file.text()));
      if (!parsed) {
        onMessage({ tone: 'error', text: 'That file is not a planner backup. Nothing was changed.' });
        return;
      }
      if (!window.confirm('Replace your current progress with this backup? This cannot be undone.')) return;
      onImport(parsed);
      onMessage({ tone: 'success', text: 'Backup restored.' });
    } catch {
      onMessage({ tone: 'error', text: 'That file could not be read. Nothing was changed.' });
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={exportBackup} aria-label="Export backup" className="px-2 sm:px-3">
        <Download className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Export backup</span>
      </Button>
      <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} aria-label="Import backup" className="px-2 sm:px-3">
        <Upload className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Import backup</span>
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Choose backup file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void importBackup(file);
        }}
      />
    </>
  );
}
