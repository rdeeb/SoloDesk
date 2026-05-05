import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BriefcaseBusiness, ChevronDown, ChevronRight, FileText, Home, Plus, ReceiptText, Settings, Trash2, Users } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import { Drawer } from "@/shared/components/ui/drawer";
import { clientRepository } from "@/modules/clients/client.repository";
import { ProjectForm } from "@/modules/projects/components/project-form";
import { projectRepository } from "@/modules/projects/project.repository";
import { cn } from "@/shared/lib/utils";

const MANAGEMENT_ITEMS = [
  { label: "Clients", to: "/clients", icon: Users },
  { label: "Invoices", to: "/invoices", icon: ReceiptText },
  { label: "Standalone docs", to: "/docs", icon: FileText },
  { label: "Config", to: "/settings", icon: Settings },
  { label: "Trash", to: "/trash", icon: Trash2 }
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);
  const drawer = searchParams.get("drawer");
  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(`${to}/`));
  const isNewProjectOpen = drawer === "new-project";

  function openNewProjectDrawer() {
    navigate(`${location.pathname}?drawer=new-project`);
  }

  function closeDrawer() {
    navigate(location.pathname);
  }

  function startProjectRename(projectId: string, projectName: string) {
    setEditingProjectId(projectId);
    setEditingProjectName(projectName);
  }

  async function commitProjectRename(projectId: string) {
    const nextName = editingProjectName.trim();
    const project = projects.find((item) => item.id === projectId);
    setEditingProjectId(null);

    if (!project || !nextName || nextName === project.name) {
      return;
    }

    await projectRepository.rename(projectId, nextName);
  }

  function handleProjectRenameKeyDown(event: KeyboardEvent<HTMLInputElement>, projectId: string) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitProjectRename(projectId);
    }

    if (event.key === "Escape") {
      setEditingProjectId(null);
    }
  }

  useEffect(() => {
    if (editingProjectId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingProjectId]);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 border-r bg-card md:flex md:flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">SoloDesk</h1>
          <p className="text-sm text-muted-foreground">Local-first workspace</p>
        </div>
        <nav className="flex flex-1 flex-col p-3">
          <div className="space-y-1">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/" && "bg-secondary text-secondary-foreground"
              )}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>

            <div className="pt-3">
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Projects</p>
                <button
                  type="button"
                  aria-label="Create project"
                  onClick={openNewProjectDrawer}
                  className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="space-y-1">
                {projects.map((project) => {
                  const isProjectActive = location.pathname.startsWith(`/projects/${project.id}`);
                  const isEditing = editingProjectId === project.id;

                  if (isEditing) {
                    return (
                      <div
                        key={project.id}
                        className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                      >
                        <BriefcaseBusiness className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <input
                          ref={editInputRef}
                          value={editingProjectName}
                          onChange={(event) => setEditingProjectName(event.target.value)}
                          onBlur={() => {
                            void commitProjectRename(project.id);
                          }}
                          onKeyDown={(event) => handleProjectRenameKeyDown(event, project.id)}
                          className="min-w-0 flex-1 rounded-sm border bg-background px-1.5 py-0.5 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          aria-label={`Rename ${project.name}`}
                        />
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}/tasks`}
                      onClick={(event) => {
                        if (isProjectActive) {
                          event.preventDefault();
                          startProjectRename(project.id, project.name);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                        isProjectActive && "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <BriefcaseBusiness className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  );
                })}
                {projects.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No projects yet.</p>
                ) : null}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={openNewProjectDrawer} className="mt-3 w-full gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New project
              </Button>
            </div>
          </div>

          <div className="mt-auto border-t pt-3">
            <button
              type="button"
              onClick={() => setIsManagementOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span>Management</span>
              {isManagementOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {isManagementOpen ? (
              <div className="mt-1 space-y-1">
                {MANAGEMENT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive(item.to) && "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
          <p className="text-sm text-muted-foreground">SoloDesk</p>
          <ThemeToggle />
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b bg-background px-4 py-2 md:hidden">
          <Link
            to="/"
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground",
              location.pathname === "/" && "bg-secondary text-secondary-foreground"
            )}
          >
            Dashboard
          </Link>
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}/tasks`}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground",
                location.pathname.startsWith(`/projects/${project.id}`) && "bg-secondary text-secondary-foreground"
              )}
            >
              {project.name}
            </Link>
          ))}
          <button type="button" onClick={openNewProjectDrawer} className="whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground">
            New project
          </button>
          {MANAGEMENT_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground",
                isActive(item.to) && "bg-secondary text-secondary-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <Drawer
        open={isNewProjectOpen}
        title="Create project"
        description="Projects are the primary workspace in SoloDesk."
        onClose={closeDrawer}
      >
        <ProjectForm
          clients={clients}
          submitLabel="Create project"
          onSubmit={async (values) => {
            const created = await projectRepository.create(values);
            navigate(`/projects/${created.id}/tasks`);
          }}
        />
      </Drawer>
    </div>
  );
}
