import "fake-indexeddb/auto";
import { afterEach } from "vitest";
import { db } from "@/db/db";

afterEach(async () => {
  await db.transaction(
    "rw",
    [
      db.settings,
      db.clients,
      db.projects,
      db.kanbanStatuses,
      db.tasks,
      db.docs,
      db.timeEntries,
      db.invoices,
      db.invoiceLineItems
    ],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.clients.clear(),
        db.projects.clear(),
        db.kanbanStatuses.clear(),
        db.tasks.clear(),
        db.docs.clear(),
        db.timeEntries.clear(),
        db.invoices.clear(),
        db.invoiceLineItems.clear()
      ]);
    }
  );
});
