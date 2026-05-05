import type { Client } from "@/shared/types/domain";
import type { CurrencyCode } from "@/shared/types/currency";

export interface ClientFormValues {
  name: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  billingAddress: string;
  defaultHourlyRate?: number;
  currency: CurrencyCode | "";
  contractStatus?: Client["contractStatus"];
  notes: string;
}

export const CLIENT_FORM_DEFAULTS: ClientFormValues = {
  name: "",
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  website: "",
  billingAddress: "",
  defaultHourlyRate: undefined,
  currency: "",
  contractStatus: undefined,
  notes: ""
};
