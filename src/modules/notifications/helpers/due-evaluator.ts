import type { DebtEntryKind } from "@/lib/db/schema/debts";
import type { DebtNotificationState } from "@/lib/db/schema/notifications";
import type {
  DebtNotificationItem,
  NotificationDirection,
  NotificationSeverity,
} from "../types";

export const UPCOMING_WINDOW_DAYS = 3;
const MS_PER_DAY = 86_400_000;

function toUtcDayStamp(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Calcula la diferencia en días calendario entre `dueDate` y `now` (negativo = vencido). */
export function computeDayDiff(dueDate: Date, now: Date = new Date()): number {
  return Math.round((toUtcDayStamp(dueDate) - toUtcDayStamp(now)) / MS_PER_DAY);
}

/** Clasifica la urgencia del vencimiento o retorna null si aún está fuera de ventana. */
export function classifyDueSeverity(daysDiff: number): NotificationSeverity | null {
  if (daysDiff < 0) return "overdue";
  if (daysDiff === 0) return "due_today";
  if (daysDiff <= UPCOMING_WINDOW_DAYS) return "upcoming";
  return null;
}

/** Solo notifica préstamos cuando te deben (net > 0) o deudas cuando aún debes (net < 0). */
export function matchesActiveDirection(
  kind: DebtEntryKind,
  netBalance: number
): NotificationDirection | null {
  if (kind === "LENT" && netBalance > 0) return "receivable";
  if (kind === "BORROWED" && netBalance < 0) return "payable";
  return null;
}

/** Determina si la alerta fue descartada o pospuesta para la misma fecha límite. */
export function isNotificationMuted(
  state: DebtNotificationState | undefined,
  entryDueDate: Date,
  now: Date = new Date()
): boolean {
  if (!state) return false;
  if (state.dueDateSnapshot.getTime() !== entryDueDate.getTime()) return false;
  if (state.dismissedAt !== null) return true;
  if (state.snoozedUntil !== null && state.snoozedUntil.getTime() > now.getTime()) return true;
  return false;
}

/** Ordena alertas: primero más vencidas, luego hoy, luego próximas. */
export function sortNotifications(items: DebtNotificationItem[]): DebtNotificationItem[] {
  return [...items].sort((a, b) => a.daysDiff - b.daysDiff);
}
