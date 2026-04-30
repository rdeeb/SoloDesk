import { useLiveQuery } from "dexie-react-hooks";
import { Navigate, useParams } from "react-router-dom";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { Button } from "@/shared/components/ui/button";

function formatCurrency(amount: number, currency: string) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency
  });
}

export function InvoicePrintPage() {
  const params = useParams<{ invoiceId: string }>();
  const invoiceWithItems = useLiveQuery(
    async () => {
      if (!params.invoiceId) {
        return undefined;
      }
      return invoiceRepository.getWithItems(params.invoiceId);
    },
    [params.invoiceId],
    null
  );

  if (!params.invoiceId) {
    return <Navigate to="/invoices" replace />;
  }

  if (invoiceWithItems === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading print preview...</div>;
  }

  if (!invoiceWithItems) {
    return <Navigate to="/invoices" replace />;
  }

  const { invoice, items } = invoiceWithItems;

  return (
    <div className="mx-auto max-w-3xl space-y-4 bg-background p-4 print:p-0">
      <div className="flex items-center justify-end print:hidden">
        <Button onClick={() => window.print()}>Print</Button>
      </div>
      <section className="rounded-lg border bg-card p-6 print:rounded-none print:border-none print:p-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Invoice {invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">Issue Date: {invoice.issueDate}</p>
            {invoice.dueDate ? <p className="text-sm text-muted-foreground">Due Date: {invoice.dueDate}</p> : null}
          </div>
          <p className="text-sm uppercase tracking-wide">{invoice.status}</p>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left font-medium">Description</th>
              <th className="py-2 text-left font-medium">Qty</th>
              <th className="py-2 text-left font-medium">Unit</th>
              <th className="py-2 text-left font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td className="py-2">{formatCurrency(item.total, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-1 text-sm">
          <p>Subtotal: {formatCurrency(invoice.subtotal, invoice.currency)}</p>
          <p>Tax: {formatCurrency(invoice.taxTotal, invoice.currency)}</p>
          <p>Discount: {formatCurrency(invoice.discountTotal ?? 0, invoice.currency)}</p>
          <p className="text-lg font-semibold">Total: {formatCurrency(invoice.total, invoice.currency)}</p>
        </div>

        {invoice.notes ? <p className="mt-4 whitespace-pre-wrap text-sm">{invoice.notes}</p> : null}
      </section>
    </div>
  );
}
