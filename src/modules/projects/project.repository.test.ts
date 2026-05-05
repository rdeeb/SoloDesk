import { describe, expect, it } from "vitest";
import { projectRepository } from "@/modules/projects/project.repository";
import { CurrencyCode } from "@/shared/types/currency";

describe("projectRepository", () => {
  it("renames an existing project without changing its other editable fields", async () => {
    const project = await projectRepository.create({
      name: "Original",
      clientId: undefined,
      description: "Project notes",
      status: "active",
      hourlyRate: 125,
      budgetAmount: 5000,
      currency: CurrencyCode.USD,
      startDate: "2026-04-01",
      dueDate: "2026-04-30"
    });

    await expect(projectRepository.rename(project.id, "Renamed")).resolves.toMatchObject({
      id: project.id,
      name: "Renamed",
      status: "active",
      hourlyRate: 125,
      budgetAmount: 5000,
      currency: CurrencyCode.USD,
      startDate: "2026-04-01",
      dueDate: "2026-04-30"
    });
  });
});
