import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { ProjectForm } from "@/modules/projects/components/project-form";
import { projectRepository } from "@/modules/projects/project.repository";

export function ProjectCreatePage() {
  const navigate = useNavigate();
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create project</h2>
        <p className="text-sm text-muted-foreground">
          Add a new project. <Link to="/projects" className="underline">Back to list</Link>
        </p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <ProjectForm
          clients={clients}
          submitLabel="Create project"
          onSubmit={async (values) => {
            const created = await projectRepository.create(values);
            navigate(`/projects/${created.id}`);
          }}
        />
      </div>
    </div>
  );
}
