import { db } from "@/db/db";
import { createId } from "@/shared/lib/id";
import type { KanbanStatus } from "@/shared/types/domain";

export interface KanbanStatusInput {
  name: string;
  color?: string;
  isDone: boolean;
}

export const kanbanRepository = {
  async listActive(): Promise<KanbanStatus[]> {
    const rows = await db.kanbanStatuses.toCollection().filter((status) => !status.deletedAt).toArray();
    return rows.sort((a, b) => a.order - b.order);
  },

  async getDefaultStatus(): Promise<KanbanStatus | undefined> {
    const active = await this.listActive();
    return active.find((status) => !status.isDone) ?? active[0];
  },

  async create(values: KanbanStatusInput): Promise<KanbanStatus> {
    const active = await this.listActive();
    const now = new Date().toISOString();
    const next: KanbanStatus = {
      id: createId("status"),
      name: values.name.trim(),
      color: values.color,
      isDone: values.isDone,
      order: active.length,
      createdAt: now,
      updatedAt: now
    };

    await db.kanbanStatuses.add(next);
    return next;
  },

  async update(id: string, values: KanbanStatusInput) {
    await db.kanbanStatuses.update(id, {
      name: values.name.trim(),
      color: values.color,
      isDone: values.isDone,
      updatedAt: new Date().toISOString()
    });
  },

  async move(id: string, direction: "up" | "down") {
    const active = await this.listActive();
    const currentIndex = active.findIndex((status) => status.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= active.length) {
      return;
    }

    const current = active[currentIndex];
    const target = active[targetIndex];
    const now = new Date().toISOString();

    await db.transaction("rw", db.kanbanStatuses, async () => {
      await db.kanbanStatuses.update(current.id, { order: target.order, updatedAt: now });
      await db.kanbanStatuses.update(target.id, { order: current.order, updatedAt: now });
    });
  },

  async softDelete(id: string) {
    const now = new Date().toISOString();
    await db.kanbanStatuses.update(id, { deletedAt: now, updatedAt: now });
  }
};
