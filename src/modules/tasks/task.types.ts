import type { Task } from "@/shared/types/domain";
import { EMPTY_EDITOR_JSON } from "@/shared/lib/editor-json";

export interface TaskFormValues {
  projectId: string;
  title: string;
  description: Task["description"];
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
  description: EMPTY_EDITOR_JSON,
  statusId: "",
  priority: undefined,
  dueDate: "",
  estimateMinutes: undefined,
  billable: true
};
