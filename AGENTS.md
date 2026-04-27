# AGENTS.md — SoloDesk

This file defines how AI coding agents should work in this repository.

## Project identity

SoloDesk is a local-first static browser workspace for freelancers, solo builders, and consultants. It combines lightweight CRM, project management, configurable Kanban, rich text docs, manual time tracking, and mini invoices.

## Non-negotiable v1 constraints

- Do not add a backend.
- Do not add authentication.
- Do not add cloud sync.
- Do not send user data to external services.
- The app must remain deployable as a static SPA.
- IndexedDB through Dexie is the persistent source of truth.
- Redux Toolkit manages UI state, filters, selected records, and app workflows.
- shadcn/ui + Tailwind CSS are the UI foundation.
- All normal deletes must be soft deletes using `deletedAt`.
- Hard delete is only allowed from Trash flows.
- Tasks must always belong to a project.
- Time entries must always belong to a project.
- Invoices must always belong to a client.
- Import v1 is replace-only, not merge.

## Recommended workflow

1. Read `docs/solodesk-product-spec.md`.
2. Read `docs/solodesk-architecture.md`.
3. Read `docs/solodesk-data-model.md`.
4. Work from one milestone prompt at a time under `docs/prompts/`.
5. Keep changes small and module-scoped.
6. Avoid implementing future-scope features unless the current milestone explicitly asks for them.
7. Run typecheck/build before finishing implementation work.

## Implementation style

- Prefer TypeScript interfaces/types for domain models.
- Keep repositories responsible for Dexie persistence.
- Keep Redux slices focused on UI state and orchestration.
- Avoid duplicating large persisted collections in Redux unless there is a clear reason.
- Use selectors for derived UI state.
- Use Zod for import/export validation.
- Store durations in minutes.
- Store editor content as JSON.
- Store invoice totals as snapshots at invoice creation/update time.

## Folder direction

Use the planned structure from `docs/solodesk-architecture.md`.

Important top-level areas:

- `src/app`
- `src/db`
- `src/modules`
- `src/shared`

Each module should preferably contain:

- types
- repository
- slice
- selectors
- thunks/workflows when needed
- components
- pages

## Completion expectations

For every coding task, leave the repository in a coherent state. Do not partially wire routes, stores, or persistence without making that limitation explicit in the final response or PR notes.
