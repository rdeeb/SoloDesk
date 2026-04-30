import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { Button } from "@/shared/components/ui/button";

export function ClientsListPage() {
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Clients</h2>
          <p className="text-sm text-muted-foreground">Manage your client directory.</p>
        </div>
        <Link to="/clients/new">
          <Button>New client</Button>
        </Link>
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
                  <Link to={`/clients/${client.id}`} className="font-medium hover:underline">
                    {client.name}
                  </Link>
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
    </div>
  );
}
