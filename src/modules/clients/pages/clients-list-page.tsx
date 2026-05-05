import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Edit, Plus } from "lucide-react";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientRepository } from "@/modules/clients/client.repository";
import type { ClientFormValues } from "@/modules/clients/client.types";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { Button } from "@/shared/components/ui/button";
import { Drawer } from "@/shared/components/ui/drawer";
import { editorJsonToText } from "@/shared/lib/editor-json";

function toFormValues(client: Awaited<ReturnType<typeof clientRepository.getById>>): ClientFormValues {
  return {
    name: client?.name ?? "",
    companyName: client?.companyName ?? "",
    contactPerson: client?.contactPerson ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    website: client?.website ?? "",
    billingAddress: client?.billingAddress ?? "",
    defaultHourlyRate: client?.defaultHourlyRate,
    currency: client?.currency ?? "",
    contractStatus: client?.contractStatus,
    notes: editorJsonToText(client?.notes)
  };
}

export function ClientsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const drawer = searchParams.get("drawer");
  const clientId = searchParams.get("clientId") ?? undefined;
  const selectedClient = useLiveQuery(
    async () => {
      if (!clientId) {
        return undefined;
      }
      return clientRepository.getById(clientId);
    },
    [clientId],
    null
  );
  const selectedClientInitialValues = useMemo(
    () => (selectedClient ? toFormValues(selectedClient) : undefined),
    [selectedClient]
  );
  const selectedClientProjects = useLiveQuery(
    () => (clientId ? projectRepository.listActiveByClientId(clientId) : Promise.resolve([])),
    [clientId],
    []
  );
  const selectedClientInvoices = useLiveQuery(
    () => (clientId ? invoiceRepository.listActive({ clientId }) : Promise.resolve([])),
    [clientId],
    []
  );

  function openDrawer(values: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) {
        next.set(key, value);
      }
    }
    navigate(`/clients?${next.toString()}`);
  }

  function closeDrawer() {
    navigate("/clients");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Clients</h2>
          <p className="text-sm text-muted-foreground">Manage your client directory.</p>
        </div>
        <Button onClick={() => openDrawer({ drawer: "new-client" })} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New client
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Currency</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openDrawer({ clientId: client.id })}
                    className="font-medium hover:underline"
                  >
                    {client.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{client.companyName ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{client.contractStatus ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{client.currency ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No clients yet. Create your first client.</div>
        ) : null}
      </div>

      <Drawer open={drawer === "new-client"} title="Create client" onClose={closeDrawer}>
        <ClientForm
          submitLabel="Create client"
          onSubmit={async (values) => {
            const created = await clientRepository.create(values);
            openDrawer({ clientId: created.id });
          }}
        />
      </Drawer>

      <Drawer
        open={Boolean(clientId) && drawer !== "edit-client"}
        title={selectedClient?.name ?? "Client details"}
        description="Client context stays in Management while projects remain primary."
        onClose={closeDrawer}
      >
        {!selectedClient || selectedClient.deletedAt ? (
          <p className="text-sm text-muted-foreground">Loading client...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openDrawer({ drawer: "edit-client", clientId: selectedClient.id })} className="gap-2">
                <Edit className="h-4 w-4" aria-hidden="true" />
                Edit client
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await clientRepository.softDelete(selectedClient.id);
                  closeDrawer();
                }}
              >
                Move to trash
              </Button>
            </div>
            <section className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-lg border bg-card p-4">
                <h3 className="font-medium">Contact</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Contact person</dt>
                    <dd>{selectedClient.contactPerson ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{selectedClient.email ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{selectedClient.phone ?? "-"}</dd>
                  </div>
                </dl>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <h3 className="font-medium">Billing</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Hourly rate</dt>
                    <dd>{selectedClient.defaultHourlyRate ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Currency</dt>
                    <dd>{selectedClient.currency ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>{selectedClient.contractStatus ?? "-"}</dd>
                  </div>
                </dl>
              </article>
            </section>
            <section className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Projects</h3>
              {selectedClientProjects.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No active projects linked to this client.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {selectedClientProjects.map((project) => (
                    <li key={project.id}>
                      <Link to={`/projects/${project.id}/tasks`} className="text-sm font-medium hover:underline">
                        {project.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Invoices</h3>
                <Button variant="outline" size="sm" onClick={() => navigate(`/invoices?drawer=new-invoice&clientId=${selectedClient.id}`)}>
                  New invoice
                </Button>
              </div>
              {selectedClientInvoices.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No invoices for this client yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {selectedClientInvoices.map((invoice) => (
                    <li key={invoice.id} className="text-sm">
                      <Link to={`/invoices?invoiceId=${invoice.id}`} className="font-medium hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                      <span className="ml-2 text-muted-foreground">{invoice.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </Drawer>

      <Drawer open={drawer === "edit-client"} title="Edit client" onClose={closeDrawer}>
        {!selectedClient || selectedClient.deletedAt ? (
          <p className="text-sm text-muted-foreground">Loading client...</p>
        ) : (
          <ClientForm
            initialValues={selectedClientInitialValues}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await clientRepository.update(selectedClient.id, values);
              openDrawer({ clientId: selectedClient.id });
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
