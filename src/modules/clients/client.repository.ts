import { db } from "@/db/db";
import { createId } from "@/shared/lib/id";
import { textToEditorJson } from "@/shared/lib/editor-json";
import type { Client } from "@/shared/types/domain";
import type { ClientFormValues } from "@/modules/clients/client.types";

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export const clientRepository = {
  async listActive(): Promise<Client[]> {
    const rows = await db.clients.toCollection().filter((client) => !client.deletedAt).toArray();
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },

  async listDeleted(): Promise<Client[]> {
    return db.clients.toCollection().filter((client) => Boolean(client.deletedAt)).toArray();
  },

  async getById(id: string): Promise<Client | undefined> {
    return db.clients.get(id);
  },

  async create(values: ClientFormValues): Promise<Client> {
    const now = new Date().toISOString();
    const next: Client = {
      id: createId("client"),
      name: values.name.trim(),
      companyName: normalizeOptional(values.companyName),
      contactPerson: normalizeOptional(values.contactPerson),
      email: normalizeOptional(values.email),
      phone: normalizeOptional(values.phone),
      website: normalizeOptional(values.website),
      billingAddress: normalizeOptional(values.billingAddress),
      defaultHourlyRate: values.defaultHourlyRate,
      currency: normalizeOptional(values.currency),
      contractStatus: values.contractStatus,
      notes: textToEditorJson(values.notes),
      createdAt: now,
      updatedAt: now
    };

    await db.clients.add(next);
    return next;
  },

  async update(id: string, values: ClientFormValues): Promise<Client | undefined> {
    const existing = await db.clients.get(id);
    if (!existing) {
      return undefined;
    }

    const next: Client = {
      ...existing,
      name: values.name.trim(),
      companyName: normalizeOptional(values.companyName),
      contactPerson: normalizeOptional(values.contactPerson),
      email: normalizeOptional(values.email),
      phone: normalizeOptional(values.phone),
      website: normalizeOptional(values.website),
      billingAddress: normalizeOptional(values.billingAddress),
      defaultHourlyRate: values.defaultHourlyRate,
      currency: normalizeOptional(values.currency),
      contractStatus: values.contractStatus,
      notes: textToEditorJson(values.notes),
      updatedAt: new Date().toISOString()
    };

    await db.clients.put(next);
    return next;
  },

  async softDelete(id: string) {
    const now = new Date().toISOString();
    await db.clients.update(id, { deletedAt: now, updatedAt: now });
  }
};
