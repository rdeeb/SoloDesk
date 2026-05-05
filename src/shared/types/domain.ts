import type { CurrencyCode } from "@/shared/types/currency";

export type EditorJSON = Record<string, unknown>;

export interface WorkspaceSettings {
  id: string;
  workspaceName: string;
  defaultCurrency: CurrencyCode;
  defaultHourlyRate?: number;
  taxEnabled: boolean;
  defaultTaxName?: string;
  defaultTaxRate?: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  dateFormat: string;
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  billingAddress?: string;
  defaultHourlyRate?: number;
  currency?: CurrencyCode;
  contractStatus?: "lead" | "active" | "paused" | "completed" | "lost";
  notes?: EditorJSON;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Project {
  id: string;
  clientId?: string;
  name: string;
  description?: EditorJSON;
  status: "active" | "paused" | "completed" | "archived";
  hourlyRate?: number;
  budgetAmount?: number;
  currency?: CurrencyCode;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface KanbanStatus {
  id: string;
  name: string;
  order: number;
  color?: string;
  isDefault?: boolean;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: EditorJSON;
  statusId: string;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  estimateMinutes?: number;
  billable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Doc {
  id: string;
  projectId?: string;
  title: string;
  content: EditorJSON;
  isStandalone: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId?: string;
  description?: string;
  entryDate: string;
  durationMinutes: number;
  billable: boolean;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "void";
  issueDate: string;
  dueDate?: string;
  currency: CurrencyCode;
  taxEnabled: boolean;
  taxName?: string;
  taxRate?: number;
  subtotal: number;
  taxTotal: number;
  discountTotal?: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  sourceType?: "manual" | "timeEntry";
  sourceId?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
