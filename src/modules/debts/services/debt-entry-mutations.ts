import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { debtEntries } from "@/lib/db/schema";
import type { DebtEntryKind } from "../types";

export async function updateDebtEntryById(input: {
  id: string;
  userId: string;
  kind: DebtEntryKind;
  amount: string;
  note: string | null;
  occurredAt: Date;
  dueDate: Date | null;
}): Promise<string | null> {
  const [updated] = await db
    .update(debtEntries)
    .set({
      kind: input.kind,
      amount: input.amount,
      note: input.note,
      occurredAt: input.occurredAt,
      dueDate: input.dueDate,
    })
    .where(and(eq(debtEntries.id, input.id), eq(debtEntries.userId, input.userId)))
    .returning({ contactId: debtEntries.contactId });

  return updated?.contactId ?? null;
}

export async function deleteDebtEntryById(
  id: string,
  userId: string
): Promise<string | null> {
  const [deleted] = await db
    .delete(debtEntries)
    .where(and(eq(debtEntries.id, id), eq(debtEntries.userId, userId)))
    .returning({ contactId: debtEntries.contactId });

  return deleted?.contactId ?? null;
}
