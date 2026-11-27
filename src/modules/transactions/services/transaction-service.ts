import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { convertFromBase, getExchangeRates } from "@/lib/currency/exchange-service";
import { transactions, users, type Transaction } from "@/lib/db/schema";
import { getDebtCashflowSummary } from "./debt-cashflow-service";
import type {
  BalanceSummary,
  DashboardTransactionsData,
  TransactionItem,
  TransactionType,
} from "../types";

function mapRowToItem(row: Transaction): TransactionItem {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    concept: row.concept,
    category: row.category ?? null,
    occurredAt: row.occurredAt.toISOString(),
  };
}

export async function getUserCurrency(userId: string): Promise<string> {
  const [row] = await db
    .select({ preferredCurrency: users.preferredCurrency })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.preferredCurrency || "PEN";
}

export async function getBalanceSummary(userId: string): Promise<BalanceSummary> {
  const now = new Date();
  const monthStartIso = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

  const [totals] = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'INCOME' THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'EXPENSE' THEN ${transactions.amount} ELSE 0 END), 0)`,
      monthlyIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'INCOME' AND ${transactions.occurredAt} >= ${monthStartIso}::timestamptz THEN ${transactions.amount} ELSE 0 END), 0)`,
      monthlyExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'EXPENSE' AND ${transactions.occurredAt} >= ${monthStartIso}::timestamptz THEN ${transactions.amount} ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId));

  const totalIncome = Number(totals?.totalIncome ?? 0);
  const totalExpense = Number(totals?.totalExpense ?? 0);

  return {
    availableBalance: Number((totalIncome - totalExpense).toFixed(2)),
    monthlyIncome: Number(Number(totals?.monthlyIncome ?? 0).toFixed(2)),
    monthlyExpense: Number(Number(totals?.monthlyExpense ?? 0).toFixed(2)),
  };
}

export async function getRecentTransactions(
  userId: string,
  limit = 5
): Promise<TransactionItem[]> {
  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
    .limit(limit);

  return rows.map(mapRowToItem);
}

export async function createTransaction(input: {
  userId: string;
  type: TransactionType;
  amount: string;
  concept: string;
  category?: string | null;
  occurredAt?: Date;
}): Promise<TransactionItem> {
  const [inserted] = await db
    .insert(transactions)
    .values({
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      concept: input.concept,
      category: input.category ?? null,
      ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
    })
    .returning();

  return mapRowToItem(inserted);
}

export async function getDashboardTransactions(userId: string): Promise<DashboardTransactionsData> {
  const [currency, rates, summary, debt, recentTransactions] = await Promise.all([
    getUserCurrency(userId), getExchangeRates(), getBalanceSummary(userId),
    getDebtCashflowSummary(userId), getRecentTransactions(userId, 5),
  ]);
  const realAvailable = summary.availableBalance + debt.cashImpact;
  const netWorth = realAvailable + debt.pendingReceivable - debt.pendingPayable;

  return {
    currency,
    summary: {
      availableBalance: convertFromBase(realAvailable, currency, rates),
      monthlyIncome: convertFromBase(summary.monthlyIncome, currency, rates),
      monthlyExpense: convertFromBase(summary.monthlyExpense, currency, rates),
      pendingReceivable: convertFromBase(debt.pendingReceivable, currency, rates),
      pendingPayable: convertFromBase(debt.pendingPayable, currency, rates),
      netWorth: convertFromBase(netWorth, currency, rates),
    },
    recentTransactions: recentTransactions.map((i) => ({ ...i, amount: convertFromBase(i.amount, currency, rates) })),
  };
}
