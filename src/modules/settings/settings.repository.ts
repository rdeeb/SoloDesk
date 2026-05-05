import { db } from "@/db/db";
import type { WorkspaceSettings } from "@/shared/types/domain";
import { CurrencyCode } from "@/shared/types/currency";

const SETTINGS_ID = "workspace";

async function hasExistingWorkspaceData() {
  const [clients, projects, tasks, docs, timeEntries, invoices, kanbanStatuses] = await Promise.all([
    db.clients.count(),
    db.projects.count(),
    db.tasks.count(),
    db.docs.count(),
    db.timeEntries.count(),
    db.invoices.count(),
    db.kanbanStatuses.count()
  ]);

  return clients + projects + tasks + docs + timeEntries + invoices + kanbanStatuses > 0;
}

function fallbackSettings(existing?: WorkspaceSettings): Omit<WorkspaceSettings, "id" | "createdAt" | "updatedAt"> {
  return {
    workspaceName: existing?.workspaceName ?? "SoloDesk Workspace",
    defaultCurrency: existing?.defaultCurrency ?? CurrencyCode.USD,
    defaultHourlyRate: existing?.defaultHourlyRate,
    taxEnabled: existing?.taxEnabled ?? false,
    defaultTaxName: existing?.defaultTaxName ?? "Tax",
    defaultTaxRate: existing?.defaultTaxRate,
    invoicePrefix: existing?.invoicePrefix ?? "INV",
    nextInvoiceNumber: existing?.nextInvoiceNumber ?? 1,
    dateFormat: existing?.dateFormat ?? "yyyy-MM-dd",
    setupCompleted: true
  };
}

export const settingsRepository = {
  async get(): Promise<WorkspaceSettings | undefined> {
    return db.settings.get(SETTINGS_ID);
  },

  async save(input: Omit<WorkspaceSettings, "id" | "createdAt" | "updatedAt">): Promise<WorkspaceSettings> {
    const existing = await db.settings.get(SETTINGS_ID);
    const now = new Date().toISOString();

    const next: WorkspaceSettings = {
      id: SETTINGS_ID,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...input
    };

    await db.settings.put(next);
    return next;
  },

  async isSetupCompleted(): Promise<boolean> {
    const settings = await this.get();
    return Boolean(settings?.setupCompleted);
  },

  async ensureSetupCompletedFromLocalData(): Promise<boolean> {
    const settings = await this.get();
    if (settings?.setupCompleted) {
      return true;
    }

    if (!(await hasExistingWorkspaceData())) {
      return false;
    }

    await this.save(fallbackSettings(settings));
    return true;
  }
};
