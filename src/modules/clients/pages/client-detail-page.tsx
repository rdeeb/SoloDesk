import { useLiveQuery } from "dexie-react-hooks";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { Button } from "@/shared/components/ui/button";
import { editorJsonToText } from "@/shared/lib/editor-json";

export function ClientDetailPage() {
  const navigate = useNavigate();
  const params = useParams<{ clientId: string }>();
  const client = useLiveQuery(
    async () => {
      if (!params.clientId) {
        return undefined;
      }
      return clientRepository.getById(params.clientId);
    },
    [params.clientId],
    null
  );
  const projects = useLiveQuery(
    async () => {
      if (!params.clientId) {
        return [];
      }
      return projectRepository.listActiveByClientId(params.clientId);
    },
    [params.clientId],
    []
  );
  const invoices = useLiveQuery(
    async () => {
      if (!params.clientId) {
        return [];
      }
      return invoiceRepository.listActive({ clientId: params.clientId });
    },
    [params.clientId],
    []
  );

  if (!params.clientId) {
    return <Navigate to="/clients" replace />;
  }

  if (client === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading client...</div>;
  }

  if (!client || client.deletedAt) {
    return <Navigate to="/clients" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{client.name}</h2>
          <p className="text-sm text-muted-foreground">{client.companyName ?? "No company set"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/clients/${client.id}/edit`)}>
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await clientRepository.softDelete(client.id);
              navigate("/clients");
            }}
          >
            Move to trash
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Contact</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Contact person</dt>
              <dd>{client.contactPerson ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{client.email ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{client.phone ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd>{client.website ?? "-"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Billing</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd className="whitespace-pre-wrap">{client.billingAddress ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Hourly rate</dt>
              <dd>{client.defaultHourlyRate ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{client.currency ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Contract status</dt>
              <dd>{client.contractStatus ?? "-"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <article className="rounded-lg border bg-card p-4">
        <h3 className="font-medium">Notes</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{editorJsonToText(client.notes) || "-"}</p>
      </article>

      <article className="rounded-lg border bg-card p-4">
        <h3 className="font-medium">Projects</h3>
        {projects.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No active projects linked to this client.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link to={`/projects/${project.id}`} className="text-sm font-medium hover:underline">
                  {project.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Invoices</h3>
          <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/new?clientId=${client.id}`)}>
            New invoice
          </Button>
        </div>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No invoices for this client yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="text-sm">
                <Link to={`/invoices/${invoice.id}`} className="font-medium hover:underline">
                  {invoice.invoiceNumber}
                </Link>
                <span className="ml-2 text-muted-foreground">{invoice.status}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}
