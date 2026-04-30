import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientRepository } from "@/modules/clients/client.repository";
import type { ClientFormValues } from "@/modules/clients/client.types";
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

export function ClientEditPage() {
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

  const initialValues = useMemo(() => {
    if (!client) {
      return null;
    }
    return toFormValues(client);
  }, [client]);

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
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Edit client</h2>
        <p className="text-sm text-muted-foreground">{client.name}</p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <ClientForm
          initialValues={initialValues ?? undefined}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await clientRepository.update(client.id, values);
            navigate(`/clients/${client.id}`);
          }}
        />
      </div>
    </div>
  );
}
