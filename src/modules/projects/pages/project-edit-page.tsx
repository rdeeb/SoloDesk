import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { ProjectForm } from "@/modules/projects/components/project-form";
import { projectRepository } from "@/modules/projects/project.repository";
import type { ProjectFormValues } from "@/modules/projects/project.types";
import { editorJsonToText } from "@/shared/lib/editor-json";

function toFormValues(project: Awaited<ReturnType<typeof projectRepository.getById>>): ProjectFormValues {
  return {
    clientId: project?.clientId,
    name: project?.name ?? "",
    description: editorJsonToText(project?.description),
    status: project?.status ?? "active",
    hourlyRate: project?.hourlyRate,
    budgetAmount: project?.budgetAmount,
    currency: project?.currency ?? "",
    startDate: project?.startDate ?? "",
    dueDate: project?.dueDate ?? ""
  };
}

export function ProjectEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
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

  const initialValues = useMemo(() => {
    if (!project) {
      return null;
    }
    return toFormValues(project);
  }, [project]);

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
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Edit project</h2>
        <p className="text-sm text-muted-foreground">{project.name}</p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <ProjectForm
          clients={clients}
          initialValues={initialValues ?? undefined}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await projectRepository.update(project.id, values);
            navigate(`/projects/${project.id}`);
          }}
        />
      </div>
    </div>
  );
}
