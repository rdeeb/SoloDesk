# Milestone 0 — Foundation

You are working on SoloDesk, a local-first static React app for freelancers and solo builders.

Build Milestone 0 only.

## Goal

Create the project foundation, app shell, Redux Toolkit store, Dexie database setup, first-run setup wizard, theme support, and default Kanban seed.

## Tech requirements

- Vite + React + TypeScript
- React Router
- Redux Toolkit + React Redux
- Dexie + dexie-react-hooks
- shadcn/ui + Tailwind CSS
- Light/dark mode support
- No backend
- No network persistence

## Implement

1. App routing.
2. Root layout with sidebar placeholder.
3. Redux store setup.
4. Dexie database with the initial tables.
5. Workspace settings model.
6. First-run setup wizard at `/setup`.
7. Redirect users to `/setup` if setup is incomplete.
8. Save setup settings to IndexedDB.
9. Seed global Kanban statuses after setup.
10. Dashboard placeholder at `/`.

## Acceptance criteria

- App runs locally.
- User sees setup wizard on first load.
- User can complete setup.
- Settings persist after refresh.
- Default Kanban columns are created once.
- After setup, user lands on dashboard.
- Dark mode can be toggled.
- No backend calls exist.
