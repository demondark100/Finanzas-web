import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { convertFromBase, getExchangeRates } from "@/lib/currency/exchange-service";
import { debtContacts, debtEntries } from "@/lib/db/schema";
import { getUserCurrency } from "@/modules/transactions/services/transaction-service";
import type { DebtContactSummary, DebtsOverviewData } from "../types";

export async function getDebtsOverview(userId: string): Promise<DebtsOverviewData> {
  const [currency, rates, contacts, aggregates] = await Promise.all([
    getUserCurrency(userId),
    getExchangeRates(),
    db
      .select()
      .from(debtContacts)
      .where(eq(debtContacts.userId, userId))
      .orderBy(desc(debtContacts.updatedAt)),
    db
      .select({
        contactId: debtEntries.contactId,
        netBalance: sql<string>`COALESCE(SUM(CASE WHEN ${debtEntries.kind} IN ('LENT', 'REPAYMENT_PAID') THEN ${debtEntries.amount} ELSE -${debtEntries.amount} END), 0)`,
        entryCount: sql<number>`COUNT(*)::int`,
        nextDueDate: sql<string | null>`MIN(CASE WHEN ${debtEntries.dueDate} IS NOT NULL THEN ${debtEntries.dueDate}::text END)`,
      })
      .from(debtEntries)
      .where(eq(debtEntries.userId, userId))
      .groupBy(debtEntries.contactId),
  ]);

  const aggMap = new Map(aggregates.map((a) => [a.contactId, a]));
  let totalReceivable = 0;
  let totalPayable = 0;

  const summaries: DebtContactSummary[] = contacts.map((c) => {
    const agg = aggMap.get(c.id);
    const netBalance = convertFromBase(Number(agg?.netBalance ?? 0), currency, rates);
    if (netBalance > 0) totalReceivable += netBalance;
    if (netBalance < 0) totalPayable += Math.abs(netBalance);

    return {
      id: c.id,
      name: c.name,
      phone: c.phone ?? null,
      note: c.note ?? null,
      netBalance,
      entryCount: agg?.entryCount ?? 0,
      nextDueDate: agg?.nextDueDate ? new Date(agg.nextDueDate).toISOString() : null,
      updatedAt: c.updatedAt.toISOString(),
    };
  });

  return {
    currency,
    totalReceivable: Number(totalReceivable.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
    contacts: summaries,
  };
}

export async function createDebtContact(input: {
  userId: string;
  name: string;
  phone: string | null;
  note: string | null;
}): Promise<string> {
  const [created] = await db
    .insert(debtContacts)
    .values({
      userId: input.userId,
      name: input.name,
      phone: input.phone,
      note: input.note,
    })
    .returning({ id: debtContacts.id });
  return created.id;
}

export async function updateDebtContact(input: {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  note: string | null;
}): Promise<boolean> {
  const updated = await db
    .update(debtContacts)
    .set({ name: input.name, phone: input.phone, note: input.note, updatedAt: new Date() })
    .where(and(eq(debtContacts.id, input.id), eq(debtContacts.userId, input.userId)))
    .returning({ id: debtContacts.id });
  return updated.length > 0;
}

export async function deleteDebtContact(id: string, userId: string): Promise<boolean> {
  const deleted = await db
    .delete(debtContacts)
    .where(and(eq(debtContacts.id, id), eq(debtContacts.userId, userId)))
    .returning({ id: debtContacts.id });
  return deleted.length > 0;
}
