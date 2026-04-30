import { Link, Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { cn } from "@/shared/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/" },
  { label: "Clients", to: "/clients" },
  { label: "Projects", to: "/projects" },
  { label: "Tasks", to: "/tasks" },
  { label: "Docs", to: "/docs" },
  { label: "Time", to: "/time" },
  { label: "Invoices", to: "/invoices" },
  { label: "Trash", to: "/trash" },
  { label: "Settings", to: "/settings" }
];

export function AppShell() {
  const location = useLocation();
  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(`${to}/`));

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 border-r bg-card md:flex md:flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight">SoloDesk</h1>
          <p className="text-sm text-muted-foreground">Local-first workspace</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive(item.to) && "bg-secondary text-secondary-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
          <p className="text-sm text-muted-foreground">SoloDesk</p>
          <ThemeToggle />
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b bg-background px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
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
    </div>
  );
}
