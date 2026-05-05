import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import type { KanbanStatus, Project } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";
import { TASK_FORM_DEFAULTS, type TaskFormValues } from "@/modules/tasks/task.types";
import { EMPTY_EDITOR_JSON } from "@/shared/lib/editor-json";

interface TaskFormProps {
  projects: Project[];
  statuses: KanbanStatus[];
  initialValues?: TaskFormValues;
  lockedProjectId?: string;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const NovelEditor = lazy(() =>
  import("@/modules/editor/components/novel-editor").then((module) => ({ default: module.NovelEditor }))
);

export function TaskForm({
  projects,
  statuses,
  initialValues,
  lockedProjectId,
  submitLabel,
  onSubmit
}: TaskFormProps) {
  const defaultStatusId = statuses.find((status) => !status.isDone)?.id ?? statuses[0]?.id ?? "";
  const defaultProjectId = lockedProjectId ?? initialValues?.projectId ?? projects[0]?.id ?? "";
  const [values, setValues] = useState<TaskFormValues>({
    ...TASK_FORM_DEFAULTS,
    statusId: defaultStatusId,
    ...initialValues,
    projectId: defaultProjectId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      projectId: prev.projectId || defaultProjectId,
      statusId: prev.statusId || defaultStatusId
    }));
  }, [defaultProjectId, defaultStatusId]);

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
    <form onSubmit={handleSubmit} className="flex h-full min-h-[calc(100vh-9rem)] flex-col gap-5">
      <input
        value={values.title}
        onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
        className="w-full border-none bg-transparent px-0 py-1 text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
        placeholder="Untitled task"
        aria-label="Task title"
        required
      />

      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Due date</span>
          <input
            type="date"
            value={values.dueDate}
            onChange={(event) => setValues((prev) => ({ ...prev, dueDate: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Estimate</span>
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
            placeholder="Minutes"
          />
        </label>

        <label className="flex items-center gap-2 pt-5 text-sm">
          <input
            type="checkbox"
            checked={values.billable}
            onChange={(event) => setValues((prev) => ({ ...prev, billable: event.target.checked }))}
          />
          Billable
        </label>
      </div>

      <section className="flex min-h-0 flex-1 flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Description</span>
        <Suspense fallback={<div className="min-h-[320px] py-1 text-sm text-muted-foreground">Loading editor...</div>}>
          <NovelEditor
            content={values.description ?? EMPTY_EDITOR_JSON}
            onContentChange={(description) => setValues((prev) => ({ ...prev, description }))}
            className="min-h-0 flex-1"
          />
        </Suspense>
      </section>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
