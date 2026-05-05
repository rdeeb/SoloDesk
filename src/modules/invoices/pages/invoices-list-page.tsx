import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { InvoiceForm } from "@/modules/invoices/components/invoice-form";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import type { Invoice } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";
import { Drawer } from "@/shared/components/ui/drawer";

function formatCurrency(amount: number, currency: string) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency
  });
}

export function InvoicesListPage() {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = params.projectId;
  const drawer = searchParams.get("drawer");
  const invoiceId = searchParams.get("invoiceId") ?? undefined;
  const clientIdFromQuery = searchParams.get("clientId") ?? undefined;
  const invoices = useLiveQuery(() => invoiceRepository.listActive({ projectId }), [projectId], []);
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const invoiceWithItems = useLiveQuery(
    async () => {
      if (!invoiceId) {
        return undefined;
      }
      return invoiceRepository.getWithItems(invoiceId);
    },
    [invoiceId],
    null
  );
  const project = projects.find((item) => item.id === projectId);

  const clientNameById = new Map(clients.map((item) => [item.id, item.name]));
  const projectNameById = new Map(projects.map((item) => [item.id, item.name]));
  const basePath = projectId ? `/projects/${projectId}/invoices` : "/invoices";

  function openDrawer(values: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) {
        next.set(key, value);
      }
    }
    navigate(`${basePath}?${next.toString()}`);
  }

  function closeDrawer() {
    navigate(basePath);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {project ? `${project.name} Invoices` : "Invoices"}
          </h2>
          <p className="text-sm text-muted-foreground">Draft, sent, paid, and void invoices.</p>
        </div>
        <Button onClick={() => openDrawer({ drawer: "new-invoice" })}>
          New invoice
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openDrawer({ invoiceId: invoice.id })}
                    className="font-medium hover:underline"
                  >
                    {invoice.invoiceNumber}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{clientNameById.get(invoice.clientId) ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {invoice.projectId ? projectNameById.get(invoice.projectId) ?? "-" : "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{invoice.status}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatCurrency(invoice.total, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted-foreground">No invoices yet.</p> : null}
      </section>

      <Drawer open={drawer === "new-invoice"} title="Create invoice" onClose={closeDrawer} className="max-w-4xl">
        <InvoiceForm
          lockedProjectId={projectId}
          lockedClientId={clientIdFromQuery}
          onSubmit={async (values) => {
            const created = await invoiceRepository.create(values);
            openDrawer({ invoiceId: created.invoice.id });
          }}
        />
      </Drawer>

      <Drawer
        open={Boolean(invoiceId)}
        title={invoiceWithItems?.invoice.invoiceNumber ?? "Invoice details"}
        description="Invoice management remains available from the Management area."
        onClose={closeDrawer}
        className="max-w-4xl"
      >
        {!invoiceWithItems ? (
          <p className="text-sm text-muted-foreground">Loading invoice...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={invoiceWithItems.invoice.status}
                onChange={(event) => {
                  void invoiceRepository.updateStatus(invoiceWithItems.invoice.id, event.target.value as Invoice["status"]);
                }}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="draft">draft</option>
                <option value="sent">sent</option>
                <option value="paid">paid</option>
                <option value="void">void</option>
              </select>
              <Button variant="outline" onClick={() => navigate(`/invoices/${invoiceWithItems.invoice.id}/print`)}>
                Print Preview
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await invoiceRepository.softDelete(invoiceWithItems.invoice.id);
                  closeDrawer();
                }}
              >
                Move to trash
              </Button>
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
                  {invoiceWithItems.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatCurrency(item.unitPrice, invoiceWithItems.invoice.currency)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatCurrency(item.total, invoiceWithItems.invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(invoiceWithItems.invoice.subtotal, invoiceWithItems.invoice.currency)}
                </p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Tax</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(invoiceWithItems.invoice.taxTotal, invoiceWithItems.invoice.currency)}
                </p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Discount</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(invoiceWithItems.invoice.discountTotal ?? 0, invoiceWithItems.invoice.currency)}
                </p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(invoiceWithItems.invoice.total, invoiceWithItems.invoice.currency)}
                </p>
              </article>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
