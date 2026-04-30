import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { projectRepository } from "@/modules/projects/project.repository";
import { InvoiceForm } from "@/modules/invoices/components/invoice-form";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const [search] = useSearchParams();
  const projectId = params.projectId;
  const clientIdFromQuery = search.get("clientId") ?? undefined;
  const project = useLiveQuery(
    async () => {
      if (!projectId) {
        return undefined;
      }
      return projectRepository.getById(projectId);
    },
    [projectId],
    null
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {project ? `New Invoice for ${project.name}` : "New Invoice"}
        </h2>
        <p className="text-sm text-muted-foreground">Create from manual items, billable time, or both.</p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <InvoiceForm
          lockedProjectId={projectId}
          lockedClientId={clientIdFromQuery}
          onSubmit={async (values) => {
            const created = await invoiceRepository.create(values);
            navigate(`/invoices/${created.invoice.id}`);
          }}
        />
      </div>
    </div>
  );
}
