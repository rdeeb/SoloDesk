import type { Task } from "@/shared/types/domain";

export interface TaskFormValues {
  projectId: string;
  title: string;
  description: string;
  statusId: string;
  priority?: Task["priority"];
  dueDate: string;
  estimateMinutes?: number;
  billable: boolean;
}

export interface TaskFilters {
  projectId?: string;
  statusId?: string;
  priority?: Task["priority"];
  dueDate?: string;
}

export const TASK_FORM_DEFAULTS: TaskFormValues = {
  projectId: "",
  title: "",
  description: "",
  statusId: "",
  priority: undefined,
  dueDate: "",
  estimateMinutes: undefined,
  billable: true
};
