import { useLiveQuery } from "dexie-react-hooks";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { docsRepository } from "@/modules/docs/docs.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { Button } from "@/shared/components/ui/button";

export function ProjectDocsPage() {
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
  const docs = useLiveQuery(
    async () => {
      if (!params.projectId) {
        return [];
      }
      return docsRepository.listByProjectId(params.projectId);
    },
    [params.projectId],
    []
  );

  if (!params.projectId) {
    return <Navigate to="/projects" replace />;
  }

  if (project === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading docs...</div>;
  }

  if (!project || project.deletedAt) {
    return <Navigate to="/projects" replace />;
  }

  async function createProjectDoc() {
    if (!project) {
      return;
    }
    const doc = await docsRepository.createForProject(project.id);
    navigate(`/docs/${doc.id}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{project.name} Docs</h2>
          <p className="text-sm text-muted-foreground">Project-linked notes and working documentation.</p>
        </div>
        <Button onClick={createProjectDoc}>New project doc</Button>
      </div>

      <section className="rounded-lg border bg-card">
        {docs.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">No docs for this project yet.</p>
        ) : (
          <ul className="divide-y">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  className="text-left text-sm font-medium hover:underline"
                  onClick={() => navigate(`/docs/${doc.id}`)}
                >
                  {doc.title}
                </button>
                <span className="text-xs text-muted-foreground">
                  {new Date(doc.updatedAt).toLocaleDateString("en-US")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
