import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { docsRepository } from "@/modules/docs/docs.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { Button } from "@/shared/components/ui/button";

export function DocsListPage() {
  const navigate = useNavigate();
  const standaloneDocs = useLiveQuery(() => docsRepository.listStandalone(), [], []);
  const recentDocs = useLiveQuery(() => docsRepository.listRecent(6), [], []);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));

  async function createStandaloneDoc() {
    const doc = await docsRepository.createStandalone();
    navigate(`/docs/${doc.id}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Docs</h2>
          <p className="text-sm text-muted-foreground">Standalone docs and recent project notes.</p>
        </div>
        <Button onClick={createStandaloneDoc}>New standalone doc</Button>
      </div>

      <section className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="font-medium">Standalone docs</h3>
        </div>
        {standaloneDocs.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">No standalone docs yet.</p>
        ) : (
          <ul className="divide-y">
            {standaloneDocs.map((doc) => (
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

      <section className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="font-medium">Recent docs</h3>
        </div>
        {recentDocs.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">No recent docs.</p>
        ) : (
          <ul className="divide-y">
            {recentDocs.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  className="text-left text-sm font-medium hover:underline"
                  onClick={() => navigate(`/docs/${doc.id}`)}
                >
                  {doc.title}
                </button>
                <span className="text-xs text-muted-foreground">
                  {doc.projectId ? projectNameById.get(doc.projectId) ?? "Project" : "Standalone"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
