import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/shared/components/ui/button";
import { settingsRepository } from "@/modules/settings/settings.repository";
import type { SetupFormValues } from "@/modules/settings/settings.types";
import { completeSetup } from "@/modules/setup/setup.service";

const INITIAL_VALUES: SetupFormValues = {
  workspaceName: "",
  defaultCurrency: "USD",
  taxEnabled: false,
  defaultTaxName: "Tax",
  defaultTaxRate: undefined,
  defaultHourlyRate: undefined,
  invoicePrefix: "INV",
  confirmDefaultKanbanColumns: true
};

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "PAB"];

export function SetupPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<SetupFormValues>(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setupCompleted = useLiveQuery(
    async () => {
      const settings = await settingsRepository.get();
      return Boolean(settings?.setupCompleted);
    },
    [],
    null
  );

  const isFormValid = useMemo(() => {
    if (!values.workspaceName.trim()) {
      return false;
    }

    if (!values.defaultCurrency.trim()) {
      return false;
    }

    if (!values.invoicePrefix.trim()) {
      return false;
    }

    if (values.taxEnabled) {
      if (!values.defaultTaxName.trim()) {
        return false;
      }

      if (values.defaultTaxRate === undefined || values.defaultTaxRate < 0) {
        return false;
      }
    }

    return values.confirmDefaultKanbanColumns;
  }, [values]);

  if (setupCompleted === null) {
    return <div className="p-6 text-sm text-muted-foreground">Loading workspace setup...</div>;
  }

  if (setupCompleted) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      await completeSetup(values);
      navigate("/", { replace: true });
    } catch {
      setError("Could not save setup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to SoloDesk</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your workspace. This runs locally in your browser and saves to IndexedDB.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Workspace name</span>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="SoloDesk Workspace"
              value={values.workspaceName}
              onChange={(event) => setValues((prev) => ({ ...prev, workspaceName: event.target.value }))}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Default currency</span>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={values.defaultCurrency}
              onChange={(event) => setValues((prev) => ({ ...prev, defaultCurrency: event.target.value }))}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.taxEnabled}
              onChange={(event) => setValues((prev) => ({ ...prev, taxEnabled: event.target.checked }))}
            />
            Enable default tax on invoices
          </label>

          {values.taxEnabled ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Tax label</span>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="VAT"
                  value={values.defaultTaxName}
                  onChange={(event) => setValues((prev) => ({ ...prev, defaultTaxName: event.target.value }))}
                  required={values.taxEnabled}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Tax rate (%)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="7"
                  value={values.defaultTaxRate ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      defaultTaxRate: event.target.value ? Number(event.target.value) : undefined
                    }))
                  }
                  required={values.taxEnabled}
                />
              </label>
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium">Default hourly rate (optional)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="75"
              value={values.defaultHourlyRate ?? ""}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  defaultHourlyRate: event.target.value ? Number(event.target.value) : undefined
                }))
              }
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Invoice prefix</span>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm uppercase"
              placeholder="INV"
              value={values.invoicePrefix}
              onChange={(event) => setValues((prev) => ({ ...prev, invoicePrefix: event.target.value }))}
              required
            />
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.confirmDefaultKanbanColumns}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, confirmDefaultKanbanColumns: event.target.checked }))
              }
              required
            />
            <span>
              Confirm default Kanban columns:
              <span className="text-muted-foreground"> Backlog, To Do, In Progress, Blocked, Review, Done</span>
            </span>
          </label>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? "Setting up workspace..." : "Complete setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
