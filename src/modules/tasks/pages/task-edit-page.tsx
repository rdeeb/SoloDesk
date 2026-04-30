import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { TaskForm } from "@/modules/tasks/components/task-form";
import { taskRepository } from "@/modules/tasks/task.repository";

export function TaskEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ taskId: string }>();
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const task = useLiveQuery(
    async () => {
      if (!params.taskId) {
        return undefined;
      }
      return taskRepository.getById(params.taskId);
    },
    [params.taskId],
    null
  );
  const initialValues = useMemo(() => (task ? taskRepository.toFormValues(task) : undefined), [task]);

  if (!params.taskId) {
    return <Navigate to="/tasks" replace />;
  }

  if (task === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading task...</div>;
  }

  if (!task || task.deletedAt) {
    return <Navigate to="/tasks" replace />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Edit task</h2>
        <p className="text-sm text-muted-foreground">
          {task.title}. <Link to="/tasks" className="underline">Back to tasks</Link>
        </p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <TaskForm
          projects={projects}
          statuses={statuses}
          initialValues={initialValues}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await taskRepository.update(task.id, values);
            navigate(values.projectId ? `/projects/${values.projectId}/tasks` : "/tasks");
          }}
        />
      </div>
    </div>
  );
}
