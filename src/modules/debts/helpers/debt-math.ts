import { DEBT_ENTRY_KINDS, type DebtEntryKind } from "@/lib/db/schema/debts";

export function isValidDebtKind(raw: unknown): raw is DebtEntryKind {
  return typeof raw === "string" && (DEBT_ENTRY_KINDS as readonly string[]).includes(raw);
}

export function validateContactName(raw: unknown): string | null {
  const name = String(raw ?? "").trim();
  if (name.length < 2) return null;
  return name.slice(0, 60);
}

export function normalizeOptionalText(raw: unknown, maxLen = 100): string | null {
  const text = String(raw ?? "").trim();
  return text ? text.slice(0, maxLen) : null;
}

export function parseDateInput(raw: unknown, fallbackToday = false): Date | null {
  const str = String(raw ?? "").trim();
  if (!str) return fallbackToday ? new Date() : null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? (fallbackToday ? new Date() : null) : parsed;
}
