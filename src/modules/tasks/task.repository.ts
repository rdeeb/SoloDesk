import { db } from "@/db/db";
import { createId } from "@/shared/lib/id";
import { EMPTY_EDITOR_JSON, normalizeEditorJson } from "@/shared/lib/editor-json";
import type { KanbanStatus, Task } from "@/shared/types/domain";
import type { TaskFilters, TaskFormValues } from "@/modules/tasks/task.types";

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function applyTaskFilters(tasks: Task[], filters: TaskFilters = {}) {
  return tasks.filter((task) => {
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false;
    }

    if (filters.statusId && task.statusId !== filters.statusId) {
      return false;
    }

    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    if (filters.dueDate && task.dueDate !== filters.dueDate) {
      return false;
    }

    return true;
  });
}

export const taskRepository = {
  async listActive(filters: TaskFilters = {}): Promise<Task[]> {
    const rows = await db.tasks.toCollection().filter((task) => !task.deletedAt).toArray();
    return applyTaskFilters(rows, filters).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async listActiveByProjectId(projectId: string): Promise<Task[]> {
    return this.listActive({ projectId });
  },

  async listActiveByStatusId(statusId: string, projectId?: string): Promise<Task[]> {
    return this.listActive({ statusId, projectId });
  },

  async countOpen(): Promise<number> {
    const statuses = await db.kanbanStatuses.toCollection().filter((status) => !status.deletedAt).toArray();
    const doneStatusIds = new Set(statuses.filter((status) => status.isDone).map((status) => status.id));
    const rows = await this.listActive();
    return rows.filter((task) => !doneStatusIds.has(task.statusId)).length;
  },

  async countCompleted(): Promise<number> {
    const statuses = await db.kanbanStatuses.toCollection().filter((status) => !status.deletedAt && status.isDone).toArray();
    const doneStatusIds = new Set(statuses.map((status: KanbanStatus) => status.id));
    const rows = await this.listActive();
    return rows.filter((task) => doneStatusIds.has(task.statusId)).length;
  },

  async getById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id);
  },

  async create(values: TaskFormValues): Promise<Task> {
    if (!values.projectId.trim()) {
      throw new Error("Task requires a project.");
    }

    if (!values.statusId.trim()) {
      throw new Error("Task requires a status.");
    }

    const project = await db.projects.get(values.projectId);
    if (!project || project.deletedAt) {
      throw new Error("Task requires an active project.");
    }

    const status = await db.kanbanStatuses.get(values.statusId);
    if (!status || status.deletedAt) {
      throw new Error("Task requires an active Kanban status.");
    }

    const now = new Date().toISOString();
    const next: Task = {
      id: createId("task"),
      projectId: values.projectId,
      title: values.title.trim(),
      description: normalizeEditorJson(values.description ?? EMPTY_EDITOR_JSON),
      statusId: values.statusId,
      priority: values.priority,
      dueDate: normalizeOptional(values.dueDate),
      estimateMinutes: values.estimateMinutes,
      billable: values.billable,
      createdAt: now,
      updatedAt: now
    };

    await db.tasks.add(next);
    return next;
  },

  async update(id: string, values: TaskFormValues): Promise<Task | undefined> {
    const existing = await db.tasks.get(id);
    if (!existing) {
      return undefined;
    }

    if (!values.projectId.trim()) {
      throw new Error("Task requires a project.");
    }

    const next: Task = {
      ...existing,
      projectId: values.projectId,
      title: values.title.trim(),
      description: normalizeEditorJson(values.description ?? EMPTY_EDITOR_JSON),
      statusId: values.statusId,
      priority: values.priority,
      dueDate: normalizeOptional(values.dueDate),
      estimateMinutes: values.estimateMinutes,
      billable: values.billable,
      updatedAt: new Date().toISOString()
    };

    await db.tasks.put(next);
    return next;
  },

  async moveToStatus(id: string, statusId: string) {
    const status = await db.kanbanStatuses.get(statusId);
    if (!status || status.deletedAt) {
      throw new Error("Task requires an active Kanban status.");
    }

    await db.tasks.update(id, {
      statusId,
      updatedAt: new Date().toISOString()
    });
  },

  async softDelete(id: string) {
    const now = new Date().toISOString();
    await db.tasks.update(id, { deletedAt: now, updatedAt: now });
  },

  toFormValues(task: Task): TaskFormValues {
    return {
      projectId: task.projectId,
      title: task.title,
      description: task.description ?? EMPTY_EDITOR_JSON,
      statusId: task.statusId,
      priority: task.priority,
      dueDate: task.dueDate ?? "",
      estimateMinutes: task.estimateMinutes,
      billable: task.billable
    };
  }
};
