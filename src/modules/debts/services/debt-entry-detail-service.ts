import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { convertFromBase, getExchangeRates } from "@/lib/currency/exchange-service";
import { debtContacts, debtEntries } from "@/lib/db/schema";
import { getUserCurrency } from "@/modules/transactions/services/transaction-service";
import type { DebtEntryItem } from "../types";

export async function getDebtEntryDetail(
  contactId: string,
  entryId: string,
  userId: string
): Promise<{
  contactId: string;
  contactName: string;
  entry: DebtEntryItem;
  currency: string;
} | null> {
  const [currency, rates, contactRows, entryRows] = await Promise.all([
    getUserCurrency(userId),
    getExchangeRates(),
    db
      .select({ id: debtContacts.id, name: debtContacts.name })
      .from(debtContacts)
      .where(and(eq(debtContacts.id, contactId), eq(debtContacts.userId, userId)))
      .limit(1),
    db
      .select()
      .from(debtEntries)
      .where(
        and(
          eq(debtEntries.id, entryId),
          eq(debtEntries.contactId, contactId),
          eq(debtEntries.userId, userId)
        )
      )
      .limit(1),
  ]);

  const contact = contactRows[0];
  const row = entryRows[0];
  if (!contact || !row) return null;

  return {
    currency,
    contactId: contact.id,
    contactName: contact.name,
    entry: {
      id: row.id,
      contactId: row.contactId,
      kind: row.kind,
      amount: convertFromBase(Number(row.amount), currency, rates),
      note: row.note ?? null,
      occurredAt: row.occurredAt.toISOString(),
      dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    },
  };
}
