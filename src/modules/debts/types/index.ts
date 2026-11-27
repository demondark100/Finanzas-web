import type { DebtEntryKind } from "@/lib/db/schema/debts";

export type { DebtEntryKind };

export type DebtContactFilter = "ALL" | "RECEIVABLE" | "PAYABLE" | "SETTLED";

export interface DebtContactSummary {
  id: string;
  name: string;
  phone: string | null;
  note: string | null;
  netBalance: number;
  entryCount: number;
  nextDueDate: string | null;
  updatedAt: string;
}

export interface DebtEntryItem {
  id: string;
  contactId: string;
  kind: DebtEntryKind;
  amount: number;
  note: string | null;
  occurredAt: string;
  dueDate: string | null;
}

export interface DebtsOverviewData {
  totalReceivable: number;
  totalPayable: number;
  contacts: DebtContactSummary[];
  currency: string;
}

export interface ContactDetailData {
  contact: DebtContactSummary;
  entries: DebtEntryItem[];
  currency: string;
}

export interface DebtActionResult {
  success: boolean;
  error?: string;
  contactId?: string;
}
