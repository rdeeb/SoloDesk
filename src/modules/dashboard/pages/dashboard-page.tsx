import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Check,
  CheckSquare,
  Clock,
  FileText,
  Flag,
  Receipt,
} from "lucide-react";
import { db } from "@/db/db";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { timeRepository } from "@/modules/time/time.repository";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { docsRepository } from "@/modules/docs/docs.repository";

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

function KpiCard({
  label,
  icon: Icon,
  value,
  unit,
  delta,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  value: string | number;
  unit?: string;
  delta: React.ReactNode;
}) {
  return (
    <div className="sd-kpi">
      <div className="sd-kpi-label">
        <Icon size={13} />
        {label}
      </div>
      <div className="sd-kpi-value">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="sd-kpi-delta">{delta}</div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const settings = useLiveQuery(() => settingsRepository.get(), [], null);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toCollection().filter((t) => !t.deletedAt).toArray(), [], []);
  const timeEntries = useLiveQuery(() => timeRepository.listActive(), [], []);
  const invoices = useLiveQuery(() => invoiceRepository.listActive(), [], []);
  const recentDocs = useLiveQuery(() => docsRepository.listRecent(4), [], []);

  const doneStatusIds = useMemo(
    () => new Set(statuses.filter((s) => s.isDone).map((s) => s.id)),
    [statuses]
  );
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const activeProjects = projects.filter((p) => p.status === "active");
  const openTasks = tasks.filter((t) => !doneStatusIds.has(t.statusId));
  const overdueTasks = openTasks.filter((t) => isOverdue(t.dueDate));

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

  const currency = settings?.defaultCurrency ?? "USD";
  const workspaceName = settings?.workspaceName ?? "Your workspace";

  // Progress per project (done/total)
  const projectProgress = useMemo(() => {
    const map = new Map<string, { done: number; total: number; open: number }>();
    for (const p of projects) map.set(p.id, { done: 0, total: 0, open: 0 });
    for (const t of tasks) {
      const entry = map.get(t.projectId);
      if (!entry) continue;
      entry.total++;
      if (doneStatusIds.has(t.statusId)) entry.done++;
      else entry.open++;
    }
    return map;
  }, [projects, tasks, doneStatusIds]);

  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const firstName = workspaceName.split(/\s|·/)[0];

  return (
    <div className="sd-page wide">
      {/* Page head */}
      <div className="sd-page-head">
        <div className="sd-page-emoji outline" style={{ fontSize: 22 }}>◆</div>
        <div>
          <h1 className="sd-page-title">Good morning, {firstName}</h1>
          <div className="sd-page-subtitle">
            <span>
              <span className="mono">{dayName}, {dateLabel}</span>
              {" · "}
              {activeProjects.length} active projects
              {" · "}
              {openTasks.length} open tasks
            </span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="sd-kpis">
        <KpiCard
          label="Active projects"
          icon={Briefcase}
          value={activeProjects.length}
          delta={<>{projects.length} total</>}
        />
        <KpiCard
          label="Open tasks"
          icon={CheckSquare}
          value={openTasks.length}
          delta={<><span className="num">{overdueTasks.length}</span> overdue</>}
        />
        <KpiCard
          label="Logged · this week"
          icon={Clock}
          value={fmtHours(weekMinutes)}
          unit="h"
          delta={<><span className="num">{fmtHours(billableWeekMinutes)}h</span> billable</>}
        />
        <KpiCard
          label="Unbilled"
          icon={Receipt}
          value={fmtMoney(unbilledTotal, currency)}
          delta={<>across <span className="num">{draftInvoices.length}</span> draft invoices</>}
        />
      </div>

      {/* Main split */}
      <div className="sd-split">
        {/* Left column */}
        <div>
          <div className="sd-section-title">
            Today
            <div className="right">
              <span className="mono" style={{ color: "var(--fg-muted)", fontSize: 12 }}>{openTasks.length} items</span>
            </div>
          </div>

          <div className="sd-tbl">
            <div className="sd-tbl-head" style={{ gridTemplateColumns: "22px 1fr 130px 110px 76px" }}>
              <div />
              <div>Task</div>
              <div>Project</div>
              <div>Status</div>
              <div style={{ textAlign: "right" }}>Due</div>
            </div>
            {openTasks.slice(0, 7).map((task) => {
              const project = projectById.get(task.projectId);
              const status = statuses.find((s) => s.id === task.statusId);
              const overdue = isOverdue(task.dueDate);
              const initials = project ? projectInitials(project.name, project.glyph) : "?";
              return (
                <div
                  key={task.id}
                  className="sd-tbl-row"
                  style={{ gridTemplateColumns: "22px 1fr 130px 110px 76px" }}
                  onClick={() => project && navigate(`/projects/${project.id}/tasks`)}
                >
                  <button className="sd-task-check" type="button" onClick={(e) => e.stopPropagation()}>
                    <Check size={9} />
                  </button>
                  <div className="ttl">{task.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: 3,
                      background: "#0e0e10", color: "#fff",
                      display: "inline-grid", placeItems: "center",
                      fontWeight: 700, fontSize: 8, flexShrink: 0,
                    }}>
                      {initials.charAt(0)}
                    </span>
                    <span className="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {project?.name.split(/[·→]/).pop()?.trim() ?? "—"}
                    </span>
                  </div>
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
              <div style={{ padding: "24px 14px", textAlign: "center", color: "var(--fg-muted)", fontSize: 13 }}>
                No open tasks
              </div>
            )}
          </div>

          <div className="sd-section-title" style={{ marginTop: 28 }}>Active projects</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {activeProjects.slice(0, 6).map((project) => {
              const prog = projectProgress.get(project.id) ?? { done: 0, total: 0, open: 0 };
              const pct = prog.total > 0 ? prog.done / prog.total : 0;
              const glyph = projectInitials(project.name, project.glyph);
              return (
                <div
                  key={project.id}
                  className="sd-proj-card"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="sd-proj-glyph">{glyph}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {project.name.split(/[·→]/).pop()?.trim() || project.name}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-muted)", flexShrink: 0 }}>
                      {prog.open} open
                    </span>
                  </div>
                  <div>
                    <div className="sd-progress-bar" style={{ marginBottom: 6 }}>
                      <div className="sd-progress-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-muted)" }}>
                      <span><span className="mono">{Math.round(pct * 100)}%</span> complete</span>
                      {project.dueDate && <span>Due <span className="mono">{fmtDate(project.dueDate)}</span></span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="sd-section-title">Recent docs</div>
          <div className="sd-activity">
            {recentDocs.map((doc, i) => (
              <div
                key={doc.id}
                className="sd-activity-row"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/docs/${doc.id}`)}
              >
                <div className="sd-activity-ico">
                  <FileText size={12} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-muted)", marginTop: 2 }}>
                    {fmtDate(doc.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
            {recentDocs.length === 0 && (
              <div style={{ padding: "16px 12px", fontSize: 13, color: "var(--fg-muted)" }}>No docs yet</div>
            )}
          </div>

          {overdueTasks.length > 0 && (
            <>
              <div className="sd-section-title" style={{ marginTop: 20 }}>Overdue</div>
              <div className="sd-activity">
                {overdueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="sd-activity-row"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/projects/${task.projectId}/tasks`)}
                  >
                    <div className="sd-activity-ico">
                      <Flag size={12} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.title}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)", flexShrink: 0 }}>
                      {fmtDate(task.dueDate)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="sd-section-title" style={{ marginTop: 20 }}>All projects</div>
          <div className="sd-tbl">
            {projects.slice(0, 6).map((p) => {
              const prog = projectProgress.get(p.id) ?? { done: 0, total: 0, open: 0 };
              const pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className="sd-tbl-row"
                  style={{ gridTemplateColumns: "1fr 50px 60px", height: 38 }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <div className="ttl">{p.name.split(/[·→]/).pop()?.trim() || p.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{p.status}</div>
                  <div className="num" style={{ textAlign: "right" }}>{pct}%</div>
                </div>
              );
            })}
            {projects.length === 0 && (
              <div style={{ padding: "20px 14px", textAlign: "center", color: "var(--fg-muted)", fontSize: 13 }}>
                No projects yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
