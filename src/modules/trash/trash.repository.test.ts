import { describe, expect, it } from "vitest";
import { db } from "@/db/db";
import { trashRepository } from "@/modules/trash/trash.repository";

describe("trashRepository", () => {
  it("lists trashed rows, restores, and permanently deletes", async () => {
    await db.tasks.add({
      id: "task-1",
      projectId: "project-1",
      title: "Deleted Task",
      statusId: "status-todo",
      billable: true,
      createdAt: "2026-04-28T00:00:00.000Z",
      updatedAt: "2026-04-28T00:00:00.000Z",
      deletedAt: "2026-04-28T00:00:00.000Z"
    });

    const items = await trashRepository.listAll();
    expect(items).toHaveLength(1);
    expect(items[0]?.entityType).toBe("task");

    await trashRepository.restore({ entityType: "task", id: "task-1" });
    const restored = await db.tasks.get("task-1");
    expect(restored?.deletedAt).toBeUndefined();

    await db.tasks.update("task-1", { deletedAt: "2026-04-28T00:00:00.000Z" });
    await trashRepository.permanentlyDelete({ entityType: "task", id: "task-1" });
    const removed = await db.tasks.get("task-1");
    expect(removed).toBeUndefined();
  });
});
