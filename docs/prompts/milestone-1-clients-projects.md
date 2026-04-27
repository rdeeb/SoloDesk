# Milestone 1 — Clients and Projects

Build Milestone 1 for SoloDesk.

## Goal

Implement clients and projects with soft delete support.

## Existing context

- SoloDesk is local-first.
- Dexie is the source of persisted truth.
- Redux Toolkit manages UI and async workflows.
- All deletes are soft deletes using `deletedAt`.

## Implement

1. Client list page.
2. Client create/edit form.
3. Client detail page.
4. Optional client fields: company name, contact person, email, phone, website, billing address, default hourly rate, currency, contract status, notes.
5. Project list page.
6. Project create/edit form.
7. Project detail page.
8. Project may optionally link to a client.
9. Project fields: name, description, status, hourly rate, budget amount, currency, start date, due date.
10. Soft delete clients and projects.
11. Hide soft-deleted clients/projects from normal pages.
12. Basic dashboard counts for active clients and active projects.

## Acceptance criteria

- Clients can be created, edited, viewed, and soft-deleted.
- Projects can be created, edited, viewed, and soft-deleted.
- A project can exist without a client.
- Soft-deleted records do not appear in normal lists.
- Dashboard counts update from local data.
