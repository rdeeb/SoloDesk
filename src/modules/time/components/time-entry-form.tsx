import { useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { projectRepository } from "@/modules/projects/project.repository";
import { taskRepository } from "@/modules/tasks/task.repository";
import { parseDurationToMinutes } from "@/modules/time/time.utils";
import { TIME_FORM_DEFAULTS, type TimeEntryFormValues } from "@/modules/time/time.types";
import { Button } from "@/shared/components/ui/button";

interface TimeEntryFormProps {
  lockedProjectId?: string;
  onSubmit: (values: { projectId: string; taskId?: string; description: string; entryDate: string; durationMinutes: number; billable: boolean; }) => Promise<void>;
}

export function TimeEntryForm({ lockedProjectId, onSubmit }: TimeEntryFormProps) {
  const [values, setValues] = useState<TimeEntryFormValues>({
    ...TIME_FORM_DEFAULTS,
    projectId: lockedProjectId ?? TIME_FORM_DEFAULTS.projectId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const tasks = useLiveQuery(() => taskRepository.listActiveByProjectId(values.projectId), [values.projectId], []);

  const isValid = useMemo(() => {
    if (!values.projectId.trim()) {
      return false;
    }

    const durationMinutes =
      values.inputMode === "decimal"
        ? parseDurationToMinutes({ mode: "decimal", decimalHours: values.decimalHours })
        : parseDurationToMinutes({ mode: "hoursMinutes", hours: values.hours, minutes: values.minutes });

    return durationMinutes > 0;
  }, [values]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Project and a positive duration are required.");
      return;
    }

    const durationMinutes =
      values.inputMode === "decimal"
        ? parseDurationToMinutes({ mode: "decimal", decimalHours: values.decimalHours })
        : parseDurationToMinutes({ mode: "hoursMinutes", hours: values.hours, minutes: values.minutes });

    try {
      setIsSubmitting(true);
      await onSubmit({
        projectId: values.projectId,
        taskId: values.taskId,
        description: values.description,
        entryDate: values.entryDate,
        durationMinutes,
        billable: values.billable
      });
      setValues((prev) => ({
        ...TIME_FORM_DEFAULTS,
        projectId: lockedProjectId ?? prev.projectId,
        entryDate: prev.entryDate
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save time entry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2">
      <select
        value={values.projectId}
        onChange={(event) =>
          setValues((prev) => ({
            ...prev,
            projectId: event.target.value,
            taskId: undefined
          }))
        }
        disabled={Boolean(lockedProjectId)}
        className="rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-70"
      >
        <option value="">Select project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      <select
        value={values.taskId ?? ""}
        onChange={(event) => setValues((prev) => ({ ...prev, taskId: event.target.value || undefined }))}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      >
        <option value="">No task</option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={values.entryDate}
        onChange={(event) => setValues((prev) => ({ ...prev, entryDate: event.target.value }))}
        className="rounded-md border bg-background px-3 py-2 text-sm"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={values.inputMode}
          onChange={(event) => setValues((prev) => ({ ...prev, inputMode: event.target.value as TimeEntryFormValues["inputMode"] }))}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="hoursMinutes">Hours/minutes</option>
          <option value="decimal">Decimal hours</option>
        </select>

        {values.inputMode === "decimal" ? (
          <input
            type="number"
            min={0}
            step={0.25}
            value={values.decimalHours}
            onChange={(event) => setValues((prev) => ({ ...prev, decimalHours: Number(event.target.value || 0) }))}
            className="rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="1.5"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              value={values.hours}
              onChange={(event) => setValues((prev) => ({ ...prev, hours: Number(event.target.value || 0) }))}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Hours"
            />
            <input
              type="number"
              min={0}
              max={59}
              value={values.minutes}
              onChange={(event) => setValues((prev) => ({ ...prev, minutes: Number(event.target.value || 0) }))}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Minutes"
            />
          </div>
        )}
      </div>

      <input
        value={values.description}
        onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
        placeholder="Description"
        className="rounded-md border bg-background px-3 py-2 text-sm md:col-span-2"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.billable}
          onChange={(event) => setValues((prev) => ({ ...prev, billable: event.target.checked }))}
        />
        Billable
      </label>

      <div className="flex items-center justify-end gap-2 md:col-span-2">
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Saving..." : "Add time entry"}
        </Button>
      </div>
    </form>
  );
}
