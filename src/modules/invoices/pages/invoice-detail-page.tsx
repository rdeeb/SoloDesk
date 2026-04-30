import { useLiveQuery } from "dexie-react-hooks";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import type { Invoice } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";

function formatCurrency(amount: number, currency: string) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency
  });
}

export function InvoiceDetailPage() {
  const navigate = useNavigate();
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
  const client = useLiveQuery(
    async () => {
      if (!invoiceWithItems?.invoice.clientId) {
        return undefined;
      }
      return clientRepository.getById(invoiceWithItems.invoice.clientId);
    },
    [invoiceWithItems?.invoice.clientId],
    null
  );

  if (!params.invoiceId) {
    return <Navigate to="/invoices" replace />;
  }

  if (invoiceWithItems === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading invoice...</div>;
  }

  if (!invoiceWithItems) {
    return <Navigate to="/invoices" replace />;
  }

  const { invoice, items } = invoiceWithItems;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{invoice.invoiceNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {client ? <Link to={`/clients/${client.id}`} className="underline">{client.name}</Link> : "Client"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={invoice.status}
            onChange={(event) => {
              void invoiceRepository.updateStatus(invoice.id, event.target.value as Invoice["status"]);
            }}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="draft">draft</option>
            <option value="sent">sent</option>
            <option value="paid">paid</option>
            <option value="void">void</option>
          </select>
          <Button variant="outline" onClick={() => navigate(`/invoices/${invoice.id}/print`)}>
            Print Preview
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await invoiceRepository.softDelete(invoice.id);
              navigate("/invoices");
            }}
          >
            Move to trash
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatCurrency(item.total, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="mt-1 text-lg font-semibold">{formatCurrency(invoice.subtotal, invoice.currency)}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tax</p>
          <p className="mt-1 text-lg font-semibold">{formatCurrency(invoice.taxTotal, invoice.currency)}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Discount</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(invoice.discountTotal ?? 0, invoice.currency)}
          </p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="mt-1 text-lg font-semibold">{formatCurrency(invoice.total, invoice.currency)}</p>
        </article>
      </section>
    </div>
  );
}
