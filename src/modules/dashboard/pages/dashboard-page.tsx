import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { docsRepository } from "@/modules/docs/docs.repository";
import { invoiceRepository } from "@/modules/invoices/invoice.repository";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { timeRepository } from "@/modules/time/time.repository";

export function DashboardPage() {
  const [clientFilter, setClientFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [billableOnly, setBillableOnly] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("");

  const clients = useLiveQuery(() => db.clients.toCollection().filter((client) => !client.deletedAt).toArray(), [], []);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toCollection().filter((task) => !task.deletedAt).toArray(), [], []);
  const timeEntries = useLiveQuery(() => timeRepository.listActive(), [], []);
  const recentDocs = useLiveQuery(() => docsRepository.listRecent(3), [], []);
  const invoices = useLiveQuery(() => invoiceRepository.listActive(), [], []);

  const statusById = useMemo(() => new Map(statuses.map((status) => [status.id, status])), [statuses]);
  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const projectClientById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.clientId])),
    [projects]
  );

  const filteredProjects = projects.filter((project) => {
    if (projectFilter && project.id !== projectFilter) return false;
    if (clientFilter && project.clientId !== clientFilter) return false;
    return true;
  });

  const filteredTasks = tasks.filter((task) => {
    if (projectFilter && task.projectId !== projectFilter) return false;
    const projectClientId = projectClientById.get(task.projectId);
    if (clientFilter && projectClientId !== clientFilter) return false;
    if (taskStatusFilter && task.statusId !== taskStatusFilter) return false;
    return true;
  });

  const filteredTime = timeEntries.filter((entry) => {
    if (projectFilter && entry.projectId !== projectFilter) return false;
    const projectClientId = projectClientById.get(entry.projectId);
    if (clientFilter && projectClientId !== clientFilter) return false;
    if (billableOnly && !entry.billable) return false;
    return true;
  });

  const filteredInvoices = invoices.filter((invoice) => {
    if (projectFilter && invoice.projectId !== projectFilter) return false;
    if (clientFilter && invoice.clientId !== clientFilter) return false;
    if (invoiceStatusFilter && invoice.status !== invoiceStatusFilter) return false;
    return true;
  });

  const billableSummary = filteredTime.reduce(
    (acc, entry) => {
      if (!entry.billable) return acc;
      acc.billableMinutes += entry.durationMinutes;
      if (entry.hourlyRate !== undefined) {
        acc.billableAmount += (entry.durationMinutes / 60) * entry.hourlyRate;
      }
      return acc;
    },
    { billableMinutes: 0, billableAmount: 0 }
  );

  const openTasks = filteredTasks.filter((task) => !statusById.get(task.statusId)?.isDone).length;
  const completedTasks = filteredTasks.filter((task) => statusById.get(task.statusId)?.isDone).length;
  const activeClients = clients.filter((client) =>
    filteredProjects.some((project) => project.clientId === client.id)
  ).length;
  const activeProjects = filteredProjects.filter((project) => project.status === "active").length;

  const billableHours = (billableSummary.billableMinutes / 60).toFixed(2);
  const billableAmount = billableSummary.billableAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });
  const draftInvoices = filteredInvoices.filter((invoice) => invoice.status === "draft").length;
  const unpaidInvoices = filteredInvoices.filter((invoice) => invoice.status === "sent").length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Your SoloDesk workspace is ready.</p>
      </div>

      <section className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-5">
        <select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All projects</option>
          {projects
            .filter((project) => !clientFilter || project.clientId === clientFilter)
            .map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
        </select>
        <select value={taskStatusFilter} onChange={(event) => setTaskStatusFilter(event.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All task statuses</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
        <select value={invoiceStatusFilter} onChange={(event) => setInvoiceStatusFilter(event.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All invoice statuses</option>
          <option value="draft">draft</option>
          <option value="sent">sent</option>
          <option value="paid">paid</option>
          <option value="void">void</option>
        </select>
        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
          <input type="checkbox" checked={billableOnly} onChange={(event) => setBillableOnly(event.target.checked)} />
          Billable only
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active Clients</p>
          <p className="mt-2 text-2xl font-semibold">{activeClients}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active Projects</p>
          <p className="mt-2 text-2xl font-semibold">{activeProjects}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open Tasks</p>
          <p className="mt-2 text-2xl font-semibold">{openTasks}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed Tasks</p>
          <p className="mt-2 text-2xl font-semibold">{completedTasks}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Billable Hours</p>
          <p className="mt-2 text-2xl font-semibold">{billableHours}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unbilled Amount</p>
          <p className="mt-2 text-2xl font-semibold">{billableAmount}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Draft Invoices</p>
          <p className="mt-2 text-2xl font-semibold">{draftInvoices}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
          <p className="mt-2 text-2xl font-semibold">{unpaidInvoices}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Recent Docs</p>
          {recentDocs.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">-</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {recentDocs.map((doc) => (
                <li key={doc.id} className="truncate">
                  {doc.title}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
