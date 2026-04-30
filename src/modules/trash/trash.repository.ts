import { db } from "@/db/db";
import type { TrashEntityType, TrashItem } from "@/modules/trash/trash.types";

function normalizeDeletedAt(deletedAt: string | undefined) {
  return deletedAt ?? new Date().toISOString();
}

export const trashRepository = {
  async listAll(): Promise<TrashItem[]> {
    const [clients, projects, kanbanStatuses, tasks, docs, timeEntries, invoices, invoiceLineItems] = await Promise.all([
      db.clients.toCollection().filter((row) => Boolean(row.deletedAt)).toArray(),
      db.projects.toCollection().filter((row) => Boolean(row.deletedAt)).toArray(),
      db.kanbanStatuses.toCollection().filter((row) => Boolean(row.deletedAt)).toArray(),
      db.tasks.toCollection().filter((row) => Boolean(row.deletedAt)).toArray(),
      db.docs.toCollection().filter((row) => Boolean(row.deletedAt)).toArray(),
      db.timeEntries.toCollection().filter((row) => Boolean(row.deletedAt)).toArray(),
      db.invoices.toCollection().filter((row) => Boolean(row.deletedAt)).toArray(),
      db.invoiceLineItems.toCollection().filter((row) => Boolean(row.deletedAt)).toArray()
    ]);

    const result: TrashItem[] = [
      ...clients.map((row) => ({ id: row.id, entityType: "client" as const, label: row.name, deletedAt: normalizeDeletedAt(row.deletedAt) })),
      ...projects.map((row) => ({ id: row.id, entityType: "project" as const, label: row.name, deletedAt: normalizeDeletedAt(row.deletedAt) })),
      ...kanbanStatuses.map((row) => ({ id: row.id, entityType: "kanbanStatus" as const, label: row.name, deletedAt: normalizeDeletedAt(row.deletedAt) })),
      ...tasks.map((row) => ({ id: row.id, entityType: "task" as const, label: row.title, deletedAt: normalizeDeletedAt(row.deletedAt) })),
      ...docs.map((row) => ({ id: row.id, entityType: "doc" as const, label: row.title, deletedAt: normalizeDeletedAt(row.deletedAt) })),
      ...timeEntries.map((row) => ({ id: row.id, entityType: "timeEntry" as const, label: row.description ?? `Time entry ${row.entryDate}`, deletedAt: normalizeDeletedAt(row.deletedAt) })),
      ...invoices.map((row) => ({ id: row.id, entityType: "invoice" as const, label: row.invoiceNumber, deletedAt: normalizeDeletedAt(row.deletedAt) })),
      ...invoiceLineItems.map((row) => ({ id: row.id, entityType: "invoiceLineItem" as const, label: row.description, deletedAt: normalizeDeletedAt(row.deletedAt) }))
    ];

    return result.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  },

  async restore(item: { entityType: TrashEntityType; id: string }) {
    const updates = { deletedAt: undefined, updatedAt: new Date().toISOString() };
    if (item.entityType === "client") await db.clients.update(item.id, updates);
    if (item.entityType === "project") await db.projects.update(item.id, updates);
    if (item.entityType === "kanbanStatus") await db.kanbanStatuses.update(item.id, updates);
    if (item.entityType === "task") await db.tasks.update(item.id, updates);
    if (item.entityType === "doc") await db.docs.update(item.id, updates);
    if (item.entityType === "timeEntry") await db.timeEntries.update(item.id, updates);
    if (item.entityType === "invoice") await db.invoices.update(item.id, updates);
    if (item.entityType === "invoiceLineItem") await db.invoiceLineItems.update(item.id, updates);
  },

  async permanentlyDelete(item: { entityType: TrashEntityType; id: string }) {
    if (item.entityType === "client") await db.clients.delete(item.id);
    if (item.entityType === "project") await db.projects.delete(item.id);
    if (item.entityType === "kanbanStatus") await db.kanbanStatuses.delete(item.id);
    if (item.entityType === "task") await db.tasks.delete(item.id);
    if (item.entityType === "doc") await db.docs.delete(item.id);
    if (item.entityType === "timeEntry") await db.timeEntries.delete(item.id);
    if (item.entityType === "invoice") await db.invoices.delete(item.id);
    if (item.entityType === "invoiceLineItem") await db.invoiceLineItems.delete(item.id);
  },

  async emptyTrash() {
    const items = await this.listAll();
    for (const item of items) {
      await this.permanentlyDelete(item);
    }
  }
};
