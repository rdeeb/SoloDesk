import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, Navigate, useParams } from "react-router-dom";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { taskRepository } from "@/modules/tasks/task.repository";
import type { TaskFilters } from "@/modules/tasks/task.types";
import { Button } from "@/shared/components/ui/button";

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export function TasksListPage() {
  const params = useParams<{ projectId: string }>();
  const lockedProjectId = params.projectId;
  const [filters, setFilters] = useState<TaskFilters>({});
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const tasks = useLiveQuery(
    () =>
      taskRepository.listActive({
        ...filters,
        projectId: lockedProjectId ?? filters.projectId
      }),
    [filters.projectId, filters.statusId, filters.priority, filters.dueDate, lockedProjectId],
    []
  );

  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));
  const statusNameById = new Map(statuses.map((status) => [status.id, status.name]));
  const lockedProject = lockedProjectId ? projects.find((project) => project.id === lockedProjectId) : undefined;

  if (lockedProjectId && projects.length > 0 && !lockedProject) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{lockedProject ? `${lockedProject.name} Tasks` : "Tasks"}</h2>
          <p className="text-sm text-muted-foreground">Create, filter, and update project-owned tasks.</p>
        </div>
        <Link to={lockedProjectId ? `/projects/${lockedProjectId}/tasks/new` : "/tasks/new"}>
          <Button>New task</Button>
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-4">
        {!lockedProjectId ? (
          <select
            value={filters.projectId ?? ""}
            onChange={(event) => setFilters((prev) => ({ ...prev, projectId: event.target.value || undefined }))}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        ) : null}

        <select
          value={filters.statusId ?? ""}
          onChange={(event) => setFilters((prev) => ({ ...prev, statusId: event.target.value || undefined }))}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>

        <select
          value={filters.priority ?? ""}
          onChange={(event) =>
            setFilters((prev) => ({
              ...prev,
              priority: event.target.value ? (event.target.value as TaskFilters["priority"]) : undefined
            }))
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dueDate ?? ""}
          onChange={(event) => setFilters((prev) => ({ ...prev, dueDate: event.target.value || undefined }))}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t">
                <td className="px-4 py-3 font-medium">{task.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectNameById.get(task.projectId) ?? "Unknown"}</td>
                <td className="px-4 py-3 text-muted-foreground">{statusNameById.get(task.statusId) ?? "Unknown"}</td>
                <td className="px-4 py-3 text-muted-foreground">{task.priority ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{task.dueDate ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/tasks/${task.id}/edit`} className="text-sm font-medium underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">No tasks found.</div> : null}
      </div>
    </div>
  );
}
