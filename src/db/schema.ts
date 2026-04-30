export const DB_NAME = "solodesk";

export const DB_SCHEMA_V1 = {
  settings: "id, setupCompleted, updatedAt",
  clients: "id, name, contractStatus, deletedAt, updatedAt",
  projects: "id, clientId, status, dueDate, deletedAt, updatedAt",
  kanbanStatuses: "id, order, isDone, deletedAt, updatedAt",
  tasks: "id, projectId, statusId, deletedAt, updatedAt",
  docs: "id, projectId, isStandalone, deletedAt, updatedAt",
  timeEntries: "id, projectId, taskId, entryDate, deletedAt, updatedAt",
  invoices: "id, clientId, projectId, status, invoiceNumber, deletedAt, updatedAt",
  invoiceLineItems: "id, invoiceId, sourceType, sourceId, deletedAt, updatedAt"
} as const;
