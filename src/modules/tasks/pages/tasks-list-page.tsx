import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Clock, Edit, PanelRightOpen, Plus } from "lucide-react";
import { clientRepository } from "@/modules/clients/client.repository";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import { ProjectForm } from "@/modules/projects/components/project-form";
import { projectRepository } from "@/modules/projects/project.repository";
import type { ProjectFormValues } from "@/modules/projects/project.types";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { TaskForm } from "@/modules/tasks/components/task-form";
import { taskRepository } from "@/modules/tasks/task.repository";
import type { TaskFilters } from "@/modules/tasks/task.types";
import { TimeEntryForm } from "@/modules/time/components/time-entry-form";
import { timeRepository } from "@/modules/time/time.repository";
import { Button } from "@/shared/components/ui/button";
import { Drawer } from "@/shared/components/ui/drawer";
import { editorJsonToText } from "@/shared/lib/editor-json";

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

function formatHours(minutes: number) {
  return (minutes / 60).toFixed(2);
}

function formatCurrency(amount: number, currency: string) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  });
}

function toProjectFormValues(project: Awaited<ReturnType<typeof projectRepository.getById>>): ProjectFormValues {
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

export function TasksListPage() {
  const navigate = useNavigate();
  const params = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const lockedProjectId = params.projectId;
  const [filters, setFilters] = useState<TaskFilters>({});
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const settings = useLiveQuery(() => settingsRepository.get(), [], null);
  const tasks = useLiveQuery(
    () =>
      taskRepository.listActive({
        ...filters,
        projectId: lockedProjectId ?? filters.projectId
      }),
    [filters.projectId, filters.statusId, filters.priority, filters.dueDate, lockedProjectId],
    []
  );
  const drawer = searchParams.get("drawer");
  const taskId = searchParams.get("taskId") ?? undefined;
  const selectedTask = useLiveQuery(
    async () => {
      if (!taskId) {
        return undefined;
      }
      return taskRepository.getById(taskId);
    },
    [taskId],
    null
  );
  const selectedTaskInitialValues = useMemo(
    () => (selectedTask ? taskRepository.toFormValues(selectedTask) : undefined),
    [selectedTask]
  );
  const selectedProject = useLiveQuery(
    async () => {
      if (!lockedProjectId) {
        return undefined;
      }
      return projectRepository.getById(lockedProjectId);
    },
    [lockedProjectId],
    null
  );
  const selectedProjectInitialValues = useMemo(
    () => (selectedProject ? toProjectFormValues(selectedProject) : undefined),
    [selectedProject]
  );
  const taskTimeEntries = useLiveQuery(
    () => (taskId ? timeRepository.listActive({ taskId }) : Promise.resolve([])),
    [taskId],
    []
  );
  const taskTimeSummary = useLiveQuery(
    () => (taskId ? timeRepository.getBillableSummary({ taskId }) : Promise.resolve({ billableMinutes: 0, billableAmount: 0 })),
    [taskId],
    { billableMinutes: 0, billableAmount: 0 }
  );

  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));
  const statusNameById = new Map(statuses.map((status) => [status.id, status.name]));
  const lockedProject = lockedProjectId ? projects.find((project) => project.id === lockedProjectId) : undefined;
  const selectedTaskProject = selectedTask ? projects.find((project) => project.id === selectedTask.projectId) : undefined;
  const selectedTaskCurrency = selectedTaskProject?.currency ?? settings?.defaultCurrency ?? "USD";
  const basePath = lockedProjectId ? `/projects/${lockedProjectId}/tasks` : "/tasks";

  function openDrawer(values: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) {
        next.set(key, value);
      }
    }
    navigate(`${basePath}?${next.toString()}`);
  }

  function closeDrawer() {
    navigate(basePath);
  }

  if (lockedProjectId && projects.length > 0 && !lockedProject) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{lockedProject ? `${lockedProject.name} Tasks` : "Tasks"}</h2>
          <p className="text-sm text-muted-foreground">
            {lockedProject ? "Project workspace centered on task execution." : "Create, filter, and update project-owned tasks."}
          </p>
        </div>
        <Button onClick={() => openDrawer({ drawer: "new-task" })} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New task
        </Button>
      </div>

      {lockedProjectId ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${lockedProjectId}/board`)}>
            Board
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${lockedProjectId}/docs`)}>
            Docs
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${lockedProjectId}/invoices`)}>
            Invoices
          </Button>
          <Button variant="outline" size="sm" onClick={() => openDrawer({ drawer: "project-detail" })} className="gap-2">
            <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
            Project details
          </Button>
        </div>
      ) : null}

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
                  <button
                    type="button"
                    onClick={() => openDrawer({ taskId: task.id })}
                    className="text-sm font-medium underline"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">No tasks found.</div> : null}
      </div>

      <Drawer
        open={drawer === "new-task"}
        title="Create task"
        description={lockedProject ? `Add work to ${lockedProject.name}.` : "Tasks must belong to a project."}
        onClose={closeDrawer}
        className="max-w-4xl"
      >
        <TaskForm
          projects={projects}
          statuses={statuses}
          lockedProjectId={lockedProjectId}
          submitLabel="Create task"
          onSubmit={async (values) => {
            const created = await taskRepository.create(values);
            openDrawer({ taskId: created.id });
          }}
        />
      </Drawer>

      <Drawer
        open={Boolean(taskId) && drawer !== "edit-task"}
        title={selectedTask?.title ?? "Task details"}
        description="Review task work and log time without leaving the project."
        onClose={closeDrawer}
      >
        {!selectedTask || selectedTask.deletedAt ? (
          <p className="text-sm text-muted-foreground">Loading task...</p>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => openDrawer({ drawer: "edit-task", taskId: selectedTask.id })} className="gap-2">
                <Edit className="h-4 w-4" aria-hidden="true" />
                Edit task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await taskRepository.softDelete(selectedTask.id);
                  closeDrawer();
                }}
              >
                Move to trash
              </Button>
            </div>

            <section className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="mt-1 font-medium">{projectNameById.get(selectedTask.projectId) ?? "Unknown"}</p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-1 font-medium">{statusNameById.get(selectedTask.statusId) ?? "Unknown"}</p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Priority</p>
                <p className="mt-1 font-medium">{selectedTask.priority ?? "-"}</p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Due</p>
                <p className="mt-1 font-medium">{selectedTask.dueDate ?? "-"}</p>
              </article>
            </section>

            <section className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Description</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {editorJsonToText(selectedTask.description) || "-"}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-medium">Time</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatHours(taskTimeSummary.billableMinutes)} billable hours - {formatCurrency(taskTimeSummary.billableAmount, selectedTaskCurrency)}
                  </p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <TimeEntryForm
                lockedProjectId={selectedTask.projectId}
                lockedTaskId={selectedTask.id}
                onSubmit={async (values) => {
                  await timeRepository.create(values);
                }}
              />
              <div className="overflow-hidden rounded-lg border bg-card">
                {taskTimeEntries.length === 0 ? (
                  <p className="px-4 py-5 text-sm text-muted-foreground">No time logged for this task yet.</p>
                ) : (
                  <ul className="divide-y">
                    {taskTimeEntries.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <span>
                          {entry.entryDate}
                          {entry.description ? <span className="ml-2 text-muted-foreground">{entry.description}</span> : null}
                        </span>
                        <span className="text-muted-foreground">{formatHours(entry.durationMinutes)}h</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        )}
      </Drawer>

      <Drawer open={drawer === "edit-task"} title="Edit task" onClose={closeDrawer} className="max-w-4xl">
        {!selectedTask || selectedTask.deletedAt ? (
          <p className="text-sm text-muted-foreground">Loading task...</p>
        ) : (
          <TaskForm
            projects={projects}
            statuses={statuses}
            initialValues={selectedTaskInitialValues}
            lockedProjectId={lockedProjectId}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await taskRepository.update(selectedTask.id, values);
              openDrawer({ taskId: selectedTask.id });
            }}
          />
        )}
      </Drawer>

      <Drawer
        open={drawer === "project-detail" || drawer === "edit-project"}
        title={drawer === "edit-project" ? "Edit project" : selectedProject?.name ?? "Project details"}
        description={drawer === "edit-project" ? undefined : "Project settings and related context."}
        onClose={closeDrawer}
      >
        {!selectedProject || selectedProject.deletedAt ? (
          <p className="text-sm text-muted-foreground">Loading project...</p>
        ) : drawer === "edit-project" ? (
          <ProjectForm
            clients={clients}
            initialValues={selectedProjectInitialValues}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await projectRepository.update(selectedProject.id, values);
              openDrawer({ drawer: "project-detail" });
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openDrawer({ drawer: "edit-project" })}>
                Edit project
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await projectRepository.softDelete(selectedProject.id);
                  navigate("/projects");
                }}
              >
                Move to trash
              </Button>
            </div>
            <section className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-1 font-medium">{selectedProject.status}</p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="mt-1 font-medium">{selectedProject.currency ?? "-"}</p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Hourly rate</p>
                <p className="mt-1 font-medium">{selectedProject.hourlyRate ?? "-"}</p>
              </article>
              <article className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Due date</p>
                <p className="mt-1 font-medium">{selectedProject.dueDate ?? "-"}</p>
              </article>
            </section>
            <section className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Description</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {editorJsonToText(selectedProject.description) || "-"}
              </p>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
