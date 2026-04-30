export type TrashEntityType =
  | "client"
  | "project"
  | "kanbanStatus"
  | "task"
  | "doc"
  | "timeEntry"
  | "invoice"
  | "invoiceLineItem";

export interface TrashItem {
  id: string;
  entityType: TrashEntityType;
  label: string;
  deletedAt: string;
}
