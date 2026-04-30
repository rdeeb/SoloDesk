import { useMemo, useState, type FormEvent } from "react";
import type { Client } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";
import { PROJECT_FORM_DEFAULTS, type ProjectFormValues } from "@/modules/projects/project.types";

interface ProjectFormProps {
  clients: Client[];
  initialValues?: ProjectFormValues;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

const PROJECT_STATUSES = ["active", "paused", "completed", "archived"] as const;

export function ProjectForm({ clients, initialValues = PROJECT_FORM_DEFAULTS, submitLabel, onSubmit }: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => values.name.trim().length > 0, [values.name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Project name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch {
      setError("Could not save project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Name *</span>
          <input
            value={values.name}
            onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Client (optional)</span>
          <select
            value={values.clientId ?? ""}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, clientId: event.target.value ? event.target.value : undefined }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">No client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Status</span>
          <select
            value={values.status}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, status: event.target.value as ProjectFormValues["status"] }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Currency</span>
          <input
            value={values.currency}
            onChange={(event) => setValues((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm uppercase"
            maxLength={3}
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Hourly rate</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={values.hourlyRate ?? ""}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                hourlyRate: event.target.value ? Number(event.target.value) : undefined
              }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Budget amount</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={values.budgetAmount ?? ""}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                budgetAmount: event.target.value ? Number(event.target.value) : undefined
              }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Start date</span>
          <input
            type="date"
            value={values.startDate}
            onChange={(event) => setValues((prev) => ({ ...prev, startDate: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
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
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={values.description}
          onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
          className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
