# Milestone 2 — Tasks and Global Kanban

Build Milestone 2 for SoloDesk.

## Goal

Implement project-required tasks and a global configurable Kanban board.

## Implement

1. Task model and repository.
2. Task create/edit form.
3. Tasks must require `projectId`.
4. Global task list page.
5. Project task list page.
6. Project board page.
7. Render columns from global Kanban statuses.
8. Drag tasks between columns using dnd-kit.
9. Add Kanban column management in settings.
10. Allow add, rename, reorder, soft-delete columns.
11. Allow marking a column as done.
12. Task filters by project, status, priority, due date.

## Acceptance criteria

- Users cannot create a task without a project.
- Tasks appear in the correct Kanban column.
- Dragging a task updates its `statusId`.
- Kanban columns are global across projects.
- Soft-deleted columns do not appear on boards.
- Done columns can be used to calculate completed tasks.
