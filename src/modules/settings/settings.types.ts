import type { CurrencyCode } from "@/shared/types/currency";

export interface SetupFormValues {
  workspaceName: string;
  defaultCurrency: CurrencyCode;
  taxEnabled: boolean;
  defaultTaxName: string;
  defaultTaxRate?: number;
  defaultHourlyRate?: number;
  invoicePrefix: string;
  confirmDefaultKanbanColumns: boolean;
}
