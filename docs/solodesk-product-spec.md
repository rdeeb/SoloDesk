# SoloDesk Product Spec

## One-liner

SoloDesk is a local-first browser workspace for freelancers, solo builders, and consultants.

It combines lightweight CRM, project management, configurable Kanban, rich text docs, manual time tracking, and mini invoices while keeping all v1 data private in the browser.

## Target users

- Freelancers
- Solo consultants
- Indie builders
- Developers managing small client work
- Makers who want a lightweight private workspace without a backend

## Core promise

SoloDesk should feel like a clean SaaS dashboard mixed with a developer tool, but it should run entirely as a static app.

## Locked v1 decisions

- App name: SoloDesk
- Static SPA deployment
- No backend
- No login/authentication
- Browser-local persistence only
- Export/import JSON backup
- Import behavior: replace current data only
- First screen after setup: dashboard
- UI direction: clean SaaS + dev tool
- Component library: shadcn/ui
- Theme: light and dark mode
- Tasks require projects
- Projects may optionally belong to clients
- Docs may be standalone or project-linked
- Standalone docs are a flat list in v1
- Kanban columns are global across the workspace
- Delete behavior is trash/soft delete
- Invoices use auto-generated invoice numbers
- Invoice export is printable HTML/browser print-to-PDF in v1

## First-run setup

The app must require a first-run setup wizard before the dashboard is available.

Setup collects:

1. Workspace name
2. Default currency
3. Tax enabled yes/no
4. Tax label
5. Tax rate
6. Optional default hourly rate
7. Invoice prefix
8. Confirmation of default Kanban columns

After setup:

- Save workspace settings.
- Seed global Kanban columns.
- Navigate to dashboard.

## App sections

- Dashboard
- Clients
- Projects
- Tasks
- Docs
- Time
- Invoices
- Trash
- Settings

## Dashboard

The dashboard is the main command center.

It should show:

- Active clients
- Active projects
- Open tasks
- Overdue tasks
- Billable hours in selected date range
- Unbilled billable amount
- Draft invoices
- Unpaid invoices
- Recent docs

Dashboard filters:

- Client
- Project
- Date range
- Task status
- Billable only
- Invoice status

## Clients

Clients are optional containers for projects and invoices.

Required field:

- Name

Optional fields:

- Company name
- Contact person
- Email
- Phone
- Website
- Billing address
- Default hourly rate
- Currency
- Contract status
- Notes

Contract statuses:

- Lead
- Active
- Paused
- Completed
- Lost

## Projects

Projects are work containers.

A project may belong to a client, but client assignment is optional.

Project fields:

- Name
- Client
- Description
- Status
- Hourly rate
- Budget amount
- Currency
- Start date
- Due date

Project statuses:

- Active
- Paused
- Completed
- Archived

Project detail tabs:

- Overview
- Board
- Tasks
- Docs
- Time
- Invoices

## Tasks

Tasks must always belong to a project.

Task fields:

- Project
- Title
- Description
- Status/Kanban column
- Priority
- Due date
- Estimate
- Billable flag

Priorities:

- Low
- Medium
- High
- Urgent

## Kanban

Kanban columns are global across the workspace.

Default columns:

- Backlog
- To Do
- In Progress
- Blocked
- Review
- Done

Only Done should start as a done column.

Users can:

- Add columns
- Rename columns
- Reorder columns
- Mark columns as done
- Soft-delete columns
- Move tasks between columns

## Docs

Docs may be standalone or linked to a project.

Standalone docs use a flat list in v1.

Editor v1 should support:

- Paragraph
- Heading 1
- Heading 2
- Heading 3
- Bullet list
- Numbered list
- Quote
- Code block
- Divider
- Bold
- Italic
- Inline code

Slash commands:

- `/paragraph`
- `/h1`
- `/h2`
- `/h3`
- `/bullet`
- `/numbered`
- `/quote`
- `/code`
- `/divider`

## Time tracking

Time tracking is manual in v1.

Rules:

- Time entries require a project.
- Time entries may optionally link to a task.
- Users can enter duration as hours/minutes or decimal hours.
- Store duration internally as minutes.
- Support billable/non-billable entries.
- Store hourly rate snapshot on the entry.

## Mini invoices

Invoices require a client.

Invoices may optionally link to a project.

Invoice statuses:

- Draft
- Sent
- Paid
- Void

Invoice number v1 format:

```txt
INV-0001
INV-0002
INV-0003
```

Users can create invoices from:

- Manual line items
- Billable time entries
- Both

Invoices should use workspace tax defaults but allow override per invoice.

## Trash

Normal deletes set `deletedAt`.

Trash allows:

- Restore item
- Permanently delete item
- Empty trash

## Import/export

Export downloads a full JSON backup.

Import behavior v1:

- Validate JSON shape.
- Show preview counts.
- Warn current data will be replaced.
- Require explicit confirmation.
- Clear current tables.
- Insert imported data.

Merge import is out of scope for v1.

## Explicitly out of scope for v1

- Backend API
- Auth/login
- Cloud sync
- Collaboration
- File/image uploads
- Generated PDF library
- Payment links
- Per-project Kanban workflows
- Multiple workspaces
- Encryption
- Live timers
