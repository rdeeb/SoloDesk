import { db } from "@/db/db";
import { seedDefaultKanbanStatuses } from "@/db/seed";
import { settingsRepository } from "@/modules/settings/settings.repository";
import type { SetupFormValues } from "@/modules/settings/settings.types";
import { CurrencyCode, normalizeCurrency } from "@/shared/types/currency";

export async function completeSetup(values: SetupFormValues) {
  const taxName = values.taxEnabled ? values.defaultTaxName.trim() : undefined;
  const taxRate = values.taxEnabled ? values.defaultTaxRate : undefined;

  await db.transaction("rw", db.settings, db.kanbanStatuses, async () => {
    await settingsRepository.save({
      workspaceName: values.workspaceName.trim(),
      defaultCurrency: normalizeCurrency(values.defaultCurrency) ?? CurrencyCode.USD,
      defaultHourlyRate: values.defaultHourlyRate,
      taxEnabled: values.taxEnabled,
      defaultTaxName: taxName || undefined,
      defaultTaxRate: taxRate,
      invoicePrefix: values.invoicePrefix.trim().toUpperCase(),
      nextInvoiceNumber: 1,
      dateFormat: "yyyy-MM-dd",
      setupCompleted: true
    });

    if (values.confirmDefaultKanbanColumns) {
      await seedDefaultKanbanStatuses();
    }
  });
}
