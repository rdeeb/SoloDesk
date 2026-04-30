# SoloDesk

SoloDesk is a local-first browser workspace for freelancers, solo builders, and consultants.

It combines lightweight CRM, project management, configurable Kanban, rich text docs, manual time tracking, and mini invoices while keeping all v1 data private in the browser.

## Product direction

- Static SPA deployable to GitHub Pages or similar hosting.
- No backend in v1.
- IndexedDB through Dexie is the persistent source of truth.
- Redux Toolkit manages app workflows, filters, and UI state.
- shadcn/ui and Tailwind CSS drive the interface.
- Tiptap powers rich text editing and slash commands.

## Core modules

- Dashboard
- Clients
- Projects
- Tasks
- Global Kanban
- Docs
- Time tracking
- Mini invoices
- Trash
- Settings
- Import/export

## Documentation

Start here:

- [Product Spec](docs/solodesk-product-spec.md)
- [Architecture](docs/solodesk-architecture.md)
- [Data Model](docs/solodesk-data-model.md)
- [Milestones](docs/solodesk-milestones.md)
- [Codex Prompt Pack](docs/prompts/README.md)

## Run locally

1. Install dependencies:
`npm install`
2. Start dev server:
`npm run dev`
3. Open:
`http://127.0.0.1:5173`

## Current status

Milestones 0-6 are implemented:
- Foundation and setup flow
- Clients and projects
- Tasks and global Kanban
- Docs with Tiptap editor and slash commands
- Manual time tracking
- Mini invoices
- Import/export backup, trash restore/permanent delete, and UI polish
