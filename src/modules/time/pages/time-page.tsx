import { useLiveQuery } from "dexie-react-hooks";
import { Navigate, useParams } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { taskRepository } from "@/modules/tasks/task.repository";
import { TimeEntryForm } from "@/modules/time/components/time-entry-form";
import { timeRepository } from "@/modules/time/time.repository";

function formatHours(minutes: number) {
  return (minutes / 60).toFixed(2);
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });
}

export function TimePage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const project = useLiveQuery(
    async () => {
      if (!projectId) {
        return undefined;
      }
      return projectRepository.getById(projectId);
    },
    [projectId],
    null
  );
  const entries = useLiveQuery(() => timeRepository.listActive(projectId), [projectId], []);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const tasks = useLiveQuery(() => taskRepository.listActive(), [], []);
  const summary = useLiveQuery(() => timeRepository.getBillableSummary(projectId), [projectId], {
    billableMinutes: 0,
    billableAmount: 0
  });
  const clientSummaries = useLiveQuery(() => timeRepository.getClientSummaries(), [], []);

  if (projectId && project === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading time entries...</div>;
  }

  if (projectId && (!project || project.deletedAt)) {
    return <Navigate to="/projects" replace />;
  }

  const projectNameById = new Map(projects.map((item) => [item.id, item.name]));
  const clientNameById = new Map(clients.map((item) => [item.id, item.name]));
  const projectClientIdById = new Map(projects.map((item) => [item.id, item.clientId]));
  const taskTitleById = new Map(tasks.map((item) => [item.id, item.title]));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{project ? `${project.name} Time` : "Time Tracking"}</h2>
        <p className="text-sm text-muted-foreground">Manual time logging with billable rollups.</p>
      </div>

      <TimeEntryForm
        lockedProjectId={projectId}
        onSubmit={async (values) => {
          await timeRepository.create(values);
        }}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Billable Hours</p>
          <p className="mt-1 text-xl font-semibold">{formatHours(summary.billableMinutes)}</p>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Unbilled Billable Amount</p>
          <p className="mt-1 text-xl font-semibold">{formatCurrency(summary.billableAmount)}</p>
        </article>
      </section>

      {!projectId ? (
        <section className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="font-medium">Client Time Summary</h3>
          </div>
          {clientSummaries.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No billable client time yet.</p>
          ) : (
            <ul className="divide-y">
              {clientSummaries.map((item) => (
                <li key={item.clientId} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{item.clientName}</span>
                  <span className="text-muted-foreground">
                    {formatHours(item.billableMinutes)}h · {formatCurrency(item.billableAmount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Billable</th>
              <th className="px-4 py-3 font-medium">Rate</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="px-4 py-3 text-muted-foreground">{entry.entryDate}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {projectNameById.get(entry.projectId) ?? "Unknown"}
                  {projectClientIdById.get(entry.projectId)
                    ? ` / ${clientNameById.get(projectClientIdById.get(entry.projectId) as string) ?? "Client"}`
                    : ""}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{entry.taskId ? taskTitleById.get(entry.taskId) ?? "Task" : "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatHours(entry.durationMinutes)}h</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.billable ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {entry.hourlyRate !== undefined ? formatCurrency(entry.hourlyRate) : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-sm font-medium underline"
                    onClick={() => {
                      void timeRepository.softDelete(entry.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted-foreground">No time entries yet.</p> : null}
      </section>
    </div>
  );
}
