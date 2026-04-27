# SoloDesk Data Model

## Common fields

Most persistent records should include:

```ts
createdAt: string;
updatedAt: string;
deletedAt?: string;
```

Use ISO strings for dates.

## Editor JSON

```ts
export type EditorJSON = Record<string, unknown>;
```

## WorkspaceSettings

```ts
export interface WorkspaceSettings {
  id: string;
  workspaceName: string;
  defaultCurrency: string;
  defaultHourlyRate?: number;
  taxEnabled: boolean;
  defaultTaxName?: string;
  defaultTaxRate?: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  dateFormat: string;
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Client

```ts
export interface Client {
  id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  billingAddress?: string;
  defaultHourlyRate?: number;
  currency?: string;
  contractStatus?: 'lead' | 'active' | 'paused' | 'completed' | 'lost';
  notes?: EditorJSON;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## Project

```ts
export interface Project {
  id: string;
  clientId?: string;
  name: string;
  description?: EditorJSON;
  status: 'active' | 'paused' | 'completed' | 'archived';
  hourlyRate?: number;
  budgetAmount?: number;
  currency?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## KanbanStatus

```ts
export interface KanbanStatus {
  id: string;
  name: string;
  order: number;
  color?: string;
  isDefault?: boolean;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## Task

```ts
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: EditorJSON;
  statusId: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimateMinutes?: number;
  billable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## Doc

```ts
export interface Doc {
  id: string;
  projectId?: string;
  title: string;
  content: EditorJSON;
  isStandalone: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## TimeEntry

```ts
export interface TimeEntry {
  id: string;
  projectId: string;
  taskId?: string;
  description?: string;
  entryDate: string;
  durationMinutes: number;
  billable: boolean;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## Invoice

```ts
export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'void';
  issueDate: string;
  dueDate?: string;
  currency: string;
  taxEnabled: boolean;
  taxName?: string;
  taxRate?: number;
  subtotal: number;
  taxTotal: number;
  discountTotal?: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## InvoiceLineItem

```ts
export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  sourceType?: 'manual' | 'timeEntry';
  sourceId?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## Backup export shape

```ts
export interface SoloDeskBackup {
  appName: 'SoloDesk';
  schemaVersion: 1;
  exportedAt: string;
  data: {
    settings: WorkspaceSettings[];
    clients: Client[];
    projects: Project[];
    kanbanStatuses: KanbanStatus[];
    tasks: Task[];
    docs: Doc[];
    timeEntries: TimeEntry[];
    invoices: Invoice[];
    invoiceLineItems: InvoiceLineItem[];
  };
}
```

## Duration rules

Store durations in minutes.

Examples:

- `2h 30m` = `150`
- `1.5` hours = `90`
- `0.25` hours = `15`

## Invoice number rules

Settings store:

```ts
invoicePrefix: string;
nextInvoiceNumber: number;
```

V1 invoice number format:

```txt
INV-0001
```

Generation rule:

```ts
`${invoicePrefix}-${String(nextInvoiceNumber).padStart(4, '0')}`
```

After successful invoice creation, increment `nextInvoiceNumber`.
