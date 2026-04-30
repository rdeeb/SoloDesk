import { describe, expect, it } from "vitest";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { clientRepository } from "@/modules/clients/client.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { timeRepository } from "@/modules/time/time.repository";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";

describe("invoiceRepository", () => {
  it("auto-generates invoice numbers and increments next number", async () => {
    await settingsRepository.save({
      workspaceName: "SoloDesk",
      defaultCurrency: "USD",
      defaultHourlyRate: 100,
      taxEnabled: true,
      defaultTaxName: "VAT",
      defaultTaxRate: 10,
      invoicePrefix: "INV",
      nextInvoiceNumber: 7,
      dateFormat: "yyyy-MM-dd",
      setupCompleted: true
    });

    const client = await clientRepository.create({
      name: "Acme",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      billingAddress: "",
      defaultHourlyRate: 120,
      currency: "USD",
      contractStatus: "active",
      notes: ""
    });

    const created = await invoiceRepository.create({
      clientId: client.id,
      issueDate: "2026-04-28",
      manualItems: [{ description: "Design", quantity: 2, unitPrice: 100 }],
      timeEntryIds: []
    });

    expect(created.invoice.invoiceNumber).toBe("INV-0007");
    expect(created.invoice.subtotal).toBe(200);
    expect(created.invoice.taxTotal).toBe(20);
    expect(created.invoice.total).toBe(220);

    const settings = await settingsRepository.get();
    expect(settings?.nextInvoiceNumber).toBe(8);
  });

  it("creates line items from billable time entries", async () => {
    const client = await clientRepository.create({
      name: "Beta",
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
      name: "Beta Project",
      clientId: client.id,
      description: "",
      status: "active",
      hourlyRate: 150,
      budgetAmount: undefined,
      currency: "USD",
      startDate: "",
      dueDate: ""
    });
    const timeEntry = await timeRepository.create({
      projectId: project.id,
      taskId: undefined,
      description: "Implementation",
      entryDate: "2026-04-27",
      durationMinutes: 120,
      billable: true
    });

    const created = await invoiceRepository.create({
      clientId: client.id,
      projectId: project.id,
      issueDate: "2026-04-28",
      taxEnabled: false,
      manualItems: [],
      timeEntryIds: [timeEntry.id]
    });

    expect(created.items).toHaveLength(1);
    expect(created.items[0]?.sourceType).toBe("timeEntry");
    expect(created.items[0]?.total).toBe(300);
    expect(created.invoice.subtotal).toBe(300);
    expect(created.invoice.total).toBe(300);
  });
});
