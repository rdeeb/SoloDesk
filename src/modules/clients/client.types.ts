import type { Client } from "@/shared/types/domain";

export interface ClientFormValues {
  name: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  billingAddress: string;
  defaultHourlyRate?: number;
  currency: string;
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
