import { useLiveQuery } from "dexie-react-hooks";
import {
  Briefcase,
  ChevronRight,
  Clock,
  FileText,
  Home,
  LayoutGrid,
  Plus,
  Receipt,
  Settings,
  Trash2,
  Users,
  CheckSquare,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { clientRepository } from "@/modules/clients/client.repository";
import { ProjectForm } from "@/modules/projects/components/project-form";
import { projectRepository } from "@/modules/projects/project.repository";
import { cn } from "@/shared/lib/utils";
import { Drawer } from "@/shared/components/ui/drawer";

function projectInitials(name: string): string {
  const clean = name.replace(/[·→\-–]/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface RailBtnProps {
  to: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
}

function RailBtn({ to, icon: Icon, label, active }: RailBtnProps) {
  return (
    <Link to={to} className="sd-rail-btn" data-active={active}>
      <Icon size={18} />
      <span className="sd-rail-tip">{label}</span>
    </Link>
  );
}

function ProjectSidebar({
  projectId,
  projectName,
  projectGlyph,
  currentView,
}: {
  projectId: string;
  projectName: string;
  projectGlyph?: string;
  currentView: string;
}) {
  const navigate = useNavigate();
  const glyph = projectGlyph || projectInitials(projectName);

  const tabs = [
    { id: "overview", label: "Overview", icon: Home, to: `/projects/${projectId}` },
    { id: "board", label: "Board", icon: LayoutGrid, to: `/projects/${projectId}/board` },
    { id: "tasks", label: "Tasks", icon: CheckSquare, to: `/projects/${projectId}/tasks` },
    { id: "docs", label: "Docs", icon: FileText, to: `/projects/${projectId}/docs` },
    { id: "time", label: "Time", icon: Clock, to: `/projects/${projectId}/time` },
    { id: "invoices", label: "Invoices", icon: Receipt, to: `/projects/${projectId}/invoices` },
  ];

  return (
    <>
      <div className="sd-side-header">
        <div className="sd-side-glyph">{glyph}</div>
        <span className="sd-side-title">
          <span className="sd-side-title-text">{projectName.split(/[·→]/).pop()?.trim() || projectName}</span>
        </span>
        <Link to="/projects" className="sd-side-act" title="All projects">
          <ChevronRight size={14} />
        </Link>
      </div>
      <div className="sd-side-scroll">
        <div style={{ marginTop: 4 }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.to}
                className="sd-side-row"
                data-active={isActive}
              >
                <Icon size={15} />
                <span className="label">{tab.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="sd-side-divider" />

        <div className="sd-side-section">ACTIONS</div>
        <button
          type="button"
          className="sd-side-row"
          onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
        >
          <Plus size={14} />
          <span className="label" style={{ color: "var(--fg-muted)" }}>New task</span>
        </button>
        <button
          type="button"
          className="sd-side-row"
          onClick={() => navigate(`/projects/${projectId}/docs`)}
        >
          <FileText size={14} />
          <span className="label" style={{ color: "var(--fg-muted)" }}>New doc</span>
        </button>
      </div>
      <div className="sd-side-footer">
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0e0e10", flexShrink: 0 }} />
        <span>Local workspace</span>
      </div>
    </>
  );
}

function GlobalSidebar({
  projects,
  currentPath,
  onNewProject,
}: {
  projects: Awaited<ReturnType<typeof projectRepository.listActive>>;
  currentPath: string;
  onNewProject: () => void;
}) {
  return (
    <>
      <div className="sd-side-header">
        <span className="sd-side-title">
          <span className="sd-side-glyph" style={{ background: "#fff", color: "#0e0e10", border: "1px solid var(--line)" }}>S</span>
          <span className="sd-side-title-text">SoloDesk</span>
        </span>
      </div>
      <div className="sd-side-scroll">
        <Link
          to="/"
          className="sd-side-row"
          data-active={currentPath === "/"}
        >
          <Home size={15} />
          <span className="label">Dashboard</span>
        </Link>
        <Link
          to="/clients"
          className="sd-side-row"
          data-active={currentPath.startsWith("/clients")}
        >
          <Users size={15} />
          <span className="label">Clients</span>
        </Link>
        <Link
          to="/invoices"
          className="sd-side-row"
          data-active={currentPath.startsWith("/invoices")}
        >
          <Receipt size={15} />
          <span className="label">Invoices</span>
        </Link>
        <Link
          to="/time"
          className="sd-side-row"
          data-active={currentPath.startsWith("/time")}
        >
          <Clock size={15} />
          <span className="label">Time</span>
        </Link>
        <Link
          to="/docs"
          className="sd-side-row"
          data-active={currentPath.startsWith("/docs")}
        >
          <FileText size={15} />
          <span className="label">Standalone docs</span>
        </Link>

        <div className="sd-side-divider" />

        <div className="sd-side-section">PROJECTS</div>
        {projects.map((project) => {
          const isActive = currentPath.startsWith(`/projects/${project.id}`);
          const glyph = project.glyph || projectInitials(project.name);
          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="sd-side-row"
              data-active={isActive}
            >
              <span
                style={{
                  width: 16, height: 16, borderRadius: 3,
                  background: "#0e0e10", color: "#fff",
                  display: "inline-grid", placeItems: "center",
                  fontSize: 8, fontWeight: 700, flexShrink: 0,
                }}
              >
                {glyph.charAt(0)}
              </span>
              <span className="label">{project.name.split(/[·→]/).pop()?.trim() || project.name}</span>
            </Link>
          );
        })}
        {projects.length === 0 && (
          <p style={{ padding: "6px 10px", fontSize: 12, color: "var(--fg-faint)" }}>No projects yet</p>
        )}
        <button type="button" className="sd-side-row" onClick={onNewProject} style={{ marginTop: 2 }}>
          <Plus size={14} />
          <span className="label" style={{ color: "var(--fg-muted)" }}>New project</span>
        </button>

        <div className="sd-side-divider" />

        <Link
          to="/settings"
          className="sd-side-row"
          data-active={currentPath.startsWith("/settings")}
        >
          <Settings size={15} />
          <span className="label">Settings</span>
        </Link>
        <Link
          to="/trash"
          className="sd-side-row"
          data-active={currentPath.startsWith("/trash")}
        >
          <Trash2 size={15} />
          <span className="label">Trash</span>
        </Link>
      </div>
      <div className="sd-side-footer">
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0e0e10", flexShrink: 0 }} />
        <span>Local workspace</span>
      </div>
    </>
  );
}

function Breadcrumbs({
  projectName,
  projectGlyph,
  projectId,
  view,
  section,
}: {
  projectName?: string;
  projectGlyph?: string;
  projectId?: string;
  view?: string;
  section: string;
}) {
  const glyph = projectGlyph || (projectName ? projectInitials(projectName) : "");
  const viewLabel =
    view === "overview" ? "Overview"
    : view === "board" ? "Board"
    : view === "tasks" ? "Tasks"
    : view === "docs" ? "Docs"
    : view === "time" ? "Time"
    : view === "invoices" ? "Invoices"
    : view?.startsWith("doc:") ? "Doc"
    : view
    ? view.charAt(0).toUpperCase() + view.slice(1)
    : "";

  const sectionLabel: Record<string, string> = {
    home: "Dashboard",
    clients: "Clients",
    projects: "Projects",
    invoices: "Invoices",
    time: "Time",
    docs: "Docs",
    settings: "Settings",
    trash: "Trash",
  };

  return (
    <div className="sd-crumbs">
      <Link to="/" className="sd-crumb">
        <Home size={13} />
        <span>Workspace</span>
      </Link>
      <span className="sd-crumb-sep">
        <ChevronRight size={12} />
      </span>
      {projectId && projectName ? (
        <>
          <Link to={`/projects/${projectId}`} className="sd-crumb">
            <span className="sd-crumb-glyph">{glyph.charAt(0)}</span>
            <span>{projectName.split(/[·→]/).pop()?.trim() || projectName}</span>
          </Link>
          {viewLabel && (
            <>
              <span className="sd-crumb-sep">
                <ChevronRight size={12} />
              </span>
              <span className="sd-crumb active">
                <span>{viewLabel}</span>
              </span>
            </>
          )}
        </>
      ) : (
        <span className="sd-crumb active">
          <span>{sectionLabel[section] || section}</span>
        </span>
      )}
    </div>
  );
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const projects = useLiveQuery(() => projectRepository.listActive(), [], []);
  const clients = useLiveQuery(() => clientRepository.listActive(), [], []);

  const drawer = searchParams.get("drawer");
  const isNewProjectOpen = drawer === "new-project";

  // Derive current project from URL
  const projectMatch = location.pathname.match(/^\/projects\/([^/]+)(\/(.+))?$/);
  const currentProjectId = projectMatch?.[1];
  const currentView = currentProjectId
    ? projectMatch?.[3] || "overview"
    : undefined;

  const currentProject = useLiveQuery(
    () => (currentProjectId ? projectRepository.getById(currentProjectId) : Promise.resolve(undefined)),
    [currentProjectId],
    undefined
  );

  // Derive section for rail active state
  const section = currentProjectId
    ? "project"
    : location.pathname === "/"
    ? "home"
    : location.pathname.startsWith("/clients")
    ? "clients"
    : location.pathname.startsWith("/projects")
    ? "projects"
    : location.pathname.startsWith("/invoices")
    ? "invoices"
    : location.pathname.startsWith("/time")
    ? "time"
    : location.pathname.startsWith("/docs")
    ? "docs"
    : location.pathname.startsWith("/settings")
    ? "settings"
    : location.pathname.startsWith("/trash")
    ? "trash"
    : "home";

  function openNewProjectDrawer() {
    navigate(`${location.pathname}?drawer=new-project`);
  }

  function closeDrawer() {
    navigate(location.pathname);
  }

  const isProjectSection = Boolean(currentProjectId);

  return (
    <div className="sd-app">
      {/* Dark icon rail */}
      <nav className="sd-rail">
        <div className="sd-rail-logo">SD</div>

        <RailBtn to="/" icon={Home} label="Dashboard" active={section === "home"} />
        <RailBtn to="/projects" icon={Briefcase} label="Projects" active={section === "projects" || section === "project"} />
        <RailBtn to="/clients" icon={Users} label="Clients" active={section === "clients"} />
        <RailBtn to="/time" icon={Clock} label="Time" active={section === "time"} />
        <RailBtn to="/invoices" icon={Receipt} label="Invoices" active={section === "invoices"} />
        <RailBtn to="/docs" icon={FileText} label="Docs" active={section === "docs"} />

        <div className="sd-rail-spacer" />

        <RailBtn to="/settings" icon={Settings} label="Settings" active={section === "settings"} />
        <RailBtn to="/trash" icon={Trash2} label="Trash" active={section === "trash"} />

        <div style={{ height: 8 }} />
        <div className="sd-rail-avatar">R</div>
      </nav>

      {/* Secondary sidebar */}
      <aside className="sd-side">
        {isProjectSection && currentProject ? (
          <ProjectSidebar
            projectId={currentProjectId!}
            projectName={currentProject.name}
            projectGlyph={currentProject.glyph}
            currentView={currentView || "overview"}
          />
        ) : (
          <GlobalSidebar
            projects={projects ?? []}
            currentPath={location.pathname}
            onNewProject={openNewProjectDrawer}
          />
        )}
      </aside>

      {/* Main canvas */}
      <div className="sd-main">
        <header className="sd-topbar">
          <Breadcrumbs
            projectId={currentProjectId}
            projectName={currentProject?.name}
            projectGlyph={currentProject?.glyph}
            view={currentView}
            section={section}
          />
          <div className="sd-topbar-spacer" />
          {section === "clients" && (
            <Link to="/clients?drawer=new-client" className={cn("sd-btn")}>
              <Plus size={13} /> New client
            </Link>
          )}
          {(section === "projects") && (
            <button type="button" className="sd-btn" onClick={openNewProjectDrawer}>
              <Plus size={13} /> New project
            </button>
          )}
          {isProjectSection && currentView === "tasks" && (
            <Link to={`/projects/${currentProjectId}/tasks/new`} className="sd-btn">
              <Plus size={13} /> New task
            </Link>
          )}
        </header>

        <div className="sd-canvas">
          <Outlet />
        </div>
      </div>

      {/* New project drawer */}
      <Drawer
        open={isNewProjectOpen}
        title="New project"
        description="Projects are the primary workspace in SoloDesk."
        onClose={closeDrawer}
        footer={
          <>
            <button type="button" className="sd-btn ghost" onClick={closeDrawer}>Cancel</button>
            <button type="submit" form="new-project-form" className="sd-btn">
              <Plus size={13} /> Create project
            </button>
          </>
        }
      >
        <ProjectForm
          clients={clients ?? []}
          formId="new-project-form"
          submitLabel="Create project"
          onSubmit={async (values) => {
            const created = await projectRepository.create(values);
            closeDrawer();
            navigate(`/projects/${created.id}`);
          }}
        />
      </Drawer>
    </div>
  );
}
