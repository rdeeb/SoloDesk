import { describe, expect, it } from "vitest";
import { db } from "@/db/db";
import { docsRepository } from "@/modules/docs/docs.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { CurrencyCode } from "@/shared/types/currency";

describe("docsRepository", () => {
  it("creates standalone and project docs, updates them, and excludes soft-deleted docs", async () => {
    const project = await projectRepository.create({
      name: "Docs migration",
      clientId: undefined,
      description: "",
      status: "active",
      hourlyRate: undefined,
      budgetAmount: undefined,
      currency: CurrencyCode.USD,
      startDate: "",
      dueDate: ""
    });

    const standalone = await docsRepository.createStandalone("Workspace Notes");
    const projectDoc = await docsRepository.createForProject(project.id, "Project Spec");

    expect(standalone.isStandalone).toBe(true);
    expect(projectDoc.projectId).toBe(project.id);

    await docsRepository.update(projectDoc.id, {
      title: "Project Spec v2",
      content: { type: "doc", content: [{ type: "paragraph" }] }
    });

    const updated = await docsRepository.getById(projectDoc.id);
    expect(updated?.title).toBe("Project Spec v2");

    const active = await docsRepository.listActive();
    expect(active).toHaveLength(2);

    await docsRepository.softDelete(standalone.id);

    const afterDelete = await docsRepository.listActive();
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0]?.id).toBe(projectDoc.id);
  });

  it("returns recent docs ordered by update time", async () => {
    await db.docs.add({
      id: "doc-old",
      title: "Old",
      content: {},
      isStandalone: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });
    await db.docs.add({
      id: "doc-new",
      title: "New",
      content: {},
      isStandalone: true,
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z"
    });

    const recent = await docsRepository.listRecent(1);
    expect(recent).toHaveLength(1);
    expect(recent[0]?.id).toBe("doc-new");
  });
});
