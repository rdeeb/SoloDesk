import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { clientRepository } from "@/modules/clients/client.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import type { InvoiceCreateValues, ManualInvoiceLineItemInput } from "@/modules/invoices/invoice.types";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { Button } from "@/shared/components/ui/button";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/shared/types/currency";

interface InvoiceFormProps {
  lockedProjectId?: string;
  lockedClientId?: string;
  onSubmit: (values: InvoiceCreateValues) => Promise<void>;
}

function sumManual(items: ManualInvoiceLineItemInput[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function InvoiceForm({ lockedProjectId, lockedClientId, onSubmit }: InvoiceFormProps) {
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const settings = useLiveQuery(() => settingsRepository.get(), [], null);

  const defaultClientId = lockedClientId ?? (lockedProjectId ? projects.find((p) => p.id === lockedProjectId)?.clientId ?? "" : "");
  const [clientId, setClientId] = useState(defaultClientId);
  const [projectId, setProjectId] = useState(lockedProjectId ?? "");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode | "">("");
  const [taxEnabled, setTaxEnabled] = useState<boolean | undefined>(undefined);
  const [taxName, setTaxName] = useState("");
  const [taxRate, setTaxRate] = useState<number | undefined>(undefined);
  const [discountTotal, setDiscountTotal] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<InvoiceCreateValues["status"]>("draft");
  const [notes, setNotes] = useState("");
  const [manualItems, setManualItems] = useState<ManualInvoiceLineItemInput[]>([
    { description: "", quantity: 1, unitPrice: 0 }
  ]);
  const [selectedTimeEntryIds, setSelectedTimeEntryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableProjects = useMemo(
    () => projects.filter((project) => !clientId || !project.clientId || project.clientId === clientId),
    [clientId, projects]
  );
  const selectedClient = useMemo(() => clients.find((client) => client.id === clientId), [clientId, clients]);
  const selectedProject = useMemo(() => projects.find((project) => project.id === projectId), [projectId, projects]);
  const timeCandidates = useLiveQuery(
    () => (clientId ? invoiceRepository.listBillableTimeCandidates(clientId, projectId || undefined) : Promise.resolve([])),
    [clientId, projectId],
    []
  );

  const estimatedSubtotal = sumManual(manualItems) + timeCandidates
    .filter((entry) => selectedTimeEntryIds.includes(entry.id))
    .reduce((sum, entry) => sum + (entry.durationMinutes / 60) * (entry.hourlyRate ?? 0), 0);

  useEffect(() => {
    if (!lockedProjectId || projectId || projects.length === 0) {
      return;
    }

    const lockedProject = projects.find((project) => project.id === lockedProjectId);
    if (!lockedProject) {
      return;
    }

    setProjectId(lockedProject.id);
    if (!lockedClientId && lockedProject.clientId) {
      setClientId(lockedProject.clientId);
    }
  }, [lockedClientId, lockedProjectId, projectId, projects]);

  useEffect(() => {
    if (!settings) {
      return;
    }

    setCurrency((prev) => prev || selectedProject?.currency || selectedClient?.currency || settings.defaultCurrency);
    setTaxEnabled((prev) => prev ?? settings.taxEnabled);
    setTaxName((prev) => prev || settings.defaultTaxName || "");
    setTaxRate((prev) => prev ?? settings.defaultTaxRate);
  }, [selectedClient?.currency, selectedProject?.currency, settings]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Client is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        clientId,
        projectId: projectId || undefined,
        issueDate,
        dueDate: dueDate || undefined,
        currency: currency || undefined,
        taxEnabled,
        taxName: taxName || undefined,
        taxRate,
        discountTotal,
        status,
        notes: notes || undefined,
        manualItems,
        timeEntryIds: selectedTimeEntryIds
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create invoice.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={clientId}
          disabled={Boolean(lockedClientId)}
          onChange={(event) => {
            setClientId(event.target.value);
            const nextClient = clients.find((client) => client.id === event.target.value);
            setCurrency(nextClient?.currency ?? settings?.defaultCurrency ?? "");
            if (!lockedProjectId) {
              setProjectId("");
            }
          }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Select client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <select
          value={projectId}
          disabled={Boolean(lockedProjectId)}
          onChange={(event) => {
            setProjectId(event.target.value);
            const nextProject = projects.find((project) => project.id === event.target.value);
            setCurrency(nextProject?.currency ?? selectedClient?.currency ?? settings?.defaultCurrency ?? "");
          }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">No project</option>
          {availableProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as InvoiceCreateValues["status"])}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="draft">draft</option>
          <option value="sent">sent</option>
          <option value="paid">paid</option>
          <option value="void">void</option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
        <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value as CurrencyCode | "")}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">{settings?.defaultCurrency ? `Workspace default (${settings.defaultCurrency})` : "Workspace default"}</option>
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input type="number" min={0} step={0.01} value={discountTotal ?? ""} onChange={(event) => setDiscountTotal(event.target.value ? Number(event.target.value) : undefined)} placeholder="Discount" className="rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={taxEnabled ?? settings?.taxEnabled ?? false}
            onChange={(event) => setTaxEnabled(event.target.checked)}
          />
          Tax enabled
        </label>
        <input value={taxName} placeholder={settings?.defaultTaxName ?? "Tax"} onChange={(event) => setTaxName(event.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
        <input type="number" min={0} step={0.01} value={taxRate ?? ""} placeholder={String(settings?.defaultTaxRate ?? "")} onChange={(event) => setTaxRate(event.target.value ? Number(event.target.value) : undefined)} className="rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <section className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-medium">Manual line items</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => setManualItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }])}>
            Add item
          </Button>
        </div>
        <div className="space-y-2 p-4">
          {manualItems.map((item, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_120px_120px_80px]">
              <input
                value={item.description}
                placeholder="Description"
                onChange={(event) =>
                  setManualItems((prev) =>
                    prev.map((current, currentIndex) =>
                      currentIndex === index ? { ...current, description: event.target.value } : current
                    )
                  )
                }
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={item.quantity}
                onChange={(event) =>
                  setManualItems((prev) =>
                    prev.map((current, currentIndex) =>
                      currentIndex === index ? { ...current, quantity: Number(event.target.value || 0) } : current
                    )
                  )
                }
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={item.unitPrice}
                onChange={(event) =>
                  setManualItems((prev) =>
                    prev.map((current, currentIndex) =>
                      currentIndex === index ? { ...current, unitPrice: Number(event.target.value || 0) } : current
                    )
                  )
                }
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManualItems((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                disabled={manualItems.length <= 1}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="font-medium">Billable time entries</h3>
        </div>
        {timeCandidates.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No billable time entries available.</p>
        ) : (
          <ul className="divide-y">
            {timeCandidates.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTimeEntryIds.includes(entry.id)}
                    onChange={(event) => {
                      setSelectedTimeEntryIds((prev) =>
                        event.target.checked ? [...prev, entry.id] : prev.filter((id) => id !== entry.id)
                      );
                    }}
                  />
                  <span>{entry.description || `${entry.projectName} ${entry.entryDate}`}</span>
                </label>
                <span className="text-muted-foreground">
                  {(entry.durationMinutes / 60).toFixed(2)}h @ {(entry.hourlyRate ?? 0).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Notes"
        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Estimated subtotal: {estimatedSubtotal.toFixed(2)}</p>
        <div className="flex items-center gap-2">
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create invoice"}
          </Button>
        </div>
      </div>
    </form>
  );
}
