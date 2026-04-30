export interface SetupFormValues {
  workspaceName: string;
  defaultCurrency: string;
  taxEnabled: boolean;
  defaultTaxName: string;
  defaultTaxRate?: number;
  defaultHourlyRate?: number;
  invoicePrefix: string;
  confirmDefaultKanbanColumns: boolean;
}
