import { db } from "@/db/db";
import { createId } from "@/shared/lib/id";
import type { TimeEntry } from "@/shared/types/domain";
import type { BillableSummary, ClientTimeSummary, TimeEntryCreateValues, TimeEntryFilters } from "@/modules/time/time.types";

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export const timeRepository = {
  async listActive(filters?: string | TimeEntryFilters): Promise<TimeEntry[]> {
    const normalizedFilters = typeof filters === "string" ? { projectId: filters } : filters ?? {};
    const rows = await db.timeEntries.toCollection().filter((entry) => !entry.deletedAt).toArray();
    return rows
      .filter((entry) => (normalizedFilters.projectId ? entry.projectId === normalizedFilters.projectId : true))
      .filter((entry) => (normalizedFilters.taskId ? entry.taskId === normalizedFilters.taskId : true))
      .sort((a, b) => b.entryDate.localeCompare(a.entryDate) || b.updatedAt.localeCompare(a.updatedAt));
  },

  async create(values: TimeEntryCreateValues): Promise<TimeEntry> {
    if (!values.projectId.trim()) {
      throw new Error("Time entry requires a project.");
    }

    if (values.durationMinutes <= 0) {
      throw new Error("Duration must be greater than zero.");
    }

    const project = await db.projects.get(values.projectId);
    if (!project || project.deletedAt) {
      throw new Error("Time entry requires an active project.");
    }

    if (values.taskId) {
      const task = await db.tasks.get(values.taskId);
      if (!task || task.deletedAt || task.projectId !== values.projectId) {
        throw new Error("Task must belong to the selected project.");
      }
    }

    let snapshotRate = project.hourlyRate;
    if (snapshotRate === undefined && project.clientId) {
      const client = await db.clients.get(project.clientId);
      snapshotRate = client?.defaultHourlyRate;
    }
    if (snapshotRate === undefined) {
      const settings = await db.settings.get("workspace");
      snapshotRate = settings?.defaultHourlyRate;
    }

    const now = new Date().toISOString();
    const next: TimeEntry = {
      id: createId("time"),
      projectId: values.projectId,
      taskId: values.taskId,
      description: normalizeOptional(values.description),
      entryDate: values.entryDate,
      durationMinutes: values.durationMinutes,
      billable: values.billable,
      hourlyRate: snapshotRate,
      createdAt: now,
      updatedAt: now
    };

    await db.timeEntries.add(next);
    return next;
  },

  async softDelete(id: string) {
    const now = new Date().toISOString();
    await db.timeEntries.update(id, { deletedAt: now, updatedAt: now });
  },

  async getBillableSummary(filters?: string | TimeEntryFilters): Promise<BillableSummary> {
    const entries = await this.listActive(filters);
    const billableEntries = entries.filter((entry) => entry.billable);
    const billableMinutes = billableEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
    const billableAmount = billableEntries.reduce((sum, entry) => {
      if (entry.hourlyRate === undefined) {
        return sum;
      }
      return sum + (entry.durationMinutes / 60) * entry.hourlyRate;
    }, 0);

    return {
      billableMinutes,
      billableAmount
    };
  },

  async getClientSummaries(): Promise<ClientTimeSummary[]> {
    const [clients, projects, entries] = await Promise.all([
      db.clients.toCollection().filter((client) => !client.deletedAt).toArray(),
      db.projects.toCollection().filter((project) => !project.deletedAt).toArray(),
      this.listActive()
    ]);

    const clientNameById = new Map(clients.map((client) => [client.id, client.name]));
    const projectClientById = new Map(projects.map((project) => [project.id, project.clientId]));
    const aggregate = new Map<string, ClientTimeSummary>();

    for (const entry of entries) {
      const clientId = projectClientById.get(entry.projectId);
      if (!clientId || !entry.billable) {
        continue;
      }

      const existing = aggregate.get(clientId) ?? {
        clientId,
        clientName: clientNameById.get(clientId) ?? "Unknown client",
        billableMinutes: 0,
        billableAmount: 0
      };

      existing.billableMinutes += entry.durationMinutes;
      if (entry.hourlyRate !== undefined) {
        existing.billableAmount += (entry.durationMinutes / 60) * entry.hourlyRate;
      }
      aggregate.set(clientId, existing);
    }

    return [...aggregate.values()].sort((a, b) => a.clientName.localeCompare(b.clientName));
  }
};
