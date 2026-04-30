import { useLiveQuery } from "dexie-react-hooks";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { TaskForm } from "@/modules/tasks/components/task-form";
import { taskRepository } from "@/modules/tasks/task.repository";

export function TaskCreatePage() {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const lockedProjectId = params.projectId;

  if (lockedProjectId && !projects.some((project) => project.id === lockedProjectId)) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create task</h2>
        <p className="text-sm text-muted-foreground">
          Tasks must belong to a project.{" "}
          <Link to={lockedProjectId ? `/projects/${lockedProjectId}/tasks` : "/tasks"} className="underline">
            Back to tasks
          </Link>
        </p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <TaskForm
          projects={projects}
          statuses={statuses}
          lockedProjectId={lockedProjectId}
          submitLabel="Create task"
          onSubmit={async (values) => {
            const created = await taskRepository.create(values);
            navigate(`/tasks/${created.id}/edit`);
          }}
        />
      </div>
    </div>
  );
}
