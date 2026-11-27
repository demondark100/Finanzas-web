import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { convertFromBase, getExchangeRates } from "@/lib/currency/exchange-service";
import { transactions } from "@/lib/db/schema";
import { getUserCurrency } from "./transaction-service";
import type { TransactionItem } from "../types";

export async function getTransactionDetail(
  id: string,
  userId: string
): Promise<{ item: TransactionItem; currency: string } | null> {
  const [currency, rates, rows] = await Promise.all([
    getUserCurrency(userId),
    getExchangeRates(),
    db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1),
  ]);

  const row = rows[0];
  if (!row) return null;

  return {
    currency,
    item: {
      id: row.id,
      type: row.type,
      amount: convertFromBase(Number(row.amount), currency, rates),
      concept: row.concept,
      category: row.category ?? null,
      occurredAt: row.occurredAt.toISOString(),
    },
  };
}
