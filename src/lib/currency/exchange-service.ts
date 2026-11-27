export type SupportedCurrencyCode = "PEN" | "USD" | "EUR";

export interface ExchangeRates {
  PEN: number;
  USD: number;
  EUR: number;
  updatedAt?: string;
}

const FALLBACK_RATES: ExchangeRates = {
  PEN: 1,
  USD: 0.27,
  EUR: 0.25,
};

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/PEN", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const usd = Number(data?.rates?.USD);
      const eur = Number(data?.rates?.EUR);
      if (usd > 0 && eur > 0) {
        return { PEN: 1, USD: usd, EUR: eur, updatedAt: data?.time_last_update_utc };
      }
    }
  } catch {
    // Fallback to secondary provider
  }

  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/pen.json",
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const usd = Number(data?.pen?.usd);
      const eur = Number(data?.pen?.eur);
      if (usd > 0 && eur > 0) {
        return { PEN: 1, USD: usd, EUR: eur };
      }
    }
  } catch {
    // Use conservative static fallback
  }

  return FALLBACK_RATES;
}

function getRateFor(currency: string, rates: ExchangeRates): number {
  if (currency === "USD" && rates.USD > 0) return rates.USD;
  if (currency === "EUR" && rates.EUR > 0) return rates.EUR;
  return 1;
}

export function convertFromBase(
  amountPen: number,
  currency: string,
  rates: ExchangeRates
): number {
  if (currency === "PEN") return Number(amountPen.toFixed(2));
  return Number((amountPen * getRateFor(currency, rates)).toFixed(2));
}

export function convertToBaseFormatted(
  amountInUserCurrency: number,
  currency: string,
  rates: ExchangeRates
): string {
  if (currency === "PEN") return amountInUserCurrency.toFixed(2);
  const rate = getRateFor(currency, rates);
  return Math.max(0.01, amountInUserCurrency / rate).toFixed(2);
}
