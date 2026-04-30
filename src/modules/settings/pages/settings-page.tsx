import { useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { backupService } from "@/modules/import-export/backup.service";
import type { SoloDeskBackup } from "@/modules/import-export/backup.schemas";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import type { KanbanStatus } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";

function StatusRow({ status, isFirst, isLast }: { status: KanbanStatus; isFirst: boolean; isLast: boolean }) {
  const [name, setName] = useState(status.name);
  const [isDone, setIsDone] = useState(status.isDone);

  async function save() {
    await kanbanRepository.update(status.id, {
      name,
      color: status.color,
      isDone
    });
  }

  return (
    <div className="grid gap-2 border-t px-4 py-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isDone} onChange={(event) => setIsDone(event.target.checked)} />
        Done
      </label>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Move column up"
          disabled={isFirst}
          onClick={() => kanbanRepository.move(status.id, "up")}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Move column down"
          disabled={isLast}
          onClick={() => kanbanRepository.move(status.id, "down")}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={save}>
          Save
        </Button>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => kanbanRepository.softDelete(status.id)}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}

export function SettingsPage() {
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const [name, setName] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backup, setBackup] = useState<SoloDeskBackup | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  async function addStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Column name is required.");
      return;
    }

    await kanbanRepository.create({ name, isDone });
    setName("");
    setIsDone(false);
  }

  async function handleExport() {
    const created = await backupService.createBackup();
    backupService.downloadBackup(created);
  }

  async function handleImportFile(event: FormEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    try {
      setImportError(null);
      setConfirmReplace(false);
      const raw = await file.text();
      const parsed = backupService.parseBackupJson(raw);
      setBackup(parsed);
    } catch (caught) {
      setBackup(null);
      setImportError(caught instanceof Error ? caught.message : "Invalid backup file.");
    } finally {
      event.currentTarget.value = "";
    }
  }

  async function handleImportReplace() {
    if (!backup || !confirmReplace) {
      return;
    }
    await backupService.replaceAllData(backup);
    setBackup(null);
    setConfirmReplace(false);
  }

  const preview = backup ? backupService.previewCounts(backup) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage global workspace configuration.</p>
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Kanban columns</h3>
          <p className="text-sm text-muted-foreground">These statuses are global and appear on every project board.</p>
        </div>

        <form onSubmit={addStatus} className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_auto_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Column name"
            className="rounded-md border bg-background px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isDone} onChange={(event) => setIsDone(event.target.checked)} />
            Done column
          </label>
          <Button type="submit">Add column</Button>
          {error ? <p className="text-sm text-red-500 md:col-span-3">{error}</p> : null}
        </form>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="px-4 py-3 text-sm font-medium text-muted-foreground">Active columns</div>
          {statuses.map((status, index) => (
            <StatusRow
              key={status.id}
              status={status}
              isFirst={index === 0}
              isLast={index === statuses.length - 1}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Import/Export</h3>
          <p className="text-sm text-muted-foreground">Export full backups and import with replace-only behavior.</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={handleExport}>
              Export JSON Backup
            </Button>
            <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm">
              Import Backup JSON
              <input type="file" accept="application/json,.json" className="hidden" onInput={handleImportFile} />
            </label>
          </div>

          {importError ? <p className="mt-3 text-sm text-red-500">{importError}</p> : null}

          {preview ? (
            <div className="mt-4 space-y-3 rounded-md border p-3">
              <p className="text-sm font-medium">Import Preview Counts</p>
              <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                {Object.entries(preview).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmReplace}
                  onChange={(event) => setConfirmReplace(event.target.checked)}
                />
                Confirm replacing all current data
              </label>
              <Button type="button" variant="outline" disabled={!confirmReplace} onClick={handleImportReplace}>
                Replace Data from Backup
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
