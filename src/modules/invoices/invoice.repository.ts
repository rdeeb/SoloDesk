import { db } from "@/db/db";
import { createId } from "@/shared/lib/id";
import { invoiceLineItemRepository } from "@/modules/invoices/invoice-line-item.repository";
import type { BillableTimeCandidate, InvoiceCreateValues, InvoiceWithItems } from "@/modules/invoices/invoice.types";
import type { Invoice, InvoiceLineItem } from "@/shared/types/domain";
import { CurrencyCode } from "@/shared/types/currency";

function formatInvoiceNumber(prefix: string, sequence: number) {
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function computeTotals(items: InvoiceLineItem[], taxEnabled: boolean, taxRate?: number, discountTotal?: number) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const normalizedDiscount = discountTotal ?? 0;
  const taxableBase = Math.max(0, subtotal - normalizedDiscount);
  const normalizedRate = taxEnabled && taxRate ? taxRate : 0;
  const taxTotal = taxEnabled ? taxableBase * (normalizedRate / 100) : 0;
  const total = taxableBase + taxTotal;

  return {
    subtotal,
    taxTotal,
    discountTotal: normalizedDiscount || undefined,
    total
  };
}

export const invoiceRepository = {
  async listActive(filters: { clientId?: string; projectId?: string } = {}): Promise<Invoice[]> {
    const rows = await db.invoices.toCollection().filter((invoice) => !invoice.deletedAt).toArray();
    return rows
      .filter((invoice) => (filters.clientId ? invoice.clientId === filters.clientId : true))
      .filter((invoice) => (filters.projectId ? invoice.projectId === filters.projectId : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getById(id: string): Promise<Invoice | undefined> {
    return db.invoices.get(id);
  },

  async getWithItems(id: string): Promise<InvoiceWithItems | undefined> {
    const invoice = await this.getById(id);
    if (!invoice || invoice.deletedAt) {
      return undefined;
    }
    const items = await invoiceLineItemRepository.listActiveByInvoiceId(id);
    return { invoice, items };
  },

  async updateStatus(id: string, status: Invoice["status"]) {
    await db.invoices.update(id, {
      status,
      updatedAt: new Date().toISOString()
    });
  },

  async softDelete(id: string) {
    const now = new Date().toISOString();
    await db.invoices.update(id, { deletedAt: now, updatedAt: now });
  },

  async listBillableTimeCandidates(clientId: string, projectId?: string): Promise<BillableTimeCandidate[]> {
    const [projects, entries, existingLineItems] = await Promise.all([
      db.projects.toCollection().filter((project) => !project.deletedAt).toArray(),
      db.timeEntries.toCollection().filter((entry) => !entry.deletedAt && entry.billable).toArray(),
      db.invoiceLineItems.toCollection().filter((item) => !item.deletedAt && item.sourceType === "timeEntry").toArray()
    ]);

    const projectById = new Map(projects.map((project) => [project.id, project]));
    const usedTimeEntryIds = new Set(existingLineItems.map((item) => item.sourceId).filter(Boolean));

    return entries
      .filter((entry) => !usedTimeEntryIds.has(entry.id))
      .map((entry) => ({ entry, project: projectById.get(entry.projectId) }))
      .filter((x): x is { entry: BillableTimeCandidate; project: NonNullable<typeof x.project> } => Boolean(x.project))
      .filter((x) => x.project.clientId === clientId)
      .filter((x) => (projectId ? x.project.id === projectId : true))
      .map(({ entry, project }) => ({
        ...entry,
        clientId,
        projectName: project.name
      }))
      .sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  },

  async create(values: InvoiceCreateValues): Promise<InvoiceWithItems> {
    if (!values.clientId.trim()) {
      throw new Error("Invoice requires a client.");
    }

    const client = await db.clients.get(values.clientId);
    if (!client || client.deletedAt) {
      throw new Error("Invoice requires an active client.");
    }

    if (values.projectId) {
      const project = await db.projects.get(values.projectId);
      if (!project || project.deletedAt) {
        throw new Error("Selected project does not exist.");
      }
      if (project.clientId && project.clientId !== values.clientId) {
        throw new Error("Project does not belong to selected client.");
      }
    }

    const selectedTimeEntries = values.timeEntryIds.length
      ? await db.timeEntries.bulkGet(values.timeEntryIds)
      : [];

    const missingTimeEntries = selectedTimeEntries.some((entry) => !entry || entry.deletedAt || !entry.billable);
    if (missingTimeEntries) {
      throw new Error("Selected billable time entries are invalid.");
    }

    const settings = await db.settings.get("workspace");
    const prefix = settings?.invoicePrefix ?? "INV";
    const nextNumber = settings?.nextInvoiceNumber ?? 1;
    const invoiceNumber = formatInvoiceNumber(prefix, nextNumber);

    const manualItems = values.manualItems
      .filter((item) => item.description.trim())
      .map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        sourceType: "manual" as const,
        sourceId: undefined
      }));

    const timeItems = selectedTimeEntries
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .map((entry) => {
        const quantity = Number((entry.durationMinutes / 60).toFixed(2));
        const unitPrice = entry.hourlyRate ?? 0;
        return {
          description: entry.description || `Billable time on ${entry.entryDate}`,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
          sourceType: "timeEntry" as const,
          sourceId: entry.id
        };
      });

    const now = new Date().toISOString();
    const taxEnabled = values.taxEnabled ?? settings?.taxEnabled ?? false;
    const taxRate = taxEnabled ? values.taxRate ?? settings?.defaultTaxRate : undefined;
    const taxName = taxEnabled ? normalizeOptional(values.taxName ?? settings?.defaultTaxName) : undefined;

    return db.transaction("rw", db.invoices, db.invoiceLineItems, db.settings, async () => {
      const invoiceId = createId("invoice");
      const createdItems = await invoiceLineItemRepository.createMany(invoiceId, [...manualItems, ...timeItems]);
      const totals = computeTotals(createdItems, taxEnabled, taxRate, values.discountTotal);

      const invoice: Invoice = {
        id: invoiceId,
        clientId: values.clientId,
        projectId: values.projectId,
        invoiceNumber,
        status: values.status ?? "draft",
        issueDate: values.issueDate,
        dueDate: normalizeOptional(values.dueDate),
        currency: values.currency ?? settings?.defaultCurrency ?? CurrencyCode.USD,
        taxEnabled,
        taxName,
        taxRate,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        total: totals.total,
        notes: normalizeOptional(values.notes),
        createdAt: now,
        updatedAt: now
      };

      await db.invoices.add(invoice);
      await db.settings.put({
        id: "workspace",
        workspaceName: settings?.workspaceName ?? "Workspace",
        defaultCurrency: settings?.defaultCurrency ?? CurrencyCode.USD,
        defaultHourlyRate: settings?.defaultHourlyRate,
        taxEnabled: settings?.taxEnabled ?? false,
        defaultTaxName: settings?.defaultTaxName,
        defaultTaxRate: settings?.defaultTaxRate,
        invoicePrefix: prefix,
        nextInvoiceNumber: nextNumber + 1,
        dateFormat: settings?.dateFormat ?? "yyyy-MM-dd",
        setupCompleted: settings?.setupCompleted ?? true,
        createdAt: settings?.createdAt ?? now,
        updatedAt: now
      });

      return {
        invoice,
        items: createdItems
      };
    });
  }
};
