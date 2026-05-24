import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import type { Client } from "@/shared/types/domain";
import { Drawer } from "@/shared/components/ui/drawer";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientRepository } from "@/modules/clients/client.repository";
import { PROJECT_FORM_DEFAULTS, type ProjectFormValues } from "@/modules/projects/project.types";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/shared/types/currency";

const GLYPH_PRESETS = [
  "◆","◇","◉","●","▲","▼","■","□","★","☉","☖","✦","✶","✺","✷",
  "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P",
  "Q","R","S","T","U","V","W","X","Y","Z"
];

const PROJECT_STATUSES = [
  { id: "active",    label: "Active" },
  { id: "paused",    label: "Paused" },
  { id: "completed", label: "Completed" },
  { id: "archived",  label: "Archived" },
] as const;

function projectInitials(name: string): string {
  const clean = name.replace(/[·→\-–]/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NP";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ProjectFormProps {
  clients: Client[];
  formId?: string;
  initialValues?: ProjectFormValues;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

export function ProjectForm({ clients, formId = "project-form", initialValues, submitLabel, onSubmit }: ProjectFormProps) {
  const settings = useLiveQuery(() => settingsRepository.get(), [], null);
  const isCreateMode = initialValues === undefined;
  const [values, setValues] = useState<ProjectFormValues>(initialValues ?? PROJECT_FORM_DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [showGlyphPicker, setShowGlyphPicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => values.name.trim().length > 0, [values.name]);

  // Auto-derive glyph from name when in create mode
  useEffect(() => {
    if (!isCreateMode) return;
    if (values.name.trim()) {
      const auto = projectInitials(values.name);
      setValues((prev) => ({ ...prev, glyph: auto }));
    } else {
      setValues((prev) => ({ ...prev, glyph: "NP" }));
    }
  }, [values.name, isCreateMode]);

  useEffect(() => {
    if (!isCreateMode || !settings) return;
    setValues((prev) => ({
      ...prev,
      hourlyRate: prev.hourlyRate ?? settings.defaultHourlyRate,
      currency: prev.currency || settings.defaultCurrency,
    }));
  }, [isCreateMode, settings]);

  function applyClientDefaults(clientId: string | undefined) {
    const client = clientId ? clients.find((c) => c.id === clientId) : undefined;
    setValues((prev) => ({
      ...prev,
      clientId,
      hourlyRate: client?.defaultHourlyRate ?? settings?.defaultHourlyRate ?? prev.hourlyRate,
      currency: client?.currency ?? settings?.defaultCurrency ?? prev.currency,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isValid) { setError("Project name is required."); return; }
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch {
      setError("Could not save project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedClient = values.clientId ? clients.find((c) => c.id === values.clientId) : null;
  const displayGlyph = values.glyph || "NP";
  const currency = values.currency || settings?.defaultCurrency || "USD";

  return (
    <form id={formId} onSubmit={handleSubmit}>
      {/* Glyph picker (inline when open) */}
      {showGlyphPicker && (
        <div className="sd-form-section">
          <div className="sd-form-section-title">Choose an icon</div>
          <div className="sd-glyph-picker">
            {GLYPH_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                data-active={values.glyph === g}
                onClick={() => { setValues((prev) => ({ ...prev, glyph: g })); setShowGlyphPicker(false); }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Core */}
      <div className="sd-form-section">
        <div className="sd-field full">
          <label>Name <span className="req">*</span></label>
          <input
            className="sd-input"
            placeholder="e.g. Northwind · Marketing Site"
            value={values.name}
            onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
            autoFocus
          />
          <div className="sd-field-help">
            Tip — use <span className="sd-kbd">Client · Project</span> for clarity in the sidebar.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            className="sd-drawer-glyph"
            style={{ width: 44, height: 44, flexShrink: 0 }}
            onClick={() => setShowGlyphPicker((s) => !s)}
            title="Change icon"
          >
            {displayGlyph}
          </button>
          <div className="sd-field" style={{ flex: 1 }}>
            <label>Client <span className="hint">(optional)</span></label>
            <div className="sd-input-group">
              <select
                className="sd-select"
                value={values.clientId ?? ""}
                onChange={(e) => applyClientDefaults(e.target.value || undefined)}
              >
                <option value="">No client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn-inline"
                aria-label="Create client"
                onClick={() => setIsClientDrawerOpen(true)}
              >
                <Plus size={14} />
              </button>
            </div>
            {selectedClient?.defaultHourlyRate && (
              <div className="sd-field-help">
                Default rate from client: <span className="mono">{selectedClient.defaultHourlyRate}/h</span>
              </div>
            )}
          </div>
        </div>

        <div className="sd-field">
          <label>Status</label>
          <div className="sd-seg">
            {PROJECT_STATUSES.map((s) => (
              <button
                type="button"
                key={s.id}
                data-active={values.status === s.id}
                onClick={() => setValues((prev) => ({ ...prev, status: s.id }))}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sd-field full">
          <label>Description</label>
          <textarea
            className="sd-textarea"
            placeholder="What's this project about?"
            value={values.description}
            onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>

      {/* Section 2: Schedule */}
      <div className="sd-form-section">
        <div className="sd-form-section-title">Schedule</div>
        <div className="sd-form-grid">
          <div className="sd-field">
            <label>Start date</label>
            <input
              className="sd-input mono"
              type="date"
              value={values.startDate}
              onChange={(e) => setValues((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="sd-field">
            <label>Due date</label>
            <input
              className="sd-input mono"
              type="date"
              value={values.dueDate}
              onChange={(e) => setValues((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Money */}
      <div className="sd-form-section">
        <div className="sd-form-section-title">Money</div>
        <div className="sd-form-grid">
          <div className="sd-field">
            <label>Currency</label>
            <select
              className="sd-select"
              value={values.currency}
              onChange={(e) => setValues((prev) => ({ ...prev, currency: e.target.value as CurrencyCode | "" }))}
            >
              <option value="">Workspace default</option>
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="sd-field">
            <label>Hourly rate</label>
            <div className="sd-input-group">
              <span className="adorn left">{currency}</span>
              <input
                className="sd-input mono"
                type="number"
                min={0}
                placeholder="0"
                value={values.hourlyRate ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, hourlyRate: e.target.value ? Number(e.target.value) : undefined }))}
              />
              <span className="adorn right">/h</span>
            </div>
          </div>
          <div className="sd-field full">
            <label>Budget <span className="hint">(optional cap)</span></label>
            <div className="sd-input-group">
              <span className="adorn left">{currency}</span>
              <input
                className="sd-input mono"
                type="number"
                min={0}
                placeholder="0"
                value={values.budgetAmount ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, budgetAmount: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="sd-field-error" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {/* Non-drawer submit button (used when form is not inside a drawer with footer buttons) */}
      {formId === "project-form" && (
        <button type="submit" className="sd-btn" disabled={isSubmitting || !isValid} style={{ marginTop: 4 }}>
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      )}

      {/* Nested new client drawer */}
      <Drawer
        open={isClientDrawerOpen}
        title="New client"
        description="Add a client and attach to this project."
        level={1}
        onClose={() => setIsClientDrawerOpen(false)}
        footer={
          <>
            <button type="button" className="sd-btn ghost" onClick={() => setIsClientDrawerOpen(false)}>Cancel</button>
            <button type="submit" form="new-client-nested-form" className="sd-btn">
              <Plus size={13} /> Create client
            </button>
          </>
        }
      >
        <ClientForm
          formId="new-client-nested-form"
          submitLabel="Create client"
          onSubmit={async (clientValues) => {
            const created = await clientRepository.create(clientValues);
            setValues((prev) => ({
              ...prev,
              clientId: created.id,
              hourlyRate: created.defaultHourlyRate ?? settings?.defaultHourlyRate ?? prev.hourlyRate,
              currency: created.currency ?? settings?.defaultCurrency ?? prev.currency,
            }));
            setIsClientDrawerOpen(false);
          }}
        />
      </Drawer>
    </form>
  );
}
