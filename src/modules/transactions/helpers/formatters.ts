const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: "S/.",
  USD: "$",
  EUR: "€",
};

/**
 * Formatea un monto numérico con el símbolo de moneda del usuario.
 */
export function formatCurrency(amount: number, currency = "PEN"): string {
  const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.PEN;
  const isNegative = amount < 0;
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return isNegative ? `- ${symbol} ${formattedNumber}` : `${symbol} ${formattedNumber}`;
}

/**
 * Convierte una fecha ISO en una etiqueta cercana ("Hoy", "Ayer" o "26 nov").
 */
export function formatFriendlyDate(isoDate: string, locale = "es"): string {
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return locale === "en" ? "Today" : "Hoy";
  if (diffDays === 1) return locale === "en" ? "Yesterday" : "Ayer";

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
    day: "numeric",
    month: "short",
  }).format(target);
}

/**
 * Convierte Date a formato YYYY-MM-DD para URL searchParams.
 */
export function toIsoDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parsea YYYY-MM-DD a Date local o devuelve null si es inválido.
 */
export function parseIsoDateParam(raw?: string): Date | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, d] = raw.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formatea la hora local de una fecha ISO (ej. "10:45 a. m.").
 */
export function formatTimeLabel(isoDate: string, locale = "es"): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Agrupa movimientos por día calendario conservando su orden.
 */
export function groupTransactionsByDate<T extends { occurredAt: string }>(
  items: T[],
  locale = "es"
): { key: string; label: string; items: T[] }[] {
  const groups = new Map<string, { label: string; items: T[] }>();
  for (const item of items) {
    const d = new Date(item.occurredAt);
    const key = Number.isNaN(d.getTime()) ? "unknown" : toIsoDateParam(d);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, { label: formatFriendlyDate(item.occurredAt, locale), items: [item] });
    }
  }
  return Array.from(groups.entries()).map(([key, val]) => ({ key, ...val }));
}

/**
 * Formatea fecha completa legible (ej. "viernes, 27 de noviembre de 2026").
 */
export function formatFullDate(isoDate: string, locale = "es"): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
