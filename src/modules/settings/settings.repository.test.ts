import { describe, expect, it } from "vitest";
import { db } from "@/db/db";
import { settingsRepository } from "@/modules/settings/settings.repository";
import { CurrencyCode } from "@/shared/types/currency";

describe("settingsRepository", () => {
  it("keeps setup incomplete when the local database is empty", async () => {
    await expect(settingsRepository.ensureSetupCompletedFromLocalData()).resolves.toBe(false);
    await expect(settingsRepository.get()).resolves.toBeUndefined();
  });

  it("repairs completed setup when workspace data exists without a settings row", async () => {
    const now = new Date().toISOString();
    await db.projects.add({
      id: "project-existing",
      name: "Existing Project",
      status: "active",
      currency: CurrencyCode.USD,
      createdAt: now,
      updatedAt: now
    });

    await expect(settingsRepository.ensureSetupCompletedFromLocalData()).resolves.toBe(true);

    const settings = await settingsRepository.get();
    expect(settings?.setupCompleted).toBe(true);
    expect(settings?.defaultCurrency).toBe(CurrencyCode.USD);
  });

  it("preserves existing setup preferences when marking recovered local data complete", async () => {
    await settingsRepository.save({
      workspaceName: "Recovered",
      defaultCurrency: CurrencyCode.PAB,
      defaultHourlyRate: 90,
      taxEnabled: true,
      defaultTaxName: "ITBMS",
      defaultTaxRate: 7,
      invoicePrefix: "SD",
      nextInvoiceNumber: 12,
      dateFormat: "yyyy-MM-dd",
      setupCompleted: false
    });

    const now = new Date().toISOString();
    await db.clients.add({
      id: "client-existing",
      name: "Existing Client",
      currency: CurrencyCode.PAB,
      createdAt: now,
      updatedAt: now
    });

    await expect(settingsRepository.ensureSetupCompletedFromLocalData()).resolves.toBe(true);

    const settings = await settingsRepository.get();
    expect(settings?.workspaceName).toBe("Recovered");
    expect(settings?.defaultCurrency).toBe(CurrencyCode.PAB);
    expect(settings?.defaultHourlyRate).toBe(90);
    expect(settings?.setupCompleted).toBe(true);
  });
});
