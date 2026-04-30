import { db } from "@/db/db";
import { createId } from "@/shared/lib/id";
import type { InvoiceLineItem } from "@/shared/types/domain";

export const invoiceLineItemRepository = {
  async listActiveByInvoiceId(invoiceId: string): Promise<InvoiceLineItem[]> {
    const rows = await db.invoiceLineItems
      .toCollection()
      .filter((item) => item.invoiceId === invoiceId && !item.deletedAt)
      .toArray();
    return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async createMany(
    invoiceId: string,
    items: Array<
      Omit<InvoiceLineItem, "id" | "invoiceId" | "createdAt" | "updatedAt" | "deletedAt">
    >
  ): Promise<InvoiceLineItem[]> {
    const now = new Date().toISOString();
    const rows: InvoiceLineItem[] = items.map((item) => ({
      ...item,
      id: createId("invoice-item"),
      invoiceId,
      createdAt: now,
      updatedAt: now
    }));

    await db.invoiceLineItems.bulkAdd(rows);
    return rows;
  }
};
