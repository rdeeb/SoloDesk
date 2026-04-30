import { describe, expect, it } from "vitest";
import { db } from "@/db/db";
import { backupService } from "@/modules/import-export/backup.service";

describe("backupService", () => {
  it("rejects invalid backup JSON shape", () => {
    expect(() => backupService.parseBackupJson('{"foo":"bar"}')).toThrow();
  });

  it("replaces current data from valid backup", async () => {
    await db.clients.add({
      id: "client-old",
      name: "Old Client",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });

    const backup = backupService.parseBackupJson(
      JSON.stringify({
        appName: "SoloDesk",
        schemaVersion: 1,
        exportedAt: "2026-04-28T00:00:00.000Z",
        data: {
          settings: [],
          clients: [
            {
              id: "client-new",
              name: "New Client",
              createdAt: "2026-04-28T00:00:00.000Z",
              updatedAt: "2026-04-28T00:00:00.000Z"
            }
          ],
          projects: [],
          kanbanStatuses: [],
          tasks: [],
          docs: [],
          timeEntries: [],
          invoices: [],
          invoiceLineItems: []
        }
      })
    );

    await backupService.replaceAllData(backup);

    const clients = await db.clients.toArray();
    expect(clients).toHaveLength(1);
    expect(clients[0]?.id).toBe("client-new");
  });
});
