# SoloDesk Milestones

## Milestone 0 — Foundation

Goal: create the project foundation, app shell, Redux Toolkit store, Dexie database setup, first-run setup wizard, theme support, and default Kanban seed.

Deliverables:

- Vite + React + TypeScript
- React Router
- Redux Toolkit + React Redux
- Dexie + dexie-react-hooks
- shadcn/ui + Tailwind CSS
- Light/dark mode support
- App shell and sidebar placeholder
- Workspace settings model/table
- First-run setup wizard
- Default Kanban seed
- Dashboard placeholder

## Milestone 1 — Clients and Projects

Goal: implement clients and projects with soft delete support.

Deliverables:

- Client list page
- Client create/edit form
- Client detail page
- Optional CRM fields
- Project list page
- Project create/edit form
- Project detail page
- Optional client relationship for projects
- Soft delete support
- Dashboard counts for active clients and projects

## Milestone 2 — Tasks and Global Kanban

Goal: implement project-required tasks and global configurable Kanban.

Deliverables:

- Task model/repository
- Task create/edit form
- Tasks require projectId
- Global task list
- Project task list
- Project board page
- Board columns from global Kanban statuses
- Drag tasks between columns using dnd-kit
- Kanban column management in settings
- Task filters

## Milestone 3 — Docs and Editor

Goal: implement standalone docs, project docs, and Tiptap editor with slash commands.

Deliverables:

- Docs list page
- Standalone docs flat list
- Project docs page/tab
- Doc editor page
- Tiptap editor
- Slash command menu
- Autosave title and content
- Recent docs
- Soft delete docs

## Milestone 4 — Time Tracking

Goal: implement manual time tracking.

Deliverables:

- Time entry model/repository
- Global time page
- Project time page
- Client time summary through projects
- Time entry form
- Project required
- Optional task link
- Duration parsing for hours/minutes and decimal hours
- Billable flag
- Hourly rate snapshot
- Dashboard billable summaries

## Milestone 5 — Mini Invoices

Goal: implement mini invoices with auto-generated invoice numbers.

Deliverables:

- Invoice model/repository
- Invoice line item model/repository
- Global invoices page
- Project invoices page
- Client invoices section
- Invoice create/edit form
- Auto-generated invoice numbers
- Invoices from billable time entries
- Manual line items
- Workspace tax defaults
- Per-invoice tax/currency override
- Invoice status flow
- Printable invoice preview

## Milestone 6 — Import/Export, Trash, and Polish

Goal: make the app safe, portable, and portfolio-ready.

Deliverables:

- Export JSON backup
- Import JSON backup
- Backup validation
- Import preview counts
- Replace-current-data import flow
- Trash page
- Restore soft-deleted records
- Permanently delete records
- Empty trash
- Dashboard filters
- Empty states
- Responsive polish
- README updates
