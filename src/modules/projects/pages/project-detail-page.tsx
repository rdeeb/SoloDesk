import { useLiveQuery } from "dexie-react-hooks";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { Button } from "@/shared/components/ui/button";
import { editorJsonToText } from "@/shared/lib/editor-json";

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const project = useLiveQuery(
    async () => {
      if (!params.projectId) {
        return undefined;
      }
      return projectRepository.getById(params.projectId);
    },
    [params.projectId],
    null
  );
  const client = useLiveQuery(
    async () => {
      if (!project?.clientId) {
        return undefined;
      }
      return clientRepository.getById(project.clientId);
    },
    [project?.clientId],
    null
  );

  if (!params.projectId) {
    return <Navigate to="/projects" replace />;
  }

  if (project === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading project...</div>;
  }

  if (!project || project.deletedAt) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{project.name}</h2>
          <p className="text-sm text-muted-foreground">
            {project.clientId ? (
              client?.deletedAt ? (
                "Linked client is deleted"
              ) : client ? (
                <Link to={`/clients/${client.id}`} className="underline">
                  {client.name}
                </Link>
              ) : (
                "Loading client..."
              )
            ) : (
              "No linked client"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/board`)}>
            Board
          </Button>
          <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/tasks`)}>
            Tasks
          </Button>
          <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/docs`)}>
            Docs
          </Button>
          <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/time`)}>
            Time
          </Button>
          <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/invoices`)}>
            Invoices
          </Button>
          <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/edit`)}>
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await projectRepository.softDelete(project.id);
              navigate("/projects");
            }}
          >
            Move to trash
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Project info</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{project.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{project.currency ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Hourly rate</dt>
              <dd>{project.hourlyRate ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Budget</dt>
              <dd>{project.budgetAmount ?? "-"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">Schedule</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Start date</dt>
              <dd>{project.startDate ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Due date</dt>
              <dd>{project.dueDate ?? "-"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <article className="rounded-lg border bg-card p-4">
        <h3 className="font-medium">Description</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {editorJsonToText(project.description) || "-"}
        </p>
      </article>
    </div>
  );
}
