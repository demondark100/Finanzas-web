import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { convertFromBase, getExchangeRates } from "@/lib/currency/exchange-service";
import { debtContacts, debtEntries, type DebtEntry } from "@/lib/db/schema";
import { getUserCurrency } from "@/modules/transactions/services/transaction-service";
import type { ContactDetailData, DebtEntryItem, DebtEntryKind } from "../types";

function mapEntry(row: DebtEntry): DebtEntryItem {
  return {
    id: row.id,
    contactId: row.contactId,
    kind: row.kind,
    amount: Number(row.amount),
    note: row.note ?? null,
    occurredAt: row.occurredAt.toISOString(),
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
  };
}

export async function getContactDetail(
  contactId: string,
  userId: string
): Promise<ContactDetailData | null> {
  const [contact] = await db
    .select()
    .from(debtContacts)
    .where(and(eq(debtContacts.id, contactId), eq(debtContacts.userId, userId)))
    .limit(1);

  if (!contact) return null;

  const [currency, rates, rows] = await Promise.all([
    getUserCurrency(userId),
    getExchangeRates(),
    db
      .select()
      .from(debtEntries)
      .where(and(eq(debtEntries.contactId, contactId), eq(debtEntries.userId, userId)))
      .orderBy(desc(debtEntries.occurredAt), desc(debtEntries.createdAt)),
  ]);

  const entries = rows.map((r) => {
    const item = mapEntry(r);
    return { ...item, amount: convertFromBase(item.amount, currency, rates) };
  });
  const netBalance = Number(
    entries.reduce((acc, e) => {
      const sign = e.kind === "LENT" || e.kind === "REPAYMENT_PAID" ? 1 : -1;
      return acc + sign * e.amount;
    }, 0).toFixed(2)
  );

  return {
    currency,
    entries,
    contact: {
      id: contact.id,
      name: contact.name,
      phone: contact.phone ?? null,
      note: contact.note ?? null,
      netBalance,
      entryCount: entries.length,
      nextDueDate: entries.find((e) => e.dueDate)?.dueDate ?? null,
      updatedAt: contact.updatedAt.toISOString(),
    },
  };
}

export async function createDebtEntry(input: {
  userId: string;
  contactId: string;
  kind: DebtEntryKind;
  amount: string;
  note: string | null;
  occurredAt: Date;
  dueDate: Date | null;
}): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [contact] = await tx
      .select({ id: debtContacts.id })
      .from(debtContacts)
      .where(and(eq(debtContacts.id, input.contactId), eq(debtContacts.userId, input.userId)))
      .limit(1);
    if (!contact) return false;

    await tx.insert(debtEntries).values({
      userId: input.userId,
      contactId: input.contactId,
      kind: input.kind,
      amount: input.amount,
      note: input.note,
      occurredAt: input.occurredAt,
      dueDate: input.dueDate,
    });
    await tx.update(debtContacts).set({ updatedAt: new Date() }).where(eq(debtContacts.id, input.contactId));
    return true;
  });
}
