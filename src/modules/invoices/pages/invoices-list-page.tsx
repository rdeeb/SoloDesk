import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { Button } from "@/shared/components/ui/button";

function formatCurrency(amount: number, currency: string) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency
  });
}

export function InvoicesListPage() {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const invoices = useLiveQuery(() => invoiceRepository.listActive({ projectId }), [projectId], []);
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const project = projects.find((item) => item.id === projectId);

  const clientNameById = new Map(clients.map((item) => [item.id, item.name]));
  const projectNameById = new Map(projects.map((item) => [item.id, item.name]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {project ? `${project.name} Invoices` : "Invoices"}
          </h2>
          <p className="text-sm text-muted-foreground">Draft, sent, paid, and void invoices.</p>
        </div>
        <Button onClick={() => navigate(projectId ? `/projects/${projectId}/invoices/new` : "/invoices/new")}>
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
                  <Link to={`/invoices/${invoice.id}`} className="font-medium hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
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
    </div>
  );
}
