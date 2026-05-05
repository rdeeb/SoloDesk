export enum CurrencyCode {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  CAD = "CAD",
  AUD = "AUD",
  PAB = "PAB"
}

export const CURRENCY_OPTIONS = [
  CurrencyCode.USD,
  CurrencyCode.EUR,
  CurrencyCode.GBP,
  CurrencyCode.CAD,
  CurrencyCode.AUD,
  CurrencyCode.PAB
] as const;

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_OPTIONS.includes(value as CurrencyCode);
}

export function normalizeCurrency(value: string): CurrencyCode | undefined {
  const normalized = value.trim().toUpperCase();
  return isCurrencyCode(normalized) ? normalized : undefined;
}
