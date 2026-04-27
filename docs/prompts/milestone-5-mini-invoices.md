# Milestone 5 — Mini Invoices

Build Milestone 5 for SoloDesk.

## Goal

Implement mini invoices with auto-generated invoice numbers.

## Implement

1. Invoice model and repository.
2. Invoice line item model and repository.
3. Global invoices page.
4. Project invoices page.
5. Client invoices section.
6. Create invoice form.
7. Auto-generate invoice numbers using settings `invoicePrefix` and `nextInvoiceNumber`.
8. Create invoice from billable time entries.
9. Add manual line items.
10. Apply default workspace tax settings.
11. Allow overriding currency and tax per invoice.
12. Calculate subtotal, tax total, discount total, and total.
13. Invoice statuses: draft, sent, paid, void.
14. Printable invoice preview page.

## Acceptance criteria

- Invoice number is generated automatically.
- Invoice number increments after creation.
- Invoices require a client.
- Invoice may optionally link to a project.
- Time entries can become invoice line items.
- Printable invoice preview works using browser print.
