import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import type { Client } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";
import { Drawer } from "@/shared/components/ui/drawer";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientRepository } from "@/modules/clients/client.repository";
import { PROJECT_FORM_DEFAULTS, type ProjectFormValues } from "@/modules/projects/project.types";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/shared/types/currency";

interface ProjectFormProps {
  clients: Client[];
  initialValues?: ProjectFormValues;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

const PROJECT_STATUSES = ["active", "paused", "completed", "archived"] as const;

export function ProjectForm({ clients, initialValues, submitLabel, onSubmit }: ProjectFormProps) {
  const settings = useLiveQuery(() => settingsRepository.get(), [], null);
  const isCreateMode = initialValues === undefined;
  const [values, setValues] = useState<ProjectFormValues>(initialValues ?? PROJECT_FORM_DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => values.name.trim().length > 0, [values.name]);

  useEffect(() => {
    if (!isCreateMode || !settings) {
      return;
    }

    setValues((prev) => ({
      ...prev,
      hourlyRate: prev.hourlyRate ?? settings.defaultHourlyRate,
      currency: prev.currency || settings.defaultCurrency
    }));
  }, [isCreateMode, settings]);

  function applyClientDefaults(clientId: string | undefined) {
    const client = clientId ? clients.find((item) => item.id === clientId) : undefined;
    setValues((prev) => ({
      ...prev,
      clientId,
      hourlyRate: client?.defaultHourlyRate ?? settings?.defaultHourlyRate ?? prev.hourlyRate,
      currency: client?.currency ?? settings?.defaultCurrency ?? prev.currency
    }));
  }

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
          <span className="flex gap-2">
            <select
              value={values.clientId ?? ""}
              onChange={(event) => applyClientDefaults(event.target.value ? event.target.value : undefined)}
              className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">No client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Create client"
              onClick={() => setIsClientDrawerOpen(true)}
              className="h-9 w-9 px-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </span>
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
          <select
            value={values.currency}
            onChange={(event) => setValues((prev) => ({ ...prev, currency: event.target.value as CurrencyCode | "" }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Workspace default</option>
            {CURRENCY_OPTIONS.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
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

      <Drawer
        open={isClientDrawerOpen}
        title="Create client"
        description="Add the client and attach it to this project."
        level={1}
        onClose={() => setIsClientDrawerOpen(false)}
      >
        <ClientForm
          submitLabel="Create client"
          onSubmit={async (clientValues) => {
            const created = await clientRepository.create(clientValues);
            setValues((prev) => ({
              ...prev,
              clientId: created.id,
              hourlyRate: created.defaultHourlyRate ?? settings?.defaultHourlyRate ?? prev.hourlyRate,
              currency: created.currency ?? settings?.defaultCurrency ?? prev.currency
            }));
            setIsClientDrawerOpen(false);
          }}
        />
      </Drawer>
    </form>
  );
}
