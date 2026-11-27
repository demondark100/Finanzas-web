import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { convertFromBase, type ExchangeRates } from "@/lib/currency/exchange-service";
import { debtContacts, debtEntries, type DebtEntryKind } from "@/lib/db/schema";
import type { TransactionItem, TransactionType } from "../types";

export async function getDebtCashflowSummary(userId: string): Promise<{
  cashImpact: number;
  pendingReceivable: number;
  pendingPayable: number;
}> {
  const rows = await db
    .select({
      net: sql<string>`COALESCE(SUM(CASE WHEN ${debtEntries.kind} IN ('LENT', 'REPAYMENT_PAID') THEN ${debtEntries.amount} ELSE -${debtEntries.amount} END), 0)`,
    })
    .from(debtEntries)
    .where(eq(debtEntries.userId, userId))
    .groupBy(debtEntries.contactId);

  let pendingReceivable = 0;
  let pendingPayable = 0;
  let totalNet = 0;

  for (const r of rows) {
    const net = Number(r.net ?? 0);
    totalNet += net;
    if (net > 0) pendingReceivable += net;
    else if (net < 0) pendingPayable += Math.abs(net);
  }

  return {
    cashImpact: Number((-totalNet).toFixed(2)),
    pendingReceivable: Number(pendingReceivable.toFixed(2)),
    pendingPayable: Number(pendingPayable.toFixed(2)),
  };
}

function buildLoanLabel(kind: DebtEntryKind, name: string, note: string | null): string {
  const base =
    kind === "LENT"
      ? `Préstamo a ${name}`
      : kind === "REPAYMENT_RECEIVED"
        ? `Abono de ${name}`
        : kind === "BORROWED"
          ? `Préstamo de ${name}`
          : `Abono a ${name}`;
  return note ? `${base} · ${note}` : base;
}

export async function getLoanTimelineItems(
  userId: string,
  range: { from?: Date; to?: Date },
  currency: string,
  rates: ExchangeRates
): Promise<TransactionItem[]> {
  const conditions = [eq(debtEntries.userId, userId)];
  if (range.from) conditions.push(gte(debtEntries.occurredAt, range.from));
  if (range.to) conditions.push(lt(debtEntries.occurredAt, range.to));

  const rows = await db
    .select({
      id: debtEntries.id,
      contactId: debtEntries.contactId,
      contactName: debtContacts.name,
      kind: debtEntries.kind,
      amount: debtEntries.amount,
      note: debtEntries.note,
      occurredAt: debtEntries.occurredAt,
    })
    .from(debtEntries)
    .leftJoin(debtContacts, eq(debtEntries.contactId, debtContacts.id))
    .where(and(...conditions))
    .orderBy(desc(debtEntries.occurredAt), desc(debtEntries.createdAt))
    .limit(150);

  return rows.map((r) => {
    const type: TransactionType =
      r.kind === "REPAYMENT_RECEIVED" || r.kind === "BORROWED" ? "INCOME" : "EXPENSE";
    return {
      id: r.id,
      type,
      amount: convertFromBase(Number(r.amount), currency, rates),
      concept: buildLoanLabel(r.kind, r.contactName || "Contacto", r.note),
      category: null,
      occurredAt: r.occurredAt.toISOString(),
      href: `/deudas/${r.contactId}/${r.id}`,
      isLoan: true,
    };
  });
}
