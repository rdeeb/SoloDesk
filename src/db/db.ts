import Dexie, { type Table } from "dexie";
import { DB_NAME, DB_SCHEMA_V1 } from "@/db/schema";
import type {
  Client,
  Doc,
  Invoice,
  InvoiceLineItem,
  KanbanStatus,
  Project,
  Task,
  TimeEntry,
  WorkspaceSettings
} from "@/shared/types/domain";

export class SoloDeskDB extends Dexie {
  settings!: Table<WorkspaceSettings, string>;
  clients!: Table<Client, string>;
  projects!: Table<Project, string>;
  kanbanStatuses!: Table<KanbanStatus, string>;
  tasks!: Table<Task, string>;
  docs!: Table<Doc, string>;
  timeEntries!: Table<TimeEntry, string>;
  invoices!: Table<Invoice, string>;
  invoiceLineItems!: Table<InvoiceLineItem, string>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores(DB_SCHEMA_V1);
  }
}

export const db = new SoloDeskDB();
