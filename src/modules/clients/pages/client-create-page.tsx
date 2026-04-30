import { Link, useNavigate } from "react-router-dom";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientRepository } from "@/modules/clients/client.repository";

export function ClientCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create client</h2>
        <p className="text-sm text-muted-foreground">
          Add a new client. <Link to="/clients" className="underline">Back to list</Link>
        </p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <ClientForm
          submitLabel="Create client"
          onSubmit={async (values) => {
            const created = await clientRepository.create(values);
            navigate(`/clients/${created.id}`);
          }}
        />
      </div>
    </div>
  );
}
