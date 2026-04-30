import type { TimeEntry } from "@/shared/types/domain";

export interface TimeEntryCreateValues {
  projectId: string;
  taskId?: string;
  description: string;
  entryDate: string;
  durationMinutes: number;
  billable: boolean;
}

export interface TimeEntryFormValues {
  projectId: string;
  taskId?: string;
  description: string;
  entryDate: string;
  inputMode: "hoursMinutes" | "decimal";
  hours: number;
  minutes: number;
  decimalHours: number;
  billable: boolean;
}

export interface BillableSummary {
  billableMinutes: number;
  billableAmount: number;
}

export interface ClientTimeSummary extends BillableSummary {
  clientId: string;
  clientName: string;
}

export const TIME_FORM_DEFAULTS: TimeEntryFormValues = {
  projectId: "",
  taskId: undefined,
  description: "",
  entryDate: new Date().toISOString().slice(0, 10),
  inputMode: "hoursMinutes",
  hours: 0,
  minutes: 30,
  decimalHours: 0.5,
  billable: true
};

export function toTimeEntryFormValues(entry: TimeEntry): TimeEntryFormValues {
  const hours = Math.floor(entry.durationMinutes / 60);
  const minutes = entry.durationMinutes % 60;
  return {
    projectId: entry.projectId,
    taskId: entry.taskId,
    description: entry.description ?? "",
    entryDate: entry.entryDate,
    inputMode: "hoursMinutes",
    hours,
    minutes,
    decimalHours: Number((entry.durationMinutes / 60).toFixed(2)),
    billable: entry.billable
  };
}
