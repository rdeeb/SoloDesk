import { describe, expect, it } from "vitest";
import { db } from "@/db/db";
import { clientRepository } from "@/modules/clients/client.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { taskRepository } from "@/modules/tasks/task.repository";
import { timeRepository } from "@/modules/time/time.repository";
import { EMPTY_EDITOR_JSON } from "@/shared/lib/editor-json";
import { CurrencyCode } from "@/shared/types/currency";

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
      currency: CurrencyCode.USD,
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
      currency: CurrencyCode.USD,
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
      currency: CurrencyCode.USD,
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

  it("filters time entries by task while preserving project ownership", async () => {
    const now = new Date().toISOString();
    await db.kanbanStatuses.add({
      id: "status-todo",
      name: "To Do",
      order: 1,
      isDone: false,
      createdAt: now,
      updatedAt: now
    });

    const project = await projectRepository.create({
      name: "Project workspace",
      clientId: undefined,
      description: "",
      status: "active",
      hourlyRate: 100,
      budgetAmount: undefined,
      currency: CurrencyCode.USD,
      startDate: "",
      dueDate: ""
    });
    const otherProject = await projectRepository.create({
      name: "Other workspace",
      clientId: undefined,
      description: "",
      status: "active",
      hourlyRate: 100,
      budgetAmount: undefined,
      currency: CurrencyCode.USD,
      startDate: "",
      dueDate: ""
    });
    const task = await taskRepository.create({
      projectId: project.id,
      title: "Build task drawer",
      description: EMPTY_EDITOR_JSON,
      statusId: "status-todo",
      priority: "high",
      dueDate: "",
      estimateMinutes: undefined,
      billable: true
    });

    const entry = await timeRepository.create({
      projectId: project.id,
      taskId: task.id,
      description: "Implementation",
      entryDate: "2026-04-22",
      durationMinutes: 120,
      billable: true
    });
    await timeRepository.create({
      projectId: project.id,
      taskId: undefined,
      description: "Project admin",
      entryDate: "2026-04-22",
      durationMinutes: 30,
      billable: true
    });

    await expect(
      timeRepository.create({
        projectId: otherProject.id,
        taskId: task.id,
        description: "Invalid cross-project time",
        entryDate: "2026-04-22",
        durationMinutes: 30,
        billable: true
      })
    ).rejects.toThrow("selected project");

    expect(await timeRepository.listActive({ projectId: project.id })).toHaveLength(2);
    expect(await timeRepository.listActive({ taskId: task.id })).toEqual([entry]);
    expect(await timeRepository.getBillableSummary({ taskId: task.id })).toEqual({
      billableMinutes: 120,
      billableAmount: 200
    });
  });
});
