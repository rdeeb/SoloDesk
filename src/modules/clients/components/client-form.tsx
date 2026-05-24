import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/shared/components/ui/button";
import { CLIENT_FORM_DEFAULTS, type ClientFormValues } from "@/modules/clients/client.types";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/shared/types/currency";

interface ClientFormProps {
  formId?: string;
  initialValues?: ClientFormValues;
  submitLabel: string;
  onSubmit: (values: ClientFormValues) => Promise<void>;
}

const CONTRACT_STATUSES = ["lead", "active", "paused", "completed", "lost"] as const;

export function ClientForm({ formId = "client-form", initialValues, submitLabel, onSubmit }: ClientFormProps) {
  const settings = useLiveQuery(() => settingsRepository.get(), [], null);
  const isCreateMode = initialValues === undefined;
  const [values, setValues] = useState<ClientFormValues>(initialValues ?? CLIENT_FORM_DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => values.name.trim().length > 0, [values.name]);

  useEffect(() => {
    if (!isCreateMode || !settings) {
      return;
    }

    setValues((prev) => ({
      ...prev,
      defaultHourlyRate: prev.defaultHourlyRate ?? settings.defaultHourlyRate,
      currency: prev.currency || settings.defaultCurrency
    }));
  }, [isCreateMode, settings]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Client name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch {
      setError("Could not save client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
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
          <span className="text-sm font-medium">Company</span>
          <input
            value={values.companyName}
            onChange={(event) => setValues((prev) => ({ ...prev, companyName: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Contact person</span>
          <input
            value={values.contactPerson}
            onChange={(event) => setValues((prev) => ({ ...prev, contactPerson: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={values.email}
            onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Phone</span>
          <input
            value={values.phone}
            onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Website</span>
          <input
            value={values.website}
            onChange={(event) => setValues((prev) => ({ ...prev, website: event.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Default hourly rate</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={values.defaultHourlyRate ?? ""}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                defaultHourlyRate: event.target.value ? Number(event.target.value) : undefined
              }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
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
          <span className="text-sm font-medium">Contract status</span>
          <select
            value={values.contractStatus ?? ""}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                contractStatus: event.target.value ? (event.target.value as ClientFormValues["contractStatus"]) : undefined
              }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Not set</option>
            {CONTRACT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium">Billing address</span>
        <textarea
          value={values.billingAddress}
          onChange={(event) => setValues((prev) => ({ ...prev, billingAddress: event.target.value }))}
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          value={values.notes}
          onChange={(event) => setValues((prev) => ({ ...prev, notes: event.target.value }))}
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {formId === "client-form" && (
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
