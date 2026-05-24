import type { Project } from "@/shared/types/domain";
import type { CurrencyCode } from "@/shared/types/currency";

export interface ProjectFormValues {
  clientId?: string;
  name: string;
  glyph?: string;
  description: string;
  status: Project["status"];
  hourlyRate?: number;
  budgetAmount?: number;
  currency: CurrencyCode | "";
  startDate: string;
  dueDate: string;
}

export const PROJECT_FORM_DEFAULTS: ProjectFormValues = {
  clientId: undefined,
  name: "",
  glyph: "",
  description: "",
  status: "active",
  hourlyRate: undefined,
  budgetAmount: undefined,
  currency: "",
  startDate: "",
  dueDate: ""
};
