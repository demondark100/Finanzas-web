import { and, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { convertFromBase, getExchangeRates } from "@/lib/currency/exchange-service";
import { transactions, type Transaction } from "@/lib/db/schema";
import { getLoanTimelineItems } from "./debt-cashflow-service";
import { getUserCurrency } from "./transaction-service";
import type {
  MovementDateRangeInput,
  MovementPeriod,
  MovementsHistoryData,
  TransactionItem,
  TransactionType,
} from "../types";

function mapRow(row: Transaction): TransactionItem {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    concept: row.concept,
    category: row.category ?? null,
    occurredAt: row.occurredAt.toISOString(),
  };
}

function parseIsoDay(value?: string, addDays = 0): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d + addDays, 0, 0, 0, 0);
}

function getPeriodRange(
  period: MovementPeriod,
  customRange?: MovementDateRangeInput
): { from?: Date; to?: Date } {
  const now = new Date();
  if (period === "this_month") {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1) };
  }
  if (period === "last_month") {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }
  if (period === "custom" && customRange?.from && customRange?.to) {
    return {
      from: parseIsoDay(customRange.from, 0),
      to: parseIsoDay(customRange.to, 1),
    };
  }
  return {};
}

export async function getMovementsHistory(
  userId: string,
  period: MovementPeriod = "this_month",
  customRange?: MovementDateRangeInput,
  includeLoans = false
): Promise<MovementsHistoryData> {
  const { from, to } = getPeriodRange(period, customRange);
  const conditions = [eq(transactions.userId, userId)];
  if (from) conditions.push(gte(transactions.occurredAt, from));
  if (to) conditions.push(lt(transactions.occurredAt, to));

  const [currency, rates, rows] = await Promise.all([
    getUserCurrency(userId),
    getExchangeRates(),
    db.select().from(transactions).where(and(...conditions))
      .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt)).limit(300),
  ]);

  let items = rows.map((r) => {
    const item = mapRow(r);
    return { ...item, amount: convertFromBase(item.amount, currency, rates) };
  });

  if (includeLoans) {
    const loanItems = await getLoanTimelineItems(userId, { from, to }, currency, rates);
    items = [...items, ...loanItems].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  return { currency, period, customRange, items };
}

export async function updateTransactionById(input: {
  id: string;
  userId: string;
  type: TransactionType;
  amount: string;
  concept: string;
  category?: string | null;
}): Promise<TransactionItem | null> {
  const [updated] = await db
    .update(transactions)
    .set({
      type: input.type,
      amount: input.amount,
      concept: input.concept,
      category: input.category ?? null,
    })
    .where(and(eq(transactions.id, input.id), eq(transactions.userId, input.userId)))
    .returning();

  return updated ? mapRow(updated) : null;
}

export async function deleteTransactionById(id: string, userId: string): Promise<boolean> {
  const deleted = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning({ id: transactions.id });

  return deleted.length > 0;
}
