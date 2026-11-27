import type { TransactionType } from "@/lib/db/schema/transactions";

export type { TransactionType };

export type MovementPeriod = "this_month" | "last_month" | "all" | "custom";
export type MovementTypeFilter = "ALL" | TransactionType;

export interface MovementDateRangeInput {
  from?: string;
  to?: string;
}

export interface TransactionItem {
  id: string;
  type: TransactionType;
  amount: number;
  concept: string;
  category: string | null;
  occurredAt: string;
  href?: string;
  isLoan?: boolean;
}

export interface BalanceSummary {
  availableBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  pendingReceivable?: number;
  pendingPayable?: number;
  netWorth?: number;
}

export interface DashboardTransactionsData {
  summary: BalanceSummary;
  recentTransactions: TransactionItem[];
  currency: string;
}

export interface MovementsHistoryData {
  items: TransactionItem[];
  currency: string;
  period: MovementPeriod;
  customRange?: MovementDateRangeInput;
}

export interface TransactionActionResult {
  success: boolean;
  error?: string;
  transaction?: TransactionItem;
}
