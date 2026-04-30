import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { Button } from "@/shared/components/ui/button";

export function ProjectsListPage() {
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const clientNameById = new Map(clients.map((client) => [client.id, client.name]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">Manage your projects and linked clients.</p>
        </div>
        <Link to="/projects/new">
          <Button>New project</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due date</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="px-4 py-3">
                  <Link to={`/projects/${project.id}`} className="font-medium hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {project.clientId ? clientNameById.get(project.clientId) ?? "Unknown client" : "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{project.status}</td>
                <td className="px-4 py-3 text-muted-foreground">{project.dueDate ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {projects.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No projects yet. Create your first project.</div>
        ) : null}
      </div>
    </div>
  );
}
