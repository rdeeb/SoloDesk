import { db } from "@/db/db";
import type { KanbanStatus } from "@/shared/types/domain";

const DEFAULT_KANBAN_STATUSES = [
  { id: "status-backlog", name: "Backlog", order: 0, isDone: false },
  { id: "status-todo", name: "To Do", order: 1, isDone: false },
  { id: "status-in-progress", name: "In Progress", order: 2, isDone: false },
  { id: "status-blocked", name: "Blocked", order: 3, isDone: false },
  { id: "status-review", name: "Review", order: 4, isDone: false },
  { id: "status-done", name: "Done", order: 5, isDone: true }
] as const;

export async function seedDefaultKanbanStatuses() {
  const existingCount = await db.kanbanStatuses.count();
  if (existingCount > 0) {
    return;
  }

  const now = new Date().toISOString();
  const rows: KanbanStatus[] = DEFAULT_KANBAN_STATUSES.map((status) => ({
    ...status,
    isDefault: true,
    createdAt: now,
    updatedAt: now
  }));

  await db.kanbanStatuses.bulkAdd(rows);
}
