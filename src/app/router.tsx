import { Navigate, createBrowserRouter } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/shared/layout/app-shell";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { SetupPage } from "@/modules/setup/pages/setup-page";
import { DashboardPage } from "@/modules/dashboard/pages/dashboard-page";
import { ClientsListPage } from "@/modules/clients/pages/clients-list-page";
import { ClientCreatePage } from "@/modules/clients/pages/client-create-page";
import { ClientDetailPage } from "@/modules/clients/pages/client-detail-page";
import { ClientEditPage } from "@/modules/clients/pages/client-edit-page";
import { ProjectsListPage } from "@/modules/projects/pages/projects-list-page";
import { ProjectCreatePage } from "@/modules/projects/pages/project-create-page";
import { ProjectDetailPage } from "@/modules/projects/pages/project-detail-page";
import { ProjectEditPage } from "@/modules/projects/pages/project-edit-page";
import { ProjectBoardPage } from "@/modules/kanban/pages/project-board-page";
import { TaskCreatePage } from "@/modules/tasks/pages/task-create-page";
import { TaskEditPage } from "@/modules/tasks/pages/task-edit-page";
import { TasksListPage } from "@/modules/tasks/pages/tasks-list-page";
import { SettingsPage } from "@/modules/settings/pages/settings-page";
import { DocsListPage } from "@/modules/docs/pages/docs-list-page";
import { ProjectDocsPage } from "@/modules/docs/pages/project-docs-page";
import { DocEditorPage } from "@/modules/docs/pages/doc-editor-page";
import { TimePage } from "@/modules/time/pages/time-page";
import { InvoiceCreatePage } from "@/modules/invoices/pages/invoice-create-page";
import { InvoiceDetailPage } from "@/modules/invoices/pages/invoice-detail-page";
import { InvoicesListPage } from "@/modules/invoices/pages/invoices-list-page";
import { InvoicePrintPage } from "@/modules/invoices/pages/invoice-print-page";
import { TrashPage } from "@/modules/trash/pages/trash-page";

function SetupRequiredRoute() {
  const isComplete = useLiveQuery(() => settingsRepository.ensureSetupCompletedFromLocalData(), [], null);

  if (isComplete === null) {
    return <div className="p-6 text-sm text-muted-foreground">Loading workspace...</div>;
  }

  if (!isComplete) {
    return <Navigate to="/setup" replace />;
  }

  return <AppShell />;
}

function SetupOnlyRoute() {
  const isComplete = useLiveQuery(() => settingsRepository.ensureSetupCompletedFromLocalData(), [], null);

  if (isComplete === null) {
    return <div className="p-6 text-sm text-muted-foreground">Loading setup...</div>;
  }

  if (isComplete) {
    return <Navigate to="/" replace />;
  }

  return <SetupPage />;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">This section is planned in upcoming milestones.</p>
    </div>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: "/setup",
      element: <SetupOnlyRoute />
    },
    {
      path: "/",
      element: <SetupRequiredRoute />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "clients", element: <ClientsListPage /> },
        { path: "clients/new", element: <ClientCreatePage /> },
        { path: "clients/:clientId", element: <ClientDetailPage /> },
        { path: "clients/:clientId/edit", element: <ClientEditPage /> },
        { path: "projects", element: <ProjectsListPage /> },
        { path: "projects/new", element: <ProjectCreatePage /> },
        { path: "projects/:projectId", element: <ProjectDetailPage /> },
        { path: "projects/:projectId/edit", element: <ProjectEditPage /> },
        { path: "projects/:projectId/tasks", element: <TasksListPage /> },
        { path: "projects/:projectId/tasks/new", element: <TaskCreatePage /> },
        { path: "projects/:projectId/board", element: <ProjectBoardPage /> },
        { path: "projects/:projectId/docs", element: <ProjectDocsPage /> },
        { path: "projects/:projectId/time", element: <TimePage /> },
        { path: "projects/:projectId/invoices", element: <InvoicesListPage /> },
        { path: "projects/:projectId/invoices/new", element: <InvoiceCreatePage /> },
        { path: "tasks", element: <TasksListPage /> },
        { path: "tasks/new", element: <TaskCreatePage /> },
        { path: "tasks/:taskId/edit", element: <TaskEditPage /> },
        { path: "docs", element: <DocsListPage /> },
        { path: "docs/:docId", element: <DocEditorPage /> },
        { path: "time", element: <TimePage /> },
        { path: "invoices", element: <InvoicesListPage /> },
        { path: "invoices/new", element: <InvoiceCreatePage /> },
        { path: "invoices/:invoiceId", element: <InvoiceDetailPage /> },
        { path: "invoices/:invoiceId/print", element: <InvoicePrintPage /> },
        { path: "trash", element: <TrashPage /> },
        { path: "settings", element: <SettingsPage /> }
      ]
    },
    {
      path: "*",
      element: <Navigate to="/" replace />
    }
  ],
  {
    basename: import.meta.env.BASE_URL
  }
);
