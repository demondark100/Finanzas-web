import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { convertFromBase, getExchangeRates } from "@/lib/currency/exchange-service";
import { debtContacts, debtEntries, debtNotificationStates } from "@/lib/db/schema";
import { getUserCurrency } from "@/modules/transactions/services/transaction-service";
import {
  classifyDueSeverity,
  computeDayDiff,
  isNotificationMuted,
  matchesActiveDirection,
  sortNotifications,
} from "../helpers/due-evaluator";
import type { DebtNotificationItem, NotificationsSummary } from "../types";

/** Obtiene alertas activas de cobros (LENT) y pagos (BORROWED) próximos o vencidos. */
export async function getDueNotifications(userId: string): Promise<NotificationsSummary> {
  const [currency, rates, candidates, balances, states] = await Promise.all([
    getUserCurrency(userId),
    getExchangeRates(),
    db
      .select({
        entryId: debtEntries.id,
        contactId: debtEntries.contactId,
        contactName: debtContacts.name,
        contactPhone: debtContacts.phone,
        kind: debtEntries.kind,
        amount: debtEntries.amount,
        note: debtEntries.note,
        dueDate: debtEntries.dueDate,
      })
      .from(debtEntries)
      .innerJoin(debtContacts, eq(debtEntries.contactId, debtContacts.id))
      .where(
        and(
          eq(debtEntries.userId, userId),
          isNotNull(debtEntries.dueDate),
          inArray(debtEntries.kind, ["LENT", "BORROWED"])
        )
      ),
    db
      .select({
        contactId: debtEntries.contactId,
        netBalance: sql<string>`COALESCE(SUM(CASE WHEN ${debtEntries.kind} IN ('LENT', 'REPAYMENT_PAID') THEN ${debtEntries.amount} ELSE -${debtEntries.amount} END), 0)`,
      })
      .from(debtEntries)
      .where(eq(debtEntries.userId, userId))
      .groupBy(debtEntries.contactId),
    db
      .select()
      .from(debtNotificationStates)
      .where(eq(debtNotificationStates.userId, userId)),
  ]);

  const balanceMap = new Map(balances.map((b) => [b.contactId, Number(b.netBalance ?? 0)]));
  const stateMap = new Map(states.map((s) => [s.entryId, s]));
  const now = new Date();
  const items: DebtNotificationItem[] = [];

  for (const row of candidates) {
    if (!row.dueDate) continue;
    const rawNet = balanceMap.get(row.contactId) ?? 0;
    const direction = matchesActiveDirection(row.kind, rawNet);
    if (!direction) continue;

    const daysDiff = computeDayDiff(row.dueDate, now);
    const severity = classifyDueSeverity(daysDiff);
    if (!severity) continue;

    if (isNotificationMuted(stateMap.get(row.entryId), row.dueDate, now)) continue;

    items.push({
      entryId: row.entryId,
      contactId: row.contactId,
      contactName: row.contactName,
      contactPhone: row.contactPhone ?? null,
      direction,
      severity,
      daysDiff,
      entryAmount: convertFromBase(Number(row.amount), currency, rates),
      contactNetBalance: Math.abs(convertFromBase(rawNet, currency, rates)),
      dueDate: row.dueDate.toISOString(),
      note: row.note ?? null,
    });
  }

  const sorted = sortNotifications(items);
  const urgentCount = sorted.filter((i) => i.severity !== "upcoming").length;

  return { items: sorted, currency, totalCount: sorted.length, urgentCount };
}
