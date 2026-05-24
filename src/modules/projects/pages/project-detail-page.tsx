import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Clock, FileText, Flag, Receipt, CheckSquare, ChevronRight } from "lucide-react";
import { db } from "@/db/db";
import { clientRepository } from "@/modules/clients/client.repository";
import { docsRepository } from "@/modules/docs/docs.repository";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { timeRepository } from "@/modules/time/time.repository";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { settingsRepository } from "@/modules/settings/settings.repository";

function fmtDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}`;
  return `${h}.${String(Math.round((m / 60) * 10)).padStart(1, "0")}`;
}

function isOverdue(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  return dateStr < new Date().toISOString().split("T")[0];
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}

function projectInitials(name: string, glyph?: string): string {
  if (glyph) return glyph;
  const clean = name.replace(/[·→\-–]/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function PropRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="sd-prop-row">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const project = useLiveQuery(
    () => (projectId ? projectRepository.getById(projectId) : Promise.resolve(undefined)),
    [projectId],
    undefined
  );
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const tasks = useLiveQuery(
    () => projectId
      ? db.tasks.where("projectId").equals(projectId).filter((t) => !t.deletedAt).toArray()
      : Promise.resolve([]),
    [projectId],
    []
  );
  const docs = useLiveQuery(
    () => (projectId ? docsRepository.listByProjectId(projectId) : Promise.resolve([])),
    [projectId],
    []
  );
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const timeEntries = useLiveQuery(
    () => (projectId ? timeRepository.listActive(projectId) : Promise.resolve([])),
    [projectId],
    []
  );
  const invoices = useLiveQuery(
    () => (projectId ? invoiceRepository.listActive({ projectId }) : Promise.resolve([])),
    [projectId],
    []
  );
  const settings = useLiveQuery(() => settingsRepository.get(), [], null);

  const doneStatusIds = useMemo(
    () => new Set(statuses.filter((s) => s.isDone).map((s) => s.id)),
    [statuses]
  );

  const openTasks = useMemo(() => tasks.filter((t) => !doneStatusIds.has(t.statusId)), [tasks, doneStatusIds]);
  const doneTasks = useMemo(() => tasks.filter((t) => doneStatusIds.has(t.statusId)), [tasks, doneStatusIds]);
  const overdueTasks = useMemo(() => openTasks.filter((t) => isOverdue(t.dueDate)), [openTasks]);

  const weekMinutes = useMemo(
    () => timeEntries.filter((e) => isThisWeek(e.entryDate)).reduce((s, e) => s + e.durationMinutes, 0),
    [timeEntries]
  );
  const billableWeekMinutes = useMemo(
    () => timeEntries.filter((e) => isThisWeek(e.entryDate) && e.billable).reduce((s, e) => s + e.durationMinutes, 0),
    [timeEntries]
  );

  const draftInvoices = invoices.filter((i) => i.status === "draft");
  const unbilledTotal = draftInvoices.reduce((s, i) => s + i.total, 0);

  const progress = tasks.length > 0 ? doneTasks.length / tasks.length : 0;

  if (project === undefined) {
    return (
      <div className="sd-page">
        <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  if (!project || project.deletedAt) {
    return (
      <div className="sd-page">
        <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>Project not found.</div>
      </div>
    );
  }

  const client = project.clientId ? clients.find((c) => c.id === project.clientId) : null;
  const glyph = projectInitials(project.name, project.glyph);
  const currency = project.currency ?? settings?.defaultCurrency ?? "USD";

  return (
    <div className="sd-page">
      {/* Page head */}
      <div className="sd-page-head">
        <div className="sd-page-emoji">{glyph}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="sd-page-title">{project.name}</h1>
          <div className="sd-page-subtitle">
            <span className="sd-pill">
              <CheckSquare size={11} />
              {project.status === "active" ? "Active" : project.status}
            </span>
            {client && <span>· {client.name}</span>}
            {project.dueDate && (
              <span>· Due <span className="mono">{fmtDate(project.dueDate)}</span></span>
            )}
            <span>· <span className="mono">{Math.round(progress * 100)}%</span> complete</span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="sd-kpis">
        <div className="sd-kpi">
          <div className="sd-kpi-label"><CheckSquare size={13} /> Open tasks</div>
          <div className="sd-kpi-value">{openTasks.length}</div>
          <div className="sd-kpi-delta">{doneTasks.length} done</div>
        </div>
        <div className="sd-kpi">
          <div className="sd-kpi-label"><Flag size={13} /> Overdue</div>
          <div className="sd-kpi-value">{overdueTasks.length}</div>
          <div className="sd-kpi-delta">
            across <span className="num">{tasks.filter((t) => t.dueDate).length}</span> dated tasks
          </div>
        </div>
        <div className="sd-kpi">
          <div className="sd-kpi-label"><Clock size={13} /> Logged this week</div>
          <div className="sd-kpi-value">
            {fmtHours(weekMinutes)}<span className="unit">h</span>
          </div>
          <div className="sd-kpi-delta">
            <span className="num">{fmtHours(billableWeekMinutes)}h</span> billable
          </div>
        </div>
        <div className="sd-kpi">
          <div className="sd-kpi-label"><Receipt size={13} /> Unbilled</div>
          <div className="sd-kpi-value">{fmtMoney(unbilledTotal, currency)}</div>
          <div className="sd-kpi-delta">
            <span className="num">{draftInvoices.length}</span> draft invoices
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="sd-split">
        {/* Left column */}
        <div>
          <div className="sd-section-title">
            Up next
            <div className="right">
              <button
                type="button"
                className="sd-topbar-act"
                onClick={() => navigate(`/projects/${projectId}/tasks`)}
              >
                See all <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="sd-tbl">
            <div className="sd-tbl-head" style={{ gridTemplateColumns: "22px 1fr 110px 80px" }}>
              <div />
              <div>Task</div>
              <div>Status</div>
              <div style={{ textAlign: "right" }}>Due</div>
            </div>
            {openTasks.slice(0, 6).map((task) => {
              const status = statuses.find((s) => s.id === task.statusId);
              const overdue = isOverdue(task.dueDate);
              return (
                <div
                  key={task.id}
                  className="sd-tbl-row"
                  style={{ gridTemplateColumns: "22px 1fr 110px 80px" }}
                  onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}/edit`)}
                >
                  <button
                    className="sd-task-check"
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Check size={9} />
                  </button>
                  <div className="ttl">{task.title}</div>
                  <div>
                    <span className="sd-status-chip">
                      <span className="sd-status-dot" style={{ background: "#6c6c70" }} />
                      {status?.name ?? "—"}
                    </span>
                  </div>
                  <div
                    className="num"
                    style={{
                      textAlign: "right",
                      color: overdue ? "#0e0e10" : "var(--fg-muted)",
                      fontWeight: overdue ? 600 : 400,
                    }}
                  >
                    {fmtDate(task.dueDate)}
                  </div>
                </div>
              );
            })}
            {openTasks.length === 0 && (
              <div style={{ padding: "20px 14px", textAlign: "center", color: "var(--fg-muted)", fontSize: 13 }}>
                No open tasks — all done!
              </div>
            )}
          </div>

          <div className="sd-section-title" style={{ marginTop: 28 }}>
            Recent docs
            <div className="right">
              <button
                type="button"
                className="sd-topbar-act"
                onClick={() => navigate(`/projects/${projectId}/docs`)}
              >
                All docs <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="sd-tbl">
            <div className="sd-tbl-head" style={{ gridTemplateColumns: "18px 1fr 100px" }}>
              <div />
              <div>Title</div>
              <div style={{ textAlign: "right" }}>Updated</div>
            </div>
            {docs.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="sd-tbl-row"
                style={{ gridTemplateColumns: "18px 1fr 100px" }}
                onClick={() => navigate(`/docs/${doc.id}`)}
              >
                <FileText size={13} style={{ color: "var(--fg-muted)" }} />
                <div className="ttl">{doc.title}</div>
                <div className="muted num" style={{ textAlign: "right" }}>
                  {fmtDate(doc.updatedAt)}
                </div>
              </div>
            ))}
            {docs.length === 0 && (
              <div style={{ padding: "20px 14px", textAlign: "center", color: "var(--fg-muted)", fontSize: 13 }}>
                No docs yet
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="sd-section-title">About</div>
          <div style={{
            border: "1px solid var(--line)", borderRadius: "var(--r-md)",
            padding: 14, background: "#fff",
          }}>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--fg)", lineHeight: 1.6 }}>
              {project.description
                ? (typeof project.description === "object"
                  ? JSON.stringify(project.description).substring(0, 120) + "…"
                  : String(project.description))
                : <span style={{ color: "var(--fg-muted)" }}>No description yet.</span>}
            </p>
          </div>

          <div className="sd-section-title" style={{ marginTop: 20 }}>Properties</div>
          <div style={{
            border: "1px solid var(--line)", borderRadius: "var(--r-md)",
            padding: 6, background: "#fff",
          }}>
            <PropRow label="Client" value={client ? client.name : "—"} />
            <PropRow
              label="Rate"
              value={project.hourlyRate
                ? <span className="mono">{fmtMoney(project.hourlyRate, currency)}/h</span>
                : "—"}
            />
            <PropRow
              label="Budget"
              value={project.budgetAmount
                ? <span className="mono">{fmtMoney(project.budgetAmount, currency)}</span>
                : "—"}
            />
            <PropRow
              label="Start"
              value={<span className="mono">{fmtDate(project.startDate)}</span>}
            />
            <PropRow
              label="Due"
              value={<span className="mono">{fmtDate(project.dueDate)}</span>}
            />
            <PropRow
              label="Currency"
              value={<span className="mono">{currency}</span>}
            />
          </div>

          <div className="sd-section-title" style={{ marginTop: 20 }}>Progress</div>
          <div style={{
            border: "1px solid var(--line)", borderRadius: "var(--r-md)",
            padding: 14, background: "#fff",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>Completion</span>
              <span className="mono" style={{ fontWeight: 600 }}>{Math.round(progress * 100)}%</span>
            </div>
            <div className="sd-progress-bar">
              <div className="sd-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginTop: 10, color: "var(--fg-muted)", fontSize: 12,
            }}>
              <span><span className="mono" style={{ color: "var(--fg)" }}>{doneTasks.length}</span> done</span>
              <span><span className="mono" style={{ color: "var(--fg)" }}>{openTasks.length}</span> open</span>
              <span><span className="mono" style={{ color: "var(--fg)" }}>{tasks.length}</span> total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
