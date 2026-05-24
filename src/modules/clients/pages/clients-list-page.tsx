import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Edit, Plus, User } from "lucide-react";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientRepository } from "@/modules/clients/client.repository";
import type { ClientFormValues } from "@/modules/clients/client.types";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { projectRepository } from "@/modules/projects/project.repository";
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
    notes: editorJsonToText(client?.notes),
  };
}

function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function PropRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="sd-prop-row">
      <span className="label">{label}</span>
      <span className="value">{value ?? "—"}</span>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  lost: "Lost",
};

export function ClientsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const drawer = searchParams.get("drawer");
  const clientId = searchParams.get("clientId") ?? undefined;

  const selectedClient = useLiveQuery(
    async () => {
      if (!clientId) return undefined;
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
      if (value) next.set(key, value);
    }
    navigate(`/clients?${next.toString()}`);
  }

  function closeDrawer() {
    navigate("/clients");
  }

  return (
    <div className="sd-page">
      {/* Page head */}
      <div className="sd-page-head">
        <div className="sd-page-emoji outline">
          <User size={18} />
        </div>
        <div>
          <h1 className="sd-page-title">Clients</h1>
          <div className="sd-page-subtitle">
            <span className="mono">{clients.length}</span> clients
          </div>
        </div>
      </div>

      {/* Clients table */}
      <div className="sd-tbl">
        <div className="sd-tbl-head" style={{ gridTemplateColumns: "32px 1fr 140px 100px 80px" }}>
          <div />
          <div>Name</div>
          <div>Company</div>
          <div>Status</div>
          <div style={{ textAlign: "right" }}>Currency</div>
        </div>

        {clients.map((client) => (
          <div
            key={client.id}
            className="sd-tbl-row"
            style={{ gridTemplateColumns: "32px 1fr 140px 100px 80px" }}
            onClick={() => openDrawer({ clientId: client.id })}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 5,
              background: "#0e0e10", color: "#fff",
              display: "inline-grid", placeItems: "center",
              fontWeight: 700, fontSize: 9, flexShrink: 0,
            }}>
              {clientInitials(client.name)}
            </div>
            <div className="ttl">{client.name}</div>
            <div className="muted">{client.companyName ?? "—"}</div>
            <div>
              {client.contractStatus ? (
                <span className="sd-pill">{STATUS_LABELS[client.contractStatus] ?? client.contractStatus}</span>
              ) : (
                <span className="muted">—</span>
              )}
            </div>
            <div className="num muted" style={{ textAlign: "right" }}>{client.currency || "—"}</div>
          </div>
        ))}

        {clients.length === 0 && (
          <div style={{ padding: "32px 14px", textAlign: "center", color: "var(--fg-muted)", fontSize: 13 }}>
            No clients yet.{" "}
            <button
              type="button"
              style={{ color: "var(--fg)", textDecoration: "underline", cursor: "pointer", background: "none", border: "none", font: "inherit" }}
              onClick={() => openDrawer({ drawer: "new-client" })}
            >
              Create your first client
            </button>
          </div>
        )}
      </div>

      {/* New client drawer */}
      <Drawer
        open={drawer === "new-client"}
        title="New client"
        description="Add a client to your workspace."
        onClose={closeDrawer}
        footer={
          <>
            <button type="button" className="sd-btn ghost" onClick={closeDrawer}>Cancel</button>
            <button type="submit" form="new-client-form" className="sd-btn">
              <Plus size={13} /> Create client
            </button>
          </>
        }
      >
        <ClientForm
          formId="new-client-form"
          submitLabel="Create client"
          onSubmit={async (values) => {
            const created = await clientRepository.create(values);
            openDrawer({ clientId: created.id });
          }}
        />
      </Drawer>

      {/* Client detail drawer */}
      <Drawer
        open={Boolean(clientId) && drawer !== "edit-client"}
        title={selectedClient?.name ?? "Client"}
        description={selectedClient?.companyName ?? "Client details"}
        onClose={closeDrawer}
        footer={
          <button
            type="button"
            className="sd-btn ghost"
            onClick={() => selectedClient && openDrawer({ drawer: "edit-client", clientId: selectedClient.id })}
          >
            <Edit size={13} /> Edit client
          </button>
        }
      >
        {!selectedClient || selectedClient.deletedAt ? (
          <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Properties */}
            <div>
              <div className="sd-section-title">Properties</div>
              <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 6, background: "#fff" }}>
                <PropRow label="Contact" value={selectedClient.contactPerson} />
                <PropRow label="Email" value={selectedClient.email ? <a href={`mailto:${selectedClient.email}`} style={{ color: "var(--fg)" }}>{selectedClient.email}</a> : null} />
                <PropRow label="Phone" value={selectedClient.phone} />
                <PropRow label="Website" value={selectedClient.website ? <a href={selectedClient.website} target="_blank" rel="noreferrer" style={{ color: "var(--fg)" }}>{selectedClient.website}</a> : null} />
                <PropRow label="Rate" value={selectedClient.defaultHourlyRate ? `${selectedClient.defaultHourlyRate}/h` : null} />
                <PropRow label="Currency" value={selectedClient.currency} />
                <PropRow label="Status" value={selectedClient.contractStatus ? STATUS_LABELS[selectedClient.contractStatus] : null} />
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="sd-section-title">
                Projects
                <div className="right">
                  <span className="mono" style={{ color: "var(--fg-muted)", fontSize: 12 }}>{selectedClientProjects.length}</span>
                </div>
              </div>
              <div className="sd-tbl">
                {selectedClientProjects.map((project) => (
                  <div
                    key={project.id}
                    className="sd-tbl-row"
                    style={{ gridTemplateColumns: "1fr 20px", height: 36 }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="ttl">{project.name}</div>
                    <ChevronRight size={13} style={{ color: "var(--fg-muted)" }} />
                  </div>
                ))}
                {selectedClientProjects.length === 0 && (
                  <div style={{ padding: "16px 14px", color: "var(--fg-muted)", fontSize: 13 }}>No projects</div>
                )}
              </div>
            </div>

            {/* Invoices */}
            <div>
              <div className="sd-section-title">
                Invoices
                <div className="right">
                  <button
                    type="button"
                    className="sd-topbar-act"
                    onClick={() => navigate(`/invoices?drawer=new-invoice&clientId=${selectedClient.id}`)}
                  >
                    <Plus size={11} /> New
                  </button>
                </div>
              </div>
              <div className="sd-tbl">
                {selectedClientInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="sd-tbl-row"
                    style={{ gridTemplateColumns: "1fr 80px 20px", height: 36 }}
                    onClick={() => navigate(`/invoices?invoiceId=${invoice.id}`)}
                  >
                    <div className="ttl">{invoice.invoiceNumber}</div>
                    <div>
                      <span className="sd-pill">{invoice.status}</span>
                    </div>
                    <ChevronRight size={13} style={{ color: "var(--fg-muted)" }} />
                  </div>
                ))}
                {selectedClientInvoices.length === 0 && (
                  <div style={{ padding: "16px 14px", color: "var(--fg-muted)", fontSize: 13 }}>No invoices</div>
                )}
              </div>
            </div>

            {/* Danger zone */}
            <div>
              <button
                type="button"
                className="sd-btn ghost"
                style={{ color: "var(--fg-muted)", fontSize: 12 }}
                onClick={async () => {
                  await clientRepository.softDelete(selectedClient.id);
                  closeDrawer();
                }}
              >
                Move to trash
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit client drawer */}
      <Drawer
        open={drawer === "edit-client"}
        title="Edit client"
        description={selectedClient?.name}
        onClose={() => openDrawer({ clientId })}
        footer={
          <>
            <button type="button" className="sd-btn ghost" onClick={() => openDrawer({ clientId })}>Cancel</button>
            <button type="submit" form="edit-client-form" className="sd-btn">Save changes</button>
          </>
        }
      >
        {!selectedClient || selectedClient.deletedAt ? (
          <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>Loading…</div>
        ) : (
          <ClientForm
            formId="edit-client-form"
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
