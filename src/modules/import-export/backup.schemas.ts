import { z } from "zod";
import { CURRENCY_OPTIONS } from "@/shared/types/currency";

const maybeString = z.string().optional();
const maybeNumber = z.number().optional();
const currencySchema = z.enum(CURRENCY_OPTIONS);
const maybeCurrencySchema = currencySchema.optional();

const workspaceSettingsSchema = z.object({
  id: z.string(),
  workspaceName: z.string(),
  defaultCurrency: currencySchema,
  defaultHourlyRate: maybeNumber,
  taxEnabled: z.boolean(),
  defaultTaxName: maybeString,
  defaultTaxRate: maybeNumber,
  invoicePrefix: z.string(),
  nextInvoiceNumber: z.number(),
  dateFormat: z.string(),
  setupCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  companyName: maybeString,
  contactPerson: maybeString,
  email: maybeString,
  phone: maybeString,
  website: maybeString,
  billingAddress: maybeString,
  defaultHourlyRate: maybeNumber,
  currency: maybeCurrencySchema,
  contractStatus: z.enum(["lead", "active", "paused", "completed", "lost"]).optional(),
  notes: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: maybeString
});

const projectSchema = z.object({
  id: z.string(),
  clientId: maybeString,
  name: z.string(),
  description: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["active", "paused", "completed", "archived"]),
  hourlyRate: maybeNumber,
  budgetAmount: maybeNumber,
  currency: maybeCurrencySchema,
  startDate: maybeString,
  dueDate: maybeString,
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: maybeString
});

const kanbanStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
  color: maybeString,
  isDefault: z.boolean().optional(),
  isDone: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: maybeString
});

const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.record(z.string(), z.unknown()).optional(),
  statusId: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: maybeString,
  estimateMinutes: maybeNumber,
  billable: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: maybeString
});

const docSchema = z.object({
  id: z.string(),
  projectId: maybeString,
  title: z.string(),
  content: z.record(z.string(), z.unknown()),
  isStandalone: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: maybeString
});

const timeEntrySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  taskId: maybeString,
  description: maybeString,
  entryDate: z.string(),
  durationMinutes: z.number(),
  billable: z.boolean(),
  hourlyRate: maybeNumber,
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: maybeString
});

const invoiceSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  projectId: maybeString,
  invoiceNumber: z.string(),
  status: z.enum(["draft", "sent", "paid", "void"]),
  issueDate: z.string(),
  dueDate: maybeString,
  currency: currencySchema,
  taxEnabled: z.boolean(),
  taxName: maybeString,
  taxRate: maybeNumber,
  subtotal: z.number(),
  taxTotal: z.number(),
  discountTotal: maybeNumber,
  total: z.number(),
  notes: maybeString,
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: maybeString
});

const invoiceLineItemSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  sourceType: z.enum(["manual", "timeEntry"]).optional(),
  sourceId: maybeString,
  total: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: maybeString
});

export const soloDeskBackupSchema = z.object({
  appName: z.literal("SoloDesk"),
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  data: z.object({
    settings: z.array(workspaceSettingsSchema),
    clients: z.array(clientSchema),
    projects: z.array(projectSchema),
    kanbanStatuses: z.array(kanbanStatusSchema),
    tasks: z.array(taskSchema),
    docs: z.array(docSchema),
    timeEntries: z.array(timeEntrySchema),
    invoices: z.array(invoiceSchema),
    invoiceLineItems: z.array(invoiceLineItemSchema)
  })
});

export type SoloDeskBackup = z.infer<typeof soloDeskBackupSchema>;
