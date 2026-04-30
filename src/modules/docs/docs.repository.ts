import { db } from "@/db/db";
import { createId } from "@/shared/lib/id";
import type { Doc, EditorJSON } from "@/shared/types/domain";

function nowIso() {
  return new Date().toISOString();
}

function defaultContent(): EditorJSON {
  return {
    type: "doc",
    content: [{ type: "paragraph" }]
  };
}

export const docsRepository = {
  async listActive(): Promise<Doc[]> {
    const rows = await db.docs.toCollection().filter((doc) => !doc.deletedAt).toArray();
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async listStandalone(): Promise<Doc[]> {
    const rows = await db.docs.toCollection().filter((doc) => !doc.deletedAt && doc.isStandalone).toArray();
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async listByProjectId(projectId: string): Promise<Doc[]> {
    const rows = await db.docs
      .toCollection()
      .filter((doc) => !doc.deletedAt && doc.projectId === projectId)
      .toArray();
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async listRecent(limit = 5): Promise<Doc[]> {
    const rows = await this.listActive();
    return rows.slice(0, limit);
  },

  async getById(id: string): Promise<Doc | undefined> {
    return db.docs.get(id);
  },

  async createStandalone(title = "Untitled"): Promise<Doc> {
    const now = nowIso();
    const doc: Doc = {
      id: createId("doc"),
      title,
      content: defaultContent(),
      isStandalone: true,
      createdAt: now,
      updatedAt: now
    };
    await db.docs.add(doc);
    return doc;
  },

  async createForProject(projectId: string, title = "Untitled"): Promise<Doc> {
    const project = await db.projects.get(projectId);
    if (!project || project.deletedAt) {
      throw new Error("Project does not exist.");
    }

    const now = nowIso();
    const doc: Doc = {
      id: createId("doc"),
      projectId,
      title,
      content: defaultContent(),
      isStandalone: false,
      createdAt: now,
      updatedAt: now
    };
    await db.docs.add(doc);
    return doc;
  },

  async update(id: string, input: { title: string; content: EditorJSON }): Promise<Doc | undefined> {
    const current = await db.docs.get(id);
    if (!current) {
      return undefined;
    }

    const next: Doc = {
      ...current,
      title: input.title.trim() || "Untitled",
      content: input.content,
      updatedAt: nowIso()
    };
    await db.docs.put(next);
    return next;
  },

  async softDelete(id: string) {
    await db.docs.update(id, { deletedAt: nowIso(), updatedAt: nowIso() });
  }
};
