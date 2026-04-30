import { describe, expect, it } from "vitest";
import { clientRepository } from "@/modules/clients/client.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { timeRepository } from "@/modules/time/time.repository";

describe("timeRepository", () => {
  it("requires an active project and supports soft delete", async () => {
    await expect(
      timeRepository.create({
        projectId: "",
        taskId: undefined,
        description: "Planning",
        entryDate: "2026-04-20",
        durationMinutes: 60,
        billable: true
      })
    ).rejects.toThrow("project");

    const project = await projectRepository.create({
      name: "Time App",
      clientId: undefined,
      description: "",
      status: "active",
      hourlyRate: 120,
      budgetAmount: undefined,
      currency: "USD",
      startDate: "",
      dueDate: ""
    });

    const entry = await timeRepository.create({
      projectId: project.id,
      taskId: undefined,
      description: "Planning",
      entryDate: "2026-04-20",
      durationMinutes: 60,
      billable: true
    });

    expect(entry.hourlyRate).toBe(120);
    expect(await timeRepository.listActive()).toHaveLength(1);

    await timeRepository.softDelete(entry.id);
    expect(await timeRepository.listActive()).toHaveLength(0);
  });

  it("calculates billable summaries and client rollups through projects", async () => {
    const client = await clientRepository.create({
      name: "Acme",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      billingAddress: "",
      defaultHourlyRate: 80,
      currency: "USD",
      contractStatus: "active",
      notes: ""
    });

    const project = await projectRepository.create({
      name: "Retainer",
      clientId: client.id,
      description: "",
      status: "active",
      hourlyRate: undefined,
      budgetAmount: undefined,
      currency: "USD",
      startDate: "",
      dueDate: ""
    });

    await timeRepository.create({
      projectId: project.id,
      taskId: undefined,
      description: "Kickoff",
      entryDate: "2026-04-21",
      durationMinutes: 90,
      billable: true
    });
    await timeRepository.create({
      projectId: project.id,
      taskId: undefined,
      description: "Internal admin",
      entryDate: "2026-04-21",
      durationMinutes: 30,
      billable: false
    });

    const summary = await timeRepository.getBillableSummary();
    expect(summary.billableMinutes).toBe(90);
    expect(summary.billableAmount).toBe(120);

    const byClient = await timeRepository.getClientSummaries();
    expect(byClient).toHaveLength(1);
    expect(byClient[0]?.clientId).toBe(client.id);
    expect(byClient[0]?.billableMinutes).toBe(90);
  });
});
