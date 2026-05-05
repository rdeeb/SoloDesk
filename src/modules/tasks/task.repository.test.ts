import { describe, expect, it } from "vitest";
import { db } from "@/db/db";
import { taskRepository } from "@/modules/tasks/task.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { CurrencyCode } from "@/shared/types/currency";
import type { EditorJSON } from "@/shared/types/domain";
import { EMPTY_EDITOR_JSON } from "@/shared/lib/editor-json";

describe("taskRepository", () => {
  it("rejects task creation without a project", async () => {
    await expect(
      taskRepository.create({
        projectId: "",
        title: "Draft proposal",
        description: EMPTY_EDITOR_JSON,
        statusId: "status-todo",
        priority: "medium",
        dueDate: "",
        estimateMinutes: undefined,
        billable: true
      })
    ).rejects.toThrow("project");
  });

  it("creates project-owned tasks, moves statuses, and excludes soft-deleted tasks from active lists", async () => {
    await db.kanbanStatuses.add({
      id: "status-todo",
      name: "To Do",
      order: 0,
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await db.kanbanStatuses.add({
      id: "status-done",
      name: "Done",
      order: 1,
      isDone: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const project = await projectRepository.create({
      name: "Website refresh",
      clientId: undefined,
      description: "",
      status: "active",
      hourlyRate: undefined,
      budgetAmount: undefined,
      currency: CurrencyCode.USD,
      startDate: "",
      dueDate: ""
    });

    const task = await taskRepository.create({
      projectId: project.id,
      title: "Draft proposal",
      description: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Scope the first pass" }] }] },
      statusId: "status-todo",
      priority: "medium",
      dueDate: "",
      estimateMinutes: 90,
      billable: true
    });

    expect(await taskRepository.listActiveByProjectId(project.id)).toHaveLength(1);

    await taskRepository.moveToStatus(task.id, "status-done");
    const moved = await taskRepository.getById(task.id);
    expect(moved?.statusId).toBe("status-done");

    await taskRepository.softDelete(task.id);
    expect(await taskRepository.listActive()).toEqual([]);
  });

  it("preserves rich editor JSON in task descriptions", async () => {
    await db.kanbanStatuses.add({
      id: "status-todo",
      name: "To Do",
      order: 0,
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const project = await projectRepository.create({
      name: "Website refresh",
      clientId: undefined,
      description: "",
      status: "active",
      hourlyRate: undefined,
      budgetAmount: undefined,
      currency: CurrencyCode.USD,
      startDate: "",
      dueDate: ""
    });
    const richDescription: EditorJSON = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Kickoff notes" }] },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Confirm scope" }] }] }] }
      ]
    };

    const task = await taskRepository.create({
      projectId: project.id,
      title: "Draft proposal",
      description: richDescription,
      statusId: "status-todo",
      priority: "medium",
      dueDate: "",
      estimateMinutes: 90,
      billable: true
    });

    expect(task.description).toEqual(richDescription);
    expect(taskRepository.toFormValues(task).description).toEqual(richDescription);
  });
});
