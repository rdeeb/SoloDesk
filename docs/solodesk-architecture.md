# SoloDesk Architecture

## Architecture goal

SoloDesk must be a static, local-first React application that can run without a backend.

The architecture should make the app feel like a serious frontend product, not a throwaway CRUD demo.

## Stack

- Vite
- React
- TypeScript
- React Router
- Redux Toolkit
- React Redux
- Dexie
- dexie-react-hooks
- shadcn/ui
- Tailwind CSS
- dnd-kit
- Tiptap
- Zod
- date-fns

## Persistence model

Dexie/IndexedDB is the source of truth for persisted data.

Redux Toolkit manages:

- UI state
- Filters
- Current selections
- Modal state
- Async workflows
- Import/export workflow state
- Setup flow state

Avoid storing large duplicated persisted collections in Redux unless a feature clearly needs it.

Prefer Dexie live queries or repository calls for persisted records.

## Core rules

1. No backend in v1.
2. No auth in v1.
3. No cloud sync in v1.
4. No network persistence in v1.
5. All persistence goes through Dexie repositories.
6. All normal deletes are soft deletes.
7. Hard delete is only allowed in Trash flows.
8. Tasks require projects.
9. Time entries require projects.
10. Invoices require clients.
11. Projects may exist without clients.
12. Docs may be standalone or project-linked.
13. Import v1 is replace-only.
14. Dashboard and normal list pages must exclude soft-deleted records.
15. Trash pages must only show soft-deleted records.

## Suggested folder structure

```txt
src/
  app/
    App.tsx
    router.tsx
    store.ts
    providers.tsx

  db/
    db.ts
    schema.ts
    seed.ts
    migrations.ts

  modules/
    setup/
    dashboard/
    clients/
    projects/
    tasks/
    kanban/
    docs/
    editor/
    time/
    invoices/
    trash/
    settings/
    import-export/

  shared/
    components/
    layout/
    forms/
    hooks/
    utils/
    types/
```

## Module structure

Each module should prefer:

```txt
module-name/
  module.types.ts
  module.repository.ts
  module.slice.ts
  module.selectors.ts
  module.thunks.ts
  module.utils.ts
  components/
  pages/
```

A module does not need every file if it is simple.

## Routing

Planned routes:

```txt
/setup
/
/clients
/clients/:clientId
/projects
/projects/:projectId
/projects/:projectId/board
/projects/:projectId/tasks
/projects/:projectId/docs
/projects/:projectId/time
/projects/:projectId/invoices
/tasks
/docs
/docs/:docId
/time
/invoices
/invoices/:invoiceId
/trash
/settings
```

## Database tables

Initial tables:

- settings
- clients
- projects
- kanbanStatuses
- tasks
- docs
- timeEntries
- invoices
- invoiceLineItems

## Repository pattern

Each domain module should expose repository functions that hide Dexie details.

Example responsibilities:

- create
- update
- softDelete
- restore
- permanentlyDelete
- listActive
- listDeleted
- getById

## Soft delete pattern

Every main entity should include:

```ts
createdAt: string;
updatedAt: string;
deletedAt?: string;
```

Normal delete sets `deletedAt`.

Restore clears `deletedAt`.

Permanent delete removes the record from IndexedDB.

## Setup flow

If setup is incomplete, route users to `/setup`.

Setup completion should:

1. Save workspace settings.
2. Seed default Kanban statuses.
3. Mark setup as completed.
4. Navigate to dashboard.

## Theme

Dark mode is required from v1.

Use shadcn/ui conventions and Tailwind class-based dark mode.

## Editor architecture

Use Tiptap for the editor.

Store content as JSON.

Slash command implementation should avoid brittle dependencies. Implement using Tiptap suggestion mechanics or a custom controlled command menu.

## Import/export architecture

Use Zod schemas to validate imported backup files.

Import v1 replaces all current data.

Import flow:

1. Read JSON file.
2. Validate backup shape.
3. Show preview counts.
4. Require confirmation.
5. Clear existing tables.
6. Insert imported records.
7. Navigate to dashboard.

## Build/deployment

The app should remain compatible with static hosting.

Avoid runtime assumptions that require a server.

For GitHub Pages, future implementation should configure Vite `base` appropriately.
