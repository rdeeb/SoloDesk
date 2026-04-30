import { useMemo, useState, type FormEvent } from "react";
import type { KanbanStatus, Project, Task } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";
import { TASK_FORM_DEFAULTS, type TaskFormValues } from "@/modules/tasks/task.types";

interface TaskFormProps {
  projects: Project[];
  statuses: KanbanStatus[];
  initialValues?: TaskFormValues;
  lockedProjectId?: string;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const PRIORITIES: NonNullable<Task["priority"]>[] = ["low", "medium", "high", "urgent"];

export function TaskForm({
  projects,
  statuses,
  initialValues,
  lockedProjectId,
  submitLabel,
  onSubmit
}: TaskFormProps) {
  const defaultStatusId = statuses.find((status) => !status.isDone)?.id ?? statuses[0]?.id ?? "";
  const [values, setValues] = useState<TaskFormValues>({
    ...TASK_FORM_DEFAULTS,
    statusId: defaultStatusId,
    ...initialValues,
    projectId: lockedProjectId ?? initialValues?.projectId ?? ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return values.title.trim().length > 0 && values.projectId.trim().length > 0 && values.statusId.trim().length > 0;
  }, [values.projectId, values.statusId, values.title]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Task title, project, and status are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Title *</span>
          <input
            value={values.title}
            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Project *</span>
          <select
            value={values.projectId}
            disabled={Boolean(lockedProjectId)}
            onChange={(event) => setValues((prev) => ({ ...prev, projectId: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-70"
            required
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Status *</span>
          <select
            value={values.statusId}
            onChange={(event) => setValues((prev) => ({ ...prev, statusId: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">Select status</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Priority</span>
          <select
            value={values.priority ?? ""}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                priority: event.target.value ? (event.target.value as Task["priority"]) : undefined
              }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Not set</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Due date</span>
          <input
            type="date"
            value={values.dueDate}
            onChange={(event) => setValues((prev) => ({ ...prev, dueDate: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Estimate (minutes)</span>
          <input
            type="number"
            min={0}
            step={15}
            value={values.estimateMinutes ?? ""}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                estimateMinutes: event.target.value ? Number(event.target.value) : undefined
              }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={values.description}
          onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
          className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.billable}
          onChange={(event) => setValues((prev) => ({ ...prev, billable: event.target.checked }))}
        />
        Billable
      </label>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
