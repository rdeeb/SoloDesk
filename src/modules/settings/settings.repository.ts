import { db } from "@/db/db";
import type { WorkspaceSettings } from "@/shared/types/domain";

const SETTINGS_ID = "workspace";

export const settingsRepository = {
  async get(): Promise<WorkspaceSettings | undefined> {
    return db.settings.get(SETTINGS_ID);
  },

  async save(input: Omit<WorkspaceSettings, "id" | "createdAt" | "updatedAt">): Promise<WorkspaceSettings> {
    const existing = await db.settings.get(SETTINGS_ID);
    const now = new Date().toISOString();

    const next: WorkspaceSettings = {
      id: SETTINGS_ID,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...input
    };

    await db.settings.put(next);
    return next;
  },

  async isSetupCompleted(): Promise<boolean> {
    const settings = await this.get();
    return Boolean(settings?.setupCompleted);
  }
};
