# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server at http://127.0.0.1:5173
npm run build        # tsc -b + vite build
npm run typecheck    # tsc --noEmit only
npm run test         # vitest run (all tests)
npx vitest run src/modules/tasks/task.repository.test.ts  # single test file
```

## Architecture

**Local-first static SPA.** No backend, no auth, no cloud sync. Data lives entirely in IndexedDB via Dexie. Must remain deployable as a static SPA (GitHub Pages).

**Persistence layer** (`src/db/`): `SoloDeskDB` extends Dexie. Schema in `schema.ts`. All domain types in `src/shared/types/domain.ts`. Repositories in each module own all Dexie reads/writes.

**State split**: Dexie = persisted truth. Redux Toolkit (`src/app/store.ts`) = UI state, filters, selections, and app workflows only. Never duplicate large persisted collections in Redux.

**Module structure** (`src/modules/<name>/`): each module should have `*.types.ts`, `*.repository.ts`, optionally `*.slice.ts` + selectors, `components/`, and `pages/`. Follow this pattern consistently.

**Routing** (`src/app/router.tsx`): React Router v7. `SetupRequiredRoute` gates all main routes behind `settings.setupCompleted`. Setup flow redirects once complete.

**UI**: shadcn/ui + Tailwind CSS. Rich text via Tiptap; editor content stored as `EditorJSON` (JSON object). Durations stored in minutes. Invoice totals stored as snapshots at creation/update time.

**Testing**: Vitest + jsdom + `fake-indexeddb`. `src/test/setup.ts` clears all Dexie tables after each test via a transaction. Tests hit a real (in-memory) IndexedDB — no mocks.

## Hard constraints (v1)

- All normal deletes are **soft deletes** via `deletedAt`. Hard delete only from Trash flows.
- Tasks must belong to a project. Time entries must belong to a project. Invoices must belong to a client.
- Import is replace-only, not merge. Use Zod for import/export validation.
- `@/` alias maps to `src/`.
- Vite base path is dynamic: `/<repo-name>/` on GitHub Actions, `/` locally.
