import { db } from "@/db/db";
import { soloDeskBackupSchema, type SoloDeskBackup } from "@/modules/import-export/backup.schemas";

function nowIso() {
  return new Date().toISOString();
}

export const backupService = {
  async createBackup(): Promise<SoloDeskBackup> {
    const [settings, clients, projects, kanbanStatuses, tasks, docs, timeEntries, invoices, invoiceLineItems] =
      await Promise.all([
        db.settings.toArray(),
        db.clients.toArray(),
        db.projects.toArray(),
        db.kanbanStatuses.toArray(),
        db.tasks.toArray(),
        db.docs.toArray(),
        db.timeEntries.toArray(),
        db.invoices.toArray(),
        db.invoiceLineItems.toArray()
      ]);

    return {
      appName: "SoloDesk",
      schemaVersion: 1,
      exportedAt: nowIso(),
      data: {
        settings,
        clients,
        projects,
        kanbanStatuses,
        tasks,
        docs,
        timeEntries,
        invoices,
        invoiceLineItems
      }
    };
  },

  downloadBackup(backup: SoloDeskBackup) {
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `solodesk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  parseBackupJson(raw: string): SoloDeskBackup {
    const parsed = JSON.parse(raw) as unknown;
    return soloDeskBackupSchema.parse(parsed);
  },

  previewCounts(backup: SoloDeskBackup) {
    return {
      settings: backup.data.settings.length,
      clients: backup.data.clients.length,
      projects: backup.data.projects.length,
      kanbanStatuses: backup.data.kanbanStatuses.length,
      tasks: backup.data.tasks.length,
      docs: backup.data.docs.length,
      timeEntries: backup.data.timeEntries.length,
      invoices: backup.data.invoices.length,
      invoiceLineItems: backup.data.invoiceLineItems.length
    };
  },

  async replaceAllData(backup: SoloDeskBackup) {
    await db.transaction(
      "rw",
      [
        db.settings,
        db.clients,
        db.projects,
        db.kanbanStatuses,
        db.tasks,
        db.docs,
        db.timeEntries,
        db.invoices,
        db.invoiceLineItems
      ],
      async () => {
        await Promise.all([
          db.settings.clear(),
          db.clients.clear(),
          db.projects.clear(),
          db.kanbanStatuses.clear(),
          db.tasks.clear(),
          db.docs.clear(),
          db.timeEntries.clear(),
          db.invoices.clear(),
          db.invoiceLineItems.clear()
        ]);

        if (backup.data.settings.length) await db.settings.bulkAdd(backup.data.settings);
        if (backup.data.clients.length) await db.clients.bulkAdd(backup.data.clients);
        if (backup.data.projects.length) await db.projects.bulkAdd(backup.data.projects);
        if (backup.data.kanbanStatuses.length) await db.kanbanStatuses.bulkAdd(backup.data.kanbanStatuses);
        if (backup.data.tasks.length) await db.tasks.bulkAdd(backup.data.tasks);
        if (backup.data.docs.length) await db.docs.bulkAdd(backup.data.docs);
        if (backup.data.timeEntries.length) await db.timeEntries.bulkAdd(backup.data.timeEntries);
        if (backup.data.invoices.length) await db.invoices.bulkAdd(backup.data.invoices);
        if (backup.data.invoiceLineItems.length) await db.invoiceLineItems.bulkAdd(backup.data.invoiceLineItems);
      }
    );
  }
};
