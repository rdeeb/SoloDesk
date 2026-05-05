import type { Invoice, InvoiceLineItem, TimeEntry } from "@/shared/types/domain";
import type { CurrencyCode } from "@/shared/types/currency";

export interface ManualInvoiceLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceCreateValues {
  clientId: string;
  projectId?: string;
  issueDate: string;
  dueDate?: string;
  currency?: CurrencyCode;
  taxEnabled?: boolean;
  taxName?: string;
  taxRate?: number;
  discountTotal?: number;
  status?: Invoice["status"];
  notes?: string;
  manualItems: ManualInvoiceLineItemInput[];
  timeEntryIds: string[];
}

export interface InvoiceWithItems {
  invoice: Invoice;
  items: InvoiceLineItem[];
}

export interface BillableTimeCandidate extends TimeEntry {
  projectName: string;
  clientId: string;
}
