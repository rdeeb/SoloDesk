import { db } from "@/db/db";
import { createId } from "@/shared/lib/id";
import { textToEditorJson } from "@/shared/lib/editor-json";
import type { Project } from "@/shared/types/domain";
import type { ProjectFormValues } from "@/modules/projects/project.types";
import { normalizeCurrency } from "@/shared/types/currency";

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export const projectRepository = {
  async listActive(): Promise<Project[]> {
    const rows = await db.projects.toCollection().filter((project) => !project.deletedAt).toArray();
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async listActiveByClientId(clientId: string): Promise<Project[]> {
    const rows = await db.projects
      .where("clientId")
      .equals(clientId)
      .filter((project) => !project.deletedAt)
      .toArray();
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async create(values: ProjectFormValues): Promise<Project> {
    const now = new Date().toISOString();
    const next: Project = {
      id: createId("project"),
      clientId: values.clientId,
      name: values.name.trim(),
      description: textToEditorJson(values.description),
      status: values.status,
      hourlyRate: values.hourlyRate,
      budgetAmount: values.budgetAmount,
      currency: normalizeCurrency(values.currency),
      startDate: normalizeOptional(values.startDate),
      dueDate: normalizeOptional(values.dueDate),
      createdAt: now,
      updatedAt: now
    };

    await db.projects.add(next);
    return next;
  },

  async update(id: string, values: ProjectFormValues): Promise<Project | undefined> {
    const existing = await db.projects.get(id);
    if (!existing) {
      return undefined;
    }

    const next: Project = {
      ...existing,
      clientId: values.clientId,
      name: values.name.trim(),
      description: textToEditorJson(values.description),
      status: values.status,
      hourlyRate: values.hourlyRate,
      budgetAmount: values.budgetAmount,
      currency: normalizeCurrency(values.currency),
      startDate: normalizeOptional(values.startDate),
      dueDate: normalizeOptional(values.dueDate),
      updatedAt: new Date().toISOString()
    };

    await db.projects.put(next);
    return next;
  },

  async rename(id: string, name: string): Promise<Project | undefined> {
    const existing = await db.projects.get(id);
    if (!existing) {
      return undefined;
    }

    const next: Project = {
      ...existing,
      name: name.trim(),
      updatedAt: new Date().toISOString()
    };

    await db.projects.put(next);
    return next;
  },

  async softDelete(id: string) {
    const now = new Date().toISOString();
    await db.projects.update(id, { deletedAt: now, updatedAt: now });
  }
};
